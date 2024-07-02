export const BASE_ROUTES = {
  landing: '/',
  create: '/create/essentials',
};

const getDaoQueryParam = (addressPrefix: string, daoAddress: string) =>
  `?dao=${addressPrefix}:${daoAddress}`;

export const DAO_ROUTES = {
  dao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/home${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'home',
  },
  newSubDao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/new/essentials${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'new/essentials',
  },
  modifyGovernance: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/edit/governance/essentials${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'edit/governance/essentials',
  },
  hierarchy: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/hierarchy${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'hierarchy',
  },
  roles: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/roles${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'roles',
  },
  treasury: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/treasury${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'treasury',
  },
  proposals: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals',
  },
  proposal: {
    relative: (addressPrefix: string, daoAddress: string, proposalId: string) =>
      `/proposals/${proposalId}${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals/new/metadata${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals/new/metadata',
  },
  settings: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'settings',
  },
  proposalTemplates: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (addressPrefix: string, daoAddress: string, proposalTemplateKey: string) =>
      `/proposal-templates/${proposalTemplateKey}${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates/new/metadata${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates/new/metadata',
  },
};
