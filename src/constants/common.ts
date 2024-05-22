import { useBreakpointValue } from '@chakra-ui/react';

const HEADER_HEIGHT = '4.5rem';
const HEADER_HEIGHT_MOBILE = '3.75rem';

const FOOTER_HEIGHT = '7.625rem';

export const useHeaderHeight = () => {
  const headerHeight = useBreakpointValue({ base: HEADER_HEIGHT_MOBILE, md: HEADER_HEIGHT });
  return headerHeight || HEADER_HEIGHT;
};

export const useContentHeight = () => {
  const headerHeight = useHeaderHeight();
  const contentHeight = `calc(100vh - ${headerHeight} - ${FOOTER_HEIGHT})`;
  return contentHeight;
};

// TODO get these into `decent-ui` repo
export const MOBILE_DRAWER_OVERLAY = '#161219D6';
export const BACKGROUND_SEMI_TRANSPARENT = '#16121980';
export const NEUTRAL_2_82_TRANSPARENT = '#221D25D6';
export const SEXY_BOX_SHADOW_T_T =
  '0px 0px 0px 1px rgba(248, 244, 252, 0.04) inset, 0px 1px 0px 0px rgba(248, 244, 252, 0.04) inset, 0px 0px 0px 1px #100414;';

/**
 * Max width for most informational Tooltips. However we don't add max width
 * to some Tooltips that shouldn't wrap no matter how long, such as token amounts.
 */
export const TOOLTIP_MAXW = '18rem';
export const CONTENT_MAXW = 'calc(100vw - 3rem)';
export const ADDRESS_MULTISIG_METADATA = '0xdA00000000000000000000000000000000000Da0';

export const SIDEBAR_WIDTH = '4.25rem';

export const MAX_CONTENT_WIDTH = '80rem';
