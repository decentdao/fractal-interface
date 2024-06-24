import { abis } from '@fractal-framework/fractal-contracts';
import { useEffect, useCallback, useRef } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
// get list of approvals; approval [0] should be token claim
// query using attach = masterTokenClaim.attach(approval[0]).queryFilter()
// check if module is tokenClaim;
// set token claim;

export function useERC20Claim() {
  const {
    node: { daoAddress },
    governanceContracts: { votesTokenAddress },
    action,
  } = useFractal();
  const publicClient = usePublicClient();

  const loadTokenClaimContract = useCallback(async () => {
    if (!votesTokenAddress || !publicClient) {
      return;
    }

    const votesTokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    // TODO here be dark programming...

    const approvals = await votesTokenContract.getEvents.Approval(undefined, { fromBlock: 0n });

    if (approvals.length === 0 || !approvals[0].args.spender) {
      return;
    }

    const possibleTokenClaimContract = getContract({
      abi: abis.ERC20Claim,
      address: approvals[0].args.spender,
      client: publicClient,
    });

    const tokenClaimArray = await possibleTokenClaimContract.getEvents
      .ERC20ClaimCreated({ fromBlock: 0n })
      .catch(() => []);

    const childToken = tokenClaimArray[0].args.childToken;

    if (!tokenClaimArray.length || !childToken || childToken === votesTokenAddress) {
      return;
    }
    // action to governance
    action.dispatch({
      type: FractalGovernanceAction.SET_CLAIMING_CONTRACT,
      payload: approvals[0].args.spender,
    });
  }, [action, publicClient, votesTokenAddress]);

  const loadKey = useRef<string>();

  useEffect(() => {
    if (daoAddress && votesTokenAddress && daoAddress + votesTokenAddress !== loadKey.current) {
      loadKey.current = daoAddress + votesTokenAddress;
      loadTokenClaimContract();
    }
    if (!daoAddress || !votesTokenAddress) {
      loadKey.current = undefined;
    }
  }, [loadTokenClaimContract, daoAddress, votesTokenAddress]);
  return;
}
