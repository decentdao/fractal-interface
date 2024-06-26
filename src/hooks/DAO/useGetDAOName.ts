import { useCallback, useEffect, useState } from 'react';
import { Address, PublicClient, getContract, parseAbi, getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../providers/App/AppProvider';
import { FractalContracts } from '../../types';
import { createAccountSubstring } from '../utils/useDisplayName';
import { getNetworkConfig } from './../../providers/NetworkConfig/NetworkConfigProvider';
import { demoData } from './loaders/loadDemoData';

const getDAOName = async ({
  address,
  registryName,
  publicClient,
  baseContracts,
}: {
  address: Address;
  registryName?: string | null;
  publicClient: PublicClient | undefined;
  baseContracts: FractalContracts | undefined;
}) => {
  if (!publicClient || !publicClient.chain) {
    throw new Error('Public client not available');
  }

  const ensName = await publicClient.getEnsName({ address: address }).catch((error: Error) => {
    if (error.name === 'ChainDoesNotSupportContract') {
      // Sliently fail, this is fine.
      // https://github.com/wevm/viem/discussions/781
    } else {
      throw error;
    }
  });
  if (ensName) {
    return ensName;
  }

  if (registryName) {
    return registryName;
  }

  if (!baseContracts) {
    throw new Error('Base contracts not set');
  }

  const {
    contracts: { fractalRegistry },
  } = getNetworkConfig(publicClient.chain.id);

  const fractalRegistryContract = getContract({
    abi: parseAbi(['event FractalNameUpdated(address indexed daoAddress, string daoName)']),
    address: getAddress(fractalRegistry),
    client: publicClient,
  });

  const events = await fractalRegistryContract.getEvents.FractalNameUpdated(
    { daoAddress: address },
    { fromBlock: 0n },
  );

  const latestEvent = events.pop();

  if (latestEvent?.args.daoName) {
    return latestEvent.args.daoName;
  }

  if (publicClient.chain && demoData[publicClient.chain.id]) {
    const demo = demoData[publicClient.chain.id][address];
    if (demo && demo.name) {
      return demo.name;
    }
  }

  return createAccountSubstring(address);
};

const useGetDAOName = ({
  address,
  registryName,
  chainId,
}: {
  address: Address;
  registryName?: string | null;
  chainId?: number;
}) => {
  const publicClient = usePublicClient({
    chainId,
  });
  const { baseContracts } = useFractal();

  const [daoName, setDaoName] = useState<string>();
  useEffect(() => {
    getDAOName({ address, registryName, publicClient, baseContracts }).then(name => {
      setDaoName(name);
    });
  }, [address, baseContracts, publicClient, registryName]);

  return { daoName };
};

const useGetDAONameDeferred = () => {
  const publicClient = usePublicClient();
  const { baseContracts } = useFractal();
  return {
    getDAOName: useCallback(
      ({ address, registryName }: { address: Address; registryName?: string | null }) =>
        getDAOName({ address, registryName, publicClient, baseContracts }),
      [baseContracts, publicClient],
    ),
  };
};

export { useGetDAOName, useGetDAONameDeferred };
