import { basicActions } from 'contexts/utils';
import { ConnectionType } from 'walletConnectors';

export declare type ChainState = {
  userERCChainId?: number;
  userELFChainId?: string;
  selectERCWallet?: ConnectionType;
};

export enum ChainActions {
  setSelectERCWallet = 'SET_SELECT_ERC_WALLET',
  default = 'DEFAULT',
  destroy = 'DESTROY',
}

export const useChainView = {
  setSelectERCWallet: (selectERCWallet?: ConnectionType) => basicActions(ChainActions['default'], { selectERCWallet }),
  setUserERCChainId: (userERCChainId: string) => basicActions(ChainActions['default'], { userERCChainId }),
  setUserELFChainId: (userELFChainId: string) => basicActions(ChainActions['default'], { userELFChainId }),
  chainProviderDestroy: () => basicActions(ChainActions['destroy']),
};

export const { setSelectERCWallet, setUserERCChainId, setUserELFChainId, chainProviderDestroy } = useChainView;
