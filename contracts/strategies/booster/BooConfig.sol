// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";

interface ISafeBox {
    function bank() external view returns (address);

    function token() external view returns (address);

    function deposit(uint256 _value) external;

    function withdraw(uint256 _value) external;

    function getSource() external view returns (string memory);

    function getBaseTokenPerLPToken() external view returns (uint256);

    function actionPoolFilda() external view returns (address);

    function actionPoolRewards() external view returns (address);
}

interface ITenBankHall {
    function boxesLength() external view returns (uint256);

    function boxInfo(uint256 _index) external view returns (address);
}

interface IBooPools {
    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;

    function claim(uint256 _pid) external returns (uint256);

    function poolLength() external view returns (uint256);

    function getATPoolInfo(uint256 _pid)
        external
        view
        returns (
            address lpToken,
            uint256 allocRate,
            uint256 totalAmount
        );

    function userInfo(uint256 _pid, address account)
        external
        view
        returns (
            uint256 amount,
            uint256 rewardDebt,
            uint256 rewardRemain
        );

    function pendingRewards(uint256 _pid, address _user)
        external
        view
        returns (uint256 value);
}

interface IActionPools {
    function claim(uint256 _pid) external returns (uint256);

    /**
     * @notice Get pool info in action pools
     * @dev This is used only for Filda and Can rewards
     * @param _pid Pool Id
     * @return callFrom is BooPools, callId is pid in BooPools, rewardToken is Can or Filda
     */
    function getPoolInfo(uint256 _pid)
        external
        view
        returns (
            address callFrom,
            uint256 callId,
            address rewardToken
        );

    function getPoolIndex(address _callFrom, uint256 _callId)
        external
        view
        returns (uint256[] memory);

    function poolLength() external view returns (uint256);

    function pendingRewards(uint256 _pid, address _user)
        external
        view
        returns (uint256 value);
}

contract BooConfig {
    struct PoolInfo {
        address safeBox;
        uint256 booPoolId;
        address actionPool;
        uint256 actionPoolId;
    }

    address public constant FILDA_TOKEN =
        0xE36FFD17B2661EB57144cEaEf942D95295E637F0;
    address public constant CAN_TOKEN =
        0x1e6395E6B059fc97a4ddA925b6c5ebf19E05c69f;
    address public constant BOO_TOKEN =
        0xff96dccf2763D512B6038Dc60b7E96d1A9142507;

    string public source;
    address public booBank;
    address public booPools;
    mapping(address => PoolInfo) public poolInfo;

    address public governance;

    modifier onlyGovernance() {
        require(msg.sender == governance, "Not governance");
        _;
    }

    constructor(
        address _booBank,
        address _booPools,
        string memory _source
    ) public {
        governance = msg.sender;

        source = _source;
        booBank = _booBank;
        booPools = _booPools;
        _initSafeBox();
        _initBooPools();
    }

    function rewardsToken() external view returns (address) {
        return BOO_TOKEN;
    }

    function rewardsToken2() external view returns (address) {
        return _compareStrings(source, "filda") ? FILDA_TOKEN : CAN_TOKEN;
    }

    function getPoolInfo(address token)
        external
        view
        returns (
            address safeBox,
            uint256 booPid,
            address actionPool,
            uint256 actionPid
        )
    {
        PoolInfo memory p = poolInfo[token];
        return (p.safeBox, p.booPoolId, p.actionPool, p.actionPoolId);
    }

    function setAddresses(address _booBank, address _booPools)
        public
        onlyGovernance
    {
        booBank = _booBank;
        booPools = _booPools;
        _initSafeBox();
        _initBooPools();
    }

    function setGovernance(address newGov) public onlyGovernance {
        governance = newGov;
    }

    function _initSafeBox() internal {
        uint256 boxesLength = ITenBankHall(booBank).boxesLength();
        for (uint256 i = 0; i < boxesLength; i++) {
            address safeBox = ITenBankHall(booBank).boxInfo(i);
            string memory safeBoxSource = ISafeBox(safeBox).getSource();
            if (!_compareStrings(safeBoxSource, source)) continue;

            address token = ISafeBox(safeBox).token();
            address actionPool = _compareStrings(source, "filda")
                ? ISafeBox(safeBox).actionPoolFilda()
                : ISafeBox(safeBox).actionPoolRewards();
            uint256 actionPid = _getActionPoolId(safeBox, actionPool);

            poolInfo[token].safeBox = safeBox;
            poolInfo[token].actionPool = actionPool;
            poolInfo[token].actionPoolId = actionPid;
        }
    }

    function _initBooPools() internal {
        uint256 poolLength = IBooPools(booPools).poolLength();
        for (uint256 i = 0; i < poolLength; i++) {
            (address bToken, , ) = IBooPools(booPools).getATPoolInfo(i);

            try ISafeBox(bToken).getSource() returns (
                string memory safeBoxSource
            ) {
                if (_compareStrings(safeBoxSource, source)) {
                    address token = ISafeBox(bToken).token();
                    poolInfo[token].booPoolId = i;
                }
            } catch {
                // LP token(pair)
            }
        }
    }

    function _getActionPoolId(address safeBox, address actionPool)
        internal
        view
        returns (uint256)
    {
        uint256 poolLength = IActionPools(actionPool).poolLength();
        for (uint256 i = 0; i < poolLength; i++) {
            (, uint256 pid, ) = IActionPools(actionPool).getPoolInfo(i);
            (address lpToken, , ) = IBooPools(booPools).getATPoolInfo(pid);
            if (lpToken == safeBox) return i;
        }
        revert("action pool doesn't support this token");
    }

    function _compareStrings(string memory a, string memory b)
        internal
        view
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }
}
