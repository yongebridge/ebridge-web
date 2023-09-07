import { Row, Select } from 'antd';
import clsx from 'clsx';
import CommonSelect from 'components/CommonSelect';
import IconFont from 'components/IconFont';
import { useWallet } from 'contexts/useWallet/hooks';
import { useHomeContext } from '../HomeContext';
import { setFrom, setReceiveId, setSelectModal, setTo, setToChecked, setToAddress } from '../HomeContext/actions';
import InputRow from './InputRow';
import CheckBoxInputRow from './CheckBoxInputRow';
import styles from './styles.module.less';
import animation from './animation.module.less';
import WalletRow from './WalletRow';
import { FromHeader, SelectButton, ToHeader } from './components';
import { unitConverter } from 'utils/converter';
import { parseInputChange, sliceDecimals } from 'utils/input';
import { useMemo } from 'react';
import { divDecimals } from 'utils/calculate';
import { Trans } from 'react-i18next';
import { useLanguage } from 'i18n';
import useMediaQueries from 'hooks/useMediaQueries';
import { ZERO } from 'constants/misc';
import { isAddress } from 'utils';
import { useWalletContext } from 'contexts/useWallet';
import { isPortkey } from 'utils/portkey';

export function FromCard() {
  const [{ selectToken, fromInput, fromBalance, crossMin }, { dispatch }] = useHomeContext();
  const [{ fromOptions }] = useWalletContext();

  const { fromWallet, changing } = useWallet();
  const { chainId, account } = fromWallet || {};
  const { token, show } = fromBalance || {};
  const isMD = useMediaQueries('md');
  const min = useMemo(() => {
    const min = divDecimals(1, token?.decimals);
    // if (crossMin && min.lt(crossMin)) return ZERO.plus(crossMin);
    return min;
  }, [token?.decimals]);
  const showError = useMemo(
    () =>
      fromInput &&
      account &&
      ((fromBalance?.show && fromBalance.show.lt(fromInput)) || (crossMin && ZERO.plus(crossMin).gt(fromInput))),
    [account, crossMin, fromBalance?.show, fromInput],
  );
  return (
    <div
      className={clsx(styles.card, styles['from-card'], {
        [animation.admin1]: changing,
      })}>
      <FromHeader />
      <Row>
        <WalletRow isForm wallet={fromWallet} chainType={fromOptions?.chainType} />
        <InputRow
          className={clsx({ [styles['red-input']]: !changing && showError })}
          value={fromInput}
          onChange={(e) => {
            dispatch(setFrom(parseInputChange(e.target.value, min, token?.decimals)));
          }}
        />
        <SelectButton
          onClick={() => dispatch(setSelectModal(true))}
          title={selectToken?.symbol}
          symbol={selectToken?.symbol}
          chainId={chainId}
        />
      </Row>
      <Row justify={isMD ? 'start' : 'end'} className={styles['balance-row']}>
        <Trans>Balance</Trans>
        {unitConverter(show)} {selectToken?.symbol}
      </Row>
    </div>
  );
}

export function ToCard() {
  const { toWallet, changing, isHomogeneous } = useWallet();
  const [{ toOptions }] = useWalletContext();
  const { account, chainId } = toWallet || {};
  const [{ selectToken, toInput, receiveList, receiveId, toChecked, toAddress }, { dispatch }] = useHomeContext();
  const token = chainId ? selectToken?.[chainId] : undefined;
  const min = useMemo(() => divDecimals(1, token?.decimals), [token?.decimals]);
  const { t } = useLanguage();
  return (
    <div className={clsx(styles.card, { [animation.admin2]: changing })}>
      <ToHeader />
      <Row>
        <WalletRow wallet={toWallet} chainType={toOptions?.chainType} />
        <InputRow
          value={sliceDecimals(toInput, token?.decimals ?? 6)}
          onChange={(e) => dispatch(setTo(parseInputChange(e.target.value, min, token?.decimals)))}
        />
        <SelectButton
          onClick={() => dispatch(setSelectModal(true))}
          title={selectToken?.symbol}
          symbol={selectToken?.symbol}
          chainId={chainId}
        />
      </Row>
      {!isHomogeneous && (
        <CheckBoxInputRow
          className={clsx({ [styles['red-input']]: toChecked && toAddress && !isAddress(toAddress, chainId) })}
          checked={toChecked}
          value={toAddress}
          onCheckStatusTrigger={(e) => dispatch(setToChecked(e.target.checked))}
          onInputChange={(e) => dispatch(setToAddress(e.target.value))}
        />
      )}
      {!!account && !isPortkey() && (
        <div className={clsx('flex-row-between', styles['receipt-row'])}>
          <div className={styles['receipt-title']}>
            <Trans>Select a Receipt ID</Trans>
          </div>
          <CommonSelect
            value={receiveId}
            onChange={(value) => dispatch(setReceiveId(value))}
            allowClear
            placeholder={t('Select a Receipt ID')}
            suffixIcon={<IconFont className="pointer-events-none" type="Search" />}>
            {receiveList?.map((item) => {
              return (
                <Select.Option key={item.id} value={item.id}>
                  #{item.id?.slice(25)}
                  {/* {item.fromChainId}-{item.toChainId}{' '}
                  {unitConverter({ num: item.transferAmount, minDecimals: item.transferToken?.decimals })}{' '}
                  {item.transferToken?.symbol} */}
                </Select.Option>
              );
            })}
          </CommonSelect>
        </div>
      )}
    </div>
  );
}
