import { FunctionComponent } from "react";
import { ConnectionType } from "../../contexts/ConnectionContext";
import { Authorization } from "../../services/messages";
import { CopyButton } from "../Buttons";
import PanelElement from "../PanelElement";
import AccessRight from "./AccessRight";
import NewAccessRight from "./NewAccessRight";

const UserRights: FunctionComponent<{
  authorization: Authorization;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  instanceId: Buffer;
  connection: ConnectionType;
}> = ({ authorization, setSuccess, connection, instanceId }) => {
  return (
    <div className="px-4">
      <PanelElement title="User ID">
        {authorization.userid} <CopyButton elem={authorization.userid} />
      </PanelElement>
      {authorization.queryterms && (
        <PanelElement last title="User Rights">
          {authorization.queryterms.map((term) => {
            return (
              <AccessRight
                action={term}
                setSuccess={setSuccess}
                userId={authorization.userid}
                instanceId={instanceId}
                connection={connection}
              />
            );
          })}
        </PanelElement>
      )}
      <PanelElement last title="Add Access Rights">
        <NewAccessRight
          setSuccess={setSuccess}
          userId={authorization.userid}
          authorization={authorization}
          instanceId={instanceId}
        />
      </PanelElement>
    </div>
  );
};
export default UserRights;
