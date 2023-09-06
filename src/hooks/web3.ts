import { useAElfReact } from '@aelf-react/core';
import { useWeb3React } from '@web3-react/core';
import { useProtkeyContext } from 'contexts/usePortkey';
import { ZERO } from 'constants/misc';
import { useCallback, useMemo } from 'react';
import { getProvider } from 'utils/provider';
import { AElfNodes } from 'constants/aelf';
import { Web3Type } from 'types';
import { useChain } from 'contexts/useChain';
import { ACTIVE_CHAIN, DEFAULT_ERC_CHAIN } from 'constants/index';
import { message } from 'antd';
export function useAEflConnect() {
  const { activate, connectEagerly } = useAElfReact();
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
      } catch (error: any) {
        let message = error?.message || error;
        if (Array.isArray(error)) message = error[0]?.errorMessage || error[0];
        message = typeof message === 'string' ? message : JSON.stringify(message);
        throw Error(message);
      }
    },
    [activate, connectEagerly],
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

export function usePortkeyConnect() {
  const { activate, connectEagerly } = useProtkeyContext();

  return useCallback(
    async (isConnectEagerly?: boolean) => {
      try {
        await (isConnectEagerly ? connectEagerly : activate)();
      } catch (error: any) {
        let message = error?.message || error;
        if (Array.isArray(error)) message = error[0]?.errorMessage || error[0];
        message = typeof message === 'string' ? message : JSON.stringify(message);
        throw Error(message);
      }
    },
    [activate, connectEagerly],
  );
}

export function usePortkey() {
  const portkeyContext = useProtkeyContext();
  // const [{ userELFChainId }] = useChain();
  // const chainId = userELFChainId;

  const tmpContext = useMemo(() => {
    return {
      ...portkeyContext,
    };
  }, [portkeyContext]);

  return tmpContext;
}
