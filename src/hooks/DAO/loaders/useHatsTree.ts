import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentHatsError, useRolesState } from '../../../state/useRolesState';
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
        try {
          setHatsTree(tree);
        } catch (e) {
          if (e instanceof DecentHatsError) {
            toast(e.message);
          }
        }
      })
      .catch(() => {
        setHatsTree(undefined);
        const message = 'Hats Tree ID is not valid';
        toast(message);
        console.error({
          message,
          args: {
            network: chain.id,
            hatsTreeId: hatsTreeId,
          },
        });
      });
  }, [chain.id, hatsSubgraphClient, hatsTreeId, setHatsTree]);
};

export { useHatsTree };
