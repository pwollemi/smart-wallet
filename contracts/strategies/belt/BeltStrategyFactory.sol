// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "../../interfaces/IStrategyFactory.sol";
import "../../interfaces/IStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BeltConfig.sol";
import "./BeltStrategy.sol";

contract BeltStrategyFactory is IStrategyFactory, Ownable {
    BeltConfig public beltConfig;

    constructor(BeltConfig _beltConfig) public {
        beltConfig = _beltConfig;
    }

    function newStrategy() external override returns (IStrategy) {
        return new BeltStrategy(beltConfig, msg.sender);
    }

    function setBeltConfig(address _beltConfig) external onlyOwner {
        beltConfig = BeltConfig(_beltConfig);
    }
}
