import { Box, BoxProps } from '@chakra-ui/react';

export function Card({ children, ...rest }: BoxProps) {
  return (
    <Box
      bg="neutral-2"
      _hover={{ bg: 'neutral-3' }}
      _active={{ bg: 'neutral-2', border: '1px solid', borderColor: 'neutral-3' }}
      transition="all ease-out 300ms"
      p="1.5rem"
      borderRadius="0.5rem"
      border="1px solid"
      borderColor="neutral-3"
      {...rest}
    >
      {children}
    </Box>
  );
}
