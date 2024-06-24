import { abis } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import {
  Address,
  GetContractEventsReturnType,
  GetContractReturnType,
  Hex,
  PublicClient,
  getAddress,
} from 'viem';
import { strategyFractalProposalStates } from '../constants/strategy';

import {
  FractalProposalState,
  ProposalVotesSummary,
  ProposalVote,
  ProposalData,
  AzoriusProposal,
  ActivityEventType,
  Parameter,
  SafeMultisigTransactionResponse,
  DataDecoded,
  FractalModuleData,
  FractalModuleType,
  DecodedTransaction,
  VotingStrategyType,
  ERC721ProposalVote,
  MetaTransaction,
  getVoteChoice,
} from '../types';
import { getTimeStamp } from './contract';

export const getAzoriusProposalState = async (
  azoriusContract: GetContractReturnType<typeof abis.Azorius, PublicClient>,
  proposalId: number,
): Promise<FractalProposalState> => {
  const state = await azoriusContract.read.proposalState([proposalId]);
  return strategyFractalProposalStates[state];
};

const getQuorum = async (
  erc20StrategyContract:
    | GetContractReturnType<typeof abis.LinearERC20Voting, PublicClient>
    | undefined,
  erc721StrategyContract:
    | GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient>
    | undefined,
  strategyType: VotingStrategyType,
  proposalId: number,
) => {
  let quorum;

  if (strategyType === VotingStrategyType.LINEAR_ERC20 && erc20StrategyContract) {
    quorum = await erc20StrategyContract.read.quorumVotes([proposalId]);
  } else if (strategyType === VotingStrategyType.LINEAR_ERC721 && erc721StrategyContract) {
    quorum = await erc721StrategyContract.read.quorumThreshold();
  } else {
    quorum = 0n;
  }

  return quorum;
};

