import clsx from 'clsx';
import { useModal } from 'contexts/useModal';
import { setWalletModal } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import WalletList from './WalletList';
export default function WalletModal() {
  const [{ walletModal }, { dispatch }] = useModal();
  return (
    <CommonModal
      width="auto"
      visible={walletModal}
      title={'Connect wallet'}
      onCancel={() => dispatch(setWalletModal(false))}
      className={clsx('modals', 'wallet-modal')}>
      <WalletList />
    </CommonModal>
  );
}
