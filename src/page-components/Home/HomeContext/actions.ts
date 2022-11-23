import { basicActions } from 'contexts/utils';
import { CurrentWhitelistItem } from 'hooks/whitelist';
import { CrossChainItem } from 'types/api';
import BigNumber from 'bignumber.js';
import { TokenInfo } from 'types';

export enum homeActions {
  setSelectModal = 'SET_SELECT_TOKEN_MODAL',
  setAddModal = 'SET_ACCOUNT_MODAL',
  setNetWorkDrawer = 'SET_NETWORK_DRAWER',
  setSelectToken = 'SET_SELECT_TOKEN',
  setFrom = 'SET_FROM',
  setTo = 'SET_TO',
  setToChecked = 'SET_TO_CHECKED',
  setToAddress = 'SET_TO_ADDRESS',
  setReceiveList = 'SET_RECEIVE_LIST',
  setReceiveId = 'SET_RECEIVE_ID',
  setActionLoading = 'SET_ACTION_LOADING',
  destroy = 'DESTROY',
  default = 'DEFAULT',
  destroyModal = 'DESTROY_MODAL',
  destroyState = 'DESTROY_STATE',
}

export type homeState = {
  selectModal?: boolean;
  addModal?: boolean;
  selectToken?: CurrentWhitelistItem;
  fromInput?: string;
  toInput?: string;
  toChecked?: boolean;
  toAddress?: string;
  receiveList?: CrossChainItem[];
  receiveId?: string;
  receiveItem?: CrossChainItem;
  receivedList?: string[];
  fromBalance?: { balance: BigNumber; show: BigNumber; token: TokenInfo };
  actionLoading?: boolean;
  crossMin?: number;
};

export const DestroyModal = {
  selectModal: undefined,
  addModal: undefined,
};
export const DestroyState = {
  selectModal: undefined,
  addModal: undefined,
  fromInput: '',
  toInput: '',
  receiveList: undefined,
  receiveId: undefined,
  receiveItem: undefined,
  actionLoading: undefined,
};

export const HomeActions = {
  setSelectModal: (selectModal: boolean) => {
    const obj: any = { selectModal };
    if (selectModal) {
      obj.destroyModal = true;
    }
    return basicActions(homeActions['setSelectModal'], obj);
  },
  setAddModal: (addModal: boolean) => {
    const obj: any = { addModal };
    if (addModal) {
      obj.destroyModal = true;
    }
    return basicActions(homeActions['setAddModal'], obj);
  },
  setSelectToken: (selectToken?: CurrentWhitelistItem) => basicActions(homeActions['setSelectToken'], { selectToken }),
  homeModalDestroy: () => basicActions(homeActions['destroyModal']),
  homeStateDestroy: () => basicActions(homeActions['destroyState']),
  setFrom: (input: string) => basicActions(homeActions['setFrom'], { fromInput: input }),
  setTo: (input: string) => basicActions(homeActions['setTo'], { toInput: input }),
  setToChecked: (checked: boolean) => basicActions(homeActions['setToChecked'], { toChecked: checked }),
  setToAddress: (address: string) => basicActions(homeActions['setToAddress'], { toAddress: address }),
  setActionLoading: (actionLoading?: boolean) => basicActions(homeActions['setActionLoading'], { actionLoading }),
  setReceiveList: (receiveList: CrossChainItem[]) => basicActions(homeActions['setReceiveList'], { receiveList }),
  setReceiveId: (receiveId?: string) => basicActions(homeActions['setReceiveId'], { receiveId }),
  setHomeState: (state: homeState) => basicActions(homeActions['default'], state),
  homeDestroy: () => basicActions(homeActions['destroy']),
};

export const {
  setActionLoading,
  setReceiveId,
  setReceiveList,
  setTo,
  setToChecked,
  setToAddress,
  setFrom,
  setSelectModal,
  setSelectToken,
  homeModalDestroy,
  setAddModal,
  homeDestroy,
  setHomeState,
} = HomeActions;
