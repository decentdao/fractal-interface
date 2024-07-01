import { CreateProposalMetadata } from '../../../types';

export type RoleViewMode = 'edit' | 'view';
export interface RoleProps {
  mode?: RoleViewMode;
  editStatus?: EditBadgeStatus;
  handleRoleClick: (hatId: number) => void;
  hatId: number;
  roleName: string;
  wearerAddress: string | undefined;
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

export interface Role {
  id: number;
  member: string;
  roleName: string;
  roleDescription: string;
  // @todo add vesting and payroll types
}

export interface EditedRole {
  id?: number;
  fieldNames: string[];
  status: EditBadgeStatus;
}

export interface RoleValue extends Role {
  editedRole?: EditedRole;
}

export interface RoleFormValues {
  proposalMetadata: CreateProposalMetadata;
  hats: RoleValue[];
}

export const DEFAULT_ROLE_HAT: RoleValue = {
  id: -1,
  member: '',
  roleName: '',
  roleDescription: '',
};
