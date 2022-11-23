import { BasicActions } from 'contexts/utils';
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { aelfContractState, aelfContractActions } from './actions';

const INITIAL_STATE: aelfContractState = {};
const ContractContext = createContext<any>(INITIAL_STATE);

export function useAElfContractContext(): [aelfContractState, BasicActions<aelfContractActions>] {
  return useContext(ContractContext);
}

//reducer
function reducer(state: aelfContractState, { type, payload }: { type: aelfContractActions; payload: any }) {
  switch (type) {
    case aelfContractActions.destroy: {
      return {};
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [aelfContractState, BasicActions<aelfContractActions>['dispatch']] = useReducer(
    reducer,
    INITIAL_STATE,
  );
  const actions = useMemo(() => ({ dispatch }), [dispatch]);
  return (
    <ContractContext.Provider value={useMemo(() => [state, actions], [state, actions])}>
      {children}
    </ContractContext.Provider>
  );
}
