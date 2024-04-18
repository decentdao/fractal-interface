import { useLazyQuery } from '@apollo/client';
import { useCallback } from 'react';
import { isAddress, getAddress, Address } from 'viem';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalNode, Node, WithError } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

export const useLoadDAONode = () => {
  const safeAPI = useSafeAPI();
  const { getDaoName } = useLazyDAOName();
  const lookupModules = useFractalModules();
  const { subgraph } = useNetworkConfig();
  const [getDAOInfo] = useLazyQuery(DAOQueryDocument, {
    context: {
      subgraphSpace: subgraph.space,
      subgraphSlug: subgraph.slug,
      subgraphVersion: subgraph.version,
    },
  });

  const formatDAOQuery = useCallback((result: { data?: DAOQueryQuery }, _daoAddress: string) => {
    if (!result.data) {
      return;
    }
    const { daos } = result.data;
    const dao = daos[0];
    if (dao) {
      const { parentAddress, name, hierarchy, snapshotURL } = dao;

      const currentNode: Node = {
        nodeHierarchy: {
          parentAddress: parentAddress as string,
          childNodes: mapChildNodes(hierarchy),
        },
        daoName: name as string,
        daoAddress: getAddress(_daoAddress as string),
        daoSnapshotURL: snapshotURL as string,
      };
      return currentNode;
    }
    return;
  }, []);

  const loadDao = useCallback(
    async (_daoAddress: string): Promise<FractalNode | WithError> => {
      if (isAddress(_daoAddress) && safeAPI) {
        try {
          const graphNodeInfo = formatDAOQuery(
            await getDAOInfo({ variables: { daoAddress: _daoAddress } }),
            _daoAddress,
          );
          if (!graphNodeInfo) {
            logError('graphQL query failed');
            return { error: 'errorFailedSearch' };
          }

          const sanitizedDaoAddress = getAddress(_daoAddress);
          const safeInfoWithGuard = await safeAPI.getSafeData(sanitizedDaoAddress);

          const node: FractalNode = Object.assign(graphNodeInfo, {
            daoName: await getDaoName(sanitizedDaoAddress, graphNodeInfo.daoName),
            safe: safeInfoWithGuard,
            fractalModules: await lookupModules(safeInfoWithGuard.modules as Address[]),
          });

          // TODO we could cache node here, but should be careful not to cache
          // nodes that haven't fully loaded

          return node;
        } catch (e) {
          logError(e);
          return { error: 'errorInvalidSearch' };
        }
      } else {
        // invalid address
        return { error: 'errorFailedSearch' };
      }
    },
    [safeAPI, lookupModules, formatDAOQuery, getDAOInfo, getDaoName],
  );

  return { loadDao };
};
