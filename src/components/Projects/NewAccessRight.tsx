import { FunctionComponent, useContext, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { addUserRightsToProject } from "../../services/instructionBuilder";
import { Authorization } from "../../services/messages";
import { AddButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import ValidateAbort from "../ValidateAbort";

/**
 * Display the input to add a new administrator key in the consortium
 */
const NewAccessRight: FunctionComponent<{
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  userId: string;
  authorization: Authorization;
  instanceId: Buffer;
}> = ({ setSuccess, userId, instanceId }) => {
  const [showNewAccessRight, setShowNewAccessRight] = useState(false);
  const [NewAccessRight, setNewAccessRight] = useState("");
  const [error, setError] = useState<ErrorMessage | undefined>();
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewAccessRight("");
    setError(undefined);
    setShowNewAccessRight(false);
  };

  const confirm = () => {
    // TODO add user rights checks
    setError(undefined);
    const tx = addUserRightsToProject(userId, NewAccessRight, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewAccessRight ? (
    <>
      {" "}
      <div className="space-y-1">
        <label className="text-xs ml-1 mb-1">New Access Right:</label>
        <div className="flex space-x-2">
          <input
            name="field_name"
            className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
            type="text"
            placeholder="count_per_site_obsfucated..."
            value={NewAccessRight}
            onChange={(e) => setNewAccessRight(e.target.value)}
          />
          <ValidateAbort confirm={confirm} abort={abort} />
        </div>
        {error && (
          <Error errorMessage={error} reset={setError}/>
        )}
      </div>
    </>
  ) : (
    <AddButton onClick={(e) => setShowNewAccessRight(true)} />
  );
};

export default NewAccessRight;
