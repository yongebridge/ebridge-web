import { useMemo } from 'react';
import { useLanguage } from 'i18n';
import { ReceiptRateLimitsInfo } from './contants';

import styles from './styles.module.less';
import { ChainId } from 'types';

export function useReceiptColumns() {
  const { t } = useLanguage();

  return useMemo(
    () => [
      {
        title: 'Token',
        width: 148,
        key: 'token',
        dataIndex: 'token',
        render: (token: string) => <span className={styles['table-data']}>{token}</span>,
      },
      {
        title: 'Allowance',
        key: 'allowance',
        dataIndex: 'allowance',
        render: (allowance: number) => (
          <span className={styles['table-data']}>{t('About allowance', { allowance })}</span>
        ),
      },
    ],
    [t],
  );
}

export function useSwapColumns() {
  const { t } = useLanguage();

  return useMemo(
    () => [
      {
        title: 'Token',
        width: 148,
        key: 'token',
        dataIndex: 'token',
        render: (token: string) => <span className={styles['table-data']}>{token}</span>,
      },
      {
        title: 'Attributes',
        key: 'allowance',
        dataIndex: 'allowance',
        render: (fromChain: ChainId, { capacity, token, refillRate, maximumTimeConsumed }: ReceiptRateLimitsInfo) => (
          <span className={styles['table-data']}>
            {t('Rate limit capacity', { capacity, token })}
            <br />
            {t('Rate limit refill rate', { refillRate, token })}
            <span className={styles['table-data-sub']}>
              {t('Rate limit refill rate desc', { token, maximumTimeConsumed })}
            </span>
          </span>
        ),
      },
    ],
    [t],
  );
}
