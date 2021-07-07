// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

interface IStrategy {
    /**
     * @notice Get the rewards token address for specific production
     */
    function rewardsToken() external view returns (address);

    /**
     * @notice Deposit specific amount of token, zero address of token means native token
     * @param token The token to be used for deposit
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external payable;

    /**
     * @notice Withdraw specific amount of token
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function withdraw(address token, uint256 amount) external returns (uint256);

    /**
     * @notice Withdraw specific amount of rewards
     * @param token The token to generate rewards
     */
    function claimRewards(address token) external;

    /**
     * @notice Get token balance of account
     * @param token The token to generate rewards
     * @param account The account used to query balance
     */
    function balanceOf(address token, address account)
        external
        view
        returns (uint256);

    /**
     * @notice Get rewards number for specific token
     * @param token The token to generate rewards
     */
    function earned(address token) external view returns (uint256);

    /**
     * @notice Withdraw specific amount of rewards
     * @param token The token to generate rewards
     */
    function isTokenSupported(address token) external view returns (bool);
}
