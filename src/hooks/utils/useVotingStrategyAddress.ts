import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
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
        const safeInfo = await safeAPI.getSafeInfo(safeAddress);
        const safeModules = await lookupModules(safeInfo.modules);
        azoriusModule = getAzoriusModuleFromModules(safeModules);
      } else {
        azoriusModule = getAzoriusModuleFromModules(node.fractalModules);
      }

      // if (!azoriusModule) {
      //   throw new Error('Azorius module not found');
      // }

      // if (!publicClient) {
      //   throw new Error('Public client undefined');
      // }

      if (!azoriusModule || !publicClient) {
        return;
      }

      const azoriusContract = getContract({
        abi: abis.Azorius,
        address: azoriusModule.moduleAddress,
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
