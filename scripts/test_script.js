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

async function waitTx(call) {
  const tx = await call;
  return await tx.wait();
}

async function main() {
  [user] = await ethers.getSigners();

  const depositorC = await ethers.getContractAt("Depositor", depositor);
    const uamounts = [
      ethers.constants.Zero,
      ethers.constants.Zero,
      ethers.utils.parseUnits("0.0000001", 18),
      ethers.constants.Zero,
    ];
    const min_amount = ethers.utils.parseUnits("0.00000001", 18);
    await waitTx(depositorC.connect(user).add_liquidity([0,0,"100000","0"], ethers.constants.Zero, {gasLimit: "3000000"}));
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  