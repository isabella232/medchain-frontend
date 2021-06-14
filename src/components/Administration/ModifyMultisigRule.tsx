import Darc from "@dedis/cothority/darc/darc";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import {
  getMultiSigRule,
  validateMultisig,
} from "../../services/cothorityUtils";
import { changeThresholdFromDarc } from "../../services/instructionBuilder";
import { ModifyButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import ValidateAbort from "../ValidateAbort";

/**
 * The multisignature rule component of the administration panel
 */
const ModifyMultisigRule: FunctionComponent<{
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ darc, setSuccess }) => {
  const [showNewRule, setShowNewRule] = useState(false);
  const [rule, setRule] = useState("");
  const [newRule, setNewRule] = useState("");
  const [error, setError] = useState<ErrorMessage | undefined>(undefined);
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewRule("");
    setError(undefined);
    setShowNewRule(false);
  };

  useEffect(() => {
    const rule = getMultiSigRule(darc);
    if (rule !== null) setRule(rule);
  }, [darc, rule]);

  const confirm = () => {
    if (!validateMultisig(rule)) {
      setError({
        message: "Not a valid multisignature rule",
        title: "Invalid expression",
      });
      return;
    }
    const tx = changeThresholdFromDarc(darc, newRule);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewRule ? (
    <>
      <div className="space-y-1">
        <label className="text-xs ml-1 mb-1">New Rule:</label>
        <div className="flex space-x-2">
          <input
            name="field_name"
            className="border flex-grow border-2 rounded-lg px-1 py-1 w-full"
            type="text"
            placeholder="2/3"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
          />
          <ValidateAbort confirm={confirm} abort={abort} />
        </div>
        {error && <Error errorMessage={error} reset={setError} />}
      </div>
    </>
  ) : rule ? (
    <>
      <span className="font-bold mr-1">{rule}</span>
      <span>of signers</span>
      <ModifyButton onClick={(e) => setShowNewRule(true)} className="mt-2" />
    </>
  ) : (
    <></>
  );
};

export default ModifyMultisigRule;
