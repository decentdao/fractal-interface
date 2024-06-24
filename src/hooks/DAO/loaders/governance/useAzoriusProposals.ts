import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Address,
  GetContractEventsReturnType,
  GetContractReturnType,
  PublicClient,
  getContract,
} from 'viem';
import { usePublicClient } from 'wagmi';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import {
  CreateProposalMetadata,
  VotingStrategyType,
  DecodedTransaction,
  MetaTransaction,
  FractalProposalState,
} from '../../../../types';
import { AzoriusProposal } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, decodeTransactions } from '../../../../utils';
import { CacheExpiry, CacheKeys } from '../../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../../utils/cache/useLocalStorage';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

type OnProposalLoaded = (proposal: AzoriusProposal) => void;

export const useAzoriusProposals = () => {
  const currentAzoriusAddress = useRef<string>();

  const {
    governanceContracts: {
      moduleAzoriusAddress,
      linearVotingErc20Address,
      linearVotingErc721Address,
    },
    action,
  } = useFractal();
  const decode = useSafeDecoder();
  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!moduleAzoriusAddress || !publicClient) {
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

  const erc20VotedEvents = useMemo(async () => {
    if (!erc20StrategyContract) {
      return;
    }

    const events = await erc20StrategyContract.getEvents.Voted();
    return events;
  }, [erc20StrategyContract]);

  const erc721VotedEvents = useMemo(async () => {
    if (!erc721StrategyContract) {
      return;
    }

    const events = await erc721StrategyContract.getEvents.Voted();
    return events;
  }, [erc721StrategyContract]);

  const executedEvents = useMemo(async () => {
    if (!azoriusContract) {
      return;
    }

    const events = await azoriusContract.getEvents.ProposalExecuted();
    return events;
  }, [azoriusContract]);

  useEffect(() => {
    if (!moduleAzoriusAddress) {
      currentAzoriusAddress.current = undefined;
    }

    if (moduleAzoriusAddress && currentAzoriusAddress.current !== moduleAzoriusAddress) {
      currentAzoriusAddress.current = moduleAzoriusAddress;
    }
  }, [moduleAzoriusAddress]);

  const loadAzoriusProposals = useCallback(
    async (
      _azoriusContract: GetContractReturnType<typeof abis.Azorius, PublicClient> | undefined,
      _erc20StrategyContract:
        | GetContractReturnType<typeof abis.LinearERC20Voting, PublicClient>
        | undefined,
      _erc721StrategyContract:
        | GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient>
        | undefined,
      _strategyType: VotingStrategyType | undefined,
      _erc20VotedEvents:
        | GetContractEventsReturnType<typeof abis.LinearERC20Voting, 'Voted'>
        | undefined,
      _erc721VotedEvents:
        | GetContractEventsReturnType<typeof abis.LinearERC721Voting, 'Voted'>
        | undefined,
      _executedEvents:
        | GetContractEventsReturnType<typeof abis.Azorius, 'ProposalExecuted'>
        | undefined,
      _publicClient: PublicClient | undefined,
      _decode: (
        value: string,
        to: Address,
        data?: string | undefined,
      ) => Promise<DecodedTransaction[]>,
      _proposalLoaded: OnProposalLoaded,
    ) => {
      if (!_strategyType || !_azoriusContract || !_publicClient) {
        return;
      }
      const proposalCreatedEvents = (await _azoriusContract.getEvents.ProposalCreated()).reverse();

      action.dispatch({
        type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED,
        payload: false,
      });

      action.dispatch({
        type: FractalGovernanceAction.SET_LOADING_PROPOSALS,
        payload: true,
      });

      // TODO: `SET_LOADING_PROPOSALS` seems like the kind of action to be called once all proposals are finished loading.
      // So, it's strange that this function takes a single proposals as an argument.
      const completeProposalLoad = (proposal: AzoriusProposal) => {
        if (currentAzoriusAddress.current !== moduleAzoriusAddress) {
          // The DAO has changed, don't load the just-fetched proposal,
          // into state, and get out of this function completely.
          return;
        }

        _proposalLoaded(proposal);

        action.dispatch({
          type: FractalGovernanceAction.SET_LOADING_PROPOSALS,
          payload: false,
        });
      };

      for (const proposalCreatedEvent of proposalCreatedEvents) {
        if (!proposalCreatedEvent.args.proposalId) {
          continue;
        }

        const cachedProposal = getValue({
          cacheName: CacheKeys.PROPOSAL_CACHE,
          proposalId: proposalCreatedEvent.args.proposalId.toString(),
          contractAddress: _azoriusContract.address,
        });

        if (cachedProposal) {
          completeProposalLoad(cachedProposal);
          continue;
        }

        let proposalData;

        if (proposalCreatedEvent.args.metadata) {
          try {
            const metadataEvent: CreateProposalMetadata = JSON.parse(
              proposalCreatedEvent.args.metadata,
            );

            let transactions: MetaTransaction[] = [];
            let decodedTransactions: DecodedTransaction[] = [];

            if (proposalCreatedEvent.args.transactions) {
              transactions = proposalCreatedEvent.args.transactions.map(t => ({
                to: t.to,
                data: t.data,
                value: t.value,
                operation: t.operation,
              }));

              decodedTransactions = await decodeTransactions(_decode, transactions);
            }

            proposalData = {
              metaData: {
                title: metadataEvent.title,
                description: metadataEvent.description,
                documentationUrl: metadataEvent.documentationUrl,
              },
              transactions,
              decodedTransactions,
            };
          } catch {
            logError(
              'Unable to parse proposal metadata or transactions',
              'metadata:',
              proposalCreatedEvent.args.metadata,
              'transactions:',
              proposalCreatedEvent.args.transactions,
            );
          }
        }

        if (!proposalCreatedEvent.args.proposalId || !proposalCreatedEvent.args.proposer) {
          continue;
        }

        const proposal = await mapProposalCreatedEventToProposal(
          proposalCreatedEvent.transactionHash,
          _erc20StrategyContract,
          _erc721StrategyContract,
          _strategyType,
          Number(proposalCreatedEvent.args.proposalId),
          proposalCreatedEvent.args.proposer,
          _azoriusContract,
          _publicClient,
          _erc20VotedEvents,
          _erc721VotedEvents,
          _executedEvents,
          proposalData,
        );

        completeProposalLoad(proposal);

        const isProposalFossilized =
          proposal.state === FractalProposalState.CLOSED ||
          proposal.state === FractalProposalState.EXECUTED ||
          proposal.state === FractalProposalState.FAILED ||
          proposal.state === FractalProposalState.EXPIRED ||
          proposal.state === FractalProposalState.REJECTED;

        if (isProposalFossilized) {
          setValue(
            {
              cacheName: CacheKeys.PROPOSAL_CACHE,
              proposalId: proposalCreatedEvent.args.proposalId.toString(),
              contractAddress: _azoriusContract.address,
            },
            proposal,
            CacheExpiry.NEVER,
          );
        }
      }

      // Just in case there are no `proposalCreatedEvent`s, we still need to set the loading state to false.
      action.dispatch({
        type: FractalGovernanceAction.SET_LOADING_PROPOSALS,
        payload: false,
      });

      action.dispatch({
        type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED,
        payload: true,
      });
    },
    [action, moduleAzoriusAddress],
  );

  return async (proposalLoaded: OnProposalLoaded) =>
    loadAzoriusProposals(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      await erc20VotedEvents,
      await erc721VotedEvents,
      await executedEvents,
      publicClient,
      decode,
      proposalLoaded,
    );
};
