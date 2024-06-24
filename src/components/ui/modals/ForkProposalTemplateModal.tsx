import { Box, Button } from '@chakra-ui/react';
import { ChangeEventHandler, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { DAO_ROUTES } from '../../../constants/routes';
import { useIsSafe } from '../../../hooks/safe/useIsSafe';
import { validateAddress } from '../../../hooks/schemas/common/useValidationAddress';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalTemplate } from '../../../types/proposalBuilder';
import { InputComponent } from '../forms/InputComponent';
import Divider from '../utils/Divider';

interface IForkProposalTemplateModalProps {
  proposalTemplate: ProposalTemplate;
  templateIndex: number;
  onClose: () => void;
}

export default function ForkProposalTemplateModal({
  templateIndex,
  onClose,
}: IForkProposalTemplateModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [targetDAOAddress, setTargetDAOAddress] = useState('');
  const [isValidDAOAddress, setIsValidDAOAddress] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation('proposalTemplate');
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const { chain, addressPrefix } = useNetworkConfig();
  const {
    node: { proposalTemplatesHash },
  } = useFractal();

  const { isSafe, isSafeLoading } = useIsSafe(targetDAOAddress);
  const { getCanUserCreateProposal } = useCanUserCreateProposal();

  const handleAddressChange: ChangeEventHandler<HTMLInputElement> = e => {
    setInputValue(e.target.value);
    setTargetDAOAddress(e.target.value);
  };

  const validateDAOAddress = useCallback(async () => {
    if (!inputValue || isSafeLoading || !publicClient) {
      setError('');
      return false;
    }

    const {
      validation: { address, isValidAddress },
    } = await validateAddress({ address: inputValue, publicClient });

    if (!isValidAddress) {
      setError(t('errorInvalidAddress', { ns: 'common' }));
    } else {
      setTargetDAOAddress(address);
      if (isSafe) {
        if (await getCanUserCreateProposal(getAddress(address))) {
          setError('');
        } else {
          setError(t('errorNotProposer'));
          return false;
        }
      } else {
        setError(t('errorFailedSearch', { ns: 'dashboard', chain: chain.name }));
        return false;
      }
    }

    return isValidAddress;
  }, [getCanUserCreateProposal, inputValue, isSafe, isSafeLoading, chain, publicClient, t]);

  const handleSubmit = () => {
    navigate(
      `${DAO_ROUTES.proposalTemplateNew.relative(
        addressPrefix,
        targetDAOAddress,
      )}&templatesHash=${proposalTemplatesHash}&templateIndex=${templateIndex}`,
    );
    onClose();
  };

  useEffect(() => {
    const validate = async () => {
      if (!isSafeLoading) {
        const isValidAddress = await validateDAOAddress();
        if (isValidDAOAddress !== isValidAddress) {
          setIsValidDAOAddress(isValidAddress);
        }
      }
    };

    validate();
  }, [isSafeLoading, validateDAOAddress, isValidDAOAddress]);

  return (
    <Box>
      <InputComponent
        isRequired
        value={inputValue}
        onChange={handleAddressChange}
        testId="dao-address"
        placeholder="example.eth"
        label={t('targetDAOAddressLabel')}
        helper={t('targetDAOAddressHelper')}
        errorMessage={error}
        isInvalid={!!error}
        helperSlot="end"
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
      <Divider my={4} />
      <Button
        onClick={handleSubmit}
        variant="primary"
        isDisabled={!isValidDAOAddress}
        width="100%"
      >
        {t('forkTemplateSubmitButton')}
      </Button>
    </Box>
  );
}
