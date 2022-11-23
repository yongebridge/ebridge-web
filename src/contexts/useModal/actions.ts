import { basicActions } from 'contexts/utils';
import type { ChainId, Web3Type } from 'types';

export enum modalActions {
  setWalletModal = 'SET_WALLET_MODAL',
  setAccountModal = 'SET_ACCOUNT_MODAL',
  setNetWorkDrawer = 'SET_NETWORK_DRAWER',
  destroy = 'DESTROY',
}

export type modalState = {
  walletModal?: boolean;
  netWorkDrawer?: boolean;
  accountModal?: boolean;
  accountChainId?: ChainId;
  walletChainId?: ChainId;
  accountWallet?: Web3Type;
  walletWallet?: Web3Type;
};

export const basicModalView = {
  setWalletModal: (walletModal: boolean, walletChainId?: ChainId) => {
    const obj: any = { walletModal };
    if (walletChainId) {
      obj.walletChainId = walletChainId;
      obj.destroy = true;
    }
    return basicActions(modalActions['setWalletModal'], obj);
  },

  setAccountModal: (accountModal: boolean, accountChainId?: ChainId) => {
    const obj: any = { accountModal };
    if (accountChainId) {
      obj.accountChainId = accountChainId;
      obj.destroy = true;
    }
    return basicActions(modalActions['setAccountModal'], obj);
  },
  setNetWorkDrawer: (netWorkDrawer: boolean) => basicActions(modalActions['setNetWorkDrawer'], { netWorkDrawer }),
  modalDestroy: () => basicActions(modalActions['destroy']),
};

export const { setWalletModal, setAccountModal, setNetWorkDrawer, modalDestroy } = basicModalView;
