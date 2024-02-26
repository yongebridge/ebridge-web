import { Button } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { ConnectionType } from 'walletConnectors';
import { basicModalView } from 'contexts/useModal/actions';
import clsx from 'clsx';
import { useAEflConnect, usePortkeyConnect, useTRCWeb } from 'hooks/web3';
import { Connector } from '@web3-react/types';
import { useChainDispatch } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { setSelectELFWallet, setSelectERCWallet, setSelectTRCWallet } from 'contexts/useChain/actions';
import IconFont from 'components/IconFont';
import { SUPPORTED_WALLETS } from 'constants/wallets';
import { getConnection } from 'walletConnectors/utils';
import { CoinbaseWallet } from '@web3-react/coinbase-wallet';
import { TronLink } from '@web3-react/tron-link';

import { DEFAULT_ERC_CHAIN_INFO, DEFAULT_TRC_CHAIN_INFO } from 'constants/index';
import { switchChain } from 'utils/network';
import { sleep } from 'utils';
import { isPortkey, isPortkeyConnector } from 'utils/portkey';
import { MetaMask } from '@web3-react/metamask';
import CommonMessage from 'components/CommonMessage';
export default function WalletList() {
  const [{ walletWallet, walletChainType }] = useModal();
  const { chainId, connector: connectedConnector, account } = walletWallet || {};
  const connect = useAEflConnect();
  const portkeyConnect = usePortkeyConnect();
  const [loading, setLoading] = useState<any>();
  const dispatch = useModalDispatch();
  const trcWebWallet = useTRCWeb();
  const chainDispatch = useChainDispatch();
  const onCancel = useCallback(() => {
    setLoading(undefined);
    dispatch(basicModalView.setWalletModal(false));
  }, [dispatch]);
  const tryActivation = useCallback(
    async (connector: Connector | string, key: string, version?: string) => {
      if (loading) return;
      setLoading({ [key]: true });
      try {
        switch (key) {
          case 'Coinbase Wallet':
            if (connector instanceof CoinbaseWallet) {
              await sleep(500);
              await switchChain(DEFAULT_ERC_CHAIN_INFO as any, connector, true);
            }
            break;
          case 'TRONLINK':
            await sleep(500);
            localStorage.setItem('isTronDisconnected', JSON.stringify(false));
            chainDispatch(setSelectTRCWallet(ConnectionType.TRON_LINK));
            await switchChain(DEFAULT_TRC_CHAIN_INFO as any, connector, true, undefined, trcWebWallet.account);
            break;
          default:
            if (typeof connector === 'string') {
              if (isPortkeyConnector(connector) && version) {
                await portkeyConnect(version);
                chainDispatch(setSelectELFWallet('PORTKEY'));
              } else {
                await connect();
                chainDispatch(setSelectELFWallet('NIGHTELF'));
              }
            } else {
              try {
                delete (connector as any).eagerConnection;
              } catch (error) {
                // fix network error
              }

              await connector.activate();
              chainDispatch(setSelectERCWallet(getConnection(connector)?.type));
            }
            if (connector instanceof CoinbaseWallet) {
              await sleep(500);
              await switchChain(DEFAULT_ERC_CHAIN_INFO as any, connector, true);
            }
        }
        onCancel();
      } catch (error: any) {
        console.debug(`connection error: ${error}`);
        CommonMessage.error(`connection error: ${error.message}`);
      }
      setLoading(undefined);
    },
    [chainDispatch, connect, loading, onCancel, portkeyConnect],
  );

  const walletList = useMemo(
    () =>
      Object.keys(SUPPORTED_WALLETS).filter((key) => {
        const option = SUPPORTED_WALLETS[key];
        const isStringConnector = typeof option.connector === 'string';
        const isStringChain = typeof chainId === 'string' || walletChainType === 'ELF';
        if (walletChainType == 'TRC') {
          return option.name == SUPPORTED_WALLETS.TRON_LINK.name;
        }
        if (isPortkey()) {
          if (isStringChain) return isPortkeyConnector(option.connector as string);
          if (!isStringConnector)
            return !(option.connector instanceof MetaMask || option.connector instanceof TronLink);
        }
        return isStringConnector
          ? isStringChain
          : option.name == SUPPORTED_WALLETS.TRON_LINK.name
          ? false
          : !isStringChain;
      }),
    [chainId, walletChainType],
  );

  return (
    <>
      {walletList.map((key) => {
        const option = SUPPORTED_WALLETS[key];
        const disabled = !!(account && option.connector && option.connector === connectedConnector);
        return (
          <Button
            className={clsx(disabled && 'selected')}
            disabled={disabled}
            loading={loading?.[option.name]}
            key={option.name}
            onClick={() => {
              tryActivation(option.connector, option.name, option?.version);
            }}>
            <div>{option.name}</div>
            <IconFont className="wallet-icon" type={option.iconType} />
          </Button>
        );
      })}
    </>
  );
}
