// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./IStrategy.sol";
import "./IStrategyFactory.sol";
import "./GlobalConfig.sol";

contract SmartWallet is Ownable {
    using SafeERC20 for IERC20;

    // each token has one specific strategy
    mapping(address => address) public tokenStrategy;
    GlobalConfig public globalConfig;

    constructor(address _globalConfig) public {
        globalConfig = GlobalConfig(_globalConfig);
    }

    function setTokenStrategy(address token, string calldata productName) external payable onlyOwner {
        address configuredStrategy = tokenStrategy[token];
        if (configuredStrategy == address(0)) {
            IStrategyFactory strategyFactory = IStrategyFactory(globalConfig.getStrategyFactory(productName));
            address newStrategy = address(strategyFactory.newStrategy());
            tokenStrategy[token] = newStrategy;
        } else {
            IStrategy oldStrategy = IStrategy(tokenStrategy[token]);
            uint balance = oldStrategy.balanceOf(token, address(this));
            if (balance > 0) {
                oldStrategy.withdraw(token, balance);
                claimRewardsInternal(token);
            }

            IStrategyFactory strategyFactory = IStrategyFactory(globalConfig.getStrategyFactory(productName));
            IStrategy newStrategy = IStrategy(strategyFactory.newStrategy());
            tokenStrategy[token] = address(newStrategy);
            IERC20(token).approve(address(newStrategy), balance);

            newStrategy.deposit{value:balance}(token, balance);
        }
    }

    function deposit(address token, uint amount) external payable onlyOwner {
        require(tokenStrategy[token] != address(0), "SmartWallet: no token strategy configured");

        IStrategy strategy = IStrategy(tokenStrategy[token]);
        if (isNativeToken(token)) {
            amount = msg.value;
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(address(strategy), amount);
        }
        strategy.deposit{value:msg.value}(token, amount);
    }

    function withdraw(address token, uint amount) external onlyOwner {
        require(tokenStrategy[token] != address(0), "SmartWallet: no token strategy configured");

        IStrategy strategy = IStrategy(tokenStrategy[token]);
        strategy.withdraw(token, amount);
        if (token == address(0)) {// native token
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

     function claimRewardsInternal(address token) internal {
        require(tokenStrategy[token] != address(0), "SmartWallet: no token strategy configured");

        IStrategy strategy = IStrategy(tokenStrategy[token]);
        strategy.claimRewards(token);
        address rewardsToken = strategy.rewardsToken();
        uint rewardAmount = IERC20(rewardsToken).balanceOf(address(this));
        IERC20(rewardsToken).transfer(owner(), rewardAmount);
    }

    function claimRewards(address token) external {
        claimRewardsInternal(token);
    }

    function rewardsTokenAddress(address token) external view returns (address) {
        require(tokenStrategy[token] != address(0), "SmartWallet: no token strategy configured");

        IStrategy strategy = IStrategy(tokenStrategy[token]);
        address rewardsToken = strategy.rewardsToken();
        return rewardsToken;
    }

    function isNativeToken(address token) internal pure returns (bool) {
        return token == address(0);
    }

    function balanceOf(address token) external view returns (uint) {
        IStrategy strategy = IStrategy(tokenStrategy[token]);
        return strategy.balanceOf(token, address(strategy));
    }

}