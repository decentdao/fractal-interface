import { SafeInfoResponse, TransferResponse } from '@safe-global/safe-service-client';
import { Address } from 'viem';

export declare enum Operation {
  CALL = 0,
  DELEGATE = 1,
}
export declare type InternalTransaction = {
  operation: Operation;
  to: string;
  value?: string;
  data?: string;
  dataDecoded?: DataDecoded;
};
export declare type ValueDecodedType = InternalTransaction[];

export type ParamValue = string | ParamValue[];

export type Parameter = {
  name: string;
  type: string;
  value: ParamValue;
  valueDecoded?: ValueDecodedType;
};

export declare type DataDecoded = {
  method: string;
  parameters?: Parameter[];
};

export type SafeInfoResponseWithGuard = SafeInfoResponse & {
  nextNonce: number;
  guard?: Address;
  address: Address;
};

/**
 * We generally use SafeServiceClient to make requests to the Safe API, however it does not
 * support the /transfers/ endpoint, so we do that via a normal get request instead.
 *
 * This API is paginated, but for our current usage we take the first page, and in
 * the Treasury page have a component to link to Etherscan in the event they want
 * to see more than the first page of assets.
 */
export interface AllTransfersListResponse {
  next: string;
  count: number;
  results: TransferResponse[];
}

export type SafeMultisigConfirmationResponse = {
  readonly owner: string;
  readonly submissionDate: string;
  readonly transactionHash?: string;
  readonly confirmationType?: string;
  readonly signature: string;
  readonly signatureType?: string;
};

export type SafeMultisigTransactionResponse = {
  readonly safe: string;
  readonly to: string;
  readonly value: string;
  readonly data?: string;
  readonly operation: number;
  readonly gasToken: string;
  readonly safeTxGas: number;
  readonly baseGas: number;
  readonly gasPrice: string;
  readonly refundReceiver?: string;
  readonly nonce: number;
  readonly executionDate: string;
  readonly submissionDate: string;
  readonly modified: string;
  readonly blockNumber?: number;
  readonly transactionHash: string;
  readonly safeTxHash: string;
  readonly executor?: string;
  readonly isExecuted: boolean;
  readonly isSuccessful?: boolean;
  readonly ethGasPrice?: string;
  readonly gasUsed?: number;
  readonly fee?: number;
  readonly origin: string;
  readonly dataDecoded?: string;
  readonly confirmationsRequired: number;
  readonly confirmations?: SafeMultisigConfirmationResponse[];
  readonly signatures?: string;
};
