// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "./SmartWallet.sol";
contract SmartWalletFactory {
    function newSmartWallet(address globalConfig) external returns (address) {
        SmartWallet smartWallet = new SmartWallet(globalConfig);
        smartWallet.transferOwnership(msg.sender);
        return address(smartWallet);
    }
}