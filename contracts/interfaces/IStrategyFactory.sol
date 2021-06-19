// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "./IStrategy.sol";

interface IStrategyFactory {
    function newStrategy() external returns (IStrategy);
}
