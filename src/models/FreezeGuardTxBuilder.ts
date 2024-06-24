import { abis } from '@fractal-framework/fractal-contracts';
import {
  getCreate2Address,
  keccak256,
  encodePacked,
  Address,
  Hex,
  encodeAbiParameters,
  parseAbiParameters,
  PublicClient,
  Abi,
  encodeFunctionData,
} from 'viem';
import GnosisSafeL2Abi from '../assets/abi/GnosisSafeL2';
import { buildContractCall } from '../helpers';
import { SafeTransaction, SubDAO, VotingStrategyType } from '../types';
import { BaseTxBuilder } from './BaseTxBuilder';
import { generateContractByteCodeLinear, generateSalt } from './helpers/utils';

export class FreezeGuardTxBuilder extends BaseTxBuilder {
  // Salt used to generate transactions
  private readonly saltNum;

  // Safe Data
  private readonly safeContractAddress: Address;

  // Freeze Voting Data
  private freezeVotingType: 'multisig' | 'erc721' | 'erc20' | undefined;
  private freezeVotingCallData: Hex | undefined;
  private freezeVotingAddress: Address | undefined;

  // Freeze Guard Data
  private freezeGuardCallData: Hex | undefined;
  private freezeGuardAddress: Address | undefined;

  // Azorius Data
  private azoriusAddress: Address | undefined;
  private strategyAddress: Address | undefined;

  private parentStrategyType: VotingStrategyType | undefined;
  private parentStrategyAddress: Address | undefined;

  private zodiacModuleProxyFactory: Address;
  private freezeGuardAzoriusMasterCopy: Address;
  private freezeGuardMultisigMasterCopy: Address;
  private freezeVotingErc20MasterCopy: Address;
  private freezeVotingErc721MasterCopy: Address;
  private freezeVotingMultisigMasterCopy: Address;

  constructor(
    publicClient: PublicClient,
    daoData: SubDAO,
    safeContractAddress: Address,
    saltNum: bigint,
    parentAddress: Address,

    zodiacModuleProxyFactory: Address,
    freezeGuardAzoriusMasterCopy: Address,
    freezeGuardMultisigMasterCopy: Address,
    freezeVotingErc20MasterCopy: Address,
    freezeVotingErc721MasterCopy: Address,
    freezeVotingMultisigMasterCopy: Address,

    isAzorius: boolean,
    parentTokenAddress?: Address,
    azoriusAddress?: Address,
    strategyAddress?: Address,
    parentStrategyType?: VotingStrategyType,
    parentStrategyAddress?: Address,
  ) {
    super(publicClient, isAzorius, daoData, parentAddress, parentTokenAddress);

    this.safeContractAddress = safeContractAddress;
    this.saltNum = saltNum;
    this.azoriusAddress = azoriusAddress;
    this.strategyAddress = strategyAddress;
    this.parentStrategyType = parentStrategyType;
    this.parentStrategyAddress = parentStrategyAddress;
    this.zodiacModuleProxyFactory = zodiacModuleProxyFactory;
    this.freezeGuardAzoriusMasterCopy = freezeGuardAzoriusMasterCopy;
    this.freezeGuardMultisigMasterCopy = freezeGuardMultisigMasterCopy;
    this.freezeVotingErc20MasterCopy = freezeVotingErc20MasterCopy;
    this.freezeVotingErc721MasterCopy = freezeVotingErc721MasterCopy;
    this.freezeVotingMultisigMasterCopy = freezeVotingMultisigMasterCopy;

    this.initFreezeVotesData();
  }

  initFreezeVotesData() {
    this.setFreezeVotingTypeAndCallData();
    this.setFreezeVotingAddress();
    this.setFreezeGuardData();
    this.setFreezeGuardAddress();
  }

  public buildDeployZodiacModuleTx(): SafeTransaction {
    return buildContractCall(
      abis.ModuleProxyFactory,
      this.zodiacModuleProxyFactory,
      'deployModule',
      [
        this.freezeVotingType === 'erc20'
          ? this.freezeVotingErc20MasterCopy
          : this.freezeVotingType === 'erc721'
            ? this.freezeVotingErc721MasterCopy
            : this.freezeVotingMultisigMasterCopy,
        this.freezeVotingCallData,
        this.saltNum,
      ],
      0,
      false,
    );
  }

  public buildFreezeVotingSetupTx(): SafeTransaction {
    const subDaoData = this.daoData as SubDAO;

    const parentStrategyAddress =
      this.parentStrategyType === VotingStrategyType.LINEAR_ERC721
        ? this.parentStrategyAddress
        : this.parentTokenAddress ?? this.parentAddress;
    if (!this.parentAddress || !parentStrategyAddress || !this.freezeVotingAddress) {
      throw new Error(
        'Error building contract call for setting up freeze voting - required addresses were not provided.',
      );
    }

    const functionArgs: [string, [string], number, boolean] = [
      'setUp',
      [
        encodeAbiParameters(parseAbiParameters('address, uint256, uint32, uint32, address'), [
          this.parentAddress, // Owner -- Parent DAO
          subDaoData.freezeVotesThreshold, // FreezeVotesThreshold
          Number(subDaoData.freezeProposalPeriod), // FreezeProposalPeriod
          Number(subDaoData.freezePeriod), // FreezePeriod
          parentStrategyAddress, // Parent Votes Token or Parent Safe Address
        ]),
      ],
      0,
      false,
    ];

    if (this.freezeVotingType === 'erc20') {
      return buildContractCall(abis.ERC20FreezeVoting, this.freezeVotingAddress, ...functionArgs);
    } else if (this.freezeVotingType === 'erc721') {
      return buildContractCall(abis.ERC721FreezeVoting, this.freezeVotingAddress, ...functionArgs);
    } else if (this.freezeVotingType === 'multisig') {
      return buildContractCall(
        abis.MultisigFreezeVoting,
        this.freezeVotingAddress,
        ...functionArgs,
      );
    } else {
      throw new Error('unsupported freeze voting type');
    }
  }

