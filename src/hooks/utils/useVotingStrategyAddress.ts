import { useCallback } from 'react';
import { Address, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../assets/abi/Azorius';
import { SENTINEL_ADDRESS } from '../../constants/common';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { FractalModuleData } from '../../types';
import { getAzoriusModuleFromModules } from '../../utils';
import { useFractalModules } from '../DAO/loaders/useFractalModules';

const useVotingStrategyAddress = () => {
  const { node } = useFractal();
  const publicClient = usePublicClient();
  const safeAPI = useSafeAPI();
  const lookupModules = useFractalModules();

  const getVotingStrategyAddress = useCallback(
    async (safeAddress?: Address) => {
      let azoriusModule: FractalModuleData | undefined;

      if (safeAddress) {
        if (!safeAPI) {
          throw new Error('Safe API not ready');
        }
        const safeInfo = await safeAPI.getSafeInfo(getAddress(safeAddress));
        const safeModules = await lookupModules(safeInfo.modules);
        azoriusModule = getAzoriusModuleFromModules(safeModules);
        if (!azoriusModule) return;
      } else {
        azoriusModule = getAzoriusModuleFromModules(node.fractalModules);
      }

      if (!azoriusModule) {
        throw new Error('Azorius module not found');
      }

      if (!publicClient) {
        throw new Error('Public client undefined');
      }

      const azoriusContract = getContract({
        abi: AzoriusAbi,
        address: getAddress(azoriusModule.moduleAddress),
        client: publicClient,
      });

      // @dev assumes the first strategy is the voting contract
      const strategies = await azoriusContract.read.getStrategies([SENTINEL_ADDRESS, 0n]);
      return strategies[1];
    },
    [lookupModules, node.fractalModules, publicClient, safeAPI],
  );

  return { getVotingStrategyAddress };
};

export default useVotingStrategyAddress;