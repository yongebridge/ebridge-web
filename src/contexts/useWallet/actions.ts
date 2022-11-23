import { basicActions } from 'contexts/utils';
import type { ChainId, ChainType, Web3Type } from 'types';

export type Options = {
  chainType: ChainType;
  chainId?: ChainId;
};

export enum walletActions {
  setFromWallet = 'SET_FROM_WALLET',
  setToWallet = 'SET_TO_WALLET',
  changeWallet = 'CHANGE_WALLET',
  changeEnd = 'CHANGE_END',
  destroy = 'DESTROY',
}

export type modalState = {
  fromWallet?: Web3Type;
  toWallet?: Web3Type;
  fromOptions?: Options;
  toOptions?: Options;
  changing?: boolean;
  isHomogeneous?: boolean;
};

export const basicWalletActions = {
  setFromWallet: (options: Options) => basicActions(walletActions['setFromWallet'], { fromOptions: options }),
  setToWallet: (options: Options) => basicActions(walletActions['setToWallet'], { toOptions: options }),
  changeWallet: () => basicActions(walletActions.changeWallet),
  changeEnd: () => basicActions(walletActions.changeEnd),
  web3ProviderDestroy: () => basicActions(walletActions['destroy']),
};

export const { setFromWallet, setToWallet, web3ProviderDestroy, changeWallet, changeEnd } = basicWalletActions;
