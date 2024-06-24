import { Address } from 'viem';
import {
  FractalProposal,
  ProposalVotesSummary,
  ERC20TokenData,
  FractalProposalState,
  VotesData,
  VotingStrategy,
  UnderlyingTokenData,
  GovernanceType,
  ERC721TokenData,
} from '../../../types';
import { ProposalTemplate } from '../../../types/proposalBuilder';

export enum FractalGovernanceAction {
  SET_LOADING_PROPOSALS = 'SET_LOADING_PROPOSALS',
  SET_ALL_PROPOSALS_LOADED = 'SET_ALL_PROPOSALS_LOADED',
  SET_GOVERNANCE_TYPE = 'SET_GOVERNANCE_TYPE',
  SET_PROPOSALS = 'SET_PROPOSALS',
  SET_AZORIUS_PROPOSAL = 'SET_AZORIUS_PROPOSAL',
  SET_SNAPSHOT_PROPOSALS = 'SET_SNAPSHOT_PROPOSALS',
  SET_PROPOSAL_TEMPLATES = 'SET_PROPOSAL_TEMPLATES',
  SET_STRATEGY = 'SET_STRATEGY',
  UPDATE_PROPOSALS_NEW = 'UPDATE_PROPOSALS_NEW',
  UPDATE_NEW_AZORIUS_ERC20_VOTE = 'UPDATE_NEW_AZORIUS_ERC20_VOTE',
  UPDATE_NEW_AZORIUS_ERC721_VOTE = 'UPDATE_NEW_AZORIUS_ERC721_VOTE',
  UPDATE_PROPOSAL_STATE = 'UPDATE_PROPOSAL_STATE',
  UPDATE_VOTING_PERIOD = 'UPDATE_VOTING_PERIOD',
  UPDATE_VOTING_QUORUM = 'UPDATE_VOTING_QUORUM',
  UPDATE_VOTING_QUORUM_THRESHOLD = 'UPDATE_VOTING_QUORUM_THRESHOLD',
  UPDATE_TIMELOCK_PERIOD = 'UPDATE_TIMELOCK_PERIOD',
  SET_ERC721_TOKENS_DATA = 'SET_ERC721_TOKENS_DATA',
  SET_TOKEN_DATA = 'SET_TOKEN_DATA',
  SET_TOKEN_ACCOUNT_DATA = 'SET_TOKEN_ACCOUNT_DATA',
  SET_CLAIMING_CONTRACT = 'SET_CLAIMING_CONTRACT',
  RESET_TOKEN_ACCOUNT_DATA = 'RESET_TOKEN_ACCOUNT_DATA',
  SET_UNDERLYING_TOKEN_DATA = 'SET_UNDERLYING_TOKEN_DATA',
  PENDING_PROPOSAL_ADD = 'PENDING_PROPOSAL_ADD',
}

export enum DecentGovernanceAction {
  RESET_LOCKED_TOKEN_ACCOUNT_DATA = 'RESET_LOCKED_TOKEN_ACCOUNT_DATA',
  SET_LOCKED_TOKEN_ACCOUNT_DATA = 'SET_LOCKED_TOKEN_ACCOUNT_DATA',
}

type AzoriusVotePayload = {
  proposalId: string;
  voter: Address;
  support: number;
  votesSummary: ProposalVotesSummary;
};

export type ERC20VotePayload = { weight: bigint } & AzoriusVotePayload;
export type ERC721VotePayload = {
  tokenAddresses: Address[];
  tokenIds: string[];
} & AzoriusVotePayload;

export type FractalGovernanceActions =
  | { type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED; payload: boolean }
  | { type: FractalGovernanceAction.SET_LOADING_PROPOSALS; payload: boolean }
  | { type: FractalGovernanceAction.SET_GOVERNANCE_TYPE; payload: GovernanceType }
  | { type: FractalGovernanceAction.SET_STRATEGY; payload: VotingStrategy }
  | {
      type: FractalGovernanceAction.SET_PROPOSALS;
      payload: FractalProposal[];
    }
  | {
      type: FractalGovernanceAction.SET_AZORIUS_PROPOSAL;
      payload: FractalProposal;
    }
  | {
      type: FractalGovernanceAction.SET_SNAPSHOT_PROPOSALS;
      payload: FractalProposal[];
    }
  | { type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES; payload: ProposalTemplate[] }
  | { type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW; payload: FractalProposal }
  | {
      type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE;
      payload: ERC721VotePayload;
    }
  | {
      type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE;
      payload: ERC20VotePayload;
    }
  | {
      type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE;
      payload: { state: FractalProposalState; proposalId: string };
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_PERIOD;
      payload: bigint;
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_QUORUM;
      payload: bigint;
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD;
      payload: bigint;
    }
  | {
      type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD;
      payload: bigint;
    }
  | { type: FractalGovernanceAction.SET_ERC721_TOKENS_DATA; payload: ERC721TokenData[] }
  | {
      type: FractalGovernanceAction.SET_TOKEN_DATA;
      payload: ERC20TokenData;
    }
  | {
      type: FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA;
      payload: UnderlyingTokenData;
    }
  | {
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA;
      payload: VotesData;
    }
  | {
      type: FractalGovernanceAction.SET_CLAIMING_CONTRACT;
      payload: Address;
    }
  | {
      type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA;
    }
  | {
      type: FractalGovernanceAction.PENDING_PROPOSAL_ADD;
      payload: string;
    }
  | DecentGovernanceActions;

export type DecentGovernanceActions =
  | {
      type: DecentGovernanceAction.SET_LOCKED_TOKEN_ACCOUNT_DATA;
      payload: VotesData;
    }
  | {
      type: DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA;
    };
