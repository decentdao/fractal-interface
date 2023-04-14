import { Box, Button, Divider, HStack, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { AddPlus, Trash } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import EtherscanLinkAddress from '../../ui/links/EtherscanLinkAddress';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useFractalModal } from '../../ui/modals/useFractalModal';
import PageHeader from '../../ui/page/Header/PageHeader';
import DaoDetails from './DaoDetails';

function ManageSigners({}: {}) {
  const {
    node: { safe },
  } = useFractal();
  const [signers, setSigners] = useState<string[]>();
  const [selectedSigner, setSelectedSigner] = useState<string>();
  const removeSigner = useFractalModal(ModalType.REMOVE_SIGNER, {
    selectedSigner: selectedSigner,
    signers: signers,
  });
  const addSigner = useFractalModal(ModalType.ADD_SIGNER, {
    signerCount: signers?.length,
  });
  const { t } = useTranslation(['common', 'breadcrumbs']);

  useEffect(() => {
    setSigners(safe?.owners.map(owner => owner));
  }, [safe?.owners]);

  return (
    <Box>
      <PageHeader
        hasDAOLink={true}
        breadcrumbs={[
          {
            title: t('manageSigners', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      />
      <HStack mt={8}>
        <Button onClick={addSigner}>
          <AddPlus />
          {t('addSigner', { ns: 'common' })}
        </Button>
        <Button
          isDisabled={!selectedSigner || (signers && signers.length === 1)}
          onClick={removeSigner}
        >
          <Trash />
          {t('removeSigner', { ns: 'common' })}
        </Button>
      </HStack>
      <Stack
        direction="row"
        mt={8}
      >
        <Box
          bg="black.900-semi-transparent"
          rounded="md"
          px={8}
          py={8}
        >
          <Text
            textStyle="text-lg-mono-regular"
            color="grayscale.100"
          >
            {t('signers', { ns: 'common' })}
          </Text>
          <Divider
            marginTop="1rem"
            borderColor="chocolate.400"
          />
          <RadioGroup
            onChange={e => setSelectedSigner(e)}
            value={selectedSigner}
            mt={6}
          >
            <Stack direction="column">
              {signers &&
                signers.map(signer => (
                  <Radio
                    key={signer}
                    value={signer}
                    colorScheme="gold"
                    borderColor="gold.500"
                    size="md"
                    mb={3}
                  >
                    <EtherscanLinkAddress address={signer}>{signer}</EtherscanLinkAddress>
                  </Radio>
                ))}
            </Stack>
          </RadioGroup>
        </Box>

        <DaoDetails
          threshold={safe?.threshold}
          signerCount={safe?.owners.length}
        />
      </Stack>
    </Box>
  );
}

export default ManageSigners;
