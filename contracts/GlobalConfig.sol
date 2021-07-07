// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Config contract shared by all smart wallet contracts
 */
contract GlobalConfig is Ownable {
    uint256 public feeRatio;
    // each prod (such as ptd) has one strategyFactory to create strategy
    mapping(string => address) public tokenStrategyFactory;

    event NewStrategyFactory(string, address);

    function getStrategyFactory(string calldata productName)
        external
        view
        returns (address)
    {
        return tokenStrategyFactory[productName];
    }

    function setStrategyFactory(
        string calldata productName,
        address strategyFactory
    ) external onlyOwner {
        require(strategyFactory != address(0), "GlobalConfig: zero address");

        tokenStrategyFactory[productName] = strategyFactory;

        emit NewStrategyFactory(productName, strategyFactory);
    }

    function setFeeRatio(uint256 _feeRatio) external onlyOwner {
        feeRatio = _feeRatio;
    }
}
