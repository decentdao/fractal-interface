import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import EtherscanLink from "../ui/EtherscanLink";
import useAddress from "../../hooks/useAddress";
import useIsDAO from "../../hooks/useIsDAO";
import SearchingDAO from "./SearchingDAO";
import { useDAOData } from "../../daoData";
import H1 from "../ui/H1";

function ValidDAO({ address }: { address: string }) {
  const [{ name, accessControlAddress, moduleAddresses }, setDAOAddress] =
    useDAOData();

  useEffect(() => {
    setDAOAddress(address);
  }, [address, setDAOAddress]);

  return (
    <div>
      <H1>
        <EtherscanLink address={address}>
          <span className="break-all">{address}</span>
        </EtherscanLink>{" "}
        is a valid dao!
      </H1>
      <div>
        <div>name: {name}</div>
        <div>access control address: {accessControlAddress}</div>
        {moduleAddresses?.map((address, index) => (
          <div key={address}>
            Module {index}: {address}
          </div>
        ))}
      </div>
    </div>
  );
}

function FoundValidDAO({ address }: { address: string | undefined }) {
  if (address !== undefined) {
    return <ValidDAO address={address} />;
  }

  return <></>;
}

function Search() {
  const params = useParams();
  const [address, validAddress, addressLoading] = useAddress(params.address);
  const [addressIsDAO, isDAOLoading] = useIsDAO(address);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(addressLoading || isDAOLoading);
  }, [addressLoading, isDAOLoading]);

  return (
    <SearchingDAO
      searchAddress={params.address}
      loading={loading}
      validAddress={validAddress}
      address={address}
      addressIsDAO={addressIsDAO}
      validDAOComponent={<FoundValidDAO address={address} />}
    />
  );
}

function DAO() {
  const location = useLocation();

  const [validatedAddress, setValidatedAddress] = useState(
    (location.state as { validatedAddress: string } | null)?.validatedAddress
  );
  useEffect(() => {
    if (!location || !location.state) {
      setValidatedAddress(undefined);
      return;
    }

    const locationState = location.state as { validatedAddress: string };
    setValidatedAddress(locationState.validatedAddress);
  }, [location]);

  if (validatedAddress) {
    return <ValidDAO address={validatedAddress} />;
  }

  return <Search />;
}

export default DAO;
