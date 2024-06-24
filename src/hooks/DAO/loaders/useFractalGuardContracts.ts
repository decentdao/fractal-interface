import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../providers/App/AppProvider';
import { GuardContractAction } from '../../../providers/App/guardContracts/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeInfoResponseWithGuard, FreezeGuardType, FreezeVotingType } from '../../../types';
import { useMasterCopy } from '../../utils/useMasterCopy';
import { FractalModuleData, FractalModuleType } from './../../../types/fractal';

export const useFractalGuardContracts = ({ loadOnMount = true }: { loadOnMount?: boolean }) => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();
  const {
    node: { daoAddress, safe, fractalModules, isHierarchyLoaded },
    action,
  } = useFractal();
  const { chain } = useNetworkConfig();

  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();

  const publicClient = usePublicClient();

  const loadFractalGuardContracts = useCallback(
    async (
      _daoAddress: string,
      _safe: SafeInfoResponseWithGuard,
      _fractalModules: FractalModuleData[],
    ) => {
      if (!publicClient) {
        return;
      }

      const { guard } = _safe;

      const azoriusModule = _fractalModules?.find(
        module => module.moduleType === FractalModuleType.AZORIUS,
      );

      if (azoriusModule) {
        const azoriusContract = getContract({
          abi: abis.Azorius,
          address: azoriusModule.moduleAddress,
          client: publicClient,
        });

        const azoriusGuardAddress = await azoriusContract.read.getGuard();
        if (azoriusGuardAddress === zeroAddress) {
          return {
            freezeGuardContractAddress: undefined,
            freezeVotingContractAddress: undefined,
            freezeVotingType: null,
            freezeGuardType: null,
          };
        }

        const freezeGuardContract = getContract({
          abi: abis.AzoriusFreezeGuard,
          address: azoriusGuardAddress,
          client: publicClient,
        });

        const votingAddress = await freezeGuardContract.read.freezeVoting();
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(votingAddress);
        const freezeVotingType = masterCopyData.isFreezeVotingMultisig
          ? FreezeVotingType.MULTISIG
          : masterCopyData.isFreezeVotingErc721
            ? FreezeVotingType.ERC721
            : FreezeVotingType.ERC20;

        return {
          freezeGuardContractAddress: azoriusGuardAddress,
          freezeVotingContractAddress: votingAddress,
          freezeVotingType,
          freezeGuardType: FreezeGuardType.AZORIUS,
        };
      } else if (guard) {
        const masterCopyData = await getZodiacModuleProxyMasterCopyData(guard);
        if (!masterCopyData.isFreezeGuardMultisig || _safe.guard === zeroAddress) {
          return {
            freezeGuardContractAddress: undefined,
            freezeVotingContractAddress: undefined,
            freezeVotingType: null,
            freezeGuardType: null,
          };
        }

        const multisigFreezeGuardContract = getContract({
          abi: abis.MultisigFreezeGuard,
          address: guard,
          client: publicClient,
        });

        const votingAddress = await multisigFreezeGuardContract.read.freezeVoting();
        const freezeVotingMasterCopyData = await getZodiacModuleProxyMasterCopyData(votingAddress);
        const freezeVotingType = freezeVotingMasterCopyData.isFreezeVotingMultisig
          ? FreezeVotingType.MULTISIG
          : freezeVotingMasterCopyData.isFreezeVotingErc721
            ? FreezeVotingType.ERC721
            : FreezeVotingType.ERC20;

        return {
          freezeGuardContractAddress: guard,
          freezeVotingContractAddress: votingAddress,
          freezeVotingType,
          freezeGuardType: FreezeGuardType.MULTISIG,
        };
      } else {
        return {
          freezeGuardContractAddress: undefined,
          freezeVotingContractAddress: undefined,
          freezeVotingType: null,
          freezeGuardType: null,
        };
      }
    },
    [getZodiacModuleProxyMasterCopyData, publicClient],
  );

  const setGuardContracts = useCallback(async () => {
    if (!daoAddress || !safe) return;
    const contracts = await loadFractalGuardContracts(daoAddress, safe, fractalModules);
    if (!contracts) return;
    action.dispatch({ type: GuardContractAction.SET_GUARD_CONTRACT, payload: contracts });
  }, [action, daoAddress, safe, fractalModules, loadFractalGuardContracts]);

  useEffect(() => {
    if (
      loadOnMount &&
      daoAddress &&
      daoAddress + chain.id !== loadKey.current &&
      isHierarchyLoaded &&
      safe
    ) {
      loadKey.current = daoAddress + chain.id;
      setGuardContracts();
    }

    if (!daoAddress) {
      loadKey.current = undefined;
    }
  }, [setGuardContracts, isHierarchyLoaded, loadOnMount, chain, daoAddress, safe]);
  return loadFractalGuardContracts;
};
