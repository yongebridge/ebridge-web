import clsx from 'clsx';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useState } from 'react';
import { ChainId } from 'types';
import { getTokenLogoURL } from 'utils';
import styles from './styles.module.less';
const BAD_SRCS: { [src: string]: true } = {};

export default function TokenLogo({
  chainId,
  symbol,
  className,
  src = getTokenLogoURL(symbol, chainId),
  alt = 'logo',
  layout = 'fill',
  style,
  onClick,
  ...props
}: {
  style?: ImageProps['style'];
  layout?: ImageProps['layout'];
  alt?: string;
  src?: string;
  chainId?: ChainId;
  symbol?: string;
  className?: string;
  onClick?: ImageProps['onClick'];
}) {
  const [, refresh] = useState<number>(0);
  // Need to upload TRON logo image for select token modal
  // EXAMPLE TRON - https://raw.githubusercontent.com/eBridgeCrosschain/assets/master/blockchains/AELF/assets/TRX/logo.png - Not working
  // EXAMPLE BNB - https://raw.githubusercontent.com/eBridgeCrosschain/assets/master/blockchains/AELF/assets/BNB/logo.png - working
  const tmpSrc = BAD_SRCS[src] ? undefined : src;
  return (
    <div
      className={clsx(
        {
          [styles['token-logo']]: true,
          [styles['token-bad']]: !tmpSrc,
        },
        className,
      )}
      style={style}
      onClick={onClick}>
      {!tmpSrc ? (
        <span>{symbol?.[0]}</span>
      ) : (
        <Image
          {...props}
          onError={() => {
            if (src) BAD_SRCS[src] = true;
            refresh((i) => i + 1);
          }}
          src={src}
          layout={layout}
          alt={alt}
        />
      )}
    </div>
  );
}
