import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Hash, TransactionReceipt } from 'viem';
import { usePublicClient } from 'wagmi';
import { logError } from '../../helpers/errorLogging';

interface ProviderRpcError extends Error {
  message: string;
  code: string | number;
  data?: any;
}

interface ContractCallParams {
  contractFn: () => Promise<Hash>;
  pendingMessage: string;
  failedMessage: string;
  successMessage: string;
  failedCallback?: () => void;
  successCallback?: (txReceipt: TransactionReceipt) => void;
  completedCallback?: () => void;
}

const useTransaction = () => {
  const [pending, setPending] = useState(false);
  const { t } = useTranslation(['transaction', 'common']);
  const publicClient = usePublicClient();

  const contractCall = useCallback(
    (params: ContractCallParams) => {
      if (!publicClient) return;

      let toastId: React.ReactText;
      toastId = toast(params.pendingMessage, {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        progress: 1,
      });
      setPending(true);
      params
        .contractFn()
        .then(txReceipt => {
          return Promise.all([
            publicClient.waitForTransactionReceipt({ hash: txReceipt }),
            toastId,
          ]);
        })
        .then(([txReceipt, toastID]) => {
          toast.dismiss(toastID);
          if (txReceipt.status === 'reverted') {
            toast.error(params.failedMessage);
            if (params.failedCallback) params.failedCallback();
          } else if (txReceipt.status === 'success') {
            toast(params.successMessage);
            if (params.successCallback) params.successCallback(txReceipt);
          } else {
            toast.error(t('errorTransactionUnknown'));
            if (params.failedCallback) params.failedCallback();
          }
          if (params.completedCallback) params.completedCallback();

          // Give the block event emitter a couple seconds to play the latest
          // block on the app state, before informing app that the transaction
          // is completed.
          setTimeout(() => {
            setPending(false);
          }, 2000);
        })
        .catch((error: ProviderRpcError) => {
          logError(error);
          toast.dismiss(toastId);
          setPending(false);

          if (error.code === 4001) {
            toast.error(t('errorUserDeniedTransaction'));
            return;
          }

          toast.error(t('errorGeneral', { ns: 'common' }));
        });
    },
    [t, publicClient],
  );

  return [contractCall, pending] as const;
};

export { useTransaction };
