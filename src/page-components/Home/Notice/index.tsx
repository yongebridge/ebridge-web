import { Collapse } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import { useWallet } from 'contexts/useWallet/hooks';
import { useLanguage } from 'i18n';
import { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { isELFChain } from 'utils/aelfUtils';
import { getCrossChainTime } from 'utils/time';
import { SUPPORTED_TRON_CHAIN_IDS, SUPPORTED_ELF_CHAIN_IDS } from 'constants/chain';
import styles from './styles.module.less';
import { useHomeContext } from '../HomeContext';
import { setLimitAmountDescModal } from '../HomeContext/actions';
import { getChainIdToMap } from 'utils/chain';

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
      <p>{t('Tokens will arrive automatically after being sent')}</p>
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

  const getContent = () => {
    if (isHeterogeneousCrossInChain) {
      return (
        <>
          <p>{t('Estimated time of arrival in AELF is', { time })}</p>
          <p>
            {t('Tokens will arrive automatically after being sent. Please check them in your wallet', {
              fromChain: getChainIdToMap(fromChainId),
            })}
          </p>
          <p>{t('The cross-chain transaction fee will be covered by AELF')}</p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      );
    } else if (
      SUPPORTED_ELF_CHAIN_IDS.some((item) => item === fromChainId) &&
      SUPPORTED_TRON_CHAIN_IDS.some((item) => item === toChainId)
    ) {
      return (
        <>
          <p>{t('Estimated time of arrival is', { time })}</p>
          <p>{t('Once the token is sent cross-chain', { toChain: getChainIdToMap(toChainId) })}</p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      );
    } else if (
      SUPPORTED_TRON_CHAIN_IDS.some((item) => item === fromChainId) &&
      SUPPORTED_ELF_CHAIN_IDS.some((item) => item === toChainId)
    ) {
      return (
        <>
          <p>{t('Estimated time of arrival in AELF is', { time })}</p>
          <p>
            {t('Tokens will arrive automatically after being sent. Please check them in your wallet TRC', {
              fromChain: getChainIdToMap(fromChainId),
            })}
          </p>
          <p>{t('The cross-chain transaction fee will be covered by AELF TRC')}</p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      );
    } else {
      return (
        <>
          <p>
            {t(
              'Estimated time of sending tokens is time. Please select Receipt ID and receive the token(s) transferred',
              { time },
            )}
          </p>
          <p>{t('Once the token is sent cross-chain', { toChain: getChainIdToMap(toChainId) })}</p>
          <p>
            <a className={styles['limit-amount-desc']} onClick={() => dispatch(setLimitAmountDescModal(true))}>
              {t('eBridge limit rules')}
            </a>
          </p>
        </>
      );
    }
  };

  return <>{getContent()}</>;
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
