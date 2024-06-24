import { abis } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { keccak256, encodePacked, isHex, Address, getContract, PublicClient } from 'viem';
import { buildSignatureBytes } from '../helpers/crypto';
import { Activity } from '../types';
import { getTimeStamp } from './contract';

export async function getTxTimelockedTimestamp(
  activity: Activity,
  freezeGuardAddress: Address,
  publicClient: PublicClient,
) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  if (!multiSigTransaction.confirmations) {
    throw new Error(
      'Error getting transaction timelocked timestamp - invalid format of multisig transaction',
    );
  }
  const signatures = buildSignatureBytes(
    multiSigTransaction.confirmations.map(confirmation => {
      if (!isHex(confirmation.signature)) {
        throw new Error('Confirmation signature is malfunctioned');
      }
      return {
        signer: confirmation.owner,
        data: confirmation.signature,
      };
    }),
  );
  const signaturesHash = keccak256(encodePacked(['bytes'], [signatures]));

  const freezeGuard = getContract({
    address: freezeGuardAddress,
    abi: abis.MultisigFreezeGuard,
    client: publicClient,
  });

  const timelockedTimestamp = await getTimeStamp(
    await freezeGuard.read.getTransactionTimelockedBlock([signaturesHash]),
    publicClient,
  );
  return timelockedTimestamp;
}
