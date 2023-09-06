import React, { Dispatch, createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

import { IPortkeyProvider, Accounts, ChainIds, NetworkType, ProviderError, ChainId } from '@portkey/provider-types';

import { isPortkeyAPP } from 'utils/isMobile';
import { ProtkeyContextState, ReducerAction, Actions, CallContractParams } from './types';
import { getPortInstants } from './utils';

export interface PortkeyProviderProps {
  children?: React.ReactNode;
}
// const E_networkType = 'testnet';

const INITIAL_STATE: ProtkeyContextState = {
  provider: undefined,
  accounts: undefined,
  chain: undefined,
  isPortkey: false,
  isActive: false,
  account: '',
};

const PortkeyContext = createContext<any>(INITIAL_STATE);

function reducer(state: ProtkeyContextState, { type, payload }: ReducerAction) {
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

export default function PortkeyProvider({ children }: PortkeyProviderProps) {
  const [state, dispatch]: [ProtkeyContextState, Dispatch<ReducerAction>] = useReducer(reducer, INITIAL_STATE);

  const { provider, chainId, account } = state;

  const activate = useCallback(async (): Promise<IPortkeyProvider> => {
    if (provider?.isConnected()) {
      return provider;
    }

    let newProvider: IPortkeyProvider | null;
    try {
      newProvider = await getPortInstants();
      console.log('newProvider: ', newProvider);
    } catch (error) {
      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          isActive: false,
        },
      });
      throw error;
    }

    if (!newProvider || !newProvider.isPortkey) {
      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          isActive: false,
        },
      });
      throw new Error('Discover provider not found');
    }

    dispatch({
      type: Actions.ACTIVATE,
      payload: {
        provider: newProvider,
        isActive: false,
      },
    });

    return newProvider;
  }, [provider]);

  const onAccountsSuccess = useCallback(
    async (provider: IPortkeyProvider, accounts: Accounts) => {
      if (!chainId || !accounts) {
        return;
      }
      const newAccount = accounts[chainId]?.[0];
      dispatch({
        type: Actions.ACTIVATE,
        payload: {
          ...state,
          account: newAccount,
        },
      });
    },
    [chainId, state],
  );

  const onAccountsFail = useCallback(() => {
    dispatch({
      type: Actions.ACTIVATE,
      payload: {
        isActive: false,
      },
    });
  }, []);

  const loginEagerly = useCallback(async () => {
    try {
      const provider = await activate();
      const network = await provider.request({ method: 'network' });
      // if (network !== getConfig().networkType) {
      //   onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
      //   return;
      // }
      const accounts = await provider.request({ method: 'accounts' });

      onAccountsSuccess(provider, accounts);
    } catch (error: any) {
      onAccountsFail();
    }
  }, [activate, onAccountsFail, onAccountsSuccess]);

  const login = useCallback(async () => {
    try {
      const provider = await activate();
      const network = await provider.request({ method: 'network' });
      // if (network !== getConfig().networkType) {
      //   onAccountsFail(makeError(ERR_CODE.NETWORK_TYPE_NOT_MATCH));
      //   return;
      // }
      const accounts = await provider.request({ method: 'accounts' });

      onAccountsSuccess(provider, accounts);
    } catch (error) {
      onAccountsFail();
      console.error(error);
    }
  }, [activate, onAccountsFail, onAccountsSuccess]);

  const logout = useCallback(async () => {
    dispatch({
      type: Actions.ACTIVATE,
      payload: {
        isActive: false,
      },
    });
  }, []);

  const logoutSilently = useCallback(async () => {
    // try {
    //   localStorage.removeItem(LOGIN_EARGLY_KEY);
    // } catch (e) {
    //   console.warn(e);
    // }
    // setDiscoverInfo(undefined);
  }, []);

  const callContract = useCallback(
    async function callContractFunc<T, R>(params: CallContractParams<T>): Promise<R> {
      if (!provider) {
        throw new Error('Discover not connected');
      }

      const chain = await provider.getChain(chainId as ChainId);
      const contract = chain.getContract(params.contractAddress);
      const result = contract.callSendMethod(params.methodName, account, params.args);
      return result as R;
    },
    [account, chainId, provider],
  );

  useEffect(() => {
    if (provider) {
      const onDisconnected = (error: ProviderError) => {
        provider && logout();
      };
      const onNetworkChanged = (networkType: NetworkType) => {
        // if (networkType !== getConfig().networkType) {
        //   eventEmitter.emit(WebLoginEvents.NETWORK_MISMATCH, networkType);
        //   if (options.autoLogoutOnNetworkMismatch) {
        //     logout();
        //   }
        // }
      };
      // provider.request({method:'accounts'})
      const onAccountsChanged = (accounts: Accounts) => {
        if (!provider || !chainId) return;
        if (
          !accounts[chainId] ||
          accounts[chainId]?.length === 0 ||
          accounts[chainId]?.find((addr) => addr !== account)
        ) {
          logout();
        }
      };
      const onChainChanged = (chainIds: ChainIds) => {
        if (chainIds.find((id) => id === chainId)) {
          logout();
        }
      };
      provider.on('disconnected', onDisconnected);
      provider.on('networkChanged', onNetworkChanged);
      provider.on('accountsChanged', onAccountsChanged);
      provider.on('chainChanged', onChainChanged);
      return () => {
        provider.removeListener('disconnected', onDisconnected);
        provider.removeListener('networkChanged', onNetworkChanged);
        provider.removeListener('networkChanged', onAccountsChanged);
        provider.removeListener('chainChanged', onChainChanged);
      };
    }
  }, [chainId, provider, logout, account]);

  useEffect(() => {
    if (isPortkeyAPP()) {
      activate();
    }
  }, []);

  return useMemo(
    () => (
      <PortkeyContext.Provider
        value={{
          ...state,
          loginEagerly,
          login,
          logout,
          logoutSilently,
          callContract,
        }}>
        {children}
      </PortkeyContext.Provider>
    ),
    [callContract, children, login, loginEagerly, logout, logoutSilently, state],
  );
}

export function useProtkeyContext() {
  return useContext(PortkeyContext);
}
