import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { logError } from '../../helpers/errorLogging';

const useBlockTimestamp = (blockNumber?: number) => {
  const publicClient = usePublicClient();
  const [timestamp, setTimestamp] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!publicClient || !blockNumber) {
      setTimestamp(Math.floor(Date.now() / 1000));
      return;
    }

    publicClient
      .getBlock({ blockNumber: BigInt(blockNumber) })
      .then(block => {
        if (!block) {
          return;
        }
        setTimestamp(Number(block.timestamp));
      })
      .catch(logError);
  }, [publicClient, blockNumber]);

  return timestamp;
};

export default useBlockTimestamp;
