import { HatsSubgraphClient } from '@hatsprotocol/sdk-v1-subgraph';

const hatsSubgraphClient = new HatsSubgraphClient({
  // TODO config for prod
});

const useHatsSubgraphClient = () => {
  return hatsSubgraphClient;
};

export { useHatsSubgraphClient };
