import { Box, Button, Flex, Icon, IconButton, Spacer, Text } from '@chakra-ui/react';
import { Icon as PhosphorIcon } from '@phosphor-icons/react';
import { ReactNode, useEffect, useState } from 'react';
import { Address } from 'viem';
import { CONTENT_MAXW } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import AddressCopier from '../../links/AddressCopier';
import Divider from '../../utils/Divider';
import Breadcrumbs, { Crumb } from './Breadcrumbs';
interface PageHeaderProps {
  title?: string;
  address?: Address;
  breadcrumbs: Crumb[];
  hasDAOLink?: boolean;
  buttonVariant?: 'text' | 'secondary';
  ButtonIcon?: PhosphorIcon;
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
  isButtonDisabled?: boolean;
  children?: ReactNode;
}
/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  title,
  address,
  breadcrumbs,
  hasDAOLink = true,
  buttonVariant,
  ButtonIcon,
  buttonText,
  buttonClick,
  buttonTestId,
  isButtonDisabled,
  children,
}: PageHeaderProps) {
  const {
    node: { daoAddress, daoName },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const [links, setLinks] = useState([...breadcrumbs]);

  useEffect(() => {
    if (hasDAOLink && daoAddress) {
      setLinks([
        {
          terminus: daoName || (daoAddress && createAccountSubstring(daoAddress)) || '',
          path: DAO_ROUTES.dao.relative(addressPrefix, daoAddress),
        },
        ...breadcrumbs,
      ]);
    }
  }, [hasDAOLink, daoName, daoAddress, breadcrumbs, addressPrefix]);

  const showAction = !!buttonText || !!ButtonIcon || !!children;

  return (
    <Box
      marginTop="3rem"
      marginBottom="1.5rem"
      maxW={CONTENT_MAXW}
    >
      <Flex
        alignItems="center"
        gap={{ base: 1, sm: 4 }}
        w="full"
      >
        <Breadcrumbs
          links={links}
          w={!showAction ? { base: 'full', sm: 'full' } : undefined}
        />
        {showAction && (
          <>
            <Spacer />
            {buttonText && (
              <Button
                onClick={buttonClick}
                data-testid={buttonTestId}
                variant={buttonVariant}
                isDisabled={isButtonDisabled}
              >
                {buttonText}
              </Button>
            )}
            {ButtonIcon && (
              <IconButton
                aria-label="navigate"
                icon={
                  <Icon
                    boxSize="1.25rem"
                    as={ButtonIcon}
                  />
                }
                onClick={buttonClick}
                variant="tertiary"
                size="icon-sm"
                data-testid={buttonTestId}
                isDisabled={isButtonDisabled}
                as={Button}
              >
                {buttonText}
              </IconButton>
            )}
            {children}
          </>
        )}
      </Flex>
      <Divider
        variant="darker"
        mt="1rem"
      />
      {title && (
        <Text
          marginTop="2rem"
          textStyle="display-2xl"
          color="white-0"
        >
          {title}
        </Text>
      )}
      {address && (
        <AddressCopier
          marginTop="0.5rem"
          address={address}
          display="inline-flex"
        />
      )}
    </Box>
  );
}
export default PageHeader;
