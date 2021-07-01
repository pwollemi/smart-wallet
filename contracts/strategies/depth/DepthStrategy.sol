// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "../../interfaces/IStrategy.sol";
import "./DepthConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract DepthStrategy is IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public piggyBreeder;
    address private _rewardsToken;
    DepthConfig public depthConfig;

    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "caller is not the owner");
        _;
    }

    constructor(DepthConfig _depthConfig, address _owner) public {
        piggyBreeder = _depthConfig.piggyBreeder();
        _rewardsToken = _depthConfig.rewardsToken();
        depthConfig = _depthConfig;
        owner = _owner;
    }

    function rewardsToken() external view override returns (address) {
        return _rewardsToken;
    }

    function deposit(address token, uint256 amount)
        external
        payable
        override
        onlyOwner
    {
        (address vault, uint256 pid) = getVaultInfo(token);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(vault, amount);

        IDepthVault(vault).deposit(amount);

        uint256 lpTokenAmount = IERC20(vault).balanceOf(address(this));

        IERC20(vault).approve(piggyBreeder, lpTokenAmount);
        IPiggyBreeder(piggyBreeder).stake(pid, lpTokenAmount);
    }

    function balanceOf(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        (address vault, uint256 pid) = getVaultInfo(token);

        // Vault mints the same amount of token
        (uint256 lpTokenAmount, , , ) = IPiggyBreeder(piggyBreeder).userInfo(
            pid,
            account
        );
        return lpTokenAmount;
    }

    function earned(address token) external view override returns (uint256) {
        (address vault, uint256 pid) = getVaultInfo(token);

        return IPiggyBreeder(piggyBreeder).pendingPiggy(pid, address(this));
    }

    function withdraw(address token, uint256 amount)
        external
        override
        onlyOwner
    {
        (address vault, uint256 pid) = getVaultInfo(token);

        IPiggyBreeder(piggyBreeder).unStake(pid, amount);
        IDepthVault(vault).withdraw(amount);
        IERC20(token).transfer(owner, amount);
    }

    function claimRewards(address token) external override onlyOwner {
        (address vault, uint256 pid) = getVaultInfo(token);

        IPiggyBreeder(piggyBreeder).claim(pid);
        uint256 rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
        IERC20(_rewardsToken).transfer(owner, rewardAmount);
    }

    function isTokenSupported(address token)
        external
        view
        override
        returns (bool)
    {
        (address vault, ) = depthConfig.getVaultInfo(token);
        return vault != address(0);
    }

    function getVaultInfo(address token)
        internal
        view
        returns (address vault, uint256 pid)
    {
        (vault, pid) = depthConfig.getVaultInfo(token);
        require(vault != address(0), "vault info is not configured");
    }
}
