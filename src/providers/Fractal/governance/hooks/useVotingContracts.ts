import {
  VotesToken,
  OZLinearVoting,
  FractalUsul,
  ModuleProxyFactory,
} from '@fractal-framework/fractal-contracts';
import { Dispatch, useEffect, useMemo, useCallback } from 'react';
import { asProper } from '../../../../helpers';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import { ContractConnection } from '../../../../types';
import { GovernanceAction, GovernanceActions } from '../actions';
import { GnosisModuleType } from '../types';
import { IGnosis } from './../../types/state';

interface IUseVotingContracts {
  gnosis: IGnosis;
  governanceDispatch: Dispatch<GovernanceActions>;
  chainId: number;
}

export const useVotingContracts = ({
  gnosis: { modules, isGnosisLoading },
  governanceDispatch,
  chainId,
}: IUseVotingContracts) => {
  const {
    zodiacModuleProxyFactoryContract,
    linearVotingMasterCopyContract,
    votesTokenMasterCopyContract,
    fractalUsulMasterCopyContract,
  } = useSafeContracts();

  const usulModule = useMemo(
    () => modules.find(module => module.moduleType === GnosisModuleType.USUL)?.moduleContract,
    [modules]
  ) as FractalUsul | undefined;

  const loadUsulContracts = useCallback(async () => {
    if (
      !zodiacModuleProxyFactoryContract ||
      !linearVotingMasterCopyContract ||
      !votesTokenMasterCopyContract ||
      !fractalUsulMasterCopyContract ||
      isGnosisLoading
    ) {
      return;
    }

    if (!usulModule) {
      governanceDispatch({
        type: GovernanceAction.CONTRACTS_LOADED,
      });
      return;
    }

    const usulContract = {
      asProvider: fractalUsulMasterCopyContract.asProvider.attach(usulModule.address),
      asSigner: fractalUsulMasterCopyContract.asSigner.attach(usulModule.address),
    };
    let ozLinearContract: ContractConnection<OZLinearVoting> | undefined;
    let tokenContract: ContractConnection<VotesToken> | undefined;

    const votingContractAddress = await asProper<FractalUsul>(usulContract, chainId)
      .queryFilter(usulModule.filters.EnabledStrategy())
      .then(strategiesEnabled => {
        return strategiesEnabled[0].args.strategy;
      });

    const proper = asProper<ModuleProxyFactory>(zodiacModuleProxyFactoryContract, chainId);
    const filter = proper.filters.ModuleProxyCreation(votingContractAddress, null);
    const votingContractMasterCopyAddress = await proper
      .queryFilter(filter)
      .then(proxiesCreated => {
        return proxiesCreated[0].args.masterCopy;
      });

    if (votingContractMasterCopyAddress === linearVotingMasterCopyContract.asProvider.address) {
      ozLinearContract = {
        asSigner: linearVotingMasterCopyContract.asSigner.attach(votingContractAddress),
        asProvider: linearVotingMasterCopyContract.asProvider.attach(votingContractAddress),
      };
    }
    if (ozLinearContract) {
      const govTokenAddress = await ozLinearContract.asSigner.governanceToken();
      tokenContract = {
        asSigner: votesTokenMasterCopyContract.asSigner.attach(govTokenAddress),
        asProvider: votesTokenMasterCopyContract.asProvider.attach(govTokenAddress),
      };
    }
    governanceDispatch({
      type: GovernanceAction.SET_USUL_CONTRACTS,
      payload: {
        ozLinearVotingContract: ozLinearContract,
        usulContract: usulContract,
        tokenContract: tokenContract,
        contractsIsLoading: false,
      },
    });
  }, [
    fractalUsulMasterCopyContract,
    votesTokenMasterCopyContract,
    governanceDispatch,
    zodiacModuleProxyFactoryContract,
    linearVotingMasterCopyContract,
    usulModule,
    isGnosisLoading,
  ]);

  useEffect(() => {
    loadUsulContracts();
  }, [loadUsulContracts]);
};
