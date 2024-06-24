import { Button } from '@chakra-ui/react';
import { abis } from '@fractal-framework/fractal-contracts';
import { useState, useEffect, ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../../types';
import { validateENSName } from '../../../../utils/url';
import { InputComponent } from '../../../ui/forms/InputComponent';
import { SettingsSection } from './SettingsSection';

export function MetadataContainer() {
  const [name, setName] = useState('');
  const [snapshotENS, setSnapshotENS] = useState('');
  const [snapshotENSValid, setSnapshotENSValid] = useState<boolean>();
  const { t } = useTranslation(['settings', 'proposalMetadata']);
  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const {
    node: { daoName, daoSnapshotENS, daoAddress, safe },
    readOnly: {
      user: { votingWeight },
    },
  } = useFractal();
  const {
    addressPrefix,
    contracts: { keyValuePairs, fractalRegistry },
  } = useNetworkConfig();

  useEffect(() => {
    if (daoName && daoAddress && createAccountSubstring(daoAddress) !== daoName) {
      setName(daoName);
    }

    if (daoSnapshotENS) {
      setSnapshotENS(daoSnapshotENS);
    }
  }, [daoName, daoSnapshotENS, daoAddress]);

  const handleSnapshotENSChange: ChangeEventHandler<HTMLInputElement> = e => {
    setSnapshotENS(e.target.value);
    if (validateENSName(e.target.value)) {
      setSnapshotENSValid(true);
    } else {
      setSnapshotENSValid(false);
    }
  };

  const userHasVotingWeight = votingWeight > 0n;

  const submitProposalSuccessCallback = () => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  const handleEditDAOName = () => {
    const encodedUpdateDAOName = encodeFunctionData({
      abi: abis.FractalRegistry,
      functionName: 'updateDAOName',
      args: [name],
    });

    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('updatesSafeName', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [fractalRegistry],
      values: [0n],
      calldatas: [encodedUpdateDAOName],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nextNonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  const handleEditDAOSnapshotENS = () => {
    const encodedUpdateValues = encodeFunctionData({
      abi: abis.KeyValuePairs,
      functionName: 'updateValues',
      args: [['snapshotENS'], [snapshotENS]],
    });

    const proposalData: ProposalExecuteData = {
      metaData: {
        title: t('updateSnapshotSpace', { ns: 'proposalMetadata' }),
        description: '',
        documentationUrl: '',
      },
      targets: [keyValuePairs],
      values: [0n],
      calldatas: [encodedUpdateValues],
    };

    submitProposal({
      proposalData,
      nonce: safe?.nextNonce,
      pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
      successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
      failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
      successCallback: submitProposalSuccessCallback,
    });
  };

  return (
    <SettingsSection
      title={t('daoMetadataName')}
      headerRight={
        canUserCreateProposal && (
          <Button
            variant="secondary"
            size="sm"
            isDisabled={name === daoName}
            onClick={handleEditDAOName}
          >
            {t('proposeChanges')}
          </Button>
        )
      }
      descriptionHeader={t('daoMetadataDescriptionTitle')}
      descriptionContent={t('daoMetadataDescriptionText')}
      nestedSection={{
        title: t('daoMetadataSnapshot'),
        headerRight: canUserCreateProposal && (
          <Button
            variant="secondary"
            size="sm"
            isDisabled={!snapshotENSValid || snapshotENS === daoSnapshotENS}
            onClick={handleEditDAOSnapshotENS}
          >
            {t('proposeChanges')}
          </Button>
        ),
        children: (
          <InputComponent
            isRequired={false}
            onChange={handleSnapshotENSChange}
            value={snapshotENS}
            disabled={!userHasVotingWeight}
            placeholder="example.eth"
            testId="daoSettings.snapshotENS"
            gridContainerProps={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              flex: '1',
              width: '100%',
            }}
            inputContainerProps={{
              width: '100%',
            }}
          />
        ),
      }}
    >
      <InputComponent
        isRequired={false}
        onChange={e => setName(e.target.value)}
        disabled={!userHasVotingWeight}
        value={name}
        placeholder="Amazing DAO"
        testId="daoSettings.name"
        gridContainerProps={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          flex: '1',
          width: '100%',
        }}
        inputContainerProps={{
          width: '100%',
        }}
      />
    </SettingsSection>
  );
}
