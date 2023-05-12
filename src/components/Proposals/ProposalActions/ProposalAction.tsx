import { Button, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  FractalProposal,
  AzoriusProposal,
  FractalProposalState,
  MultisigProposal,
} from '../../../types';
import ContentBox from '../../ui/containers/ContentBox';
import ProposalTime from '../../ui/proposal/ProposalTime';
import { Execute } from './Execute';
import CastVote from './Vote';

export function ProposalActions({
  proposal,
  hasVoted,
}: {
  proposal: FractalProposal;
  hasVoted: boolean;
}) {
  switch (proposal.state) {
    case FractalProposalState.ACTIVE:
      return (
        <CastVote
          proposal={proposal}
          currentUserHasVoted={hasVoted}
        />
      );
    case FractalProposalState.EXECUTABLE:
    case FractalProposalState.TIMELOCKED:
      return <Execute proposal={proposal} />;
    default:
      return <></>;
  }
}

export function ProposalAction({
  proposal,
  expandedView,
}: {
  proposal: FractalProposal;
  expandedView?: boolean;
}) {
  const {
    node: { daoAddress },
    readOnly: { user },
  } = useFractal();
  const { push } = useRouter();
  const { t } = useTranslation();
  const isAzoriusProposal = !!(proposal as AzoriusProposal).govTokenAddress;

  const showActionButton =
    proposal.state === FractalProposalState.ACTIVE ||
    proposal.state === FractalProposalState.EXECUTABLE ||
    proposal.state === FractalProposalState.TIMELOCKABLE ||
    proposal.state === FractalProposalState.TIMELOCKED;

  const handleClick = () => {
    push(DAO_ROUTES.proposal.relative(daoAddress, proposal.proposalId));
  };

  const hasVoted = useMemo(() => {
    if (isAzoriusProposal) {
      const azoriusProposal = proposal as AzoriusProposal;
      return !!azoriusProposal.votes.find(vote => vote.voter === user.address);
    } else {
      const safeProposal = proposal as MultisigProposal;
      return !!safeProposal.confirmations.find(confirmation => confirmation.owner === user.address);
    }
  }, [isAzoriusProposal, proposal, user.address]);

  const labelKey = useMemo(() => {
    switch (proposal.state) {
      case FractalProposalState.ACTIVE:
        return 'vote';
      case FractalProposalState.TIMELOCKABLE:
        return 'timelockTitle';
      case FractalProposalState.EXECUTABLE:
      case FractalProposalState.TIMELOCKED:
        return 'executeTitle';
      default:
        return '';
    }
  }, [proposal]);

  const label = useMemo(() => {
    if (proposal.state === FractalProposalState.ACTIVE) {
      if (hasVoted) {
        return t('details');
      }
      return t(isAzoriusProposal ? 'vote' : 'sign');
    }
    return t('details');
  }, [proposal, t, isAzoriusProposal, hasVoted]);

  if (!showActionButton) {
    if (!expandedView) {
      return (
        <Button
          variant="secondary"
          onClick={handleClick}
        >
          {t('details')}
        </Button>
      );
    }
    // This means that Proposal in state where there's no action to perform
    return null;
  }

  if (expandedView) {
    if (user.votingWeight.eq(0)) return <></>;

    return (
      <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
        <Flex justifyContent="space-between">
          <Text textStyle="text-lg-mono-medium">
            {t(labelKey, {
              ns: proposal.state === FractalProposalState.ACTIVE ? 'common' : 'proposal',
            })}
          </Text>
          <ProposalTime proposal={proposal} />
        </Flex>
        <ProposalActions
          proposal={proposal}
          hasVoted={hasVoted}
        />
      </ContentBox>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={showActionButton && !hasVoted ? 'primary' : 'secondary'}
    >
      {label}
    </Button>
  );
}
