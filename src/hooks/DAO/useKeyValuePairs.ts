import { useEffect } from 'react';
import { GetContractEventsReturnType, getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import KeyValuePairsAbi from '../../assets/abi/KeyValuePairs';
import { logError } from '../../helpers/errorLogging';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../state/useRolesState';

const getHatsTreeId = (
  events: GetContractEventsReturnType<typeof KeyValuePairsAbi> | undefined,
  chainId: number,
) => {
  if (!events) {
    return null;
  }

  // get most recent event where `hatsTreeId` was set
  const hatsTreeIdEvent = events
    .filter(event => event.args.key && event.args.key === 'hatsTreeId')
    .pop();

  if (!hatsTreeIdEvent) {
    return null;
  }

  if (!hatsTreeIdEvent.args.value) {
    logError({
      message: "KVPairs 'hatsTreeIdEvent' without a value",
      network: chainId,
      args: {
        transactionHash: hatsTreeIdEvent.transactionHash,
        logIndex: hatsTreeIdEvent.logIndex,
      },
    });
    return undefined;
  }

  const treeId = parseInt(hatsTreeIdEvent.args.value);
  if (isNaN(treeId)) {
    logError({
      message: "KVPairs 'hatsTreeIdEvent' value not a number",
      network: chainId,
      args: {
        transactionHash: hatsTreeIdEvent.transactionHash,
        logIndex: hatsTreeIdEvent.logIndex,
      },
    });
    return undefined;
  }

  return treeId;
};

const useKeyValuePairs = () => {
  const publicClient = usePublicClient();
  const { node } = useFractal();
  const {
    chain,
    contracts: { keyValuePairs },
  } = useNetworkConfig();
  const { setHatsTreeId } = useRolesState();

  useEffect(() => {
    if (!publicClient || !node.daoAddress) {
      return;
    }

    const keyValuePairsContract = getContract({
      abi: KeyValuePairsAbi,
      address: getAddress(keyValuePairs),
      client: publicClient,
    });
    keyValuePairsContract.getEvents
      .ValueUpdated({ theAddress: node.daoAddress }, { fromBlock: 0n })
      .then(safeEvents => {
        const newHatsTreeId = getHatsTreeId(safeEvents, chain.id);
        setHatsTreeId(newHatsTreeId);
      })
      .catch(error => {
        logError(error);
      });
  }, [chain.id, keyValuePairs, node.daoAddress, publicClient, setHatsTreeId]);
};

export { useKeyValuePairs };
