import { abis } from '@fractal-framework/fractal-contracts';
import { Address, PublicClient, encodeFunctionData, zeroAddress } from 'viem';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import MultiSendCallOnlyAbi from '../assets/abi/MultiSendCallOnly';
import { buildContractCall, encodeMultiSend } from '../helpers';
import {
  SafeMultisigDAO,
  SafeTransaction,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  VotingStrategyType,
} from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { TxBuilderFactory } from './TxBuilderFactory';
import { fractalModuleData, FractalModuleData } from './helpers/fractalModuleData';

export class DaoTxBuilder extends BaseTxBuilder {
  private readonly saltNum;

  private txBuilderFactory: TxBuilderFactory;

  // Safe Data
  private readonly createSafeTx: SafeTransaction;
  private readonly safeContractAddress: Address;
  private readonly parentStrategyType?: VotingStrategyType;
  private readonly parentStrategyAddress?: Address;

  // Fractal Module Txs
  private enableFractalModuleTx: SafeTransaction | undefined;
  private deployFractalModuleTx: SafeTransaction | undefined;

  private internalTxs: SafeTransaction[] = [];

  private readonly keyValuePairs: Address;
  private readonly fractalRegistry: Address;
  private readonly zodiacModuleProxyFactory: Address;
  private readonly multiSendCallOnly: Address;
  private readonly moduleFractalMasterCopy: Address;

  constructor(
    publicClient: PublicClient,
    isAzorius: boolean,
    daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
    saltNum: bigint,

    createSafeTx: SafeTransaction,
    safeContractAddress: Address,
    txBuilderFactory: TxBuilderFactory,

    keyValuePairs: Address,
    fractalRegistry: Address,
    zodiacModuleProxyFactory: Address,
    multiSendCallOnly: Address,
    moduleFractalMasterCopy: Address,

    parentAddress?: Address,
    parentTokenAddress?: Address,

    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: Address,
  ) {
    super(publicClient, isAzorius, daoData, parentAddress, parentTokenAddress);
    this.saltNum = saltNum;

    this.createSafeTx = createSafeTx;
    this.safeContractAddress = safeContractAddress;
    this.txBuilderFactory = txBuilderFactory;

    this.keyValuePairs = keyValuePairs;
    this.fractalRegistry = fractalRegistry;
    this.zodiacModuleProxyFactory = zodiacModuleProxyFactory;
    this.multiSendCallOnly = multiSendCallOnly;
    this.moduleFractalMasterCopy = moduleFractalMasterCopy;

    this.parentStrategyType = parentStrategyType;
    this.parentStrategyAddress = parentStrategyAddress;

    // Prep fractal module txs for setting up subDAOs
    this.setFractalModuleTxs();
  }

