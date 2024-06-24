import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient, {
  AllTransactionsListResponse,
  AllTransactionsOptions,
  MasterCopyResponse,
  ModulesResponse,
  OwnerResponse,
  SafeBalanceResponse,
  SafeBalancesOptions,
  SafeCollectibleResponse,
  SafeCollectiblesOptions,
  SafeCreationInfoResponse,
  SafeDelegateListResponse,
  SafeInfoResponse,
  SafeModuleTransactionListResponse,
  SafeMultisigTransactionListResponse,
  SafeServiceClientConfig,
  SafeServiceInfoResponse,
  TokenInfoListResponse,
  TokenInfoResponse,
  TransferListResponse,
} from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { Address, getAddress } from 'viem';
import { CacheExpiry } from '../../../hooks/utils/cache/cacheDefaults';
import {
  DBObjectKeys,
  getIndexedDBValue,
  setIndexedDBValue,
} from '../../../hooks/utils/cache/useLocalDB';
import useSignerOrProvider from '../../../hooks/utils/useSignerOrProvider';
import { SafeInfoResponseWithGuard, SafeMultisigTransactionResponse } from '../../../types';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

class CachingSafeServiceClient extends SafeServiceClient {
  readonly CHAINID: number;

  // holds requests that have yet to return, to avoid calling the same
  // endpoint more than once
  requestMap = new Map<string, Promise<any> | null>();

  constructor(chainId: number, { txServiceUrl, ethAdapter }: SafeServiceClientConfig) {
    super({ txServiceUrl, ethAdapter });
    this.CHAINID = chainId;
  }

  private async setCache(key: string, value: any, cacheMinutes: number): Promise<void> {
    await setIndexedDBValue(DBObjectKeys.SAFE_API, key, value, this.CHAINID, cacheMinutes);
  }

  private async getCache<T>(key: string): Promise<T> {
    const value: T = await getIndexedDBValue(DBObjectKeys.SAFE_API, key, this.CHAINID);
    return value;
  }

  private async request<T>(
    cacheKey: string,
    cacheMinutes: number,
    endpoint: () => Promise<T>,
  ): Promise<T> {
    let value: T = await this.getCache<T>(cacheKey);
    if (!value) {
      let call = this.requestMap.get(cacheKey);
      if (!call) {
        call = endpoint();
        this.requestMap.set(cacheKey, call);
      }
      value = await call;
      this.requestMap.set(cacheKey, null);
      await this.setCache(cacheKey, value, cacheMinutes);
    }
    return value;
  }

