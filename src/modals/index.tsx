import dynamic from 'next/dynamic';
import WalletModal from './WalletModal';
const AccountModal = dynamic(import('./AccountModal'), { ssr: false });
export default function Modals() {
  return (
    <>
      <WalletModal />
      <AccountModal />
    </>
  );
}
