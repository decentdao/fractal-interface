import { PublicClient } from 'viem';
import { logError } from '../helpers/errorLogging';
import { CacheExpiry, CacheKeys } from '../hooks/utils/cache/cacheDefaults';
import { setValue, getValue } from '../hooks/utils/cache/useLocalStorage';

export const getAverageBlockTime = async (publicClient: PublicClient) => {
  if (!publicClient.chain) {
    return 0;
  }

  let averageBlockTime = getValue({
    cacheName: CacheKeys.AVERAGE_BLOCK_TIME,
    chainId: publicClient.chain.id,
  });

  if (averageBlockTime) {
    return averageBlockTime;
  }

  const latestBlock = await publicClient.getBlock();
  const pastBlock = await publicClient.getBlock({ blockNumber: latestBlock.number - 1000n });
  averageBlockTime = Number((latestBlock.timestamp - pastBlock.timestamp) / 1000n);

  setValue(
    { cacheName: CacheKeys.AVERAGE_BLOCK_TIME, chainId: publicClient.chain.id },
    averageBlockTime,
    CacheExpiry.ONE_DAY,
  );

  return averageBlockTime;
};

export const getTimeStamp = async (blockNumber: number | 'latest', publicClient: PublicClient) => {
  if (blockNumber === 'latest') {
    const latestBlock = await publicClient.getBlock();
    return Number(latestBlock.timestamp);
  }

  try {
    const block = await publicClient.getBlock({ blockNumber: BigInt(blockNumber) });
    const latestBlock = await publicClient.getBlock();

    if (blockNumber < latestBlock.number) {
      return Number(block.timestamp);
    } else {
      const averageBlockTime = await getAverageBlockTime(publicClient);
      const estimatedTimestamp = Number(
        latestBlock.timestamp +
          BigInt(averageBlockTime) * (BigInt(blockNumber) - latestBlock.number),
      );

      return estimatedTimestamp;
    }
  } catch (error) {
    logError(error);
    return 0;
  }
};

export const blocksToSeconds = async (
  numOfBlocks: number,
  publicClient: PublicClient,
): Promise<number> => {
  try {
    const averageBlockTime = Math.round(await getAverageBlockTime(publicClient));
    return averageBlockTime * numOfBlocks;
  } catch (error) {
    logError(error);
    return 0;
  }
};

export const getEstimatedNumberOfBlocks = async (
  timeInMinutes: bigint,
  publicClient: PublicClient,
): Promise<bigint> => {
  const seconds = Number(timeInMinutes) * 60;
  const averageBlockTime = await getAverageBlockTime(publicClient);
  return BigInt(Math.ceil(seconds / averageBlockTime));
};
