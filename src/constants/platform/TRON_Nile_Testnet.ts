import { SupportedChainId } from '../chain';

export const CHAIN_INFO = {
  chainId: SupportedChainId.TRON_NILE_TESTNET,
  exploreUrl: 'https://nile.tronscan.org/',
  rpcUrl: 'https://nile.trongrid.io',
  chainName: 'TRON Nile Testnet',
  nativeCurrency: {
    name: 'TRON Nile Testnet Native Token',
    symbol: 'nTRX',
    decimals: 8,
  },
  iconUrls: ['https://etherscan.io/token/images/trontrx_32.png'],
  rpcUrls: ['https://nile.trongrid.io'],
  blockExplorerUrls: ['https://nile.tronscan.org/'],
};
export const BRIDGE_CONTRACT = 'TAyJxS7ATKCp9iVzms1wPGg3iXV9p51SGe'; // TODO
export const BRIDGE_CONTRACT_OUT = 'TQGdZkonWomNTxPskkUX3f19kB5W3yJeuS'; // TODO
export const LIMIT_CONTRACT = 'TEAr3Cg1YXX1GaXFcbzsVWtXnjsZZ4yX9m'; // TODO
