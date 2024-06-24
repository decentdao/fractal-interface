import { useMemo, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublicClient, isAddress } from 'viem';
import { normalize } from 'viem/ens';
import { usePublicClient } from 'wagmi';
import { AnyObject } from 'yup';
import { useFractal } from '../../../providers/App/AppProvider';
import { AddressValidationMap, ERC721TokenConfig } from '../../../types';
import { validateENSName } from '../../../utils/url';

export async function validateAddress({
  publicClient,
  address,
  checkENS = true,
}: {
  publicClient: PublicClient;
  address: string;
  checkENS?: boolean;
}) {
  if (checkENS) {
    const resolvedAddress = await publicClient.getEnsAddress({ name: normalize(address) });
    if (resolvedAddress) {
      return {
        validation: {
          address: resolvedAddress,
          isValidAddress: true,
        },
        isValid: false,
      };
    } else {
      return {
        validation: {
          address: '',
          isValidAddress: false,
        },
        isValid: false,
      };
    }
  }
  const isValidAddress = isAddress(address);
  if (isValidAddress) {
    return {
      validation: {
        address,
        isValidAddress,
      },
      isValid: true,
    };
  } else {
    return {
      validation: {
        address: '',
        isValidAddress,
      },
      isValid: false,
    };
  }
}

export const useValidationAddress = () => {
  /**
   * addressValidationMap
   * @description holds ENS resolved addresses
   * @dev updated via the `addressValidation`
   * @dev this is used for any other functions contained within this hook, to lookup resolved addresses in this session without requesting again.
   */
  const addressValidationMap = useRef<AddressValidationMap>(new Map());
  // const signer = useEthersSigner();
  // const signerOrProvider = useSignerOrProvider();
  const { t } = useTranslation(['daoCreate', 'common', 'modals']);
  const {
    node: { safe },
  } = useFractal();

  const publicClient = usePublicClient();

  const [isValidating, setIsValidating] = useState(false);

  const addressValidationTest = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address || !publicClient) return false;
        setIsValidating(true);
        const { validation } = await validateAddress({ publicClient, address });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        setIsValidating(false);
        return validation.isValidAddress;
      },
    };
  }, [publicClient, addressValidationMap, t]);

  const ensNameValidationTest = useMemo(() => {
    return {
      name: 'ENS Validation',
      message: t('errorInvalidENSName', { ns: 'common' }),
      test: async function (ensName: string | undefined) {
        if (ensName === undefined) return true;
        const isValid = validateENSName(ensName);
        return isValid;
      },
    };
  }, [t]);

  const addressValidationTestSimple = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address || !publicClient) return false;
        setIsValidating(true);
        const { validation } = await validateAddress({
          publicClient,
          address,
          checkENS: false,
        });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        setIsValidating(false);
        return validation.isValidAddress;
      },
    };
  }, [publicClient, addressValidationMap, t]);

  const newSignerValidationTest = useMemo(() => {
    return {
      name: 'New Signer Validation',
      message: t('alreadySigner', { ns: 'modals' }),
      test: async function (address: string | undefined) {
        if (!address || !safe || !publicClient) return false;
        const check = await publicClient.getEnsAddress({ name: normalize(address) });
        address = check ? check : undefined;
        if (!address) return false;
        return !safe.owners.includes(address);
      },
    };
  }, [safe, publicClient, t]);

  const testUniqueAddressArray = useCallback(
    async (value: string, addressArray: string[]) => {
      // looks up tested value
      let inputValidation = addressValidationMap.current.get(value);
      if (!!value && !inputValidation && publicClient) {
        inputValidation = (await validateAddress({ publicClient, address: value })).validation;
      }
      // converts all inputs to addresses to compare
      // uses addressValidationMap to save on requests
      const resolvedAddresses: string[] = await Promise.all(
        addressArray.map(async (address: string) => {
          // look up validated values
          const addressValidation = addressValidationMap.current.get(address);
          if (addressValidation && addressValidation.isValidAddress) {
            return addressValidation.address;
          }
          // because mapping is not 'state', this catches values that may not be resolved yet
          if (normalize(address) && publicClient) {
            const { validation } = await validateAddress({ publicClient, address });
            return validation.address;
          }
          return address;
        }),
      );

      const uniqueFilter = resolvedAddresses.filter(
        address => address === value || address === inputValidation?.address,
      );

      return uniqueFilter.length === 1;
    },
    [publicClient],
  );

  const uniqueAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Addresses',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.parent;
        const isUnique = await testUniqueAddressArray(value, parentAddressArray);
        return isUnique;
      },
    };
  }, [t, testUniqueAddressArray]);

  const uniqueNFTAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Address',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.from[1].value.nfts.map(
          ({ tokenAddress }: ERC721TokenConfig) => tokenAddress,
        );
        const isUnique = await testUniqueAddressArray(value, parentAddressArray);
        return isUnique;
      },
    };
  }, [t, testUniqueAddressArray]);

  return {
    addressValidationTestSimple,
    addressValidationTest,
    ensNameValidationTest,
    newSignerValidationTest,
    uniqueAddressValidationTest,
    uniqueNFTAddressValidationTest,
    isValidating,
  };
};
