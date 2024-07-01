import { Box, Button, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft, Plus } from '@phosphor-icons/react';
import { FieldArray, Formik } from 'formik';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { zeroAddress } from 'viem';
import { RoleCard } from '../../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../../components/pages/Roles/RolesTable';
import RoleFormCreateProposal from '../../../../../components/pages/Roles/forms/RoleFormCreateProposal';
import RoleFormTabs from '../../../../../components/pages/Roles/forms/RoleFormTabs';
import { RoleFormValues, DEFAULT_ROLE_HAT } from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'breadcrumbs', 'common']);
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const [hatIndex, setHatIndex] = useState<number>();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { rolesSchema } = useRolesSchema();
  const { hatsTree } = useRolesState();
  const navigate = useNavigate();

  const hats = useMemo(() => {
    // @todo get hats from hatsTree from state
    // @todo will need to combine with Sablier information, down the road.
    return [
      {
        id: 1,
        member: zeroAddress,
        roleName: 'Legal Reviewer',
        roleDescription: 'The Legal Reviewer role has...',
      },
      {
        id: 2,
        member: zeroAddress,
        roleName: 'Marketer',
        roleDescription: 'The Marketer role has...',
      },
      {
        id: 3,
        member: zeroAddress,
        roleName: 'Developer',
        roleDescription: 'The Developer role has...',
      },
    ];
  }, []);

  const handleRoleClick = (_hatIndex: number) => {
    setHatIndex(_hatIndex);
  };
  const headerHeight = useHeaderHeight();
  if (daoAddress === null) return null;

  return (
    <Formik<RoleFormValues>
      initialValues={{
        proposalMetadata: {
          title: '',
          description: '',
        },
        hats,
      }}
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={() => {
        // @todo prepare transactions for adding/removing roles
        // @todo submit transactions
      }}
    >
      {({ handleSubmit, values }) => (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <FieldArray name="hats">
            {({ push, remove }) => (
              <Box>
                <PageHeader
                  title={t('roles')}
                  breadcrumbs={[
                    {
                      terminus: t('roles', {
                        ns: 'roles',
                      }),
                      path: DAO_ROUTES.roles.relative(addressPrefix, daoAddress),
                    },
                    {
                      terminus: t('editRoles', {
                        ns: 'roles',
                      }),
                      path: '',
                    },
                  ]}
                  buttonVariant="secondary"
                  buttonText={t('addRole')}
                  buttonProps={{
                    size: 'sm',
                    leftIcon: <Plus />,
                  }}
                  buttonClick={() => {
                    push(DEFAULT_ROLE_HAT);
                    setHatIndex(values.hats.length);
                  }}
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
                  {!!hatIndex && (
                    <Portal>
                      <Box
                        position="fixed"
                        top={headerHeight}
                        h={`100vh`}
                        w="full"
                        bg="neutral-1"
                        px="1rem"
                      >
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                          my="1.75rem"
                        >
                          <Flex
                            gap="0.5rem"
                            alignItems="center"
                            aria-label={t('editRoles')}
                            onClick={() => {
                              remove(hatIndex);
                              setHatIndex(undefined);
                            }}
                          >
                            <Icon
                              as={ArrowLeft}
                              boxSize="1.5rem"
                            />
                            <Text textStyle="display-lg">{t('editRoles')}</Text>
                          </Flex>
                        </Flex>

                        <RoleFormTabs
                          hatIndex={hatIndex}
                          existingRoleHat={hats.find(hat => hat.id === values.hats[hatIndex].id)}
                          close={() => setHatIndex(undefined)}
                        />
                      </Box>
                    </Portal>
                  )}
                  {isSummaryOpen && (
                    <Box>
                      <Portal>
                        <Box
                          position="fixed"
                          top={headerHeight}
                          h={`100vh`}
                          w="full"
                          bg="neutral-1"
                          px="1rem"
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            my="1.75rem"
                          >
                            <Flex
                              gap="0.5rem"
                              alignItems="center"
                              aria-label={t('proposalNew')}
                              onClick={() => {
                                setIsSummaryOpen(false);
                              }}
                            >
                              <Icon
                                as={ArrowLeft}
                                boxSize="1.5rem"
                              />
                              <Text textStyle="display-lg">
                                {t('proposalNew', { ns: 'breadcrumbs' })}
                              </Text>
                            </Flex>
                          </Flex>
                          <RoleFormCreateProposal close={() => setIsSummaryOpen(false)} />
                        </Box>
                      </Portal>
                    </Box>
                  )}
                  {values.hats.map((hat, index) => (
                    <RoleCard
                      key={index}
                      hatId={hat.id}
                      roleName={hat.roleName}
                      wearerAddress={hat.member}
                      mode="edit"
                      handleRoleClick={() => handleRoleClick(index)}
                    />
                  ))}
                </Show>
              </Box>
            )}
          </FieldArray>
          <Flex
            gap="1rem"
            justifyContent="flex-end"
          >
            <Button
              variant="tertiary"
              onClick={() => navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress))}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button
              onClick={() => setIsSummaryOpen(true)}
              isDisabled={!values.hats.some(hat => hat.editedRole)}
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </Flex>
        </form>
      )}
    </Formik>
  );
}

export default RolesEdit;
