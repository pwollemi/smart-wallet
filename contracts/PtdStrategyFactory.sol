// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "./IStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PtdConfig.sol";
import "./PtdStrategy.sol";
import "./IStrategyFactory.sol";

contract PtdStrategyFactory is IStrategyFactory, Ownable {
    PtdConfig public ptdConfig;

    constructor(PtdConfig _ptdConfig) public {
        ptdConfig = _ptdConfig;
    }

    function newStrategy() external override returns (IStrategy) {
        return new PtdStrategy(ptdConfig, msg.sender);
    }

    function setPtdConfig(address _ptdConfig) external onlyOwner {
        ptdConfig = PtdConfig(_ptdConfig);
    }
}