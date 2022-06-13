import { useState, useEffect } from 'react';
import {
  GovernorModule,
  GovernorModule__factory,
} from '../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';

const useGovernorModuleContract = (moduleAddresses: string[] | undefined) => {
  const [governorModule, setGovernorModule] = useState<GovernorModule>();
  const {
    state: { provider },
  } = useWeb3Provider();

  useEffect(() => {
    if (moduleAddresses === undefined || moduleAddresses[1] === undefined || !provider) {
      setGovernorModule(undefined);
      return;
    }

    setGovernorModule(GovernorModule__factory.connect(moduleAddresses[1], provider));
  }, [moduleAddresses, provider]);

  return governorModule;
};

export default useGovernorModuleContract;
