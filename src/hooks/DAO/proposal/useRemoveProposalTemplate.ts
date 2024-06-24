import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';

export default function useRemoveProposalTemplate() {
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();

  const {
    contracts: { keyValuePairs },
  } = useNetworkConfig();

  const prepareRemoveProposalTemplateProposal = useCallback(
    async (templateIndex: number) => {
      if (proposalTemplates) {
        const proposalMetadata = {
          title: 'removeProposalTemplateTitle',
          description: 'removeProposalTemplateDescription',
          documentationUrl: '',
        };

        const updatedTemplatesList = proposalTemplates.filter(
          (_, index: number) => index !== templateIndex,
        );

        const { Hash } = await client.add(JSON.stringify(updatedTemplatesList));

        const encodedUpdateValues = encodeFunctionData({
          abi: abis.KeyValuePairs,
          functionName: 'updateValues',
          args: [['proposalTemplates'], [Hash]],
        });

        const proposal: ProposalExecuteData = {
          metaData: proposalMetadata,
          targets: [keyValuePairs],
          values: [0n],
          calldatas: [encodedUpdateValues],
        };

        return proposal;
      }
    },
    [client, keyValuePairs, proposalTemplates],
  );

  return { prepareRemoveProposalTemplateProposal };
}
