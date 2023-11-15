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
      console.log(
        'getLimitDataByContract response after processing decimals \n',
        JSON.stringify(
          {
            remain: divDecimals(response.remain, decimals),
            maxCapcity: divDecimals(response.maxCapcity, decimals),
            currentCapcity: divDecimals(response.currentCapcity, decimals),
            fillRate: divDecimals(response.fillRate, decimals),
            isEnable: response.isEnable,
          },
          null,
          4,
        ),
      );

      response = {
        remain: divDecimals(response.remain, decimals),
        maxCapcity: divDecimals(response.maxCapcity, decimals),
        currentCapcity: divDecimals(response.currentCapcity, decimals),
        fillRate: divDecimals(response.fillRate, decimals),
        isEnable: response.isEnable,
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

    console.log(
      'getLimitDataByGQL response after processing decimals\n',
      JSON.stringify(
        {
          remain: divDecimals(response.remain, decimals),
          maxCapcity: divDecimals(response.maxCapcity, decimals),
          currentCapcity: divDecimals(response.currentCapcity, decimals),
          fillRate: divDecimals(response.fillRate, decimals),
          isEnable: response.isEnable,
        },
        null,
        4,
      ),
    );

    return {
      remain: divDecimals(response.remain, decimals),
      maxCapcity: divDecimals(response.maxCapcity, decimals),
      currentCapcity: divDecimals(response.currentCapcity, decimals),
      fillRate: divDecimals(response.fillRate, decimals),
      isEnable: response.isEnable,
    };
  };

  const getElfLimitDataFn = (type: 'transfer' | 'swap'): Array<any> => {
    const promiseList = [getLimitDataByContract('swap', toTokenInfo?.decimals)];
    if (type === 'transfer') {
      promiseList.push(getLimitDataByGQL(fromTokenInfo?.decimals));
    }
    return promiseList;
  };

  const getEvmLimitDataFn = (type: 'transfer' | 'swap'): Array<any> => {
    const promiseList = [getLimitDataByGQL(toTokenInfo?.decimals)];
    if (type === 'transfer') {
      promiseList.push(getLimitDataByContract(type, fromTokenInfo?.decimals));
    }
    return promiseList;
  };

  const formatToken = (input: BigNumber, symbol?: string) => {
    if (!symbol || typeof tokenFormat[symbol] === 'undefined') {
      return;
    }
    return input.dp(tokenFormat[symbol], BigNumber.ROUND_DOWN);
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

  const calculateMinValue = (
    input1: LimitDataProps | undefined,
    input2: LimitDataProps | undefined,
  ): LimitDataProps | undefined => {
    if (!input1) {
      return;
    }

    if (!input2) {
      return input1;
    }

    if (input1.remain.gt(input2.remain)) {
      input1.remain = input2.remain;
    }

    if (input1.isEnable && input2.isEnable) {
      if (input1.currentCapcity.gt(input2.currentCapcity)) {
        input1.currentCapcity = input2.currentCapcity;
        input1.fillRate = input2.fillRate;
        input1.maxCapcity = input2.maxCapcity;
      }
    } else if (input2.isEnable) {
      input1.currentCapcity = input2.currentCapcity;
      input1.fillRate = input2.fillRate;
      input1.maxCapcity = input2.maxCapcity;
      input1.isEnable = input2.isEnable;
    }

    return input1;
  };

  const checkLimitAndRate = async function (
    type: 'transfer' | 'swap',
    amount?: BigNumber | string | number,
  ): Promise<boolean> {
    if (!amount) {
      return true;
    }

    const input = new BigNumber(amount);

    const promistList = isELFChain(fromChainId) ? getElfLimitDataFn(type) : getEvmLimitDataFn(type);
    const results: Array<LimitDataProps> = await Promise.all(promistList);

    if (results.some((item) => !item)) {
      return true;
    }

    const limitAndRateData = calculateMinValue(results[0], results[1]);
    if (!limitAndRateData) {
      return true;
    }

    console.log(
      'checkLimitAndRate \n',
      JSON.stringify(
        {
          remain: limitAndRateData.remain.toNumber(),
          maxCapcity: limitAndRateData.maxCapcity.toNumber(),
          currentCapcity: limitAndRateData.currentCapcity.toNumber(),
          fillRate: limitAndRateData.fillRate.toNumber(),
          isEnable: limitAndRateData.isEnable,
        },
        null,
        4,
      ),
    );

    if (checkCapacity(input, limitAndRateData) || checkDailyLimit(input, limitAndRateData)) {
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
