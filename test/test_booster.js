const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const chai = require("chai");
const BN = require('bn.js');

chai.use(solidity);
chai.use(require('chai-bn')(BN));
const { expect } = chai;

const { impersonateForToken, approve } = require("./helper");
const { usdt, husd } = require("../info/tokens");

const { FILDA, CAN, BOO, booPoolsAddr, booBankAddr } = require("../info/booster");

const BOOSTER_FILDA = "booster-filda";
const BOOSTER_CAN = "booster-can";

// contracts
let globalConfig;
let smartWalletImpl;
let smartWallet;
let smartWalletFactory;
let usdtContract;
let fildaContract;
let canContract;

async function deploySmartWallet() {
  console.log("Deploying SmartWallet Contracts");

  const GlobalConfig = await ethers.getContractFactory("GlobalConfig");
  globalConfig = await GlobalConfig.deploy();
  await globalConfig.deployed();

  const SmartWallet = await ethers.getContractFactory("SmartWallet");
  smartWalletImpl = await SmartWallet.deploy();
  await smartWalletImpl.deployed();

  const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
  smartWalletFactory = await SmartWalletFactory.deploy(smartWalletImpl.address);
  await smartWalletFactory.deployed();
}

async function deployBooster(source) {
  console.log("Deploying Booster Contracts");

  const BooConfig = await ethers.getContractFactory("BooConfig");
  const booConfig = await BooConfig.deploy(booBankAddr, booPoolsAddr, source);
  await booConfig.deployed();
  console.log("BooConfig address:" , booConfig.address);

  const BooStrategyFactory = await ethers.getContractFactory("BooStrategyFactory");
  const booStrategyFactory = await BooStrategyFactory.deploy(booConfig.address);
  await booStrategyFactory.deployed();
  console.log("StrategyFactory:", booStrategyFactory.address);

  await globalConfig.setStrategyFactory(source == "filda" ? BOOSTER_FILDA : BOOSTER_CAN, booStrategyFactory.address);
}

