import { Box, Flex, Link, Text, Image } from '@chakra-ui/react';
import externalLink from '../../assets/images/external-link.svg';
import { TxProposal, UsulProposal } from '../../providers/Fractal/types';
import { ActivityDescription } from '../Activity/ActivityDescription';
import ProposalExecutableCode from '../ui/proposal/ProposalExecutableCode';
import ProposalStateBox from '../ui/proposal/ProposalStateBox';
import ProposalTime from '../ui/proposal/ProposalTime';

export function ProposalInfo({ proposal }: { proposal: TxProposal }) {
  const usulProposal = proposal as UsulProposal;
  const description = usulProposal.metaData?.description;
  const documentationUrl = usulProposal.metaData?.documentationUrl;

  return (
    <Box>
      <Flex
        gap={4}
        alignItems="center"
      >
        <ProposalStateBox state={proposal.state} />
        {usulProposal.deadline && <ProposalTime deadline={usulProposal.deadline} />}
      </Flex>
      <Box mt={4}>
        <ActivityDescription activity={proposal} />
        {description && <Text my={4}>{description}</Text>}
        {documentationUrl && (
          <Link
            href={documentationUrl}
            isExternal
            color="gold.500"
          >
            <Flex>
              <Image
                src={externalLink}
                alt={'Test'}
                w="1rem"
                h="1rem"
                my={1}
                mr={2}
              />
              {documentationUrl}
            </Flex>
          </Link>
        )}
        <ProposalExecutableCode proposal={proposal} />
      </Box>
    </Box>
  );
}
