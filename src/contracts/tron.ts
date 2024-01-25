import { ContractBasic } from '../utils/contract';
import { ChainId } from 'types';
import { SupportedChainId } from 'constants/chain';

export const getTRCBalance = async (address: string) => {
  const tronWeb3 = window.tronWeb;
  return tronWeb3?.getBalance(address);
};

export const getTRCChainBalance = async (tokenContract: ContractBasic, owner?: string) => {
  const tokenTronContract = await window.tronWeb.contract().at('TXL8Uuto8oxWKEC8HQrL7jxWyJPhC4Tcnd');
  const callBalance = await tokenTronContract.balanceOf(owner).call();
  const balance = window.tronWeb.toDecimal(callBalance);
  return balance;
};

export const getChainIdForContract = (chainId: ChainId) => {
  switch (chainId) {
    case SupportedChainId.TRON_NILE_TESTNET: {
      return 'Nile';
      break;
    }
    default: {
      return chainId;
    }
  }
};
