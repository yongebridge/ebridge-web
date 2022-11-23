import { Button, message } from 'antd';
import { useCallback, useState } from 'react';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';
import clsx from 'clsx';
import { useAEflConnect } from 'hooks/web3';
import { Connector } from '@web3-react/types';
import { useChain } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectERCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
export default function WalletList() {
  const [{ walletWallet }] = useModal();
  const { chainId, connector: connectedConnector, account } = walletWallet || {};
  const connect = useAEflConnect();
  const [loading, setLoading] = useState<any>();
  const dispatch = useModalDispatch();
  const [, { dispatch: chainDispatch }] = useChain();
  const onCancel = useCallback(() => {
    setLoading(undefined);
    dispatch(basicModalView.setWalletModal(false));
  }, [dispatch]);
  const tryActivation = useCallback(
    async (connector: Connector | string, key: string) => {
      if (loading) return;
      setLoading({ [key]: true });
      try {
        if (typeof connector === 'string') {
          await connect();
        } else {
          await connector.activate();
          chainDispatch(setSelectERCWallet(getConnection(connector).type));
        }
        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        message.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, connect, loading, onCancel],
  );
  return (
    <>
      {Object.keys(SUPPORTED_WALLETS)
        .filter((key) => {
          const option = SUPPORTED_WALLETS[key];
          const isStringConnector = typeof option.connector === 'string';
          const isStringChain = typeof chainId === 'string';
          return isStringConnector ? isStringChain : !isStringChain;
        })
        .map((key) => {
          const option = SUPPORTED_WALLETS[key];
          const disabled = !!(account && option.connector && option.connector === connectedConnector);
          return (
            <Button
              className={clsx(disabled && 'selected')}
              disabled={disabled}
              loading={loading?.[option.name]}
              key={option.name}
              onClick={() => {
                tryActivation(option.connector, option.name);
              }}>
              <div>{option.name}</div>
              <IconFont className="wallet-icon" type={option.iconType} />
            </Button>
          );
        })}
    </>
  );
}
