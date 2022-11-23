import { ContractBasic } from 'utils/contract';
import { provider } from 'web3-core';
import { checkELFApprove } from './elf';
import { checkErcApprove } from './ethereum';

export const checkApprove = async (
  ethereum: provider,
  // ethereum from token address elf from token symbol
  fromToken: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  // elf token contract
  tokenContract?: ContractBasic,
): Promise<boolean | any> => {
  if (tokenContract)
    return checkELFApprove(fromToken, account, approveTargetAddress, tokenContract, contractUseAmount, pivotBalance);
  return checkErcApprove(ethereum, fromToken, account, approveTargetAddress, contractUseAmount, pivotBalance);
};
export * from './elf';
export * from './ethereum';
