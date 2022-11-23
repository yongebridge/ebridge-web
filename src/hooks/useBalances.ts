import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import { getELFChainBalance, getBalance } from 'contracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Web3Type } from 'types';
import { isELFChain } from 'utils/aelfUtils';
import { useTokenContract } from './useContract';
import useInterval from './useInterval';
export const useBalances = (
  wallet?: Web3Type,
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
  targetAddress?: string,
): [BigNumber[], () => void] => {
  const deArr = useMemo(() => (Array.isArray(tokens) ? tokens.map(() => ZERO) : [ZERO]), [tokens]);
  const [balances, setBalances] = useState<BigNumber[]>(deArr);
  const { library, chainId, account: owner } = wallet || {};
  const account = useMemo(() => targetAddress || owner, [targetAddress, owner]);
  const tokenContract = useTokenContract(chainId);
  const tokensList = useMemo(() => (Array.isArray(tokens) ? tokens : [tokens]), [tokens]);
  const onGetBalance = useCallback(async () => {
    console.log('onGetBalance', '==onGetBalance');

    if (!account) return setBalances(tokensList.map(() => ZERO));
    let promise;
    if (isELFChain(chainId)) {
      // elf chain
      promise = tokensList.map((symbol) => {
        if (!tokenContract) return '0';
        if (symbol) return getELFChainBalance(tokenContract, symbol, account);
      });
    } else {
      // erc20 chain
      promise = tokensList.map((i) => {
        if (i && library) return getBalance(library, i, account);
      });
    }
    const bs = await Promise.all(promise);
    setBalances(bs?.map((i) => new BigNumber(i ?? '')));
  }, [account, tokensList, chainId, tokenContract, library]);
  useEffect(() => {
    setBalances(tokensList.map(() => ZERO));
  }, [chainId, tokensList]);
  useInterval(onGetBalance, delay, [onGetBalance, library, tokenContract]);
  return [balances, onGetBalance];
};
