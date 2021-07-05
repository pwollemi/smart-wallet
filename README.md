**Smart Wallet is one tool for user to manange assets**

You can use this Smart Wallet to interact with Belt.fi, depth.fi, pilot and booster.farm.

## Install

```
npm install
```

## Environment

Copy `.env.sample` as `.env` and set the following variables.

```
ACCOUNT=
API_KEY=
```

`ACCOUNT` is your private key.
You can get `API_KEY` from hecoinfo/ehterscan.

## How to test

### 1. Fork the mainnet

Use this command to fork the mainnet

```
npx hardhat node --fork https://http-mainnet-node.huobichain.com
```

### 2. Run the test script

For example, you can run this command for booster.

```
npx hardhat test test/test_booster.js --network localhost
```

Hardhat config is up to you.

Note: For Belt finance, if forked mainnet doesn't work, please try test on mainnet.

## How to deploy contracts

```
npx hardhat run --network heco scripts/test_script.js
```
