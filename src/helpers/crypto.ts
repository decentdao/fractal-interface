import {
  hashTypedData,
  Hash,
  zeroAddress,
  toHex,
  toBytes,
  encodePacked,
  Address,
  bytesToBigInt,
  Hex,
  encodeFunctionData,
  Abi,
  WalletClient,
} from 'viem';
import { MetaTransaction, SafePostTransaction, SafeTransaction } from '../types/transaction';

export interface SafeSignature {
  signer: string;
  data: Hex;
}

export const EIP712_SAFE_TX_TYPE = {
  // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
  SafeTx: [
    { type: 'address', name: 'to' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'data' },
    { type: 'uint8', name: 'operation' },
    { type: 'uint256', name: 'safeTxGas' },
    { type: 'uint256', name: 'baseGas' },
    { type: 'uint256', name: 'gasPrice' },
    { type: 'address', name: 'gasToken' },
    { type: 'address', name: 'refundReceiver' },
    { type: 'uint256', name: 'nonce' },
  ],
};

export function getRandomBytes() {
  return bytesToBigInt(self.crypto.getRandomValues(new Uint8Array(32)));
}

export const calculateSafeTransactionHash = (
  safeAddress: Address,
  safeTx: SafeTransaction,
  chainId: number,
): string => {
  return hashTypedData({
    domain: { verifyingContract: safeAddress, chainId },
    types: EIP712_SAFE_TX_TYPE,
    primaryType: 'SafeTx',
    message: { ...safeTx },
  });
};

export const buildSignatureBytes = (signatures: SafeSignature[]) => {
  signatures.sort((left, right) =>
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()),
  );
  let signatureBytes: Hash = '0x';
  for (const sig of signatures) {
    signatureBytes += sig.data.slice(2);
  }
  return signatureBytes;
};

export const buildSafeTransaction = (template: {
  to: Address;
  value?: bigint;
  data?: Hex;
  operation?: 0 | 1;
  safeTxGas?: number | string;
  baseGas?: number | string;
  gasPrice?: number | string;
  gasToken?: Address;
  refundReceiver?: Address;
  nonce: number;
}): SafeTransaction => {
  return {
    to: template.to,
    value: template.value || 0n,
    data: template.data || '0x',
    operation: template.operation || 0,
    safeTxGas: template.safeTxGas || 0,
    baseGas: template.baseGas || 0,
    gasPrice: template.gasPrice || 0,
    gasToken: template.gasToken || zeroAddress,
    refundReceiver: template.refundReceiver || zeroAddress,
    nonce: template.nonce,
  };
};

export const safeSignTypedData = async (
  walletClient: WalletClient,
  contractAddress: Address,
  safeTx: SafeTransaction,
  chainId: number,
): Promise<SafeSignature> => {
  if (!walletClient.account) throw new Error("Signer doesn't have account");

  const signerAddress = walletClient.account.address;
  const signedData = await walletClient.signTypedData({
    account: signerAddress,
    domain: { verifyingContract: contractAddress, chainId },
    types: EIP712_SAFE_TX_TYPE,
    primaryType: 'SafeTx',
    message: {
      to: safeTx.to,
      value: safeTx.value,
      data: safeTx.data,
      operation: safeTx.operation,
      safeTxGas: safeTx.safeTxGas,
      baseGas: safeTx.baseGas,
      gasPrice: safeTx.gasPrice,
      gasToken: safeTx.gasToken,
      refundReceiver: safeTx.refundReceiver,
      nonce: safeTx.nonce,
    },
  });

  return {
    signer: signerAddress,
    data: signedData,
  };
};

export const buildSafeAPIPost = async (
  safeAddress: Address,
  walletClient: WalletClient,
  chainId: number,
  template: {
    to: Address;
    value?: bigint;
    data?: Hex;
    operation?: 0 | 1;
    safeTxGas?: number | string;
    baseGas?: number | string;
    gasPrice?: number | string;
    gasToken?: Address;
    refundReceiver?: Address;
    nonce: number;
  },
): Promise<SafePostTransaction> => {
  if (!walletClient.account) throw new Error("Signer doesn't have account");

  const safeTx = buildSafeTransaction(template);
  const txHash = calculateSafeTransactionHash(safeAddress, safeTx, chainId);
  const sig = [await safeSignTypedData(walletClient, safeAddress, safeTx, chainId)];
  const signatureBytes = buildSignatureBytes(sig);
  return {
    safe: safeAddress,
    to: safeTx.to,
    value: safeTx.value ? safeTx.value.toString() : '0',
    data: safeTx.data,
    operation: safeTx.operation,
    safeTxGas: safeTx.safeTxGas,
    baseGas: safeTx.baseGas,
    gasPrice: safeTx.gasPrice,
    gasToken: safeTx.gasToken,
    refundReceiver: safeTx.refundReceiver,
    nonce: safeTx.nonce,
    contractTransactionHash: txHash,
    sender: walletClient.account.address,
    signature: signatureBytes,
  };
};

const finishBuildingConractCall = (
  data: Hex,
  nonce: number,
  contractAddress: Address,
  delegateCall?: boolean,
  overrides?: Partial<SafeTransaction>,
) => {
  const operation: 0 | 1 = delegateCall ? 1 : 0;
  return buildSafeTransaction(
    Object.assign(
      {
        to: contractAddress,
        data,
        operation,
        nonce,
      },
      overrides,
    ),
  );
};

export const buildContractCall = (
  contractAbi: Abi,
  contractAddress: Address,
  method: string,
  params: any[],
  nonce: number,
  delegateCall?: boolean,
  overrides?: Partial<SafeTransaction>,
): SafeTransaction => {
  const data = encodeFunctionData({
    abi: contractAbi,
    functionName: method,
    args: params,
  });

  return finishBuildingConractCall(data, nonce, contractAddress, delegateCall, overrides);
};

const encodeMetaTransaction = (tx: MetaTransaction): string => {
  const txDataBytes = toBytes(tx.data);
  const txDataHex = toHex(txDataBytes);
  const encoded = encodePacked(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [tx.operation, tx.to, BigInt(tx.value), BigInt(txDataBytes.length), txDataHex],
  );
  return encoded.slice(2);
};

export const encodeMultiSend = (txs: MetaTransaction[]): Hex => {
  return `0x${txs.map(tx => encodeMetaTransaction(tx)).join('')}`;
};
