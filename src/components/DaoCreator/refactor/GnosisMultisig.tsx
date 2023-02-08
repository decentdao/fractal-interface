import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { Field, FieldArray, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import { CreatorSteps, ICreationStepProps } from '../provider/types';

export function GnosisMultisig({
  values,
  errors,
  setFieldValue,
  step,
  updateStep,
}: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate']);
  const { restrictChars } = useFormHelpers();

  const handleSignersChanges = (numberStr: string) => {
    let numOfSigners = Number(numberStr);
    // greater than 100 signers is unreasonable for manual input here,
    // we don't use an error message because we don't want to render
    // 1000 input fields and lag the app
    if (numOfSigners > 100) {
      numOfSigners = 100;
    }
    const gnosisAddresses = [...values.gnosis.trustedAddresses];
    const trustedAddressLength = gnosisAddresses.length;
    if (trustedAddressLength !== numOfSigners) {
      if (numOfSigners > trustedAddressLength) {
        const difference = numOfSigners - trustedAddressLength;
        gnosisAddresses.push(...new Array(difference).fill(''));
      }
      if (numOfSigners < trustedAddressLength) {
        const difference = trustedAddressLength - numOfSigners;
        gnosisAddresses.splice(trustedAddressLength - difference, difference + 1);
      }
      setFieldValue('gnosis.trustedAddresses', gnosisAddresses);
    }
    setFieldValue('gnosis.numOfSigners', numOfSigners);
  };
  return (
    <Box>
      <Flex
        flexDirection="column"
        gap={4}
        mb={8}
      >
        <LabelComponent
          label={t('labelSigners')}
          helper={t('helperSigners')}
          isRequired
        >
          <NumberInput
            value={values.gnosis.numOfSigners}
            onChange={handleSignersChanges}
            onKeyDown={restrictChars}
          >
            <NumberInputField data-testid="gnosisConfig-numberOfSignerInput" />
          </NumberInput>
        </LabelComponent>
        <LabelComponent
          label={t('labelSigThreshold')}
          helper={t('helperSigThreshold')}
          isRequired
        >
          <Field name="gnosis.signatureThreshold">
            {({ field }: FieldAttributes<any>) => (
              <NumberInput
                {...field}
                onKeyDown={restrictChars}
              >
                <NumberInputField data-testid="gnosisConfig-thresholdInput" />
              </NumberInput>
            )}
          </Field>
        </LabelComponent>
        <Box my={8}>
          <LabelComponent
            label={t('titleSignerAddresses')}
            helper={t('subTitleSignerAddresses')}
            isRequired={false}
          >
            <FieldArray name="gnosis.trustedAddresses">
              {({ remove }) => (
                <>
                  {values.gnosis.trustedAddresses.map((trusteeAddress, i) => {
                    const errorMessage =
                      errors?.gnosis?.trustedAddresses?.[i] && trusteeAddress.length
                        ? errors?.gnosis?.trustedAddresses?.[i]
                        : null;

                    return (
                      <Grid
                        key={i}
                        templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
                        alignItems="center"
                      >
                        <LabelWrapper errorMessage={errorMessage}>
                          <Field name={`gnosis.trustedAddresses.${i}`}>
                            {({ field }: FieldAttributes<any>) => (
                              <Input
                                {...field}
                                placeholder="0x0000...0000"
                                data-testid={'gnosisConfig-signer-' + i}
                              />
                            )}
                          </Field>
                        </LabelWrapper>
                        {values.gnosis.trustedAddresses.length > 1 && (
                          <Button
                            variant="text"
                            onClick={() => remove(i)}
                          >
                            {t('remove')}
                          </Button>
                        )}
                      </Grid>
                    );
                  })}
                </>
              )}
            </FieldArray>
          </LabelComponent>
        </Box>
      </Flex>
      <Divider color="chocolate.700" />
      <Flex alignItems="center">
        <Button
          variant="text"
          onClick={() =>
            updateStep({
              current: step.prev ? step.prev : CreatorSteps.ESSENTIALS,
              prev: null,
              next: null,
            })
          }
        >
          {t('prev', { ns: 'common' })}
        </Button>
        <Button
          w="full"
          type="submit"
          disabled={!!errors.gnosis}
        >
          {t('deploy', { ns: 'common' })}
        </Button>
      </Flex>
    </Box>
  );
}
