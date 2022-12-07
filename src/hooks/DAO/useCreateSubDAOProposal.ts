import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types/index';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import useSubmitProposal from './proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../types/proposal';
import useSafeContracts from '../safe/useSafeContracts';
import useBuildDAOTx from './useBuildDAOTx';

export const useCreateSubDAOProposal = () => {
  const { multiSendContract } = useSafeContracts();

  const { submitProposal, pendingCreateTx, canUserCreateProposal } = useSubmitProposal();
  const [build] = useBuildDAOTx();
  const {
    gnosis: { safe },
  } = useFractal();

  const proposeDao = useCallback(
    (daoData: TokenGovernanceDAO | GnosisDAO, successCallback: (daoAddress: string) => void) => {
      const propose = async () => {
        if (!multiSendContract) {
          return;
        }

        const builtSafeTx = await build(daoData, safe.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx } = builtSafeTx;

        const proposalData: ProposalExecuteData = {
          targets: [multiSendContract.address],
          values: [BigNumber.from('0')],
          calldatas: [multiSendContract.interface.encodeFunctionData('multiSend', [safeTx])],
          title: 'Create SubDAO',
          description: 'to:' + multiSendContract.address + '_ txs:' + safeTx,
          documentationUrl: '',
        };
        submitProposal({ proposalData, successCallback });
      };
      propose();
    },
    [multiSendContract, build, safe.address, submitProposal]
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
