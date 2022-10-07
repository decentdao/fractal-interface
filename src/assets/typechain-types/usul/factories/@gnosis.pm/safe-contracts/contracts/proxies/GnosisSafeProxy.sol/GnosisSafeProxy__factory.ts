/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../../common";
import type {
  GnosisSafeProxy,
  GnosisSafeProxyInterface,
} from "../../../../../../@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol/GnosisSafeProxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_singleton",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516102d43803806102d4833981810160405281019061003291906100fd565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100a2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100999061014d565b60405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061021b565b6000815190506100f781610204565b92915050565b600060208284031215610113576101126101b0565b5b6000610121848285016100e8565b91505092915050565b600061013760228361016d565b9150610142826101b5565b604082019050919050565b600060208201905081810360008301526101668161012a565b9050919050565b600082825260208201905092915050565b600061018982610190565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600080fd5b7f496e76616c69642073696e676c65746f6e20616464726573732070726f76696460008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b61020d8161017e565b811461021857600080fd5b50565b60ab806102296000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220947a2711a30de0a675858b6b570c8cbc1c80a779f44ff1fe058c651a55fa146d64736f6c63430008060033";

type GnosisSafeProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GnosisSafeProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GnosisSafeProxy__factory extends ContractFactory {
  constructor(...args: GnosisSafeProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _singleton: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<GnosisSafeProxy> {
    return super.deploy(
      _singleton,
      overrides || {}
    ) as Promise<GnosisSafeProxy>;
  }
  override getDeployTransaction(
    _singleton: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_singleton, overrides || {});
  }
  override attach(address: string): GnosisSafeProxy {
    return super.attach(address) as GnosisSafeProxy;
  }
  override connect(signer: Signer): GnosisSafeProxy__factory {
    return super.connect(signer) as GnosisSafeProxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GnosisSafeProxyInterface {
    return new utils.Interface(_abi) as GnosisSafeProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GnosisSafeProxy {
    return new Contract(address, _abi, signerOrProvider) as GnosisSafeProxy;
  }
}
