import { Input, IconButton } from '@chakra-ui/react';
import { LabelWrapper, Trash } from '@decent-org/fractal-ui';
import { Field, FieldAttributes, FormikErrors } from 'formik';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { TokenAllocation } from '../../../types';
import { BigNumberInput, BigNumberValuePair } from '../../ui/forms/BigNumberInput';
import { ICreationStepProps } from '../types';

interface ITokenAllocations extends ICreationStepProps {
  tokenAllocation: TokenAllocation<BigNumberValuePair>;
  index: number;
  remove: <T>(index: number) => T | undefined;
}

export function UsulTokenAllocation({
  tokenAllocation,
  index,
  remove,
  errors,
  values,
  setFieldValue,
}: ITokenAllocations) {
  const { restrictChars } = useFormHelpers();
  const indexedTokenAllocationError = (
    errors?.govToken?.tokenAllocations as FormikErrors<
      TokenAllocation<BigNumberValuePair>[] | undefined
    >
  )?.[index];

  const addressErrorMessage =
    indexedTokenAllocationError?.address && tokenAllocation.address.length
      ? indexedTokenAllocationError.address
      : null;
  const amountErrorMessage =
    indexedTokenAllocationError?.amount?.value && !tokenAllocation.amount.bigNumberValue?.isZero()
      ? indexedTokenAllocationError.amount.value
      : null;
  return (
    <>
      <LabelWrapper
        errorMessage={addressErrorMessage}
        key={index}
      >
        <Field name={`govToken.tokenAllocations.${index}.address`}>
          {({ field }: FieldAttributes<any>) => (
            <Input
              {...field}
              placeholder="0x0000...0000"
              data-testid={'tokenVoting-tokenAllocationAddressInput-' + index}
            />
          )}
        </Field>
      </LabelWrapper>
      <LabelWrapper errorMessage={amountErrorMessage}>
        <BigNumberInput
          value={values.govToken.tokenAllocations[index].amount.bigNumberValue}
          onChange={valuePair =>
            setFieldValue(`govToken.tokenAllocations.${index}.amount`, valuePair)
          }
          data-testid={'tokenVoting-tokenAllocationAmountInput-' + index}
          onKeyDown={restrictChars}
        />
      </LabelWrapper>
      {values.govToken.tokenAllocations.length > 1 && (
        <IconButton
          aria-label="remove allocation"
          variant="unstyled"
          minW="0"
          icon={
            <Trash
              color="alert-red.normal"
              boxSize="1.5rem"
            />
          }
          type="button"
          onClick={() => remove(index)}
          alignSelf="center"
          data-testid={'tokenVoting-tokenAllocationRemoveButton-' + index}
        />
      )}
    </>
  );
}
