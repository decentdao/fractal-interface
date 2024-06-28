import { Box, Flex, Icon, Image, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix } from '../../../utils/url';
import EtherscanLink from '../../ui/links/EtherscanLink';
import Avatar from '../../ui/page/Header/Avatar';
import { EditBadgeStatus, RoleProps, RoleViewMode } from './types';

export function RolesHeader() {
  const { t } = useTranslation(['roles']);
  return (
    <Thead
      sx={{
        th: {
          padding: '0.75rem',
        },
      }}
      bg="white-alpha-04"
    >
      <Tr
        textStyle="label-base"
        color="neutral-7"
      >
        <Th>{t('role')}</Th>
        <Th>{t('member')}</Th>
        <Th>{t('payroll')}</Th>
        <Th>{t('vesting')}</Th>
      </Tr>
    </Thead>
  );
}

export function RolesRow({
  roleName,
  wearerAddress,
  payrollData,
  vestingData,
  mode = 'view',
}: RoleProps) {
  const { addressPrefix } = useNetworkConfig();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: wearerAddress || zeroAddress,
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(wearerAddress || zeroAddress);
  const { t } = useTranslation(['roles', 'daoCreate']);

  return (
    <Tr
      sx={{
        td: { padding: '0.75rem', height: '4rem' },
        '&:hover': {
          '.edit-role-icon': { opacity: 1 },
        },
      }}
      _hover={{ bg: 'neutral-3' }}
      _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
      transition="all ease-out 300ms"
    >
      <Td>
        <Flex
          alignItems="center"
          justifyContent="space-between"
        >
          <Text
            textStyle="body-base"
            color="lilac-0"
          >
            {roleName}
          </Text>
          {mode === 'edit' && (
            <Icon
              className="edit-role-icon"
              as={Pencil}
              color="white-0"
              boxSize="1rem"
              opacity={0}
              transition="opacity 0.3s ease-out"
            />
          )}
        </Flex>
      </Td>
      <Td>
        <Flex alignItems="center">
          {wearerAddress ? (
            <Avatar
              size="icon"
              address={wearerAddress}
              url={avatarURL}
            />
          ) : (
            <Box
              boxSize="3rem"
              borderRadius="100%"
              bg="white-alpha-04"
            />
          )}
          <Flex
            direction="column"
            ml="0.5rem"
          >
            <Text
              textStyle="body-base"
              color="white-0"
            >
              {wearerAddress ? accountDisplayName : t('unassigned')}
            </Text>
          </Flex>
        </Flex>
      </Td>
      <Td>
        <Flex flexDir="column">
          {payrollData ? (
            <Box>
              <Flex
                alignItems="center"
                gap="0.25rem"
                my="0.5rem"
              >
                <Image
                  src={payrollData.asset.iconUri}
                  fallbackSrc="/images/coin-icon-default.svg"
                  alt={payrollData.asset.symbol}
                  w="1.25rem"
                  h="1.25rem"
                />
                {payrollData.payrollAmount}
                <EtherscanLink
                  color="white-0"
                  _hover={{ bg: 'transparent' }}
                  textStyle="body-base"
                  padding={0}
                  borderWidth={0}
                  value={payrollData.asset.address}
                  type="token"
                  wordBreak="break-word"
                >
                  {payrollData.asset.symbol}
                </EtherscanLink>
                <Text
                  color="white-0"
                  textStyle="body-base"
                >
                  {'/'} {payrollData.payrollSchedule}
                </Text>
              </Flex>
            </Box>
          ) : (
            <Text
              textStyle="body-base"
              color="neutral-6"
            >
              {t('n/a')}
            </Text>
          )}
        </Flex>
      </Td>
      <Td>
        {vestingData ? (
          <Box>
            <Flex
              textStyle="body-base"
              color="white-0"
              gap="0.25rem"
              alignItems="center"
              my="0.5rem"
            >
              <Image
                src={vestingData.asset.iconUri}
                fallbackSrc="/images/coin-icon-default.svg"
                alt={vestingData.asset.symbol}
                w="1.25rem"
                h="1.25rem"
              />
              {vestingData.vestingAmount}
              <EtherscanLink
                color="white-0"
                _hover={{ bg: 'transparent' }}
                textStyle="body-base"
                padding={0}
                borderWidth={0}
                value={vestingData.asset.address}
                type="token"
                wordBreak="break-word"
              >
                {vestingData.asset.symbol}
              </EtherscanLink>
              <Text>
                {t('after')} {vestingData.vestingSchedule}
              </Text>
            </Flex>
          </Box>
        ) : (
          <Text
            textStyle="body-base"
            color="neutral-6"
          >
            {t('n/a')}
          </Text>
        )}
      </Td>
    </Tr>
  );
}

export function RolesTable({
  mode = 'view',
  handleRoleClick,
}: {
  mode?: RoleViewMode;
  handleRoleClick: (roleIndex: number) => void;
}) {
  return (
    <Box
      overflow="hidden"
      borderRadius="0.75rem"
      border="1px solid"
      borderColor="white-alpha-08"
    >
      <Table variant="unstyled">
        <RolesHeader />
        {/* Map Rows */}
        <Tbody
          sx={{
            tr: {
              transition: 'all ease-out 300ms',
              borderBottom: '1px solid',
              borderColor: 'white-alpha-08',
            },
            'tr:last-child': {
              borderBottom: 'none',
            },
          }}
        >
          <RolesRow
            mode={mode}
            roleName="Admin"
            wearerAddress={zeroAddress}
            handleRoleClick={handleRoleClick}
          />
          <RolesRow
            mode={mode}
            roleName="Legal Counsel"
            editStatus={EditBadgeStatus.Removed}
            wearerAddress={zeroAddress}
            handleRoleClick={handleRoleClick}
          />
          <RolesRow
            mode={mode}
            roleName="CEO"
            wearerAddress={zeroAddress}
            handleRoleClick={handleRoleClick}
            payrollData={{
              payrollAmount: '1000',
              payrollSchedule: 'mo',
              asset: {
                symbol: 'USDC',
                name: 'USDC Stablecoin',
                iconUri:
                  'https://assets.coingecko.com/coins/images/279/small/usd-coin.png?1594842487',
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              },
            }}
            vestingData={{
              vestingAmount: '1000',
              vestingSchedule: '1yr',
              asset: {
                symbol: 'USDC',
                name: 'USDC Stablecoin',
                iconUri:
                  'https://assets.coingecko.com/coins/images/279/small/usd-coin.png?1594842487',
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              },
            }}
          />
        </Tbody>
      </Table>
    </Box>
  );
}
