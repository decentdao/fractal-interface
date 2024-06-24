import { useEffect, useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';

const useCurrentBlockNumber = () => {
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const publicClient = usePublicClient();

  const updateBlockNumber = useCallback(
    (block: number) => {
      setCurrentBlockNumber(block);
      if (!isLoaded) {
        setIsLoaded(true);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    if (!publicClient) {
      setCurrentBlockNumber(undefined);
      return;
    }

    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: blockNumber => updateBlockNumber(Number(blockNumber)),
    });

    return () => {
      unwatch();
    };
  }, [publicClient, updateBlockNumber]);

  return { currentBlockNumber, isLoaded };
};

export default useCurrentBlockNumber;
