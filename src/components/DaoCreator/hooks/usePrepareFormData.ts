import { useCallback } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import IVotesAbi from '../../../assets/abi/IVotes';
import { SENTINEL_ADDRESS } from '../../../constants/common';
import {
  SafeMultisigDAO,
  DAOFreezeGuardConfig,
  BigIntValuePair,
  TokenCreationType,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
} from '../../../types';
import { getEstimatedNumberOfBlocks } from '../../../utils/contract';
import { validateENSName } from '../../../utils/url';

type FreezeGuardConfigParam = { freezeGuard?: DAOFreezeGuardConfig<BigIntValuePair> };

export function usePrepareFormData() {
  // const signer = useEthersSigner();

  const publicClient = usePublicClient();

  // Helper function to prepare freezeGuard data
  const prepareFreezeGuardData = useCallback(
    async (
      freezeGuard: DAOFreezeGuardConfig<BigIntValuePair>,
    ): Promise<DAOFreezeGuardConfig | undefined> => {
      if (publicClient) {
        return {
          executionPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.executionPeriod.bigintValue!,
            publicClient,
          ),
          timelockPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.timelockPeriod.bigintValue!,
            publicClient,
          ),
          freezeVotesThreshold: freezeGuard.freezeVotesThreshold.bigintValue!,
          freezeProposalPeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.freezeProposalPeriod.bigintValue!,
            publicClient,
          ),
          freezePeriod: await getEstimatedNumberOfBlocks(
            freezeGuard.freezePeriod.bigintValue!,
            publicClient,
          ),
        };
      }
    },
    [publicClient],
  );

  const checkVotesToken = useCallback(
    async (address: Address) => {
      if (publicClient) {
        try {
          const votesContract = getContract({
            abi: IVotesAbi,
            address,
            client: publicClient,
          });
          await Promise.all([
            votesContract.read.delegates([SENTINEL_ADDRESS]),
            votesContract.read.getVotes([SENTINEL_ADDRESS]),
          ]);
          return true;
        } catch (error) {
          return false;
        }
      }
    },
    [publicClient],
  );

  const prepareMultisigFormData = useCallback(
    async ({
      trustedAddresses,
      freezeGuard,
      ...rest
    }: SafeMultisigDAO & FreezeGuardConfigParam) => {
      const resolvedAddresses = await Promise.all(
        trustedAddresses.map(async inputValue => {
          if (validateENSName(inputValue) && publicClient) {
            const maybeEnsAddress = await publicClient.getEnsAddress({
              name: inputValue,
            });
            if (maybeEnsAddress) {
              return maybeEnsAddress;
            }
          }
          return inputValue;
        }),
      );
      let freezeGuardData;
      if (freezeGuard) {
        freezeGuardData = await prepareFreezeGuardData(freezeGuard);
      }
      return {
        trustedAddresses: resolvedAddresses,
        ...freezeGuardData,
        ...rest,
      };
    },
    [publicClient, prepareFreezeGuardData],
  );

  const prepareAzoriusERC20FormData = useCallback(
    async ({
      tokenSupply,
      tokenAllocations,
      parentAllocationAmount,
      quorumPercentage,
      timelock,
      votingPeriod,
      executionPeriod,
      freezeGuard,
      tokenImportAddress,
      tokenCreationType,
      ...rest
    }: AzoriusERC20DAO<BigIntValuePair> & FreezeGuardConfigParam): Promise<
      AzoriusERC20DAO | undefined
    > => {
      if (publicClient) {
        const resolvedTokenAllocations = await Promise.all(
          tokenAllocations.map(async allocation => {
            let address = allocation.address;
            if (validateENSName(address) && publicClient) {
              const maybeEnsAddress = await publicClient.getEnsAddress({
                name: allocation.address,
              });
              if (maybeEnsAddress) {
                address = maybeEnsAddress;
              }
            }
            return { amount: allocation.amount.bigintValue!, address: address };
          }),
        );
        let freezeGuardData;
        if (freezeGuard) {
          freezeGuardData = await prepareFreezeGuardData(freezeGuard);
        }
        const isTokenImported =
          tokenCreationType === TokenCreationType.IMPORTED && !!tokenImportAddress;
        let isVotesToken: boolean | undefined = false;
        if (isTokenImported) {
          isVotesToken = await checkVotesToken(tokenImportAddress);
        }
        return {
          tokenSupply: tokenSupply.bigintValue!,
          parentAllocationAmount: parentAllocationAmount?.bigintValue!,
          quorumPercentage: quorumPercentage.bigintValue!,
          timelock: await getEstimatedNumberOfBlocks(timelock.bigintValue!, publicClient),
          executionPeriod: await getEstimatedNumberOfBlocks(
            executionPeriod.bigintValue!,
            publicClient,
          ),
          votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigintValue!, publicClient),
          tokenAllocations: resolvedTokenAllocations,
          tokenImportAddress,
          tokenCreationType,
          isTokenImported,
          isVotesToken,
          ...freezeGuardData,
          ...rest,
        };
      }
    },
    [checkVotesToken, publicClient, prepareFreezeGuardData],
  );

  const prepareAzoriusERC721FormData = useCallback(
    async ({
      quorumPercentage,
      timelock,
      executionPeriod,
      votingPeriod,
      freezeGuard,
      nfts,
      quorumThreshold,
      ...rest
    }: AzoriusERC721DAO<BigIntValuePair> & FreezeGuardConfigParam): Promise<
      AzoriusERC721DAO | undefined
    > => {
      if (publicClient) {
        let freezeGuardData;
        if (freezeGuard) {
          freezeGuardData = await prepareFreezeGuardData(freezeGuard);
        }

        const resolvedNFTs = await Promise.all(
          nfts.map(async nft => {
            let address = nft.tokenAddress;
            if (validateENSName(address) && nft.tokenAddress) {
              const maybeEnsAddress = await publicClient.getEnsAddress({
                name: nft.tokenAddress,
              });
              if (maybeEnsAddress) {
                address = maybeEnsAddress;
              }
            }
            return {
              tokenAddress: address,
              tokenWeight: nft.tokenWeight.bigintValue!,
            };
          }),
        );

        return {
          quorumPercentage: quorumPercentage.bigintValue!,
          timelock: await getEstimatedNumberOfBlocks(timelock.bigintValue!, publicClient),
          executionPeriod: await getEstimatedNumberOfBlocks(
            executionPeriod.bigintValue!,
            publicClient,
          ),
          votingPeriod: await getEstimatedNumberOfBlocks(votingPeriod.bigintValue!, publicClient),
          nfts: resolvedNFTs,
          quorumThreshold: quorumThreshold.bigintValue!,
          ...freezeGuardData,
          ...rest,
        };
      }
    },
    [prepareFreezeGuardData, publicClient],
  );
  return {
    prepareMultisigFormData,
    prepareAzoriusERC20FormData,
    prepareAzoriusERC721FormData,
    checkVotesToken,
  };
}
