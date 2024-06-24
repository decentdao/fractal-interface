import { ReactNode, useReducer, useMemo, Context, createContext, useContext } from 'react';
import { useAccount } from 'wagmi';
import { FractalStore, StoreAction } from '../../types';
import { combinedReducer, initialState } from './combinedReducer';
import { useReadOnlyValues } from './useReadOnlyValues';
export const FractalContext = createContext<FractalStore | null>(null);

export const useFractal = (): FractalStore => useContext(FractalContext as Context<FractalStore>);
export function AppProvider({ children }: { children: ReactNode }) {
  const { address: account } = useAccount();
  // Replace individual useReducer calls with a single combined reducer
  const [state, dispatch] = useReducer(combinedReducer, initialState);
  // memoize fractal store
  const { readOnlyValues, loadReadOnlyValues } = useReadOnlyValues(state, account);
  const fractalStore: FractalStore = useMemo(() => {
    return {
      node: state.node,
      guard: state.guard,
      governance: state.governance,
      treasury: state.treasury,
      governanceContracts: state.governanceContracts,
      guardContracts: state.guardContracts,
      readOnly: readOnlyValues,
      action: {
        dispatch,
        loadReadOnlyValues,
        resetSafeState: async () => {
          await Promise.resolve(dispatch({ type: StoreAction.RESET }));
        },
      },
    };
  }, [state, loadReadOnlyValues, readOnlyValues]);

  return <FractalContext.Provider value={fractalStore}>{children}</FractalContext.Provider>;
}
