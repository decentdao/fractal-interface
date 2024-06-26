import { Button, Flex, Input } from '@chakra-ui/react';
import { VotesERC20Wrapper } from '@fractal-framework/fractal-contracts';
import { Formik, FormikProps } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import * as Yup from 'yup';
import { useERC20LinearToken } from '../../../hooks/DAO/loaders/governance/useERC20LinearToken';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import useApproval from '../../../hooks/utils/useApproval';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { AzoriusGovernance, BigIntValuePair } from '../../../types';
import { formatCoin } from '../../../utils';
import { BigIntInput } from '../forms/BigIntInput';
import LabelWrapper from '../forms/LabelWrapper';

export function UnwrapToken({ close }: { close: () => void }) {
  const { governance, governanceContracts } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const signer = useEthersSigner();
  const { address: account } = useAccount();
  const baseContracts = useSafeContracts();
  const { loadERC20TokenAccountData } = useERC20LinearToken({ onMount: false });

  const [contractCall, pending] = useTransaction();
  const {
    approved,
    approveTransaction,
    pending: approvalPending,
  } = useApproval(
    baseContracts?.votesTokenMasterCopyContract?.asSigner.attach(
      governanceContracts.underlyingTokenAddress!,
    ),
    azoriusGovernance.votesToken?.address,
  );

  const { t } = useTranslation(['modals', 'treasury']);
  const { restrictChars } = useFormHelpers();

  const handleFormSubmit = useCallback(
    (amount: BigIntValuePair) => {
      const { votesTokenContractAddress } = governanceContracts;
      if (!votesTokenContractAddress || !signer || !account) return;
      const votesTokenContract =
        baseContracts?.votesERC20WrapperMasterCopyContract?.asSigner.attach(
          votesTokenContractAddress,
        );
      const wrapperTokenContract = votesTokenContract as VotesERC20Wrapper;
      contractCall({
        contractFn: () => wrapperTokenContract.withdrawTo(account, amount.bigintValue!),
        pendingMessage: t('unwrapTokenPendingMessage'),
        failedMessage: t('unwrapTokenFailedMessage'),
        successMessage: t('unwrapTokenSuccessMessage'),
        successCallback: async () => {
          loadERC20TokenAccountData();
        },
        completedCallback: () => {
          close();
        },
      });
    },
    [
      account,
      contractCall,
      governanceContracts,
      signer,
      close,
      t,
      loadERC20TokenAccountData,
      baseContracts,
    ],
  );

  if (
    !azoriusGovernance.votesToken?.balance ||
    !azoriusGovernance.votesToken.decimals ||
    azoriusGovernance.votesToken.balance === 0n
  ) {
    return null;
  }

  return (
    <Formik
      initialValues={{
        amount: { value: '', bigintValue: 0n },
      }}
      onSubmit={values => {
        const { amount } = values;
        handleFormSubmit(amount);
      }}
      validationSchema={Yup.object().shape({
        amount: Yup.object({
          value: Yup.string().required(),
          bigintValue: Yup.mixed().required(),
        }).test({
          name: 'Unwrap Token Validation',
          message: t('unwrapTokenError'),
          test: amount => {
            const amountBi = amount.bigintValue as bigint;
            if (amountBi === 0n) return false;
            if (
              !azoriusGovernance.votesToken ||
              azoriusGovernance.votesToken.balance === null ||
              azoriusGovernance.votesToken.balance === undefined ||
              azoriusGovernance.votesToken.balance === 0n
            )
              return false;
            if (amountBi > azoriusGovernance.votesToken.balance) return false;
            return true;
          },
        }),
      })}
    >
      {({ handleSubmit, values, setFieldValue, errors }: FormikProps<any>) => {
        return (
          <form onSubmit={handleSubmit}>
            <Flex
              flexDirection="column"
              gap={8}
            >
              <LabelWrapper
                label={t('assetUnwrapTitle')}
                subLabel={t('assetUnwrapSubLabel')}
              >
                <Input
                  value={azoriusGovernance.votesToken?.name}
                  readOnly
                />
              </LabelWrapper>

              <LabelWrapper
                label={t('assetUnwrapAmountLabel')}
                subLabel={t('selectSublabel', {
                  balance: formatCoin(
                    azoriusGovernance.votesToken?.balance!,
                    false,
                    azoriusGovernance.votesToken?.decimals!,
                    azoriusGovernance.votesToken?.symbol,
                  ),
                })}
              >
                <BigIntInput
                  value={values.amount.bigintValue}
                  decimalPlaces={azoriusGovernance.votesToken?.decimals}
                  onChange={valuePair => setFieldValue('amount', valuePair)}
                  data-testid="unWrapToken-amount"
                  onKeyDown={restrictChars}
                  maxValue={azoriusGovernance.votesToken?.balance!}
                  isDisabled={!approved}
                />
              </LabelWrapper>

              {approved ? (
                <Button
                  type="submit"
                  isDisabled={!!errors.amount || pending}
                >
                  {t('unwrapTokenButton')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={approveTransaction}
                  isDisabled={approvalPending}
                >
                  {t('approveToken', { ns: 'treasury' })}
                </Button>
              )}
            </Flex>
          </form>
        );
      }}
    </Formik>
  );
}
