// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./interfaces/IStrategy.sol";
import "./interfaces/IStrategyFactory.sol";
import "./GlobalConfig.sol";

/**
 * @title SmartWallet is one tool for user to manage digital assets
 * @author FilDA
 */
contract SmartWallet is OwnableUpgradeable {
    using SafeERC20 for IERC20;

    /// Each prod has one specific strategy
    mapping(string => IStrategy) public investStrategy;
    GlobalConfig public globalConfig;

    function initialize(address _globalConfig) external initializer {
        globalConfig = GlobalConfig(_globalConfig);
        __Ownable_init();
    }

    /**
     * @notice Deposit Erc20 token from user's normal wallet to this smart wallet
     * @dev Only Erc20 token is supported by this function
     * @param token The address of the asset to be deposited
     * @param amount The # of asset to be deposited
     */
    function depositErc20ToWallet(address token, uint256 amount) external {
        require(token != address(0), "SmartWallet: zero address");
        require(amount != 0, "SmartWallet: zero amount");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Get cash balance for any tokens saved in this smart wallet
     * @dev Use zero address to get native token balance
     * @param token The address of the asset to be queried
     */
    function getCashBalance(address token) external view returns (uint256) {
        if (isNativeToken(token)) {
            return address(this).balance;
        }

        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @notice Invest to specific production with assets saved in this smart wallet
     * @dev Zero amount is not allowed
     * @param token The token to be used for investment
     * @param amount The amount to invest
     * @param prod The production to invest
     */
    function investFromWallet(
        address token,
        uint256 amount,
        string calldata prod
    ) external payable onlyOwner {
        require(amount != 0, "SmartWallet: zero invest amount");

        IStrategy currentStrategy = getInvestStrategy(prod);

        if (!isNativeToken(token)) {
            IERC20(token).approve(address(currentStrategy), amount);
        }
        currentStrategy.deposit{value: msg.value}(token, amount);
    }

    /**
     * @notice Invest to specific production with assets from user's normal account
     * @dev Zero amount is not allowed
     * @param token The token to be used for investment
     * @param amount The amount to invest
     * @param prod The production to invest
     */
    function directInvest(
        address token,
        uint256 amount,
        string calldata prod
    ) external payable onlyOwner {
        require(amount != 0, "SmartWallet: zero invest amount");

        IStrategy strategy = getInvestStrategy(prod);
        if (isNativeToken(token)) {
            amount = msg.value;
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(address(strategy), amount);
        }
        strategy.deposit{value: msg.value}(token, amount);
    }

    // Get investment strategy with production name
    function getInvestStrategy(string calldata prod)
        internal
        returns (IStrategy)
    {
        if (address(investStrategy[prod]) == address(0)) {
            require(
                globalConfig.getStrategyFactory(prod) != address(0),
                "SmartWallet: no strategy configured"
            );

            IStrategyFactory strategyFactory = IStrategyFactory(
                globalConfig.getStrategyFactory(prod)
            );
            IStrategy newStrategy = strategyFactory.newStrategy();
            investStrategy[prod] = newStrategy;
        }
        return investStrategy[prod];
    }

    /**
     * @notice Get token balance saved in specific production
     * @param token The token to be queried
     * @param prod The production to invest
     */
    function investBalanceOf(address token, string calldata prod)
        external
        view
        returns (uint256)
    {
        IStrategy strategy = investStrategy[prod];
        return strategy.balanceOf(token, address(strategy));
    }

    /**
     * @notice Withdraw specific amount of token to this smart wallet
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     * @param prod The production to withdraw from
     */
    function withdrawToWallet(
        address token,
        uint256 amount,
        string calldata prod
    ) external onlyOwner {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );
        strategy.withdraw(token, amount);
    }

    /**
     * @notice Withdraw specific amount of token to user's normal account
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     * @param prod The production to withdraw from
     */
    function directWithdraw(
        address token,
        uint256 amount,
        string calldata prod
    ) external onlyOwner {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );

        uint256 actualAmount = strategy.withdraw(token, amount);
        if (token == address(0)) {
            // native token
            payable(owner()).transfer(actualAmount);
        } else {
            IERC20(token).transfer(owner(), actualAmount);
        }
    }

    /**
     * @notice Withdraw specific amount of token to user's normal account from this smart wallet
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawFromWallet(address token, uint256 amount)
        external
        onlyOwner
    {
        if (token == address(0)) {
            // native token
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    /**
     * @notice Get rewards number for specific token
     * @param token The token to generate rewards
     * @param prod The production to generate rewards
     */
    function earned(address token, string calldata prod)
        external
        view
        returns (uint256)
    {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );

        return strategy.earned(token);
    }

    /**
     * @notice Claim rewards from specific production
     * @param token The token to generate rewards
     * @param prod The production to generate rewards
     */
    function claimRewardsInternal(address token, string calldata prod)
        internal
    {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );

        strategy.claimRewards(token);
    }

    /**
     * @notice Claim rewards from specific production to this smart wallet
     * @param token The token to generate rewards
     * @param prod The production to generate rewards
     */
    function claimRewardsToWallet(address token, string calldata prod)
        external
    {
        claimRewardsInternal(token, prod);
    }

    /**
     * @notice Claim rewards from specific production to user's normal account
     * @param token The token to generate rewards
     * @param prod The production to generate rewards
     */
    function directClaimRewards(address token, string calldata prod) external {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );

        claimRewardsInternal(token, prod);
        address rewardsToken = strategy.rewardsToken();
        uint256 rewardAmount = IERC20(rewardsToken).balanceOf(address(this));
        IERC20(rewardsToken).transfer(owner(), rewardAmount);
    }

    /**
     * @notice Get the rewards token address for specific production
     * @param prod The production to generate rewards
     */
    function rewardsTokenAddress(string calldata prod)
        external
        view
        returns (address)
    {
        IStrategy strategy = investStrategy[prod];
        require(
            address(strategy) != address(0),
            "SmartWallet: strategy not configured"
        );

        address rewardsToken = strategy.rewardsToken();
        return rewardsToken;
    }

    function isNativeToken(address token) internal pure returns (bool) {
        return token == address(0);
    }

    receive() external payable {}
}
