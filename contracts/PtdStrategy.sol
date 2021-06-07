// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

interface PtdBank {
    function deposit(address token, uint256 amount) external payable;
    function withdraw(address token, uint256 pAmount) external;
    function banks(address token) external view returns(address tokenAddr, address pTokenAddr, bool isOpen, bool canDeposit, bool canWithdraw, uint256 totalVal, uint256 totalDebt, uint256 totalDebtShare, uint256 totalReserve, uint256 lastInterestTime);
    function totalToken(address token) external view returns (uint256);
}

interface StakingReward {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getReward() external;
    function stakingToken() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function earned(address account) external view returns (uint256);
}

import "./IStrategy.sol";
import "./PtdConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PtdStrategy is IStrategy {
    using SafeERC20 for IERC20;
    using SafeMath for uint;

    address public ptdBankAddr;
    address private _rewardsToken;
    PtdConfig public ptdConfig;

    address public owner;

    constructor(PtdConfig _ptdConfig, address _owner) public {
        ptdBankAddr = _ptdConfig.ptdBankAddr();
        _rewardsToken = _ptdConfig.rewardsToken();
        ptdConfig = _ptdConfig;
        owner = _owner;
    }

    function rewardsToken() view external override returns(address) {
        return _rewardsToken;
    }

    function deposit(address token, uint amount) external override payable {
        PtdBank ptdBank = PtdBank(ptdBankAddr);
        address stakingPool = getStakingPool(token);

        if (token == address(0)) {//HT
            amount = msg.value;
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(ptdBankAddr, amount);
        }
        ptdBank.deposit{value: msg.value}(token, amount);

        address pToken = getPtoken(token);
        uint pTokenAmount = IERC20(pToken).balanceOf(address(this));

        IERC20(pToken).approve(stakingPool, pTokenAmount);
        StakingReward(stakingPool).stake(pTokenAmount);
    }

    function balanceOf(address token, address account) external view override returns (uint) {
        address stakingPool = getStakingPool(token);

        uint pTokenBalance = StakingReward(stakingPool).balanceOf(account);
        uint totalTokenAmount = PtdBank(ptdBankAddr).totalToken(token);
        address pTokenAddr = getPtoken(token);
        uint pTokenTotalSupply = IERC20(pTokenAddr).totalSupply();
        uint tokenBalance = pTokenBalance.mul(totalTokenAmount).div(pTokenTotalSupply);
        return tokenBalance;
    }

    function earned(address token) external view override returns (uint256) {
        address stakingPool = getStakingPool(token);

        return StakingReward(stakingPool).earned(address(this));
    }

    function withdraw(address token, uint amount) external override {
        uint totalTokenAmount = PtdBank(ptdBankAddr).totalToken(token);
        address pTokenAddr = getPtoken(token);
        uint pTokenTotalSupply = IERC20(pTokenAddr).totalSupply();
        uint256 pAmount = (totalTokenAmount == 0 || pTokenTotalSupply == 0) ? amount: amount.mul(pTokenTotalSupply).div(totalTokenAmount);

        address stakingPool = getStakingPool(token);

        StakingReward(stakingPool).withdraw(pAmount);
        PtdBank(ptdBankAddr).withdraw(token, pAmount);
        if (token == address(0)) {//HT
            payable(owner).transfer(amount);
        } else {
            IERC20(token).transfer(owner, amount);
        }
    }

    function claimRewards(address token) external override {
        address stakingPool = getStakingPool(token);

        StakingReward(stakingPool).getReward();
        uint rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
        IERC20(_rewardsToken).transfer(owner, rewardAmount);
    }

    function isTokenSupported(address token) external override view returns (bool) {
        bool isOpen;
        bool canDeposit;
        PtdBank ptdBank = PtdBank(ptdBankAddr);
        (,,isOpen,canDeposit,,,,,,) = ptdBank.banks(token);
        return isOpen && canDeposit;
    }
 

    function getPtoken(address token) internal view returns (address) {
        PtdBank ptdBank = PtdBank(ptdBankAddr);
        address pToken;
        (,pToken,,,,,,,,) = ptdBank.banks(token);
        return pToken;
    }

    function getStakingPool(address token) internal view returns (address) {
        address stakingPool = ptdConfig.getStakingPool(token);
        require(stakingPool != address(0), "staking pool is not configured");

        return stakingPool;
    }

    receive() external payable {}
}