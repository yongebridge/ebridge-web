import { AelfInstancesKey, ChainType, Web3Type } from 'types';
import type { provider } from 'web3-core';
import {
  ACTIVE_CHAIN,
  ChainConstantsType,
  ERC_CHAIN_TYPE,
  DEFAULT_ERC_CHAIN,
  supportedERCChain,
  supportedELFChain,
} from '.';

type AElfOwnConstants = {
  CONTRACTS?: { [key: string]: string };
  TOKEN_CONTRACT?: string;
  CROSS_CHAIN_CONTRACT?: string;
  BRIDGE_CONTRACT?: string;
  BRIDGE_CONTRACT_OUT?: string;
};

type Constants = ChainConstantsType & AElfOwnConstants;

export class ChainConstants {
  public id: number | string;
  static chainId: number | string;
  static chainType: ChainType;
  constructor(id: number | string) {
    this.id = id;
  }
}

export class ERCChainConstants extends ChainConstants {
  static constants: Constants = supportedERCChain[DEFAULT_ERC_CHAIN];
  static chainType: ChainType = 'ERC';
  static library?: provider;
  constructor(id: number | string, library?: provider) {
    super(id);
    ERCChainConstants['library'] = library;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    const chainId = (this.id || window.ethereum?.chainId) as ERC_CHAIN_TYPE;
    let attrs;
    if (ACTIVE_CHAIN[chainId]) {
      attrs = supportedERCChain[chainId];
    } else {
      attrs = supportedERCChain[DEFAULT_ERC_CHAIN];
    }
    ERCChainConstants['constants'] = attrs;
    ERCChainConstants['chainId'] = attrs?.CHAIN_INFO.chainId;
  }
}
export class ELFChainConstants extends ChainConstants {
  static chainType: ChainType = 'ELF';
  static aelfInstances?: Web3Type['aelfInstances'];
  static constants: { [k in AelfInstancesKey]: Constants };
  constructor(id: number | string, aelfInstances?: Web3Type['aelfInstances']) {
    super(id);
    ELFChainConstants['aelfInstances'] = aelfInstances;
    this.setStaticAttrs();
  }
  setStaticAttrs() {
    ELFChainConstants['constants'] = supportedELFChain as any;
  }
}
