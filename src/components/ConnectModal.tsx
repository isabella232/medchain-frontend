import classnames from "classnames";
import { FunctionComponent, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import Modal from "react-modal";
import { ConnectButton } from "../components/Buttons";
import { ConnectionType } from "../contexts/ConnectionContext";
import { validateKeys } from "../services/cothorityUtils";
import Error, { ErrorMessage } from "./Error";

const ConnectModal: FunctionComponent<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalIsOpen: boolean;
  setConnection: (name: ConnectionType) => void;
}> = ({ setIsOpen, modalIsOpen, setConnection }) => {
  const [privateKey, setPrivateKey] = useState<string>();
  const [publicKey, setPublicKey] = useState<string>();
  const [error, setError] = useState<ErrorMessage | undefined>();

  return (
    <Modal
      isOpen={modalIsOpen}
      className={"bg-white rounded-lg shadow-lg p-6 w-1/2"}
      overlayClassName={classnames(
        "fixed inset-0",
        "flex flex-col items-center justify-center",
        "bg-white bg-opacity-80"
      )}
    >
      <div className="flex">
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className={classnames("text-red-400")}
        >
          <IoMdCloseCircle />
        </button>
        <span className={classnames("font-bold text-gray-600 ml-3")}>
          Connect
        </span>
      </div>
      <div className="mt-4 space-y-4 flex flex-col justify-center text-gray-600">
        <div>
          <label htmlFor="private" className="block font-bold">
            Private Key
          </label>
          <input
            id="private"
            type="text"
            placeholder="Private Key"
            onChange={(e) => setPrivateKey(e.target.value)}
            value={privateKey}
            className={classnames(
              "rounded-sm px-4 py-3 focus:outline-none bg-gray-100 w-full"
            )}
          />
        </div>
        <div>
          <label htmlFor="public" className="block font-bold">
            Public Key
          </label>
          <input
            id="public"
            type="text"
            onChange={(e) => setPublicKey(e.target.value)}
            value={publicKey}
            placeholder="Public Key"
            className={classnames(
              "rounded-sm px-4 py-3 focus:outline-none bg-gray-100 w-full"
            )}
          />
        </div>
        {error && <Error errorMessage={error} reset={setError} />}
        {publicKey && privateKey && (
          <ConnectButton
            onClick={() => {
              if (!validateKeys(publicKey) || !validateKeys(privateKey)) {
                setError({
                  message: "Public or private key invalid",
                  title: "Format error",
                });
                return;
              }
              setIsOpen(false);
              setConnection({
                connected: true,
                public: `ed25519:${publicKey}`,
                private: privateKey!,
              });
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default ConnectModal;
