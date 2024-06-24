import { abis } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { CreateProposalMetadata, VotingStrategyType } from '../../../../types';
import {
  getProposalVotesSummary,
  mapProposalCreatedEventToProposal,
  decodeTransactions,
} from '../../../../utils';
import { getAverageBlockTime } from '../../../../utils/contract';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusListeners = () => {
  const {
    action,
    governanceContracts: {
      moduleAzoriusAddress,
      linearVotingErc20Address,
      linearVotingErc721Address,
    },
  } = useFractal();
  const decode = useSafeDecoder();
  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!publicClient || !moduleAzoriusAddress) {
      return;
    }

    return getContract({
      abi: abis.Azorius,
      address: moduleAzoriusAddress,
      client: publicClient,
    });
  }, [moduleAzoriusAddress, publicClient]);

  const strategyType = useMemo(() => {
    if (linearVotingErc20Address) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (linearVotingErc721Address) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [linearVotingErc20Address, linearVotingErc721Address]);

  const erc20StrategyContract = useMemo(() => {
    if (!linearVotingErc20Address || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: abis.LinearERC20Voting,
      address: linearVotingErc20Address,
      client: publicClient,
    });
  }, [linearVotingErc20Address, publicClient]);

  const erc721StrategyContract = useMemo(() => {
    if (!linearVotingErc721Address || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: abis.LinearERC721Voting,
      address: linearVotingErc721Address,
      client: publicClient,
    });
  }, [linearVotingErc721Address, publicClient]);

  useEffect(() => {
    if (!azoriusContract || !strategyType) {
      return;
    }

    const unwatch = azoriusContract.watchEvent.ProposalCreated({
      onLogs: async logs => {
        for (const log of logs) {
          if (
            !log.args.strategy ||
            !log.args.proposalId ||
            !log.args.metadata ||
            !log.args.transactions ||
            !log.args.proposer ||
            !publicClient
          ) {
            continue;
          }

          // Wait for a block before processing.
          // We've seen that calling smart contract functions in `mapProposalCreatedEventToProposal`
          // which include the `proposalId` error out because the RPC node (rather, the block it's on)
          // doesn't see this proposal yet (despite the event being caught in the app...).
          const averageBlockTime = await getAverageBlockTime(publicClient);
          await new Promise(resolve => setTimeout(resolve, averageBlockTime * 1000));

          const typedTransactions = log.args.transactions.map(t => ({
            ...t,
            to: t.to,
            data: t.data,
            value: t.value,
          }));

          const metaDataEvent: CreateProposalMetadata = JSON.parse(log.args.metadata);
          const proposalData = {
            metaData: {
              title: metaDataEvent.title,
              description: metaDataEvent.description,
              documentationUrl: metaDataEvent.documentationUrl,
            },
            transactions: typedTransactions,
            decodedTransactions: await decodeTransactions(decode, typedTransactions),
          };

          const proposal = await mapProposalCreatedEventToProposal(
            log.transactionHash,
            erc20StrategyContract,
            erc721StrategyContract,
            strategyType,
            Number(log.args.proposalId),
            log.args.proposer,
            azoriusContract,
            publicClient,
            undefined,
            undefined,
            undefined,
            proposalData,
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
            payload: proposal,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [
    action,
    azoriusContract,
    decode,
    erc20StrategyContract,
    erc721StrategyContract,
    publicClient,
    strategyType,
  ]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC20 || !erc20StrategyContract) {
      return;
    }

    const unwatch = erc20StrategyContract.watchEvent.Voted({
      onLogs: async logs => {
        for (const log of logs) {
          if (!log.args.proposalId || !log.args.voter || !log.args.voteType || !log.args.weight) {
            continue;
          }

          const votesSummary = await getProposalVotesSummary(
            erc20StrategyContract,
            undefined,
            strategyType,
            log.args.proposalId,
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
            payload: {
              proposalId: log.args.proposalId.toString(),
              voter: log.args.voter,
              support: log.args.voteType,
              weight: log.args.weight,
              votesSummary,
            },
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc20StrategyContract, strategyType]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC721 || !erc721StrategyContract) {
      return;
    }

    const unwatch = erc721StrategyContract.watchEvent.Voted({
      onLogs: async logs => {
        for (const log of logs) {
          if (
            !log.args.proposalId ||
            !log.args.voter ||
            !log.args.voteType ||
            !log.args.tokenAddresses ||
            !log.args.tokenIds
          ) {
            continue;
          }

          const votesSummary = await getProposalVotesSummary(
            undefined,
            erc721StrategyContract,
            strategyType,
            log.args.proposalId,
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
            payload: {
              proposalId: log.args.proposalId.toString(),
              voter: log.args.voter,
              support: log.args.voteType,
              tokenAddresses: log.args.tokenAddresses.map(tokenAddress => tokenAddress),
              tokenIds: log.args.tokenIds.map(tokenId => tokenId.toString()),
              votesSummary,
            },
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc721StrategyContract, strategyType]);

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }

    const unwatch = azoriusContract.watchEvent.TimelockPeriodUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.timelockPeriod) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
            payload: BigInt(log.args.timelockPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, azoriusContract]);
};