export const getProposalVotesSummary = async (
  erc20Strategy: GetContractReturnType<typeof abis.LinearERC20Voting, PublicClient> | undefined,
  erc721Strategy: GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient> | undefined,
  strategyType: VotingStrategyType,
  proposalId: number,
): Promise<ProposalVotesSummary> => {
  try {
    if (erc20Strategy !== undefined && erc721Strategy !== undefined) {
      throw new Error("we don't support multiple strategy contracts");
    }

    if (erc20Strategy !== undefined) {
      const [noVotes, yesVotes, abstainVotes] = await erc20Strategy.read.getProposalVotes([
        proposalId,
      ]);

      return {
        yes: yesVotes,
        no: noVotes,
        abstain: abstainVotes,
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else if (erc721Strategy !== undefined) {
      const [noVotes, yesVotes, abstainVotes] = await erc721Strategy.read.getProposalVotes([
        proposalId,
      ]);

      return {
        yes: yesVotes,
        no: noVotes,
        abstain: abstainVotes,
        quorum: await getQuorum(erc20Strategy, erc721Strategy, strategyType, proposalId),
      };
    } else {
      return {
        yes: 0n,
        no: 0n,
        abstain: 0n,
        quorum: 0n,
      };
    }
  } catch (e) {
    // Sometimes loading DAO proposals called in the moment when proposal was **just** created
    // Thus, calling `getProposalVotes` for such a proposal reverts with error
    // This helps to prevent such case, while event listeners still should get proper data
    return {
      yes: 0n,
      no: 0n,
      abstain: 0n,
      quorum: 0n,
    };
  }
};

const getProposalVotes = (
  erc20VotedEvents: GetContractEventsReturnType<typeof abis.LinearERC20Voting, 'Voted'> | undefined,
  erc721VotedEvents:
    | GetContractEventsReturnType<typeof abis.LinearERC721Voting, 'Voted'>
    | undefined,
  proposalId: number,
): (ProposalVote | ERC721ProposalVote)[] => {
  if (erc20VotedEvents !== undefined && erc721VotedEvents !== undefined) {
    throw new Error("two voting contracts? we don't support that.");
  }

  if (erc20VotedEvents !== undefined) {
    const erc20ProposalVoteEvents = erc20VotedEvents.filter(voteEvent => {
      if (!voteEvent.args.proposalId) return false;
      return proposalId === voteEvent.args.proposalId;
    });

    const events = [];
    for (const event of erc20ProposalVoteEvents) {
      if (!event.args.voteType || !event.args.weight || !event.args.voter) {
        continue;
      }
      events.push({
        weight: event.args.weight,
        voter: event.args.voter,
        choice: getVoteChoice(event.args.voteType),
      });
    }
    return events;
  } else if (erc721VotedEvents !== undefined) {
    const erc721ProposalVoteEvents = erc721VotedEvents.filter(voteEvent => {
      if (!voteEvent.args.proposalId) return false;
      return proposalId === voteEvent.args.proposalId;
    });

    const events = [];
    for (const event of erc721ProposalVoteEvents) {
      if (!event.args.voteType || !event.args.voter || !event.args.tokenIds) {
        continue;
      }
      events.push({
        voter: event.args.voter,
        choice: getVoteChoice(event.args.voteType),
        weight: 1n,
        tokenIds: event.args.tokenIds.map(id => id.toString()),
      });
    }
    return events;
  }

  return [];
};

export const mapProposalCreatedEventToProposal = async (
  createdEventTransactionHash: Hex,
  erc20StrategyContract:
    | GetContractReturnType<typeof abis.LinearERC20Voting, PublicClient>
    | undefined,
  erc721StrategyContract:
    | GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient>
    | undefined,
  strategyType: VotingStrategyType,
  proposalId: number,
  proposer: Address,
  azoriusContract: GetContractReturnType<typeof abis.Azorius, PublicClient>,
  publicClient: PublicClient,
  erc20VotedEvents: GetContractEventsReturnType<typeof abis.LinearERC20Voting, 'Voted'> | undefined,
  erc721VotedEvents:
    | GetContractEventsReturnType<typeof abis.LinearERC721Voting, 'Voted'>
    | undefined,
  executedEvents: GetContractEventsReturnType<typeof abis.Azorius, 'ProposalExecuted'> | undefined,
  data?: ProposalData,
) => {
  if (erc20StrategyContract !== undefined && erc721StrategyContract !== undefined) {
    throw new Error("we don't support multiple strategy contracts");
  }

  let proposalVotes = {
    startBlock: 0,
    endBlock: 0,
    noVotes: 0n,
    yesVotes: 0n,
    abstainVotes: 0n,
  };

  if (erc20StrategyContract !== undefined) {
    const stratProposalVotes = await erc20StrategyContract.read.getProposalVotes([proposalId]);
    proposalVotes.noVotes = stratProposalVotes[0];
    proposalVotes.yesVotes = stratProposalVotes[1];
    proposalVotes.abstainVotes = stratProposalVotes[2];
    proposalVotes.startBlock = stratProposalVotes[3];
    proposalVotes.endBlock = stratProposalVotes[4];
  } else if (erc721StrategyContract !== undefined) {
    const stratProposalVotes = await erc721StrategyContract.read.getProposalVotes([proposalId]);
    proposalVotes.noVotes = stratProposalVotes[0];
    proposalVotes.yesVotes = stratProposalVotes[1];
    proposalVotes.abstainVotes = stratProposalVotes[2];
    proposalVotes.startBlock = stratProposalVotes[3];
    proposalVotes.endBlock = stratProposalVotes[4];
  } else {
    throw new Error('we need a strategy!');
  }

  const quorum = await getQuorum(
    erc20StrategyContract,
    erc721StrategyContract,
    strategyType,
    proposalId,
  );

  const deadlineSeconds = await getTimeStamp(proposalVotes.endBlock, publicClient);
  const block = await publicClient.getBlock({ blockNumber: BigInt(proposalVotes.startBlock) });

  const state = await getAzoriusProposalState(azoriusContract, proposalId);
  const votes = getProposalVotes(await erc20VotedEvents, await erc721VotedEvents, proposalId);

  const votesSummary = {
    yes: proposalVotes.yesVotes,
    no: proposalVotes.noVotes,
    abstain: proposalVotes.abstainVotes,
    quorum,
  };

  const targets = data ? data.decodedTransactions.map(tx => tx.target) : [];

  let transactionHash: string | undefined;
  if (state === FractalProposalState.EXECUTED) {
    const executedEvent = executedEvents?.find(event => event.args.proposalId === proposalId);

    if (!executedEvent) {
      throw new Error('Proposal state is EXECUTED, but no event found');
    }

    transactionHash = executedEvent.transactionHash;
  } else {
    transactionHash = createdEventTransactionHash;
  }

  const proposal: AzoriusProposal = {
    eventType: ActivityEventType.Governance,
    eventDate: new Date(Number(block.timestamp) * 1000),
    proposalId: proposalId.toString(),
    targets,
    proposer,
    startBlock: BigInt(proposalVotes.startBlock),
    transactionHash,
    deadlineMs: deadlineSeconds * 1000,
    state,
    votes,
    votesSummary,
    data,
  };

  return proposal;
};

export const parseMultiSendTransactions = (
  eventTransactionMap: Map<number, any>,
  parameters?: Parameter[],
) => {
  if (!parameters || !parameters.length) {
    return;
  }
  parameters.forEach((param: Parameter) => {
    const valueDecoded = param.valueDecoded;
    if (Array.isArray(valueDecoded)) {
      valueDecoded.forEach(value => {
        const decodedTransaction = {
          target: value.to,
          value: value.value, // This is the ETH value
          function: value.dataDecoded?.method,
          parameterTypes:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.type)
              : [],
          parameterValues:
            !!value.dataDecoded && value.dataDecoded.parameters
              ? value.dataDecoded.parameters.map(p => p.value)
              : [],
        };
        eventTransactionMap.set(eventTransactionMap.size, {
          ...decodedTransaction,
        });
        if (value.dataDecoded?.parameters && value.dataDecoded?.parameters?.length) {
          return parseMultiSendTransactions(eventTransactionMap, value.dataDecoded.parameters);
        }
      });
    }
  });
};

export const parseDecodedData = (
  multiSigTransaction:
    | SafeMultisigTransactionWithTransfersResponse
    | SafeMultisigTransactionResponse,
  isMultiSigTransaction: boolean,
): DecodedTransaction[] => {
  const eventTransactionMap = new Map<number, any>();
  const dataDecoded = multiSigTransaction.dataDecoded as any as DataDecoded;
  if (dataDecoded && isMultiSigTransaction) {
    const decodedTransaction: DecodedTransaction = {
      target: getAddress(multiSigTransaction.to),
      value: multiSigTransaction.value,
      function: dataDecoded.method,
      parameterTypes: dataDecoded.parameters ? dataDecoded.parameters.map(p => p.type) : [],
      parameterValues: dataDecoded.parameters
        ? dataDecoded.parameters.map(p => p.value.toString())
        : [],
    };
    eventTransactionMap.set(eventTransactionMap.size, {
      ...decodedTransaction,
    });
    parseMultiSendTransactions(eventTransactionMap, dataDecoded.parameters);
  }
  return Array.from(eventTransactionMap.values());
};

export function getAzoriusModuleFromModules(modules: FractalModuleData[]) {
  return modules.find(module => module.moduleType === FractalModuleType.AZORIUS);
}

export const decodeTransactions = async (
  _decode: (value: string, to: Address, data?: string | undefined) => Promise<DecodedTransaction[]>,
  _transactions: MetaTransaction[],
) => {
  const decodedTransactions = await Promise.all(
    _transactions.map(async tx => _decode(tx.value.toString(), tx.to, tx.data)),
  );
  return decodedTransactions.flat();
};
