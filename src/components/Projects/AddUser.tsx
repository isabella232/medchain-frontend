import { FunctionComponent, useContext, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { addUserRightsToProject } from "../../services/instructionBuilder";
import Error, { ErrorMessage } from "../Error";
import ValidateAbort from "../ValidateAbort";

const AddUser: FunctionComponent<{
  setShowNewUser: React.Dispatch<React.SetStateAction<boolean>>;
  instanceId: Buffer;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setShowNewUser, setSuccess, instanceId }) => {
  const [userId, setUserId] = useState("");
  const [accessRight, setAccesRight] = useState("");
  const [error, setError] = useState<ErrorMessage | undefined>();
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setUserId("");
    setAccesRight("");
    setError(undefined);
    setShowNewUser(false);
  };
  const confirm = () => {
    setError(undefined);
    const tx = addUserRightsToProject(userId, accessRight, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <div className="flex items-end space-x-2">
        <div className="space-y-1 flex-grow">
          <div>
            <label className="text-xs ml-1 mb-1">New User:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs ml-1 mb-1">New User:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="count_per_site_obsfucated"
                value={accessRight}
                onChange={(e) => setAccesRight(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Error
              errorMessage={error}
              reset={setError}
            />
          )}
        </div>
        <div className="space-x-2">
          <ValidateAbort confirm={confirm} abort={abort} />
        </div>
      </div>
    </div>
  );
};

export default AddUser;
