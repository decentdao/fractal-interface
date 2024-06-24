import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useMemo } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { VotingStrategyType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { useTimeHelpers } from '../../../utils/useTimeHelpers';

export const useERC721LinearStrategy = () => {
  const {
    governanceContracts: { linearVotingErc721Address, moduleAzoriusAddress },
    action,
  } = useFractal();
  const { getTimeDuration } = useTimeHelpers();
  const publicClient = usePublicClient();

  const erc721LinearVotingContract = useMemo(() => {
    if (!linearVotingErc721Address || !publicClient) {
      return;
    }

    return getContract({
      abi: abis.LinearERC721Voting,
      address: linearVotingErc721Address,
      client: publicClient,
    });
  }, [linearVotingErc721Address, publicClient]);

  const loadERC721Strategy = useCallback(async () => {
    if (!moduleAzoriusAddress || !erc721LinearVotingContract || !publicClient) {
      return;
    }

    const azoriusContract = getContract({
      abi: abis.Azorius,
      address: moduleAzoriusAddress,
      client: publicClient,
    });

    const [votingPeriodBlocks, quorumThreshold, timeLockPeriod] = await Promise.all([
      erc721LinearVotingContract.read.votingPeriod(),
      erc721LinearVotingContract.read.quorumThreshold(),
      azoriusContract.read.timelockPeriod(),
    ]);

    const votingPeriodValue = await blocksToSeconds(votingPeriodBlocks, publicClient);
    const timeLockPeriodValue = await blocksToSeconds(timeLockPeriod, publicClient);
    const votingData = {
      votingPeriod: {
        value: BigInt(votingPeriodValue),
        formatted: getTimeDuration(votingPeriodValue),
      },
      quorumThreshold: {
        value: quorumThreshold,
        formatted: quorumThreshold.toString(),
      },
      timeLockPeriod: {
        value: BigInt(timeLockPeriodValue),
        formatted: getTimeDuration(timeLockPeriodValue),
      },
      strategyType: VotingStrategyType.LINEAR_ERC721,
    };
    action.dispatch({ type: FractalGovernanceAction.SET_STRATEGY, payload: votingData });
  }, [action, moduleAzoriusAddress, erc721LinearVotingContract, getTimeDuration, publicClient]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }

    const unwatch = erc721LinearVotingContract.watchEvent.VotingPeriodUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.votingPeriod) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_PERIOD,
            payload: BigInt(log.args.votingPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc721LinearVotingContract]);

  useEffect(() => {
    if (!erc721LinearVotingContract) {
      return;
    }

    const unwatch = erc721LinearVotingContract.watchEvent.QuorumThresholdUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.quorumThreshold) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD,
            payload: log.args.quorumThreshold,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [erc721LinearVotingContract, action]);

  return loadERC721Strategy;
};
