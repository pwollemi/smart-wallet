// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

// import "../../interfaces/IStrategy.sol";
// import "./BooConfig.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

// contract BooStrategy is IStrategy {
//     using SafeERC20 for IERC20;
//     using SafeMath for uint256;

//     address public actionPoolsAddr;
//     address private _rewardsToken;
//     BooConfig public booConfig;

//     address public owner;

//     constructor(BooConfig _booConfig, address _owner) public {
//         actionPoolsAddr = _booConfig.actionPools();
//         _rewardsToken = _booConfig.rewardsToken();
//         booConfig = _booConfig;
//         owner = _owner;
//     }

//     function rewardsToken() external view override returns (address) {
//         return _rewardsToken;
//     }

//     function deposit(address token, uint256 amount) external payable override {
//         PtdBank ptdBank = PtdBank(ptdBankAddr);
//         address stakingPool = getStakingPool(token);

//         if (token == address(0)) {
//             //HT
//             amount = msg.value;
//         } else {
//             IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
//             IERC20(token).approve(ptdBankAddr, amount);
//         }
//         ptdBank.deposit{value: msg.value}(token, amount);

//         address pToken = getPtoken(token);
//         uint256 pTokenAmount = IERC20(pToken).balanceOf(address(this));

//         IERC20(pToken).approve(stakingPool, pTokenAmount);
//         StakingReward(stakingPool).stake(pTokenAmount);
//     }

//     function balanceOf(address token, address account)
//         external
//         view
//         override
//         returns (uint256)
//     {
//         address stakingPool = getStakingPool(token);

//         uint256 pTokenBalance = StakingReward(stakingPool).balanceOf(account);
//         uint256 totalTokenAmount = PtdBank(ptdBankAddr).totalToken(token);
//         address pTokenAddr = getPtoken(token);
//         uint256 pTokenTotalSupply = IERC20(pTokenAddr).totalSupply();
//         uint256 tokenBalance =
//             pTokenBalance.mul(totalTokenAmount).div(pTokenTotalSupply);
//         return tokenBalance;
//     }

//     function earned(address token) external view override returns (uint256) {
//         address stakingPool = getStakingPool(token);

//         return StakingReward(stakingPool).earned(address(this));
//     }

//     function withdraw(address token, uint256 amount) external override {
//         uint256 totalTokenAmount = PtdBank(ptdBankAddr).totalToken(token);
//         address pTokenAddr = getPtoken(token);
//         uint256 pTokenTotalSupply = IERC20(pTokenAddr).totalSupply();
//         uint256 pAmount =
//             (totalTokenAmount == 0 || pTokenTotalSupply == 0)
//                 ? amount
//                 : amount.mul(pTokenTotalSupply).div(totalTokenAmount);

//         address stakingPool = getStakingPool(token);

//         StakingReward(stakingPool).withdraw(pAmount);
//         PtdBank(ptdBankAddr).withdraw(token, pAmount);
//         if (token == address(0)) {
//             //HT
//             payable(owner).transfer(amount);
//         } else {
//             IERC20(token).transfer(owner, amount);
//         }
//     }

//     function claimRewards(address token) external override {
//         address stakingPool = getStakingPool(token);

//         StakingReward(stakingPool).getReward();
//         uint256 rewardAmount = IERC20(_rewardsToken).balanceOf(address(this));
//         IERC20(_rewardsToken).transfer(owner, rewardAmount);
//     }

//     function isTokenSupported(address token)
//         external
//         view
//         override
//         returns (bool)
//     {
//         bool isOpen;
//         bool canDeposit;
//         PtdBank ptdBank = PtdBank(ptdBankAddr);
//         (, , isOpen, canDeposit, , , , , , ) = ptdBank.banks(token);
//         return isOpen && canDeposit;
//     }

//     function getPtoken(address token) internal view returns (address) {
//         // PtdBank ptdBank = PtdBank(ptdBankAddr);
//         // address pToken;
//         // (, pToken, , , , , , , , ) = ptdBank.banks(token);
//         // return pToken;
//     }

//     function getStakingPool(address token) internal view returns (address) {
//         // address stakingPool = booConfig.getStakingPool(token);
//         // require(stakingPool != address(0), "staking pool is not configured");
//         // return stakingPool;
//     }

//     receive() external payable {}
// }
