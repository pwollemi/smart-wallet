
const tokens = {
    HT: {
        name: "HT",
        address: "0x0000000000000000000000000000000000000000",
        p_name: "pHT",
        p_address: "0xBE36E5f7226A328dC1Fa899D8FfeC1ea216B8c98"
    },
    USDT: {
        name: "USDT",
        address: "0xa71EdC38d189767582C38A3145b5873052c3e47a",
        p_name: "pUSDT",
        p_address: "0x38C499dd2a14Af3b695901bcEC76961008BBC227"
    },
    HBTC: {
        name: "HBTC",
        address: "0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa",
        p_name: "pHBTC",
        p_address: "0xf0ff90029518909414914EF70de6E8E85bCBEba4"
    },
    ETH: {
        name: "ETH",
        address: "0x64FF637fB478863B7468bc97D30a5bF3A428a1fD",
        p_name: "pETH",
        p_address: "0xf05e64d5b8b292000310655b4771e8cdbc696561"
    },
    MDX: {
        name: "MDX",
        address: "0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c",
        p_name: "pMDX",
        p_address: "0x21aaf2b4973e8f437e45941b093b4149ab2513a6"
    },
    HPT: {
        name: "HPT",
        address: "0xE499Ef4616993730CEd0f31FA2703B92B50bB536",
        p_name: "pHPT",
        p_address: "0x0a07e9fa14a84406e75ce78ac814fdc106f00a97"
    },
    HUSD: {
        name: "HUSD",
        address: "0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047",
        p_name: "pHUSD",
        p_address: "0x4d9efcb0c28522ff736e76a6c6b1f795882b3d74",
        x_address: "0xfd52a2ab38dd92e61a615fc1c40c2e841a4e8579",
        isProxy: !0,
        proxy: "0x5Ee5Dbce6e1a7d0692DA579cC2594B0F5a8f56a1"
    },
    BXH: {
        name: "BXH",
        address: "0xcBD6Cb9243d8e3381Fea611EF023e17D1B7AeDF0",
        p_name: "pBXH",
        p_address: "0x1af70b655d5F98E23a8D3AAE0115281745c034b6"
    },
    TRIBE: {
        name: "TRIBE",
        address: "0x38999Fa3a7320bD2c3609BF0f8cB5CD4C11D3Fe1",
        p_name: "pTRIBE",
        p_address: "0x431DBFad034De73f6f054C096F360fBD26ff380c"
    },
    HDOT: {
        name: "HDOT",
        address: "0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3",
        p_name: "pHDOT",
        p_address: "0x72d4751991983b561aa0e8003ba2e3eb07e9999c"
    },
    HLTC: {
        name: "HLTC",
        address: "0xecb56cf772B5c9A6907FB7d32387Da2fCbfB63b4",
        p_name: "pHLTC",
        p_address: "0xb8e9af54758bfdf0c686998ad59860268266db73"
    },
    HOO: {
        name: "HOO",
        address: "0xE1d1F66215998786110Ba0102ef558b22224C016",
        p_name: "pHOO",
        p_address: "0xa34a54eb50d85dcf8222762dc0ebdf16ee2b1bdf",
        x_address: "0x44dc70809dc1c98412bfaab618ac618043b91dbd",
        isProxy: !0,
        proxy: "0x818e4bf4Fe379224f8ec69AC75BE9c355981709A"
    },
    TPT: {
        name: "TPT",
        address: "0x9ef1918a9beE17054B35108bD3E2665e2Af1Bb1b",
        p_name: "pTPT",
        p_address: "0x2D51B5cFE6595E40F7F427751ecb010496494F2A",
        x_address: "0x7db0b76e2592c9f91d8f6b4680a0f2c16577941c",
        isProxy: !0,
        proxy: "0x0cfdb03a4fa480b2017a78a292b56cadf6f55e8e"
    },
    PIPI: {
        name: "PIPI",
        address: "0xaaae746b5e55d14398879312660e9fde07fbc1dc",
        p_name: "pPIPI",
        p_address: "0x2206ceabceb3c66a0f008595dd67763114c94007"
    },
    DOGE: {
        name: "DOGE",
        address: "0x40280e26a572745b1152a54d1d44f365daa51618",
        p_name: "pDOGE",
        p_address: "0x6835d6ea3F9a0DC5CbB213CbD51Fb25E771fab34",
        x_address: "0x3aE5A6d6A3ABAe054A446140C4e591D772199f05",
        isProxy: !0,
        proxy: "0xd1268284b04ea8526271c8b93ac1eabc69248bea"
    },
    HFIL: {
        name: "HFIL",
        address: "0xae3a768f9ab104c69a7cd6041fe16ffa235d1810",
        p_name: "pHFIL",
        p_address: "0xac3d06492ffee53628e2d28f883fad2dbcac939f"
    }
  };
  const poolList = [{
      id: "pHT",
      address: "0xBE36E5f7226A328dC1Fa899D8FfeC1ea216B8c98",
      symbol: "pHT",
      decimals: 18,
      mainAddress: "0x82fBD740824B4A3d699BA9d676A5443f350b59ab",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pUSDT",
      address: "0x38C499dd2a14Af3b695901bcEC76961008BBC227",
      symbol: "pUSDT",
      decimals: 18,
      mainAddress: "0x70Be80d70083eB2BB088D95ef274a1B88e6598Ac",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHBTC",
      address: "0xf0ff90029518909414914EF70de6E8E85bCBEba4",
      symbol: "pHBTC",
      decimals: 18,
      mainAddress: "0x86ffc35a3cd6f03A96558783fFA2e08C9D01cf05",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pETH",
      address: "0xf05e64d5b8b292000310655b4771e8cdbc696561",
      symbol: "pETH",
      decimals: 18,
      mainAddress: "0x02e31AbB76b643126B4ADd8b38010B074A7E3E64",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pMDX",
      address: "0x21aaf2b4973e8f437e45941b093b4149ab2513a6",
      symbol: "pMDX",
      decimals: 18,
      mainAddress: "0xBd693f82fD7b13A390C383e4870743CAC52adF0B",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHPT",
      address: "0x0a07e9fa14a84406e75ce78ac814fdc106f00a97",
      symbol: "pHPT",
      decimals: 18,
      mainAddress: "0x0a7a576fbe70a3E825d5271498Cc1F1fd812d84b",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHUSD",
      address: "0x4d9efcb0c28522ff736e76a6c6b1f795882b3d74",
      symbol: "pHUSD",
      decimals: 18,
      mainAddress: "0xe2e67a79EAf02f627CbEce42C256AD9024f642Fc",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pMDX v2",
      address: "0x21aaf2b4973e8f437e45941b093b4149ab2513a6",
      symbol: "pMDX",
      decimals: 18,
      mainAddress: "0x2fb0487dc92e6e769f85ee159b4cc7468ce2d86f",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pBXH",
      address: "0x1af70b655d5F98E23a8D3AAE0115281745c034b6",
      symbol: "pBXH",
      decimals: 18,
      mainAddress: "0x9Cf5A1FCc879175F54251d42944507bD02aa0fC9",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pUSDT v2",
      address: "0x38C499dd2a14Af3b695901bcEC76961008BBC227",
      symbol: "pUSDT",
      decimals: 18,
      mainAddress: "0x3a5B6EcD6174731E5D781794613E0f2F52eDbDD0",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHUSD v2",
      address: "0x4d9efcb0c28522ff736e76a6c6b1f795882b3d74",
      symbol: "pHUSD",
      decimals: 18,
      mainAddress: "0x28789379debc7b32892d6a5a0446ba355cfd56e5",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pTRIBE",
      address: "0x431DBFad034De73f6f054C096F360fBD26ff380c",
      symbol: "pTRIBE",
      decimals: 18,
      mainAddress: "0xd692182b5b33714846ae72e72270474e90615b53",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHDOT",
      address: "0x72d4751991983b561aa0e8003ba2e3eb07e9999c",
      symbol: "pHDOT",
      decimals: 18,
      mainAddress: "0x9CF14E13bAE5E22810915d573D795E0775085E19",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHLTC",
      address: "0xb8e9af54758bfdf0c686998ad59860268266db73",
      symbol: "pHLTC",
      decimals: 18,
      mainAddress: "0x239354b34ee43c38a7422fb68db3734717305a8d",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHOO",
      address: "0xa34a54eb50d85dcf8222762dc0ebdf16ee2b1bdf",
      symbol: "pHOO",
      decimals: 18,
      mainAddress: "0xa037aE53983B5e3aD533B1a68D8D8576a8B58498",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pTPT",
      address: "0x2D51B5cFE6595E40F7F427751ecb010496494F2A",
      symbol: "pTPT",
      decimals: 18,
      mainAddress: "0x519DeC16Dd0072Fc549d532C10887922Ea5B6350",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pPIPI",
      address: "0x2206ceabceb3c66a0f008595dd67763114c94007",
      symbol: "pPIPI",
      decimals: 18,
      mainAddress: "0xddddd7c8f58517d95c15bb558bb984d92f939d5e",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHT v2",
      address: "0xBE36E5f7226A328dC1Fa899D8FfeC1ea216B8c98",
      symbol: "pHT",
      decimals: 18,
      mainAddress: "0x15f342232657208a17d09c99bb7a758165145d7b",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pBXH v2",
      address: "0x1af70b655d5F98E23a8D3AAE0115281745c034b6",
      symbol: "pBXH",
      decimals: 18,
      mainAddress: "0xd51bcdc241b0a836b938b43217a99a39bf7eeb48",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pPIPI v2",
      address: "0x2206ceabceb3c66a0f008595dd67763114c94007",
      symbol: "pPIPI",
      decimals: 18,
      mainAddress: "0x5ff38fff658f48548abb7aa49700b03a00a5107a",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pMDX v3",
      address: "0x21aaf2b4973e8f437e45941b093b4149ab2513a6",
      symbol: "pMDX",
      decimals: 18,
      mainAddress: "0xbabde12175ef7a8fd330ee52c3225f9c5507c17f",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHT v3",
      address: "0xBE36E5f7226A328dC1Fa899D8FfeC1ea216B8c98",
      symbol: "pHT",
      decimals: 18,
      mainAddress: "0xC9cdB55911E7758e3852Af4f65C85A8d330DBF02",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pDOGE",
      address: "0x6835d6ea3F9a0DC5CbB213CbD51Fb25E771fab34",
      symbol: "pDOGE",
      decimals: 18,
      mainAddress: "0x5d282f9ddd574af263380937feab759b11ba9758",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }, {
      id: "pHFIL",
      address: "0xac3d06492ffee53628e2d28f883fad2dbcac939f",
      symbol: "pHFIL",
      decimals: 18,
      mainAddress: "0x8417d867d77ad31e10b56a20984f0e89bd67d224",
      rewardsAddress: "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2",
      rewardsSymbol: "PTD",
  }];

const ptdBankAddr = "0xD42Ef222d33E3cB771DdA783f48885e15c9D5CeD";
const PTD = "0x52ee54dd7a68e9cf131b0a57fd6015c74d7140e2";
  
function stakingPoolInfo() {
    // v2 has higher index in pool list
    const pAddressToPool = {};
    for (let i = 0; i < poolList.length; i++) {
        pAddressToPool[poolList[i].address] = poolList[i].mainAddress;
    }

    const tokenToPool = {};
    for (let symbol in tokens) {
        tokenToPool[tokens[symbol].address] = pAddressToPool[tokens[symbol].p_address];
    }
    return tokenToPool;
}

module.exports = {
    stakingPoolInfo,
    ptdBankAddr,
    PTD
}