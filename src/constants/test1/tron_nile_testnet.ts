import { SupportedChainId } from '../chain';

export const CHAIN_INFO = {
  chainId: SupportedChainId.TRON_NILE_TESTNET,
  exploreUrl: 'https://nile.tronscan.org/',
  rpcUrl: 'https://api.nileex.io',
  chainName: 'TRON Nile Testnet',
  nativeCurrency: {
    name: 'TRON Nile Testnet Native Token',
    symbol: 'nTRX',
    decimals: 8,
  },
  iconUrls: ['https://etherscan.io/token/images/trontrx_32.png'],
  rpcUrls: ['https://api.nileex.io'],
  blockExplorerUrls: ['https://nile.tronscan.org/'],
};

export const BRIDGE_CONTRACT = 'TYTsC2AkpV8giLncnHm2Ewe7Stb8Jyk7Mz'; // TODO
export const BRIDGE_CONTRACT_OUT = 'TN8krCz8qExXLx9etEmWnwtciYzpU2Q7nX'; // TODO
export const LIMIT_CONTRACT = 'TVXadiU5PhDzzKZgc7u7SkX8kii7bgjDrG'; // TODO
