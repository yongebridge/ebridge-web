import clsx from 'clsx';
import CommonButton from 'components/CommonButton';
import { useWallet } from 'contexts/useWallet/hooks';
import { useBridgeContract, useBridgeOutContract, useCrossChainContract, useTokenContract } from 'hooks/useContract';
import { useCallback, useMemo, useState } from 'react';
import styles from './styles.module.less';
import { CrossChainTransfer, CrossChainReceive, CreateReceipt, SwapToken, LockToken } from 'utils/crossChain';
import { useHomeContext } from '../HomeContext';
import { txMessage } from 'utils/message';
import { timesDecimals } from 'utils/calculate';
import { setActionLoading, setFrom, setReceiveId } from '../HomeContext/actions';
import { Trans } from 'react-i18next';
import { CrossFeeToken, LANG_MAX, MaxUint256, ZERO } from 'constants/misc';
import { message } from 'antd';
import { useLanguage } from 'i18n';
import useLockCallback from 'hooks/useLockCallback';
import { useUpdateEffect } from 'react-use';
import { useAllowance } from 'hooks/useAllowance';
import { isELFChain } from 'utils/aelfUtils';
import { ACTIVE_CHAIN } from 'constants/index';
import { formatAddress, isAddress } from 'utils';
import CheckToFillAddressModal from './CheckToFillAddressModal';

