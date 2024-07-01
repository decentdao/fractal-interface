import { Box, Show, Text } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { zeroAddress } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import { Card } from '../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../state/useRolesState';
function Roles() {
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();

  if (!daoAddress) return null;
  const handleRoleClick = (roleIndex: number) => {
    // @todo open role details drawer
    // For Mobile, This is a new screen
    return roleIndex; // @todo remove this line
  };
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
          size: 'sm',
          leftIcon: <Pencil />,
        }}
        buttonClick={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress))}
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
      <Show above="md">
        <RolesTable handleRoleClick={handleRoleClick} />
      </Show>
      <Show below="md">
        <RoleCard
          hatId={0}
          roleName="Admin"
          wearerAddress={undefined}
          handleRoleClick={handleRoleClick}
        />
        <RoleCard
          hatId={1}
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
        <RoleCard
          roleName="Code Reviewer"
          hatId={2}
          wearerAddress={zeroAddress}
          handleRoleClick={handleRoleClick}
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
    </Box>
  );
}

export default Roles;
