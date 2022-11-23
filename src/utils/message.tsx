import { message as antMessage } from 'antd';
import IconFont from 'components/IconFont';
import i18n from 'i18next';
import { Trans } from 'react-i18next';
import { ChainId } from 'types';
import { getTXLink } from './link';
import writeText from 'copy-to-clipboard';
import { divDecimals } from './calculate';

export function txSuccess({ req, chainId, message }: { req: any; chainId: ChainId; message: string }) {
  const { TransactionId } = req || {};
  if (TransactionId) {
    copyTxMessage({ req, chainId, message });
  } else {
    antMessage.success(message);
  }
  // TransactionId && antMessage.success(getTXLink(TransactionId, chainId));
}

function formatMessage(s: string, decimals?: number) {
  try {
    if (s.includes('Insufficient balance') && s.includes('Current balance')) {
      const strList = s.replace('AElf.Sdk.CSharp.AssertionException:', '').split('.');
      let currentBalance = '',
        symbol = '';
      strList.forEach((i) => {
        if (i.includes('Current balance')) {
          const lastStrList = i.split(';');
          currentBalance = lastStrList[lastStrList.length - 1].split(':')[1].trim();
        }
        if (i.includes('Insufficient balance of')) symbol = i.replace('Insufficient balance of', '').trim();
      });
      return i18n.t('The amount to be transferred should be smaller than', {
        amount: divDecimals(currentBalance, decimals).toFixed(),
        symbol,
      });
    }
  } catch (error) {
    console.debug(error);
  }
  return s;
}

export function txError({
  req,
  chainId,
  message,
  decimals,
}: {
  req: any;
  chainId: ChainId;
  message: string;
  decimals?: number;
}) {
  const { TransactionId } = req || {};
  TransactionId && antMessage.error(getTXLink(TransactionId, chainId));
  const s = req.error.message || message;
  const text = decimals ? formatMessage(s, decimals) : s;
  antMessage.error(
    <span
      onClick={() => {
        writeText(text);
      }}>
      {text}
    </span>,
  );
}

export function txMessage({
  req,
  chainId,
  copy,
  errorMessage = 'Transaction request failed',
  successMessage = 'Transaction request submitted',
  decimals,
}: {
  req: any;
  chainId: ChainId;
  errorMessage?: string;
  successMessage?: string;
  copy?: boolean;
  decimals?: number;
}) {
  if (req.error) return txError({ req, chainId, message: i18n.t(errorMessage), decimals });
  (copy ? copyTxMessage : txSuccess)({ req, chainId, message: i18n.t(successMessage) });
}

export function copyTxMessage({ req, chainId, message }: { req: any; chainId: ChainId; message?: string }) {
  const { TransactionId } = req || {};
  antMessage.open({
    content: (
      <>
        <div className="tx-title-row">
          <IconFont type="CircleCorrect" />
          {message}
        </div>
        <div className="tx-row flex-row-between">
          <Trans>Transaction Id</Trans>
          <div className="flex-row-center">
            {getTXLink(TransactionId, chainId, 6)}
            <IconFont
              type="copy"
              onClick={() => {
                writeText(TransactionId);
                antMessage.success(i18n.t('Copy Success').toString());
              }}
            />
          </div>
        </div>
      </>
    ),
  });
}
