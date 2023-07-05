import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDAOProposals } from '../../../../../../hooks/DAO/loaders/useProposals';
import useSubmitProposal from '../../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { ProposalExecuteData } from '../../../../../../types';

const useAddSigner = () => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation(['modals']);
  const loadDAOProposals = useDAOProposals();
  const {
    baseContracts: { safeSingletonContract },
  } = useFractal();
  const addSigner = useCallback(
    async ({
      newSigner,
      threshold,
      nonce,
      daoAddress,
      close,
    }: {
      newSigner: string;
      threshold: number | undefined;
      nonce: number | undefined;
      daoAddress: string | null;
      close: () => void;
    }) => {
      const description = 'Add Signer';

      const calldatas = [
        safeSingletonContract.asSigner.interface.encodeFunctionData('addOwnerWithThreshold', [
          newSigner,
          BigNumber.from(threshold),
        ]),
      ];

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress!],
        values: [BigNumber.from('0')],
        calldatas: calldatas,
        title: 'Add Signer',
        description: description,
        documentationUrl: '',
      };

      await submitProposal({
        proposalData,
        successCallback: () => {
          close();
          loadDAOProposals();
        },
        nonce,
        pendingToastMessage: t('addSignerPendingToastMessage'),
        successToastMessage: t('addSignerSuccessToastMessage'),
        failedToastMessage: t('addSignerFailureToastMessage'),
        safeAddress: daoAddress!,
      });
    },
    [safeSingletonContract.asSigner.interface, submitProposal, t, loadDAOProposals]
  );

  return addSigner;
};

export default useAddSigner;
