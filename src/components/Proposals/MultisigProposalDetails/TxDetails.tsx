import { Box, Text, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { MultisigProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import ContentBox from '../../ui/containers/ContentBox';
import InfoRow from '../../ui/proposal/InfoRow';
import ProposalCreatedBy from '../../ui/proposal/ProposalCreatedBy';
import Divider from '../../ui/utils/Divider';

export function TxDetails({ proposal }: { proposal: MultisigProposal }) {
  const { t } = useTranslation('proposal');
  return (
    <ContentBox
      containerBoxProps={{
        bg: 'neutral-2',
        border: '1px solid',
        borderColor: 'neutral-3',
        borderRadius: '0.5rem',
        my: 0,
      }}
    >
      <Text
        textStyle="display-lg"
        variant="darker"
      >
        {t('proposalSummaryTitle')}
      </Text>
      <Box marginTop={4}>
        <Divider
          variant="darker"
          width="calc(100% + 4rem)"
          mx="-2rem"
        />
        <InfoRow
          property={t('proposalId')}
          value={createAccountSubstring(proposal.proposalId)}
        />
        <InfoRow
          property={t('txDetailsSignersCurrent')}
          value={proposal.confirmations.length.toString()}
        />
        <InfoRow
          property={t('txDetailsSignersRequired')}
          value={proposal.signersThreshold?.toString()}
        />
        <InfoRow
          property={t('created')}
          value={format(proposal.eventDate, DEFAULT_DATE_TIME_FORMAT)}
          tooltip={formatInTimeZone(proposal.eventDate, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <Flex mt="1rem">
          <ProposalCreatedBy proposer={getAddress(proposal.confirmations[0].owner)} />
        </Flex>
        <InfoRow
          property={t('transactionHash')}
          value={proposal.transactionHash ? undefined : '-'}
          txHash={proposal.transactionHash}
        />
        <InfoRow
          property={t('nonce')}
          value={proposal.nonce?.toString()}
        />
      </Box>
    </ContentBox>
  );
}
