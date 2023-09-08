import { Button, Divider, message, Row } from 'antd';
import clsx from 'clsx';
import Network from 'components/Network';
import WalletIcon from 'components/WalletIcon';
import { NetworkList } from 'constants/index';
import { setAccountModal, setWalletModal } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { setFromWallet, setToWallet } from 'contexts/useWallet/actions';
import { useWalletActions } from 'contexts/useWallet/hooks';
import useMediaQueries from 'hooks/useMediaQueries';
import { useWeb3 } from 'hooks/web3';
import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { ChainType, Web3Type } from 'types';
import { shortenString } from 'utils';
import { isELFChain } from 'utils/aelfUtils';
import { switchChain } from 'utils/network';
import styles from './styles.module.less';
import { useChain } from 'contexts/useChain';
import { isPortkey } from 'utils/portkey';

function WalletRow({ wallet, isForm, chainType }: { wallet?: Web3Type; isForm?: boolean; chainType?: ChainType }) {
  const { dispatch } = useWalletActions();
  const { connector: web3Connector } = useWeb3();
  const { chainId, account, connector } = wallet || {};
  const [{ selectELFWallet }] = useChain();
  const modalDispatch = useModalDispatch();
  const isMd = useMediaQueries('md');
  const isXS = useMediaQueries('xs');

  const renderRightBtn = useMemo(() => {
    if (account && isPortkey() && isELFChain(chainId)) {
      return null;
    }

    return (
      <>
        <Divider type="vertical" className={styles['wallet-divider']} />
        {account ? (
          <Row
            onClick={() =>
              modalDispatch(
                setAccountModal(true, {
                  accountWalletType: wallet?.walletType,
                  accountChainId: chainId,
                }),
              )
            }
            className={clsx('cursor-pointer', 'flex-row-center', styles['wallet-account-row'])}>
            <WalletIcon connector={connector} className={styles['wallet-icon']} />
            {shortenString(account, isXS ? 3 : isMd ? 4 : 5)}
          </Row>
        ) : (
          <Button
            className={styles['wallet-row-btn']}
            type="primary"
            onClick={() =>
              modalDispatch(
                setWalletModal(true, {
                  walletWalletType: wallet?.walletType,
                  walletChainType: chainType,
                  walletChainId: chainId,
                }),
              )
            }>
            <Trans>Connect</Trans>
          </Button>
        )}
      </>
    );
  }, [account, chainId, chainType, connector, isMd, isXS, modalDispatch, wallet?.walletType]);

  return (
    <Row className={styles['wallet-row']}>
      <Network
        className={clsx(styles['network'], { [styles['wallet-connected']]: account })}
        chainId={chainId}
        networkList={NetworkList}
        onChange={async (info) => {
          const setWallet = isForm ? setFromWallet : setToWallet;
          if (typeof info.chainId === 'string') {
            dispatch(setWallet({ chainType: 'ELF', chainId: info.chainId, isPortkey: selectELFWallet === 'PORTKEY' }));
          } else {
            dispatch(setWallet({ chainType: 'ERC' }));
          }
          try {
            await switchChain(info, !isELFChain(info.chainId) ? web3Connector : connector, !!account);
          } catch (error: any) {
            message.error(error.message);
          }
        }}
      />
      {renderRightBtn}
    </Row>
  );
}

export default memo(WalletRow);
