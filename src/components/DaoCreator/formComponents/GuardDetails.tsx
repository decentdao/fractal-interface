import { Text, InputGroup, InputRightElement, Flex, Alert } from '@chakra-ui/react';
import { Info } from '@phosphor-icons/react';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatUnits } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  ICreationStepProps,
  BigIntValuePair,
  GovernanceType,
  AzoriusGovernance,
} from '../../../types';
import { formatBigIntDisplay } from '../../../utils/numberFormats';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { CustomNonceInput } from '../../ui/forms/CustomNonceInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import Divider from '../../ui/utils/Divider';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import useStepRedirect from '../hooks/useStepRedirect';

function GuardDetails(props: ICreationStepProps) {
  const { values, isSubmitting, transactionPending, isSubDAO, setFieldValue, mode } = props;
  const {
    node: { safe },
    governance,
    readOnly: { dao },
  } = useFractal();
  const { type } = governance;
  const [showCustomNonce, setShowCustomNonce] = useState<boolean>();
  const [totalParentVotes, setTotalParentVotes] = useState<bigint>();
  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const minutes = t('minutes', { ns: 'common' });
  const azoriusGovernance = governance as AzoriusGovernance;
  const governanceFormType = values.essentials.governance;
  const handleNonceChange = useCallback(
    (nonce?: number) => {
      setFieldValue('multisig.customNonce', nonce ? parseInt(nonce.toString(), 10) : undefined);
    },
    [setFieldValue],
  );

  useEffect(() => {
    if (showCustomNonce === undefined && !dao?.isAzorius && isSubDAO && safe) {
      setFieldValue('multisig.customNonce', safe.nextNonce);
      setShowCustomNonce(true);
    }
  }, [isSubDAO, type, setFieldValue, safe, dao, showCustomNonce]);

  useEffect(() => {
    // set the initial value for freezeGuard.freezeVotesThreshold
    // and display helperFreezeVotesThreshold
    if (!totalParentVotes) {
      if (!type) return;

      let parentVotes: bigint;

      switch (type) {
        case GovernanceType.AZORIUS_ERC20:
        case GovernanceType.AZORIUS_ERC721:
          if (
            !azoriusGovernance ||
            (!azoriusGovernance.votesToken && !azoriusGovernance.erc721Tokens)
          )
            return;
          if (azoriusGovernance.votesToken) {
            const normalized = formatUnits(
              azoriusGovernance.votesToken.totalSupply,
              azoriusGovernance.votesToken.decimals,
            );

            parentVotes = BigInt(normalized.substring(0, normalized.indexOf('.')));
          } else if (azoriusGovernance.erc721Tokens) {
            parentVotes = azoriusGovernance.erc721Tokens!.reduce(
              (prev, curr) => curr.votingWeight * (curr.totalSupply || 1n) + prev,
              0n,
            );
          } else {
            parentVotes = 1n;
          }
          break;
        case GovernanceType.MULTISIG:
        default:
          if (!safe) return;
          parentVotes = BigInt(safe.owners.length);
      }

      let thresholdDefault: BigIntValuePair;

      if (parentVotes === 1n) {
        thresholdDefault = {
          value: '1',
          bigintValue: parentVotes,
        };
      } else {
        thresholdDefault = {
          value: parentVotes.toString(),
          bigintValue: parentVotes / 2n,
        };
      }

      setTotalParentVotes(parentVotes);
      setFieldValue('freeze.freezeVotesThreshold', thresholdDefault);
    }
  }, [
    azoriusGovernance.votesToken,
    safe,
    totalParentVotes,
    type,
    setFieldValue,
    azoriusGovernance,
  ]);

  useStepRedirect({ values });

  const freezeHelper = totalParentVotes
    ? t('helperFreezeVotesThreshold', { totalVotes: formatBigIntDisplay(totalParentVotes) })
    : null;

  return (
    <>
      <StepWrapper
        mode={mode}
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        titleKey="titleGuardConfig"
      >
        <Flex
          flexDirection="column"
          gap={8}
        >
          {governanceFormType === GovernanceType.MULTISIG && (
            <>
              <ContentBoxTitle>{t('titleProposalSettings')}</ContentBoxTitle>
              <LabelComponent
                label={t('labelTimelockPeriod')}
                helper={t('helperTimelockPeriod')}
                isRequired
              >
                <InputGroup>
                  <BigIntInput
                    value={values.freeze.timelockPeriod.bigintValue}
                    onChange={valuePair => setFieldValue('freeze.timelockPeriod', valuePair)}
                    decimalPlaces={0}
                    min="1"
                    data-testid="guardConfig-executionDetails"
                  />
                  <InputRightElement mr="4">{minutes}</InputRightElement>
                </InputGroup>
                <Text
                  textStyle="helper-text-base"
                  color="neutral-7"
                  mt="0.5rem"
                >
                  {t('exampleTimelockPeriod')}
                </Text>
              </LabelComponent>
              <LabelComponent
                label={t('labelExecutionPeriod')}
                helper={t('helperExecutionPeriod')}
                isRequired
              >
                <InputGroup>
                  <BigIntInput
                    value={values.freeze.executionPeriod.bigintValue}
                    onChange={valuePair => setFieldValue('freeze.executionPeriod', valuePair)}
                    decimalPlaces={0}
                    min="1"
                    data-testid="guardConfig-executionDetails"
                  />
                  <InputRightElement mr="4">{minutes}</InputRightElement>
                </InputGroup>
                <Text
                  textStyle="helper-text-base"
                  color="neutral-7"
                  mt="0.5rem"
                >
                  {t('exampleExecutionPeriod')}
                </Text>
              </LabelComponent>
            </>
          )}
          <ContentBoxTitle>{t('titleFreezeParams')}</ContentBoxTitle>
          <LabelComponent
            label={t('labelFreezeVotesThreshold')}
            helper={freezeHelper || ''}
            isRequired
          >
            <BigIntInput
              value={values.freeze.freezeVotesThreshold.bigintValue}
              onChange={valuePair => setFieldValue('freeze.freezeVotesThreshold', valuePair)}
              decimalPlaces={0}
              data-testid="guardConfig-freezeVotesThreshold"
            />
          </LabelComponent>
          <LabelComponent
            label={t('labelFreezeProposalPeriod')}
            helper={t('helperFreezeProposalPeriod')}
            isRequired
          >
            <InputGroup>
              <BigIntInput
                value={values.freeze.freezeProposalPeriod.bigintValue}
                onChange={valuePair => setFieldValue('freeze.freezeProposalPeriod', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-freezeProposalDuration"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="helper-text-base"
              color="neutral-7"
              mt="0.5rem"
            >
              {t('exampleFreezeProposalPeriod')}
            </Text>
          </LabelComponent>
          <LabelComponent
            label={t('labelFreezePeriod')}
            helper={t('helperFreezePeriod')}
            isRequired
          >
            <InputGroup>
              <BigIntInput
                value={values.freeze.freezePeriod.bigintValue}
                onChange={valuePair => setFieldValue('freeze.freezePeriod', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-freezeDuration"
              />

              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="helper-text-base"
              color="neutral-7"
              mt="0.5rem"
            >
              {t('exampleFreezePeriod')}
            </Text>
          </LabelComponent>
          <Alert status="info">
            <Info size="24" />
            <Text
              textStyle="body-base-strong"
              whiteSpace="pre-wrap"
            >
              {t('freezeGuardDescription')}
            </Text>
          </Alert>
          <Divider mb={4} />
          {showCustomNonce && (
            <CustomNonceInput
              nonce={values.multisig.customNonce}
              onChange={handleNonceChange}
              renderTrimmed={false}
            />
          )}
        </Flex>
      </StepWrapper>
      <StepButtons {...props} />
    </>
  );
}

export default GuardDetails;
