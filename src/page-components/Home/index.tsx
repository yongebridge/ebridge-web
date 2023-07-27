import React, { useEffect } from 'react';
import { FromCard, ToCard } from './Card';
import HomeProvider from './HomeContext';
import SelectTokenModal from './SelectTokenModal';
import AddTokenModal from './AddTokenModal';
import Notice from './Notice';
import ActionButton from './ActionButton';
import ChangeIcon from './ChangeIcon';
import styles from './styles.module.less';
import History from './History';
import useMediaQueries from 'hooks/useMediaQueries';
import { useLanguage } from 'i18n';
import PageHead from 'components/PageHead';
import { Notification, NotificationForPhone } from 'components/Notification';
import Mask from './Mask';
// import { baseRequest } from 'api';
export default function Home() {
  const isMd = useMediaQueries('md');
  const flag = false;
  const { t } = useLanguage();

  console.log('xxxxx');

  useEffect(() => {
    async function fetchData() {
      // await baseRequest({
      //   url: `http://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/page/initData`,
      //   // params: { address },
      //   method: 'GET',
      // });
      await fetch(`https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com/api/amis-mock/mock2/page/initData`);
    }
    fetchData();
  }, []);
  return (
    <HomeProvider>
      <PageHead title={t('Token Bridge')} />
      {flag ? (
        <>
          <div className={styles.body}>
            {isMd && <h2 className={styles.title}>{t('Token Bridge')}</h2>}
            <FromCard />
            <ChangeIcon />
            <ToCard />
            <Notice />
            {!isMd && <ActionButton />}
            <History />
          </div>
          {isMd && <ActionButton />}
          <SelectTokenModal />
          <AddTokenModal />
          {isMd ? <NotificationForPhone /> : <Notification />}
        </>
      ) : (
        <Mask />
      )}
    </HomeProvider>
  );
}
