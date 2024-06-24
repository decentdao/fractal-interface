import { Box, Flex, Select, HStack, Text, Button } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { SafeBalanceResponse } from '@safe-global/safe-service-client';
import { Field, FieldAttributes, FieldProps, Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import * as Yup from 'yup';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import { useFractal } from '../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../types';
import { formatCoinFromAsset, formatCoinUnitsFromAsset } from '../../../utils/numberFormats';
import { sendAssets } from '../../pages/DAOTreasury/sendAssets';
import { BigIntInput } from '../forms/BigIntInput';
import { CustomNonceInput } from '../forms/CustomNonceInput';
import { AddressInput } from '../forms/EthAddressInput';
import LabelWrapper from '../forms/LabelWrapper';
import Divider from '../utils/Divider';

interface SendAssetsFormValues {
  destinationAddress: string;
  selectedAsset: SafeBalanceResponse;
  inputAmount?: BigIntValuePair;
}

// @todo add Yup and Formik to this modal
export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);
  const [nonceInput, setNonceInput] = useState<number | undefined>(safe!.nextNonce);

  const { submitProposal } = useSubmitProposal();

  const { addressValidationTest, isValidating } = useValidationAddress();

  const submitSendAssets = async (values: SendAssetsFormValues) => {
    const { destinationAddress, selectedAsset, inputAmount } = values;

    await sendAssets({
      transferAmount: inputAmount?.bigintValue || 0n,
      asset: selectedAsset,
      destinationAddress: getAddress(destinationAddress),
      nonce: nonceInput,
      submitProposal,
      t,
    });

    if (close) close();
  };

  const sendAssetsValidationSchema = Yup.object().shape({
    destinationAddress: Yup.string().test(addressValidationTest),
    selectedAsset: Yup.object()
      .shape({
        tokenAddress: Yup.string().required(),
        token: Yup.object().shape({
          name: Yup.string().required(),
          symbol: Yup.string().required(),
          decimals: Yup.number().required(),
        }),
        balance: Yup.string().required(),
      })
      .required(),
  });

  return (
    <Box>
      <Formik<SendAssetsFormValues>
        initialValues={{
          destinationAddress: '',
          selectedAsset: fungibleAssetsWithBalance[0],
          inputAmount: undefined,
        }}
        onSubmit={submitSendAssets}
        validationSchema={sendAssetsValidationSchema}
      >
        {({ errors, values, setFieldValue }) => {
          const overDraft =
            Number(values.inputAmount?.value || '0') >
            formatCoinUnitsFromAsset(values.selectedAsset);

          // @dev next couple of lines are written like this, to keep typing equivalent during the conversion from BN to bigint
          const inputBigint = values.inputAmount?.bigintValue;
          const inputBigintIsZero = inputBigint ? inputBigint === 0n : undefined;
          const isSubmitDisabled = !values.inputAmount || inputBigintIsZero || overDraft;

          const selectedAssetIndex = fungibleAssetsWithBalance.findIndex(
            asset => asset.tokenAddress === values.selectedAsset.tokenAddress,
          );

          return (
            <Form>
              <Flex>
                {/* ASSET SELECT */}
                <Field name="selectedAsset">
                  {({ field }: FieldAttributes<FieldProps<SafeBalanceResponse>>) => (
                    <Box
                      width="40%"
                      marginEnd="0.75rem"
                    >
                      <LabelWrapper label={t('selectLabel')}>
                        <Select
                          {...field}
                          bgColor="neutral-1"
                          borderColor="neutral-3"
                          rounded="sm"
                          cursor="pointer"
                          iconSize="1.5rem"
                          icon={<CaretDown />}
                          onChange={e => {
                            setFieldValue('inputAmount', { value: '0', bigintValue: 0n });
                            setFieldValue(
                              'selectedAsset',
                              fungibleAssetsWithBalance[Number(e.target.value)],
                            );
                          }}
                          value={selectedAssetIndex}
                        >
                          {fungibleAssetsWithBalance.map((asset, index) => (
                            <option
                              key={index}
                              value={index}
                            >
                              {asset.token ? asset.token.symbol : 'ETH'}
                            </option>
                          ))}
                        </Select>
                      </LabelWrapper>
                    </Box>
                  )}
                </Field>

                {/* SEND AMOUNT INPUT */}
                <Field name="inputAmount">
                  {({ field }: FieldAttributes<FieldProps<BigIntValuePair | undefined>>) => (
                    <Box width="60%">
                      <LabelWrapper label={t('amountLabel')}>
                        <BigIntInput
                          {...field}
                          value={field.value?.bigintValue}
                          onChange={value => {
                            setFieldValue('inputAmount', value);
                          }}
                          currentValue={values.inputAmount}
                          decimalPlaces={values.selectedAsset.token.decimals}
                          placeholder="0"
                          maxValue={BigInt(values.selectedAsset.balance)}
                          isInvalid={overDraft}
                          errorBorderColor="red-0"
                        />
                      </LabelWrapper>
                    </Box>
                  )}
                </Field>
              </Flex>

              {/* AVAILABLE BALANCE HINT */}
              <HStack
                justify="space-between"
                textStyle="neutral-7"
                color="white-0"
                marginTop="0.75rem"
              >
                <Text
                  color={overDraft ? 'red-0' : 'neutral-7'}
                  textStyle="helper-text-base"
                  as="span"
                >
                  {t('selectSublabel', {
                    balance: formatCoinFromAsset(values.selectedAsset, false),
                  })}
                </Text>
              </HStack>

              <Divider my="1.5rem" />

              {/* DESTINATION ADDRESS INPUT */}
              <Field name={'destinationAddress'}>
                {({ field }: FieldAttributes<FieldProps<string>>) => (
                  <LabelWrapper
                    label={t('destinationLabel')}
                    subLabel={t('destinationSublabel')}
                    errorMessage={field.value && errors.destinationAddress}
                  >
                    <AddressInput {...field} />
                  </LabelWrapper>
                )}
              </Field>

              <Divider my="1.5rem" />

              <CustomNonceInput
                nonce={nonceInput}
                onChange={nonce => setNonceInput(nonce ? nonce : undefined)}
              />

              <Button
                marginTop="2rem"
                width="100%"
                type="submit"
                isDisabled={isValidating || !!errors.destinationAddress || isSubmitDisabled}
              >
                {t('sendAssetsSubmit')}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}
