import { Flex, Text, Icon, LinkProps } from '@chakra-ui/react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { Address } from 'viem';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import EtherscanLink from './EtherscanLink';

export function DisplayAddress({
  address,
  truncate,
  children,
  isTextLink,
  ...rest
}: {
  address: Address;
  truncate?: boolean;
  isTextLink?: boolean;
  children?: ReactNode;
} & LinkProps) {
  const displayAddress = useDisplayName(address, truncate);
  return (
    <EtherscanLink
      {...rest}
      isTextLink
      type="address"
      value={address}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        minW="fit-content"
      >
        <Text
          as="span"
          isTruncated
        >
          {children || displayAddress.displayName}
        </Text>
        {!isTextLink && (
          <Icon
            as={ArrowUpRight}
            mt="0.15rem"
            ml="0.5rem"
          />
        )}
      </Flex>
    </EtherscanLink>
  );
}
