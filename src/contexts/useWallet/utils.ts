import { AelfInstancesKey, Web3Type } from 'types';
import { Options } from './actions';

export function getWalletByOptions(aelfWallet: Web3Type, web3Wallet: Web3Type, options?: Options) {
  const { chainType, chainId } = options || {};
  let wallet;
  if (chainType === 'ELF') {
    wallet = { ...aelfWallet };
    if (chainId) {
      wallet.aelfInstance = aelfWallet.aelfInstances?.[chainId as AelfInstancesKey];
      wallet.chainId = chainId;
    }
  } else {
    wallet = web3Wallet;
  }
  return wallet;
}

export function isChange(stateOptions?: Options, payloadOptions?: Options) {
  const { chainType: stateType, chainId: stateChainId } = stateOptions || {};
  const { chainType, chainId } = payloadOptions || {};
  return (
    ((stateType === 'ERC' || chainType === 'ERC') && stateType === chainType) ||
    (stateType === 'ELF' && chainType === 'ELF' && stateChainId === chainId)
  );
}
