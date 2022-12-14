import { Box, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/ui/Header/PageHeader';
import { TitledInfoBox } from '../../components/ui/containers/TitledInfoBox';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useFractalModal } from '../../components/ui/modals/useFractalModal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { Assets } from './components/Assets';
import { Transactions } from './components/Transactions';

function Treasury() {
  const {
    gnosis: { daoName },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  // TODO show only if the user is a DAO signer or delegated token holder and assets > 0
  // TODO needs transaction implementation
  const showButton = false && assetsFungible.length > 0;
  return (
    <Box>
      <PageHeader
        title={t('titleTreasury', { daoName: daoName })}
        titleTestId={'title-treasury'}
        buttonText={showButton ? t('buttonSendAssets') : undefined}
        buttonClick={useFractalModal(ModalType.SEND_ASSETS)}
        buttonTestId="link-send-assets"
      />
      <Flex
        align="start"
        gap="1rem"
        flexWrap="wrap"
      >
        <TitledInfoBox
          minWidth={{ sm: '100%', xl: '55%' }}
          title={t('titleTransactions')}
          titleTestId="title-transactions"
        >
          <Transactions />
        </TitledInfoBox>
        <TitledInfoBox
          minWidth={{ sm: '100%', xl: '35%' }}
          title={t('titleAssets')}
          titleTestId="title-assets"
        >
          <Assets />
        </TitledInfoBox>
      </Flex>
    </Box>
  );
}
export default Treasury;
