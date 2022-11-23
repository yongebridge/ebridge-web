import { Collapse } from 'antd';
import clsx from 'clsx';
import IconFont from 'components/IconFont';
import { CrossChainTime } from 'constants/misc';
import { useWallet } from 'contexts/useWallet/hooks';
import { useLanguage } from 'i18n';
import { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { isELFChain } from 'utils/aelfUtils';
// import { useHomeContext } from '../HomeContext';
import styles from './styles.module.less';

function Homogeneous() {
  const { t } = useLanguage();
  return (
    <>
      <p>{t('Estimated time of homogeneous cross-chain arrival is2', { time: CrossChainTime.homogeneous })}</p>
      <p>{t('Tokens will arrive automatically after being sent. Please check them in your wallet')}</p>
    </>
  );
}
function Heterogeneous() {
  const { t } = useLanguage();
  const { isHomogeneous, toWallet } = useWallet();
  const { chainId } = toWallet || {};
  // const [{ crossMin, selectToken }] = useHomeContext();
  const isHeterogeneousCrossInChain = useMemo(() => !isHomogeneous && isELFChain(chainId), [isHomogeneous, chainId]);

  return (
    <>
      {isHeterogeneousCrossInChain ? (
        <>
          <p>{t('Estimated time of arrival in AELF is 500s')}</p>
          <p>{t('Tokens will arrive automatically after being sent. Please check them in your wallet')}</p>
          {/* {!!crossMin && (
            <p>{t('The minimum crosschain amount is', { amount: crossMin, symbol: selectToken?.symbol })}</p>
          )} */}
          <p>{t('The cross-chain transaction fee will be covered by AELF')}</p>
        </>
      ) : (
        <p>
          {t('Estimated time of sending tokens is 500s. Please select Receipt ID and receive the token(s) transferred')}
        </p>
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
