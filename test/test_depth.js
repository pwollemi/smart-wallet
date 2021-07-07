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

// depth
const DEP = "0x48c859531254f25e57d1c1a8e030ef0b1c895c27";

const vaults = [{
        name: "CoinWind",
        "usdt": "0xd96e3FeDbF4640063F2B20Bd7B646fFbe3c774FF",
        "husd": "0x7e1Ac905214214c1E339aaFBA72E2Ce29a7bEC22"
    }, {
        name: "Back",
        "usdt": "0x22BAd7190D3585F6be4B9fCed192E9343ec9d5c7",
        "husd": "0x996a0e31508E93EB53fd27d216E111fB08E22255"
    }, {
        name: "Pilot",
        "usdt": "0xB567bd78A4Ef08EE9C08762716B1699C46bA5ea3",
        "husd": "0x9bd25Ed64F55f317d0404CCD063631CbfC4fc90b"
    }, {
        name: "Filda",
        "usdt": "0x6FF92A0e4dA9432a79748A15c5B8eCeE6CF0eE66",
        "husd": "0xE308880c215246Fa78753DE7756F9fc814D1C186"
    }, {
        name: "Channels",
        "usdt": "0x95c258E41f5d204426C33628928b7Cc10FfcF866",
        "husd": "0x9213c6269Faed1dE6102A198d05a6f9E9D70e1D0"
    }, {
        name: "Lendhub",
        "usdt": "0x70941A63D4E24684Bd746432123Da1fE0bFA1A35",
        "husd": "0x80Da2161a80f50fea78BE73044E39fE5361aC0dC"
    }
];

const piggyBreederAddr = "0x59F8AD2495236B25BA95E3161154F0024fbDBDCe";

async function impersonateForToken(tokenInfo, receiver, amount) {
  console.log("Impersonating for " + tokenInfo.symbol);

  const token = await ethers.getContractAt("IERC20", tokenInfo.address);
  await receiver.sendTransaction({
    to: tokenInfo.holder,
    value: ethers.utils.parseEther("1.0")
  });

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [tokenInfo.holder]}
  )

  const signedHolder = await ethers.provider.getSigner(tokenInfo.holder);
  await token.connect(signedHolder).transfer(receiver.address, ethers.utils.parseUnits(amount, tokenInfo.decimals));

  await hre.network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [tokenInfo.holder]}
  )
}

async function approve(tokenInfo, owner, spender) {
  const token = await ethers.getContractAt("IERC20", tokenInfo.address);
  await token.connect(owner).approve(spender, ethers.constants.MaxUint256);
}

// contracts
let globalConfig;
let smartWalletImpl;
let smartWallet;
let smartWalletFactory;
let usdtContract;

let startegyNames = [];
let depthStrategyFactories = [];
let lpTokenToPid = {};

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

async function getDepthInitData() {
  const piggyBreeder = await ethers.getContractAt("IPiggyBreeder", piggyBreederAddr);
  const poolLength = await piggyBreeder.poolLength();
  for (let i = 0; i < poolLength; i++) {
    const pool = await piggyBreeder.poolInfo(i);
    lpTokenToPid[pool["lpToken"]] = i;
  }
}

async function deployDepth() {
  for (let i = 0; i < vaults.length; i++) {
      const startegyName = "Depth-" + vaults[i].name;

      const DepthConfig = await ethers.getContractFactory("DepthConfig");
      const depthConfig = await DepthConfig.deploy(piggyBreederAddr, DEP);
      await depthConfig.deployed();
      console.log(startegyName, "DepthConfig address:", depthConfig.address);

      await depthConfig.setVault(usdt.address, vaults[i]["usdt"], lpTokenToPid[vaults[i]["usdt"]]);
      await depthConfig.setVault(husd.address, vaults[i]["husd"], lpTokenToPid[vaults[i]["husd"]]);

      const DepthStrategyFactory = await ethers.getContractFactory("DepthStrategyFactory");
      const depthStrategyFactory = await DepthStrategyFactory.deploy(depthConfig.address);
      await depthStrategyFactory.deployed();
      console.log(startegyName, "StrategyFactory:", depthStrategyFactory.address);

      await globalConfig.setStrategyFactory(startegyName, depthStrategyFactory.address);
      startegyNames.push(startegyName);
      depthStrategyFactories.push(depthStrategyFactory);
  }
}

describe("Depth", function() {
  let deployer, user;
  let productName;

  before(async function() {
    [deployer, user] = await ethers.getSigners();

    usdtContract = await ethers.getContractAt("IERC20", usdt.address);

    await getDepthInitData();
    await deploySmartWallet();
    await deployDepth();

    await Promise.all([usdt, husd].map(async (t) => {
      await impersonateForToken(t, user, "10000");
    }));

    productName = startegyNames[3];
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

    // invest to depth from smart wallet
    await smartWallet.connect(user).investFromWallet(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Invested from wallet: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance Of: ", investBalance.toString());
    expect(depositValue).to.equal(investBalance);

    // withdraw from depth to smart wallet
    await smartWallet.connect(user).withdrawToWallet(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const cashBalance = await smartWallet.getCashBalance(usdt.address);
    console.log("Actual withdrawn balance: ", cashBalance.toString());

    // check withdrawn balance after slippage
    expect(investBalance.mul(99).div(100).toString()).to.be.bignumber.lessThan(cashBalance.toString());

    // check remaining balance at depth
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Depth: ", remainingBalance.toString());
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
    console.log("Claimed rewards: ", rewardsAfter.sub(rewardsBefore).toString());
  });

  it("direct invest/withdraw to strategy", async function() {
    const depositValue = ethers.utils.parseUnits("0.00000000000001", usdt.decimals);

    // invest to depth directly
    await smartWallet.connect(user).directInvest(usdt.address, depositValue, productName, { value: ethers.constants.Zero, gasLimit: "10000000" });
    console.log("Directly invested: ", depositValue.toString());

    // check invested balance
    const investBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Invest Balance: ", investBalance.toString());
    expect(depositValue.mul(99).div(100).toString()).to.be.bignumber.lessThan(investBalance.toString());

    // withdraw from depth to smart wallet
    const beforeWithdraw = await usdtContract.balanceOf(user.address);
    // the return value would be less than investBalance
    await smartWallet.connect(user).directWithdraw(usdt.address, investBalance, productName, { gasLimit: "10000000" });
    const afterWithdraw = await usdtContract.balanceOf(user.address);
    console.log("Actual withdrawn value: ", afterWithdraw - beforeWithdraw);

    // check remaining balance at depth
    const remainingBalance = await smartWallet.investBalanceOf(usdt.address, productName);
    console.log("Remaining balance at Depth: ", remainingBalance.toString());
    expect(remainingBalance).to.equal(0);
  });
});
