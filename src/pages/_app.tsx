import type { AppProps } from 'next/app';
import '../styles/globals.less';
import '../styles/common.less';
import '../styles/antd.less';
import '../utils/sentry';
// import '../utils/vconsole';

import Header from 'components/Header';
import dynamic from 'next/dynamic';
import { DefaultHead } from 'components/PageHead';
import { isPortkey } from 'utils/portkey';
import Footer from 'components/Footer';
const Provider = dynamic(import('components/Provider'), { ssr: false });
export default function APP({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultHead />
      <Provider>
        {!isPortkey() && <Header />}
        <div className="page-component">
          <div className="bg-body">
            <Component {...pageProps} />
            <Footer />
          </div>
        </div>
      </Provider>
    </>
  );
}
