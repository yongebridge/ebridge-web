import * as MAINNET from './platform/main';
import * as KOVAN from './platform/kovan';
import * as GORELI from './platform/goreli';
import * as AELF from './platform/AELF';
import * as tDVV from './platform/tDVV';
import * as tDVW from './platform/tDVW';

import { SupportedChainId, SupportedELFChainId } from './chain';
import type { NetworkType } from 'types';
import { CHAIN_ICON, CHAIN_NAME } from './chainInfo';

export type ChainConstantsType =
  | typeof MAINNET
  | typeof KOVAN
  | typeof AELF
  | typeof tDVV
  | typeof tDVW
  | typeof GORELI;

export type ERC_CHAIN_ID_TYPE = keyof typeof supportedERCChainId;
export type ELF_CHAIN_ID_TYPE = keyof typeof supportedELFChainId;

export const DEFAULT_ELF_CHAIN = SupportedELFChainId.AELF;
export const DEFAULT_ERC_CHAIN = SupportedChainId.KOVAN;

export const supportedERCChainId: { [k: string | number]: ChainConstantsType } = {
  [SupportedChainId.MAINNET]: MAINNET,
  [SupportedChainId.KOVAN]: KOVAN,
  [SupportedChainId.GORELI]: GORELI,
};
export const supportedELFChainId: { [k: string | number]: ChainConstantsType } = {
  [SupportedELFChainId.AELF]: AELF,
  [SupportedELFChainId.tDVW]: tDVW,
  [SupportedELFChainId.tDVV]: tDVV,
};

export const ACTIVE_CHAIN: any = {
  [SupportedChainId.KOVAN]: true,
  [SupportedChainId.GORELI]: true,
  [SupportedELFChainId.AELF]: true,
  [SupportedELFChainId.tDVV]: true,
  [SupportedELFChainId.tDVW]: true,
};

const prodNetworkList = [{ title: CHAIN_NAME[SupportedChainId.MAINNET], info: MAINNET.CHAIN_INFO }];

const testNetworkList = [
  { title: CHAIN_NAME[SupportedChainId.GORELI], icon: CHAIN_ICON[SupportedChainId.GORELI], info: GORELI.CHAIN_INFO },
  { title: CHAIN_NAME[SupportedChainId.KOVAN], icon: CHAIN_ICON[SupportedChainId.KOVAN], info: KOVAN.CHAIN_INFO },
  { title: CHAIN_NAME[SupportedELFChainId.AELF], icon: CHAIN_ICON[SupportedELFChainId.AELF], info: AELF.CHAIN_INFO },
  { title: CHAIN_NAME[SupportedELFChainId.tDVV], icon: CHAIN_ICON[SupportedELFChainId.tDVV], info: tDVV.CHAIN_INFO },
  // { title: CHAIN_NAME[SupportedELFChainId.tDVW], icon: CHAIN_ICON[SupportedELFChainId.tDVW], info: tDVW.CHAIN_INFO },
];

export const networkList = (process.env.REACT_APP_ENV === 'prod'
  ? prodNetworkList
  : testNetworkList) as unknown as NetworkType[];
