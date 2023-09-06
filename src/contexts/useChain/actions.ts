import { basicActions } from 'contexts/utils';
import { WalletType } from 'types';
import { ConnectionType } from 'walletConnectors';

export declare type ChainState = {
  userERCChainId?: number;
  userELFChainId?: string;
  selectERCWallet?: ConnectionType;
  aelfType?: WalletType;
};

export enum ChainActions {
  setSelectERCWallet = 'SET_SELECT_ERC_WALLET',
  setAELFType = 'SET_AELF_TYPE',
  default = 'DEFAULT',
  destroy = 'DESTROY',
}

export const useChainView = {
  setSelectERCWallet: (selectERCWallet?: ConnectionType) => basicActions(ChainActions['default'], { selectERCWallet }),
  setUserERCChainId: (userERCChainId: string) => basicActions(ChainActions['default'], { userERCChainId }),
  setUserELFChainId: (userELFChainId: string) => basicActions(ChainActions['default'], { userELFChainId }),
  setAELFType: (aelfType?: WalletType) => basicActions(ChainActions['setAELFType'], { aelfType }),
  chainProviderDestroy: () => basicActions(ChainActions['destroy']),
};

export const { setSelectERCWallet, setUserERCChainId, setUserELFChainId, chainProviderDestroy, setAELFType } =
  useChainView;
