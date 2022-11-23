import { Button, message } from 'antd';
import Network from 'components/Network';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';
import { networkList } from 'constants/index';
import { useWalletContext } from 'contexts/useWallet';
import { changeWallet, setFromWallet, setToWallet } from 'contexts/useWallet/actions';
import { switchNetwork } from 'utils/network';
import { useBalances } from 'hooks/useBalances';
import { divDecimals } from 'utils/calculate';
import useDebounceCallback from 'hooks/useDebounceCallback';
import { txMessage } from 'utils/message';
import { useTokenContract } from 'hooks/useContract';
const TransactionId = '3e1fea41a02d73a23ca44d3cb001fcd457c124bb62838469f908927536358217';
export default function Example() {
  const [{ fromWallet, toWallet }, { dispatch }] = useWalletContext();
  const { account: aelfAccount, chainId: fromChainId, aelfInstance } = fromWallet || {};
  const { account, chainId } = toWallet || {};
  const modalDispatch = useModalDispatch();
  const [[fromBalance]] = useBalances(fromWallet, 'ELF');
  const [[toBalance]] = useBalances(toWallet, 'ELF');
  const fromToken = useTokenContract(fromChainId);
  const onChange = useDebounceCallback(() => {
    dispatch(changeWallet());
  }, [dispatch, changeWallet]);
  return (
    <div>
      fromBalance: {divDecimals(fromBalance, 8).toFixed()}
      <br />
      toBalance: {divDecimals(toBalance, 8).toFixed()}
      <br />
      FROM: {aelfAccount}
      <Network
        networkList={networkList}
        chainId={fromChainId}
        onChange={(info) => {
          if (typeof info.chainId === 'string') {
            dispatch(setFromWallet({ chainType: 'ELF', chainId: info.chainId }));
          } else {
            dispatch(setFromWallet({ chainType: 'ERC' }));
          }
          switchNetwork(info);
        }}
      />
      <br />
      TO: {account}
      <Network
        networkList={networkList}
        chainId={chainId}
        onChange={(info) => {
          if (typeof info.chainId === 'string') {
            dispatch(setToWallet({ chainType: 'ELF', chainId: info.chainId }));
          } else {
            dispatch(setToWallet({ chainType: 'ERC' }));
          }
          switchNetwork(info);
        }}
      />
      <br />
      <Button
        type="primary"
        onClick={() => {
          !aelfAccount
            ? modalDispatch(basicModalView.setWalletModal(true, fromWallet?.chainId))
            : modalDispatch(basicModalView.setAccountModal(true, fromWallet?.chainId));
        }}>
        From {fromWallet?.chainId} {account ? 'Wallet' : 'Connect'}
      </Button>
      <Button
        type="primary"
        onClick={() => {
          !account
            ? modalDispatch(basicModalView.setWalletModal(true, toWallet?.chainId))
            : modalDispatch(basicModalView.setAccountModal(true, toWallet?.chainId));
        }}>
        To {toWallet?.chainId} {account ? 'Wallet' : 'Connect'}
      </Button>
      <Button type="primary" onClick={() => dispatch(setFromWallet({ chainType: 'ELF', chainId: fromChainId }))}>
        setFromWallet
      </Button>
      <Button type="primary" onClick={() => dispatch(setToWallet({ chainType: 'ERC', chainId }))}>
        setToWallet
      </Button>
      <Button type="primary" onClick={() => onChange()}>
        changeWallet
      </Button>
      <Button
        type="primary"
        onClick={() => {
          if (!fromChainId) return;
          txMessage({ req: { TransactionId } as any, chainId: fromChainId, copy: true });
        }}>
        message Tx
      </Button>
      <Button type="primary" onClick={() => message.success('asdfsadas')}>
        message Tx
      </Button>
      <Button
        type="primary"
        onClick={async () => {
          const extensionInfo = await aelfInstance?.getExtensionInfo?.();
          console.log(extensionInfo, '=====extensionInfo');
        }}>
        getExtensionInfo
      </Button>
      <Button
        type="primary"
        onClick={async () => {
          const transfer = await fromToken?.callSendMethod('Transfer', '', {
            amount: 1000 * 10 ** 8,
            symbol: 'ELF',
            to: 'bnQqDTkQ8nQPX7qai2fbov5JiZnVyEYDCFpechp1tNMNyD51Y',
          });
          console.log(transfer, '=====transfer');
        }}>
        from Tr
      </Button>
    </div>
  );
}
