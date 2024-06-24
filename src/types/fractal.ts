import {
  SafeMultisigTransactionWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
  SafeBalanceResponse,
  SafeCollectibleResponse,
} from '@safe-global/safe-service-client';
import { Dispatch } from 'react';
import { Address } from 'viem';
import { FractalGovernanceActions } from '../providers/App/governance/action';
import { GovernanceContractActions } from '../providers/App/governanceContracts/action';
import { FractalGuardActions } from '../providers/App/guard/action';
import { GuardContractActions } from '../providers/App/guardContracts/action';
import { TreasuryActions } from '../providers/App/treasury/action';
import { NodeActions } from './../providers/App/node/action';
import { ERC721TokenData, VotesTokenData } from './account';
import { FreezeGuardType, FreezeVotingType } from './daoGovernance';
import { ProposalData, MultisigProposal, AzoriusProposal, SnapshotProposal } from './daoProposal';
import { TreasuryActivity } from './daoTreasury';
import { ProposalTemplate } from './proposalBuilder';
import { AllTransfersListResponse, SafeInfoResponseWithGuard } from './safeGlobal';
import { BIFormattedPair } from './votingFungibleToken';
/**
 * The possible states of a DAO proposal, for both Token Voting (Azorius) and Multisignature
 * (Safe) governance, as well as Snapshot specific states.
 *
 * @note it is required that Azorius-specific states match those on the Azorius contracts,
 * including casing and ordering.  States not specific to Azorius must be placed at the end
 * of this enum.
 */
export enum FractalProposalState {
  /**
   * Proposal is created and can be voted on.  This is the initial state of all
   * newly created proposals.
   *
   * Azorius / Multisig (all proposals).
   */
  ACTIVE = 'stateActive',

  /**
   * A proposal that passes enters the `TIMELOCKED` state, during which it cannot yet be executed.
   * This is to allow time for token holders to potentially exit their position, as well as parent DAOs
   * time to initiate a freeze, if they choose to do so. A proposal stays timelocked for the duration
   * of its `timelockPeriod`.
   *
   * Azorius (all) and multisig *subDAO* proposals.
   */
  TIMELOCKED = 'stateTimeLocked',

  /**
   * Following the `TIMELOCKED` state, a passed proposal becomes `EXECUTABLE`, and can then finally
   * be executed on chain.
   *
   * Azorius / Multisig (all proposals).
   */
  EXECUTABLE = 'stateExecutable',

  /**
   * The final state for a passed proposal.  The proposal has been executed on the blockchain.
   *
   * Azorius / Multisig (all proposals).
   */
  EXECUTED = 'stateExecuted',

  /**
   * A passed proposal which is not executed before its `executionPeriod` has elapsed will be `EXPIRED`,
   * and can no longer be executed.
   *
   * Azorius (all) and multisig *subDAO* proposals.
   */
  EXPIRED = 'stateExpired',

  /**
   * A failed proposal (as defined by its [BaseStrategy](../BaseStrategy.md) `isPassed` function). For a basic strategy,
   * this would mean it received more NO votes than YES or did not achieve quorum.
   *
   * Azorius only.
   */
  FAILED = 'stateFailed',

  /**
   * Proposal fails due to a proposal being executed with the same nonce.
   * A multisig proposal is off-chain, and is signed with a specific nonce.
   * If a proposal with a nonce is executed, any proposal with the same or lesser
   * nonce will be impossible to execute, reguardless of how many signers it has.
   *
   * Multisig only.
   */
  REJECTED = 'stateRejected',

  /**
   * Quorum (or signers) is reached, the proposal can be 'timelocked' for execution.
   * Anyone can move the state from Timelockable to TimeLocked via a transaction.
   *
   * Multisig subDAO only, Azorius DAOs move from ACTIVE to TIMELOCKED automatically.
   */
  TIMELOCKABLE = 'stateTimelockable',

  /**
   * Any Safe is able to have modules attached (e.g. Azorius), which can act essentially as a backdoor,
   * executing transactions without needing the required signers.
   *
   * Safe Module 'proposals' in this sense are single state proposals that are already executed.
   *
   * This is a rare case, but third party modules could potentially generate this state so we allow
   * for badges to properly label this case in the UI.
   *
   * Third party Safe module transactions only.
   */
  MODULE = 'stateModule',

  /**
   * The proposal is pending, meaning it has been created, but voting has not yet begun. This state
   * has nothing to do with Fractal, and is used for Snapshot proposals only, which appear if the
   * DAO's snapshotENS is set.
   */
  PENDING = 'statePending',

  /**
   * The proposal is closed, and no longer able to be signed. This state has nothing to do with Fractal,
   * and is used for Snapshot proposals only, which appear if the DAO's snapshotENS is set.
   */
  CLOSED = 'stateClosed',
}

export interface GovernanceActivity extends ActivityBase {
  state: FractalProposalState | null;
  proposalId: string;
  targets: Address[];
  data?: ProposalData;
}

export interface ActivityBase {
  eventDate: Date;
  eventType: ActivityEventType;
  transaction?: ActivityTransactionType;
  transactionHash: string;
}

export type Activity = TreasuryActivity | MultisigProposal | AzoriusProposal | SnapshotProposal;

export type ActivityTransactionType =
  | SafeMultisigTransactionWithTransfersResponse
  | SafeModuleTransactionWithTransfersResponse
  | EthereumTxWithTransfersResponse;

export enum ActivityEventType {
  Treasury,
  Governance,
}

export enum SafeTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
}

export interface ITokenAccount {
  userBalance?: bigint;
  userBalanceString: string | undefined;
  delegatee: string | undefined;
  votingWeight?: bigint;
  votingWeightString: string | undefined;
}

