import Darc from "@dedis/cothority/darc/darc";
import { FunctionComponent, useContext, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { validateIdentity } from "../../services/cothorityUtils";
import { addAdmintoDarc } from "../../services/instructionBuilder";
import { AddButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import ValidateAbort from "../ValidateAbort";

/**
 * Display the input to add a new administrator key in the consortium
 */
const NewAdminElem: FunctionComponent<{
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ darc, setSuccess }) => {
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState<ErrorMessage | undefined>();
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewKey("");
    setError(undefined);
    setShowNewAdmin(false);
  };

  const confirm = () => {
    if (!validateIdentity(newKey)) {
      setError({
        message: "Not a valid public address",
        title: "Format Error",
      });
      return;
    }
    setError(undefined);
    const tx = addAdmintoDarc(darc, newKey);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewAdmin ? (
    <>
      <div className="space-y-1">
        <label className="text-xs ml-1 mb-1">New Key:</label>
        <div className="flex space-x-2">
          <input
            name="field_name"
            className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
            type="text"
            placeholder="ed25519: ..."
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <ValidateAbort confirm={confirm} abort={abort} />
        </div>
        {error && <Error errorMessage={error} reset={setError} />}
      </div>
    </>
  ) : (
    <AddButton onClick={(e) => setShowNewAdmin(true)} />
  );
};

export default NewAdminElem;
