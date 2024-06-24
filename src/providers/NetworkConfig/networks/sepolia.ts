import { addresses } from '@fractal-framework/fractal-contracts';
import {
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from '@safe-global/safe-deployments';
import { getAddress } from 'viem';
import { sepolia } from 'wagmi/chains';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getSafeContractDeploymentAddress } from './utils';

const SAFE_VERSION = '1.3.0';

const chain = sepolia;
const a = addresses[chain.id];

export const sepoliaConfig: NetworkConfig = {
  order: 30,
  chain,
  rpcEndpoint: `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_APP_ALCHEMY_SEPOLIA_API_KEY}`,
  safeBaseURL: 'https://safe-transaction-sepolia.safe.global',
  etherscanBaseURL: 'https://sepolia.etherscan.io',
  etherscanAPIUrl: `https://api-sepolia.etherscan.io/api?apikey=${import.meta.env.VITE_APP_ETHERSCAN_SEPOLIA_API_KEY}`,
  addressPrefix: 'sep',
  nativeTokenIcon: '/images/coin-icon-sep.svg',
  subgraph: {
    space: 71032,
    slug: 'fractal-sepolia',
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
  createOptions: [
    GovernanceType.MULTISIG,
    GovernanceType.AZORIUS_ERC20,
    GovernanceType.AZORIUS_ERC721,
  ],
};