/**
 * @dev This interface represents the store for the Fractal DAO.
 * @param baseContracts - This object contains the base contracts for the Fractal DAO.
 * @param clients - This object contains the clients for the Fractal DAO.
 * @param dispatch - This object contains the dispatch functions for the Fractal DAO.
 */
export interface FractalStore extends Fractal {
  action: {
    dispatch: Dispatch<FractalActions>;
    loadReadOnlyValues: () => Promise<void>;
    resetSafeState: () => Promise<void>;
  };
}
export enum StoreAction {
  RESET = 'RESET',
}
export type FractalActions =
  | { type: StoreAction.RESET }
  | NodeActions
  | FractalGuardActions
  | FractalGovernanceActions
  | TreasuryActions
  | GovernanceContractActions
  | GuardContractActions;
export interface Fractal {
  node: FractalNode;
  guard: FreezeGuard;
  governance: FractalGovernance;
  treasury: FractalTreasury;
  governanceContracts: FractalGovernanceContracts;
  guardContracts: FractalGuardContracts;
  readOnly: ReadOnlyState;
}

export interface FractalGovernanceContracts {
  linearVotingErc20Address?: Address;
  linearVotingErc721Address?: Address;
  moduleAzoriusAddress?: Address;
  votesTokenAddress?: Address;
  lockReleaseAddress?: Address;
  underlyingTokenAddress?: Address;
  isLoaded: boolean;
}

export interface FractalNode {
  daoName: string | null;
  daoAddress: Address | null;
  safe: SafeInfoResponseWithGuard | null;
  fractalModules: FractalModuleData[];
  nodeHierarchy: NodeHierarchy;
  isModulesLoaded?: boolean;
  isHierarchyLoaded?: boolean;
  daoSnapshotENS?: string;
  proposalTemplatesHash?: string;
}

export interface Node
  extends Omit<FractalNode, 'safe' | 'fractalModules' | 'isModulesLoaded' | 'isHierarchyLoaded'> {}

export interface FractalModuleData {
  moduleAddress: Address;
  moduleType: FractalModuleType;
}

export enum FractalModuleType {
  AZORIUS,
  FRACTAL,
  UNKNOWN,
}
export interface FractalGuardContracts {
  freezeGuardContractAddress?: Address;
  freezeVotingContractAddress?: Address;
  freezeGuardType: FreezeGuardType | null;
  freezeVotingType: FreezeVotingType | null;
  isGuardLoaded?: boolean;
}

export interface FreezeGuard {
  freezeVotesThreshold: bigint | null; // Number of freeze votes required to activate a freeze
  freezeProposalCreatedTime: bigint | null; // Block number the freeze proposal was created at
  freezeProposalVoteCount: bigint | null; // Number of accrued freeze votes
  freezeProposalPeriod: bigint | null; // Number of blocks a freeze proposal has to succeed
  freezePeriod: bigint | null; // Number of blocks a freeze lasts, from time of freeze proposal creation
  userHasFreezeVoted: boolean;
  isFrozen: boolean;
  userHasVotes: boolean;
}

export interface FractalTreasury {
  assetsFungible: SafeBalanceResponse[];
  assetsNonFungible: SafeCollectibleResponse[];
  transfers?: AllTransfersListResponse;
}

export type FractalGovernance = AzoriusGovernance | DecentGovernance | SafeMultisigGovernance;

export interface AzoriusGovernance extends Governance {
  votingStrategy: VotingStrategyAzorius;
  votesToken: VotesTokenData | undefined;
  erc721Tokens?: ERC721TokenData[];
}

export interface DecentGovernance extends AzoriusGovernance {
  lockedVotesToken?: VotesTokenData;
}
export interface SafeMultisigGovernance extends Governance {}

export interface Governance {
  type?: GovernanceType;
  loadingProposals: boolean;
  allProposalsLoaded: boolean;
  proposals: FractalProposal[] | null;
  pendingProposals: string[] | null;
  proposalTemplates?: ProposalTemplate[] | null;
  tokenClaimContractAddress?: Address;
}

export interface VotingStrategyAzorius extends VotingStrategy {
  strategyType?: VotingStrategyType;
}

export interface VotingStrategy<Type = BIFormattedPair> {
  votingPeriod?: Type;
  quorumPercentage?: Type;
  quorumThreshold?: Type;
  timeLockPeriod?: Type;
}

export enum GovernanceType {
  MULTISIG = 'labelMultisigGov',
  AZORIUS_ERC20 = 'labelAzoriusErc20Gov',
  AZORIUS_ERC721 = 'labelAzoriusErc721Gov',
}

export enum VotingStrategyType {
  LINEAR_ERC20 = 'labelLinearERC20',
  LINEAR_ERC721 = 'labelLinearERC721',
}

export interface NodeHierarchy {
  parentAddress: Address | null;
  childNodes: Node[];
}

export type FractalProposal = AzoriusProposal | MultisigProposal | SnapshotProposal;

/**
 * Immutable state generally calculated from other stateful objects.
 * These are front end specific values that are commonly used throughout
 * the app.
 */
export interface ReadOnlyState {
  /** The currently connected DAO or null if there isn't one. */
  dao: ReadOnlyDAO | null;
  /** The "user", meaning the app user, wallet connected or not. */
  user: ReadOnlyUser;
}

export interface ReadOnlyUser {
  /** The user's wallet address, if connected.  */
  address?: Address;
  /** The number of delegated tokens for the connected Azorius DAO, 1 for a Multisig DAO signer */
  votingWeight: bigint;
}

export interface ReadOnlyDAO {
  /** Whether the connected DAO is an Azorius DAO.  */
  isAzorius: boolean;
}
