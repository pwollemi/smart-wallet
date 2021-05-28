// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

contract PtdConfig {
    address public ptdBankAddr;
    address public rewardsToken;
    mapping(address => address) pTokenStakingPool;

    address public governance;

    modifier onlyGovernance() {
        require(msg.sender == governance, "Not governance");
        _;
    }

    constructor(address _ptdBankAddr, address _rewardsToken) public {
        ptdBankAddr = _ptdBankAddr;
        rewardsToken = _rewardsToken;
        governance = msg.sender;
    }

    function setStakingPool(address token, address stakingPool) public onlyGovernance {
        require(stakingPool != address(0), "staking pool cannot be zero");
        pTokenStakingPool[token] = stakingPool;
    }

    function getStakingPool(address token) public view returns (address) {
        return pTokenStakingPool[token];
    }

    function setGovernance(address newGov) public onlyGovernance {
        governance = newGov;
    }
}