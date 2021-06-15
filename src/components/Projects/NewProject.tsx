import { FunctionComponent, useState } from "react";
import { ConnectionType } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { spawnProject } from "../../services/instructionBuilder";
import { AddButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import ValidateAbort from "../ValidateAbort";
/**
 * Display the input to add a new administrator key in the consortium
 */
const NewProject: FunctionComponent<{
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  connection: ConnectionType;
}> = ({ setSuccess, connection }) => {
  const [showNewProject, setShowNewProject] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<ErrorMessage | undefined>();

  const abort = () => {
    setShowNewProject(false);
    setError(undefined);
    setDescription("");
    setName("");
  };

  const confirm = () => {
    // TODO add user rights checks
    setError(undefined);
    const tx = spawnProject(name, description);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewProject ? (
    <div>
      <div className="flex items-end space-x-2">
        <div className="space-y-1 flex-grow">
          <div>
            <label className="text-xs ml-1 mb-1">Project Name:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs ml-1 mb-1">Project Description:</label>
            <div className="flex space-x-2">
              <input
                name="user"
                className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
                type="text"
                placeholder="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
  ) : (
    <AddButton onClick={(e) => setShowNewProject(true)} />
  );
};

export default NewProject;
