import { AElfAddress } from '@aelf-react/types';
import { ChainId, IPortkeyProvider, IChain, Accounts } from '@portkey/provider-types';

export enum Actions {
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
}

export interface ProtkeyContextState {
  name?: string;
  chain?: IChain;
  chainId?: ChainId;
  chainIds?: ChainId[];
  accounts?: Accounts;
  provider?: IPortkeyProvider;
  account: AElfAddress;
  isPortkey: boolean;
  isActive: boolean;
}

export type ReducerAction = {
  type: Actions;
  payload?: any;
};

export interface CallContractParams<T> {
  contractAddress: string;
  methodName: string;
  args: T;
}
