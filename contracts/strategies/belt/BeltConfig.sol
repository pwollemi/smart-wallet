// SPDX-License-Identifier: MIT

pragma solidity ^0.6.9;

interface BeltLP {
    function pool_token() external view returns (address);

    function add_liquidity(uint256[4] memory amounts, uint256 min_mint_amount)
        external;

    function remove_liquidity_imbalance(
        uint256[4] memory amounts,
        uint256 max_burn_amount
    ) external;

    function remove_liquidity(uint256 _amount, uint256[4] memory min_amounts)
        external;

    function balances(int128 i) external view returns (uint256);

    function calc_token_amount(uint256[4] memory amounts, bool deposit)
        external
        view
        returns (uint256 amount);

    function get_virtual_price() external view returns (uint256);
}

interface Depositor {
    function beltLP() external view returns (address);

    function token() external view returns (address);

    function coins(int128 index) external view returns (address);

    function underlying_coins(int128 index) external view returns (address);

    function calc_withdraw_one_coin(uint256 _token_amount, int128 i)
        external
        view
        returns (uint256 amount);

    function add_liquidity(uint256[4] memory uamounts, uint256 min_mint_amount)
        external;

    function remove_liquidity(uint256 _amount, uint256[4] memory min_uamounts)
        external;

    function remove_liquidity_imbalance(
        uint256[4] memory uamounts,
        uint256 max_burn_amount
    ) external;
}

interface MasterOrbit {
    function BELT() external view returns (address);

    function pendingBELT(uint256 _pid, address _user)
        external
        view
        returns (uint256 amount);

    function deposit(uint256 _pid, uint256 _wantAmt) external;

    function withdraw(uint256 _pid, uint256 _wantAmt) external;

    function stakedWantTokens(uint256 _pid, address _user)
        external
        view
        returns (uint256 amount);

    function poolInfo(uint256 _pid)
        external
        view
        returns (
            address want,
            uint256 allocPoint,
            uint256 lastMined,
            uint256 accBELTPerShare,
            address strat
        );
}

contract BeltConfig {
    uint256 public constant N_COINS = 4;

    struct Coin {
        uint256 index;
        address token;
    }

    address public masterOrbit;
    uint256 public lpTokenPoolId;
    address public governance;
    address public depositor;
    address public beltLP;
    address public lpToken; // 4BELT token
    address public rewardsToken; // HBELT token
    mapping(address => Coin) public coins; // underlying_coin => Coin(index, coin)

    modifier onlyGovernance() {
        require(msg.sender == governance, "Not governance");
        _;
    }

    constructor(
        address _depositor,
        address _masterOrbit,
        uint256 _lpTokenPoolId
    ) public {
        _setDepositor(_depositor);
        _setMasterOrbit(_masterOrbit);
        _setLPTokenPoolId(_lpTokenPoolId);
        governance = msg.sender;
    }

    function setDepositor(address _depositor) public onlyGovernance {
        _setDepositor(_depositor);
    }

    function setMasterOrbit(address _masterOrbit) public onlyGovernance {
        _setMasterOrbit(_masterOrbit);
    }

    function setLPTokenPoolId(uint256 _lpTokenPoolId) public onlyGovernance {
        _setLPTokenPoolId(_lpTokenPoolId);
    }

    function setGovernance(address newGov) public onlyGovernance {
        governance = newGov;
    }

    function _setDepositor(address _depositor) internal {
        depositor = _depositor;

        beltLP = Depositor(_depositor).beltLP();
        lpToken = Depositor(_depositor).token();

        for (uint256 i = 0; i < N_COINS; i++) {
            address coin_ = Depositor(_depositor).coins(int128(i));
            address underlyingCoin_ =
                Depositor(_depositor).underlying_coins(int128(i));
            coins[underlyingCoin_].index = i;
            coins[underlyingCoin_].token = coin_;
        }
    }

    function _setMasterOrbit(address _masterOrbit) internal {
        masterOrbit = _masterOrbit;
        rewardsToken = MasterOrbit(_masterOrbit).BELT();
    }

    function _setLPTokenPoolId(uint256 _lpTokenPoolId) internal {
        lpTokenPoolId = _lpTokenPoolId;
    }
}
