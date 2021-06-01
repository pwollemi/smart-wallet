// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/proxy/Clones.sol";

import "./SmartWallet.sol";
contract SmartWalletFactory {
    mapping(address => SmartWallet) public walletStore;

    event WalletCreated(address owner, address wallet);

    function newSmartWallet(address globalConfig) external returns (address) {
        SmartWallet smartWallet = new SmartWallet(globalConfig);
        smartWallet.transferOwnership(msg.sender);

        walletStore[msg.sender] = smartWallet;

        emit WalletCreated(msg.sender, address(smartWallet));

        return address(smartWallet);
    }
}