import { DEFAULT_MODAL_INITIAL_STATE } from 'constants/index';
import storages from 'constants/storages';
import { BasicActions } from 'contexts/utils';
import useStorageReducer, { StorageOptions } from 'hooks/useStorageReducer';
import { useAElf, usePortkey, useWeb3 } from 'hooks/web3';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { isELFChain } from 'utils/aelfUtils';
import { WalletActions, ModalState, setToWallet } from './actions';
import { getWalletByOptions, isChange } from './utils';
import { useChain } from 'contexts/useChain';
import { usePrevious } from 'react-use';
import { Web3Type } from 'types';

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
  key: storages.useWallet + process.env.NEXT_PUBLIC_APP_ENV,
};
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [ModalState, BasicActions<WalletActions>['dispatch']] = useStorageReducer(
    reducer,
    INITIAL_STATE,
    options,
  );
  const { fromOptions, toOptions } = state;
  const [{ aelfType }] = useChain();
  const preAelfType = usePrevious(aelfType);

  const aelfWallet = useAElf();
  const web3Wallet = useWeb3();
  const portkeyWallet = usePortkey();

  const [fromWallet, toWallet]: [Web3Type, Web3Type] = useMemo(
    () => [
      getWalletByOptions(aelfWallet, web3Wallet, portkeyWallet, fromOptions, aelfType),
      getWalletByOptions(aelfWallet, web3Wallet, portkeyWallet, toOptions, aelfType),
    ],
    [aelfWallet, web3Wallet, portkeyWallet, fromOptions, aelfType, toOptions],
  );

  const preFromWallet = usePrevious(fromWallet);

  useEffect(() => {
    if (aelfType === 'PORTKEY' && aelfType !== preAelfType && fromOptions?.chainType === toOptions?.chainType) {
      dispatch(setToWallet({ chainType: 'ERC' }));
    }
  }, [
    aelfType,
    dispatch,
    fromOptions?.chainType,
    fromWallet.walletType,
    preAelfType,
    preFromWallet?.walletType,
    toOptions?.chainType,
  ]);

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
