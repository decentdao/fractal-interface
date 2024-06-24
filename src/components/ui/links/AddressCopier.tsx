import { ButtonProps } from '@chakra-ui/react';
import { CopySimple } from '@phosphor-icons/react';
import { Address } from 'viem';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import CeleryButtonWithIcon from '../utils/CeleryButtonWithIcon';

interface AddressCopierProps extends ButtonProps {
  address: Address;
}

/**
 * A component that displays a truncated address, along with the "copy to clipboard"
 * icon to the right of it.
 */
export default function AddressCopier({ address, ...rest }: AddressCopierProps) {
  const { accountSubstring } = useDisplayName(address);
  const copyToClipboard = useCopyText();

  return (
    <CeleryButtonWithIcon
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(address);
      }}
      width="fit-content"
      {...rest}
      text={accountSubstring || address}
      icon={CopySimple}
      iconPosition="end"
    />
  );
}
