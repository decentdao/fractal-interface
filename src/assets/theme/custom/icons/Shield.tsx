import { ComponentWithAs, createIcon, IconProps } from '@chakra-ui/react';

export const Shield: ComponentWithAs<'svg', IconProps> = createIcon({
  displayName: 'Shield',
  viewBox: '0 0 24 24',
  path: (
    <path
      d="M3.783 2.826 12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976ZM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604ZM13 10h3l-5 7v-5H8l5-7v5Z"
      fill="currentColor"
    />
  ),
});
