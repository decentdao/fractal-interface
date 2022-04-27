import { connect } from "../web3/providers";
import Button from "./ui/Button";
import { useWeb3 } from "../web3";

const ConnectModal = () => {
  const { account } = useWeb3();

  if (account) {
    return <></>;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      <h2 className="text-center text-white text-xl font-semibold">
        Connect Your Account
      </h2>
      <p className="w-1/3 text-center text-white pb-4">
        You need to connect your account to create a fractal
      </p>
      <Button
        onClick={connect}
        disabled={false}
        addedClassNames="px-8 py-2 mx-2"
      >
        connect wallet
      </Button>
    </div>
  );
};

export default ConnectModal;
