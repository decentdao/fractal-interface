import { abis } from '@fractal-framework/fractal-contracts';
import {
  AllTransactionsListResponse,
  EthereumTxWithTransfersResponse,
  SafeMultisigTransactionWithTransfersResponse,
  TransferWithTokenInfoResponse,
} from '@safe-global/safe-service-client';
import { useCallback } from 'react';
import { Address, getAddress, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { isApproved, isRejected } from '../../helpers/activity';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import {
  AssetTotals,
  SafeTransferType,
  ActivityEventType,
  Activity,
  FractalProposalState,
} from '../../types';
import { formatWeiToValue, isModuleTx, isMultiSigTx, parseDecodedData } from '../../utils';
import { getAverageBlockTime } from '../../utils/contract';
import { getTxTimelockedTimestamp } from '../../utils/guard';
import { useSafeDecoder } from './useSafeDecoder';

type FreezeGuardData = {
  guardTimelockPeriodMs: bigint;
  guardExecutionPeriodMs: bigint;
  lastBlockTimestamp: number;
};

export const useSafeTransactions = () => {
  const { chain } = useNetworkConfig();
  const { guardContracts } = useFractal();
  const decode = useSafeDecoder();
  const publicClient = usePublicClient();

  const getState = useCallback(
    async (
      activities: Activity[],
      freezeGuardAddress?: Address,
      freezeGuardData?: FreezeGuardData,
    ) => {
      if (freezeGuardAddress && freezeGuardData && publicClient) {
        return Promise.all(
          activities.map(async (activity, _, activityArr) => {
            if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
              return activity;
            }
            if (isModuleTx(activity.transaction)) {
              return {
                ...activity,
                state: FractalProposalState.MODULE,
              };
            }

            const multiSigTransaction =
              activity.transaction as SafeMultisigTransactionWithTransfersResponse;

            let state: FractalProposalState;

            if (multiSigTransaction.isExecuted) {
              // the transaction has already been executed
              state = FractalProposalState.EXECUTED;
            } else if (isRejected(activityArr, multiSigTransaction)) {
              // a different transaction with the same nonce has already
              // been executed, so this is no longer valid
              state = FractalProposalState.REJECTED;
            } else {
              // it's not executed or rejected, so we need to check the timelock status
              const timelockedTimestampMs =
                (await getTxTimelockedTimestamp(activity, freezeGuardAddress, publicClient)) * 1000;
              if (timelockedTimestampMs === 0) {
                // not yet timelocked
                if (isApproved(multiSigTransaction)) {
                  // the proposal has enough signatures, so it can now be timelocked
                  state = FractalProposalState.TIMELOCKABLE;
                } else {
                  // not enough signatures on the proposal, it's still active
                  state = FractalProposalState.ACTIVE;
                }
              } else {
                // the proposal has been timelocked

                const timeLockPeriodEndMs =
                  timelockedTimestampMs + Number(freezeGuardData.guardTimelockPeriodMs);
                const nowMs = freezeGuardData.lastBlockTimestamp * 1000;
                if (nowMs > timeLockPeriodEndMs) {
                  // Timelock has ended, check execution period
                  const executionPeriodEndMs =
                    timeLockPeriodEndMs + Number(freezeGuardData.guardExecutionPeriodMs);
                  if (nowMs < executionPeriodEndMs) {
                    // Within execution period
                    state = FractalProposalState.EXECUTABLE;
                  } else {
                    // Execution period has ended
                    state = FractalProposalState.EXPIRED;
                  }
                } else {
                  // Still within timelock period
                  state = FractalProposalState.TIMELOCKED;
                }
              }
            }
            return { ...activity, state };
          }),
        );
      } else {
        return activities.map((activity, _, activityArr) => {
          if (activity.eventType !== ActivityEventType.Governance || !activity.transaction) {
            return activity;
          }
          if (isModuleTx(activity.transaction)) {
            return {
              ...activity,
              state: FractalProposalState.MODULE,
            };
          }

          const multiSigTransaction =
            activity.transaction as SafeMultisigTransactionWithTransfersResponse;

          let state;
          if (multiSigTransaction.isExecuted) {
            state = FractalProposalState.EXECUTED;
          } else if (isRejected(activityArr, multiSigTransaction)) {
            state = FractalProposalState.REJECTED;
          } else if (isApproved(multiSigTransaction)) {
            state = FractalProposalState.EXECUTABLE;
          } else {
            state = FractalProposalState.ACTIVE;
          }
          return { ...activity, state };
        });
      }
    },
    [publicClient],
  );

  const getTransferTotal = useCallback(
    (transfers: TransferWithTokenInfoResponse[]) => {
      return transfers.reduce(
        (prev: Map<string, AssetTotals>, cur: TransferWithTokenInfoResponse) => {
          if (cur.type === SafeTransferType.ETHER && cur.value) {
            const prevValue = prev.get(zeroAddress)!;
            if (prevValue) {
              prev.set(zeroAddress, {
                bi: prevValue.bi + BigInt(cur.value),
                symbol: chain.nativeCurrency.symbol,
                decimals: 18,
              });
            }
            prev.set(zeroAddress, {
              bi: BigInt(cur.value),
              symbol: chain.nativeCurrency.symbol,
              decimals: 18,
            });
          }
          if (cur.type === SafeTransferType.ERC721 && cur.tokenInfo && cur.tokenId) {
            prev.set(`${cur.tokenAddress}:${cur.tokenId}`, {
              bi: 1n,
              symbol: cur.tokenInfo.symbol,
              decimals: 0,
            });
          }
          if (cur.type === SafeTransferType.ERC20 && cur.value && cur.tokenInfo) {
            const prevValue = prev.get(cur.tokenInfo.address);
            if (prevValue) {
              prev.set(cur.tokenInfo.address, {
                ...prevValue,
                bi: prevValue.bi + BigInt(cur.value),
              });
            } else {
              prev.set(cur.tokenAddress!, {
                bi: BigInt(cur.value),
                symbol: cur.tokenInfo.symbol,
                decimals: cur.tokenInfo.decimals,
              });
            }
          }

          return prev;
        },
        new Map(),
      );
    },
    [chain],
  );

  const parseTransactions = useCallback(
    async (transactions: AllTransactionsListResponse, daoAddress: string) => {
      if (!transactions.results.length) {
        return [];
      }

      const transactionsWithoutModuleTransactions = transactions.results.filter(
        transaction => !isModuleTx(transaction),
      );

      const activities = await Promise.all(
        transactionsWithoutModuleTransactions.map(async (transaction, _, transactionArr) => {
          const multiSigTransaction = transaction as SafeMultisigTransactionWithTransfersResponse;
          const ethereumTransaction = transaction as EthereumTxWithTransfersResponse;

          const isMultiSigTransaction = isMultiSigTx(transaction);

          // @note for ethereum transactions event these are the execution date
          const eventDate = new Date(
            multiSigTransaction.submissionDate || ethereumTransaction.executionDate,
          );

          // @note it can be assumed that if there is no transfers it a receiving event
          const isDeposit: boolean = transaction.transfers.length
            ? transaction.transfers.every(t => t.to.toLowerCase() === daoAddress.toLowerCase())
            : false;

          // returns mapping of Asset -> Asset Total Value by getting the total of each asset transfered
          const transferAmountTotalsMap = getTransferTotal(transaction.transfers);

          // formats totals array into readable string with Symbol ie 1 [NativeSymbol]
          const transferAmountTotals: string[] = Array.from(transferAmountTotalsMap.values()).map(
            token => {
              const totalAmount = formatWeiToValue(token.bi, token.decimals);
              const symbol = token.symbol;
              return `${totalAmount} ${symbol}`;
            },
          );

          // maps address for each transfer
          const transferAddresses = transaction.transfers.map(transfer =>
            transfer.to.toLowerCase() === daoAddress.toLowerCase()
              ? getAddress(transfer.from)
              : getAddress(transfer.to),
          );

          // @note this indentifies transaction a simple ETH transfer
          const isEthSend =
            isMultiSigTransaction &&
            !multiSigTransaction.data &&
            !multiSigTransaction.isExecuted &&
            BigInt(multiSigTransaction.value) !== 0n;

          if (isEthSend) {
            transferAmountTotals.push(
              `${formatWeiToValue(multiSigTransaction.value, 18)} ${chain.nativeCurrency.symbol}`,
            );
            transferAddresses.push(getAddress(multiSigTransaction.to));
          }

          const eventSafeTxHash = multiSigTransaction.safeTxHash;

          const eventType = isMultiSigTransaction
            ? ActivityEventType.Governance
            : ActivityEventType.Treasury;

          const eventNonce = multiSigTransaction.nonce;

          // @note identifies transactions with same nonce. this can be used to identify rejected transactions
          const noncePair = transactionArr.find(tx => {
            const multiSigTx = tx as SafeMultisigTransactionWithTransfersResponse;
            return (
              multiSigTx.nonce === eventNonce &&
              multiSigTx.safeTxHash !== multiSigTransaction.safeTxHash
            );
          });

          const isMultisigRejectionTx: boolean | undefined =
            isMultiSigTransaction &&
            !multiSigTransaction.data &&
            multiSigTransaction.to === multiSigTransaction.safe &&
            noncePair &&
            BigInt(multiSigTransaction.value) === 0n;

          const confirmations = multiSigTransaction.confirmations
            ? multiSigTransaction.confirmations
            : [];

          const data =
            isMultiSigTransaction && multiSigTransaction.dataDecoded
              ? {
                  decodedTransactions: parseDecodedData(multiSigTransaction, isMultiSigTransaction),
                }
              : {
                  decodedTransactions: await decode(
                    multiSigTransaction.value,
                    getAddress(multiSigTransaction.to),
                    multiSigTransaction.data,
                  ),
                };

          const targets = data
            ? [...data.decodedTransactions.map(tx => tx.target)]
            : [getAddress(transaction.to)];

          const activity: Activity = {
            transaction,
            transferAddresses,
            transferAmountTotals,
            isDeposit,
            eventDate,
            eventType,
            confirmations,
            signersThreshold: multiSigTransaction.confirmationsRequired,
            multisigRejectedProposalNumber:
              isMultisigRejectionTx && !!noncePair
                ? (noncePair as SafeMultisigTransactionWithTransfersResponse).safeTxHash
                : undefined,
            proposalId: eventSafeTxHash,
            targets,
            // @todo typing for `multiSigTransaction.transactionHash` is misleading, as ` multiSigTransaction.transactionHash` is not always defined (if ever). Need to tighten up the typing here.
            transactionHash:
              multiSigTransaction.transactionHash ||
              (transaction as SafeMultisigTransactionWithTransfersResponse).safeTxHash,
            data: data,
            state: null,
            nonce: eventNonce,
          };
          return activity;
        }),
      );
      let freezeGuardData: FreezeGuardData | undefined;

      if (guardContracts.freezeGuardContractAddress && publicClient) {
        const blockNumber = await publicClient.getBlockNumber();
        const averageBlockTime = BigInt(Math.round(await getAverageBlockTime(publicClient)));
        const freezeGuard = getContract({
          address: guardContracts.freezeGuardContractAddress,
          abi: abis.MultisigFreezeGuard,
          client: publicClient,
        });

        const [timelockPeriod, executionPeriod, block] = await Promise.all([
          freezeGuard.read.timelockPeriod(),
          freezeGuard.read.executionPeriod(),
          publicClient.getBlock({ blockNumber: blockNumber }),
        ]);

        freezeGuardData = {
          guardTimelockPeriodMs: BigInt(timelockPeriod) * BigInt(averageBlockTime) * 1000n,
          guardExecutionPeriodMs: BigInt(executionPeriod) * BigInt(averageBlockTime) * 1000n,
          lastBlockTimestamp: Number(block.timestamp),
        };
      }

      // todo: Some of these activities may be completed and can be cached
      const activitiesWithState = await getState(
        activities,
        guardContracts.freezeGuardContractAddress,
        freezeGuardData,
      );

      return activitiesWithState;
    },
    [
      chain.nativeCurrency.symbol,
      decode,
      getState,
      getTransferTotal,
      guardContracts.freezeGuardContractAddress,
      publicClient,
    ],
  );
  return { parseTransactions };
};
