import { useAElfReact } from '@aelf-react/core';
import { useWeb3React } from '@web3-react/core';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { AElfNodes } from 'constants/aelf';
import { Web3Type } from 'types';
import { useChain, useChainDispatch } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN } from 'constants/index';
import { message } from 'antd';
import { usePortkeyReact } from 'contexts/usePortkey/provider';
import { ChainId } from '@portkey/provider-types';
import { getELFAddress } from 'utils/aelfUtils';
import { setSelectELFWallet } from 'contexts/useChain/actions';
export function useAEflConnect() {
  const { activate, connectEagerly } = useAElfReact();
  const chainDispatch = useChainDispatch();

  return useCallback(
    async (isConnectEagerly?: boolean) => {
      try {
        const bridges = await (isConnectEagerly ? connectEagerly : activate)(AElfNodes);
        if (bridges) {
          const status = await Promise.all(
            Object.values(bridges).map((i) => {
              if (!i.connect) return i.chain.getChainStatus();
            }),
          );
          status
            .filter((i) => !!i)
            .forEach((i, k) => {
              if (i && i.error) message.error(`${Object.keys(bridges)[k]} getChainStatus error`);
            });
        }
        chainDispatch(setSelectELFWallet('NIGHTELF'));
      } catch (error: any) {
        let message = error?.message || error;
        if (Array.isArray(error)) message = error[0]?.errorMessage || error[0];
        message = typeof message === 'string' ? message : JSON.stringify(message);
        throw Error(message);
      }
    },
    [activate, chainDispatch, connectEagerly],
  );
}

export function usePortkeyConnect() {
  const { activate, connectEagerly } = usePortkeyReact();
  const chainDispatch = useChainDispatch();
  return useCallback(
    async (isConnectEagerly?: boolean) => {
      await (isConnectEagerly ? connectEagerly : activate)();
      chainDispatch(setSelectELFWallet('PORTKEY'));
    },
    [activate, chainDispatch, connectEagerly],
  );
}
// useActiveWeb3React contains all attributes of useWeb3React and aelf combination
export function useWeb3(): Web3Type {
  const web3React = useWeb3React();
  const [{ userERCChainId }] = useChain();
  const tmpContext = useMemo(() => {
    const contextNetwork: Web3Type = { ...web3React };
    if (!web3React.account) {
      if (typeof window === 'object') {
        contextNetwork.chainId = DEFAULT_ERC_CHAIN;
        const chainId = ZERO.plus(window.ethereum?.chainId ?? '');
        if (!chainId.isNaN()) {
          contextNetwork.chainId = chainId.toNumber();
        } else if (userERCChainId) {
          contextNetwork.chainId = userERCChainId;
        }
      }
      const provider = getProvider(contextNetwork.chainId);
      if (provider) {
        contextNetwork.library = provider;
        contextNetwork.provider = { provider } as any;
      }
      return contextNetwork;
    } else {
      contextNetwork.walletType = 'ERC';
      contextNetwork.library = contextNetwork.provider?.provider;
    }
    return contextNetwork;
  }, [web3React, userERCChainId]);
  return tmpContext;
}

// useActiveWeb3React contains all attributes of useWeb3React and aelf combination
export function useAElf(): Web3Type {
  const aelfReact = useAElfReact();
  const [{ userELFChainId }] = useChain();
  const chainId = userELFChainId;
  const tmpContext = useMemo(() => {
    const contextNetwork: any = {
      ...aelfReact,
      aelfInstance: aelfReact.defaultAElfBridge,
      aelfInstances: aelfReact.aelfBridges as Web3Type['aelfInstances'],
    };
    if (chainId && ACTIVE_CHAIN[chainId] && aelfReact.aelfBridges) {
      contextNetwork.aelfInstance = aelfReact.aelfBridges[chainId];
      contextNetwork.walletType = 'NIGHTELF';
    }
    return {
      ...contextNetwork,
      library: undefined,
      provider: undefined,
      connector: aelfReact.account ? 'NIGHT ELF' : undefined,
    };
  }, [aelfReact, chainId]);
  return tmpContext;
}

export function usePortkey() {
  const portkeyReact = usePortkeyReact();
  const [{ userELFChainId }] = useChain();
  const chainId = userELFChainId;
  const tmpContext = useMemo(() => {
    const contextNetwork: any = {
      ...portkeyReact,
    };
    const chainAccounts = portkeyReact?.accounts?.[chainId as ChainId];

    if (chainId && ACTIVE_CHAIN[chainId] && chainAccounts?.[0] && portkeyReact.isActive) {
      contextNetwork.account = getELFAddress(chainAccounts?.[0]);
      contextNetwork.isPortkey = true;
      contextNetwork.walletType = 'PORTKEY';
    }
    return {
      ...contextNetwork,
      library: undefined,
      provider: undefined,
      connector: contextNetwork.account ? 'PORTKEY' : undefined,
    };
  }, [chainId, portkeyReact]);
  return tmpContext;
}
