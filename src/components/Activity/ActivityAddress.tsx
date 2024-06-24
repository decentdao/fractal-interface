import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import useDisplayName from '../../hooks/utils/useDisplayName';
import EtherscanLink from '../ui/links/EtherscanLink';

export function ActivityAddress({
  address,
  isMe = false,
  addComma,
}: {
  address: Address;
  isMe?: boolean;
  addComma?: boolean;
}) {
  const { displayName } = useDisplayName(address);
  const { t } = useTranslation();
  return (
    <EtherscanLink
      type="address"
      value={address}
    >
      <Text w="full">
        {displayName}
        {isMe && t('isMeSuffix')}
        {addComma && ', '}
      </Text>
    </EtherscanLink>
  );
}
