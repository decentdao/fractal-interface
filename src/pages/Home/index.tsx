import { Box, Center, Flex, HStack, Image, Text, Link, Button } from '@chakra-ui/react';
import { Discord, Documents, SupportQuestion } from '@decent-org/fractal-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import logo from '../../assets/images/fractal-text-logo.svg';
import { RELEASE_VERSION } from '../../constants/common';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../../constants/url';
import { BASE_ROUTES } from '../../routes/constants';

interface IconWithTextProps {
  icon: ReactNode;
  label: string;
  url: string;
  testid: string;
}

function IconWithText({ icon, label, url, testid }: IconWithTextProps) {
  return (
    <Link
      data-testid={testid}
      href={url}
      isExternal
    >
      <HStack>
        {icon}
        <Text
          textStyle="text-button-md-semibold"
          color="gold.500"
        >
          {label}
        </Text>
      </HStack>
    </Link>
  );
}

function InfoLinks() {
  const { t } = useTranslation('menu');
  return (
    <HStack>
      <IconWithText
        icon={
          <SupportQuestion
            color="gold.500"
            boxSize="1.5rem"
          />
        }
        label={t('faq')}
        url={URL_FAQ}
        testid="home-linkFAQ"
      />
      <Box
        paddingLeft="1.25rem"
        paddingRight="1.25rem"
      >
        <IconWithText
          icon={
            <Discord
              color="gold.500"
              boxSize="1.5rem"
            />
          }
          label={t('discord')}
          url={URL_DISCORD}
          testid="home-linkDiscord"
        />
      </Box>
      <IconWithText
        icon={
          <Documents
            color="gold.500"
            boxSize="1.5rem"
          />
        }
        label={t('docs')}
        url={URL_DOCS}
        testid="home-linkDocs"
      />
    </HStack>
  );
}

function Home() {
  const { t } = useTranslation('daoCreate');
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const navigate = useNavigate();
  const createDAO = () => {
    navigate(BASE_ROUTES.create);
  };
  return (
    <Center h="full">
      <Flex
        flexDirection="column"
        alignItems="center"
      >
        <Image
          src={logo}
          marginBottom="3.5rem"
        />
        {!account && (
          <Text
            data-testid="home-pageTitleDisconnected"
            textStyle="text-2xl-mono-regular"
            color="grayscale.100"
            marginBottom="1.5rem"
          >
            {t('homeTitleDisconnected')}
          </Text>
        )}
        <Text
          data-testid={account ? 'home-pageSubtitleConnected' : 'home-pageSubtitleDisconnected'}
          textStyle="text-base-mono-regular"
          color="grayscale.100"
          marginBottom="1.5rem"
        >
          {t(account ? 'homeSubTitleConnected' : 'homeSubTitleDisconnected')}
        </Text>
        <Button
          onClick={account ? createDAO : openConnectModal}
          data-testid={account ? 'home-linkCreate' : 'home-linkConnect'}
          size="lg"
          marginBottom="3.25rem"
        >
          {account ? t('homeButtonCreate') : t('homeButtonConnect')}
        </Button>
        <InfoLinks />
        <Link
          marginTop="2rem"
          href="https://www.netlify.com/"
          isExternal
        >
          <Text
            textStyle="text-md-mono-semibold"
            color="gold.500"
          >
            v{RELEASE_VERSION} Deployed by Netlify
          </Text>
        </Link>
      </Flex>
    </Center>
  );
}

export default Home;
