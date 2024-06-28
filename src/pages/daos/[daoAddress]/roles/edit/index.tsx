import { Box, Show, Text } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { RoleCard } from '../../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../../components/pages/Roles/RolesTable';
import { EditBadgeStatus } from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { useRolesState } from '../../../../../state/useRolesState';

function RolesEdit() {
  const { hatsTree } = useRolesState();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);

  const handleRoleClick = () => {
    // @todo open role edit details drawer
    // For Mobile, This is a new screen
    return;
  };

  // @todo remove PageHeader for mobile?
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
        buttonText={t('addRole')}
        buttonProps={{
          leftIcon: <Plus />,
        }}
        // @todo open add role drawer form
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
      <Show above="md">
        <RolesTable
          mode="edit"
          handleRoleClick={handleRoleClick}
        />
      </Show>
      <Show below="md">
        <RoleCard
          roleName="Admin"
          wearerAddress={undefined}
          mode="edit"
          handleRoleClick={handleRoleClick}
        />
        <RoleCard
          roleName="Legal Counsel"
          editStatus={EditBadgeStatus.Removed}
          mode="edit"
          wearerAddress={zeroAddress}
          handleRoleClick={handleRoleClick}
        />
        <RoleCard
          roleName="CEO"
          editStatus={EditBadgeStatus.Updated}
          wearerAddress={zeroAddress}
          mode="edit"
          handleRoleClick={handleRoleClick}
        />
        <RoleCard
          roleName="Code Reviewer"
          editStatus={EditBadgeStatus.New}
          wearerAddress={zeroAddress}
          mode="edit"
          handleRoleClick={handleRoleClick}
        />
      </Show>
    </Box>
  );
}

export default RolesEdit;
