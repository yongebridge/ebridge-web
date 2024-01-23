import { Connector } from '@web3-react/types';
import {
  ALL_SUPPORTED_CHAIN_IDS,
  SUPPORTED_ERC_CHAIN_IDS,
  SUPPORTED_TRON_CHAIN_IDS,
  SupportedChainId,
} from 'constants/chain';
import storages from 'constants/storages';
import { eventBus } from 'utils';
import {
  coinbaseWalletConnection,
  injectedConnection,
  networkConnection,
  tronLink,
  tronLinkWalletConnection,
  walletConnectConnection,
} from 'walletConnectors';
import { isELFChain } from './aelfUtils';
import { NetworkType } from 'types';
import { ChainId } from 'types';
import { WalletConnect } from '@web3-react/walletconnect-v2';
import CommonMessage from 'components/CommonMessage';

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
  try {
    const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls, iconUrls } = info;

    const chainIdNumber = Number(info.chainId);

    if (SUPPORTED_ERC_CHAIN_IDS.includes(chainIdNumber)) {
      eventBus.emit(storages.userERCChainId, chainIdNumber);

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

      if (!provider?.request) {
        console.error("Can't setup the RPC network on metamask because window.ethereum is undefined");
        return false;
      }

      if (nativeCurrency && chainName) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainIdNumber.toString(16)}`,
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
          params: [{ chainId: `0x${chainIdNumber.toString(16)}` }],
        });
      }
    } else if (SUPPORTED_TRON_CHAIN_IDS.includes(chainIdNumber)) {
      eventBus.emit(storages.userTRCChainId, chainIdNumber);
    } else if (typeof info.chainId === 'string') {
      eventBus.emit(storages.userELFChainId, info.chainId);
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
    case tronLinkWalletConnection.connector:
    case networkConnection.connector:
      return ALL_SUPPORTED_CHAIN_IDS.includes(chainId);
    default:
      return false;
  }
}

function getChainIdFromFormattedString(item: string): number | null {
  const splitItem = item.startsWith('eip155:') ? item.split(':') : [];
  return splitItem.length > 1 && !isNaN(Number(splitItem[1])) ? Number(splitItem[1]) : null;
}
export function getSupportedChainIdsFromWalletConnectSession(session?: any): SupportedChainId[] {
  if (!session?.namespaces) return [];

  const eip155Keys = Object.keys(session.namespaces);
  const namespaces = Object.values(session.namespaces);

  // Collect all arrays into one for unified processing
  const allItems = [
    ...eip155Keys,
    ...namespaces.flatMap((namespace: any) => namespace.chains),
    ...namespaces.flatMap((namespace: any) => namespace.accounts),
  ];

  // Process all items to extract chainIds
  const allChainIds = allItems
    .map((item) => {
      if (typeof item === 'string') {
        return getChainIdFromFormattedString(item);
      }
      // Check if the item is a number
      return isNaN(Number(item)) ? null : Number(item);
    })
    .filter((item) => item !== null); // Filter out any null values

  return Array.from(new Set(allChainIds)) as SupportedChainId[];
}
export const switchChain = async (
  info: NetworkType['info'] & Info,
  connector?: Connector | string,
  isWeb3Active?: boolean,
  web3ChainId?: ChainId,
) => {
  const { chainId, chainName, nativeCurrency, rpcUrls, blockExplorerUrls, iconUrls } = info;
  if (typeof chainId === 'string') {
    eventBus.emit(storages.userELFChainId, info.chainId);
    return true;
  }
  if (!isELFChain(info.chainId) && web3ChainId === info.chainId) return;

  if (!connector || typeof connector === 'string') return;

  if (SUPPORTED_TRON_CHAIN_IDS.includes(Number(info.chainId))) {
    eventBus.emit(storages.userTRCChainId, info.chainId);

    const connector = tronLink;

    try {
      // send Tronlink transaction process
      if (!window.tronWeb) {
        throw new Error('Please Install TronLink wallet.');
      } else {
        // if tronlink is installed in chrome
        // check tronlink is connect wallet in website
        const response = await window.tronWeb.request({ method: 'tron_requestAccounts' });
        if (!response) {
          // if tronlink is not connected .....
          throw new Error('Please Unlock the TronLink wallet and switch to Nile Testnet');
        } else if (response === 200) {
          // get tronlink current chains config
          console.log('All ok');
        } else {
          // if node not correct .....
          console.log('Else ok: ', response);
          // connector.activate();
        }
      }
    } catch (err) {
      console.log(err);
    }

    return;
  } else {
    if (tronLink.customProvider?.isTronLink) {
      tronLink.resetState();
      return;
    }
  }

  if (SUPPORTED_ERC_CHAIN_IDS.includes(Number(info.chainId))) {
    eventBus.emit(storages.userERCChainId, info.chainId);
  }

  if (isWeb3Active) {
    if (!isChainAllowed(connector, chainId)) {
      throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`);
    } else if (connector === walletConnectConnection.connector) {
      if (
        !getSupportedChainIdsFromWalletConnectSession((connector as WalletConnect).provider?.session).includes(chainId)
      ) {
        CommonMessage.error(`Unsupported ${chainName} by your wallet`);
      } else {
        await connector.activate(chainId);
      }
    } else if (connector === networkConnection.connector) {
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
      // fix disconnect metamask
      if (connector === injectedConnection.connector && !window.ethereum?.selectedAddress) connector.connectEagerly?.();
    }
  } else {
    // unlink metamask
    switchNetwork(info);
  }
};
