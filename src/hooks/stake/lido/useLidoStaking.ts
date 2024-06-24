import { getSTETHContract, getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isHex } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export default function useLidoStaking() {
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const {
    staking: { lido },
  } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();
  const { submitProposal } = useSubmitProposal();
  const { t } = useTranslation('proposal');

  const handleStake = useCallback(
    async (value: bigint) => {
      if (!lido || !daoAddress || !signerOrProvider) {
        // Means it is not supported on current network
        return;
      }

      const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);

      const encodedSubmit = stETHContract.interface.encodeFunctionData('submit', [
        lido.rewardsAddress,
      ]);
      if (!isHex(encodedSubmit)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('stakeWithLidoTitle'),
          description: t('stakeWithLidoDescription'),
          documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#what-is-steth',
        },
        targets: [lido.stETHContractAddress],
        calldatas: [encodedSubmit],
        values: [value],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, signerOrProvider, daoAddress, safe, submitProposal, t],
  );

  const handleUnstake = useCallback(
    async (value: string) => {
      if (!lido || !daoAddress || !signerOrProvider) {
        // Means it is not supported on current network
        return;
      }
      const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);
      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider,
      );

      const encodedApprove = stETHContract.interface.encodeFunctionData('approve', [
        lido.withdrawalQueueContractAddress,
        value,
      ]);

      if (!isHex(encodedApprove)) {
        return;
      }

      const encodedWithdraw = withdrawalQueueContract.interface.encodeFunctionData(
        'requestWithdrawals',
        [[value], daoAddress],
      );
      if (!isHex(encodedWithdraw)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('unstakeStEthTitle'),
          description: t('unstakeStEthDescription'),
          documentationUrl:
            'https://docs.lido.fi/guides/steth-integration-guide#request-withdrawal-and-mint-nft',
        },
        targets: [lido.stETHContractAddress, lido.withdrawalQueueContractAddress],
        calldatas: [encodedApprove, encodedWithdraw],
        values: [0n, 0n],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider],
  );

  const handleClaimUnstakedETH = useCallback(
    async (nftId: bigint) => {
      if (!lido || !daoAddress || !signerOrProvider) {
        // Means it is not supported on current network
        return;
      }

      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider,
      );

      const encodedClaim = withdrawalQueueContract.interface.encodeFunctionData('claimWithdrawal', [
        nftId,
      ]);
      if (!isHex(encodedClaim)) {
        return;
      }
      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('lidoWithdrawalTitle'),
          description: t('lidoWithdrawalDescription'),
          documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#claiming',
        },
        targets: [lido.withdrawalQueueContractAddress],
        calldatas: [encodedClaim],
        values: [0n],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider],
  );

  return { handleStake, handleUnstake, handleClaimUnstakedETH };
}
