import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { ActivityEventType, SortBy, TreasuryActivity, FractalProposal } from '../../../../types';
import { ActivityTreasury } from '../../../Activity/ActivityTreasury';
import ProposalCard from '../../../Proposals/ProposalCard/ProposalCard';
import { EmptyBox } from '../../../ui/containers/EmptyBox';
import { InfoBoxLoader } from '../../../ui/loaders/InfoBoxLoader';
import { Sort } from '../../../ui/utils/Sort';
import { ActivityFreeze } from './ActivityFreeze';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const {
    guardContracts: { freezeVotingContractAddress },
    guard,
    governance: { type, loadingProposals, allProposalsLoaded },
  } = useFractal();
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);
  const { sortedActivities } = useActivities(sortBy);

  const { t } = useTranslation('dashboard');

  return (
    <Box>
      <Flex
        justifyContent="flex-start"
        alignItems="center"
        mx="0.5rem"
        my="1rem"
      >
        <Sort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>
      <Flex
        flexDirection="column"
        gap="1rem"
      >
        {freezeVotingContractAddress &&
          guard.freezeProposalVoteCount !== null &&
          guard.freezeProposalVoteCount > 0n && <ActivityFreeze />}
        {!type || loadingProposals ? (
          <InfoBoxLoader />
        ) : sortedActivities.length ? (
          <Flex
            flexDirection="column"
            gap="1rem"
          >
            {sortedActivities.map((activity, i) => {
              if (activity.eventType === ActivityEventType.Governance) {
                return (
                  <ProposalCard
                    key={i}
                    proposal={activity as FractalProposal}
                  />
                );
              }
              return (
                <ActivityTreasury
                  key={i}
                  activity={activity as TreasuryActivity}
                />
              );
            })}
            {!allProposalsLoaded && <InfoBoxLoader />}
          </Flex>
        ) : (
          <EmptyBox emptyText={t('noActivity')} />
        )}
      </Flex>
    </Box>
  );
}
