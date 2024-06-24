import { Box, Grid, GridItem, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Address, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { MultisigProposal } from '../../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../../utils/numberFormats';
import { ActivityAddress } from '../../Activity/ActivityAddress';
import { Badge } from '../../ui/badges/Badge';
import ContentBox from '../../ui/containers/ContentBox';
import Divider from '../../ui/utils/Divider';

function OwnerInfoRow({
  owner,
  proposal,
  isMe,
}: {
  owner: Address;
  proposal: MultisigProposal;
  isMe: boolean;
}) {
  const ownerConfirmed = proposal.confirmations.find(confirmInfo => confirmInfo.owner === owner);

  return (
    <>
      <GridItem my="auto">
        <ActivityAddress
          address={owner}
          isMe={isMe}
        />
      </GridItem>
      <GridItem my="auto">
        {ownerConfirmed && (
          <Badge
            labelKey={'ownerApproved'}
            size="sm"
          />
        )}
      </GridItem>
      <GridItem my="auto">
        {ownerConfirmed && (
          <Text color="neutral-7">
            {format(new Date(ownerConfirmed.submissionDate), DEFAULT_DATE_TIME_FORMAT)}
          </Text>
        )}
      </GridItem>
    </>
  );
}

export function SignerDetails({ proposal }: { proposal: MultisigProposal }) {
  const {
    readOnly: { user },
    node: { safe },
  } = useFractal();
  const { t } = useTranslation('proposal');
  if (!safe?.owners) {
    return null;
  }
  return (
    <ContentBox
      containerBoxProps={{
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'neutral-3',
        borderRadius: '0.5rem',
      }}
    >
      <Text textStyle="display-lg">{t('signers')}</Text>
      <Box marginTop={4}>
        <Divider
          width="calc(100% + 4rem)"
          mx="-2rem"
        />
        <Grid
          templateColumns="repeat(3, auto)"
          rowGap={4}
          columnGap={5}
          overflowX="auto"
          whiteSpace="nowrap"
        >
          {safe.owners.map(owner => (
            <OwnerInfoRow
              key={owner}
              owner={getAddress(owner)}
              proposal={proposal}
              isMe={user.address === owner}
            />
          ))}
        </Grid>
      </Box>
    </ContentBox>
  );
}
