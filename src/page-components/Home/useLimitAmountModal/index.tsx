import React, { useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { useLanguage } from 'i18n';
import BigNumber from 'bignumber.js';
import { LimitDataProps, tokenFormat } from './constants';
import { useBridgeOutContract, useLimitContract } from 'hooks/useContract';
import { useWallet } from 'contexts/useWallet/hooks';
import { isELFChain } from 'utils/aelfUtils';
import { getShortNameByChainId } from 'utils/chain';
import { getReceiptLimit, getSwapLimit, getSwapId } from 'utils/crossChain';
import { getLimitData } from './api';
import { useHomeContext } from '../HomeContext';
import { divDecimals } from 'utils/calculate';

import styles from './styles.module.less';

export default function useLimitAmountModal() {
  const { t } = useLanguage();

  const [visible, setVisible] = useState<boolean>(false);
  const [modalTxt, setModalTxt] = useState<string>('');

  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId } = fromWallet || {};
  const { chainId: toChainId } = toWallet || {};

  const [{ selectToken }] = useHomeContext();

  const limitContract = useLimitContract(fromChainId, toChainId);
  const bridgeOutContract = useBridgeOutContract(toChainId, toWallet?.isPortkey);

  const fromTokenInfo = useMemo(() => {
    if (!fromChainId) return;
    return selectToken?.[fromChainId];
  }, [fromChainId, selectToken]);

  const toTokenInfo = useMemo(() => {
    if (!toChainId) return;
    return selectToken?.[toChainId];
  }, [toChainId, selectToken]);

  const formChainName = useMemo(() => getShortNameByChainId(fromChainId), [fromChainId]);
  const toChainName = useMemo(() => getShortNameByChainId(toChainId), [toChainId]);

  const getLimitDataByContract = async function (
    type: 'transfer' | 'swap',
    decimals?: number,
  ): Promise<LimitDataProps | undefined> {
    if (!bridgeOutContract || !fromChainId || !toChainId || !toTokenInfo?.symbol) {
      return;
    }

    let response: LimitDataProps | undefined;

    if (type === 'transfer') {
      response = await getReceiptLimit({
        limitContract,
        address: fromTokenInfo?.address,
        toChainId,
      });
    } else {
      const swapId = await getSwapId({ bridgeOutContract, fromChainId, toChainId, toSymbol: toTokenInfo?.symbol });
      response = await getSwapLimit({ limitContract, address: toTokenInfo?.address, fromChainId, swapId });
    }

    if (response) {
      console.log('getLimitDataByContract response after processing decimals', {
        remain: divDecimals(response.remain, decimals).toNumber(),
        maxCapcity: divDecimals(response.maxCapcity, decimals).toNumber(),
        currentCapcity: divDecimals(response.currentCapcity, decimals).toNumber(),
        fillRate: divDecimals(response.fillRate, decimals).toNumber(),
      });

      response = {
        remain: divDecimals(response.remain, decimals),
        maxCapcity: divDecimals(response.maxCapcity, decimals),
        currentCapcity: divDecimals(response.currentCapcity, decimals),
        fillRate: divDecimals(response.fillRate, decimals),
      };
    }

    return response;
  };

  const getLimitDataByGQL = async (decimals?: number): Promise<LimitDataProps | undefined> => {
    const response = await getLimitData({
      fromChainId: formChainName,
      toChainId: toChainName,
      symbol: fromTokenInfo?.symbol,
    });

    if (!response) {
      return;
    }

    console.log('getLimitDataByGQL response after processing decimals', {
      remain: divDecimals(response.remain, decimals).toNumber(),
      maxCapcity: divDecimals(response.maxCapcity, decimals).toNumber(),
      currentCapcity: divDecimals(response.currentCapcity, decimals).toNumber(),
      fillRate: divDecimals(response.fillRate, decimals).toNumber(),
    });

    return {
      remain: divDecimals(response.remain, decimals),
      maxCapcity: divDecimals(response.maxCapcity, decimals),
      currentCapcity: divDecimals(response.currentCapcity, decimals),
      fillRate: divDecimals(response.fillRate, decimals),
    };
  };

  const getElfLimitData = async (type: 'transfer' | 'swap'): Promise<LimitDataProps | undefined> => {
    const promiseArr = [getLimitDataByContract('swap', toTokenInfo?.decimals)];

    if (type === 'transfer') {
      promiseArr.unshift(getLimitDataByGQL(fromTokenInfo?.decimals));
    }
    const results = await Promise.all(promiseArr);

    if (results.some((item) => !item)) {
      return;
    }

    if (type === 'swap') {
      return results[0];
    }

    return calculateMinValue(results[0], results[1]);
  };

  const getEvmLimitData = async (type: 'transfer' | 'swap'): Promise<LimitDataProps | undefined> => {
    const promiseArr = [getLimitDataByGQL(toTokenInfo?.decimals)];
    if (type === 'transfer') {
      promiseArr.push(getLimitDataByContract(type, fromTokenInfo?.decimals));
    }
    const results = await Promise.all(promiseArr);

    if (results.some((item) => !item)) {
      return;
    }

    if (type === 'swap') {
      return results[0];
    }

    return calculateMinValue(results[0], results[1]);
  };

  const calculateMinValue = (
    input1: LimitDataProps | undefined,
    input2: LimitDataProps | undefined,
  ): LimitDataProps | undefined => {
    if (!input1 || !input2) {
      return;
    }
    const response: LimitDataProps = input1;

    if (input1.remain.gt(input2.remain)) {
      response.remain = input2.remain;
    }

    if (input1.currentCapcity.gt(input2.currentCapcity)) {
      response.currentCapcity = input2.currentCapcity;
      response.fillRate = input2.fillRate;
      response.maxCapcity = input2.maxCapcity;
    }

    return response;
  };

  const formatToken = (input: BigNumber, symbol?: string) => {
    if (!symbol || typeof tokenFormat[symbol] === 'undefined') {
      return;
    }

    return input.dp(tokenFormat[symbol]);
  };

  const calculateTime = (input: BigNumber, currentCapcity: BigNumber, fillRate: BigNumber): BigNumber =>
    input.minus(currentCapcity).div(fillRate).idiv(60).plus(1);

  const checkDailyLimit = function (input: BigNumber, { remain }: LimitDataProps): boolean {
    if (remain.isZero()) {
      setModalTxt(
        t('have reached the daily limit', {
          fromChain: formChainName,
          toChain: toChainName,
          tokenSymbol: fromTokenInfo?.symbol,
        }),
      );
      return true;
    }

    if (remain.lt(input)) {
      const amount = formatToken(remain, fromTokenInfo?.symbol);
      setModalTxt(
        t('have a daily limit and your current transaction', {
          fromChain: formChainName,
          toChain: toChainName,
          amount,
          tokenSymbol: fromTokenInfo?.symbol,
        }),
      );
      return true;
    }

    return false;
  };

  const checkCapacity = function (
    input: BigNumber,
    { maxCapcity, currentCapcity, fillRate, isEnable }: LimitDataProps,
  ): boolean {
    if (!isEnable) {
      return false;
    }

    if (maxCapcity.lt(input)) {
      const amount = formatToken(maxCapcity, fromTokenInfo?.symbol);
      setModalTxt(
        t(`Your current transaction exceeds the capacity and can't be processed`, {
          fromChain: formChainName,
          toChain: toChainName,
          amount,
          tokenSymbol: fromTokenInfo?.symbol,
        }),
      );
      return true;
    }

    if (currentCapcity.lt(input)) {
      const amount = formatToken(currentCapcity, fromTokenInfo?.symbol);
      const time = calculateTime(input, currentCapcity, fillRate);
      setModalTxt(
        t('have a maximum capacity and your current transaction exceeds the available capacity', {
          fromChain: formChainName,
          toChain: toChainName,
          amount,
          tokenSymbol: fromTokenInfo?.symbol,
          time,
        }),
      );
      return true;
    }

    return false;
  };

  const checkLimitAndRate = async function (type: 'transfer' | 'swap', amount?: BigNumber | string | number) {
    if (!amount) {
      return true;
    }

    const input = new BigNumber(amount);
    const fn = isELFChain(fromChainId) ? getElfLimitData : getEvmLimitData;
    const response = await fn(type);

    if (!response) {
      return true;
    }

    console.log(
      'remain: ',
      response.remain.toNumber(),
      'maxCapcity: ',
      response.maxCapcity.toNumber(),
      'currentCapcity: ',
      response.currentCapcity.toNumber(),
      'fillRate: ',
      response.fillRate.toNumber(),
    );

    if (checkCapacity(input, response) || checkDailyLimit(input, response)) {
      setVisible(true);
      return true;
    }

    return false;
  };

  const closeModal = () => setVisible(false);

  const limitAmoutModal = useMemo(() => {
    return (
      <CommonModal
        visible={visible}
        onCancel={closeModal}
        title={t('Please Notice')}
        className={styles['limit-amount-modal']}>
        <Row gutter={[0, 24]} justify="center">
          <Col span={24} className={styles['text']}>
            {modalTxt}
          </Col>
          <Col>
            <CommonButton type="primary" onClick={closeModal} className={styles['confirm-btn']}>
              {t('OK')}
            </CommonButton>
          </Col>
        </Row>
      </CommonModal>
    );
  }, [visible, t, modalTxt]);

  return [limitAmoutModal, checkLimitAndRate] as const;
}
