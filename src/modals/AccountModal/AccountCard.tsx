import { Button, Card, Col, message, Row } from 'antd';
import { useCallback, useMemo } from 'react';
import { injected } from '../../walletConnectors';
import { getExploreLink, shortenAddress } from '../../utils';
import Copy from '../../components/Copy';
import CommonLink from '../../components/CommonLink';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { useAEflConnect } from 'hooks/web3';
import { useMobile } from 'contexts/useStore/hooks';
import { isELFChain } from 'utils/aelfUtils';
import WalletIcon from 'components/WalletIcon';
import { SUPPORTED_WALLETS } from 'constants/wallets';

function AccountCard() {
  const [{ accountWallet }, { dispatch }] = useModal();
  const { connector, account, chainId, deactivate, aelfInstance } = accountWallet || {};
  const connect = useAEflConnect();
  const isMobile = useMobile();
  const filter = useCallback(
    (k: string) => {
      const isMetaMask = !!window.ethereum?.isMetaMask;
      return (
        SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      );
    },
    [connector],
  );
  const formatConnectorName = useMemo(() => {
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter((k) => filter(k))
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return `Connected with ${name}`;
  }, [filter]);
  const onDisconnect = useCallback(() => {
    if (typeof connector !== 'string') {
      connector?.deactivate ? connector.deactivate() : connector?.resetState();
    } else {
      deactivate?.();
    }
    dispatch(basicModalView.setWalletModal(true, chainId));
  }, [connector, deactivate, dispatch, chainId]);

  const changeWallet = useCallback(async () => {
    try {
      if (typeof chainId !== 'string') return dispatch(basicModalView.setWalletModal(true, chainId));
      await deactivate?.();
      dispatch(basicModalView.setAccountModal(false));
      connect();
    } catch (error: any) {
      console.debug(`connection error: ${error}`);
      message.error(`connection error: ${error.message}`);
    }
  }, [chainId, connect, deactivate, dispatch]);
  const isELF = isELFChain(chainId);
  return (
    <>
      <p>{formatConnectorName}</p>
      <Card className="account-modal-card">
        <Row justify="space-between">
          {account ? (
            <span className="flex-row-center account-modal-account">
              <WalletIcon connector={connector} />
              {shortenAddress(account, undefined, isELF ? 50 : undefined)}
            </span>
          ) : null}
          {account ? (
            <Copy className="account-modal-copy cursor-pointer" toCopy={account}>
              Copy Address
            </Copy>
          ) : null}
        </Row>
        {chainId && account ? (
          <CommonLink href={getExploreLink(account, 'address', chainId)}>
            {isELF ? 'View on explorer.aelf.io' : 'View on Etherscan'}
          </CommonLink>
        ) : null}
      </Card>
      {aelfInstance?.connect ? null : (
        <Col span={24}>
          <Row justify="space-between" className="account-modal-button">
            <Button type="primary" onClick={onDisconnect}>
              Disconnect
            </Button>
            <Button type="primary" onClick={changeWallet}>
              Change
            </Button>
          </Row>
        </Col>
      )}
    </>
  );
}

export default AccountCard;
