import { Box, Flex, Hide } from '@chakra-ui/react';
import {
  House,
  GitFork,
  Scroll,
  Coins,
  SquaresFour,
  Question,
  DiscordLogo,
  BookOpen,
  UsersThree,
} from '@phosphor-icons/react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import Divider from '../../utils/Divider';
import { NavigationLink } from './NavigationLink';

function ExternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Box
      mb={6}
      mt={{ base: 0, md: 6 }}
      maxWidth={{ md: 12, '3xl': '100%' }}
      _hover={{ maxWidth: '100%' }}
      transitionDuration="0.2s"
      width={{ base: 'full', md: 'auto' }}
      borderRadius={{ md: 8 }}
      borderWidth={{ md: 1 }}
      borderColor={{ md: 'neutral-3' }}
      bg={{ md: 'neutral-2' }}
      overflow={{ md: 'hidden' }}
    >
      <NavigationLink
        href={URL_FAQ}
        labelKey="faq"
        testId="navigationExternal-faq"
        NavigationIcon={Question}
        scope="external"
        closeDrawer={closeDrawer}
      />
      <NavigationLink
        href={URL_DISCORD}
        labelKey="discord"
        testId="navigationExternal-discord"
        NavigationIcon={DiscordLogo}
        scope="external"
        closeDrawer={closeDrawer}
      />
      <NavigationLink
        href={URL_DOCS}
        labelKey="documentation"
        testId="navigationExternal-documentation"
        NavigationIcon={BookOpen}
        scope="external"
        closeDrawer={closeDrawer}
      />
    </Box>
  );
}

function InternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  if (!daoAddress) {
    return null;
  }

  return (
    <Box
      width="full"
      marginY={{ md: 'auto' }}
    >
      <Box
        maxWidth={{ md: 12, '3xl': '100%' }}
        _hover={{ maxWidth: '100%' }}
        transitionDuration="0.2s"
        overflow={{ md: 'hidden' }}
        mt={{ md: 12 }}
        mb={{ md: 3 }}
        bg={{ md: '#26212AD6' }}
        borderColor={{ md: 'neutral-3' }}
        borderRadius={{ md: 8 }}
        borderWidth={{ md: 1 }}
        backdropFilter={{ md: 'blur(12px)' }}
        boxShadow={{ md: '0px 1px 0px 0px #161219' }}
      >
        <NavigationLink
          href={DAO_ROUTES.dao.relative(addressPrefix, daoAddress)}
          labelKey="dashboard"
          testId="navigation-dashboardLink"
          NavigationIcon={House}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.roles.relative(addressPrefix, daoAddress)}
          labelKey="roles"
          testId="navigation-rolesLink"
          NavigationIcon={UsersThree}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.hierarchy.relative(addressPrefix, daoAddress)}
          labelKey="nodes"
          testId="navigation-hierarchyLink"
          NavigationIcon={GitFork}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.proposals.relative(addressPrefix, daoAddress)}
          labelKey="proposals"
          testId="navigation-proposalsLink"
          NavigationIcon={Scroll}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.treasury.relative(addressPrefix, daoAddress)}
          labelKey="treasury"
          testId="navigation-treasuryLink"
          NavigationIcon={Coins}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.proposalTemplates.relative(addressPrefix, daoAddress)}
          labelKey="proposalTemplates"
          testId="navigation-proposalTemplatesLink"
          NavigationIcon={SquaresFour}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <Hide above="md">
          <Divider variant="darker" />
        </Hide>
      </Box>
    </Box>
  );
}

export function NavigationLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Flex
      height="full"
      alignItems="start"
      direction="column"
      justifyContent={{ base: 'flex-start', md: 'flex-end' }}
      flexGrow={1}
    >
      <InternalLinks closeDrawer={closeDrawer} />
      <ExternalLinks closeDrawer={closeDrawer} />
    </Flex>
  );
}
