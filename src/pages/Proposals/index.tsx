import { Box, Flex, Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ProposalsList from '../../components/Proposals/ProposalsList';
import { ModalType } from '../../modals/ModalProvider';
import { useFractalModal } from '../../modals/useFractalModal';

export function Governance() {
  const { t } = useTranslation(['common', 'proposal']);
  return (
    <Box mt="3rem">
      <Flex justifyContent="space-between">
        <Text textStyle="text-2xl-mono-bold">{t('pageTitle', { ns: 'proposal' })}</Text>
        <Flex gap="4">
          <Button
            size="base"
            variant="text"
            onClick={useFractalModal(ModalType.DELEGATE)}
          >
            {t('delegate')}
          </Button>
          <Link to="new">
            <Button size="base">{t('createProposal', { ns: 'proposal' })}</Button>
          </Link>
        </Flex>
      </Flex>
      <ProposalsList />
    </Box>
  );
}
