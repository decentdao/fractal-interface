import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { getContract, Address } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseAbi from '../../../assets/abi/LockRelease';
import { useFractal } from '../../../providers/App/AppProvider';
import { GovernanceContractAction } from '../../../providers/App/governanceContracts/action';
import { getAzoriusModuleFromModules } from '../../../utils';
import { useMasterCopy } from '../../utils/useMasterCopy';
import useVotingStrategyAddress from '../../utils/useVotingStrategyAddress';

export const useGovernanceContracts = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | null>();
  const { node, action } = useFractal();
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const publicClient = usePublicClient();

  const { getVotingStrategyAddress } = useVotingStrategyAddress();

  const { fractalModules, isModulesLoaded, daoAddress } = node;

  const loadGovernanceContracts = useCallback(async () => {
    const azoriusModule = getAzoriusModuleFromModules(fractalModules);

    const votingStrategyAddress = await getVotingStrategyAddress();

    if (!azoriusModule || !votingStrategyAddress) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {},
      });
      return;
    }

    let linearVotingErc20Address: Address | undefined;
    let linearVotingErc721Address: Address | undefined;
    let votesTokenAddress: Address | undefined;
    let underlyingTokenAddress: Address | undefined;
    let lockReleaseAddress: Address | undefined;

    const { isLinearVotingErc20, isLinearVotingErc721 } =
      await getZodiacModuleProxyMasterCopyData(votingStrategyAddress);

    if (isLinearVotingErc20) {
      if (!publicClient) {
        throw new Error('public client not set');
      }

      linearVotingErc20Address = votingStrategyAddress;

      const ozLinearVotingContract = getContract({
        abi: abis.LinearERC20Voting,
        address: linearVotingErc20Address,
        client: publicClient,
      });
      const govTokenAddress = await ozLinearVotingContract.read.governanceToken();

      const possibleERC20Wrapper = getContract({
        abi: abis.VotesERC20Wrapper,
        address: govTokenAddress,
        client: publicClient,
      });

      underlyingTokenAddress = await possibleERC20Wrapper.read.underlying().catch(() => {
        // if the underlying token is not an ERC20Wrapper, this will throw an error,
        // so we catch it and return undefined
        return undefined;
      });
      const possibleLockRelease = getContract({
        address: govTokenAddress,
        abi: LockReleaseAbi,
        client: { public: publicClient },
      });

      let lockedTokenAddress = undefined;
      try {
        lockedTokenAddress = await possibleLockRelease.read.token();
      } catch {
        // no-op
        // if the underlying token is not an ERC20Wrapper, this will throw an error,
        // so we catch it and do nothing
      }

      if (lockedTokenAddress) {
        lockReleaseAddress = govTokenAddress;
        // @dev if the underlying token is an ERC20Wrapper, we use the underlying token as the token contract
        votesTokenAddress = lockedTokenAddress;
      } else {
        // @dev if the no underlying token, we use the governance token as the token contract
        votesTokenAddress = govTokenAddress;
      }
    } else if (isLinearVotingErc721) {
      // @dev for use with the ERC721 voting contract
      linearVotingErc721Address = votingStrategyAddress;
    }

    if (votesTokenAddress || linearVotingErc721Address) {
      action.dispatch({
        type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES,
        payload: {
          linearVotingErc20Address,
          linearVotingErc721Address,
          votesTokenAddress,
          underlyingTokenAddress,
          lockReleaseAddress,
          moduleAzoriusAddress: azoriusModule.moduleAddress,
        },
      });
    }
  }, [
    action,
    fractalModules,
    getVotingStrategyAddress,
    getZodiacModuleProxyMasterCopyData,
    publicClient,
  ]);

  useEffect(() => {
    if (currentValidAddress.current !== daoAddress && isModulesLoaded) {
      loadGovernanceContracts();
      currentValidAddress.current = daoAddress;
    }
    if (!daoAddress) {
      currentValidAddress.current = null;
    }
  }, [isModulesLoaded, loadGovernanceContracts, daoAddress]);
};
