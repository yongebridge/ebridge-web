import { Connector } from '@web3-react/types';
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chain';
import storages from 'constants/storages';
import { eventBus } from 'utils';
import {
  coinbaseWalletConnection,
  injectedConnection,
  networkConnection,
  walletConnectConnection,
} from 'walletConnectors';

type Info = {
  chainId: number | string;
  rpcUrls?: string[];
  chainName?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};
/**
 * Prompt the user to add RPC as a network on Metamask, or switch to RPC if the wallet is on a different network
 * @returns {boolean} true if the setup succeeded, false otherwise
 */
export const switchNetwork = async (info: Info): Promise<boolean> => {
  let provider = window.ethereum;
  try {
    if (provider?.providerMap) {
      for (const [key, value] of provider.providerMap) {
        if (key === 'MetaMask' && value?.isMetaMask) provider = value;
      }
    }
  } catch (error) {
    console.log(error, '======error');
  }

  const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls, iconUrls } = info;
  if (typeof info.chainId === 'string') {
    eventBus.emit(storages.userELFChainId, info.chainId);
    return true;
  }
  eventBus.emit(storages.userERCChainId, info.chainId);
  if (!provider?.request) {
    console.error("Can't setup the RPC network on metamask because window.ethereum is undefined");
    return false;
  }
  try {
    if (nativeCurrency && chainName) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName,
            nativeCurrency,
            rpcUrls,
            iconUrls,
            blockExplorerUrls,
          },
        ],
      });
    } else {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    }
    return true;
  } catch (error) {
    console.error('switchNetwork', error);
    return false;
  }
};
export function isChainAllowed(connector: Connector, chainId: number) {
  switch (connector) {
    case injectedConnection.connector:
    case coinbaseWalletConnection.connector:
    case walletConnectConnection.connector:
    case networkConnection.connector:
      return ALL_SUPPORTED_CHAIN_IDS.includes(chainId);
    default:
      return false;
  }
}
export const switchChain = async (info: Info, connector?: Connector | string, isActive?: boolean) => {
  const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls, iconUrls } = info;
  if (typeof chainId === 'string') {
    eventBus.emit(storages.userELFChainId, info.chainId);
    return true;
  }
  eventBus.emit(storages.userERCChainId, info.chainId);
  if (!connector || typeof connector === 'string') return;
  if (isActive) {
    if (!isChainAllowed(connector, chainId)) {
      throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`);
    } else if (connector === walletConnectConnection.connector || connector === networkConnection.connector) {
      await connector.activate(chainId);
    } else {
      const addChainParameter = {
        chainId: chainId.toString(16),
        chainName,
        nativeCurrency,
        rpcUrls,
        iconUrls,
        blockExplorerUrls,
      };
      await connector.activate(addChainParameter);
    }
  } else {
    // unlink metamask
    switchNetwork(info);
  }
};
