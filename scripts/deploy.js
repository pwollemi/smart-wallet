const { ethers } = require('hardhat');

async function belt(globalConfig) {
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

    await globalConfig.setStrategyFactory("belt", beltStrategyFactory.address);
}

async function depth(globalConfig) {
    const usdt = "0xa71edc38d189767582c38a3145b5873052c3e47a";
    const husd = "0x0298c2b32eae4da002a15f36fdf7615bea3da047";
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
    const piggyBreeder = await ethers.getContractAt("IPiggyBreeder", piggyBreederAddr);
    const poolLength = await piggyBreeder.poolLength();
    const lpTokenToPid = {};
    for (let i = 0; i < poolLength; i++) {
        const pool = await piggyBreeder.poolInfo(i);
        lpTokenToPid[pool["lpToken"]] = i;
    }

    for (let i = 0; i < vaults.length; i++) {
        const startegyName = "Depth-" + vaults[i].name;

        const DepthConfig = await ethers.getContractFactory("DepthConfig");
        const depthConfig = await DepthConfig.deploy(piggyBreederAddr, DEP);
        await depthConfig.deployed();
        console.log(startegyName, "DepthConfig address:", depthConfig.address);

        await depthConfig.setVault(usdt, vaults[i]["usdt"], lpTokenToPid[vaults[i]["usdt"]]);
        await depthConfig.setVault(husd, vaults[i]["husd"], lpTokenToPid[vaults[i]["husd"]]);

        const DepthStrategyFactory = await ethers.getContractFactory("DepthStrategyFactory");
        const depthStrategyFactory = await DepthStrategyFactory.deploy(depthConfig.address);
        await depthStrategyFactory.deployed();
        console.log(startegyName, "StrategyFactory:", depthStrategyFactory.address);

        await globalConfig.setStrategyFactory(startegyName, depthStrategyFactory.address);
    }
}


async function deployBooster(globalConfig, source) {
    const BOOSTER_FILDA = "booster-filda";
    const BOOSTER_CAN = "booster-can";
    const booBankAddr = "0xa61a4f9275ef62d2c076b0933f8a9418cec8c670";
    const booPoolsAddr = "0xBa92b862ac310D42A8a3DE613dcE917d0d63D98c"; 

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

async function booster(globalConfig) {
    await deployBooster(globalConfig, "filda");
    await deployBooster(globalConfig, "channels");
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

    return globalConfig;
}

async function main() {
    const globalConfig = await smartwallet();
    await belt(globalConfig);
    await depth(globalConfig);
    await booster(globalConfig);
}
  
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
  