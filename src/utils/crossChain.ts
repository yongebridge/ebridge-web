import { SupportedELFChainId } from 'constants/chain';
import { ChainId, TokenInfo } from 'types';
import { CrossChainItem } from 'types/api';
import { encodeTransaction, getAElf, uint8ArrayToHex } from './aelfUtils';
import { base58ToChainId, getChainIdToMap } from './chain';
import type { ContractBasic } from './contract';
import AElf from 'aelf-sdk';
import { AElfTransaction, TransactionResult } from '@aelf-react/types';
import { checkApprove } from 'contracts';
import type { provider } from 'web3-core';
import { CrossFeeToken, REQ_CODE, ZERO } from 'constants/misc';
import { getTokenInfoByWhitelist } from './whitelist';
import { timesDecimals } from './calculate';
import { formatAddress, isIncludesChainId } from 'utils';
import { FormatTokenList } from 'constants/index';
import { LimitDataProps } from 'page-components/Home/useLimitAmountModal/constants';
import BigNumber from 'bignumber.js';
export async function CrossChainTransfer({
  contract,
  account,
  to,
  token,
  toChainId,
  amount,
}: {
  contract: ContractBasic;
  account: string;
  to: string;
  token: TokenInfo;
  toChainId: ChainId;
  amount: string;
}) {
  console.log('CrossChainTransfer', '===CrossChainTransfer');

  return contract.callSendMethod(
    'CrossChainTransfer',
    account,
    [to, token.symbol, amount, ' ', base58ToChainId(toChainId), token.issueChainId],
    { onMethod: 'receipt' },
  );
}

async function getMerklePath(sendInstance: any, transferTransactionId?: string | null) {
  const merklePathByTxId = await sendInstance.chain.getMerklePathByTxId(transferTransactionId);
  const merklePath = {
    merklePathNodes: [...merklePathByTxId.MerklePathNodes],
  };
  merklePath.merklePathNodes = merklePath.merklePathNodes.map((item) => ({
    hash: {
      value: Buffer.from(item.Hash, 'hex').toString('base64'),
    },
    isLeftChildNode: item.IsLeftChildNode,
  }));
  return {
    merklePath,
  };
}
async function getBoundParentChainHeightAndMerklePathByHeight(
  sendCrossChainContract: ContractBasic,
  crossTransferTxBlockHeight?: number | null,
) {
  const req = await sendCrossChainContract.callViewMethod('GetBoundParentChainHeightAndMerklePathByHeight', [
    crossTransferTxBlockHeight,
  ]);
  const { merklePathFromParentChain, boundParentChainHeight } = req;

  merklePathFromParentChain.merklePathNodes = merklePathFromParentChain.merklePathNodes.map((item: any) => ({
    hash: {
      value: Buffer.from(item.hash, 'hex').toString('base64'),
    },
    isLeftChildNode: item.isLeftChildNode,
  }));
  return {
    merklePathFromParentChain,
    boundParentChainHeight,
  };
}

async function signTransaction({
  Transaction,
  sendTokenContract,
}: {
  Transaction: AElfTransaction;
  sendTokenContract: ContractBasic;
}): Promise<string> {
  const { Params, From, To, MethodName, RefBlockNumber, RefBlockPrefix, Signature } = Transaction;
  const encoded = await sendTokenContract.encodedTx(MethodName, JSON.parse(Params));
  const raw = AElf.pbUtils.getTransaction(From, To, MethodName, encoded);
  raw.refBlockNumber = RefBlockNumber;
  raw.refBlockPrefix = Uint8Array.from(Buffer.from(RefBlockPrefix, 'base64'));
  //   raw.signature = await getSignatureByBridge(
  //     ELFChainConstants.aelfInstances?.AELF,
  //     '2BC7WWMNBp4LjmJ48VAfDocEU2Rjg5yhELxT2HewfYxPPrdxA9',
  //     Buffer.from(encodeTransaction(raw)).toString('hex'),
  //   );

  raw.signature = Buffer.from(Signature, 'base64').toString('hex');

  let tx = encodeTransaction(raw);
  if (tx instanceof Buffer) {
    tx = tx.toString('hex');
  } else {
    tx = uint8ArrayToHex(tx);
  }
  return tx;
}

