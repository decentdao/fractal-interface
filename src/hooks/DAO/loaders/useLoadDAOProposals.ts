import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { GovernanceType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useLoadDAOProposals = () => {
  const {
    node: { daoAddress },
    governance: { type },
    action,
  } = useFractal();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);
  const loadAzoriusProposals = useAzoriusProposals();
  const { loadSafeMultisigProposals } = useSafeMultisigProposals();

  const loadDAOProposals = useCallback(async () => {
    clearIntervals();
    if (type === GovernanceType.AZORIUS_ERC20 || type === GovernanceType.AZORIUS_ERC721) {
      // load Azorius proposals and strategies
      await loadAzoriusProposals(proposal => {
        action.dispatch({
          type: FractalGovernanceAction.SET_AZORIUS_PROPOSAL,
          payload: proposal,
        });
      });
    } else if (type === GovernanceType.MULTISIG) {
      // load mulisig proposals
      // @dev what is the point of setMethodOnInterval here?
      return setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    clearIntervals,
    type,
    loadAzoriusProposals,
    action,
    setMethodOnInterval,
    loadSafeMultisigProposals,
  ]);

  return loadDAOProposals;
};
