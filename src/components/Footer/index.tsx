import { memo, useMemo } from 'react';
import Link from 'next/link';
import CommonImage from 'components/CommonImage';
import { ebridgeLog } from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.less';
import { useRouter } from 'next/router';

function Footer() {
  const router = useRouter();

  const isHomePage = useMemo(() => router.route === '/', [router]);

  return (
    <div className={clsx(styles['page-footer'], isHomePage && styles['home-page-footer'])}>
      <div className={styles['ebridge-logo-box']}>
        <CommonImage priority src={ebridgeLog} className={styles['ebridge-logo']} />
        eBridge
      </div>
      <div className={styles['page-footer-link']}>
        <Link href="/teamOfService">Terms of Service</Link>
        <Link href="/privacyPolicy">Privacy Policy</Link>
      </div>
    </div>
  );
}

export default memo(Footer);
