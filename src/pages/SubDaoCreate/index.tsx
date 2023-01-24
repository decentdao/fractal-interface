import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import { useCreateSubDAOProposal } from '../../hooks/DAO/useCreateSubDAOProposal';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';

function SubDaoCreate() {
  const navigate = useNavigate();
  const {
    actions: { refreshSafeData },
  } = useFractal();

  const [nonce, setNonce] = useState<number>();

  const successCallback = async (daoAddress: string) => {
    await refreshSafeData();
    navigate(DAO_ROUTES.dao.relative(daoAddress));
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: GnosisDAO) => {
    proposeDao(daoData, nonce, successCallback);
  };

  return (
    <DaoCreator
      pending={pendingCreateTx}
      deployDAO={proposeSubDAO}
      isSubDAO={true}
    />
  );
}

export default SubDaoCreate;
