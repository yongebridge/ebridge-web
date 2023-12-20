import dynamic from 'next/dynamic';
import WalletModal from './WalletModal';
import PortkeyNotConnectModal from './PortkeyNotConnectModal';
const AccountModal = dynamic(import('./AccountModal'), { ssr: false });
export default function Modals() {
  return (
    <>
      <WalletModal />
      <AccountModal />
      <PortkeyNotConnectModal />
    </>
  );
}
