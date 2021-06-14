import Darc from "@dedis/cothority/darc/darc";
import { FunctionComponent, useContext, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { validateKey } from "../../services/cothorityUtils";
import {
  modifyAdminFromDarc,
  removeAdminFromDarc,
} from "../../services/instructionBuilder";
import { CopyButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import TransactionModal from "../TransactionModal";
import ValidateAbort from "../ValidateAbort";

/**
 * Display the input field to modify an administrator key in the administration darc
 */
const ModifyAdmin: FunctionComponent<{
  setModifying: React.Dispatch<React.SetStateAction<boolean>>;
  oldKey: string;
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setModifying, setSuccess, oldKey, darc }) => {
  const [error, setError] = useState<ErrorMessage | undefined>(undefined);
  const { connection } = useContext(ConnectionContext);
  const [newKey, setNewKey] = useState("");
  const abort = () => {
    setModifying(false);
    setNewKey("");
    setError(undefined);
  };

  const confirm = () => {
    if (!validateKey(newKey)) {
      setError({
        message: "Not a valid public address",
        title: "Format Error",
      });
      return;
    }

    setError(undefined);
    const tx = modifyAdminFromDarc(darc, oldKey, newKey);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="space-y-1">
      <label className="text-xs ml-1 mb-1">New Key:</label>
      <div className="flex space-x-2">
        <input
          name="field_name"
          className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
          type="text"
          placeholder={oldKey}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <ValidateAbort confirm={confirm} abort={abort} />
      </div>
      {error && <Error errorMessage={error} reset={setError} />}
    </div>
  );
};

/**
 * Represent a single admin line in the administration darc panel
 */
const AdminElem: FunctionComponent<{
  name: string;
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ name, darc, setSuccess }) => {
  const [modifying, setModifying] = useState(false);
  const [error, setError] = useState<ErrorMessage | undefined>(undefined);

  const { connection } = useContext(ConnectionContext);
  const [removeAdminModalOpen, setRemoveAdminModalOpen] = useState(false);
  const updateKey = () => {
    setModifying(true);
  };

  const removeKey = () => {
    const tx = removeAdminFromDarc(darc, name);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
        setRemoveAdminModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
        setRemoveAdminModalOpen(false);
      });
  };

  return (
    <>
      <TransactionModal
        title="Remove Administrator"
        modalIsOpen={removeAdminModalOpen}
        setIsOpen={setRemoveAdminModalOpen}
        executeAction={() => removeKey()}
        abortAction={() => setRemoveAdminModalOpen(false)}
      >
        Remove admin
        <span className="font-bold text-primary-400 text-xs">{name}</span> from
        the Administrator consortium
      </TransactionModal>
      {modifying ? (
        <ModifyAdmin
          setModifying={setModifying}
          setSuccess={setSuccess}
          oldKey={name}
          darc={darc}
        />
      ) : (
        <div className="flex space-x-2">
          <p>{name}</p>
          <ValidateAbort
            confirm={updateKey}
            abort={() => setRemoveAdminModalOpen(true)}
          />
          <CopyButton elem={name} />
        </div>
      )}
      {error && <Error errorMessage={error} reset={setError} />}
    </>
  );
};

export default AdminElem;
