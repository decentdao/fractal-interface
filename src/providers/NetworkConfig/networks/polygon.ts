import { addresses } from '@fractal-framework/fractal-contracts';
import {
  getProxyFactoryDeployment,
  getMultiSendCallOnlyDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { getAddress } from 'viem';
import { polygon } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getSafeContractDeploymentAddress } from './utils';

const SAFE_VERSION = '1.3.0';

const chain = polygon;
const a = addresses[chain.id];

export const polygonConfig: NetworkConfig = {
  order: 20,
  chain,
  rpcEndpoint: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_POLYGON_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-polygon.safe.global',
  etherscanBaseURL: 'https://polygonscan.com',
  etherscanAPIUrl: `https://api.polygonscan.com/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_POLYGON_API_KEY}`,
  addressPrefix: 'matic',
  nativeTokenIcon: '/images/coin-icon-pol.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-base-polygon',
    version: 'v0.1.1',
  },
  contracts: {
    gnosisSafeL2Singleton: getSafeContractDeploymentAddress(
      getSafeL2SingletonDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    gnosisSafeProxyFactory: getSafeContractDeploymentAddress(
      getProxyFactoryDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    compatibilityFallbackHandler: getSafeContractDeploymentAddress(
      getCompatibilityFallbackHandlerDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),
    multiSendCallOnly: getSafeContractDeploymentAddress(
      getMultiSendCallOnlyDeployment,
      SAFE_VERSION,
      chain.id.toString(),
    ),

    zodiacModuleProxyFactory: getAddress(a.ModuleProxyFactory),

    linearVotingErc20MasterCopy: getAddress(a.LinearERC20Voting),
    linearVotingErc721MasterCopy: getAddress(a.LinearERC721Voting),

    moduleAzoriusMasterCopy: getAddress(a.Azorius),
    moduleFractalMasterCopy: getAddress(a.FractalModule),

    freezeGuardAzoriusMasterCopy: getAddress(a.AzoriusFreezeGuard),
    freezeGuardMultisigMasterCopy: getAddress(a.MultisigFreezeGuard),

    freezeVotingErc20MasterCopy: getAddress(a.ERC20FreezeVoting),
    freezeVotingErc721MasterCopy: getAddress(a.ERC721FreezeVoting),
    freezeVotingMultisigMasterCopy: getAddress(a.MultisigFreezeVoting),

    votesErc20MasterCopy: getAddress(a.VotesERC20),
    votesErc20WrapperMasterCopy: getAddress(a.VotesERC20Wrapper),

    claimErc20MasterCopy: getAddress(a.ERC20Claim),

    fractalRegistry: getAddress(a.FractalRegistry),
    keyValuePairs: getAddress(a.KeyValuePairs),
  },
  staking: {},
  createOptions: [GovernanceType.MULTISIG, GovernanceType.AZORIUS_ERC20],
};
