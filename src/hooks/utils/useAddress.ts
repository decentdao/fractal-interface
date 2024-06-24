import { useEffect, useState } from 'react';
import { Address, isAddress } from 'viem';
import { normalize } from 'viem/ens';
import { usePublicClient } from 'wagmi';

const useAddress = (addressInput: string) => {
  const publicClient = usePublicClient();
  const [address, setAddress] = useState<Address>();
  const [isValid, setIsValid] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setAddress(undefined);
    setIsValid(undefined);
    setIsLoading(false);

    if (addressInput === '') {
      return;
    }

    setIsLoading(true);

    if (isAddress(addressInput)) {
      setAddress(addressInput);
      setIsValid(true);
      setIsLoading(false);
      return;
    }

    if (!publicClient) {
      setAddress(undefined);
      setIsValid(undefined);
      setIsLoading(false);
      return;
    }

    publicClient
      .getEnsAddress({ name: normalize(addressInput) })
      .then(resolvedAddress => {
        if (resolvedAddress) {
          setAddress(resolvedAddress);
          setIsValid(true);
        } else {
          setAddress(undefined);
          setIsValid(false);
        }
      })
      .catch(() => {
        setAddress(undefined);
        setIsValid(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addressInput, publicClient]);

  return { address, isValid, isLoading };
};

export default useAddress;
