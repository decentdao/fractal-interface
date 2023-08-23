import { Box, Button, Divider, HStack, Image, Text, Tooltip } from '@chakra-ui/react';
import { getWithdrawalQueueContract } from '@lido-sdk/contracts';
import { SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { ethers, BigNumber } from 'ethers';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import useLidoStaking from '../../../../hooks/stake/lido/useLidoStaking';
import useSignerOrProvider from '../../../../hooks/utils/useSignerOrProvider';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { formatPercentage, formatUSD } from '../../../../utils/numberFormats';
import EtherscanLinkAddress from '../../../ui/links/EtherscanLinkAddress';
import EtherscanLinkERC20 from '../../../ui/links/EtherscanLinkERC20';
import EtherscanLinkERC721 from '../../../ui/links/EtherscanLinkERC721';
import { ModalType } from '../../../ui/modals/ModalProvider';
import { useFractalModal } from '../../../ui/modals/useFractalModal';
import { TokenDisplayData, useFormatCoins } from '../hooks/useFormatCoins';

function CoinHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box>
      <Divider
        color="chocolate.700"
        marginTop="1.5rem"
        marginBottom="1.5rem"
      />
      <HStack marginBottom="0.5rem">
        <Text
          w="33%"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnCoins')}
        </Text>
        <Text
          w="33%"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnValue')}
        </Text>
        <Text
          w="33%"
          align="end"
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('columnAllocation')}
        </Text>
      </HStack>
    </Box>
  );
}

function CoinRow({
  safe,
  totalFiat,
  asset,
}: {
  safe: string;
  totalFiat: number;
  asset: TokenDisplayData;
}) {
  return (
    <HStack
      align="top"
      marginBottom="0.75rem"
    >
      <Box w="35%">
        <HStack marginEnd="1rem">
          <Image
            src={asset.iconUri}
            fallbackSrc="/images/coin-icon-default.svg"
            alt={asset.symbol}
            w="1rem"
            h="1rem"
          />
          <Text
            height="auto"
            textStyle="text-base-sans-regular"
            data-testid="link-token-symbol"
            noOfLines={2}
            maxWidth="4.7rem"
            isTruncated
          >
            {asset.address === ethers.constants.AddressZero ? (
              <EtherscanLinkAddress
                color="grayscale.100"
                address={safe}
              >
                {asset.symbol}
              </EtherscanLinkAddress>
            ) : (
              <EtherscanLinkERC20
                color="grayscale.100"
                address={asset.address}
              >
                {asset.symbol}
              </EtherscanLinkERC20>
            )}
          </Text>
        </HStack>
      </Box>
      <Box w="35%">
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
          marginBottom="0.25rem"
          maxWidth="23.8rem"
          isTruncated
        >
          <Tooltip
            label={asset.fullCoinTotal}
            placement="top-start"
          >
            {asset.truncatedCoinTotal}
          </Tooltip>
        </Text>
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          <Tooltip
            label={asset.fiatConversion}
            placement="top-start"
          >
            {formatUSD(asset.fiatValue)}
          </Tooltip>
        </Text>
      </Box>
      <Box w={'30%'}>
        <Text
          align="end"
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {formatPercentage(asset.fiatValue, totalFiat)}
        </Text>
      </Box>
    </HStack>
  );
}

function NFTHeader() {
  const { t } = useTranslation('treasury');
  return (
    <Box>
      <Divider
        color="chocolate.700"
        marginTop="0.75rem"
        marginBottom="1.5rem"
      />
      <Text
        w="33%"
        textStyle="text-sm-sans-regular"
        color="chocolate.200"
        marginBottom="1rem"
      >
        {t('columnNFTs')}
      </Text>
    </Box>
  );
}

function NFTRow({ asset, isLast }: { asset: SafeCollectibleResponse; isLast: boolean }) {
  const image = asset.imageUri ? asset.imageUri : asset.logoUri;
  const name = asset.name ? asset.name : asset.tokenName;
  const id = asset.id.toString();
  return (
    <HStack marginBottom={isLast ? '0rem' : '1.5rem'}>
      <EtherscanLinkERC721
        address={asset.address}
        tokenId={id}
        data-testid="link-nft-image"
      >
        <Image
          src={image}
          fallbackSrc="/images/nft-image-default.svg"
          alt={name}
          w="3rem"
          h="3rem"
          marginRight="0.75rem"
        />
      </EtherscanLinkERC721>
      <Text
        textStyle="text-base-sans-regular"
        color="grayscale.100"
        data-testid="link-nft-name"
        noOfLines={1}
      >
        <EtherscanLinkAddress address={asset.address}>{name}</EtherscanLinkAddress>
      </Text>
      <EtherscanLinkERC721
        address={asset.address}
        tokenId={id}
      >
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
          data-testid="link-nft-id"
          maxWidth="5rem"
          noOfLines={1}
        >
          #{id}
        </Text>
      </EtherscanLinkERC721>
    </HStack>
  );
}

