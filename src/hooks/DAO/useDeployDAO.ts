import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getContract, isHex } from 'viem';
import { useWalletClient } from 'wagmi';
import MultiSendCallOnlyAbi from '../../assets/abi/MultiSendCallOnly';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMultisigDAO, AzoriusERC20DAO, AzoriusERC721DAO } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useBuildDAOTx from './useBuildDAOTx';

const useDeployDAO = () => {
  const [contractCall, pending] = useTransaction();
  const [build] = useBuildDAOTx();

  const { t } = useTranslation('transaction');

  const {
    addressPrefix,
    contracts: { multiSendCallOnly },
  } = useNetworkConfig();

  const { data: walletClient } = useWalletClient();

  const deployDao = useCallback(
    (
      daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
      successCallback: (addressPrefix: string, daoAddress: Address) => void,
    ) => {
      const deploy = async () => {
        if (!walletClient) {
          return;
        }

        const builtSafeTx = await build(daoData);
        if (!builtSafeTx) {
          return;
        }

        const { predictedSafeAddress, safeTx } = builtSafeTx;

        if (!isHex(safeTx)) {
          throw new Error('built transaction is not a hex string');
        }

        const multiSendCallOnlyContract = getContract({
          abi: MultiSendCallOnlyAbi,
          address: multiSendCallOnly,
          client: walletClient,
        });

        contractCall({
          contractFn: () => multiSendCallOnlyContract.write.multiSend([safeTx]),
          pendingMessage: t('pendingDeploySafe'),
          failedMessage: t('failedDeploySafe'),
          successMessage: t('successDeploySafe'),
          successCallback: () => successCallback(addressPrefix, predictedSafeAddress),
        });
      };

      deploy();
    },
    [addressPrefix, build, contractCall, multiSendCallOnly, t, walletClient],
  );

  return [deployDao, pending] as const;
};

export default useDeployDAO;
