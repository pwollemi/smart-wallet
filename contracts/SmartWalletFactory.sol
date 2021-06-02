// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

import "./SmartWallet.sol";
contract SmartWalletFactory is Ownable {
    mapping(address => SmartWallet) public walletStore;

    address public walletImpl;

    event WalletCreated(address owner, address wallet);

    constructor(address _walletImpl) public {
        walletImpl = _walletImpl;
    }

    function newSmartWallet(address globalConfig) external returns (address) {
        SmartWallet smartWallet = SmartWallet(payable(Clones.clone(walletImpl)));
        smartWallet.initialize(globalConfig);
        walletStore[msg.sender] = smartWallet;

        emit WalletCreated(msg.sender, address(smartWallet));

        return address(smartWallet);
    }
}