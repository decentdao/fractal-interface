import { ProposalData } from "../../../../daoData/useProposals";
import useDisplayName from "../../../../hooks/useDisplayName";
import CopyToClipboard from "../../../ui/CopyToClipboard";
import StatusBox from "../../../ui/StatusBox";
import Clock from "../../../ui/svg/Clock";

function ProposalCardDetailed({ proposal }: { proposal: ProposalData }) {
  const proposerDisplayName = useDisplayName(proposal.proposer);

  return (
    <div className="flex flex-col bg-gray-600 m-2 py-2 rounded-md">
      <div className="flex flex-row align-middle mx-4 my-2">
        <StatusBox status={proposal.stateString} />
        <div className="flex self-center text-gray-25 mx-2">#{proposal.number}</div>
        <div className="flex self-center">
          <Clock />
        </div>
        <div className="flex self-center text-gray-50 mx-1">
          {proposal.startTimeString} - {proposal.endTimeString}
        </div>
      </div>
      <div className="text-gray-25 mx-4 my-2">{proposal.description}</div>
      {/* @todo add full description link */}
      <div className="mt-4 py-4 mx-4 border-t border-gray-200">
        <div className="flex justify-between items-center max-w-xs my-1">
          <div className="text-gray-50">Created By:</div>
          <div className="text-gold-500 ml-1">{proposerDisplayName}</div>
          <CopyToClipboard textToCopy={proposal.proposer} />
        </div>
        <div className="flex justify-between items-center text-gray-50 max-w-xs">
          <div>Proposal ID: </div>
          <div>{proposal.idSubstring}</div>
          <CopyToClipboard textToCopy={proposal.id.toString()} />
        </div>
      </div>
    </div>
  );
}

export default ProposalCardDetailed;
