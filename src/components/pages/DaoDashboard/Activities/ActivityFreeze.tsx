import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useDateTimeDisplay } from '../../../../helpers/dateTime';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DAOState } from '../../../../types';
import { ActivityCard } from '../../../Activity/ActivityCard';
import { FreezeButton } from '../../../Activity/FreezeButton';
import { Badge } from '../../../ui/badges/Badge';

export function FreezeDescription({ isFrozen }: { isFrozen: boolean }) {
  const { t } = useTranslation('dashboard');
  return (
    <Text
      color="neutral-7"
      textStyle="body-base-strong"
      gap="0.5rem"
    >
      {t(isFrozen ? 'frozenDescription' : 'freezeDescription')}
    </Text>
  );
}

export function ActivityFreeze() {
  const {
    guard: {
      isFrozen,
      freezeProposalCreatedTime,
      freezeProposalPeriod,
      freezePeriod,
      freezeVotesThreshold,
      freezeProposalVoteCount,
    },
  } = useFractal();
  const { t } = useTranslation('dashboard');
  const freezeProposalDeadlineDate = new Date(
    Number(((freezeProposalCreatedTime || 0n) + (freezeProposalPeriod || 0n)) * 1000n),
  );
  const freezeDeadlineDate = new Date(
    Number(((freezeProposalCreatedTime || 0n) + (freezePeriod || 0n)) * 1000n),
  );
  const now = new Date();

  const freezeProposalPeriodDiffReadable = useDateTimeDisplay(freezeProposalDeadlineDate);
  const freezePeriodDiffReadable = useDateTimeDisplay(freezeDeadlineDate);
  const isFreezeProposalDeadlinePassed = now.getTime() > freezeProposalDeadlineDate.getTime();
  const isFreezeDeadlinePassed = now.getTime() > freezeDeadlineDate.getTime();

  if (isFreezeProposalDeadlinePassed && isFreezeDeadlinePassed) {
    return null;
  }

  const voteToThreshold =
    freezeProposalVoteCount!.toString() + ' / ' + freezeVotesThreshold!.toString();

  return (
    <ActivityCard
      Badge={
        <Badge
          labelKey={isFrozen ? DAOState.frozen : DAOState.freezeInit}
          size="base"
        />
      }
      description={<FreezeDescription isFrozen={isFrozen} />}
      RightElement={
        <Flex
          color="blue.500"
          alignItems="center"
          gap="2rem"
        >
          <Text textStyle="text-base-sans-regular">
            {!isFrozen && freezeVotesThreshold !== null && freezeVotesThreshold > 0n && (
              <Tooltip
                label={t('tipFreeze', { amount: voteToThreshold })}
                placement="bottom"
              >
                {voteToThreshold}
              </Tooltip>
            )}
          </Text>
          {!isFreezeProposalDeadlinePassed && !isFreezeDeadlinePassed && (
            <Text textStyle="text-base-sans-regular">
              {isFrozen ? freezePeriodDiffReadable : freezeProposalPeriodDiffReadable}
            </Text>
          )}
          {!isFrozen && <FreezeButton />}
        </Flex>
      }
      boxBorderColor={'blue.500'}
    />
  );
}
