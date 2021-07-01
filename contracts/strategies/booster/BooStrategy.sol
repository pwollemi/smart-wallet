// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "../../interfaces/IStrategy.sol";
import "./BooConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

contract BooStrategy is IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public booPools;
    address private _rewardsToken;
    address private _rewardsToken2;
    BooConfig public booConfig;

    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "caller is not the owner");
        _;
    }

    constructor(BooConfig _booConfig, address _owner) public {
        booPools = _booConfig.booPools();
        _rewardsToken = _booConfig.rewardsToken();
        _rewardsToken2 = _booConfig.rewardsToken2();
        booConfig = _booConfig;
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
        (address safeBox, uint256 booPid, , ) = getPoolInfo(token);

        console.log(safeBox);
        console.log(booPid);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(safeBox, amount);

        ISafeBox(safeBox).deposit(amount);

        uint256 bTokenAmount = IERC20(safeBox).balanceOf(address(this));
        console.log(bTokenAmount);

        IERC20(safeBox).approve(booPools, bTokenAmount);
        IBooPools(booPools).deposit(booPid, bTokenAmount);
    }

    function balanceOf(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        (address safeBox, uint256 booPid, , ) = getPoolInfo(token);
        (uint256 bTokenBalance, , ) = IBooPools(booPools).userInfo(
            booPid,
            account
        );
        uint256 exchangeRate = ISafeBox(safeBox).getBaseTokenPerLPToken();
        uint256 tokenBalance = bTokenBalance.mul(exchangeRate).div(1e18);
        return tokenBalance;
    }

    function earned(address token) external view override returns (uint256) {
        (, uint256 booPid, address actionPool, uint256 actionPid) = getPoolInfo(
            token
        );
        // BOO reward
        return IBooPools(booPools).pendingRewards(booPid, address(this));

        // Filda/Can rewards
        // return IActionPools(actionPool).pendingRewards(actionPid, address(this));
    }

    function withdraw(address token, uint256 amount)
        external
        override
        onlyOwner
    {
        (address safeBox, uint256 booPid, , ) = getPoolInfo(token);
        uint256 exchangeRate = ISafeBox(safeBox).getBaseTokenPerLPToken();
        uint256 btokenAmount = amount.mul(1e18).div(exchangeRate);
        IBooPools(booPools).withdraw(booPid, btokenAmount);
        ISafeBox(safeBox).withdraw(amount);
        IERC20(token).transfer(owner, amount);
    }

    function claimRewards(address token) external override onlyOwner {
        (, uint256 booPid, address actionPool, uint256 actionPid) = getPoolInfo(
            token
        );

        IBooPools(booPools).claim(booPid);
        uint256 rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
        IERC20(_rewardsToken).transfer(owner, rewardAmount);

        IActionPools(actionPool).claim(actionPid);
        uint256 rewardAmount2 = IERC20(_rewardsToken2).balanceOf(address(this));
        IERC20(_rewardsToken2).transfer(owner, rewardAmount2);
    }

    function isTokenSupported(address token)
        external
        view
        override
        returns (bool)
    {
        (address safeBox, , , ) = booConfig.getPoolInfo(token);
        return safeBox != address(0);
    }

    function getPoolInfo(address token)
        internal
        view
        returns (
            address safeBox,
            uint256 booPid,
            address actionPool,
            uint256 actionPid
        )
    {
        (safeBox, booPid, actionPool, actionPid) = booConfig.getPoolInfo(token);
        require(safeBox != address(0), "vault info is not configured");
    }
}
