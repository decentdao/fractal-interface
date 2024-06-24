import { Address, isAddress } from 'viem';

export const decodePrefixedAddress = (address: string) => {
  const [prefix, addressWithoutPrefix] = address.split(':');
  if (!prefix || !addressWithoutPrefix) {
    throw new Error('Invalid address format');
  }
  if (!isAddress(addressWithoutPrefix)) {
    throw new Error('Invalid address');
  }
  return {
    network: prefix,
    address: addressWithoutPrefix,
  };
};

export const encodePrefixedAddress = (address: Address, network: string) => {
  return `${network}:${address}`;
};
