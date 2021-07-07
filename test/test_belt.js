const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const chai = require("chai");
const BN = require('bn.js');

chai.use(solidity);
chai.use(require('chai-bn')(BN));
const { assert, expect } = chai;

// assets
const usdt = {
  symbol: "USDT",
  address: "0xa71edc38d189767582c38a3145b5873052c3e47a",
  holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  decimals: 18
};
const husd = {
  symbol: "HUSD",
  address: "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
  holder: "0xcee6de4290a4002de8712d16f8cfba03cb9afcf4",
  decimals: 8
};
const dai = {
  symbol: "DAI",
  address: "0x3d760a45d0887dfd89a2f5385a236b29cb46ed2a",
  holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  decimals: 18
};
const usdc = {
  symbol: "USDC",
  address: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
  holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  decimals: 6
};


// belt
const depositor = "0x6748D7915e2fB29D0b3B43467028C03b4da281a5";
const masterOrbit = "0x24B1652b0D9A3Dc82e06E35f8a2940D8591DFd11";
const lpTokenPoolId = ethers.constants.Zero;

async function approve(tokenInfo, owner, spender) {
  const token = await ethers.getContractAt("IERC20", tokenInfo.address);
  await token.connect(owner).approve(spender, ethers.constants.MaxUint256);
}

// deployed contracts
let globalConfigAddr = "0xf68e2e8c3bFbb870A0a11D4de99C8294C2FC181a";
let smartWalletImplAddr = "0x7A8A5537Ef6Af6B9815FCd62A2b74Bb25441E277";
let smartWalletFactoryAddr = "0xd5aEb2e147ba5Aa8544105Bf9df5c1fef28bd9F3";
let beltConfigAddr = "0xfB149Ff440Aa4651A1108011fDfA9302B5B7653e";
let beltStrategyFactoryAddr = "0x6a69fcf29d4f4ab30d98F0c5274572C39b38b524";

// contracts
let globalConfig;
let smartWalletImpl;
let smartWallet;
let smartWalletFactory;
let beltConfig;
let beltStrategyFactory;

let usdtContract;

async function deployContracts() {
  const BeltConfig = await ethers.getContractFactory("BeltConfig");
  beltConfig = await BeltConfig.deploy(depositor, masterOrbit, lpTokenPoolId);
  await beltConfig.deployed();
  beltConfigAddr = beltConfig.address;
  console.log('Belt Config: ', beltConfigAddr);

  const BeltStrategyFactory = await ethers.getContractFactory("BeltStrategyFactory");
  beltStrategyFactory = await BeltStrategyFactory.deploy(beltConfigAddr);
  await beltStrategyFactory.deployed();
  beltStrategyFactoryAddr = beltStrategyFactory.address;
  console.log('Belt Strategy factory: ', beltStrategyFactoryAddr);

  const GlobalConfig = await ethers.getContractFactory("GlobalConfig");
  globalConfig = await GlobalConfig.deploy();
  await globalConfig.deployed();
  globalConfigAddr = globalConfig.address;
  console.log('Global Config: ', globalConfigAddr);

  const SmartWallet = await ethers.getContractFactory("SmartWallet");
  smartWalletImpl = await SmartWallet.deploy();
  await smartWalletImpl.deployed();
  await smartWalletImpl.initialize(globalConfigAddr);
  smartWalletImplAddr = smartWalletImpl.address;
  console.log('SmartWalletImpl: ', smartWalletImplAddr);

  const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
  smartWalletFactory = await SmartWalletFactory.deploy(smartWalletImpl.address);
  await smartWalletFactory.deployed();
  smartWalletFactoryAddr = smartWalletFactory.address;
  console.log('SmartWalletFactory: ', smartWalletFactoryAddr);
}

async function getContracts() {
  globalConfig = await ethers.getContractAt("GlobalConfig", globalConfigAddr);
  smartWalletImpl = await ethers.getContractAt("SmartWallet", smartWalletImplAddr);
  smartWalletFactory = await ethers.getContractAt("SmartWalletFactory", smartWalletFactoryAddr);
  beltConfig = await ethers.getContractAt("BeltConfig", beltConfigAddr);
  beltStrategyFactory = await ethers.getContractAt("BeltStrategyFactory", beltStrategyFactoryAddr);
  usdtContract = await ethers.getContractAt("IERC20", usdt.address);
}

