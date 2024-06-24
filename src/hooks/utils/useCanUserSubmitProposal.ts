import { abis } from '@fractal-framework/fractal-contracts';
import { useState, useCallback, useEffect } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { GovernanceType } from '../../types';
import useVotingStrategyAddress from './useVotingStrategyAddress';

export function useCanUserCreateProposal() {
  const {
    node: { safe },
    governance: { type },
    governanceContracts: { linearVotingErc20Address, linearVotingErc721Address },
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const [canUserCreateProposal, setCanUserCreateProposal] = useState<boolean>();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  /**
   * Performs a check whether user has access rights to create proposal for DAO
   * @param {string} safeAddress - parameter to verify that user can create proposal for this specific DAO.
   * Otherwise - it is checked for DAO from the global context.
   * @returns {Promise<boolean>} - whether or not user has rights to create proposal either in global scope either for provided `safeAddress`.
   */
  const getCanUserCreateProposal = useCallback(
    async (safeAddress?: Address): Promise<boolean | undefined> => {
      if (!user.address || !safeAPI || !publicClient) {
        return;
      }

      const checkIsMultisigOwner = (owners?: string[]) => {
        return !!owners?.includes(user.address || '');
      };

      if (safeAddress) {
        const votingStrategyAddress = await getVotingStrategyAddress(safeAddress);
        if (votingStrategyAddress) {
          const votingContract = getContract({
            abi: abis.LinearERC20Voting,
            address: votingStrategyAddress,
            client: publicClient,
          });
          const isProposer = await votingContract.read.isProposer([user.address]);
          return isProposer;
        } else {
          const safeInfo = await safeAPI.getSafeInfo(safeAddress);
          return checkIsMultisigOwner(safeInfo.owners);
        }
      } else {
        if (type === GovernanceType.MULTISIG) {
          const { owners } = safe || {};
          return checkIsMultisigOwner(owners);
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          if (linearVotingErc20Address) {
            const ozLinearVotingContract = getContract({
              abi: abis.LinearERC20Voting,
              address: linearVotingErc20Address,
              client: publicClient,
            });

            const isProposer = await ozLinearVotingContract.read.isProposer([user.address]);
            return isProposer;
          }
        } else if (type === GovernanceType.AZORIUS_ERC721 && linearVotingErc721Address) {
          const erc721LinearVotingContract = getContract({
            abi: abis.LinearERC721Voting,
            address: linearVotingErc721Address,
            client: publicClient,
          });

          const isProposer = await erc721LinearVotingContract.read.isProposer([user.address]);
          return isProposer;
        } else {
          return;
        }
      }
      return;
    },
    [
      linearVotingErc721Address,
      getVotingStrategyAddress,
      linearVotingErc20Address,
      publicClient,
      safe,
      safeAPI,
      type,
      user.address,
    ],
  );

  useEffect(() => {
    (async () => {
      setCanUserCreateProposal(await getCanUserCreateProposal());
    })();
  }, [getCanUserCreateProposal, canUserCreateProposal]);

  return { canUserCreateProposal, getCanUserCreateProposal };
}
