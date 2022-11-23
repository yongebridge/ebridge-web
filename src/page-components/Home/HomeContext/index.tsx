import { request } from 'api';
import storages from 'constants/storages';
import { useWallet } from 'contexts/useWallet/hooks';
import { BasicActions } from 'contexts/utils';
import { useBalances } from 'hooks/useBalances';
import useInterval from 'hooks/useInterval';
import { useUserAddedToken } from 'hooks/whitelist';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useCookie, usePrevious } from 'react-use';
import { isELFChain } from 'utils/aelfUtils';
import { divDecimals } from 'utils/calculate';
import { getChainIdToMap } from 'utils/chain';
import {
  DestroyModal,
  DestroyState,
  homeActions,
  homeState,
  setFrom,
  setHomeState,
  setReceiveId,
  setReceiveList,
  setSelectToken,
  setTo,
} from './actions';
import { parseCrossChainTransfers } from './utils';
import defaultWhitelistMap from 'constants/tokenWhitelist.json';
import { crossTokenMin } from 'constants/misc';
import { sliceDecimals } from 'utils/input';

const defaultSelectToken = {
  symbol: 'ELF',
  ...defaultWhitelistMap.ELF,
};
const INITIAL_STATE = {
  selectToken: defaultSelectToken,
  toChecked: false,
  toAddress: '',
};
const HomeContext = createContext<any>(INITIAL_STATE);
const ExpirationTime = 1000 * 60 * 5;
export function useHomeContext(): [
  homeState,
  BasicActions<homeActions> & {
    addReceivedList: (s?: string) => void;
  },
] {
  return useContext(HomeContext);
}

//reducer
function reducer(state: homeState, { type, payload }: { type: homeActions; payload: any }) {
  switch (type) {
    case homeActions.destroy: {
      return {};
    }
    case homeActions.destroyState: {
      return Object.assign({}, state, DestroyState);
    }
    case homeActions.destroyModal: {
      return Object.assign({}, state, DestroyModal);
    }
    default: {
      const { destroyModal } = payload;
      if (destroyModal) return Object.assign({}, state, DestroyModal, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [homeState, BasicActions<homeActions>['dispatch']] = useReducer(reducer, INITIAL_STATE);
  const [receivedValue, updateReceivedList] = useCookie(storages.crossChainReceived);
  const { selectToken, fromInput, toInput, receiveList, receiveId } = state;
  const { fromWallet, toWallet } = useWallet();
  const { chainId: fromChainId, account: fromAccount } = fromWallet || {};
  const preFromAccount = usePrevious(fromAccount);
  const { chainId: toChainId, account: toAccount } = toWallet || {};
  const preToAccount = usePrevious(toAccount);

  const tokenInfo = useUserAddedToken(selectToken?.symbol);
  const tokens = useMemo(() => {
    if (!fromChainId) return;
    const { symbol, address } = selectToken?.[fromChainId] || {};
    if (isELFChain(fromChainId)) return [symbol];
    return [address];
  }, [fromChainId, selectToken]);
  const [[balance]] = useBalances(fromWallet, tokens);
  useEffect(() => {
    if (selectToken && fromChainId && toChainId && (!selectToken[fromChainId] || !selectToken[toChainId])) {
      if (tokenInfo) {
        dispatch(setSelectToken(tokenInfo));
      } else {
        dispatch(setSelectToken(defaultSelectToken));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromChainId, toChainId, tokenInfo]);
  useEffect(() => {
    dispatch(setTo(fromInput || ''));
  }, [fromInput]);
  useEffect(() => {
    const token = fromChainId ? selectToken?.[fromChainId] : undefined;
    if (token) {
      dispatch(setFrom(sliceDecimals(toInput, token?.decimals ?? 6)));
    } else {
      dispatch(setFrom(toInput || ''));
    }
  }, [fromChainId, selectToken, toInput]);
  useEffect(() => {
    if (preFromAccount !== fromAccount && preToAccount !== fromAccount) {
      dispatch(setHomeState({ fromInput: '', toInput: '' }));
    }
    if (preToAccount !== fromAccount) dispatch(setReceiveId(undefined));
  }, [fromAccount, preFromAccount, preToAccount]);
  const getReceiveList = useCallback(async () => {
    if (!toChainId || !toAccount) return;
    // TODO toAddress
    const req = await request.cross.getCrossChainTransfers({
      params: { toChainId: getChainIdToMap(toChainId), toAddress: toAccount, status: 1, maxResultCount: 100 },
    });
    const list = parseCrossChainTransfers(req);
    list && dispatch(setReceiveList(list));
  }, [toAccount, toChainId]);
  useEffect(() => {
    dispatch(setReceiveId(undefined));
  }, [toChainId]);
  useInterval(
    () => {
      getReceiveList();
    },
    10000,
    [toChainId, toAccount, getReceiveList],
  );
  const receivedList = useMemo(() => {
    let list = [];
    try {
      if (receivedValue) {
        const tmpList = JSON.parse(receivedValue);
        if (Array.isArray(tmpList)) list = tmpList;
      }
    } catch (error) {
      console.debug(error, '=====error');
    }
    return list;
  }, [receivedValue]);
  const addReceivedList = useCallback(
    (id: string) => {
      let list: string[] = [];
      list = list.concat(receivedList);
      list.push(id);
      updateReceivedList(JSON.stringify(list), {
        expires: new Date(new Date().getTime() + ExpirationTime),
      });
    },
    [receivedList, updateReceivedList],
  );
  const actions = useMemo(() => ({ dispatch, addReceivedList }), [addReceivedList]);
  const receiveItem = useMemo(() => receiveList?.find((i) => i.id === receiveId), [receiveId, receiveList]);
  const tmpList = useMemo(() => receiveList?.filter((i) => !receivedList.includes(i.id)), [receiveList, receivedList]);
  const fromBalance = useMemo(() => {
    if (!fromChainId) return;
    const token = selectToken?.[fromChainId];
    if (!token) return;
    return { balance, show: divDecimals(balance, token.decimals), token };
  }, [balance, fromChainId, selectToken]);
  const crossMin = useMemo(() => {
    if (!isELFChain(fromChainId) && isELFChain(toChainId) && selectToken) return crossTokenMin[selectToken.symbol];
  }, [fromChainId, selectToken, toChainId]);

  return (
    <HomeContext.Provider
      value={useMemo(
        () => [{ ...state, receiveItem, receivedList, receiveList: tmpList, fromBalance, crossMin }, actions],
        [state, receiveItem, receivedList, tmpList, fromBalance, crossMin, actions],
      )}>
      {children}
    </HomeContext.Provider>
  );
}
