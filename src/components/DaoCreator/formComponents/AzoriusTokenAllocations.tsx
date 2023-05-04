import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Grid,
  Text,
} from '@chakra-ui/react';
import { Gear, LabelWrapper } from '@decent-org/fractal-ui';
import { FieldArray, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  BigNumberValuePair,
  ICreationStepProps,
  TokenAllocation,
} from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { AzoriusTokenAllocation } from './AzoriusTokenAllocation';

export function AzoriusTokenAllocations(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubDAO } = props;
  const { t } = useTranslation('daoCreate');
  const { governance } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const canReceiveParentAllocations = isSubDAO && azoriusGovernance.votesToken?.address;

  return (
    <Box>
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      <FieldArray name="govToken.tokenAllocations">
        {({ remove, push }) => (
          <Box my={4}>
            <Grid
              gridTemplateColumns="1fr 35% 2rem"
              columnGap={4}
              rowGap={2}
              data-testid="tokenVoting-tokenAllocations"
            >
              <Text
                textStyle="text-md-sans-regular"
                color="grayscale.100"
              >
                {t('titleAddress')}
              </Text>
              <Text
                textStyle="text-md-sans-regular"
                color="grayscale.100"
              >
                {t('titleAmount')}
              </Text>
              <Box>{/* EMPTY */}</Box>

              {values.govToken.tokenAllocations.map((tokenAllocation, index) => {
                const tokenAllocationError = (
                  errors?.govToken?.tokenAllocations as FormikErrors<
                    TokenAllocation<BigNumberValuePair>[] | undefined
                  >
                )?.[index];

                const addressErrorMessage =
                  tokenAllocationError?.address && tokenAllocation.address.length
                    ? tokenAllocationError.address
                    : null;
                const amountErrorMessage =
                  tokenAllocationError?.amount?.value &&
                  !tokenAllocation.amount.bigNumberValue?.isZero()
                    ? tokenAllocationError.amount.value
                    : null;

                return (
                  <AzoriusTokenAllocation
                    key={index}
                    index={index}
                    remove={remove}
                    addressErrorMessage={addressErrorMessage}
                    amountErrorMessage={amountErrorMessage}
                    amountInputValue={values.govToken.tokenAllocations[index].amount.bigNumberValue}
                    allocationLength={values.govToken.tokenAllocations.length}
                    {...props}
                  />
                );
              })}
            </Grid>
            <Text
              color="grayscale.500"
              textStyle="text-md-sans-regular"
            >
              {t('helperAllocations')}
            </Text>
            <Button
              size="base"
              maxWidth="fit-content"
              px={0}
              mx={0}
              variant="text"
              onClick={() => push({ address: '', amount: { value: '' } })}
              data-testid="tokenVoting-addAllocation"
            >
              {t('labelAddAllocation')}
            </Button>
            {canReceiveParentAllocations && (
              <Accordion allowToggle>
                <AccordionItem
                  borderTop="none"
                  borderBottom="none"
                  bg="black.900-semi-transparent"
                  my={8}
                  py={4}
                  rounded="lg"
                >
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton
                        textStyle="text-button-md-semibold"
                        color="grayscale.100"
                      >
                        <Gear
                          marginRight={3}
                          transform={`rotate(-${isExpanded ? '0' : '90'}deg)`}
                        />
                        {t('advanced', { ns: 'common' })}
                      </AccordionButton>
                      <AccordionPanel paddingBottom={4}>
                        <LabelComponent
                          label={t('labelParentAllocation')}
                          helper={t('helperParentAllocation')}
                          isRequired={false}
                        >
                          <LabelWrapper
                            errorMessage={
                              (
                                values.govToken.parentAllocationAmount?.bigNumberValue &&
                                (errors.govToken?.parentAllocationAmount as any)
                              )?.value
                            }
                          >
                            <BigNumberInput
                              data-testid="tokenVoting-parentTokenAllocationInput"
                              value={values.govToken.parentAllocationAmount?.bigNumberValue}
                              onChange={valuePair =>
                                setFieldValue('govToken.parentAllocationAmount', valuePair)
                              }
                              isInvalid={false}
                            />
                          </LabelWrapper>
                        </LabelComponent>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
            )}
          </Box>
        )}
      </FieldArray>
    </Box>
  );
}