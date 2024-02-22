import { ContractBasic } from '../utils/contract';
import { provider } from 'web3-core';
import { ChainId } from 'types';
import { SupportedChainId, SupportedELFChainId, CHAIN_ID_MAP } from 'constants/chain';
import BigNumber from 'bignumber.js';
import { ERC20_ABI } from 'constants/abis';
import { MaxUint256, REQ_CODE } from 'constants/misc';
import { isUserDenied } from 'utils/provider';
import CommonMessage from 'components/CommonMessage';

export const getTRCBalance = async (address: string) => {
  const tronWeb3 = window.tronWeb;
  return tronWeb3?.getBalance(address);
};

export const checkTrcApprove = async (
  tron: provider,
  chainId: ChainId,
  contractAddress: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
): Promise<boolean | any> => {
  const lpContract = new ContractBasic({
    contractABI: ERC20_ABI,
    provider: tron,
    contractAddress: contractAddress,
    chainId,
  });
  const approveResult = await checkTRCAllowanceAndApprove({
    trc20Contract: lpContract,
    approveTargetAddress,
    account,
    contractUseAmount,
    pivotBalance,
  });
  if (typeof approveResult !== 'boolean' && approveResult.error) {
    CommonMessage.error('Check allowance and Approved failed');
    CommonMessage.error(approveResult.error.message);
    if (isUserDenied(approveResult.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  return REQ_CODE.Success;
};

export const checkTRCAllowanceAndApprove = async ({
  trc20Contract,
  approveTargetAddress,
  account,
  contractUseAmount,
  pivotBalance,
}: {
  trc20Contract: ContractBasic;
  approveTargetAddress: string;
  account: string;
  contractUseAmount?: string | number;
  pivotBalance?: string | number;
}): Promise<boolean | any> => {
  const [allowance, decimals] = await Promise.all([
    trc20Contract.callViewMethod('allowance', [account, approveTargetAddress]),
    trc20Contract.callViewMethod('decimals'),
  ]);
  if (allowance.error) {
    return allowance;
  }
  const allowanceBN = new BigNumber(allowance);
  const pivotBalanceBN = contractUseAmount
    ? new BigNumber(contractUseAmount)
    : new BigNumber(pivotBalance || 1).times(10 ** decimals);
  if (allowanceBN.lt(pivotBalanceBN)) {
    const approveResult = await trc20Contract.callSendMethod('approve', account, [approveTargetAddress, MaxUint256]);
    if (approveResult.error) {
      return approveResult;
    } else {
      return approveResult;
    }
  }
  return true;
};

export const getTRCChainBalance = async (tokenAddress: string, owner?: string) => {
  let balance = 0;
  if (window.tronWeb) {
    const tokenTronContract = await window.tronWeb?.contract().at(tokenAddress);
    const callBalance = await tokenTronContract?.balanceOf(owner).call();
    balance = window.tronWeb?.toDecimal(callBalance);
  }
  return balance;
};

export const getChainIdForContract = (chainId: ChainId) => {
  switch (chainId) {
    case SupportedChainId.TRON_NILE_TESTNET:
    case SupportedELFChainId.AELF:
    case SupportedELFChainId.tDVV:
    case SupportedELFChainId.tDVW:
      return CHAIN_ID_MAP[chainId];
    default: {
      return chainId;
    }
  }
};
