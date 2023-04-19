export const CHAIN_INFO = {
  chainId: 'AELF',
  exploreUrl: 'https://explorer-test.aelf.io/',
  rpcUrl: 'https://aelf-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';
export const CROSS_CHAIN_CONTRACT = '2SQ9LeGZYSWmfJcYuQkDQxgd3HzwjamAaaL4Tge2eFSXw2cseq';
export const BRIDGE_CONTRACT = 'fPSqRCNMVfig7PH25D22mjc1bZ77z9n4ChVunrZm5CH96UUzP';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
