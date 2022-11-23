import { Pagination, PaginationProps, Select, SelectProps } from 'antd';
import clsx from 'clsx';
import CommonSelect from 'components/CommonSelect';
import useMediaQueries from 'hooks/useMediaQueries';
import { useLanguage } from 'i18n';
import { useTranslation } from 'react-i18next';
import { NetworkType } from 'types';
import { CrossChainStatus } from 'types/misc';
import styles from './styles.module.less';
const statusList = Object.entries(CrossChainStatus)
  .filter(([, value]) => typeof value !== 'number')
  .map(([value, title]) => ({ value, title }));

export function Content() {
  const { t } = useLanguage();
  return (
    <>
      <div className={clsx(styles['popover-content'])}>
        <p> {t('Heterogeneous chain cross-chain')}</p>
        <p> {t('cross-chain transfer between aelf and other public chains (e.g. aelf to Ethereum)')} </p>
      </div>
      <div className={clsx(styles['popover-content'], 'margin-top-10')}>
        <p> {t('Homogeneous chain cross-chain')}</p>
        <p>
          {' '}
          {t(
            'cross-chain transfer within aelf ecosystem, between MainChain and SideChains (e.g. MainChain AELF to SideChain tDVV) or between different SideChains (e.g. SideChain tDVV to SideChain tDVW)',
          )}
        </p>
      </div>
    </>
  );
}

export function StatusSelect(props: SelectProps) {
  const { t } = useLanguage();
  return (
    <CommonSelect allowClear className={styles.select} placeholder={t('Transaction Status')} {...props}>
      {statusList.map((i) => {
        return (
          <Select.Option key={i.value} value={i.value}>
            {t(i.title as string)}
          </Select.Option>
        );
      })}
    </CommonSelect>
  );
}

export function NetworkSelect({
  networkList,
  ...props
}: SelectProps & {
  networkList: NetworkType[];
}) {
  return (
    <CommonSelect className={styles.select} {...props} allowClear>
      {networkList.map((i) => {
        return (
          <Select.Option key={i.info.chainId} value={i.info.chainId}>
            {i.title}
          </Select.Option>
        );
      })}
    </CommonSelect>
  );
}

export function TablePagination(props: PaginationProps) {
  const isXL = useMediaQueries('xl');
  const isMd = useMediaQueries('md');
  const { t } = useTranslation();
  return (
    <div className={clsx('flex-center', styles.pagination)}>
      <Pagination
        {...props}
        showTotal={(total) => t('records in total', { total })}
        showSizeChanger={false}
        size={isXL ? 'small' : 'default'}
        simple={isMd ? true : undefined}
      />
    </div>
  );
}
