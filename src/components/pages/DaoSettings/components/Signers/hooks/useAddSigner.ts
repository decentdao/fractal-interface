import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, encodeFunctionData } from 'viem';
import GnosisSafeL2Abi from '../../../../../../assets/abi/GnosisSafeL2';
import useSubmitProposal from '../../../../../../hooks/DAO/proposal/useSubmitProposal';
import { ProposalExecuteData } from '../../../../../../types';

const useAddSigner = () => {
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation(['modals']);
  const addSigner = useCallback(
    async ({
      newSigner,
      threshold,
      nonce,
      daoAddress,
      close,
    }: {
      newSigner: Address;
      threshold: number;
      nonce: number;
      daoAddress: Address | null;
      close: () => void;
    }) => {
      if (!daoAddress) {
        return;
      }
      const description = 'Add Signer';

      const encodedAddOwner = encodeFunctionData({
        abi: GnosisSafeL2Abi,
        functionName: 'addOwnerWithThreshold',
        args: [newSigner, BigInt(threshold)],
      });

      const calldatas = [encodedAddOwner];

      const proposalData: ProposalExecuteData = {
        targets: [daoAddress],
        values: [0n],
        calldatas,
        metaData: {
          title: 'Add Signer',
          description,
          documentationUrl: '',
        },
      };

      await submitProposal({
        proposalData,
        successCallback: close,
        nonce,
        pendingToastMessage: t('addSignerPendingToastMessage'),
        successToastMessage: t('addSignerSuccessToastMessage'),
        failedToastMessage: t('addSignerFailureToastMessage'),
      });
    },
    [submitProposal, t],
  );

  return addSigner;
};

export default useAddSigner;
