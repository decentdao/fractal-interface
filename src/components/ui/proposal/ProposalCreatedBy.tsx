import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DisplayAddress } from '../links/DisplayAddress';

function ProposalCreatedBy({ proposer }: { proposer: Address }) {
  const { t } = useTranslation('proposal');
  return (
    <Box
      width="100%"
      mt={4}
    >
      <Text
        color="neutral-7"
        w="full"
      >
        {t('proposedBy')}
      </Text>
      <DisplayAddress
        address={proposer}
        pl={0}
        isTextLink
      />
    </Box>
  );
}

export default ProposalCreatedBy;
