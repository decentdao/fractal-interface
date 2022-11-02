import DAODetails from './DAODetails';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorSteps } from './provider/types';
import { SubsidiaryFunding } from './SubsidiaryFunding';
import TokenDetails from './tokenVotingGovernance/TokenDetails';
import { ChooseGovernance } from './ChooseGovernance';
import { GnosisConfig } from './gnosis/GnosisConfig';
import GovernanceDetails from './tokenVotingGovernance/GovernanceDetails';

function StepController() {
  const { state } = useCreator();
  switch (state.step) {
    case CreatorSteps.ESSENTIALS:
      return <DAODetails />;
    case CreatorSteps.CHOOSE_GOVERNANCE:
      return <ChooseGovernance />;
    case CreatorSteps.PURE_GNOSIS:
    case CreatorSteps.GNOSIS_GOVERNANCE:
      return <GnosisConfig />;
    case CreatorSteps.FUNDING: {
      return <SubsidiaryFunding />;
    }
    case CreatorSteps.GNOSIS_WITH_USUL:
      return <TokenDetails />;
    case CreatorSteps.GOV_CONFIG:
      return <GovernanceDetails />;
    default:
      return <></>;
  }
}

export default StepController;
