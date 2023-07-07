import axios from 'axios';
import { solidityKeccak256 } from 'ethers/lib/utils.js';
import { useCallback } from 'react';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { DecodedTransaction, DecodedTxParam } from '../../types';
import { buildGnosisApiUrl, parseMultiSendTransactions } from '../../utils';
import { CacheKeys } from './cache/cacheDefaults';
import { DBObjectKeys, useIndexedDB } from './cache/useLocalDB';

/**
 * Handles decoding and caching transactions via the Safe API.
 */
export const useSafeDecoder = () => {
  const { safeBaseURL } = useNetworkConfg();
  const [setValue, getValue] = useIndexedDB(DBObjectKeys.DECODED_TRANSACTIONS);

  const decode = useCallback(
    async (value: string, to: string, data?: string): Promise<DecodedTransaction[]> => {
      if (!data || data.length <= 2) {
        // a transaction without data is an Eth transfer
        return [
          {
            target: to,
            value: value,
            function: 'n/a',
            parameterTypes: ['n/a'],
            parameterValues: ['n/a'],
            decodingFailed: false,
          },
        ];
      }

      const cachedTransactions = await getValue(
        CacheKeys.DECODED_TRANSACTION_PREFIX + solidityKeccak256(['string'], [to + data])
      );
      if (cachedTransactions) return cachedTransactions;

      let decoded: DecodedTransaction | DecodedTransaction[];
      try {
        const decodedData = (
          await axios.post(buildGnosisApiUrl(safeBaseURL, '/data-decoder/'), {
            to: to,
            data: data,
          })
        ).data;

        if (decodedData.parameters && decodedData.method === 'multiSend') {
          const internalTransactionsMap = new Map<number, DecodedTransaction>();
          parseMultiSendTransactions(internalTransactionsMap, decodedData.parameters);
          decoded = [...internalTransactionsMap.values()].flat();
        } else {
          decoded = [
            {
              target: to,
              value: value,
              function: decodedData.method,
              parameterTypes: decodedData.parameters.map((param: DecodedTxParam) => param.type),
              parameterValues: decodedData.parameters.map((param: DecodedTxParam) => param.value),
              decodingFailed: false,
            },
          ];
        }
      } catch (e) {
        return [
          {
            target: to,
            value: value,
            function: 'unknown',
            parameterTypes: [],
            parameterValues: [],
            decodingFailed: true,
          },
        ];
      }

      await setValue(
        CacheKeys.DECODED_TRANSACTION_PREFIX + solidityKeccak256(['string'], [to + data]),
        decoded
      );

      return decoded;
    },
    [getValue, safeBaseURL, setValue]
  );

  return decode;
};