async function waitTx(call) {
  const tx = await call;
  return await tx.wait();
}

describe("Belt", function() {
  let user;

  before(async function() {
    [user] = await ethers.getSigners();
    await deployContracts();
    await getContracts();
    await waitTx(globalConfig.connect(user).setStrategyFactory("belt", beltStrategyFactory.address));
  });

  beforeEach(async function() {
    const receipt = await smartWalletFactory.connect(user).newSmartWallet(globalConfig.address);
    const txReceipt = await receipt.wait();
    const event = txReceipt.events.filter((e) => e.event == "WalletCreated");
    smartWallet = await ethers.getContractAt("SmartWallet", event[0].args["wallet"]);

    console.log("SmartWallet created: ", smartWallet.address);

    await approve(usdt, user, smartWallet.address);
  });

  it("invest/withdraw to strategy via wallet", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // deposit to smart wallet
    await waitTx(smartWallet.connect(user).depositErc20ToWallet(usdt.address, depositValue));
    console.log("Deposited to SmartWallet: ", depositValue.toString());

    // check getCashBalance
    expect(await smartWallet.getCashBalance(usdt.address)).to.equal(depositValue);

    // invest to belt from smart wallet
    await waitTx(smartWallet.connect(user).investFromWallet(usdt.address, depositValue, "belt", { value: ethers.constants.Zero, gasLimit: "10000000" }));
    console.log("Invested from wallet: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, "belt");
    console.log("Invest Balance Of: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from belt to smart wallet
    await waitTx(smartWallet.connect(user).withdrawToWallet(usdt.address, investBalance, "belt", { gasLimit: "10000000" }));
    const cashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Actual withdrawn balance: ", cashBalance.toString());

    // check withdrawn balance after slippage
    expect(investBalance.mul(99).div(100).toString()).to.be.bignumber.lessThan(cashBalance.toString());

    // check remaining balance at belt
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, "belt");
    console.log("Remaining balance at Belt: ", remainingBalance.toString());
    // expect(remainingBalance).to.equal(0);

    // withdraw from smart wallet
    const balanceBefore = await usdtContract.balanceOf(user.address);
    await waitTx(smartWallet.connect(user).withdrawFromWallet(usdt.address, cashBalance));
    const balanceAfter = await usdtContract.balanceOf(user.address);
    console.log("Withdraw from SmartWallet: ", cashBalance.toString());
    console.log("Actual balance increase: ", balanceAfter.sub(balanceBefore).toString());

    const finalCashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Final SmartWallet Balance: ", finalCashBalance.toString());

    /* Claim rewards */
    const rewardsTokenAddress = await smartWallet.rewardsTokenAddress("belt");
    const rewardsTokenContract = await ethers.getContractAt("IERC20", rewardsTokenAddress);
    
    const rewardsBefore = await rewardsTokenContract.balanceOf(user.address);
    await waitTx(smartWallet.connect(user).directClaimRewards(usdt.address, "belt", { gasLimit: "10000000" }));
    const rewardsAfter = await rewardsTokenContract.balanceOf(user.address);
    console.log("Claimed rewards: ", rewardsAfter.sub(rewardsBefore).toString());
  });

  it("direct invest/withdraw to strategy", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // invest to belt directly
    await waitTx(smartWallet.connect(user).directInvest(usdt.address, depositValue, "belt", { value: ethers.constants.Zero, gasLimit: "10000000" }));
    console.log("Directly invested: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, "belt");
    console.log("Invest Balance: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from belt to smart wallet
    const beforeWithdraw = await usdtContract.balanceOf(user.address);
    // the return value would be less than investBalance
    await waitTx(smartWallet.connect(user).directWithdraw(usdt.address, investBalance, "belt", { gasLimit: "10000000" }));
    const afterWithdraw = await usdtContract.balanceOf(user.address);
    console.log("Actual withdrawn value: ", afterWithdraw - beforeWithdraw);

    // check remaining balance at belt
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, "belt");
    console.log("Remaining balance at Belt: ", remainingBalance.toString());
    expect(remainingBalance).to.equal(0);
  });
});
