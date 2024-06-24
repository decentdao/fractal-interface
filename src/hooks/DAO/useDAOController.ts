import { useSearchParams } from 'react-router-dom';
import { isAddress, getAddress } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useAzoriusListeners } from './loaders/governance/useAzoriusListeners';
import { useERC20Claim } from './loaders/governance/useERC20Claim';
import { useSnapshotProposals } from './loaders/snapshot/useSnapshotProposals';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useFractalTreasury } from './loaders/useFractalTreasury';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';

export default function useDAOController() {
  const [searchParams] = useSearchParams();
  const addressWithPrefix = searchParams.get('dao');
  const validDaoQueryString = /^[^\s:]+:[^\s:]+$/;

  const prefixAndAddress = addressWithPrefix?.split(':');
  const addressPrefix = prefixAndAddress?.[0];
  const daoAddress = prefixAndAddress?.[1];

  const invalidQuery =
    addressWithPrefix === null ||
    !validDaoQueryString.test(addressWithPrefix) ||
    !isAddress(daoAddress || '');

  const { addressPrefix: connectedAddressPrefix } = useNetworkConfig();
  const wrongNetwork = addressPrefix !== connectedAddressPrefix;

  const skip = invalidQuery || wrongNetwork;

  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();

  const { errorLoading } = useFractalNode(skip, {
    addressPrefix,
    daoAddress: daoAddress ? getAddress(daoAddress) : undefined,
  });

  useGovernanceContracts();
  useFractalGuardContracts({});
  useFractalFreeze({ parentSafeAddress: parentAddress });
  useFractalGovernance();
  useFractalTreasury();
  useERC20Claim();
  useSnapshotProposals();
  useAzoriusListeners();

  return { invalidQuery, wrongNetwork, errorLoading };
}
