// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

interface IDepthVault {
    function deposit(uint256 amount) external payable;

    function withdraw(uint256 pAmount) external;
}

interface IPiggyBreeder {
    function stake(uint256 _pid, uint256 _amount) external;

    function unStake(uint256 _pid, uint256 _amount) external;

    function claim(uint256 _pid) external;

    function pendingPiggy(uint256 _pid, address _user)
        external
        view
        returns (uint256);

    function poolInfo(uint256 _pid)
        external
        view
        returns (
            address lpToken,
            uint256 allocPoint,
            uint256 lastRewardBlock,
            uint256 accPiggyPerShare,
            uint256 totalDeposit,
            address migrator
        );

    function poolLength() external view returns (uint256);

    function userInfo(uint256 _pid, address _user)
        external
        view
        returns (
            uint256 amount,
            uint256 rewardDebt,
            uint256 pendingReward,
            bool unStakeBeforeEnableClaim
        );

    function DEP() external view returns (address);
}

contract DepthConfig {
    struct VaultInfo {
        address vault;
        uint256 pid;
    }

    mapping(address => VaultInfo) public vaultInfo;
    address public rewardsToken;
    address public piggyBreeder;

    address public governance;

    modifier onlyGovernance() {
        require(msg.sender == governance, "Not governance");
        _;
    }

    constructor(address _piggyBreeder, address _rewardsToken) public {
        piggyBreeder = _piggyBreeder;
        rewardsToken = _rewardsToken;
        governance = msg.sender;
    }

    function setVault(
        address token,
        address _vault,
        uint256 _pid
    ) public onlyGovernance {
        require(_vault != address(0), "vault cannot be zero");
        vaultInfo[token].vault = _vault;
        vaultInfo[token].pid = _pid;
    }

    function getVaultInfo(address token)
        public
        view
        returns (address vault, uint256 pid)
    {
        return (vaultInfo[token].vault, vaultInfo[token].pid);
    }

    function setGovernance(address newGov) public onlyGovernance {
        governance = newGov;
    }
}
