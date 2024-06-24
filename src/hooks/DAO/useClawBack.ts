import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  parseAbiParameters,
} from 'viem';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { FractalModuleType, FractalNode } from '../../types';
import { useCanUserCreateProposal } from '../utils/useCanUserSubmitProposal';
import useSubmitProposal from './proposal/useSubmitProposal';

interface IUseClawBack {
  childSafeInfo: FractalNode;
  parentAddress: Address | null;
}

export default function useClawBack({ childSafeInfo, parentAddress }: IUseClawBack) {
  const { t } = useTranslation(['proposal', 'proposalMetadata']);
  const safeAPI = useSafeAPI();
  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();

  const handleClawBack = useCallback(async () => {
    if (childSafeInfo.daoAddress && parentAddress && safeAPI) {
      const childSafeBalance = await safeAPI.getBalances(childSafeInfo.daoAddress);

      const santitizedParentAddress = parentAddress;
      const parentSafeInfo = await safeAPI.getSafeData(santitizedParentAddress);

      if (canUserCreateProposal && parentAddress && parentSafeInfo) {
        const fractalModule = childSafeInfo.fractalModules!.find(
          module => module.moduleType === FractalModuleType.FRACTAL,
        );

        if (fractalModule) {
          const transactions = childSafeBalance.map(asset => {
            if (!asset.tokenAddress) {
              // Seems like we're operating with native coin i.e ETH
              const txData = encodeAbiParameters(
                parseAbiParameters('address, uint256, bytes, uint8'),
                [parentAddress, BigInt(asset.balance), '0x', 0],
              );

              const fractalModuleCalldata = encodeFunctionData({
                abi: abis.FractalModule,
                functionName: 'execTx',
                args: [txData],
              });

              return {
                target: fractalModule.moduleAddress,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            } else {
              const clawBackCalldata = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [parentAddress, BigInt(asset.balance)] as const,
              });
              const txData = encodeAbiParameters(
                parseAbiParameters('address, uint256, bytes, uint8'),
                [getAddress(asset.tokenAddress), 0n, clawBackCalldata, 0],
              );

              const fractalModuleCalldata = encodeFunctionData({
                abi: abis.FractalModule,
                functionName: 'execTx',
                args: [txData],
              });

              return {
                target: fractalModule.moduleAddress,
                value: 0,
                calldata: fractalModuleCalldata,
              };
            }
          });

          submitProposal({
            proposalData: {
              metaData: {
                title: t('clawbackProposal', { ns: 'proposalMetadata' }),
                description: t('clawbackDescription', {
                  ns: 'proposalMetadata',
                }),
                documentationUrl: '',
              },
              targets: transactions.map(tx => tx.target),
              values: transactions.map(tx => BigInt(tx.value)),
              calldatas: transactions.map(tx => tx.calldata),
            },
            nonce: parentSafeInfo.nonce,
            pendingToastMessage: t('clawBackPendingToastMessage'),
            failedToastMessage: t('clawBackFailedToastMessage'),
            successToastMessage: t('clawBackSuccessToastMessage'),
            safeAddress: parentAddress,
          });
        }
      }
    }
  }, [canUserCreateProposal, childSafeInfo, parentAddress, submitProposal, t, safeAPI]);

  return { handleClawBack };
}
