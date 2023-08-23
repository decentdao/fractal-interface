import { getSTETHContract, getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { WETH_CONTRACT_ADDRESS as GOERLI_WETH_ADDRESS } from '../../../providers/NetworkConfig/networks/goerli';
import { WETH_CONTRACT_ADDRESS as MAINNET_WETH_ADDRESS } from '../../../providers/NetworkConfig/networks/mainnet';
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
    async (asset: SafeBalanceUsdResponse, value: BigNumber) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      if (!asset.tokenAddress) {
        // Staking ETH
        const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);

        const proposalData: ProposalExecuteData = {
          metaData: {
            title: t('Stake ETH with Lido'),
            description: t(
              'This proposal will stake ETH in Lido, returning stETH to your treasury.'
            ),
            documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#what-is-steth',
          },
          targets: [lido.stETHContractAddress],
          calldatas: [stETHContract.interface.encodeFunctionData('submit', [lido.rewardsAddress])],
          values: [value],
        };
        await submitProposal({
          proposalData,
          nonce: safe?.nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
        });
      } else if (
        asset.tokenAddress === GOERLI_WETH_ADDRESS ||
        asset.tokenAddress === MAINNET_WETH_ADDRESS
      ) {
        // TODO - Handle staking of wETH
        // This chunk was specifically added to handle case when user selecting different asset in staking modal
        return;
      }
    },
    [lido, signerOrProvider, daoAddress, safe, submitProposal, t]
  );

  const handleUnstake = useCallback(
    async (value: string) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }
      const stETHContract = getSTETHContract(lido.stETHContractAddress, signerOrProvider);
      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider
      );

      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('Unstake stETH'),
          description: t(
            'This proposal will unstake your stETH from Lido and mint a Lido Withdrawal NFT which can be used to claim your ETH.'
          ),
          documentationUrl:
            'https://docs.lido.fi/guides/steth-integration-guide#request-withdrawal-and-mint-nft',
        },
        targets: [lido.stETHContractAddress, lido.withdrawalQueueContractAddress],
        calldatas: [
          stETHContract.interface.encodeFunctionData('approve', [
            lido.withdrawalQueueContractAddress,
            value,
          ]),
          withdrawalQueueContract.interface.encodeFunctionData('requestWithdrawals', [
            [value],
            daoAddress,
          ]),
        ],
        values: ['0', '0'],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider]
  );

  const handleClaimUnstakedETH = useCallback(
    async (nftId: BigNumber) => {
      if (!lido || !daoAddress) {
        // Means it is not supported on current network
        return;
      }

      const withdrawalQueueContract = getWithdrawalQueueContract(
        lido.withdrawalQueueContractAddress,
        signerOrProvider
      );

      const proposalData: ProposalExecuteData = {
        metaData: {
          title: t('Lido Withdrawal'),
          description: t(
            'This proposal will burn your Lido Withdrawal NFT and return the ETH to your Safe.'
          ),
          documentationUrl: 'https://docs.lido.fi/guides/steth-integration-guide#claiming',
        },
        targets: [lido.withdrawalQueueContractAddress],
        calldatas: [
          withdrawalQueueContract.interface.encodeFunctionData('claimWithdrawal', [nftId]),
        ],
        values: ['0'],
      };
      await submitProposal({
        proposalData,
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
      });
    },
    [lido, daoAddress, safe, submitProposal, t, signerOrProvider]
  );

  return { handleStake, handleUnstake, handleClaimUnstakedETH };
}
