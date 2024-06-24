import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export const createAccountSubstring = (account: string) => {
  return `${account.substring(0, 6)}...${account.slice(-4)}`;
};

/**
 * Gets the 'display name' of an Ethereum address, by first checking if there is a corresponding
 * Primary ENS Name (reverse record), otherwise returning a truncated address in the form
 * 0xbFC4...7551
 *
 * This is intended to be used for NON DAO display names.  If you would like to get the
 * display name for a DAO, use the useDAOName hook instead.
 * @todo Should switch to object for props
 */
const useDisplayName = (account?: Address | null, truncate?: boolean, chainId?: number) => {
  if (truncate === undefined) truncate = true;
  const { chain } = useNetworkConfig();
  const { data: ensName } = useEnsName({
    address: !!account ? account : undefined,
    chainId: chainId || chain.id,
  });

  const [accountSubstring, setAccountSubstring] = useState<string>();
  useEffect(() => {
    if (!account) {
      setAccountSubstring(undefined);
      return;
    }

    setAccountSubstring(createAccountSubstring(account));
  }, [account]);

  const [displayName, setDisplayName] = useState<string>('');
  useEffect(() => {
    if (!accountSubstring || !account) {
      setDisplayName('');
      return;
    }

    if (!ensName) {
      setDisplayName(truncate ? accountSubstring : account);
      return;
    }

    setDisplayName(ensName);
  }, [account, accountSubstring, ensName, truncate]);

  return { displayName, accountSubstring };
};

export default useDisplayName;
