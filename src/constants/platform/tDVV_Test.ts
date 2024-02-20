export const CHAIN_INFO = {
  chainId: 'tDVV',
  exploreUrl: 'https://explorer-test.aelf.io/',
  rpcUrl: 'https://tdvw-test-node.aelf.io',
};
export const TOKEN_CONTRACT = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
export const CROSS_CHAIN_CONTRACT = '2PC7Jhb5V6iZXxz8uQUWvWubYkAoCVhtRGSL7VhTWX85R8DBuN';
export const BRIDGE_CONTRACT = '2V2WnBaQg6G8VGmPa3hU6MNuJj31MAupwvxHRbULS3WgsJdDjG';

const EXPAND_CONTRACTS: any = {};
[TOKEN_CONTRACT].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});

export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