export async function CrossChainReceive({
  sendChainID,
  receiveItem,
  sendCrossChainContract,
  sendTokenContract,
  receiveTokenContract,
}: {
  sendChainID: ChainId;
  receiveItem: CrossChainItem;
  sendCrossChainContract: ContractBasic;
  sendTokenContract: ContractBasic;
  receiveTokenContract: ContractBasic;
}) {
  const { transferTransactionId, fromChainId } = receiveItem;
  const sendInstance = getAElf(sendChainID);
  const crossTransferTxInfo: TransactionResult = await sendInstance.chain.getTxResult(transferTransactionId);
  const { BlockNumber, Transaction } = crossTransferTxInfo;

  const { merklePath } = await getMerklePath(sendInstance, transferTransactionId);
  let parentChainHeight = BlockNumber;
  if (sendChainID !== SupportedELFChainId.AELF) {
    const { merklePathFromParentChain, boundParentChainHeight } = await getBoundParentChainHeightAndMerklePathByHeight(
      sendCrossChainContract,
      BlockNumber,
    );
    parentChainHeight = boundParentChainHeight;
    merklePath.merklePathNodes = [...merklePath.merklePathNodes, ...merklePathFromParentChain.merklePathNodes];
  }
  const tx = await signTransaction({
    Transaction,
    sendTokenContract,
  });

  return receiveTokenContract.callSendMethod('CrossChainReceiveToken', '', {
    fromChainId: base58ToChainId(fromChainId as any),
    parentChainHeight,
    transferTransactionBytes: Buffer.from(tx, 'hex').toString('base64'),
    merklePath,
  });
}
export function ValidateTokenInfoExists({
  contract,
  tokenInfo,
  account,
}: {
  contract: ContractBasic;
  tokenInfo: TokenInfo;
  account: string;
}) {
  return contract.callSendMethod('ValidateTokenInfoExists', account, tokenInfo);
}

export async function CrossChainCreateToken({
  sendChainID,
  transactionId,
  sendCrossChainContract,
  sendTokenContract,
  receiveTokenContract,
}: {
  sendChainID: ChainId;
  transactionId: string;
  sendCrossChainContract: ContractBasic;
  sendTokenContract: ContractBasic;
  receiveTokenContract: ContractBasic;
}) {
  const sendInstance = getAElf(sendChainID);
  const txInfo: TransactionResult = await sendInstance.chain.getTxResult(transactionId);
  const { BlockNumber, Transaction } = txInfo;

  const { merklePath } = await getMerklePath(sendInstance, transactionId);
  let parentChainHeight = BlockNumber;

  if (sendChainID !== SupportedELFChainId.AELF) {
    const { merklePathFromParentChain, boundParentChainHeight } = await getBoundParentChainHeightAndMerklePathByHeight(
      sendCrossChainContract,
      BlockNumber,
    );
    parentChainHeight = boundParentChainHeight;
    merklePath.merklePathNodes = [...merklePath.merklePathNodes, ...merklePathFromParentChain.merklePathNodes];
  }
  const tx = await signTransaction({
    Transaction,
    sendTokenContract,
  });

  return receiveTokenContract.callSendMethod('CrossChainCreateToken', '', {
    fromChainId: base58ToChainId(sendChainID as any),
    parentChainHeight,
    transactionBytes: Buffer.from(tx, 'hex').toString('base64'),
    merklePath,
  });
}

export async function CreateReceipt({
  library,
  fromToken,
  account,
  bridgeContract,
  amount,
  toChainId,
  to,
  tokenContract,
  crossFee,
}: {
  bridgeContract: ContractBasic;
  library: provider;
  fromToken: string;
  account: string;
  amount: string;
  toChainId: ChainId;
  to: string;
  tokenContract: ContractBasic;
  crossFee?: string;
}) {
  const toAddress = formatAddress(to);
  const fromELFChain = bridgeContract.contractType === 'ELF';
  if (fromELFChain && fromToken !== CrossFeeToken) {
    const req = await checkApprove(
      library,
      CrossFeeToken,
      account,
      bridgeContract.address || '',
      timesDecimals(crossFee, 8).toFixed(0),
      undefined,
      fromELFChain ? tokenContract : undefined,
    );
    if (req !== REQ_CODE.Success) throw req;
  }
  let checkAmount = amount;
  if (fromToken === CrossFeeToken) {
    if (crossFee) {
      // fee ELF decimals 8
      crossFee = timesDecimals(crossFee, 8).toFixed(0);
    }
    checkAmount = ZERO.plus(amount)
      .plus(crossFee || 0)
      .toFixed(0);
  }
  const req = await checkApprove(
    library,
    fromToken,
    account,
    bridgeContract.address || '',
    checkAmount,
    undefined,
    fromELFChain ? tokenContract : undefined,
  );
  if (req !== REQ_CODE.Success) throw req;
  if (fromELFChain) {
    return bridgeContract.callSendMethod('createReceipt', account, [
      fromToken,
      account,
      toAddress,
      amount,
      getChainIdToMap(toChainId),
    ]);
  }
  return bridgeContract.callSendMethod(
    'createReceipt',
    account,
    [fromToken, amount, getChainIdToMap(toChainId), toAddress],
    {
      onMethod: 'transactionHash',
    },
  );
}

