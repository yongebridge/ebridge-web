import { basicActions } from 'contexts/utils';
import { ContractBasic } from 'utils/contract';

export enum aelfContractActions {
  setContract = 'SET_CONTRACT',
  destroy = 'DESTROY',
}

export type aelfContractState = { [key: string]: ContractBasic };

export const basicAElfContractActions = {
  setContract: (contract: { [key: string]: ContractBasic }) =>
    basicActions(aelfContractActions['setContract'], contract),
  aelfContractDestroy: () => basicActions(aelfContractActions['destroy']),
};

export const { setContract, aelfContractDestroy } = basicAElfContractActions;
