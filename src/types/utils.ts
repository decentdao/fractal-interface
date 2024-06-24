import { Address } from 'viem';

export type EthAddress = { address: Address };

export enum SortBy {
  Newest = 'newest',
  Oldest = 'oldest',
}
