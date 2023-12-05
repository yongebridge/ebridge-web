import { Collapse } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import { useWallet } from 'contexts/useWallet/hooks';
import { useLanguage } from 'i18n';
import { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { isELFChain } from 'utils/aelfUtils';
import { getCrossChainTime } from 'utils/time';
import styles from './styles.module.less';
import { useHomeContext } from '../HomeContext';
import { setLimitAmountDescModal } from '../HomeContext/actions';

function Homogeneous() {
  const { t } = useLanguage();
  // const [, { dispatch }] = useHomeContext();
  const { toWallet, fromWallet } = useWallet();
  const { chainId: toChainId } = toWallet || {};
  const { chainId: fromChainId } = fromWallet || {};
  const time = useMemo(() => getCrossChainTime(fromChainId, toChainId), [toChainId, fromChainId]);
  return (
    <>
      <p>{t('Estimated time of homogeneous cross-chain arrival is2', { time })}</p>
      <p>{t('Tokens will arrive automatically after being sent. Please check them in your wallet')}</p>
    </>
  );
}
function Heterogeneous() {
  const { t } = useLanguage();
  const { isHomogeneous, toWallet, fromWallet } = useWallet();
  const [, { dispatch }] = useHomeContext();
  const { chainId: toChainId } = toWallet || {};
  const { chainId: fromChainId } = fromWallet || {};
  const isHeterogeneousCrossInChain = useMemo(
    () => !isHomogeneous && isELFChain(toChainId),
    [isHomogeneous, toChainId],
  );
  const time = useMemo(() => getCrossChainTime(fromChainId, toChainId), [toChainId, fromChainId]);
  return (
    <>
      {isHeterogeneousCrossInChain ? (
        <>
          <p>{t('Estimated time of arrival in AELF is', { time })}</p>
          <p>{t('Tokens will arrive automatically after being sent. Please check them in your wallet')}</p>
          {/* {!!crossMin && (
            <p>{t('The minimum crosschain amount is', { amount: crossMin, symbol: selectToken?.symbol })}</p>
          )} */}
          <p>{t('The cross-chain transaction fee will be covered by AELF')}</p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      ) : (
        <>
          <p>
            {t(
              'Estimated time of sending tokens is time. Please select Receipt ID and receive the token(s) transferred',
              { time },
            )}
          </p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      )}
    </>
  );
}

export default function Notice() {
  const [activeKey, setActiveKey] = useState<string>('1');
  const { isHomogeneous } = useWallet();
  return (
    <Collapse
      expandIcon={() => <IconFont type="Search" />}
      expandIconPosition="end"
      className={styles.collapse}
      activeKey={activeKey}
      onChange={() => {
        setActiveKey(activeKey ? '' : '1');
      }}>
      <Collapse.Panel
        header={
          <div className={clsx('flex-row-center', 'notice-header')}>
            <IconFont type="Light" />
            <div>
              <Trans>Please note</Trans>
            </div>
          </div>
        }
        key="1">
        <div className={styles.content}>{isHomogeneous ? <Homogeneous /> : <Heterogeneous />}</div>
      </Collapse.Panel>
    </Collapse>
  );
}
