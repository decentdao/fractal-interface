import { Box, Button, MenuItem, Text } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDAOName from '../../../../hooks/DAO/useDAOName';
import { useFractal } from '../../../../providers/App/AppProvider';

export interface SafeMenuItemProps {
  network: string;
  address: string;
  showAddress?: boolean;
  onClick?: () => void;
}

export function SafeMenuItem({ network, address }: SafeMenuItemProps) {
  const { daoRegistryName } = useDAOName({ address });
  const { action } = useFractal();
  const navigate = useNavigate();

  const { t } = useTranslation('dashboard');

  const onClickNav = () => {
    // TODO is this needed here?
    action.resetDAO();

    navigate(DAO_ROUTES.dao.relative(network, address));
  };

  return (
    <Box>
      <MenuItem
        as={Button}
        variant="tertiary"
        w="full"
        h="3rem"
        onClick={onClickNav}
        noOfLines={1}
        data-testid={'favorites-' + daoRegistryName}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
      >
        <Star
          size="1.5rem"
          weight="fill"
        />

        <Text color={daoRegistryName ? 'white-0' : 'neutral-6'}>
          {daoRegistryName ?? t('loadingFavorite')}
        </Text>
      </MenuItem>
    </Box>
  );
}