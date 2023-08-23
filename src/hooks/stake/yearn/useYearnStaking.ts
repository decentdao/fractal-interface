import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import axios from 'axios';
import { BigNumber, Contract } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20ABI } from 'wagmi';
import yearnVaultABI from '../../../assets/abi/yearnVault.json';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export type YearnVault = {
  address: string;
  symbol: string;
  token: {
    symbol: string;
    address: string;
  };
};
export default function useYearnStaking() {
  const [vaults, setVaults] = useState<YearnVault[]>();
  const { t } = useTranslation();

  const {
    node: { safe },
  } = useFractal();
  const { staking } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();
  const { submitProposal } = useSubmitProposal();

  const handleStake = useCallback(
    async (asset: SafeBalanceUsdResponse, amount: BigNumber) => {
      const selectedVault = vaults?.find(vault => vault.token.address === asset.tokenAddress);
      if (selectedVault) {
        const tokenContract = new Contract(asset.tokenAddress, erc20ABI, signerOrProvider);
        const vaultContract = new Contract(selectedVault.address, yearnVaultABI, signerOrProvider);
        const proposalData: ProposalExecuteData = {
          metaData: {
            title: t(`Stake ${selectedVault.token.symbol} with Yearn.Finance`),
            description: t(
              `This proposal will stake ${selectedVault.token.symbol} in Yearn.Finance, returning corresponing ${selectedVault.symbol} to your treasury.`
            ),
            documentationUrl:
              'https://docs.yearn.finance/getting-started/products/yvaults/overview',
          },
          targets: [tokenContract.address, vaultContract.address, tokenContract.address],
          calldatas: [
            tokenContract.interface.encodeFunctionData('approve', [vaultContract.address, amount]),
            vaultContract.interface.encodeFunctionData('deposit', [amount]),
            tokenContract.interface.encodeFunctionData('approve', [vaultContract.address, 0]), // Revoke approval once deposited
          ],
          values: [0, 0, 0],
        };

        await submitProposal({
          proposalData,
          nonce: safe?.nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
        });
      }
    },
    [signerOrProvider, t, vaults, safe?.nonce, submitProposal]
  );

  const handleUnstake = useCallback(
    async (asset: SafeBalanceUsdResponse, amount: BigNumber) => {
      const selectedVault = vaults?.find(vault => vault.token.address === asset.tokenAddress);
      if (selectedVault) {
        const vaultContract = new Contract(selectedVault.address, yearnVaultABI, signerOrProvider);
        const proposalData: ProposalExecuteData = {
          metaData: {
            title: t(`Un-Stake ${selectedVault.symbol} from Yearn.Finance`),
            description: t(
              `This proposal will un-stake ${selectedVault.symbol} from Yearn.Finance, returning corresponing ${selectedVault.token.symbol} to your treasury.`
            ),
            documentationUrl:
              'https://docs.yearn.finance/getting-started/products/yvaults/overview',
          },
          targets: [vaultContract.address],
          calldatas: [vaultContract.interface.encodeFunctionData('withdraw', [amount])],
          values: [0],
        };

        await submitProposal({
          proposalData,
          nonce: safe?.nonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage'),
          successToastMessage: t('proposalCreateSuccessToastMessage'),
          failedToastMessage: t('proposalCreateFailureToastMessage'),
        });
      }
    },
    [signerOrProvider, t, vaults, safe?.nonce, submitProposal]
  );

  useEffect(() => {
    const fetchVaults = async () => {
      if (staking.yearn && !vaults) {
        const vaultsResponse = await axios.get(staking.yearn.apiURL);
        setVaults(JSON.parse(vaultsResponse.data));
      }
    };

    fetchVaults();
  }, [staking.yearn, vaults]);

  return {
    handleStake,
    handleUnstake,
  };
}
