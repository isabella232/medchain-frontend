import classnames from "classnames";
import { FunctionComponent } from "react";
import { AiFillMinusCircle } from "react-icons/ai";
import { ConnectionType } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { removeUserRightFromProject } from "../../services/instructionBuilder";

const AccessRight: FunctionComponent<{
  action: string;
  userId: string;
  instanceId: Buffer;
  connection: ConnectionType;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setSuccess, connection, action, userId, instanceId }) => {
  const removeAccessRight = () => {
    const tx = removeUserRightFromProject(userId, action, instanceId);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex space-x-2">
      <p>{action}</p>
      <button className={classnames("text-red-400")}>
        <AiFillMinusCircle onClick={removeAccessRight} />
      </button>
    </div>
  );
};

export default AccessRight;
