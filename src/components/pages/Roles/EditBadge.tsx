import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditBadgeStatus, BadgeStatusColor, BadgeStatus } from './types';

interface EditBadgeProps {
  editStatus?: EditBadgeStatus;
}

export default function EditBadge({ editStatus }: EditBadgeProps) {
  const { t } = useTranslation('roles');
  if (editStatus === undefined) return null;
  const displayColor = BadgeStatusColor[editStatus];
  const displayText = t(BadgeStatus[editStatus]);
  return (
    <Box
      rounded="md"
      textStyle="label-base"
      borderColor={displayColor}
      textColor={displayColor}
      border="1px solid"
      px="0.5rem"
      h="1.5rem"
      lineHeight={1.5}
    >
      {displayText}
    </Box>
  );
}
