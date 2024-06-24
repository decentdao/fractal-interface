import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import DaoCreator from '../../components/DaoCreator';
import { DAOCreateMode } from '../../components/DaoCreator/formComponents/EstablishEssentials';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { useAccountFavorites } from '../../hooks/DAO/loaders/useFavorites';
import useDeployDAO from '../../hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../hooks/utils/useAsyncRetry';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';

export default function DaoCreatePage() {
  const navigate = useNavigate();
  const { requestWithRetries } = useAsyncRetry();
  const { toggleFavorite } = useAccountFavorites();
  const [redirectPending, setRedirectPending] = useState(false);
  const { t } = useTranslation('transaction');
  const safeAPI = useSafeAPI();

  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      return;
    }

    const theToast = toast(t('toastDisconnectedPersistent', { ns: 'daoCreate' }), {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      progress: 1,
    });

    return () => {
      toast.dismiss(theToast);
    };
  }, [isConnected, t]);

  const successCallback = useCallback(
    async (addressPrefix: string, daoAddress: Address) => {
      setRedirectPending(true);
      const daoFound = await requestWithRetries(
        async () => (safeAPI ? safeAPI.getSafeCreationInfo(daoAddress) : undefined),
        8,
      );
      toggleFavorite(daoAddress);
      if (daoFound) {
        navigate(DAO_ROUTES.dao.relative(addressPrefix, daoAddress));
      } else {
        toast(t('failedIndexSafe'), {
          autoClose: false,
          closeOnClick: true,
          draggable: false,
          closeButton: false,
          progress: 1,
        });
        navigate(BASE_ROUTES.landing);
      }
    },
    [safeAPI, requestWithRetries, toggleFavorite, navigate, t],
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <DaoCreator
      pending={pending || redirectPending}
      deployDAO={deployDAO}
      mode={DAOCreateMode.ROOTDAO}
    />
  );
}
