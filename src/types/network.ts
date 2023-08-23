import { ethers } from 'ethers';
import { Chain } from 'wagmi';
import { GovernanceType } from './fractal';

export type Providers =
  | ethers.providers.Web3Provider
  | ethers.providers.JsonRpcProvider
  | ethers.providers.BaseProvider;

export type StakingProviderNetworkConfig = {
  supportedAssets: string[];
};
export type NetworkConfig = {
  safeBaseURL: string;
  etherscanBaseURL: string;
  etherscanAPIBaseUrl: string;
  chainId: number;
  name: string;
  color: string;
  nativeTokenSymbol: string;
  nativeTokenIcon: string;
  wagmiChain: Chain;
  subgraphChainName: string;
  contracts: {
    safe: string;
    safeFactory: string;
    zodiacModuleProxyFactory: string;
    linearVotingMasterCopy: string;
    multisend: string;
    fractalAzoriusMasterCopy: string;
    fractalModuleMasterCopy: string;
    fractalRegistry: string;
    votesERC20MasterCopy: string;
    linearVotingERC721MasterCopy: string;
    claimingMasterCopy: string;
    multisigFreezeGuardMasterCopy: string;
    azoriusFreezeGuardMasterCopy: string;
    multisigFreezeVotingMasterCopy: string;
    erc20FreezeVotingMasterCopy: string;
    erc721FreezeVotingMasterCopy: string;
    votesERC20WrapperMasterCopy: string;
    keyValuePairs: string;
  };
  staking: {
    lido?: {
      stETHContractAddress: string;
      rewardsAddress: string;
      withdrawalQueueContractAddress: string;
    } & StakingProviderNetworkConfig;
    yearn?: {
      apiURL: string;
    } & StakingProviderNetworkConfig;
  };
  createOptions: GovernanceType[];
};
