import { abis } from '@fractal-framework/fractal-contracts';
import {
  encodeAbiParameters,
  parseAbiParameters,
  Address,
  getCreate2Address,
  keccak256,
  encodePacked,
  encodeFunctionData,
} from 'viem';
import GnosisSafeL2Abi from '../../assets/abi/GnosisSafeL2';
import { buildContractCall } from '../../helpers/crypto';
import { SafeTransaction } from '../../types';
import { generateContractByteCodeLinear, generateSalt } from './utils';

export interface FractalModuleData {
  predictedFractalModuleAddress: string;
  deployFractalModuleTx: SafeTransaction;
  enableFractalModuleTx: SafeTransaction;
}

export const fractalModuleData = (
  fractalModuleMasterCopyAddress: Address,
  moduleProxyFactoryAddress: Address,
  safeAddress: Address,
  saltNum: bigint,
  parentAddress?: Address,
): FractalModuleData => {
  const fractalModuleCalldata = encodeFunctionData({
    abi: abis.FractalModule,
    functionName: 'setUp',
    args: [
      encodeAbiParameters(parseAbiParameters(['address, address, address, address[]']), [
        parentAddress ?? safeAddress, // Owner -- Parent DAO or safe contract
        safeAddress, // Avatar
        safeAddress, // Target
        [], // Authorized Controllers
      ]),
    ],
  });

  const fractalByteCodeLinear = generateContractByteCodeLinear(fractalModuleMasterCopyAddress);

  const fractalSalt = generateSalt(fractalModuleCalldata, saltNum);

  const deployFractalModuleTx = buildContractCall(
    abis.ModuleProxyFactory,
    moduleProxyFactoryAddress,
    'deployModule',
    [fractalModuleMasterCopyAddress, fractalModuleCalldata, saltNum],
    0,
    false,
  );

  const predictedFractalModuleAddress = getCreate2Address({
    from: moduleProxyFactoryAddress,
    salt: fractalSalt,
    bytecodeHash: keccak256(encodePacked(['bytes'], [fractalByteCodeLinear])),
  });

  const enableFractalModuleTx = buildContractCall(
    GnosisSafeL2Abi,
    safeAddress,
    'enableModule',
    [predictedFractalModuleAddress],
    0,
    false,
  );

  return {
    predictedFractalModuleAddress,
    deployFractalModuleTx,
    enableFractalModuleTx,
  };
};
