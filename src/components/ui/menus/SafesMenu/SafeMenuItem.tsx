import { Box, Button, Flex, Image, MenuItem, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { useSwitchChain } from 'wagmi';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useGetDAOName } from '../../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../../hooks/utils/useAvatar';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getNetworkIcon } from '../../../../utils/url';
import Avatar from '../../page/Header/Avatar';

export interface SafeMenuItemProps {
  network: string;
  address: Address;
  showAddress?: boolean;
  onClick?: () => void;
}

export function SafeMenuItem({ address, network }: SafeMenuItemProps) {
  const { addressPrefix } = useNetworkConfig();
  const { switchChain } = useSwitchChain();

  const { daoName } = useGetDAOName({
    address: address,
    chainId: getChainIdFromPrefix(network),
  });

  const navigate = useNavigate();

  const { displayName: accountDisplayName } = useDisplayName(
    address,
    false,
    getChainIdFromPrefix(network),
  );
  const avatarURL = useAvatar(accountDisplayName);

  const { t } = useTranslation('dashboard');

  const onClickNav = () => {
    if (addressPrefix !== network) {
      switchChain(
        { chainId: getChainIdFromPrefix(network) },
        {
          onSuccess: () => navigate(DAO_ROUTES.dao.relative(network, address)),
        },
      );
    } else {
      navigate(DAO_ROUTES.dao.relative(network, address));
    }
  };

  return (
    <Box px="0.25rem">
      <MenuItem
        as={Button}
        variant="tertiary"
        w="full"
        h="3rem"
        onClick={onClickNav}
        noOfLines={1}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
      >
        <Avatar
          address={address}
          url={avatarURL}
        />
        <Flex flexDir="column">
          <Text
            color="white-0"
            textStyle="button-base"
          >
            {daoName ?? t('loadingFavorite')}
          </Text>
        </Flex>

        <Spacer />

        {/* Network Icon */}
        <Image src={getNetworkIcon(network)} />
      </MenuItem>
    </Box>
  );
}
