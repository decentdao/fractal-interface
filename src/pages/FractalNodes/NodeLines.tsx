import { Box } from '@chakra-ui/react';

export function NodeLines({
  isCurrentDAO,
  hasMore,
  isFirstChild,
  extendHeight,
  indentFactor = 1,
}: {
  isCurrentDAO?: boolean;
  hasMore?: boolean;
  isFirstChild?: boolean;
  extendHeight?: boolean;
  indentFactor?: number;
}) {
  const width = (1.5 * indentFactor).toString() + 'rem';
  return (
    <Box>
      <Box
        ml="1.75rem"
        mr="1rem"
        width={width}
        h="3.375rem"
        borderLeft="1px solid"
        borderBottom="1px solid"
        borderColor="chocolate.400"
        position="relative"
      >
        {isFirstChild && (
          <Box
            borderRadius="100%"
            boxSize="8px"
            position="absolute"
            top="-4.5156245px"
            left="-4.5156245px"
            bg="chocolate.400"
          />
        )}
        <Box
          borderRadius="100%"
          boxSize="8px"
          position="absolute"
          bottom="-4.5156245px"
          right="-4.5156245px"
          bg={isCurrentDAO ? 'gold.500' : 'chocolate.400'}
        />
      </Box>
      {hasMore && (
        <Box
          ml="1.75rem"
          width="1.5rem"
          h={extendHeight ? '4.375rem' : '3.375rem'}
          borderLeft="1px solid"
          borderColor="chocolate.400"
        />
      )}
    </Box>
  );
}