function Actions() {
  const { fromWallet, toWallet, isHomogeneous } = useWallet();
  const [toConfirmModal, setToConfirmModal] = useState<boolean>(false);
  const [
    { selectToken, fromInput, receiveItem, fromBalance, actionLoading, crossMin, toChecked, toAddress },
    { dispatch, addReceivedList },
  ] = useHomeContext();
  const { chainId: fromChainId, account: fromAccount, library } = fromWallet || {};
  const { chainId: toChainId, account: toAccount } = toWallet || {};
  const itemToChainID = useMemo(() => receiveItem?.toChainId, [receiveItem?.toChainId]);
  const itemSendChainID = useMemo(() => receiveItem?.fromChainId, [receiveItem?.fromChainId]);
  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    const token = selectToken?.[fromChainId];
    if (token?.isNativeToken) token.address = '';
    return token;
  }, [fromChainId, selectToken]);
  const { t } = useLanguage();

  const tokenContract = useTokenContract(fromChainId, fromTokenInfo?.address);
  const sendCrossChainContract = useCrossChainContract(itemSendChainID);
  const receiveTokenContract = useTokenContract(itemToChainID);
  const sendTokenContract = useTokenContract(itemSendChainID);
  const bridgeContract = useBridgeContract(fromChainId);
  const bridgeOutContract = useBridgeOutContract(toChainId);

  const [fromTokenAllowance, getAllowance] = useAllowance(
    tokenContract,
    fromAccount,
    bridgeContract?.address,
    fromTokenInfo?.symbol,
  );
  const [feeTokenAllowance, getFeeAllowance] = useAllowance(
    isELFChain(fromChainId) ? tokenContract : undefined,
    fromAccount,
    bridgeContract?.address,
    CrossFeeToken === fromTokenInfo?.symbol ? undefined : CrossFeeToken,
  );

  const onCrossChainReceive = useLockCallback(async () => {
    if (!receiveItem) return message.error(t('record does not exist'));
    try {
      if (!(receiveTokenContract && sendCrossChainContract && sendTokenContract && itemSendChainID && itemToChainID))
        return;
      dispatch(setActionLoading(true));
      const req = await CrossChainReceive({
        sendChainID: itemSendChainID,
        receiveItem,
        sendCrossChainContract,
        sendTokenContract,
        receiveTokenContract,
      });
      txMessage({ req, chainId: itemToChainID });
      if (!req.error) {
        addReceivedList(receiveItem.id);
        dispatch(setReceiveId(undefined));
      }
    } catch (error: any) {
      message.error(error.message);
    }
    dispatch(setActionLoading(false));
  }, [
    receiveItem,
    t,
    receiveTokenContract,
    sendCrossChainContract,
    sendTokenContract,
    itemSendChainID,
    itemToChainID,
    addReceivedList,
    dispatch,
  ]);
  const onCrossChainTransfer = useLockCallback(async () => {
    if (!(fromChainId && toChainId)) return;
    const token = selectToken?.[fromChainId] || selectToken?.[toChainId];
    if (!(tokenContract && fromAccount && toAccount && token && fromInput)) return;
    dispatch(setActionLoading(true));
    try {
      const req = await CrossChainTransfer({
        contract: tokenContract,
        account: fromAccount,
        to: toAccount,
        token,
        toChainId: toChainId,
        amount: timesDecimals(fromInput, token.decimals).toFixed(0),
      });
      if (!req.error) dispatch(setFrom(''));
      txMessage({ req, chainId: fromChainId, decimals: token.decimals });
    } catch (error: any) {
      message.error(error.message);
    }
    dispatch(setActionLoading(false));
  }, [dispatch, fromAccount, fromChainId, fromInput, selectToken, toAccount, toChainId, tokenContract]);

  const onCreateReceipt = useCallback(async () => {
    if (
      !(
        fromTokenInfo &&
        fromAccount &&
        bridgeContract &&
        toChainId &&
        fromChainId &&
        ((toChecked && (toAccount || isAddress(toAddress, toChainId))) || toAccount)
      )
    )
      return;

    dispatch(setActionLoading(true));

    const params: any = {
      library,
      fromToken: fromTokenInfo?.address || fromTokenInfo?.symbol,
      account: fromAccount,
      bridgeContract,
      amount: timesDecimals(fromInput, fromTokenInfo.decimals).toFixed(0),
      toChainId,
      to: toChecked && toAddress ? toAddress : (toAccount as string),
    };
    if (tokenContract) {
      params.tokenContract = tokenContract;
    }
    try {
      const req = await (fromTokenInfo.isNativeToken ? LockToken : CreateReceipt)(params);

      if (!req.error) dispatch(setFrom(''));
      txMessage({ req, chainId: fromChainId, decimals: isELFChain(fromChainId) ? fromTokenInfo.decimals : undefined });
    } catch (error: any) {
      message.error(error.message);
    }
    dispatch(setActionLoading(false));
  }, [
    bridgeContract,
    dispatch,
    fromAccount,
    fromChainId,
    fromInput,
    fromTokenInfo,
    library,
    toAccount,
    toChecked,
    toAddress,
    toChainId,
    tokenContract,
  ]);
  const onSwapToken = useCallback(async () => {
    if (!receiveItem) return message.error(t('record does not exist'));
    if (!(toAccount && toChainId && bridgeOutContract)) return;
    dispatch(setActionLoading(true));
    try {
      const req = await SwapToken({ bridgeOutContract, receiveItem, toAccount });
      if (!req.error) {
        addReceivedList(receiveItem.id);
        dispatch(setReceiveId(undefined));
      }
      const { status, transactionHash } = req.error?.receipt || {};
      if (status === false && transactionHash) {
        txMessage({
          req: {
            ...req,
            TransactionId: transactionHash,
            isTransactionHash: true,
          },
          chainId: toChainId,
        });
      } else {
        txMessage({ req, chainId: toChainId });
      }
    } catch (error: any) {
      console.log(error, '======test=error');
      message.error(error.message);
    }
    dispatch(setActionLoading(false));
  }, [addReceivedList, bridgeOutContract, dispatch, receiveItem, t, toAccount, toChainId]);
  const onApprove = useCallback(
    async (symbol?: string) => {
      if (!fromAccount || !fromChainId || !tokenContract) return;
      dispatch(setActionLoading(true));
      try {
        const approveResult = await tokenContract.callSendMethod(
          'approve',
          fromAccount,
          tokenContract.contractType === 'ELF'
            ? [bridgeContract?.address, symbol, LANG_MAX]
            : [bridgeContract?.address, MaxUint256],
        );
        if (!approveResult.error) {
          getAllowance();
          getFeeAllowance();
        }
        txMessage({ req: approveResult, chainId: fromChainId });
      } catch (error: any) {
        message.error(error.message);
      }
      dispatch(setActionLoading(false));
    },
    [bridgeContract?.address, dispatch, fromAccount, fromChainId, getAllowance, getFeeAllowance, tokenContract],
  );

  const needConfirm = useMemo(
    () =>
      !isHomogeneous &&
      toAccount &&
      toChecked &&
      isAddress(toAddress, toChainId) &&
      toAddress &&
      toAccount !== formatAddress(toAddress),
    [isHomogeneous, toAccount, toChecked, toAddress, toChainId],
  );

  const btnProps = useMemo(() => {
    let children = 'Transfer',
      onClick: any,
      disabled = true;
    if (isHomogeneous) {
      if (!toAccount) {
        children = 'Connect Wallet';
        return { children, onClick, disabled };
      }
    } else {
      if (!toChecked) {
        if (!toAccount) {
          children = 'Connect Wallet';
          return { children, onClick, disabled };
        }
      } else {
        if ((toAddress && !isAddress(toAddress, toChainId)) || (!toAddress && !toAccount))
          return { children, onClick, disabled };
      }
    }

    // invalid to chain
    if (toChainId && !ACTIVE_CHAIN[toChainId]) {
      children = 'Invalid to chain';
      return { children, onClick, disabled };
    }
    // receive
    if (receiveItem) {
      children = 'Receive';
      disabled = false;
      onClick = receiveItem.type === 0 ? onCrossChainReceive : onSwapToken;
      return { children, onClick, disabled };
    }
    if (!fromAccount) children = 'Receive';
    if (!isHomogeneous) {
      let symbol: string | undefined;
      if (feeTokenAllowance?.lte(0)) {
        symbol = CrossFeeToken;
      } else if (fromTokenAllowance?.lte(0)) {
        symbol = fromTokenInfo?.symbol;
      }
      if (symbol) {
        children = t('Approve symbol', { symbol });
        disabled = false;
        onClick = () => onApprove(symbol);
        return { children, onClick, disabled };
      }
    }
    if (fromInput) {
      if (!fromAccount) {
        children = 'Connect Wallet';
        return { children, onClick, disabled };
      }
      // invalid from chain
      if (fromChainId && !ACTIVE_CHAIN[fromChainId]) {
        children = 'Invalid from chain';
        return { children, onClick, disabled };
      }

      if (!fromBalance?.show || fromBalance?.show.lt(fromInput)) {
        children = 'Insufficient balance';
      } else if (ZERO.lt(fromInput)) {
        // crossMin
        if (crossMin && ZERO.plus(crossMin).gt(fromInput)) {
          children = `${t('The minimum crosschain amount is2')}${crossMin} ${fromTokenInfo?.symbol}`;
        } else {
          disabled = false;
          if (isHomogeneous) {
            onClick = onCrossChainTransfer;
          } else {
            if (needConfirm) {
              onClick = () => setToConfirmModal(true);
            } else {
              onClick = onCreateReceipt;
            }
          }
        }
      }
    }
    return { children, disabled, onClick };
  }, [
    toAccount,
    toChecked,
    toAddress,
    toChainId,
    fromAccount,
    receiveItem,
    onCrossChainReceive,
    onSwapToken,
    isHomogeneous,
    feeTokenAllowance,
    fromTokenAllowance,
    fromInput,
    t,
    onApprove,
    fromTokenInfo?.symbol,
    fromChainId,
    fromBalance?.show,
    crossMin,
    onCrossChainTransfer,
    onCreateReceipt,
    needConfirm,
  ]);
  useUpdateEffect(() => {
    dispatch(setActionLoading(false));
  }, [btnProps.children]);
  return (
    <>
      <CommonButton loading={actionLoading} {...btnProps} className={styles['action-btn']} type="primary">
        <Trans>{btnProps.children}</Trans>
      </CommonButton>
      <CheckToFillAddressModal
        visible={toConfirmModal}
        setVisible={setToConfirmModal}
        onSuccess={() => {
          onCreateReceipt();
          setToConfirmModal(false);
        }}
      />
    </>
  );
}

export default function ActionButton() {
  return (
    <div className={clsx(styles['action-btn-row'], 'flex-center')}>
      <Actions />
    </div>
  );
}
