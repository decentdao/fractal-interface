import { abis } from '@fractal-framework/fractal-contracts';
import { useState, useEffect, useCallback } from 'react';
import { Address, GetContractReturnType, PublicClient, erc721Abi, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { AzoriusGovernance } from '../../../types';
import useVotingStrategyAddress from '../../utils/useVotingStrategyAddress';

/**
 * Retrieves list of ERC-721 voting tokens for the supplied `address`(aka `user.address`) param
 * @param {string} [proposalId] - Proposal ID. When it's provided - calculates `remainingTokenIds` and `remainingTokenAddresses` that user can use for voting on speicific proposal.
 * @param {Address|null} [safeAddress] - address of Safe{Wallet}, for which voting tokens should be retrieved. If not provided - these are used from global context.
 * @param {boolean} [loadOnMount] - whether to fetch voting tokens on component mount or not. Leaves the space to fetch those tokens via getUserERC721VotingTokens
 * @returns {string[]} `totalVotingTokenIds` - list of all ERC-721 tokens that are held by `address`.
 * @returns {string[]} `totalVotingTokenAddresses` - list of contract addresses that corresponds to token `totalVotingTokenIds` array. Aka if user holds 3 tokens of from 1 NFT contract - the address of contract will be repeated 3 times.
 * @returns {string[]} `remainingTokenIds - list of tokens that `address` can use for proposal under `proposalId` param. This covers the case when user already voted for proposal but received more tokens, that weren't used in this proposal.
 * @returns {string[]} `remainingTokenAddresses` - same as `totalVotingTokenAddresses` - repeats contract address of NFT for each token ID in `remainingTokenIds` array.
 */
export default function useUserERC721VotingTokens(
  safeAddress: Address | null,
  proposalId?: string,
  loadOnMount: boolean = true,
) {
  const [totalVotingTokenIds, setTotalVotingTokenIds] = useState<string[]>([]);
  const [totalVotingTokenAddresses, setTotalVotingTokenAddresses] = useState<Address[]>([]);
  const [remainingTokenIds, setRemainingTokenIds] = useState<string[]>([]);
  const [remainingTokenAddresses, setRemainingTokenAddresses] = useState<Address[]>([]);

  const {
    node: { daoAddress },
    governanceContracts: { linearVotingErc721Address },
    governance,
    readOnly: { user },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  const getUserERC721VotingTokens = useCallback(
    async (_safeAddress: Address | null, _proposalId?: number) => {
      const totalTokenAddresses: Address[] = [];
      const totalTokenIds: string[] = [];
      const tokenAddresses: Address[] = [];
      const tokenIds: string[] = [];
      const userERC721Tokens = new Map<Address, Set<string>>();

      let govTokens = erc721Tokens;
      let votingContract:
        | GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient>
        | undefined;

      if (!daoAddress || !publicClient || !safeAPI) {
        return {
          totalVotingTokenAddresses: totalTokenAddresses,
          totalVotingTokenIds: totalTokenIds,
          remainingTokenAddresses: tokenAddresses,
          remainingTokenIds: tokenIds,
        };
      }

      if (_safeAddress && daoAddress !== _safeAddress) {
        // Means getting these for any safe, primary use case - calculating user voting weight for freeze voting
        const votingStrategyAddress = await getVotingStrategyAddress(_safeAddress);
        if (votingStrategyAddress) {
          votingContract = getContract({
            abi: abis.LinearERC721Voting,
            address: votingStrategyAddress,
            client: publicClient,
          });
          const addresses = await votingContract.read.getAllTokenAddresses();
          govTokens = await Promise.all(
            addresses.map(async tokenAddress => {
              if (!votingContract) {
                throw new Error('voting contract is undefined');
              }

              const tokenContract = getContract({
                abi: erc721Abi,
                address: tokenAddress,
                client: publicClient,
              });

              const [votingWeight, name, symbol] = await Promise.all([
                votingContract.read.getTokenWeight([tokenAddress]),
                tokenContract.read.name(),
                tokenContract.read.symbol(),
              ]);

              return { name, symbol, address: tokenAddress, votingWeight };
            }),
          );
        }
      }

      if (linearVotingErc721Address && !votingContract) {
        votingContract = getContract({
          abi: abis.LinearERC721Voting,
          address: linearVotingErc721Address,
          client: publicClient,
        });
      }

      if (!govTokens || !votingContract || !user.address) {
        return {
          totalVotingTokenAddresses: totalTokenAddresses,
          totalVotingTokenIds: totalTokenIds,
          remainingTokenAddresses: tokenAddresses,
          remainingTokenIds: tokenIds,
        };
      }

      const userAddress = user.address;
      await Promise.all(
        // Using `map` instead of `forEach` to simplify usage of `Promise.all`
        // and guarantee syncronous contractFn assignment
        govTokens.map(async token => {
          const tokenContract = getContract({
            abi: erc721Abi,
            address: token.address,
            client: publicClient,
          });
          if ((await tokenContract.read.balanceOf([userAddress])) > 0n) {
            const tokenSentEvents = await tokenContract.getEvents.Transfer(
              { from: userAddress },
              { fromBlock: 0n },
            );
            const tokenReceivedEvents = await tokenContract.getEvents.Transfer(
              { to: userAddress },
              { fromBlock: 0n },
            );

            const allEvents = tokenSentEvents
              .concat(tokenReceivedEvents)
              .sort(
                (a, b) =>
                  Number(a.blockNumber - b.blockNumber) || a.transactionIndex - b.transactionIndex,
              );

            const ownedTokenIds = new Set<string>();
            allEvents.forEach(({ args: { to, from, tokenId } }) => {
              if (!to || !from || !tokenId) {
                throw new Error('An ERC721 event has undefiend data');
              }
              if (to.toLowerCase() === userAddress.toLowerCase()) {
                ownedTokenIds.add(tokenId.toString());
              } else if (from.toLowerCase() === userAddress.toLowerCase()) {
                ownedTokenIds.delete(tokenId.toString());
              }
            });
            if (ownedTokenIds.size > 0) {
              userERC721Tokens.set(token.address, ownedTokenIds);
            }
          }
        }),
      );

      const tokenIdsSets = [...userERC721Tokens.values()];
      const tokenAddressesKeys = [...userERC721Tokens.keys()];

      await Promise.all(
        // Same here
        tokenIdsSets.map(async (tokenIdsSet, setIndex) => {
          const tokenAddress = tokenAddressesKeys[setIndex];
          // Damn, this is so ugly
          // Probably using Moralis API might improve this
          // But I also don't want to intruduce another API for this single thing
          // Maybe, if we will encounter need to wider support of ERC-1155 - we will bring it and improve this piece of crap as well :D
          await Promise.all(
            [...tokenIdsSet.values()].map(async tokenId => {
              if (!votingContract) {
                throw new Error('voting contract is undefined');
              }

              totalTokenAddresses.push(tokenAddress);
              totalTokenIds.push(tokenId);
              if (_proposalId) {
                const tokenVoted = await votingContract.read.hasVoted([
                  _proposalId,
                  tokenAddress,
                  BigInt(tokenId),
                ]);
                if (!tokenVoted) {
                  tokenAddresses.push(tokenAddress);
                  tokenIds.push(tokenId);
                }
              }
            }),
          );
        }),
      );

      return {
        totalVotingTokenAddresses: totalTokenAddresses,
        totalVotingTokenIds: totalTokenIds,
        remainingTokenAddresses: tokenAddresses,
        remainingTokenIds: tokenIds,
      };
    },
    [
      daoAddress,
      linearVotingErc721Address,
      erc721Tokens,
      getVotingStrategyAddress,
      publicClient,
      safeAPI,
      user.address,
    ],
  );

  const loadUserERC721VotingTokens = useCallback(async () => {
    const tokensInfo = await getUserERC721VotingTokens(safeAddress, Number(proposalId));
    if (tokensInfo) {
      setTotalVotingTokenAddresses(tokensInfo.totalVotingTokenAddresses);
      setTotalVotingTokenIds(tokensInfo.totalVotingTokenIds);
      setRemainingTokenAddresses(tokensInfo.remainingTokenAddresses);
      setRemainingTokenIds(tokensInfo.remainingTokenIds);
    }
  }, [getUserERC721VotingTokens, proposalId, safeAddress]);

  useEffect(() => {
    if (loadOnMount && linearVotingErc721Address) {
      loadUserERC721VotingTokens();
    }
  }, [loadUserERC721VotingTokens, loadOnMount, linearVotingErc721Address]);

  return {
    totalVotingTokenIds,
    totalVotingTokenAddresses,
    remainingTokenAddresses,
    remainingTokenIds,
    getUserERC721VotingTokens,
    loadUserERC721VotingTokens,
  };
}