  override async getServiceInfo(): Promise<SafeServiceInfoResponse> {
    const value = await this.request('getServiceInfo', 1, super.getServiceInfo);
    return value;
  }
  override async getServiceMasterCopiesInfo(): Promise<MasterCopyResponse[]> {
    const value = await this.request(
      'getServiceMasterCopiesInfo',
      CacheExpiry.ONE_DAY,
      super.getServiceMasterCopiesInfo,
    );
    return value;
  }
  override async decodeData(data: string): Promise<any> {
    const value = await this.request('decodeData' + data, 1, () => {
      return super.decodeData(data);
    });
    return value;
  }
  override async getSafesByOwner(ownerAddress: Address): Promise<OwnerResponse> {
    const value = await this.request('getSafesByOwner' + ownerAddress, 1, () => {
      return super.getSafesByOwner(ownerAddress);
    });
    return value;
  }
  override async getTransaction(safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const value = await this.request('getTransaction' + safeTxHash, 1, () => {
      return super.getTransaction(safeTxHash);
    });
    return value;
  }
  override async getSafeInfo(safeAddress: Address): Promise<SafeInfoResponse> {
    const value = await this.request('getSafeInfo' + safeAddress, 5, () => {
      return super.getSafeInfo(safeAddress);
    });
    return value;
  }
  override async getSafeDelegates(safeAddress: Address): Promise<SafeDelegateListResponse> {
    const value = await this.request('getSafeDelegates' + safeAddress, 1, () => {
      return super.getSafeDelegates(safeAddress);
    });
    return value;
  }
  override async getSafeCreationInfo(safeAddress: Address): Promise<SafeCreationInfoResponse> {
    const value = await this.request('getSafeCreationInfo' + safeAddress, CacheExpiry.NEVER, () => {
      return super.getSafeCreationInfo(safeAddress);
    });
    return value;
  }
  override async getIncomingTransactions(safeAddress: Address): Promise<TransferListResponse> {
    const value = await this.request('getIncomingTransactions' + safeAddress, 1, () => {
      return super.getIncomingTransactions(safeAddress);
    });
    return value;
  }
  override async getModuleTransactions(
    safeAddress: Address,
  ): Promise<SafeModuleTransactionListResponse> {
    const value = await this.request('getModuleTransactions' + safeAddress, 1, () => {
      return super.getModuleTransactions(safeAddress);
    });
    return value;
  }
  override async getMultisigTransactions(
    safeAddress: Address,
  ): Promise<SafeMultisigTransactionListResponse> {
    const value = await this.request('getMultisigTransactions' + safeAddress, 1, () => {
      return super.getMultisigTransactions(safeAddress);
    });
    return value;
  }
  override async getPendingTransactions(
    safeAddress: Address,
    currentNonce?: number | undefined,
  ): Promise<SafeMultisigTransactionListResponse> {
    const value = await this.request(
      'getPendingTransactions' + safeAddress + currentNonce?.toString(),
      1,
      () => {
        return super.getPendingTransactions(safeAddress, currentNonce);
      },
    );
    return value;
  }
  override async getBalances(
    safeAddress: Address,
    options?: SafeBalancesOptions | undefined,
  ): Promise<SafeBalanceResponse[]> {
    const value = await this.request('getBalances' + safeAddress + options?.toString(), 1, () => {
      return super.getBalances(safeAddress, options);
    });
    return value;
  }
  override async getCollectibles(
    safeAddress: Address,
    options?: SafeCollectiblesOptions | undefined,
  ): Promise<SafeCollectibleResponse[]> {
    const value = await this.request(
      'getCollectibles' + safeAddress + options?.toString(),
      1,
      () => {
        return super.getCollectibles(safeAddress, options);
      },
    );
    return value;
  }
  override async getTokenList(): Promise<TokenInfoListResponse> {
    const value = await this.request('getTokenList', 1, () => {
      return super.getTokenList();
    });
    return value;
  }
  override async getToken(tokenAddress: string): Promise<TokenInfoResponse> {
    const value = await this.request('getToken' + tokenAddress, 1, () => {
      return super.getToken(tokenAddress);
    });
    return value;
  }
  override async getAllTransactions(
    safeAddress: Address,
    options?: AllTransactionsOptions,
  ): Promise<AllTransactionsListResponse> {
    const value = await this.request(
      'getAllTransactions' + safeAddress + options?.toString(),
      1,
      () => {
        return super.getAllTransactions(safeAddress, options);
      },
    );
    return value;
  }
  override async getSafesByModule(moduleAddress: Address): Promise<ModulesResponse> {
    const value = await this.request('getSafesByModule' + moduleAddress, 1, () => {
      return super.getSafesByModule(moduleAddress);
    });
    return value;
  }

  async getSafeData(safeAddress: Address): Promise<SafeInfoResponseWithGuard> {
    const safeInfoResponse = await this.getSafeInfo(safeAddress);
    const nextNonce = await this.getNextNonce(safeAddress);
    const safeInfo = {
      ...safeInfoResponse,
      nextNonce,
      address: getAddress(safeInfoResponse.address),
    };
    return safeInfo;
  }
}

export function useSafeAPI() {
  const { safeBaseURL, chain } = useNetworkConfig();
  const signerOrProvider = useSignerOrProvider();

  const safeAPI = useMemo(() => {
    if (!signerOrProvider) {
      return undefined;
    }
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider,
    });
    return new CachingSafeServiceClient(chain.id, {
      txServiceUrl: safeBaseURL,
      ethAdapter,
    });
  }, [signerOrProvider, chain, safeBaseURL]);

  return safeAPI;
}
