import { useContext, useCallback, useEffect, useState, createContext, ReactNode } from 'react';
import useUserERC721VotingTokens from '../../../../hooks/DAO/proposal/useUserERC721VotingTokens';
import { useFractal } from '../../../../providers/App/AppProvider';
import {
  FractalProposal,
  SnapshotProposal,
  AzoriusProposal,
  MultisigProposal,
  GovernanceType,
} from '../../../../types';

interface IVoteContext {
  canVote: boolean;
  canVoteLoading: boolean;
  hasVoted: boolean;
  hasVotedLoading: boolean;
  getCanVote: (refetchUserTokens?: boolean) => Promise<void>;
  getHasVoted: () => void;
}

export const VoteContext = createContext<IVoteContext>({
  canVote: false,
  canVoteLoading: false,
  hasVoted: false,
  hasVotedLoading: false,
  getCanVote: async () => {},
  getHasVoted: () => {},
});

export const useVoteContext = () => {
  const voteContext = useContext(VoteContext);
  return voteContext;
};

export function VoteContextProvider({
  proposal,
  children,
}: {
  proposal: FractalProposal;
  children: ReactNode;
}) {
  const [canVote, setCanVote] = useState(false);
  const [canVoteLoading, setCanVoteLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasVotedLoading, setHasVotedLoading] = useState(false);
  const [proposalVotesLength, setProposalVotesLength] = useState(0);
  const {
    readOnly: { user, dao },
    node: { safe },
    governance: { type },
  } = useFractal();
  const { remainingTokenIds, getUserERC721VotingTokens } = useUserERC721VotingTokens(
    proposal.proposalId,
    undefined,
    true
  );
  const isSnapshotProposal = !!(proposal as SnapshotProposal).snapshotProposalId;

  const getHasVoted = useCallback(() => {
    setHasVotedLoading(true);
    if (isSnapshotProposal) {
      // Snapshot proposals not tracking votes
      setHasVoted(false);
    } else if (dao?.isAzorius) {
      const azoriusProposal = proposal as AzoriusProposal;
      if (azoriusProposal?.votes) {
        setHasVoted(!!azoriusProposal?.votes.find(vote => vote.voter === user.address));
      }
    } else {
      const safeProposal = proposal as MultisigProposal;
      setHasVoted(
        !!safeProposal.confirmations.find(confirmation => confirmation.owner === user.address)
      );
    }
    setHasVotedLoading(false);
  }, [dao, isSnapshotProposal, proposal, user.address]);

  const getCanVote = useCallback(
    async (refetchUserTokens?: boolean) => {
      setCanVoteLoading(true);
      let newCanVote = false;
      if (user.address) {
        if (type === GovernanceType.AZORIUS_ERC20) {
          newCanVote = user.votingWeight.gt(0) && !hasVoted;
        } else if (type === GovernanceType.AZORIUS_ERC721) {
          if (refetchUserTokens) {
            await getUserERC721VotingTokens();
          }
          newCanVote = user.votingWeight.gt(0) && remainingTokenIds.length > 0;
        } else if (type === GovernanceType.MULTISIG) {
          newCanVote = !!safe?.owners.includes(user.address);
        } else {
          newCanVote = false;
        }
      }

      if (canVote !== newCanVote) {
        setCanVote(newCanVote);
      }
      setCanVoteLoading(false);
    },
    [user, type, hasVoted, safe, canVote, remainingTokenIds, getUserERC721VotingTokens]
  );
  useEffect(() => {
    getCanVote();
    getHasVoted();
  }, [getCanVote, getHasVoted, proposalVotesLength]);

  useEffect(() => {
    const azoriusProposal = proposal as AzoriusProposal;
    if (azoriusProposal.votes && proposalVotesLength !== azoriusProposal.votes.length) {
      setProposalVotesLength(azoriusProposal.votes.length);
    }
  }, [proposal, proposalVotesLength]);

  return (
    <VoteContext.Provider
      value={{ canVote, canVoteLoading, hasVoted, hasVotedLoading, getHasVoted, getCanVote }}
    >
      {children}
    </VoteContext.Provider>
  );
}