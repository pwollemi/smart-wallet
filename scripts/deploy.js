const { ethers } = require('hardhat');

async function belt() {
    const depositor = "0x6748D7915e2fB29D0b3B43467028C03b4da281a5";
    const masterOrbit = "0x24B1652b0D9A3Dc82e06E35f8a2940D8591DFd11";
    const lpTokenPoolId = 0;
    
    const BeltConfig = await ethers.getContractFactory("BeltConfig");
    const beltConfig = await BeltConfig.deploy(depositor, masterOrbit, lpTokenPoolId);
    await beltConfig.deployed();
    console.log("BeltConfig address:", beltConfig.address);

    const BeltStrategyFactory = await ethers.getContractFactory("BeltStrategyFactory");
    const beltStrategyFactory = await BeltStrategyFactory.deploy(beltConfig.address);
    await beltStrategyFactory.deployed();
    console.log("BeltStrategyFactory address:", beltStrategyFactory.address);
}

async function smartwallet() {
    const GlobalConfig = await ethers.getContractFactory("GlobalConfig");
    const globalConfig = await GlobalConfig.deploy();
    await globalConfig.deployed();
    console.log("GlobalConfig address:", globalConfig.address);

    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy();
    await smartWallet.deployed();
    await smartWallet.initialize(globalConfig.address);
    console.log("SmartWallet address:", smartWallet.address);

    const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
    const smartWalletFactory = await SmartWalletFactory.deploy(smartWallet.address);
    await smartWalletFactory.deployed();
    console.log("SmartWalletFactory address:", smartWalletFactory.address);
}

async function main() {
    await smartwallet();
    await belt();
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  