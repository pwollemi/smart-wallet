// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// interface ISafeBox {
//     function bank() external view returns (address);

//     function token() external view returns (address);

//     function deposit(uint256 _value) external;

//     function withdraw(uint256 _value) external;
// }

// interface ITenBankHall {
//     function boxesLength() external view returns (uint256);

//     function boxInfo(uint256 _index) external view returns (address);
// }

// interface IBooPools {
//     function deposit(uint256 _pid, uint256 _amount) external;

//     function withdraw(uint256 _pid, uint256 _amount) external;

//     function claim(uint256 _pid) public returns (uint256);

//     function poolLength() external view returns (uint256);

//     function getATPoolInfo(uint256 _pid)
//         external
//         view
//         returns (
//             address,
//             uint256,
//             uint256
//         );
// }

// interface IActionPools {
//     function claim(uint256 _pid) public returns (uint256);

//     function getPoolInfo(uint256 _pid)
//         external
//         view
//         returns (
//             address,
//             uint256,
//             address
//         );

//     function getPoolIndex(address _callFrom, uint256 _callId)
//         external
//         view
//         returns (uint256[] memory);
// }

// contract BooConfig {
//     ITenBankHall public booBank;
//     IBooPools public booPools;
//     IActionPools public actionPools;

//     mapping(address => address) public getBToken; // underlying asset => bToken
//     mapping(address => uint256) public getPoolId;

//     address public governance;

//     modifier onlyGovernance() {
//         require(msg.sender == governance, "Not governance");
//         _;
//     }

//     constructor(
//         address _booBank,
//         address _booPools,
//         address _actionPools
//     ) public {
//         booBank = ITenBankHall(_booBank);
//         booPools = IBooPools(_booPools);
//         actionPools = IActionPools(_actionPools);
//         governance = msg.sender;

//         initializeInfo();
//     }

//     function initializeInfo() public onlyGovernance {
//         // initialize SafeBox map
//         uint256 boxesLength = booBank.boxesLength();
//         for (uint256 i = 0; i < boxesLength; i++) {
//             ISafeBox safeBox_ = ISafeBox(booBank.boxInfo(i));
//             address token_ = safeBox_.token();
//             getBToken[token_] = safeBox_;
//         }

//         // initialize BooPools
//         uint256 poolLength = booPools.poolLength();
//         for (uint256 i = 0; i < poolLength; i++) {
//             (address lpToken, , ) = booPools.getATPoolInfo(i);
//             getPoolId[lpToken] = i;
//         }
//     }

//     function setGovernance(address newGov) public onlyGovernance {
//         governance = newGov;
//     }
// }