  public async buildAzoriusTx(
    shouldSetName: boolean = true,
    shouldSetSnapshot: boolean = true,
    existingSafe?: { owners: string[] },
  ): Promise<string> {
    const azoriusTxBuilder = await this.txBuilderFactory.createAzoriusTxBuilder();

    // transactions that must be called by safe
    this.internalTxs = [];
    const txs: SafeTransaction[] = !!existingSafe ? [] : [this.createSafeTx!];

    if (shouldSetName) {
      this.internalTxs = this.internalTxs.concat(this.buildUpdateDAONameTx());
    }

    if (shouldSetSnapshot) {
      this.internalTxs = this.internalTxs.concat(this.buildUpdateDAOSnapshotENSTx());
    }

    this.internalTxs = this.internalTxs.concat(
      azoriusTxBuilder.buildVotingContractSetupTx(),
      azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    );

    if (this.parentAddress) {
      const freezeGuardTxBuilder = this.txBuilderFactory.createFreezeGuardTxBuilder(
        azoriusTxBuilder.azoriusAddress,
        azoriusTxBuilder.linearERC20VotingAddress ?? azoriusTxBuilder.linearERC721VotingAddress,
        this.parentStrategyType,
        this.parentStrategyAddress,
      );

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        freezeGuardTxBuilder.buildDeployZodiacModuleTx(),
        freezeGuardTxBuilder.buildFreezeVotingSetupTx(),
        freezeGuardTxBuilder.buildDeployFreezeGuardTx(),
        freezeGuardTxBuilder.buildSetGuardTx(abis.Azorius, azoriusTxBuilder.azoriusAddress!),
      ]);
    }
    const data = this.daoData as AzoriusERC20DAO;

    this.internalTxs = this.internalTxs.concat([
      azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
      ...(!!existingSafe ? azoriusTxBuilder.buildRemoveOwners(existingSafe.owners) : []),
      azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
    ]);

    // build token wrapper if token is imported and not votes token (votes token contracts is already deployed)
    if (data.isTokenImported && !data.isVotesToken && data.tokenImportAddress) {
      txs.push(azoriusTxBuilder.buildCreateTokenWrapperTx());
    }
    // build token if token is not imported
    if (!data.isTokenImported && data.votingStrategyType === VotingStrategyType.LINEAR_ERC20) {
      txs.push(azoriusTxBuilder.buildCreateTokenTx());
    }

    txs.push(azoriusTxBuilder.buildDeployStrategyTx());
    txs.push(azoriusTxBuilder.buildDeployAzoriusTx());

    // If subDAO and parentAllocation, deploy claim module
    let tokenClaimTx: SafeTransaction | undefined;
    const parentAllocation = (this.daoData as AzoriusERC20DAO).parentAllocationAmount;

    if (this.parentTokenAddress && parentAllocation && parentAllocation !== 0n) {
      const tokenApprovalTx = azoriusTxBuilder.buildApproveClaimAllocation();
      if (!tokenApprovalTx) {
        throw new Error('buildApproveClaimAllocation returned undefined');
      }
      tokenClaimTx = azoriusTxBuilder.buildDeployTokenClaim();
      this.internalTxs.push(tokenApprovalTx);
    }

    // If subDAO, deploy Fractal Module
    if (this.parentAddress) {
      txs.push(this.deployFractalModuleTx!);
    }

    txs.push(this.buildExecInternalSafeTx(azoriusTxBuilder.signatures()));

    // token claim deployment tx is pushed at the end to ensure approval is executed first
    if (tokenClaimTx) {
      txs.push(tokenClaimTx);
    }

    return encodeMultiSend(txs);
  }

  public async buildMultisigTx(): Promise<string> {
    const multisigTxBuilder = this.txBuilderFactory.createMultiSigTxBuilder();

    this.internalTxs.push(this.buildUpdateDAONameTx());
    this.internalTxs.push(this.buildUpdateDAOSnapshotENSTx());

    // subDAO case, add freeze guard
    if (this.parentAddress) {
      const freezeGuardTxBuilder = this.txBuilderFactory.createFreezeGuardTxBuilder(
        undefined,
        undefined,
        this.parentStrategyType,
        this.parentStrategyAddress,
      );

      this.internalTxs = this.internalTxs.concat([
        // Enable Fractal Module b/c this a subDAO
        this.enableFractalModuleTx!,
        freezeGuardTxBuilder.buildDeployZodiacModuleTx(),
        freezeGuardTxBuilder.buildFreezeVotingSetupTx(),
        freezeGuardTxBuilder.buildDeployFreezeGuardTx(),
        freezeGuardTxBuilder.buildSetGuardTxSafe(this.safeContractAddress),
      ]);
    }

    this.internalTxs.push(multisigTxBuilder.buildRemoveMultiSendOwnerTx());

    const txs: SafeTransaction[] = [
      this.createSafeTx!,
      this.buildExecInternalSafeTx(multisigTxBuilder.signatures()),
    ];

    // If subDAO, deploy Fractal Module.
    if (this.parentAddress) {
      txs.splice(1, 0, this.deployFractalModuleTx!);
    }

    return encodeMultiSend(txs);
  }

  //
  // Setup Fractal Txs for use by
  // both Multisig + Azorius subDAOs
  //

  private setFractalModuleTxs(): void {
    const { enableFractalModuleTx, deployFractalModuleTx }: FractalModuleData = fractalModuleData(
      this.moduleFractalMasterCopy,
      this.zodiacModuleProxyFactory,
      this.safeContractAddress,
      this.saltNum,
      this.parentAddress,
    );

    this.enableFractalModuleTx = enableFractalModuleTx;
    this.deployFractalModuleTx = deployFractalModuleTx;
  }

  //
  // Txs shared by all DAO types
  //

  private buildUpdateDAONameTx(): SafeTransaction {
    return buildContractCall(
      abis.FractalRegistry,
      this.fractalRegistry,
      'updateDAOName',
      [this.daoData.daoName],
      0,
      false,
    );
  }

  private buildUpdateDAOSnapshotENSTx(): SafeTransaction {
    return buildContractCall(
      abis.KeyValuePairs,
      this.keyValuePairs,
      'updateValues',
      [['snapshotENS'], [this.daoData.snapshotENS]],
      0,
      false,
    );
  }

  private buildExecInternalSafeTx(signatures: string): SafeTransaction {
    const safeInternalTx = encodeMultiSend(this.internalTxs);
    return buildContractCall(
      GnosisSafeL2Abi,
      this.safeContractAddress,
      'execTransaction',
      [
        this.multiSendCallOnly, // to
        '0', // value
        encodeFunctionData({
          abi: MultiSendCallOnlyAbi,
          functionName: 'multiSend',
          args: [safeInternalTx],
        }), // calldata
        '1', // operation
        '0', // tx gas
        '0', // base gas
        '0', // gas price
        zeroAddress, // gas token
        zeroAddress, // receiver
        signatures, // sigs
      ],
      0,
      false,
    );
  }
}