export async function LockToken({
  account,
  bridgeContract,
  amount,
  toChainId,
  to,
}: {
  bridgeContract: ContractBasic;
  library: provider;
  fromToken: string;
  account: string;
  amount: string;
  toChainId: ChainId;
  to: string;
  tokenContract?: ContractBasic;
}) {
  const toAddress = formatAddress(to);
  return bridgeContract.callSendMethod('createNativeTokenReceipt', account, [getChainIdToMap(toChainId), toAddress], {
    onMethod: 'transactionHash',
    value: amount,
  });
}

export async function SwapToken({
  bridgeOutContract,
  toAccount,
  receiveItem,
}: {
  receiveItem: CrossChainItem;
  bridgeOutContract: ContractBasic;
  toAccount: string;
}) {
  const { transferAmount, receiptId, toAddress, transferToken, toChainId, fromChainId } = receiveItem || {};
  if (!(toChainId && transferToken?.symbol)) return;
  let toSymbol = transferToken.symbol;
  const item = FormatTokenList.find(
    (i) =>
      i.fromSymbol === transferToken.symbol &&
      isIncludesChainId(i.fromChainId, fromChainId) &&
      isIncludesChainId(i.toChainId, toChainId),
  );
  if (item) toSymbol = item.toSymbol;

  const { address } = getTokenInfoByWhitelist(toChainId, toSymbol) || {};
  const originAmount = timesDecimals(transferAmount, transferToken.decimals).toFixed();
  const chainId = getChainIdToMap(fromChainId);

  let swapId;
  if (bridgeOutContract.contractType === 'ELF') {
    swapId = await bridgeOutContract?.callViewMethod('GetSwapIdByToken', [chainId, toSymbol]);
  } else {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  }
  if (swapId.error) return swapId;
  return bridgeOutContract?.callSendMethod('swapToken', toAccount, [swapId, receiptId, originAmount, toAddress]);
}

export async function getSwapId({
  bridgeOutContract,
  toChainId,
  fromChainId,
  toSymbol,
}: {
  bridgeOutContract?: ContractBasic;
  toChainId: ChainId;
  fromChainId: ChainId;
  toSymbol: string;
}) {
  let swapId;

  const { address } = getTokenInfoByWhitelist(toChainId, toSymbol) || {};
  const chainId = getChainIdToMap(fromChainId);
  console.log('bridgeOutContract: ', bridgeOutContract, 'address: ', address, 'chainId: ', chainId);

  if (bridgeOutContract?.contractType === 'ELF') {
    swapId = await bridgeOutContract?.callViewMethod('GetSwapIdByToken', [chainId, toSymbol]);
  } else {
    swapId = await bridgeOutContract?.callViewMethod('getSwapId', [address, chainId]);
  }

  console.log('swapId: ', swapId);

  return swapId;
}

export async function getReceiptLimit({
  limitContract,
  address,
  toChainId,
}: {
  limitContract?: ContractBasic;
  address?: string;
  toChainId?: ChainId;
}): Promise<LimitDataProps | undefined> {
  try {
    const result = await Promise.all([
      limitContract?.callViewMethod('getReceiptDailyLimit', [address, getChainIdToMap(toChainId)]),
      limitContract?.callViewMethod('GetCurrentReceiptTokenBucketState', [address, getChainIdToMap(toChainId)]),
    ]);

    if (result[0].error || result[1].error) {
      throw new Error(result[0].error || result[1].error);
    }

    console.log('getReceiptDailyLimit: ', result[0]);
    console.log('GetCurrentReceiptTokenBucketState: ', result[1]);

    return {
      remain: new BigNumber(result[0].tokenAmount),
      maxCapcity: new BigNumber(result[1].tokenCapacity),
      currentCapcity: new BigNumber(result[1].currentTokenAmount),
      fillRate: new BigNumber(result[1].rate),
      isEnable: result[1].isEnabled,
    };
  } catch (e) {
    console.log('getReceiptLimit error :', e);
  }
}

export async function getSwapLimit({
  limitContract,
  address,
  fromChainId,
  swapId,
}: {
  limitContract?: ContractBasic;
  address?: string;
  fromChainId?: ChainId;
  swapId?: string;
}): Promise<LimitDataProps | undefined> {
  try {
    const result = await Promise.all([
      limitContract?.callViewMethod('getSwapDailyLimit', [swapId]),
      limitContract?.callViewMethod('GetCurrentSwapTokenBucketState', [address, getChainIdToMap(fromChainId)]),
    ]);

    if (result[0].error || result[1].error) {
      throw new Error(result[0].error || result[1].error);
    }

    console.log('getSwapDailyLimit: ', result[0]);
    console.log('GetCurrentSwapTokenBucketState: ', result[1]);

    return {
      remain: new BigNumber(result[0].tokenAmount),
      maxCapcity: new BigNumber(result[1].tokenCapacity),
      currentCapcity: new BigNumber(result[1].currentTokenAmount),
      fillRate: new BigNumber(result[1].rate),
      isEnable: result[1].isEnabled,
    };
  } catch (e) {
    console.log('getSwapLimit error :', e);
  }
}