  public buildSetGuardTx(abi: Abi, address: Address): SafeTransaction {
    return buildContractCall(abi, address, 'setGuard', [this.freezeGuardAddress], 0, false);
  }

  public buildSetGuardTxSafe(safeAddress: Address): SafeTransaction {
    return buildContractCall(
      GnosisSafeL2Abi,
      safeAddress,
      'setGuard',
      [this.freezeGuardAddress],
      0,
      false,
    );
  }

  public buildDeployFreezeGuardTx() {
    return buildContractCall(
      abis.ModuleProxyFactory,
      this.zodiacModuleProxyFactory,
      'deployModule',
      [this.getGuardMasterCopyAddress(), this.freezeGuardCallData!, this.saltNum],
      0,
      false,
    );
  }

  /**
   * Methods to generate freeze voting and guard addresses
   * As well as calldata needed to create deploy Txs
   */

  private setFreezeVotingTypeAndCallData() {
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        this.freezeVotingType = 'erc20';
        this.freezeVotingCallData = encodeFunctionData({
          abi: abis.ERC20FreezeVoting,
          functionName: 'owner',
        });
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        this.freezeVotingType = 'erc721';
        this.freezeVotingCallData = encodeFunctionData({
          abi: abis.ERC721FreezeVoting,
          functionName: 'owner',
        });
      }
    } else {
      this.freezeVotingType = 'multisig';
      this.freezeVotingCallData = encodeFunctionData({
        abi: abis.MultisigFreezeVoting,
        functionName: 'owner',
      });
    }
  }

  private setFreezeVotingAddress() {
    let freezeVotingByteCodeLinear: Hex;
    if (this.parentStrategyType) {
      if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC20) {
        freezeVotingByteCodeLinear = generateContractByteCodeLinear(
          this.freezeVotingErc20MasterCopy,
        );
      } else if (this.parentStrategyType === VotingStrategyType.LINEAR_ERC721) {
        freezeVotingByteCodeLinear = generateContractByteCodeLinear(
          this.freezeVotingErc721MasterCopy,
        );
      } else {
        throw new Error('unknown voting parentStrategyType');
      }
    } else {
      freezeVotingByteCodeLinear = generateContractByteCodeLinear(
        this.freezeVotingMultisigMasterCopy,
      );
    }

    this.freezeVotingAddress = getCreate2Address({
      from: this.zodiacModuleProxyFactory,
      salt: generateSalt(this.freezeVotingCallData!, this.saltNum),
      bytecodeHash: keccak256(encodePacked(['bytes'], [freezeVotingByteCodeLinear])),
    });
  }

  private setFreezeGuardAddress() {
    const freezeGuardByteCodeLinear = generateContractByteCodeLinear(
      this.getGuardMasterCopyAddress(),
    );
    const freezeGuardSalt = generateSalt(this.freezeGuardCallData!, this.saltNum);

    this.freezeGuardAddress = getCreate2Address({
      from: this.zodiacModuleProxyFactory,
      salt: freezeGuardSalt,
      bytecodeHash: keccak256(encodePacked(['bytes'], [freezeGuardByteCodeLinear])),
    });
  }

  private setFreezeGuardData() {
    if (this.azoriusAddress) {
      this.setFreezeGuardCallDataAzorius();
    } else {
      this.setFreezeGuardCallDataMultisig();
    }
  }

  private setFreezeGuardCallDataMultisig() {
    const subDaoData = this.daoData as SubDAO;

    if (!this.parentAddress || !this.freezeVotingAddress) {
      throw new Error(
        'Error encoding freeze guard call data - parent address or freeze voting address not provided',
      );
    }

    const freezeGuardCallData = encodeFunctionData({
      abi: abis.MultisigFreezeGuard,
      functionName: 'setUp',
      args: [
        encodeAbiParameters(parseAbiParameters('uint32, uint32, address, address, address'), [
          Number(subDaoData.timelockPeriod), // Timelock Period
          Number(subDaoData.executionPeriod), // Execution Period
          this.parentAddress, // Owner -- Parent DAO
          this.freezeVotingAddress, // Freeze Voting
          this.safeContractAddress, // Safe
        ]),
      ],
    });

    this.freezeGuardCallData = freezeGuardCallData;
  }

  private setFreezeGuardCallDataAzorius() {
    if (
      !this.parentAddress ||
      !this.freezeVotingAddress ||
      !this.strategyAddress ||
      !this.azoriusAddress
    ) {
      throw new Error(
        'Error encoding freeze guard call data - required addresses were not provided',
      );
    }

    const freezeGuardCallData = encodeFunctionData({
      abi: abis.AzoriusFreezeGuard,
      functionName: 'setUp',
      args: [
        encodeAbiParameters(parseAbiParameters('address, address'), [
          this.parentAddress, // Owner -- Parent DAO
          this.freezeVotingAddress, // Freeze Voting
        ]),
      ],
    });

    this.freezeGuardCallData = freezeGuardCallData;
  }

  private getGuardMasterCopyAddress() {
    return this.isAzorius ? this.freezeGuardAzoriusMasterCopy : this.freezeGuardMultisigMasterCopy;
  }
}
