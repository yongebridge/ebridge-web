import { DEFAULT_MODAL_INITIAL_STATE } from 'constants/index';
import storages from 'constants/storages';
import { BasicActions } from 'contexts/utils';
import useStorageReducer, { StorageOptions } from 'hooks/useStorageReducer';
import { useAElf, useWeb3 } from 'hooks/web3';
import React, { createContext, useContext, useMemo } from 'react';
import { isELFChain } from 'utils/aelfUtils';
import { WalletActions, ModalState } from './actions';
import { getWalletByOptions, isChange } from './utils';

const INITIAL_STATE = DEFAULT_MODAL_INITIAL_STATE as ModalState;
const ModalContext = createContext<any>(INITIAL_STATE);

export function useWalletContext(): [ModalState, BasicActions<WalletActions>] {
  return useContext(ModalContext);
}

//reducer
function reducer(state: ModalState, { type, payload }: { type: WalletActions; payload: any }) {
  switch (type) {
    case WalletActions.destroy: {
      return {};
    }
    case WalletActions.changeWallet: {
      const { fromOptions, toOptions } = state;
      return Object.assign({}, state, { fromOptions: toOptions, toOptions: fromOptions, changing: true });
    }
    case WalletActions.changeEnd: {
      return Object.assign({}, state, { changing: false });
    }
    case WalletActions.setFromWallet: {
      const { toOptions, fromOptions } = state;
      const newState: ModalState = { ...payload };
      if (isChange(toOptions, payload.fromOptions)) newState.toOptions = fromOptions;
      return Object.assign({}, state, newState);
    }
    case WalletActions.setToWallet: {
      const { toOptions, fromOptions } = state;
      const newState: ModalState = { ...payload };
      if (isChange(fromOptions, payload.toOptions)) newState.fromOptions = toOptions;
      return Object.assign({}, state, newState);
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

const options: StorageOptions = {
  key: storages.useWallet,
};
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [ModalState, BasicActions<WalletActions>['dispatch']] = useStorageReducer(
    reducer,
    INITIAL_STATE,
    options,
  );
  const { fromOptions, toOptions } = state;
  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();
  const [fromWallet, toWallet] = useMemo(
    () => [
      getWalletByOptions(aelfWallet, web3Wallet, fromOptions),
      getWalletByOptions(aelfWallet, web3Wallet, toOptions),
    ],
    [aelfWallet, fromOptions, toOptions, web3Wallet],
  );
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  const isHomogeneous = useMemo(
    () => isELFChain(fromWallet?.chainId) && isELFChain(toWallet?.chainId),
    [fromWallet?.chainId, toWallet?.chainId],
  );
  return (
    <ModalContext.Provider
      value={useMemo(
        () => [{ ...state, fromWallet, toWallet, isHomogeneous }, actions],
        [state, fromWallet, toWallet, isHomogeneous, actions],
      )}>
      {children}
    </ModalContext.Provider>
  );
}
