import { Box, BoxProps, Button, Tooltip, Icon, IconButton } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { useAccountFavorites } from '../../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';

interface Props extends BoxProps {
  safeAddress: Address;
}

export function FavoriteIcon({ safeAddress, ...rest }: Props) {
  const { favoritesList, toggleFavorite } = useAccountFavorites();
  const { addressPrefix } = useNetworkConfig();
  const isFavorite = useMemo(
    () => (!!safeAddress ? favoritesList.includes(`${addressPrefix}:${safeAddress}`) : false),
    [favoritesList, safeAddress, addressPrefix],
  );
  const { t } = useTranslation();
  return (
    <Box {...rest}>
      <Tooltip label={t('favoriteTooltip')}>
        <Button
          variant="tertiary"
          size="icon-md"
          as={IconButton}
          icon={
            <Icon
              as={Star}
              boxSize="1.25rem"
              weight={isFavorite ? 'fill' : 'regular'}
            />
          }
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            toggleFavorite(safeAddress);
          }}
          aria-label={t('favoriteTooltip')}
        />
      </Tooltip>
    </Box>
  );
}