export function Assets() {
  const {
    node: { daoAddress },
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const { canUserCreateProposal } = useSubmitProposal();
  const { staking } = useNetworkConfig();
  const { t } = useTranslation('treasury');
  const coinDisplay = useFormatCoins(assetsFungible);
  const { handleUnstake, handleClaimUnstakedETH } = useLidoStaking();

  // --- Lido Stake button setup ---
  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);
  const supportedAssetsWithBalance = fungibleAssetsWithBalance.filter(asset => {
    {
      let address = asset.tokenAddress;
      if (!asset.tokenAddress) {
        address = ethers.constants.AddressZero;
      }
      return (
        staking.lido?.supportedAssets.includes(address) ||
        staking.yearn?.supportedAssets.includes(address)
      );
    }
  });
  const showStakeButton =
    canUserCreateProposal &&
    Object.keys(staking).length > 0 &&
    supportedAssetsWithBalance.length > 0;
  const openStakingModal = useFractalModal(ModalType.STAKE);

  // --- Lido Unstake button setup ---
  const stETHAsset = coinDisplay.displayData.find(
    asset => asset.address === staking?.lido?.stETHContractAddress
  );
  const showUnstakeButton = canUserCreateProposal && staking.lido && stETHAsset;
  const handleUnstakeButtonClick = () => {
    handleUnstake(stETHAsset!.rawValue);
  };

  // --- Lido Claim ETH button setup ---
  const signerOrProvider = useSignerOrProvider();
  const [isLidoClaimable, setIsLidoClaimable] = useState(false);
  const lidoWithdrawalNFT = assetsNonFungible.find(
    asset => asset.address === staking.lido?.withdrawalQueueContractAddress
  );
  const showClaimETHButton = useMemo(
    () => canUserCreateProposal && staking.lido && lidoWithdrawalNFT,
    [canUserCreateProposal, staking.lido, lidoWithdrawalNFT]
  );
  useEffect(() => {
    const getLidoClaimableStatus = async () => {
      if (!staking.lido?.withdrawalQueueContractAddress || !showClaimETHButton) {
        return;
      }
      const withdrawalQueueContract = getWithdrawalQueueContract(
        staking.lido.withdrawalQueueContractAddress,
        signerOrProvider
      );
      const claimableStatus = (
        await withdrawalQueueContract.getWithdrawalStatus([lidoWithdrawalNFT!.id])
      )[0]; // Since we're checking for the single NFT - we can grab first array element
      if (claimableStatus.isFinalized !== isLidoClaimable) {
        setIsLidoClaimable(claimableStatus.isFinalized);
      }
    };

    getLidoClaimableStatus();
  }, [staking, isLidoClaimable, signerOrProvider, lidoWithdrawalNFT, showClaimETHButton]);

  const handleClickClaimButton = () => {
    handleClaimUnstakedETH(BigNumber.from(lidoWithdrawalNFT!.id));
  };

  return (
    <Box>
      <Text
        textStyle="text-sm-sans-regular"
        color="chocolate.200"
        marginTop="1.5rem"
        marginBottom="0.5rem"
      >
        {t('subtitleCoinBalance')}
      </Text>
      <Text
        data-testid="text-usd-total"
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
      >
        {formatUSD(coinDisplay.totalFiatValue)}
      </Text>
      {(showStakeButton || showUnstakeButton || showClaimETHButton) && (
        <>
          <Divider
            color="chocolate.700"
            marginTop="1.5rem"
            marginBottom="1.5rem"
          />
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            marginTop="1.5rem"
            marginBottom="1rem"
          >
            {t('subtitleStaking')}
          </Text>
          <HStack>
            {showStakeButton && (
              <Button
                size="sm"
                onClick={openStakingModal}
              >
                {t('stake')}
              </Button>
            )}
            {showUnstakeButton && (
              <Button
                size="sm"
                onClick={handleUnstakeButtonClick}
              >
                {t('unstake')}
              </Button>
            )}
            {showClaimETHButton && (
              <Tooltip label={!isLidoClaimable ? t('nonClaimableYet') : ''}>
                <Button
                  size="sm"
                  isDisabled={!isLidoClaimable}
                  onClick={handleClickClaimButton}
                >
                  {t('claimUnstakedETH')}
                </Button>
              </Tooltip>
            )}
          </HStack>
        </>
      )}
      {coinDisplay.displayData.length > 0 && <CoinHeader />}
      {coinDisplay.displayData.map((coin, index) => {
        return (
          <CoinRow
            key={index}
            safe={daoAddress!}
            totalFiat={coinDisplay.totalFiatValue}
            asset={coin}
          />
        );
      })}
      {assetsNonFungible.length > 0 && <NFTHeader />}
      {assetsNonFungible.map((asset, index) => (
        <NFTRow
          key={index}
          asset={asset}
          isLast={assetsNonFungible[assetsNonFungible.length - 1] === asset}
        />
      ))}
    </Box>
  );
}
