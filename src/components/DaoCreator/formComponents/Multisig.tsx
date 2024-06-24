import { Box, Flex, Grid, IconButton, NumberInput, NumberInputField } from '@chakra-ui/react';
import { MinusCircle } from '@phosphor-icons/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { ICreationStepProps } from '../../../types';
import { AddressInput } from '../../ui/forms/EthAddressInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import LabelWrapper from '../../ui/forms/LabelWrapper';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import useStepRedirect from '../hooks/useStepRedirect';
import { DAOCreateMode } from './EstablishEssentials';

export function Multisig(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubmitting, transactionPending, isSubDAO, mode } = props;
  const { t } = useTranslation('daoCreate');
  useStepRedirect({ values });

  const truncateSignersList = (safeAddresses: Address[], numOfSigners: number) => {
    const difference = safeAddresses.length - numOfSigners;
    return safeAddresses.slice(0, safeAddresses.length - difference);
  };

  const appendEmptySigners = (safeAddresses: Address[], numOfSigners: number) => {
    const difference = numOfSigners - safeAddresses.length;
    return safeAddresses.concat(new Array(difference).fill(''));
  };

  // ensures no decimal places or numbers greater than 99
  const validateNumber = (num: string, fieldValue: string) => {
    let updatedNum = num;
    if (updatedNum.includes('.')) {
      updatedNum = updatedNum.split('.')[0];
    }
    if (updatedNum.length > 2) {
      updatedNum = updatedNum.substring(0, 2);
    }
    setFieldValue(fieldValue, Number(updatedNum).toString());

    return updatedNum !== num;
  };

  const deleteIndex = (deletedIndex: number) => {
    const addresses = values.multisig.trustedAddresses;
    addresses.splice(deletedIndex, 1);
    setFieldValue('multisig', {
      ...values.multisig,
      numOfSigners: --values.multisig.numOfSigners!,
      trustedAddresses: addresses,
    });
  };

  const validateTotalSigners = (numOfSigners: string) => {
    if (validateNumber(numOfSigners, 'multisig.numOfSigners')) return;

    const num = Number(numOfSigners);
    let safeAddresses = values.multisig.trustedAddresses;

    const trustedAddressLength = safeAddresses.length;

    if (trustedAddressLength !== num) {
      safeAddresses =
        num > trustedAddressLength
          ? appendEmptySigners(safeAddresses, num)
          : truncateSignersList(safeAddresses, num);
    }

    setFieldValue('multisig', {
      ...values.multisig,
      numOfSigners: num,
      trustedAddresses: safeAddresses,
    });
  };

  return (
    <>
      <StepWrapper
        mode={mode}
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        titleKey="titleSafeConfig"
      >
        <Flex
          flexDirection="column"
          gap={4}
        >
          <LabelComponent
            label={t('labelSigners')}
            helper={t('helperSigners')}
            errorMessage={errors.multisig?.numOfSigners}
            isRequired
          >
            <NumberInput
              value={values.multisig.numOfSigners}
              onChange={value => validateTotalSigners(value)}
              isInvalid={!!errors.multisig?.numOfSigners}
            >
              <NumberInputField data-testid="safeConfig-numberOfSignerInput" />
            </NumberInput>
          </LabelComponent>
          <LabelComponent
            label={t('labelSigThreshold')}
            helper={t('helperSigThreshold')}
            errorMessage={
              values.multisig.signatureThreshold ? errors.multisig?.signatureThreshold : undefined
            }
            isRequired
          >
            <NumberInput
              value={values.multisig.signatureThreshold}
              onChange={value => validateNumber(value, 'multisig.signatureThreshold')}
              isInvalid={!!errors.multisig?.signatureThreshold}
            >
              <NumberInputField data-testid="safeConfig-thresholdInput" />
            </NumberInput>
          </LabelComponent>
          <Box my={4}>
            <LabelComponent
              label={t('titleSignerAddresses')}
              helper={t('subTitleSignerAddresses')}
              isRequired={false}
            >
              <>
                {values.multisig.trustedAddresses.map((trustedAddress, i) => {
                  const errorMessage =
                    errors?.multisig?.trustedAddresses?.[i] && trustedAddress.length
                      ? errors?.multisig?.trustedAddresses?.[i]
                      : null;

                  return (
                    <LabelWrapper
                      key={i}
                      errorMessage={errorMessage}
                    >
                      <Grid
                        templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
                        alignItems="center"
                      >
                        <Field name={`multisig.trustedAddresses.${i}`}>
                          {({ field }: FieldAttributes<any>) => (
                            <AddressInput
                              {...field}
                              isInvalid={!!errorMessage}
                              data-testid={'safeConfig-signer-' + i}
                            />
                          )}
                        </Field>
                        {values.multisig.trustedAddresses.length > 1 && (
                          <IconButton
                            aria-label="remove allocation"
                            variant="unstyled"
                            minW={16}
                            icon={<MinusCircle size="24" />}
                            type="button"
                            onClick={async () => {
                              deleteIndex(i);
                            }}
                            data-testid={'multisig.numOfSigners-' + i}
                          />
                        )}
                      </Grid>
                    </LabelWrapper>
                  );
                })}
              </>
            </LabelComponent>
          </Box>
        </Flex>
      </StepWrapper>
      <StepButtons
        {...props}
        isEdit={mode === DAOCreateMode.EDIT}
      />
    </>
  );
}
