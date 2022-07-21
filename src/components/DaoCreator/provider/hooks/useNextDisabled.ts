import { useState, useEffect } from 'react';
import { CreatorState, CreatorSteps } from './../types';

export function useNextDisabled(state: CreatorState) {
  const [isNextDisbled, setIsDisabled] = useState(true);

  useEffect(() => {
    switch (state.step) {
      case CreatorSteps.ESSENTIALS:
        if (!!state.essentials.daoName.trim()) {
          setIsDisabled(false);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.FUNDING:
        setIsDisabled(false);
        break;
      case CreatorSteps.TREASURY_GOV_TOKEN:
        if (state.govToken) {
          if (
            state.govToken.tokenAllocations === undefined ||
            state.govToken.tokenSupply === undefined
          ) {
            setIsDisabled(true);
            break;
          }
          const isAllocationsValid =
            state.govToken.tokenAllocations
              .map(tokenAllocation => Number(tokenAllocation.amount))
              .reduce((prev, curr) => prev + curr, 0) <= Number(state.govToken.tokenSupply);

          setIsDisabled(!isAllocationsValid);
          break;
        }
        setIsDisabled(true);
        break;
      case CreatorSteps.GOV_CONFIG:
        setIsDisabled(false);
        break;
    }
  }, [state]);

  return isNextDisbled;
}
