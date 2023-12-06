import { useChain } from 'contexts/useChain';
import { useModal } from 'contexts/useModal';
import { usePortkeyReact } from 'contexts/usePortkey/provider';
import { useCallback } from 'react';
import { ChainId } from 'types';
import { isSelectPortkey } from 'utils/portkey';
import { basicModalView } from 'contexts/useModal/actions';

export default function useCheckPortkeyStatus() {
  const { checkWalletConnect } = usePortkeyReact();
  const [{ selectELFWallet }] = useChain();
  const [, { dispatch }] = useModal();

  const checkPortketConnect = useCallback(
    async (chainId: ChainId) => {
      if (!isSelectPortkey(selectELFWallet)) {
        return true;
      }

      const status = await checkWalletConnect(chainId);

      if (!status) {
        dispatch(
          basicModalView.setPortketNotConnectModal({
            visible: true,
            chainId,
          }),
        );
      }

      return status;
    },
    [checkWalletConnect, dispatch, selectELFWallet],
  );

  return { checkPortketConnect };
}
