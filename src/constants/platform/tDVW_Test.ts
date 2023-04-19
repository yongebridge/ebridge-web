export const CHAIN_INFO = {
  chainId: 'tDVW',
  exploreUrl: 'https://explorer-test-side02.aelf.io/',
  rpcUrl: 'https://tdvw-test-node.aelf.io',
};

export const TOKEN_CONTRACT = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
export const CROSS_CHAIN_CONTRACT = '2PC7Jhb5V6iZXxz8uQUWvWubYkAoCVhtRGSL7VhTWX85R8DBuN';
export const BRIDGE_CONTRACT = '2DhjPbJKLrs2jqf8EnNeBBz4C8wb8QHXhUyLy5T5Jdd4sCgXDj';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
