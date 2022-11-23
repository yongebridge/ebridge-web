import { CrossFeeTokenDecimals } from 'constants/misc';
import { useWallet } from 'contexts/useWallet/hooks';
import { useCallback, useState } from 'react';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import { getChainIdToMap } from 'utils/chain';
import { useBridgeContract } from './useContract';
import useInterval from './useInterval';

export function useCrossFee() {
  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId } = fromWallet || {};
  const bridgeContract = useBridgeContract(fromChainId);
  const { chainId: toChainId } = toWallet || {};
  const [fee, setFee] = useState<string>();
  const getFeeByChainId = useCallback(async () => {
    if (!bridgeContract || !(isELFChain(fromChainId) && !isELFChain(toChainId))) return setFee(undefined);
    const req = await bridgeContract.callViewMethod('GetFeeByChainId', [getChainIdToMap(toChainId)]);
    if (req && !req.error) setFee(divDecimals(req.value, CrossFeeTokenDecimals).dp(2).toFixed());
  }, [bridgeContract, fromChainId, toChainId]);
  useInterval(getFeeByChainId, 30000, [getFeeByChainId]);
  return fee;
}
