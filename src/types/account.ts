import { Address } from 'viem';

export interface VotesTokenData extends VotesData, ERC20TokenData {}
export interface VotesData {
  balance: bigint | null;
  delegatee: Address | null;
  votingWeight: bigint | null;
}
export type UnderlyingTokenData = Omit<
  ERC20TokenData,
  'totalSupply' | 'decimals' | 'underlyingTokenData'
>;

export interface BaseTokenData {
  name: string;
  symbol: string;
  address: Address;
}
export interface ERC20TokenData extends BaseTokenData {
  decimals: number;
  totalSupply: bigint;
  underlyingTokenData?: UnderlyingTokenData;
}

export interface ERC721TokenData extends BaseTokenData {
  totalSupply?: bigint;
  votingWeight: bigint;
}
