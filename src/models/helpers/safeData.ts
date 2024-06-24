import {
  getCreate2Address,
  zeroAddress,
  zeroHash,
  keccak256,
  encodePacked,
  encodeFunctionData,
  isHex,
  hexToBigInt,
  GetContractReturnType,
  PublicClient,
  Address,
} from 'viem';
import GnosisSafeL2Abi from '../../assets/abi/GnosisSafeL2';
import GnosisSafeProxyFactoryAbi from '../../assets/abi/GnosisSafeProxyFactory';
import { buildContractCall } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';

export const safeData = async (
  multiSendCallOnlyAddress: Address,
  safeFactoryContract: GetContractReturnType<typeof GnosisSafeProxyFactoryAbi, PublicClient>,
  safeSingletonContract: GetContractReturnType<typeof GnosisSafeL2Abi, PublicClient>,
  daoData: SafeMultisigDAO,
  saltNum: bigint,
  fallbackHandler: Address,
  hasAzorius: boolean,
) => {
  const signers = hasAzorius
    ? [multiSendCallOnlyAddress]
    : [...daoData.trustedAddresses, multiSendCallOnlyAddress];

  const createSafeCalldata = encodeFunctionData({
    functionName: 'setup',
    args: [
      signers,
      1n, // Threshold
      zeroAddress,
      zeroHash,
      fallbackHandler,
      zeroAddress,
      0n,
      zeroAddress,
    ],
    abi: GnosisSafeL2Abi,
  });

  const safeFactoryContractProxyCreationCode = await safeFactoryContract.read.proxyCreationCode();
  if (!isHex(safeFactoryContractProxyCreationCode)) {
    throw new Error('Error retrieving proxy creation code from Safe Factory Contract ');
  }

  const predictedSafeAddress = getCreate2Address({
    from: safeFactoryContract.address,
    salt: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [keccak256(encodePacked(['bytes'], [createSafeCalldata])), saltNum],
      ),
    ),
    bytecodeHash: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [safeFactoryContractProxyCreationCode, hexToBigInt(safeSingletonContract.address)],
      ),
    ),
  });

  const createSafeTx = buildContractCall(
    GnosisSafeProxyFactoryAbi,
    safeFactoryContract.address,
    'createProxyWithNonce',
    [safeSingletonContract.address, createSafeCalldata, saltNum],
    0,
    false,
  );

  return {
    predictedSafeAddress,
    createSafeTx,
  };
};
