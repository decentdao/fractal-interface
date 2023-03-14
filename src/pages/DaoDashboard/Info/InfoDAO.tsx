import { Flex } from '@chakra-ui/react';
import { DAOInfoCard } from '../../../components/ui/cards/DAOInfoCard';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { useFetchNodes } from '../../FractalNodes/useFetchNodes';

export function InfoDAO() {
  const {
    gnosis: { safe, freezeData, guardContracts, parentDAOAddress },
  } = useFractal();
  const { childNodes } = useFetchNodes(safe.address);
  if (!safe.address) {
    return (
      <Flex
        minHeight="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

  return (
    <DAOInfoCard
      parentSafeAddress={parentDAOAddress}
      safeAddress={safe.address}
      numberOfChildrenDAO={(childNodes ?? []).length}
      freezeData={freezeData}
      guardContracts={guardContracts}
    />
  );
}
