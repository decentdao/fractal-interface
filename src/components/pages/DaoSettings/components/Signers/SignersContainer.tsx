import { Button, Flex, HStack, Show, Text, Hide, Icon } from '@chakra-ui/react';
import { PlusCircle, MinusCircle } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getAddress } from 'viem';
import { useAccount } from 'wagmi';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { ModalType } from '../../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../../ui/modals/useFractalModal';
import { SettingsSection } from '../SettingsSection';

function Signer({
  signer,
  signers,
  threshold,
  disabled,
}: {
  signer: Address;
  signers: Address[];
  threshold: number | undefined;
  disabled: boolean;
}) {
  const removeSigner = useFractalModal(ModalType.REMOVE_SIGNER, {
    selectedSigner: signer,
    signers: signers,
    currentThreshold: threshold,
  });
  return (
    <HStack
      key={signer}
      my="1rem"
      justifyContent="space-between"
    >
      <Show above="md">
        <DisplayAddress
          address={signer}
          truncate={false}
        />
      </Show>
      <Hide above="md">
        <DisplayAddress
          address={signer}
          truncate
        />
      </Hide>
      {!disabled && (
        <Button
          variant="tertiary"
          aria-label="Remove Signer"
          padding="0.5rem"
          h="fit-content"
          onClick={removeSigner}
        >
          <Icon
            as={MinusCircle}
            boxSize="1.25rem"
          />
        </Button>
      )}
    </HStack>
  );
}

export function SignersContainer() {
  const {
    node: { safe },
  } = useFractal();
  const [signers, setSigners] = useState<Address[]>();
  const [userIsSigner, setUserIsSigner] = useState<boolean>();

  const addSigner = useFractalModal(ModalType.ADD_SIGNER, {
    signers: signers,
    currentThreshold: safe?.threshold,
  });
  const { t } = useTranslation(['common', 'breadcrumbs']);
  const { address: account } = useAccount();
  const enableRemove = userIsSigner && signers && signers?.length > 1;

  useEffect(() => {
    setSigners(safe?.owners.map(owner => getAddress(owner)));
  }, [safe?.owners]);

  useEffect(() => {
    if (!signers) {
      return;
    }

    setUserIsSigner(account && signers.includes(account));
  }, [account, signers]);

  return (
    <SettingsSection
      title={t('signers', { ns: 'common' })}
      headerRight={
        userIsSigner && (
          <Flex gap="0.5rem">
            <Button
              variant="secondary"
              size="sm"
              onClick={addSigner}
              leftIcon={<PlusCircle size="16" />}
              iconSpacing="0"
            >
              <Show above="sm">
                <Text>{t('add')}</Text>
              </Show>
            </Button>
          </Flex>
        )
      }
      descriptionHeader={
        <Flex justifyContent="space-between">
          <Text>{t('signersRequired', { ns: 'common' })}</Text>
          <Text>{`${safe?.threshold}/${safe?.owners.length}`}</Text>
        </Flex>
      }
      descriptionContent={t('signersDescription')}
    >
      {signers &&
        signers.map(signer => (
          <Signer
            key={signer}
            signer={signer}
            signers={signers}
            disabled={!enableRemove}
            threshold={safe?.threshold}
          />
        ))}
    </SettingsSection>
  );
}
