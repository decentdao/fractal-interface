import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC20LinearStrategy = () => {
  const {
    governanceContracts: { linearVotingErc20Address, moduleAzoriusAddress },
    action,
  } = useFractal();
  const { getTimeDuration } = useTimeHelpers();
  const publicClient = usePublicClient();

  const ozLinearVotingContract = useMemo(() => {
    if (!linearVotingErc20Address || !publicClient) {
      return;
    }

    return getContract({
      abi: abis.LinearERC20Voting,
      address: linearVotingErc20Address,
      client: publicClient,
    });
  }, [linearVotingErc20Address, publicClient]);

  const loadERC20Strategy = useCallback(async () => {
    if (!ozLinearVotingContract || !moduleAzoriusAddress || !publicClient) {
      return {};
    }

    const azoriusContract = getContract({
      abi: abis.Azorius,
      address: moduleAzoriusAddress,
      client: publicClient,
    });
    const [votingPeriodBlocks, quorumNumerator, quorumDenominator, timeLockPeriod] =
      await Promise.all([
        ozLinearVotingContract.read.votingPeriod(),
        ozLinearVotingContract.read.quorumNumerator(),
        ozLinearVotingContract.read.QUORUM_DENOMINATOR(),
        azoriusContract.read.timelockPeriod(),
      ]);

    const quorumPercentage = (quorumNumerator * 100n) / quorumDenominator;
    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, publicClient);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, publicClient);
    const votingData = {
      votingPeriod: {
        value: BigInt(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumPercentage: {
        value: quorumPercentage,
        formatted: quorumPercentage.toString() + '%',
      },
      timeLockPeriod: {
        value: BigInt(timeLockPeriodValue),
        formatted: getTimeDuration(timeLockPeriodValue),
      },
      strategyType: VotingStrategyType.LINEAR_ERC20,
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [action, moduleAzoriusAddress, getTimeDuration, ozLinearVotingContract, publicClient]);

  useEffect(() => {
    if (!ozLinearVotingContract || !publicClient) {
      return;
    }

    const unwatch = ozLinearVotingContract.watchEvent.VotingPeriodUpdated({
      onLogs: logs => {
        const lastLog = logs.pop();
        if (lastLog && lastLog.args.votingPeriod) {
          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
            payload: BigInt(lastLog.args.votingPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, ozLinearVotingContract, publicClient]);

  useEffect(() => {
    if (!ozLinearVotingContract) {
      return;
    }

    const unwatch = ozLinearVotingContract.watchEvent.QuorumNumeratorUpdated({
      onLogs: logs => {
        const lastLog = logs.pop();
        if (lastLog && lastLog.args.quorumNumerator) {
          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_QUORUM,
            payload: lastLog.args.quorumNumerator,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, ozLinearVotingContract]);

  return loadERC20Strategy;
};
