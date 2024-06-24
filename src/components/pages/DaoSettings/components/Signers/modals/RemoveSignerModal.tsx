import { Box, Button, Flex, HStack, Select, Text, Icon, Input } from '@chakra-ui/react';
import { WarningDiamond, WarningCircle } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import { SENTINEL_ADDRESS } from '../../../../../../constants/common';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';
import SupportTooltip from '../../../../../ui/badges/SupportTooltip';
import { CustomNonceInput } from '../../../../../ui/forms/CustomNonceInput';
import Divider from '../../../../../ui/utils/Divider';
import useRemoveSigner from '../hooks/useRemoveSigner';

function RemoveSignerModal({
  close,
  selectedSigner,
  signers,
  currentThreshold,
}: {
  close: () => void;
  selectedSigner: Address;
  signers: Address[];
  currentThreshold: number;
}) {
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [prevSigner, setPrevSigner] = useState<Address>();
  const [threshold, setThreshold] = useState<number>(currentThreshold);
  const [nonce, setNonce] = useState<number | undefined>(safe!.nextNonce);
  const { chain } = useNetworkConfig();
  const { data: ensName } = useEnsName({
    address: selectedSigner,
    chainId: chain.id,
  });
  const { t } = useTranslation(['modals', 'common']);
  const tooltipContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThresholdOptions(Array.from({ length: signers.length - 1 }, (_, i) => i + 1));
  }, [signers]);

  const removeSigner = useRemoveSigner({
    prevSigner: prevSigner,
    signerToRemove: selectedSigner,
    threshold: threshold,
    nonce: nonce,
    daoAddress: daoAddress,
  });

  const onSubmit = async () => {
    await removeSigner();
    if (close) close();
  };

  useEffect(() => {
    const signerIndex = signers.findIndex(signer => signer === selectedSigner);
    setPrevSigner(signerIndex > 0 ? signers[signerIndex - 1] : SENTINEL_ADDRESS);
  }, [selectedSigner, signers]);

  return (
    <Box>
      <Text textStyle="label-base">{t('removeSignerLabel', { ns: 'modals' })}</Text>
      <Input
        value={ensName ? ensName : selectedSigner}
        disabled={true}
        my="0.5rem"
      />
      <HStack>
        <Icon
          weight="fill"
          as={WarningDiamond}
          color="red-0"
        />
        <Text
          textStyle="helper-text-base"
          color="red-0"
        >
          {t('removeSignerWarning', { ns: 'modals' })}
        </Text>
      </HStack>

      <Divider
        mt={5}
        mb={4}
      />
      <HStack>
        <Text>{t('updateThreshold', { ns: 'modals' })}</Text>
        <Flex ref={tooltipContainer}>
          <SupportTooltip
            containerRef={tooltipContainer}
            label={t('updateSignersTooltip')}
            color="lilac-0"
            mx="2"
            mt="1"
          />
        </Flex>
      </HStack>

      <HStack>
        <Select
          onChange={e => setThreshold(Number(e.target.value))}
          mt={4}
          width="8rem"
          bgColor="neutral-1"
          borderColor="neutral-3"
          rounded="sm"
          cursor="pointer"
        >
          {thresholdOptions?.map(thresholdOption => (
            <option
              key={thresholdOption}
              value={thresholdOption}
            >
              {thresholdOption}
            </option>
          ))}
        </Select>
        <Flex>
          <Text
            mt={3}
            ml={2}
          >{`${t('signersRequired1', { ns: 'modals' })} ${signers.length - 1} ${t(
            'signersRequired2',
            { ns: 'modals' },
          )}`}</Text>
        </Flex>
      </HStack>
      <Flex
        w="fit-full"
        mt={6}
        p="1rem"
        border="1px"
        borderColor="yellow--1"
        bg="yellow--2"
        borderRadius="0.25rem"
        alignItems="center"
        gap="1rem"
      >
        <Icon
          color="yellow-0"
          as={WarningCircle}
          boxSize="1.5rem"
        />
        <Text
          color="yellow-0"
          textStyle="body-base-strong"
          whiteSpace="pre-wrap"
        >
          {t('updateSignerWarning', { ns: 'modals' })}
        </Text>
      </Flex>
      <Divider
        mt={6}
        mb={6}
      />
      <CustomNonceInput
        nonce={nonce}
        onChange={newNonce => setNonce(newNonce ? newNonce : undefined)}
      />
      <Button
        isDisabled={!threshold || !nonce || !safe || nonce < safe.nonce}
        mt={6}
        width="100%"
        onClick={onSubmit}
      >
        {t('createProposal', { ns: 'modals' })}
      </Button>
    </Box>
  );
}

export default RemoveSignerModal;