describe("Booster filda", function() {
  let deployer, user;
  let productName;

  before(async function() {
    [deployer, user] = await ethers.getSigners();

    usdtContract = await ethers.getContractAt("IERC20", usdt.address);
    fildaContract = await ethers.getContractAt("IERC20", FILDA);

    await deploySmartWallet();
    await deployBooster("filda");

    await Promise.all([usdt, husd].map(async (t) => {
      await impersonateForToken(t, user, "10000");
    }));

    productName = BOOSTER_FILDA;
  });

  beforeEach(async function() {
    const receipt = await smartWalletFactory.connect(user).newSmartWallet(globalConfig.address);
    const txReceipt = await receipt.wait();
    const event = txReceipt.events.filter((e) => e.event == "WalletCreated");
    smartWallet = await ethers.getContractAt("SmartWallet", event[0].args["wallet"]);

    await Promise.all([usdt, husd].map(async (t) => {
      await approve(t, user, smartWallet.address);
    }));
  });

  it("invest/withdraw to strategy via wallet", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // deposit to smart wallet
    await smartWallet.connect(user).depositErc20ToWallet(usdt.address, depositValue);
    console.log("Deposited to SmartWallet: ", depositValue.toString());

    // check getCashBalance
    expect(await smartWallet.getCashBalance(usdt.address)).to.equal(depositValue);

    // invest to boo from smart wallet
    await smartWallet.connect(user).investFromWallet(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Invested from wallet: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance Of: ", investBalance.toString());
    // expect(depositValue).to.equal(investBalance);

    // withdraw from boo to smart wallet
    await smartWallet.connect(user).withdrawToWallet(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const cashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Actual withdrawn balance: ", cashBalance.toString());

    // check withdrawn balance after slippage
    expect(investBalance.mul(99).div(100).toString()).to.be.bignumber.lessThan(cashBalance.toString());

    // check remaining balance at boo
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Boo: ", remainingBalance.toString());
    // expect(remainingBalance).to.equal(0);

    // withdraw from smart wallet
    const balanceBefore = await usdtContract.balanceOf(user.address);
    await smartWallet.connect(user).withdrawFromWallet(usdt.address, cashBalance);
    const balanceAfter = await usdtContract.balanceOf(user.address);
    console.log("Withdraw from SmartWallet: ", cashBalance.toString());
    console.log("Actual balance increase: ", balanceAfter.sub(balanceBefore).toString());

    const finalCashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Final SmartWallet Balance: ", finalCashBalance.toString());

    /* Claim rewards */
    const rewardsTokenAddress = await smartWallet.rewardsTokenAddress(productName);
    const rewardsTokenContract = await ethers.getContractAt("IERC20", rewardsTokenAddress);
    
    const rewardsBefore = await rewardsTokenContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewardsAfter = await rewardsTokenContract.balanceOf(user.address);
    console.log("Claimed rewards(BOO): ", rewardsAfter.sub(rewardsBefore).toString());

    const rewards2Before = await fildaContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewards2After = await fildaContract.balanceOf(user.address);
    console.log("Claimed rewards(filda): ", rewards2After.sub(rewards2Before).toString());
  });

  it("direct invest/withdraw to strategy", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // invest to boo directly
    await smartWallet.connect(user).directInvest(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Directly invested: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from boo to smart wallet
    const beforeWithdraw = await usdtContract.balanceOf(user.address);
    // the return value would be less than investBalance
    await smartWallet.connect(user).directWithdraw(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const afterWithdraw = await usdtContract.balanceOf(user.address);
    console.log("Actual withdrawn value: ", afterWithdraw - beforeWithdraw);

    // check remaining balance at boo
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Boo: ", remainingBalance.toString());
    expect(remainingBalance).to.equal(0);

    const rewards2Before = await fildaContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewards2After = await fildaContract.balanceOf(user.address);
    console.log("Claimed rewards(filda): ", rewards2After.sub(rewards2Before).toString());
  });
});


describe("Booster Channels", function() {
  let deployer, user;
  let productName;

  before(async function() {
    [deployer, user] = await ethers.getSigners();

    usdtContract = await ethers.getContractAt("IERC20", usdt.address);
    canContract = await ethers.getContractAt("IERC20", CAN);

    await deploySmartWallet();
    await deployBooster("channels");

    await Promise.all([usdt, husd].map(async (t) => {
      await impersonateForToken(t, user, "10000");
    }));

    productName = BOOSTER_CAN;
  });

  beforeEach(async function() {
    const receipt = await smartWalletFactory.connect(user).newSmartWallet(globalConfig.address);
    const txReceipt = await receipt.wait();
    const event = txReceipt.events.filter((e) => e.event == "WalletCreated");
    smartWallet = await ethers.getContractAt("SmartWallet", event[0].args["wallet"]);

    await Promise.all([usdt, husd].map(async (t) => {
      await approve(t, user, smartWallet.address);
    }));
  });

  it("invest/withdraw to strategy via wallet", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // deposit to smart wallet
    await smartWallet.connect(user).depositErc20ToWallet(usdt.address, depositValue);
    console.log("Deposited to SmartWallet: ", depositValue.toString());

    // check getCashBalance
    expect(await smartWallet.getCashBalance(usdt.address)).to.equal(depositValue);

    // invest to boo from smart wallet
    await smartWallet.connect(user).investFromWallet(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Invested from wallet: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance Of: ", investBalance.toString());
    // expect(depositValue).to.equal(investBalance);

    // withdraw from boo to smart wallet
    await smartWallet.connect(user).withdrawToWallet(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const cashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Actual withdrawn balance: ", cashBalance.toString());

    // check withdrawn balance after slippage
    expect(investBalance.mul(99).div(100).toString()).to.be.bignumber.lessThan(cashBalance.toString());

    // check remaining balance at boo
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Boo: ", remainingBalance.toString());
    // expect(remainingBalance).to.equal(0);

    // withdraw from smart wallet
    const balanceBefore = await usdtContract.balanceOf(user.address);
    await smartWallet.connect(user).withdrawFromWallet(usdt.address, cashBalance);
    const balanceAfter = await usdtContract.balanceOf(user.address);
    console.log("Withdraw from SmartWallet: ", cashBalance.toString());
    console.log("Actual balance increase: ", balanceAfter.sub(balanceBefore).toString());

    const finalCashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Final SmartWallet Balance: ", finalCashBalance.toString());

    /* Claim rewards */
    const rewardsTokenAddress = await smartWallet.rewardsTokenAddress(productName);
    const rewardsTokenContract = await ethers.getContractAt("IERC20", rewardsTokenAddress);
    
    const rewardsBefore = await rewardsTokenContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewardsAfter = await rewardsTokenContract.balanceOf(user.address);
    console.log("Claimed rewards(BOO): ", rewardsAfter.sub(rewardsBefore).toString());

    const rewards2Before = await canContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewards2After = await canContract.balanceOf(user.address);
    console.log("Claimed rewards(CAN): ", rewards2After.sub(rewards2Before).toString());
  });

  it("direct invest/withdraw to strategy", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // invest to boo directly
    await smartWallet.connect(user).directInvest(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Directly invested: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from boo to smart wallet
    const beforeWithdraw = await usdtContract.balanceOf(user.address);
    // the return value would be less than investBalance
    await smartWallet.connect(user).directWithdraw(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const afterWithdraw = await usdtContract.balanceOf(user.address);
    console.log("Actual withdrawn value: ", afterWithdraw - beforeWithdraw);

    // check remaining balance at boo
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Boo: ", remainingBalance.toString());
    expect(remainingBalance).to.equal(0);

    /* Claim rewards */
    const rewardsTokenAddress = await smartWallet.rewardsTokenAddress(productName);
    const rewardsTokenContract = await ethers.getContractAt("IERC20", rewardsTokenAddress);
  
    const rewardsBefore = await rewardsTokenContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewardsAfter = await rewardsTokenContract.balanceOf(user.address);
    console.log("Claimed rewards(BOO): ", rewardsAfter.sub(rewardsBefore).toString());

    const rewards2Before = await canContract.balanceOf(user.address);
    await smartWallet.connect(user).directClaimRewards(usdt.address, productName, { gasLimit: "10000000" });
    const rewards2After = await canContract.balanceOf(user.address);
    console.log("Claimed rewards(CAN): ", rewards2After.sub(rewards2Before).toString());
  });
});
