import { Address } from 'viem';

export type RoleViewMode = 'edit' | 'view';
export interface RoleProps {
  mode?: RoleViewMode;
  editStatus?: EditBadgeStatus;
  handleRoleClick: (roleIndex: number) => void;
  roleName: string;
  wearerAddress: Address | undefined;
  vestingData?: {
    vestingSchedule: string;
    vestingAmount: string;
    asset: {
      address: string;
      symbol: string;
      name: string;
      iconUri: string;
    };
  };
  payrollData?: {
    payrollSchedule: string;
    payrollAmount: string;
    asset: {
      address: string;
      symbol: string;
      name: string;
      iconUri: string;
    };
  };
}

export enum EditBadgeStatus {
  Updated,
  New,
  Removed,
}
export const BadgeStatus: Record<EditBadgeStatus, string> = {
  [EditBadgeStatus.Updated]: 'updated',
  [EditBadgeStatus.New]: 'new',
  [EditBadgeStatus.Removed]: 'removed',
};
export const BadgeStatusColor: Record<EditBadgeStatus, string> = {
  [EditBadgeStatus.Updated]: 'lilac-0',
  [EditBadgeStatus.New]: 'celery--2',
  [EditBadgeStatus.Removed]: 'error-1',
};
