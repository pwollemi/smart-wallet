// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

interface IStrategy {
    function rewardsToken() view external returns(address);
    function deposit(address token, uint amount) external payable;
    function withdraw(address token, uint amount) external;
    function claimRewards(address token) external;
    function balanceOf(address token, address account) external view returns (uint);
    function earned(address token) external view returns (uint256);
}