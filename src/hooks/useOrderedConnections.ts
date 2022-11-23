import { BACKFILLABLE_WALLETS, ConnectionType } from 'walletConnectors';
import { getConnection } from 'walletConnectors/utils';
import { useMemo } from 'react';
import { useChain } from 'contexts/useChain';

const SELECTABLE_WALLETS = [...BACKFILLABLE_WALLETS];

export default function useOrderedConnections() {
  const [{ selectERCWallet }] = useChain();
  return useMemo(() => {
    const orderedConnectionTypes: ConnectionType[] = [];

    // Add the `selectedWallet` to the top so it's prioritized, then add the other selectable wallets.
    if (selectERCWallet) {
      orderedConnectionTypes.push(selectERCWallet);
    }
    orderedConnectionTypes.push(...SELECTABLE_WALLETS.filter((wallet) => wallet !== selectERCWallet));

    // Add network connection last as it should be the fallback.
    orderedConnectionTypes.push(ConnectionType.NETWORK);

    return orderedConnectionTypes.map(getConnection);
  }, [selectERCWallet]);
}
