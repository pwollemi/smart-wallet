// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "../../interfaces/IStrategy.sol";
import "./BeltConfig.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BeltStrategy is IStrategy {
    uint256 public constant N_COINS = 4;

    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    MasterOrbit public masterOrbit;
    Depositor public depositor;
    BeltConfig public beltConfig;
    BeltLP public beltLP;
    uint256 private poolId;
    address private lpToken;
    address private _rewardsToken;

    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "unsupported token");
        _;
    }

    constructor(BeltConfig _beltConfig, address _owner) public {
        beltConfig = _beltConfig;

        masterOrbit = MasterOrbit(beltConfig.masterOrbit());
        beltLP = BeltLP(beltConfig.beltLP());
        depositor = Depositor(beltConfig.depositor());

        poolId = beltConfig.lpTokenPoolId();
        lpToken = beltConfig.lpToken();
        _rewardsToken = beltConfig.rewardsToken();
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
        require(msg.value == 0, "HT is not supported");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 lpTokenAmount;
        if (token == lpToken) {
            lpTokenAmount = amount;
        } else {
            BeltConfig.Coin memory coin = getTokenInfo(token);

            uint256[N_COINS] memory uamounts;
            uamounts[coin.index] = amount;

            // max slippage is 1%
            uint256 min_mint_amount = beltLP
            .calc_token_amount(uamounts, true)
            .mul(99)
            .div(100);

            IERC20(token).approve(address(depositor), amount);
            depositor.add_liquidity(uamounts, min_mint_amount);
            lpTokenAmount = IERC20(lpToken).balanceOf(address(this));
        }

        IERC20(lpToken).approve(address(masterOrbit), lpTokenAmount);
        masterOrbit.deposit(poolId, lpTokenAmount);
    }

    function balanceOf(address token, address account)
        external
        view
        override
        returns (uint256)
    {
        uint256 lpTokenAmount = masterOrbit.stakedWantTokens(poolId, account);
        if (token == lpToken) {
            return lpTokenAmount;
        } else {
            BeltConfig.Coin memory coin = getTokenInfo(token);
            return
                depositor.calc_withdraw_one_coin(
                    lpTokenAmount,
                    int128(coin.index)
                );
        }
    }

    function earned(address token) external view override returns (uint256) {
        require(_isTokenSupported(token), "unsupported token");
        uint256 rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
        return masterOrbit.pendingBELT(poolId, address(this)).add(rewardAmount);
    }

    function withdraw(address token, uint256 amount)
        external
        override
        onlyOwner
    {
        if (token == lpToken) {
            masterOrbit.withdraw(poolId, amount);
            IERC20(token).safeTransfer(owner, amount);
        } else {
            BeltConfig.Coin memory coin = getTokenInfo(token);

            uint256[N_COINS] memory uamounts;
            uamounts[coin.index] = amount;
            uint256 lpTokenAmount = beltLP.calc_token_amount(uamounts, false);
            uint256 max_burn_amount = lpTokenAmount.mul(100).div(99);

            masterOrbit.withdraw(poolId, lpTokenAmount);
            IERC20(lpToken).approve(address(depositor), lpTokenAmount);
            depositor.remove_liquidity_imbalance(uamounts, max_burn_amount);

            uint256 realAmount = IERC20(token).balanceOf(address(this));
            IERC20(token).safeTransfer(owner, realAmount);
        }
    }

    function claimRewards(address token) external override onlyOwner {
        require(_isTokenSupported(token), "token is not supported");
        masterOrbit.withdraw(poolId, 0);
        uint256 rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
        IERC20(_rewardsToken).safeTransfer(owner, rewardAmount);
    }

    function isTokenSupported(address token)
        external
        view
        override
        returns (bool)
    {
        return _isTokenSupported(token);
    }

    function getTokenInfo(address token)
        internal
        view
        returns (BeltConfig.Coin memory)
    {
        (uint256 index, address coin) = beltConfig.coins(token);
        require(coin != address(0), "unsupported token");

        return BeltConfig.Coin(index, coin);
    }

    function _isTokenSupported(address token) internal view returns (bool) {
        (, address coin) = beltConfig.coins(token);
        return token == lpToken || coin != address(0);
    }
}
