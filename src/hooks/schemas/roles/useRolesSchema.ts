import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { addressValidationTest } = useValidationAddress();
  const rolesSchema = useMemo(
    () =>
      Yup.object().shape({
        hats: Yup.array().of(
          Yup.object().shape({
            roleName: Yup.string().required('Role name is required'),
            roleDescription: Yup.string().required('Role description is required'),
            member: Yup.string().required('Member is required').test(addressValidationTest),
          }),
        ),
      }),
    [addressValidationTest],
  );
  return { rolesSchema };
};
