import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { useGetMetadata } from '../../hooks/DAO/proposal/useGetMetadata';
import useAvatar from '../../hooks/utils/useAvatar';
import useDisplayName from '../../hooks/utils/useDisplayName';
import {
  Activity,
  GovernanceActivity,
  MultisigProposal,
  ActivityEventType,
  SnapshotProposal,
  FractalProposal,
  AzoriusProposal,
} from '../../types';
import Avatar from '../ui/page/Header/Avatar';

const formatId = (proposalId: string) => {
  if (proposalId.startsWith('0x')) {
    // Multisig id, just give the first 4 characters
    return `#${proposalId.substring(2, 6)}`;
  } else {
    // Azorius id is just incrementing whole number
    return `#${proposalId}`;
  }
};

function OnChainRejectionMessage({ activity }: { activity: Activity }) {
  const { t } = useTranslation('dashboard');
  const governanceActivity = activity as MultisigProposal;
  if (!governanceActivity.multisigRejectedProposalNumber) {
    return null;
  }
  return (
    <Text>
      {t('proposalOnChainRejection', {
        proposalId: formatId(governanceActivity.multisigRejectedProposalNumber),
      })}
    </Text>
  );
}

function ProposalAuthor({ activity }: { activity: Activity }) {
  const snapshotProposal = activity as SnapshotProposal;
  const azoriusProposal = activity as AzoriusProposal;
  const multisigProposal = activity as MultisigProposal;
  const isSnapshotProposal = !!snapshotProposal.snapshotProposalId;
  const isAzoriusProposal = !!azoriusProposal.proposer;

  const proposer = isAzoriusProposal
    ? azoriusProposal.proposer
    : isSnapshotProposal
      ? snapshotProposal.author
      : getAddress(multisigProposal.confirmations[0].owner);

  const { displayName: author } = useDisplayName(proposer);
  const avatarURL = useAvatar(author);

  return (
    <Flex
      gap={2}
      alignItems="center"
      color="neutral-7"
      textStyle="label-base"
    >
      <Avatar
        size="sm"
        address={proposer}
        url={avatarURL}
      />
      <Box>{author}</Box>
    </Flex>
  );
}

export function ProposalTitle({
  activity,
  showAuthor = false,
}: {
  activity: Activity;
  showAuthor?: boolean;
}) {
  const metaData = useGetMetadata(activity as FractalProposal);

  if (activity.eventType !== ActivityEventType.Governance) {
    return null;
  }

  // Check if it's a SnapshotProposal and set variables accordingly
  const isSnapshotProposal = (activity as SnapshotProposal).snapshotProposalId !== undefined;
  const proposalIdText = isSnapshotProposal
    ? formatId((activity as SnapshotProposal).snapshotProposalId)
    : formatId((activity as GovernanceActivity).proposalId);
  const proposaltitleText = isSnapshotProposal
    ? (activity as SnapshotProposal).title
    : metaData.title || '';

  const titleText = proposalIdText + ' ' + proposaltitleText;
  return (
    <Box
      textStyle="display-lg"
      color="white-0"
      pr="1.5rem"
    >
      <Flex
        alignItems="center"
        gap={2}
        flexWrap="wrap"
      >
        <Text
          as="span"
          textStyle="display-xl"
          maxW="100%"
        >
          {titleText}
        </Text>
        {showAuthor && <ProposalAuthor activity={activity} />}
      </Flex>
      <Box mt={2}>
        <OnChainRejectionMessage activity={activity} />
      </Box>
    </Box>
  );
}
