import { ContractBasic } from 'utils/contract';
import { provider } from 'web3-core';
import { ChainId } from 'types';
import { checkELFApprove } from './elf';
import { checkErcApprove } from './ethereum';
import { checkTrcApprove } from './tron';

import { isChainSupportedByTRC } from 'utils/common';

export const checkApprove = async (
  ethereum: provider,
  trcLibrary: provider,
  // ethereum from token address elf from token symbol
  fromToken: string,
  account: string,
  approveTargetAddress: string,
  fromChainId: ChainId,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  // elf token contract
  tokenContract?: ContractBasic,
): Promise<boolean | any> => {
  if (tokenContract) {
    return checkELFApprove(fromToken, account, approveTargetAddress, tokenContract, contractUseAmount, pivotBalance);
  } else if (isChainSupportedByTRC(fromChainId)) {
    return checkTrcApprove(
      trcLibrary,
      fromChainId,
      fromToken,
      account,
      approveTargetAddress,
      contractUseAmount,
      pivotBalance,
    );
  } else {
    return checkErcApprove(ethereum, fromToken, account, approveTargetAddress, contractUseAmount, pivotBalance);
  }
};
export * from './elf';
export * from './ethereum';
export * from './tron';
