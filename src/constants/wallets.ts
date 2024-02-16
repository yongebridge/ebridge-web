import { WalletInfo } from 'types';
import { coinbaseWallet, injected, walletConnect, tronLink } from 'walletConnectors';
import { isMobileDevices } from 'utils/isMobile';
import { PortkeyNameVersion } from '../contexts/usePortkey/constants';

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconType: 'MetaMask',
    description: 'Easy-to-use browser extension.',
    href: null,
  },
  WALLET_CONNECT: {
    connector: walletConnect,
    name: 'WalletConnect',
    iconType: 'WalletConnect',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
  },
  // Hide coinbase wallet option in mobile device
  // Ticket EB-3000131432
  ...(!isMobileDevices() && {
    COINBASE_WALLET: {
      connector: coinbaseWallet,
      name: 'Coinbase Wallet',
      iconType: 'coinbaseWallet',
      description: 'Connect to Coinbase Wallet',
      href: null,
    },
  }),
  NIGHT_ELF: {
    connector: 'NIGHT ELF',
    name: 'NIGHT ELF',
    iconType: 'nightElf',
    description: 'NIGHT ELF',
    href: null,
  },
  PORTKEY: {
    connector: 'PORTKEY',
    name: 'PORTKEY',
    iconType: 'portkey',
    description: 'PORTKEY',
    href: null,
    version: PortkeyNameVersion.v1,
  },
  PORTKEY_V2: {
    connector: 'PORTKEY',
    name: 'PORTKEY (EARLY ACCESS)',
    iconType: 'portkey',
    description: 'PORTKEY (EARLY ACCESS)',
    href: null,
    version: PortkeyNameVersion.v2,
  },
  TRON_LINK: {
    connector: tronLink,
    name: 'TRONLINK',
    iconType: 'tronLink',
    description: 'TRONLINK',
    href: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_16148_23.0e0b48355a318994ec8af9b76b4de4a8.js',
  },
  TRON_LINK: {
    connector: tronLink,
    name: 'TRONLINK',
    iconType: 'tronLink',
    description: 'TRONLINK',
    href: 'https://lf1-cdn-tos.bytegoofy.com/obj/iconpark/svg_16148_23.0e0b48355a318994ec8af9b76b4de4a8.js',
  },
};
