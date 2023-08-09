import GoogleAnalytics from 'components/GoogleAnalytics';
import Head from 'next/head';
import React from 'react';
export type DefaultHeadProps = { title?: string; description?: string };

export default function PageHead(props: DefaultHeadProps) {
  return (
    <>
      <GoogleAnalytics id={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
      <DefaultHead {...props} />
    </>
  );
}

export function DefaultHead({ title = 'eBridge', description }: DefaultHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="viewport"
        content="width=device-width,height=device-height,inital-scale=1.0,maximum-scale=1.0,user-scalable=no;"
      />
      <meta name="description" content={description || title} />
    </Head>
  );
}
