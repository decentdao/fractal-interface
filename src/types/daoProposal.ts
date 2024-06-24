import { Address, Hex } from 'viem';
import { GovernanceActivity } from './fractal';
import { CreateProposalMetadata } from './proposalBuilder';
import { SafeMultisigConfirmationResponse } from './safeGlobal';
import { MetaTransaction, DecodedTransaction } from './transaction';

export interface ProposalExecuteData extends ExecuteData {
  metaData: CreateProposalMetadata;
}

export interface ExecuteData {
  targets: Address[];
  values: bigint[];
  calldatas: Hex[];
}

export type CreateProposalFunc = (proposal: {
  proposalData: {};
  successCallback: () => void;
}) => void;

export type ProposalData = {
  metaData?: CreateProposalMetadata;
  transactions?: MetaTransaction[];
  decodedTransactions: DecodedTransaction[];
};

export interface AzoriusProposal extends GovernanceActivity {
  proposer: Address;
  votesSummary: ProposalVotesSummary;
  votes: ProposalVote[] | ERC721ProposalVote[];
  /** The deadline timestamp for the proposal, in milliseconds. */
  deadlineMs: number;
  startBlock: bigint;
}

export interface MultisigProposal extends GovernanceActivity {
  confirmations: SafeMultisigConfirmationResponse[];
  signersThreshold?: number;
  multisigRejectedProposalNumber?: string;
  nonce?: number;
}

export interface SnapshotProposal extends GovernanceActivity {
  snapshotProposalId: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  author: Address;
}

interface SnapshotVotingStrategy {
  name: string;
  network: string;
  params: {
    addresses?: string[];
    symbol?: string;
  };
}

interface SnapshotPlugin {}
export interface SnapshotWeightedVotingChoice {
  [choice: number]: number;
}
export interface SnapshotVote {
  id: string;
  voter: Address;
  votingWeight: number;
  votingWeightByStrategy: number[];
  votingState: string;
  created: number;
  choice: number | SnapshotWeightedVotingChoice;
}

export interface SnapshotVoteBreakdown {
  // Choice might be dynamically created by proposal's author.
  // So "For" | "Against" | "Abstain" are not hardcoded/guaranteed
  // However, it's not a big deal cause we don't need to rely on that
  [voteChoice: string]: {
    total: number;
    votes: SnapshotVote[];
  };
}

export type SnapshotProposalType =
  | 'single-choice'
  | 'approval'
  | 'quadratic'
  | 'ranked-choice'
  | 'weighted'
  | 'basic';

/**
 * @interface ExtendedSnapshotProposal - extension of `SnapshotProposal` to inject voting strategy data, votes, quorum, etc.
 * Their data model is quite different comparing to our, so there's not much of point to reuse existing
 */
export interface ExtendedSnapshotProposal extends SnapshotProposal {
  snapshot: number; // Number of block
  snapshotState: string; // State retrieved from Snapshot
  type: SnapshotProposalType;
  quorum?: number;
  privacy?: string;
  ipfs: string;
  strategies: SnapshotVotingStrategy[];
  choices: string[];
  plugins: SnapshotPlugin[];
  votes: SnapshotVote[];
  votesBreakdown: SnapshotVoteBreakdown;
}

export type ProposalVotesSummary = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
  quorum: bigint;
};

export type ProposalVote = {
  voter: Address;
  choice: (typeof VOTE_CHOICES)[number];
  weight: bigint;
};

export type ERC721ProposalVote = {
  tokenAddresses: Address[];
  tokenIds: string[];
} & ProposalVote;

export const VOTE_CHOICES = [
  {
    label: 'yes',
    value: 1,
  },
  {
    label: 'no',
    value: 0,
  },
  {
    label: 'abstain',
    value: 2,
  },
] as const;

export const getVoteChoice = (value: number) => {
  const choice = VOTE_CHOICES.find(c => c.value === value);
  if (!choice) {
    throw new Error(`Invalid vote choice: ${value}`);
  }

  return choice;
};
