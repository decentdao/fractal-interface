import { Address, Hash, keccak256, encodePacked } from 'viem';

/**
 * These hardcoded values were taken from
 * @link https://github.com/gnosis/module-factory/blob/master/contracts/ModuleProxyFactory.sol
 */
export const generateContractByteCodeLinear = (contractAddress: Address): Hash => {
  return `0x602d8060093d393df3363d3d373d3d3d363d73${contractAddress.slice(2)}5af43d82803e903d91602b57fd5bf3`;
};

export const generateSalt = (calldata: Hash, saltNum: bigint): Hash => {
  return keccak256(
    encodePacked(['bytes32', 'uint256'], [keccak256(encodePacked(['bytes'], [calldata])), saltNum]),
  );
};
