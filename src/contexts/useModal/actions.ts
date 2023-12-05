import { basicActions } from 'contexts/utils';
import type { ChainId, ChainType, WalletType, Web3Type } from 'types';

export enum ModalActions {
  setWalletModal = 'SET_WALLET_MODAL',
  setAccountModal = 'SET_ACCOUNT_MODAL',
  setNetWorkDrawer = 'SET_NETWORK_DRAWER',
  destroy = 'DESTROY',
}

export type ModalState = {
  walletModal?: boolean;
  netWorkDrawer?: boolean;
  accountModal?: boolean;
  accountChainId?: ChainId;
  walletChainId?: ChainId;
  accountWallet?: Web3Type;
  walletWallet?: Web3Type;
  accountWalletType?: WalletType;
  walletWalletType?: WalletType;
  walletChainType?: ChainType;
};

export const basicModalView = {
  setWalletModal: (
    walletModal: boolean,
    options?: { walletWalletType?: WalletType; walletChainType?: ChainType; walletChainId?: ChainId },
  ) => {
    let obj: any = { walletModal };
    if (walletModal) {
      obj = { ...obj, ...options };
      obj.destroy = true;
    }
    return basicActions(ModalActions['setWalletModal'], obj);
  },

  setAccountModal: (accountModal: boolean, options?: { accountWalletType?: WalletType; accountChainId?: ChainId }) => {
    let obj: any = { accountModal };
    if (accountModal) {
      obj = { ...obj, ...options };
      obj.destroy = true;
    }
    return basicActions(ModalActions['setAccountModal'], obj);
  },
  setNetWorkDrawer: (netWorkDrawer: boolean) => basicActions(ModalActions['setNetWorkDrawer'], { netWorkDrawer }),
  modalDestroy: () => basicActions(ModalActions['destroy']),
};

export const { setWalletModal, setAccountModal, setNetWorkDrawer, modalDestroy } = basicModalView;
