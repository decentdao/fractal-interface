import {
  SafeBalanceResponse,
  SafeCollectibleResponse,
  TransferResponse,
} from '@safe-global/safe-service-client';
import { Address } from 'viem';
import { ActivityBase } from './fractal';
import { AllTransfersListResponse } from './safeGlobal';
import { EthAddress } from './utils';

export enum TokenEventType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export interface TokenEvent {
  transactionHash: string;
  blockNumber: number;
  eventType: TokenEventType;
  blockTimestamp: number;
}

export interface TokenDepositEvent extends TokenEvent, EthAddress {
  amount: bigint;
}

export interface TokenWithdrawEvent extends TokenEvent {
  addresses: string[];
  amount: bigint;
}
export interface ERC721TokenEvent extends TokenEvent {
  contractAddresses: string[];
  tokenIds: bigint[];
}
export interface ERC20TokenEvent extends TokenEvent {
  contractAddresses: string[];
  addresses: string[];
  amounts: bigint[];
}

export type Transaction =
  | TokenDepositEvent
  | TokenWithdrawEvent
  | ERC20TokenEvent
  | ERC721TokenEvent;

export interface ITreasury {
  transactions: Transaction[];
  assetsFungible: SafeBalanceResponse[];
  assetsNonFungible: SafeCollectibleResponse[];
  transfers?: AllTransfersListResponse;
  treasuryIsLoading: boolean;
}

export enum TransferType {
  ETHER_TRANSFER = 'ETHER_TRANSFER',
  ERC20_TRANSFER = 'ERC20_TRANSFER',
  ERC721_TRANSFER = 'ERC721_TRANSFER',
}

export enum TokenType {
  ERC20,
  ERC721,
}

export interface TokenInfo {
  type: TokenType;
  address: Address;
  name: string;
  symbol: string;
  logoUri: string;
  decimals: number;
}

export interface AssetTransfer extends TransferResponse {
  tokenInfo?: TokenInfo;
}

export type AssetTotals = {
  bi: bigint;
  symbol: string;
  decimals: number;
};

export enum TreasuryActivityTypes {
  DEPOSIT,
  WITHDRAW,
}

export interface TreasuryActivity extends ActivityBase {
  transferAddresses: Address[];
  transferAmountTotals: string[];
  isDeposit: boolean;
}
