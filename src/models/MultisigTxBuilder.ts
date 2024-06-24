import { Address } from 'viem';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import { buildContractCall } from '../helpers';
import { SafeMultisigDAO, SafeTransaction } from '../types';

export class MultisigTxBuilder {
  private multiSendCallOnlyAddress: Address;
  private readonly daoData: SafeMultisigDAO;
  private readonly safeContractAddress: Address;

  constructor(
    multiSendCallOnlyAddress: Address,
    daoData: SafeMultisigDAO,
    safeContractAddress: Address,
  ) {
    this.multiSendCallOnlyAddress = multiSendCallOnlyAddress;
    this.daoData = daoData;
    this.safeContractAddress = safeContractAddress;
  }

  public signatures = (): string => {
    return (
      '0x000000000000000000000000' +
      this.multiSendCallOnlyAddress.slice(2) +
      '0000000000000000000000000000000000000000000000000000000000000000' +
      '01'
    );
  };

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    return buildContractCall(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'removeOwner',
      [
        this.daoData.trustedAddresses[this.daoData.trustedAddresses.length - 1],
        this.multiSendCallOnlyAddress,
        this.daoData.signatureThreshold,
      ],
      0,
      false,
    );
  }
}
