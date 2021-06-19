// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

// import "../../interfaces/IStrategyFactory.sol";
// import "../../interfaces/IStrategy.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./BooConfig.sol";
// import "./BooStrategy.sol";

// contract BooStrategyFactory is IStrategyFactory, Ownable {
//     BooConfig public booConfig;

//     constructor(BooConfig _booConfig) public {
//         booConfig = _booConfig;
//     }

//     function newStrategy() external override returns (IStrategy) {
//         return new BooStrategy(booConfig, msg.sender);
//     }

//     function setBooConfig(address _booConfig) external onlyOwner {
//         booConfig = PtdConfig(_booConfig);
//     }
// }
