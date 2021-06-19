require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
const dotEnvConfig = require("dotenv").config;

dotEnvConfig();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.6.9",
      },
    ],
  },
  networks: {
    localhost: {
      chainId: 31337,
      url: 'http://127.0.0.1:8545/',
      timeout: 3000000,
    },
    hecoTestnet: {
      url: "https://http-testnet.hecochain.com",
      network_id: "256",
      accounts: [process.env.ACCOUNT]
    },
    heco: {
      url: "https://http-mainnet-node.huobichain.com",
      network_id: "128",
      accounts: [process.env.ACCOUNT]
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  },
  hecoinfo: {
    apiKey: process.env.API_KEY 
  },
  mocha: {
    timeout: false,
  }  
};