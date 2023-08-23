import { Box, Button, Flex, Text, Select } from '@chakra-ui/react';
import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { BigNumber, ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../constants/routes';
import useLidoStaking from '../../../hooks/stake/lido/useLidoStaking';
import useYearnStaking from '../../../hooks/stake/yearn/useYearnStaking';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { BigNumberValuePair } from '../../../types';
import { StakingProviderNetworkConfig } from '../../../types/network';
import { BigNumberInput } from '../forms/BigNumberInput';

export default function StakeModal({ close }: { close: () => void }) {
  const {
    node: { daoAddress },
    treasury: { assetsFungible },
  } = useFractal();
  const { staking } = useNetworkConfig();
  const { push } = useRouter();
  const { t } = useTranslation(['stake', 'modals']);

  type StakingProviders = keyof typeof staking;
  const supportedProviders = Object.keys(staking);
  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);

  const [selectedProviderKey, setSelectedProviderKey] = useState<StakingProviders>(
    supportedProviders[0] as StakingProviders
  );
  const selectedProvider = staking[selectedProviderKey];
  const supportedAssetsWithBalance = fungibleAssetsWithBalance.filter(asset => {
    {
      let address = asset.tokenAddress;
      if (!asset.tokenAddress) {
        address = ethers.constants.AddressZero;
      }
      return (selectedProvider as StakingProviderNetworkConfig).supportedAssets.includes(address);
    }
  });
  const [selectedAsset, setSelectedAsset] = useState<SafeBalanceUsdResponse>(
    supportedAssetsWithBalance[0]
  );
  const [inputAmount, setInputAmount] = useState<BigNumberValuePair>();
  const onChangeAmount = (value: BigNumberValuePair) => {
    setInputAmount(value);
  };

  const handleProviderChange = (value: StakingProviders) => {
    setSelectedProviderKey(value);
  };

  const handleCoinChange = (index: string) => {
    setInputAmount({ value: '0', bigNumberValue: BigNumber.from(0) });
    setSelectedAsset(supportedAssetsWithBalance[Number(index)]);
  };

  const { handleStake: handleLidoStake } = useLidoStaking();
  const { handleStake: handleYearnStake } = useYearnStaking();

  const handleSubmit = async () => {
    if (inputAmount?.bigNumberValue) {
      if (selectedProviderKey === 'lido') {
        await handleLidoStake(selectedAsset, inputAmount?.bigNumberValue);
        close();
        if (daoAddress) {
          push(DAO_ROUTES.proposals.relative(daoAddress));
        }
      } else if (selectedProviderKey === 'yearn') {
        await handleYearnStake(selectedAsset, inputAmount?.bigNumberValue);
        close();
        if (daoAddress) {
          push(DAO_ROUTES.proposals.relative(daoAddress));
        }
      }
    }
  };

  return (
    <Box>
      <Box>
        <Box marginBottom="1rem">
          <Text marginBottom="0.5rem">{t('selectProviderLabel')}</Text>
          <Select
            variant="outline"
            bg="input.background"
            borderColor="black.200"
            borderWidth="1px"
            borderRadius="4px"
            color="white"
            onChange={e => handleProviderChange(e.target.value as StakingProviders)}
            sx={{ '> option, > optgroup': { bg: 'input.background' } }}
          >
            {supportedProviders.map((provider, index) => (
              <option
                key={index}
                value={index}
              >
                {t(provider)}
              </option>
            ))}
          </Select>
        </Box>
        <Box marginBottom="1rem">
          <Text marginBottom="0.5rem">{t('selectLabel', { ns: 'modals' })}</Text>
          <Select
            variant="outline"
            bg="input.background"
            borderColor="black.200"
            borderWidth="1px"
            borderRadius="4px"
            color="white"
            onChange={e => handleCoinChange(e.target.value)}
            sx={{ '> option, > optgroup': { bg: 'input.background' } }}
          >
            {supportedAssetsWithBalance.map((asset, index) => (
              <option
                key={index}
                value={index}
              >
                {asset.token ? asset.token.symbol : 'ETH'}
              </option>
            ))}
          </Select>
        </Box>
        <Flex
          alignItems="center"
          marginBottom="0.5rem"
        >
          <Text>
            {t('stakeAmount', { symbol: selectedAsset.token ? selectedAsset.token.symbol : 'ETH' })}
          </Text>
        </Flex>
        <BigNumberInput
          value={inputAmount?.bigNumberValue}
          onChange={onChangeAmount}
          decimalPlaces={selectedAsset?.token?.decimals}
          placeholder="0"
          maxValue={BigNumber.from(selectedAsset.balance)}
        />
      </Box>
      <Button
        onClick={handleSubmit}
        mt={4}
        width="100%"
      >
        {t('submitStakingProposal')}
      </Button>
    </Box>
  );
}
