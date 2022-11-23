import type { AppProps } from 'next/app';
import '../styles/globals.less';
import '../styles/common.less';
import '../styles/antd.less';
import Header from 'components/Header';
import dynamic from 'next/dynamic';
import PageHead from 'components/PageHead';
const Provider = dynamic(import('components/Provider'), { ssr: false });
// import '../utils/vconsole';
export default function APP({ Component, pageProps }: AppProps) {
  return (
    <>
      <PageHead title={'eBridge'} />
      <Provider>
        <Header />
        <div className="page-component">
          <div className="bg-body">
            <Component {...pageProps} />
          </div>
        </div>
      </Provider>
    </>
  );
}
