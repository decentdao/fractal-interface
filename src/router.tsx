import { wrapCreateBrowserRouter } from '@sentry/react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { ModalProvider } from './components/ui/modals/ModalProvider';
import Layout from './components/ui/page/Layout';
import { BASE_ROUTES, DAO_ROUTES } from './constants/routes';
import FourOhFourPage from './pages/404';
import DAOController from './pages/DAOController';
import DaoCreatePage from './pages/create';
import DaoDashboardPage from './pages/daos/[daoAddress]/DaoDashboardPage';
import { SettingsPage } from './pages/daos/[daoAddress]/SettingsPage';
import ModifyGovernancePage from './pages/daos/[daoAddress]/edit/governance';
import HierarchyPage from './pages/daos/[daoAddress]/hierarchy';
import SubDaoCreate from './pages/daos/[daoAddress]/new';
import ProposalTemplatesPage from './pages/daos/[daoAddress]/proposal-templates';
import CreateProposalTemplatePage from './pages/daos/[daoAddress]/proposal-templates/new';
import ProposalsPage from './pages/daos/[daoAddress]/proposals';
import ProposalDetailsPage from './pages/daos/[daoAddress]/proposals/[proposalId]';
import ProposalCreatePage from './pages/daos/[daoAddress]/proposals/new';
import Roles from './pages/daos/[daoAddress]/roles';
import RolesEdit from './pages/daos/[daoAddress]/roles/edit';
import Treasury from './pages/daos/[daoAddress]/treasury';
import HomePage from './pages/home/HomePage';

export const router = (addressPrefix: string) =>
  wrapCreateBrowserRouter(createBrowserRouter)([
    {
      path: '/',
      element: (
        // We're placing ModalProvider here instead of src/providers/Providers.tsx due to the need of having router context
        // within underlying modals. Otherwise - trying to invoke routing-related hooks would lead to crash.
        // Not the best place to have this provider here but also more reasonalbe than putting that into <Layout />
        <ModalProvider>
          <Layout />
        </ModalProvider>
      ),
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'create/*',
          element: <DaoCreatePage />,
        },
        {
          path: 'create',
          loader: () => redirect(BASE_ROUTES.create),
        },
        {
          path: '/',
          element: <DAOController />,
          children: [
            {
              path: DAO_ROUTES.dao.path,
              element: <DaoDashboardPage />,
            },
            {
              path: 'edit/governance/*',
              element: <ModifyGovernancePage />,
            },
            {
              path: 'edit/governance',
              // @ts-ignore:next-line
              loader: ({ params: { daoAddress } }) =>
                redirect(DAO_ROUTES.modifyGovernance.relative(addressPrefix, daoAddress)),
            },
            {
              path: DAO_ROUTES.hierarchy.path,
              element: <HierarchyPage />,
            },
            {
              children: [
                {
                  index: true,
                  path: DAO_ROUTES.roles.path,
                  element: <Roles />,
                },
                {
                  path: DAO_ROUTES.rolesEdit.path,
                  element: <RolesEdit />,
                },
              ],
            },
            {
              path: 'new/*',
              element: <SubDaoCreate />,
            },
            {
              path: 'new',
              // @ts-ignore:next-line
              loader: ({ params: { daoAddress } }) =>
                redirect(DAO_ROUTES.newSubDao.relative(addressPrefix, daoAddress)),
            },
            {
              path: 'proposal-templates',
              children: [
                {
                  index: true,
                  element: <ProposalTemplatesPage />,
                },
                {
                  path: 'new/*',
                  element: <CreateProposalTemplatePage />,
                },
                {
                  path: 'new',
                  // @ts-ignore:next-line
                  loader: ({ params: { daoAddress } }) =>
                    redirect(DAO_ROUTES.proposalTemplateNew.relative(addressPrefix, daoAddress)),
                },
              ],
            },
            {
              path: DAO_ROUTES.proposals.path,
              children: [
                {
                  index: true,
                  element: <ProposalsPage />,
                },
                {
                  path: ':proposalId',
                  element: <ProposalDetailsPage />,
                },
                {
                  path: 'new/*',
                  element: <ProposalCreatePage />,
                },
                {
                  path: 'new',
                  // @ts-ignore:next-line
                  loader: ({ params: { daoAddress } }) =>
                    redirect(DAO_ROUTES.proposalNew.relative(addressPrefix, daoAddress)),
                },
              ],
            },
            {
              path: DAO_ROUTES.settings.path,
              element: <SettingsPage />,
            },
            {
              path: DAO_ROUTES.treasury.path,
              element: <Treasury />,
            },
          ],
        },
        {
          // this exists to keep old links working
          // /daos/0x0123/* will redirect to /home?dao=0x0123
          path: 'daos/:daoAddress/*',
          // @ts-ignore:next-line
          loader: ({ params: { daoAddress } }) =>
            redirect(DAO_ROUTES.dao.relative(addressPrefix, daoAddress)),
        },
        {
          path: '*', // 404
          element: <FourOhFourPage />,
        },
      ],
    },
  ]);

export default router;
