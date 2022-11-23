import storages from 'constants/storages';
import { BasicActions } from 'contexts/utils';
import useStorageReducer from 'hooks/useStorageReducer';
import { createContext, useContext, useMemo } from 'react';
import { WhitelistActions, WhitelistItem, WhitelistState } from './actions';

const INITIAL_STATE = { userERCChainId: undefined };

const WhitelistContext = createContext<any>([INITIAL_STATE]);

export function useWhitelist(): [WhitelistState, BasicActions<WhitelistActions>] {
  return useContext(WhitelistContext);
}

const reducer = (state: WhitelistState, { type, payload }: { type: WhitelistActions; payload: any }) => {
  switch (type) {
    case WhitelistActions.destroy: {
      return {};
    }
    case WhitelistActions.addWhitelist: {
      const { token } = payload;
      const { whitelistMap } = state;
      let tmpMap = {};
      Object.entries(token).map(([key, value]) => {
        const old = whitelistMap?.[key];
        if (old) {
          tmpMap = Object.assign(tmpMap, {
            [key]: {
              ...old,
              ...(value as WhitelistItem),
            },
          });
        } else {
          tmpMap = Object.assign(tmpMap, {
            [key]: value,
          });
        }
      });
      return Object.assign({}, state, { whitelistMap: Object.assign({}, whitelistMap, tmpMap) });
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
};

const options = { key: storages.useWhitelist };
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [WhitelistState, BasicActions<WhitelistActions>['dispatch']] = useStorageReducer(
    reducer,
    INITIAL_STATE,
    options,
  );
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <WhitelistContext.Provider value={useMemo(() => [state, actions], [actions, state])}>
      {children}
    </WhitelistContext.Provider>
  );
}
