import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { SupportedChainId } from 'constants/chain';
import { Connector } from '@web3-react/types';
import * as MAINNET from 'constants/platform/main';
import * as BSC_TESTNET from 'constants/platform/BSC_Test';
import * as SEPOLIA from 'constants/platform/sepolia';
import * as BSC from 'constants/platform/BSC';
import { DEFAULT_ERC_CHAIN } from 'constants/index';
export const NETWORK_URLS: { [key: number]: string } = {
  [SupportedChainId.MAINNET]: MAINNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.BSC_MAINNET]: BSC.CHAIN_INFO.rpcUrl,
  [SupportedChainId.BSC_TESTNET]: BSC_TESTNET.CHAIN_INFO.rpcUrl,
  [SupportedChainId.SEPOLIA]: SEPOLIA.CHAIN_INFO.rpcUrl,
};
export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
}
export interface Connection {
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
}

export const BACKFILLABLE_WALLETS = [
  ConnectionType.COINBASE_WALLET,
  ConnectionType.WALLET_CONNECT,
  ConnectionType.INJECTED,
];
function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}
export const [injected, injectedHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions, onError }));
export const injectedConnection: Connection = {
  connector: injected,
  hooks: injectedHooks,
  type: ConnectionType.INJECTED,
};
export const [network, networkHooks] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: NETWORK_URLS, defaultChainId: DEFAULT_ERC_CHAIN }),
);
export const networkConnection: Connection = {
  connector: network,
  hooks: networkHooks,
  type: ConnectionType.NETWORK,
};
export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect({
      actions,
      options: {
        rpcMap: NETWORK_URLS,
        projectId: '5c5740c548328b21cf14472d580f3e2a',
        showQrModal: true,
        chains: [1],
      },
      onError,
    }),
);
export const walletConnectConnection: Connection = {
  connector: walletConnect,
  hooks: walletConnectHooks,
  type: ConnectionType.WALLET_CONNECT,
};
export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  (actions) =>
    new CoinbaseWallet({
      actions,
      options: {
        url: NETWORK_URLS[DEFAULT_ERC_CHAIN],
        appName: process.env.NEXT_PUBLIC_PREFIX || 'appName',
        reloadOnDisconnect: false,
      },
      onError,
    }),
);

export const coinbaseWalletConnection: Connection = {
  connector: coinbaseWallet,
  hooks: coinbaseWalletHooks,
  type: ConnectionType.COINBASE_WALLET,
};
