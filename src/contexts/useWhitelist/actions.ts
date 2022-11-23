import { basicActions } from 'contexts/utils';
import { ChainId, TokenInfo } from 'types';
export type WhitelistItem = {
  [key in ChainId]?: TokenInfo;
};

export type WhitelistMap = { [key: string]: WhitelistItem | undefined };
export declare type WhitelistState = {
  whitelistMap?: WhitelistMap;
};
export enum WhitelistActions {
  addWhitelist = 'ADD_WHITE_LIST',
  default = 'DEFAULT',
  destroy = 'DESTROY',
}

export const whitelistActions = {
  addWhitelist: (token?: WhitelistMap) => basicActions(WhitelistActions['addWhitelist'], { token }),
  whitelistProviderDestroy: () => basicActions(WhitelistActions['destroy']),
};

export const { addWhitelist, whitelistProviderDestroy } = whitelistActions;
