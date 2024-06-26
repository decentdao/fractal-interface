import { MenuList } from '@chakra-ui/react';
import { Link, Plugs } from '@phosphor-icons/react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisconnect } from 'wagmi';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import Divider from '../../utils/Divider';
import { ConnectedWalletMenuItem } from './ConnectedWalletMenuItem';
import { MenuItemButton } from './MenuItemButton';
import { NetworkSelector } from './NetworkSelector';

export function WalletMenu({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const {
    readOnly: { user },
  } = useFractal();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const { t } = useTranslation('menu');

  return (
    <MenuList
      minW="15.25rem"
      rounded="0.5rem"
      bg={NEUTRAL_2_82_TRANSPARENT}
      backdropFilter="auto"
      backdropBlur="10px"
      border="1px solid"
      borderColor="neutral-3"
      zIndex={1}
      py="0.25rem"
    >
      {user.address && (
        <>
          <ConnectedWalletMenuItem />
          <Divider my="0.25rem" />
        </>
      )}
      <NetworkSelector containerRef={containerRef} />
      <Divider my="0.25rem" />
      {!user.address && (
        <MenuItemButton
          testId="accountMenu-connect"
          label={t('connect')}
          Icon={Link}
          onClick={() => open()}
        />
      )}
      {user.address && (
        <MenuItemButton
          testId="accountMenu-disconnect"
          label={t('disconnect')}
          Icon={Plugs}
          onClick={disconnect}
        />
      )}
    </MenuList>
  );
}
