import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex, encodeFunctionData } from 'viem';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMultisigDAO, AzoriusGovernance, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { ProposalExecuteData } from '../../types/daoProposal';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useSubmitProposal from './proposal/useSubmitProposal';
import useBuildDAOTx from './useBuildDAOTx';

export const useCreateSubDAOProposal = () => {
  const { t } = useTranslation(['daoCreate', 'proposal', 'proposalMetadata']);

  const { submitProposal, pendingCreateTx } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const [build] = useBuildDAOTx();
  const {
    node: { daoAddress },
    governance,
  } = useFractal();
  const {
    contracts: { fractalRegistry, multiSendCallOnly },
  } = useNetworkConfig();
  const azoriusGovernance = governance as AzoriusGovernance;
  const proposeDao = useCallback(
    (
      daoData: AzoriusERC20DAO | AzoriusERC721DAO | SafeMultisigDAO,
      nonce: number | undefined,
      successCallback: (addressPrefix: string, daoAddress: string) => void,
    ) => {
      const propose = async () => {
        if (!daoAddress) {
          return;
        }

        const builtSafeTx = await build(daoData, daoAddress, azoriusGovernance.votesToken?.address);
        if (!builtSafeTx) {
          return;
        }

        const { safeTx, predictedSafeAddress } = builtSafeTx;

        if (!isHex(safeTx)) {
          throw new Error('Built safeTx is not a hex string');
        }

        const encodedMultisend = encodeFunctionData({
          abi: MultiSendCallOnlyAbi,
          functionName: 'multiSend',
          args: [safeTx],
        });

        if (!isHex(encodedMultisend)) {
          throw new Error('encodedMultisend data is not hex??');
        }

        const encodedDeclareSubDAO = encodeFunctionData({
          abi: abis.FractalRegistry,
          functionName: 'declareSubDAO',
          args: [predictedSafeAddress],
        });

        const proposalData: ProposalExecuteData = {
          targets: [multiSendCallOnly, fractalRegistry],
          values: [0n, 0n],
          calldatas: [encodedMultisend, encodedDeclareSubDAO],
          metaData: {
            title: t('createChildSafe', { ns: 'proposalMetadata' }),
            description: '',
            documentationUrl: '',
          },
        };
        submitProposal({
          proposalData,
          nonce,
          pendingToastMessage: t('createSubDAOPendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback,
        });
      };
      propose();
    },
    [
      azoriusGovernance.votesToken?.address,
      build,
      daoAddress,
      fractalRegistry,
      multiSendCallOnly,
      submitProposal,
      t,
    ],
  );

  return { proposeDao, pendingCreateTx, canUserCreateProposal } as const;
};
