import { useCallback } from 'react';
import { getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { FractalModuleData, FractalModuleType } from '../../../types';
import { useMasterCopy } from '../../utils/useMasterCopy';

export const useFractalModules = () => {
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const publicClient = usePublicClient();
  const lookupModules = useCallback(
    async (_moduleAddresses: string[]) => {
      const modules = await Promise.all(
        _moduleAddresses.map(async moduleAddressString => {
          const moduleAddress = getAddress(moduleAddressString);

          const masterCopyData = await getZodiacModuleProxyMasterCopyData(moduleAddress);

          let safeModule: FractalModuleData;

          if (masterCopyData.isModuleAzorius && publicClient) {
            safeModule = {
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.AZORIUS,
            };
          } else if (masterCopyData.isModuleFractal && publicClient) {
            safeModule = {
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.FRACTAL,
            };
          } else {
            safeModule = {
              moduleAddress: moduleAddress,
              moduleType: FractalModuleType.UNKNOWN,
            };
          }

          return safeModule;
        }),
      );
      return modules;
    },
    [getZodiacModuleProxyMasterCopyData, publicClient],
  );
  return lookupModules;
};
