import { FractalGovernanceContracts } from '../../../types';

export enum GovernanceContractAction {
  SET_GOVERNANCE_CONTRACT_ADDRESSES = 'SET_GOVERNANCE_CONTRACT_ADDRESSES',
}

export type GovernanceContractActions = {
  type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES;
  payload: Omit<FractalGovernanceContracts, 'isLoaded'>;
};
