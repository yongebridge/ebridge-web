import { SupportedELFChainId } from '../chain';

export const CHAIN_INFO = {
  chainId: SupportedELFChainId.AELF,
  exploreUrl: 'https://explorer-test.aelf.io/',
  rpcUrl: 'https://aelf-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';
export const CROSS_CHAIN_CONTRACT = '2SQ9LeGZYSWmfJcYuQkDQxgd3HzwjamAaaL4Tge2eFSXw2cseq';
export const BRIDGE_CONTRACT = '2eKvgivaCmqPXhkvpS2UVo2qpYskPzFVSYsw6s93jTa9kUh44h';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
