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
          path: 'create/:step',
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
              path: 'home',
              element: <DaoDashboardPage />,
            },
            {
              path: 'edit/governance/:step',
              element: <ModifyGovernancePage />,
            },
            {
              path: 'edit/governance',
              loader: () => redirect(DAO_ROUTES.modifyGovernance.path),
            },
            {
              path: 'hierarchy',
              element: <HierarchyPage />,
            },
            {
              path: 'new/:step',
              element: <SubDaoCreate />,
            },
            {
              path: 'new',
              loader: () => redirect(DAO_ROUTES.newSubDao.path),
            },
            {
              path: 'proposal-templates',
              children: [
                {
                  index: true,
                  element: <ProposalTemplatesPage />,
                },
                {
                  path: 'new/:step',
                  element: <CreateProposalTemplatePage />,
                },
                {
                  path: 'new',
                  loader: () => redirect(DAO_ROUTES.proposalTemplateNew.path),
                },
              ],
            },
            {
              path: 'proposals',
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
                  path: 'new/:step',
                  element: <ProposalCreatePage />,
                },
                {
                  path: 'new',
                  loader: () => redirect(DAO_ROUTES.proposalNew.path),
                },
              ],
            },
            {
              path: 'settings',
              element: <SettingsPage />,
            },
            {
              path: 'treasury',
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
            redirect(`/home?dao=${addressPrefix}:${daoAddress}`),
        },
        {
          path: '*', // 404
          element: <FourOhFourPage />,
        },
      ],
    },
  ]);

export default router;
