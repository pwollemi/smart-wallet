const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const BN = require('bn.js');
const chai = require("chai");
chai.use(solidity);
chai.use(require('chai-bn')(BN));
const { expect } = chai;

const { impersonateForToken, approve, setNextBlockTimestamp } = require("./helper");
const { husd, usdt } = require("../info/tokens");

const { stakingPoolInfo, ptdBankAddr, PTD } = require("../info/pilot");

// contracts
let globalConfig;
let smartWalletImpl;
let smartWallet;
let smartWalletFactory;
let usdtContract;

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

async function deployPilot() {
  const PtdConfig = await ethers.getContractFactory("PtdConfig");
  const ptdConfig = await PtdConfig.deploy(ptdBankAddr, PTD);
  await ptdConfig.deployed();
  console.log("PtdConfig address:", ptdConfig.address);

  const infos = stakingPoolInfo();
  for (let token in infos) {
    await ptdConfig.setStakingPool(token, infos[token]);
  }

  const PtdStrategyFactory = await ethers.getContractFactory("PtdStrategyFactory");
  const ptdStrategyFactory = await PtdStrategyFactory.deploy(ptdConfig.address);
  await ptdStrategyFactory.deployed();
  console.log("PtdStrategyFactory:", ptdStrategyFactory.address);

  await globalConfig.setStrategyFactory("Pilot", ptdStrategyFactory.address);
}

describe("Pilot", function() {
  let deployer, user;
  let productName = "Pilot";

  before(async function() {
    [deployer, user] = await ethers.getSigners();

    usdtContract = await ethers.getContractAt("IERC20", usdt.address);

    await deploySmartWallet();
    await deployPilot();

    await Promise.all([usdt, husd].map(async (t) => {
      await impersonateForToken(t, user, "10000");
    }));
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

    // deposit
    await smartWallet.connect(user).depositErc20ToWallet(usdt.address, depositValue);
    console.log("Deposited to SmartWallet: ", depositValue.toString());

    // getCashBalance
    expect(await smartWallet.getCashBalance(usdt.address)).to.equal(depositValue);

    // invest
    await smartWallet.connect(user).investFromWallet(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Invested from wallet: ", depositValue.toString());

    // invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance Of: ", investBalance.toString());
    // expect(depositValue).to.equal(investBalance);

    // Increase time
    // const currentTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
    // await setNextBlockTimestamp(currentTimestamp);

    // withdraw to smart wallet
    await smartWallet.connect(user).withdrawToWallet(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const cashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Actual withdrawn balance: ", cashBalance.toString());

    // check withdrawn balance after slippage
    expect(investBalance.mul(99).div(100).toString()).to.be.bignumber.lessThan(cashBalance.toString());

    // check remaining balance at pilot
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Pilot: ", remainingBalance.toString());

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
    console.log("Claimed rewards: ", rewardsAfter.sub(rewardsBefore).toString());
  });

  it("direct invest/withdraw to strategy", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // invest to pilot directly
    await smartWallet.connect(user).directInvest(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Directly invested: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from pilot to smart wallet
    const beforeWithdraw = await usdtContract.balanceOf(user.address);
    // the return value would be less than investBalance
    await smartWallet.connect(user).directWithdraw(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const afterWithdraw = await usdtContract.balanceOf(user.address);
    console.log("Actual withdrawn value: ", afterWithdraw - beforeWithdraw);

    // check remaining balance at pilot
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Pilot: ", remainingBalance.toString());
    // expect(remainingBalance).to.equal(0);
  });
});
