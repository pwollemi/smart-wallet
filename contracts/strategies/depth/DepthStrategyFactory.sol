// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "../../interfaces/IStrategyFactory.sol";
import "../../interfaces/IStrategy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DepthConfig.sol";
import "./DepthStrategy.sol";

contract DepthStrategyFactory is IStrategyFactory, Ownable {
    DepthConfig public depthConfig;

    constructor(DepthConfig _depthConfig) public {
        depthConfig = _depthConfig;
    }

    function newStrategy() external override returns (IStrategy) {
        return new DepthStrategy(depthConfig, msg.sender);
    }

    function setDepthConfig(address _depthConfig) external onlyOwner {
        depthConfig = DepthConfig(_depthConfig);
    }
}
