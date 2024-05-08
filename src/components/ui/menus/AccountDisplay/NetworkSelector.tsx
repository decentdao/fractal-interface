import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useSwitchChain } from 'wagmi';
import {
  supportedNetworks,
  useNetworkConfig,
} from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { OptionMenu } from '../OptionMenu';

/**
 * Network display for menu
 */
export function NetworkSelector() {
  const { t } = useTranslation('menu');
  const { chain } = useNetworkConfig();
  const { switchChain } = useSwitchChain();
  const networksOptions = supportedNetworks.map(network => ({
    optionKey: network.chain.name,
    onClick: () => switchChain({ chainId: network.chain.id }),
  }));

  return (
    <Box
      cursor="default"
      pt="0.5rem"
    >
      <Flex
        direction="column"
        gap="2"
      >
        <Text
          px="0.5rem"
          textStyle="helper-text-small"
          color="neutral-7"
        >
          {t('network')}
        </Text>
        <OptionMenu
          namespace="menu"
          matchWidth
          menuListMr="0"
          options={networksOptions}
          buttonProps={{
            w: 'full',
            borderRadius: '4px',
            _hover: { color: 'lilac--1', bg: 'white-alpha-04' },
          }}
          trigger={
            <Flex
              w="full"
              justifyContent="space-between"
              alignItems="center"
              py="0.75rem"
              px="1rem"
            >
              {chain.name}
              <Icon
                as={CaretDown}
                boxSize="1.5rem"
              />
            </Flex>
          }
        />
      </Flex>
    </Box>
  );
}