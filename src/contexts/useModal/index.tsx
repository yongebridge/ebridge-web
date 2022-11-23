import { BasicActions } from 'contexts/utils';
import { useAElf, useWeb3 } from 'hooks/web3';
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { modalActions, modalState } from './actions';

const INITIAL_STATE = {};
const ModalContext = createContext<any>(INITIAL_STATE);

export function useModal(): [modalState, BasicActions<modalActions>] {
  return useContext(ModalContext);
}

//reducer
function reducer(state: modalState, { type, payload }: { type: modalActions; payload: any }) {
  switch (type) {
    case modalActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [modalState, BasicActions<modalActions>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const { walletChainId, accountChainId } = state;
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();
  const [walletWallet, accountWallet] = useMemo(() => {
    const walletWallet = typeof walletChainId === 'string' ? aelfWallet : web3Wallet;
    if (!walletWallet.chainId) walletWallet.chainId = walletChainId;
    const accountWallet = typeof accountChainId === 'string' ? aelfWallet : web3Wallet;
    if (!accountWallet.chainId) accountWallet.chainId = accountChainId;
    return [walletWallet, accountWallet];
  }, [accountChainId, aelfWallet, walletChainId, web3Wallet]);
  return (
    <ModalContext.Provider
      value={useMemo(
        () => [{ ...state, walletWallet, accountWallet }, actions],
        [state, walletWallet, accountWallet, actions],
      )}>
      {children}
    </ModalContext.Provider>
  );
}
