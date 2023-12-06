import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { Actions, PortkeyContextState, PortkeyContextType, PortkeyReactProviderProps, ReducerAction } from './types';
import {
  Accounts,
  ChainId,
  ChainIds,
  MethodsBase,
  MethodsWallet,
  NetworkType,
  NotificationEvents,
} from '@portkey/provider-types';
import detectProvider from '@portkey/detect-provider';
import { evokePortkey } from '@portkey/onboarding';
const INITIAL_STATE = {
  isActive: false,
  account: undefined,
  defaultAElfBridge: undefined,
  aelfBridges: undefined,
  pubKey: undefined,
  publicKey: undefined,
};

const PortkeyContext = createContext<PortkeyContextType | undefined>(undefined);

//reducer
function reducer(state: PortkeyContextState, { type, payload }: ReducerAction) {
  switch (type) {
    case Actions.DEACTIVATE: {
      return Object.assign({}, state, INITIAL_STATE, payload);
    }
    case Actions.ACTIVATE: {
      return Object.assign({}, state, payload);
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function PortkeyReactProvider({ children, networkType: propsNetworkType }: PortkeyReactProviderProps) {
  const [state, dispatch]: [PortkeyContextState, any] = useReducer(reducer, INITIAL_STATE);
  const { provider, accounts } = state;
  const activate = useCallback(async () => {
    const installed = await evokePortkey.extension();
    if (!installed) throw Error('provider not installed');
    const provider = await detectProvider();
    if (!provider) throw Error('provider init error');
    const accounts = await provider.request({ method: MethodsBase.REQUEST_ACCOUNTS });
    const [name, networkType] = await Promise.all([
      provider.request({ method: MethodsWallet.GET_WALLET_NAME }),
      provider.request({ method: MethodsBase.NETWORK }),
    ]);
    if (networkType !== propsNetworkType) throw Error('networkType error');
    dispatch({
      type: Actions.ACTIVATE,
      payload: {
        accounts,
        name,
        provider,
        isActive: true,
      },
    });
    // return bridges;
  }, [propsNetworkType]);
  const deactivate = useCallback(async () => {
    if (!accounts) throw Error('no active connection');
    dispatch({ type: Actions.DEACTIVATE });
    return true;
  }, [accounts]);

  const connectEagerly = useCallback(async () => {
    const provider = await detectProvider();
    if (!provider) throw Error('provider init error');
    const accounts = await provider.request({ method: MethodsBase.ACCOUNTS });
    if (Object.keys(accounts).length) return activate();
    throw Error('Can‘t Connect Eagerly');
  }, [activate]);

  const accountsChanged = useCallback((accounts: Accounts) => {
    dispatch({
      type: Actions.CHANGE,
      payload: { accounts },
    });
  }, []);
  const chainChanged = useCallback((chainIds: ChainIds) => {
    dispatch({
      type: Actions.CHANGE,
      payload: { chainIds },
    });
  }, []);
  const networkChanged = useCallback(
    async (networkType: NetworkType) => {
      if (networkType !== propsNetworkType) {
        deactivate();
      }
    },
    [deactivate, propsNetworkType],
  );
  const connected = useCallback(async () => {
    if (!provider) return;
    const [accounts, name, networkType] = await Promise.all([
      provider.request({ method: MethodsBase.ACCOUNTS }),
      provider.request({ method: MethodsWallet.GET_WALLET_NAME }),
      provider.request({ method: MethodsBase.NETWORK }),
    ]);
    if (networkType !== propsNetworkType) return;
    dispatch({
      type: Actions.ACTIVATE,
      payload: {
        accounts,
        name,
        provider,
        isActive: true,
      },
    });
  }, [propsNetworkType, provider]);
  const disconnected = useCallback(() => {
    try {
      deactivate();
      connectEagerly();
    } catch (error) {
      console.log(error, '====error');
    }
  }, [connectEagerly, deactivate]);
  const initListener = useCallback(() => {
    if (!provider) return;
    provider.on(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider.on(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider.on(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider.on(NotificationEvents.CONNECTED, connected);
    provider.on(NotificationEvents.DISCONNECTED, disconnected);
  }, [accountsChanged, chainChanged, connected, disconnected, networkChanged, provider]);
  const removeListener = useCallback(() => {
    if (!provider) return;
    provider.removeListener(NotificationEvents.ACCOUNTS_CHANGED, accountsChanged);
    provider.removeListener(NotificationEvents.CHAIN_CHANGED, chainChanged);
    provider.removeListener(NotificationEvents.NETWORK_CHANGED, networkChanged);
    provider.removeListener(NotificationEvents.CONNECTED, connected);
    provider.removeListener(NotificationEvents.DISCONNECTED, disconnected);
  }, [accountsChanged, chainChanged, connected, disconnected, networkChanged, provider]);
  const checkWalletConnect = useCallback(
    async (chainId: ChainId) => {
      if (!provider) {
        return false;
      }
      const syncStatus = await provider.request({
        method: MethodsWallet.GET_WALLET_MANAGER_SYNC_STATUS,
        payload: { chainId },
      });

      return syncStatus;
    },
    [provider],
  );
  useEffect(() => {
    if (!provider) return;
    initListener();
    return () => {
      removeListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initListener, provider, removeListener]);
  return useMemo(
    () => (
      <PortkeyContext.Provider value={{ ...state, activate, deactivate, connectEagerly, checkWalletConnect } as any}>
        {children}
      </PortkeyContext.Provider>
    ),
    [state, activate, deactivate, connectEagerly, checkWalletConnect, children],
  );
}

export function usePortkeyReact() {
  const context = useContext(PortkeyContext);
  if (!context) throw Error('usePortkeyReact can only be used within the PortkeyReactProvider component');
  return context;
}
