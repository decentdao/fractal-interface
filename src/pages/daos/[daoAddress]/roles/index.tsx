import { Box, Show, Text } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import { Card } from '../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { useRolesState } from '../../../../state/useRolesState';
function Roles() {
  const { hatsTree } = useRolesState();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);

  return (
    <Box>
      <PageHeader
        title={t('roles')}
        breadcrumbs={[
          {
            terminus: t('roles', {
              ns: 'roles',
            }),
            path: '',
          },
        ]}
        buttonVariant="secondary"
        buttonText={t('editRoles')}
        buttonProps={{
          leftIcon: <Pencil />,
        }}
        // @todo navigate to edit roles page
        buttonClick={() => {}}
      />
      {hatsTree === undefined && (
        <Card
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <BarLoader />
        </Card>
      )}
      {hatsTree === null && (
        <Card my="0.5rem">
          <Text
            textStyle="body-base"
            textAlign="center"
            color="white-alpha-16"
          >
            {t('noRoles')}
          </Text>
        </Card>
      )}
      {/* {hatsTree && ( */}
      <Show above="md">
        <RolesTable />
      </Show>
      <Show below="md">
        {/* (Mocked) Role admin not set */}
        <RoleCard
          roleName="Admin"
          wearerAddress={undefined}
        />
        {/* (Mocked) Role set with streams */}
        <RoleCard
          roleName="CEO"
          wearerAddress={zeroAddress}
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
        <RoleCard
          roleName="Code Reviewer"
          wearerAddress={zeroAddress}
          payrollData={{
            payrollAmount: '1',
            payrollSchedule: 'mo',
            asset: {
              symbol: 'USDC',
              name: 'USDC Stablecoin',
              iconUri:
                'https://assets.coingecko.com/coins/images/279/small/usd-coin.png?1594842487',
              address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            },
          }}
        />
      </Show>
      {/* )} */}
    </Box>
  );
}

export default Roles;
