import { AElfReactProvider } from '@aelf-react/core';
import { Web3ReactHooks, Web3ReactProvider } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { AElfNodes } from 'constants/aelf';
import { APP_NAME } from 'constants/misc';
import { useChain } from 'contexts/useChain';
import useOrderedConnections from 'hooks/useOrderedConnections';
import { useAEflConnect } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { Connection, network } from 'walletConnectors';
import { getConnection, getConnectionName } from 'walletConnectors/utils';

const connect = async (connector: Connector) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`);
  }
};

function Web3Manager({ children }: { children: JSX.Element }) {
  const aelfConnect = useAEflConnect();
  const [{ selectERCWallet }] = useChain();
  const tryAElf = useCallback(async () => {
    try {
      await aelfConnect(true);
    } catch (error) {
      console.debug(error, '=====error');
    }
  }, [aelfConnect]);
  const tryERC = useCallback(async () => {
    try {
      connect(network);
      if (selectERCWallet) connect(getConnection(selectERCWallet).connector);
    } catch (error: any) {
      console.debug(error, '=====error');
    }
  }, [selectERCWallet]);
  useEffectOnce(() => {
    tryAElf();
    tryERC();
  });
  return children;
}

export default function Web3Provider({ children }: { children: JSX.Element }) {
  const connections = useOrderedConnections();
  const connectors: [Connector, Web3ReactHooks][] = connections.map(({ hooks, connector }) => [connector, hooks]);
  const key = useMemo(
    () => connections.map(({ type }: Connection) => getConnectionName(type)).join('-'),
    [connections],
  );
  return (
    <Web3ReactProvider connectors={connectors} key={key}>
      <AElfReactProvider appName={APP_NAME} nodes={AElfNodes}>
        <Web3Manager>{children}</Web3Manager>
      </AElfReactProvider>
    </Web3ReactProvider>
  );
}
