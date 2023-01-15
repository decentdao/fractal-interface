import { Box, Button, Divider, Flex, SimpleGrid, Spacer, Text, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { constants } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import useDelegateVote from '../../../hooks/DAO/useDelegateVote';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { EthAddressInput } from '../EthAddressInput';
import EtherscanLinkAddress from '../EtherscanLinkAddress';

export function DelegateModal({ close }: { close: Function }) {
  const [newDelegatee, setNewDelegatee] = useState<string>('');
  const { t } = useTranslation(['modals', 'common']);
  const [pending, setPending] = useState<boolean>(false);

  const {
    governance: {
      governanceToken,
      contracts: { tokenContract },
    },
  } = useFractal();
  const { address: account } = useAccount();

  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const delegateeDisplayName = useDisplayName(governanceToken?.delegatee);
  const delegateVote = useDelegateVote({
    delegatee: newDelegatee,
    votingTokenContract: tokenContract,
    setPending: setPending,
  });

  const delegateSelf = () => {
    if (account) setNewDelegatee(account);
  };

  const onDelegateClick = () => {
    delegateVote();
    if (close) close();
  };

  const errorMessage =
    isValidAddress === false ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  if (!governanceToken) return null;

  return (
    <Box>
      <SimpleGrid
        columns={2}
        color="chocolate.200"
      >
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleBalance')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken.userBalanceString}
        </Text>
        <Text
          align="start"
          marginBottom="0.5rem"
        >
          {t('titleWeight')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken.votingWeightString}
        </Text>
        <Text
          align="start"
          marginBottom="1rem"
        >
          {t('titleDelegatedTo')}
        </Text>
        <Text
          align="end"
          color="grayscale.100"
        >
          {governanceToken?.delegatee === constants.AddressZero ? (
            '--'
          ) : (
            <EtherscanLinkAddress address={governanceToken.delegatee}>
              {delegateeDisplayName.displayName}
            </EtherscanLinkAddress>
          )}
        </Text>
      </SimpleGrid>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Flex alignItems="center">
        <Text color="grayscale.100">{t('labelDelegateInput')}</Text>
        <Spacer />
        <Button
          pr={0}
          variant="text"
          textStyle="text-sm-sans-regular"
          color="gold.500-active"
          onClick={delegateSelf}
        >
          {t('linkSelfDelegate')}
        </Button>
      </Flex>
      <LabelWrapper
        subLabel={t('sublabelDelegateInput')}
        errorMessage={errorMessage}
      >
        <EthAddressInput
          data-testid="essentials-daoName"
          value={newDelegatee}
          onAddress={function (address: string, isValid: boolean): void {
            setNewDelegatee(address);
            setIsValidAddress(isValid);
          }}
        />
      </LabelWrapper>
      <Button
        marginTop="2rem"
        width="100%"
        disabled={!isValidAddress || newDelegatee.trim() === '' || pending}
        onClick={onDelegateClick}
      >
        {t('buttonDelegate')}
      </Button>
    </Box>
  );
}
