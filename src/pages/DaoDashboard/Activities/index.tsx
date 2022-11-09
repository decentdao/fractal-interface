import { Box, Flex, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoBox } from '../../../components/ui/containers/InfoBox';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import { ActivitySort, SortBy } from './ActivitySort';
import { ActivityTreasury } from './ActivityTreasury';
import { useActivities } from './hooks/useActivities';

export function Activities() {
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.Newest);

  const { sortedActivities, isActivitiesLoading } = useActivities(sortBy);
  const { t } = useTranslation('dashboard');
  return (
    <Box>
      <Flex
        justifyContent="flex-end"
        alignItems="center"
        my="1rem"
      >
        <ActivitySort
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Flex>
      {isActivitiesLoading ? (
        <InfoBoxLoader />
      ) : sortedActivities.length ? (
        <Flex
          flexDirection="column"
          gap="1rem"
        >
          {sortedActivities.map((asset, i) => (
            <ActivityTreasury
              key={i}
              asset={asset}
            />
          ))}
        </Flex>
      ) : (
        <InfoBox>
          <Flex
            h="8rem"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              textStyle="text-xl-mono-bold"
              color="chocolate.100"
            >
              {t('noActivity')}
            </Text>
          </Flex>
        </InfoBox>
      )}
    </Box>
  );
}
