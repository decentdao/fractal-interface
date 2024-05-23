/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  ModuleManager,
  ModuleManagerInterface,
} from "../../../../../@gnosis.pm/safe-contracts/contracts/base/ModuleManager";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "DisabledModule",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "EnabledModule",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "ExecutionFromModuleFailure",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "ExecutionFromModuleSuccess",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "prevModule",
        type: "address",
      },
      {
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "disableModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "enableModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
    ],
    name: "execTransactionFromModule",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "enum Enum.Operation",
        name: "operation",
        type: "uint8",
      },
    ],
    name: "execTransactionFromModuleReturnData",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "returnData",
        type: "bytes",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "start",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "pageSize",
        type: "uint256",
      },
    ],
    name: "getModulesPaginated",
    outputs: [
      {
        internalType: "address[]",
        name: "array",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "next",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "module",
        type: "address",
      },
    ],
    name: "isModuleEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611588806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80632d9ad53d14610067578063468721a7146100975780635229073f146100c7578063610b5925146100f8578063cc2f845214610114578063e009cfde14610145575b600080fd5b610081600480360381019061007c9190610db5565b610161565b60405161008e91906110bb565b60405180910390f35b6100b160048036038101906100ac9190610e62565b610232565b6040516100be91906110bb565b60405180910390f35b6100e160048036038101906100dc9190610e62565b6103e4565b6040516100ef9291906110d6565b60405180910390f35b610112600480360381019061010d9190610db5565b61041a565b005b61012e60048036038101906101299190610e22565b61072c565b60405161013c92919061108b565b60405180910390f35b61015f600480360381019061015a9190610de2565b61092b565b005b60008173ffffffffffffffffffffffffffffffffffffffff16600173ffffffffffffffffffffffffffffffffffffffff161415801561022b5750600073ffffffffffffffffffffffffffffffffffffffff166000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b9050919050565b6000600173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141580156102fc5750600073ffffffffffffffffffffffffffffffffffffffff166000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614155b61033b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161033290611126565b60405180910390fd5b610348858585855a610c3c565b90508015610398573373ffffffffffffffffffffffffffffffffffffffff167f6895c13664aa4f67288b25d7a21d7aaa34916e355fb9b6fae0a139a9085becb860405160405180910390a26103dc565b3373ffffffffffffffffffffffffffffffffffffffff167facd2c8702804128fdb0db2bb49f6d127dd0181c13fd45dbfe16de0930e2bd37560405160405180910390a25b949350505050565b600060606103f486868686610232565b915060405160203d0181016040523d81523d6000602083013e8091505094509492505050565b610422610c96565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415801561048c5750600173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614155b6104cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104c290611186565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610598576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161058f90611166565b60405180910390fd5b600080600173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600080600173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507fecdf3a3effea5783a3c4c2140e677577666428d44ed9d474a0b3a4c9943f8440816040516107219190611070565b60405180910390a150565b606060008267ffffffffffffffff81111561074a576107496113f3565b5b6040519080825280602002602001820160405280156107785781602001602082028036833780820191505090505b5091506000808060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415801561084a5750600173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614155b801561085557508482105b1561091c578084838151811061086e5761086d6113c4565b5b602002602001019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff16815250506000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081806109149061131d565b9250506107e0565b80925081845250509250929050565b610933610c96565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415801561099d5750600173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614155b6109dc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109d390611186565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff166000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614610aa8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a9f90611106565b60405180910390fd5b6000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507faab4fa2b463f581b2b32cb3b7e3b704b9ce37cc209b5fb4d77e593ace405427681604051610c309190611070565b60405180910390a15050565b6000600180811115610c5157610c50611395565b5b836001811115610c6457610c63611395565b5b1415610c7d576000808551602087018986f49050610c8d565b600080855160208701888a87f190505b95945050505050565b3073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610d04576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cfb90611146565b60405180910390fd5b565b6000610d19610d14846111cb565b6111a6565b905082815260208101848484011115610d3557610d34611427565b5b610d408482856112aa565b509392505050565b600081359050610d5781611514565b92915050565b600082601f830112610d7257610d71611422565b5b8135610d82848260208601610d06565b91505092915050565b600081359050610d9a8161152b565b92915050565b600081359050610daf8161153b565b92915050565b600060208284031215610dcb57610dca611431565b5b6000610dd984828501610d48565b91505092915050565b60008060408385031215610df957610df8611431565b5b6000610e0785828601610d48565b9250506020610e1885828601610d48565b9150509250929050565b60008060408385031215610e3957610e38611431565b5b6000610e4785828601610d48565b9250506020610e5885828601610da0565b9150509250929050565b60008060008060808587031215610e7c57610e7b611431565b5b6000610e8a87828801610d48565b9450506020610e9b87828801610da0565b935050604085013567ffffffffffffffff811115610ebc57610ebb61142c565b5b610ec887828801610d5d565b9250506060610ed987828801610d8b565b91505092959194509250565b6000610ef18383610efd565b60208301905092915050565b610f0681611262565b82525050565b610f1581611262565b82525050565b6000610f268261120c565b610f30818561122f565b9350610f3b836111fc565b8060005b83811015610f6c578151610f538882610ee5565b9750610f5e83611222565b925050600181019050610f3f565b5085935050505092915050565b610f8281611274565b82525050565b6000610f9382611217565b610f9d8185611240565b9350610fad8185602086016112b9565b610fb681611436565b840191505092915050565b6000610fce600583611251565b9150610fd982611447565b602082019050919050565b6000610ff1600583611251565b9150610ffc82611470565b602082019050919050565b6000611014600583611251565b915061101f82611499565b602082019050919050565b6000611037600583611251565b9150611042826114c2565b602082019050919050565b600061105a600583611251565b9150611065826114eb565b602082019050919050565b60006020820190506110856000830184610f0c565b92915050565b600060408201905081810360008301526110a58185610f1b565b90506110b46020830184610f0c565b9392505050565b60006020820190506110d06000830184610f79565b92915050565b60006040820190506110eb6000830185610f79565b81810360208301526110fd8184610f88565b90509392505050565b6000602082019050818103600083015261111f81610fc1565b9050919050565b6000602082019050818103600083015261113f81610fe4565b9050919050565b6000602082019050818103600083015261115f81611007565b9050919050565b6000602082019050818103600083015261117f8161102a565b9050919050565b6000602082019050818103600083015261119f8161104d565b9050919050565b60006111b06111c1565b90506111bc82826112ec565b919050565b6000604051905090565b600067ffffffffffffffff8211156111e6576111e56113f3565b5b6111ef82611436565b9050602081019050919050565b6000819050602082019050919050565b600081519050919050565b600081519050919050565b6000602082019050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600061126d82611280565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b838110156112d75780820151818401526020810190506112bc565b838111156112e6576000848401525b50505050565b6112f582611436565b810181811067ffffffffffffffff82111715611314576113136113f3565b5b80604052505050565b6000611328826112a0565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561135b5761135a611366565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4753313033000000000000000000000000000000000000000000000000000000600082015250565b7f4753313034000000000000000000000000000000000000000000000000000000600082015250565b7f4753303331000000000000000000000000000000000000000000000000000000600082015250565b7f4753313032000000000000000000000000000000000000000000000000000000600082015250565b7f4753313031000000000000000000000000000000000000000000000000000000600082015250565b61151d81611262565b811461152857600080fd5b50565b6002811061153857600080fd5b50565b611544816112a0565b811461154f57600080fd5b5056fea26469706673582212206c856797e0231443cfad56fc27b9c42c92c3f0331574afa19316ee7533063a4f64736f6c63430008060033";

type ModuleManagerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ModuleManagerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ModuleManager__factory extends ContractFactory {
  constructor(...args: ModuleManagerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ModuleManager> {
    return super.deploy(overrides || {}) as Promise<ModuleManager>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ModuleManager {
    return super.attach(address) as ModuleManager;
  }
  override connect(signer: Signer): ModuleManager__factory {
    return super.connect(signer) as ModuleManager__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ModuleManagerInterface {
    return new utils.Interface(_abi) as ModuleManagerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ModuleManager {
    return new Contract(address, _abi, signerOrProvider) as ModuleManager;
  }
}