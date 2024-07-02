import { useEffect } from 'react';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../state/useRolesState';
import { useHatsSubgraphClient } from './useHatsSubgraphClient';

const useHatsTree = () => {
  const { hatsTreeId } = useRolesState();
  const { chain } = useNetworkConfig();
  const hatsSubgraphClient = useHatsSubgraphClient();
  const { setHatsTree } = useRolesState();

  useEffect(() => {
    if (hatsTreeId === undefined || hatsTreeId === null) {
      return;
    }

    hatsSubgraphClient
      .getTree({
        chainId: chain.id,
        treeId: hatsTreeId,
        props: {
          hats: {
            props: {
              prettyId: true,
              status: true,
              createdAt: true,
              details: true,
              maxSupply: true,
              eligibility: true,
              toggle: true,
              mutable: true,
              levelAtLocalTree: true,
              currentSupply: true,
            },
          },
        },
      })
      .then(tree => {
        setHatsTree(tree);
      })
      .catch(() => {
        setHatsTree(undefined);
        console.error({
          message: 'hatsTreeId is not valid',
          args: {
            network: chain.id,
            hatsTreeId: hatsTreeId,
          },
        });
      });
  }, [chain.id, hatsSubgraphClient, hatsTreeId, setHatsTree]);
};

export { useHatsTree };
