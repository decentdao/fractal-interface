import { abis } from '@fractal-framework/fractal-contracts';
import snapshot from '@snapshot-labs/snapshot.js';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getContract } from 'viem';
import { useWalletClient } from 'wagmi';
import { useVoteContext } from '../../../components/Proposals/ProposalVotes/context/VoteContext';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import {
  AzoriusGovernance,
  GovernanceType,
  FractalProposal,
  ExtendedSnapshotProposal,
} from '../../../types';
import encryptWithShutter from '../../../utils/shutter';
import { useTransaction } from '../../utils/useTransaction';
import useSnapshotSpaceName from '../loaders/snapshot/useSnapshotSpaceName';
import useUserERC721VotingTokens from './useUserERC721VotingTokens';

const useCastVote = ({
  proposal,
  setPending,
  extendedSnapshotProposal,
}: {
  proposal: FractalProposal;
  setPending?: React.Dispatch<React.SetStateAction<boolean>>;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
}) => {
  const [selectedChoice, setSelectedChoice] = useState<number>();
  const [snapshotWeightedChoice, setSnapshotWeightedChoice] = useState<number[]>([]);

  const {
    governanceContracts: { linearVotingErc20Address, linearVotingErc721Address },
    governance,
    node: { daoSnapshotENS },
    readOnly: {
      user: { address },
    },
  } = useFractal();
  const daoSnapshotSpaceName = useSnapshotSpaceName();
  const signer = useEthersSigner();
  const client = useMemo(() => {
    if (daoSnapshotENS) {
      return new snapshot.Client712('https://hub.snapshot.org');
    }
    return undefined;
  }, [daoSnapshotENS]);

  const azoriusGovernance = useMemo(() => governance as AzoriusGovernance, [governance]);
  const { type } = azoriusGovernance;

  const [contractCall, pending] = useTransaction();

  const { remainingTokenIds, remainingTokenAddresses } = useUserERC721VotingTokens(
    null,
    proposal.proposalId,
  );
  const { getCanVote, getHasVoted } = useVoteContext();
  const { data: walletClient } = useWalletClient();

  if (setPending) {
    setPending(pending);
  }

  useEffect(() => {
    if (extendedSnapshotProposal) {
      setSnapshotWeightedChoice(extendedSnapshotProposal.choices.map(() => 0));
    }
  }, [extendedSnapshotProposal]);

  const { t } = useTranslation('transaction');

  const handleSelectSnapshotChoice = useCallback((choiceIndex: number) => {
    setSelectedChoice(choiceIndex);
  }, []);

  const handleChangeSnapshotWeightedChoice = useCallback((choiceIndex: number, value: number) => {
    setSnapshotWeightedChoice(prevState =>
      prevState.map((choiceValue, index) => (index === choiceIndex ? value : choiceValue)),
    );
  }, []);

  const castVote = useCallback(
    async (vote: number) => {
      if (type === GovernanceType.AZORIUS_ERC20 && linearVotingErc20Address && walletClient) {
        const ozLinearVotingContract = getContract({
          abi: abis.LinearERC20Voting,
          address: linearVotingErc20Address,
          client: walletClient,
        });
        contractCall({
          contractFn: () => ozLinearVotingContract.write.vote([Number(proposal.proposalId), vote]),
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getHasVoted();
              getCanVote(true);
            }, 3000);
          },
        });
      } else if (
        type === GovernanceType.AZORIUS_ERC721 &&
        linearVotingErc721Address &&
        walletClient
      ) {
        const erc721LinearVotingContract = getContract({
          abi: abis.LinearERC721Voting,
          address: linearVotingErc721Address,
          client: walletClient,
        });
        contractCall({
          contractFn: () =>
            erc721LinearVotingContract.write.vote([
              Number(proposal.proposalId),
              vote,
              remainingTokenAddresses,
              remainingTokenIds.map(i => BigInt(i)),
            ]),
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getHasVoted();
              getCanVote(true);
            }, 3000);
          },
        });
      }
    },
    [
      contractCall,
      linearVotingErc721Address,
      getCanVote,
      getHasVoted,
      linearVotingErc20Address,
      proposal.proposalId,
      remainingTokenAddresses,
      remainingTokenIds,
      t,
      type,
      walletClient,
    ],
  );

  const castSnapshotVote = useCallback(
    async (onSuccess?: () => Promise<void>) => {
      if (
        signer &&
        signer?.provider &&
        address &&
        daoSnapshotSpaceName &&
        extendedSnapshotProposal &&
        client
      ) {
        let toastId;
        const mappedSnapshotWeightedChoice: { [choiceKey: number]: number } = {};
        if (extendedSnapshotProposal.type === 'weighted') {
          snapshotWeightedChoice.forEach((value, choiceIndex) => {
            if (value > 0) {
              mappedSnapshotWeightedChoice[choiceIndex + 1] = value;
            }
          });
        }
        const choice =
          extendedSnapshotProposal.type === 'weighted'
            ? mappedSnapshotWeightedChoice
            : (selectedChoice as number) + 1;
        try {
          toastId = toast(t('pendingCastVote'), {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            progress: 1,
          });
          if (extendedSnapshotProposal.privacy === 'shutter') {
            const encryptedChoice = await encryptWithShutter(
              JSON.stringify(choice),
              extendedSnapshotProposal.proposalId,
            );
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotSpaceName,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              privacy: extendedSnapshotProposal.privacy,
              choice: encryptedChoice!,
              app: 'decent',
            });
          } else {
            await client.vote(signer.provider as ethers.providers.Web3Provider, address, {
              space: daoSnapshotSpaceName,
              proposal: extendedSnapshotProposal.proposalId,
              type: extendedSnapshotProposal.type,
              choice,
              app: 'decent',
            });
          }
          toast.dismiss(toastId);
          toast.success(`${t('successCastVote')}. ${t('snapshotRecastVoteHelper')}`);
          setSelectedChoice(undefined);
          if (onSuccess) {
            // Need to refetch votes after timeout so that Snapshot API has enough time to record the vote
            setTimeout(() => onSuccess(), 3000);
          }
        } catch (e) {
          toast.dismiss(toastId);
          toast.error(t('failedCastVote'));
          logError('Error while casting Snapshot vote', e);
        }
      }
    },
    [
      signer,
      address,
      daoSnapshotSpaceName,
      extendedSnapshotProposal,
      t,
      selectedChoice,
      snapshotWeightedChoice,
      client,
    ],
  );

  return {
    castVote,
    castSnapshotVote,
    selectedChoice,
    snapshotWeightedChoice,
    handleSelectSnapshotChoice,
    handleChangeSnapshotWeightedChoice,
  };
};

export default useCastVote;
