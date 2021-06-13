import Darc from "@dedis/cothority/darc/darc";
import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { AiFillEdit, AiFillMinusCircle } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { getDarc, sendTransaction } from "../services/cothorityGateway";
import {
  getAdmins,
  getMultiSigRule,
  validateKey,
} from "../services/cothorityUtils";
import {
  addAdmintoDarc,
  changeThresholdFromDarc,
  modifyAdminFromDarc,
  removeAdminFromDarc,
} from "../services/instructionBuilder";
import { AddButton, CopyButton, ModifyButton } from "./Buttons";
import Error from "./Error";
import PageLayout from "./PageLayout";
import PanelElement from "./PanelElement";
import Spinner from "./Spinner";
import Success from "./Success";
import TransactionModal from "./TransactionModal";

/**
 * Represent a single admin line in the administration darc panel
 */
const AdminElem: FunctionComponent<{
  name: string;
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ name, darc, setSuccess }) => {
  const [modifying, setModifying] = useState(false);
  const [error, setError] = useState("");

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
          <button
            className={classnames("text-red-400")}
            onClick={(e) => setRemoveAdminModalOpen(true)}
          >
            <AiFillMinusCircle />
          </button>
          <button
            className={classnames("text-primary-400")}
            onClick={updateKey}
          >
            <AiFillEdit />
          </button>
          <CopyButton elem={name} />
        </div>
      )}
      {error && (
        <Error message={error} reset={setError} title="Transaction failed" />
      )}
    </>
  );
};

/**
 * Display the input field to modify an administrator key in the administration darc
 */
const ModifyAdmin: FunctionComponent<{
  setModifying: React.Dispatch<React.SetStateAction<boolean>>;
  oldKey: string;
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setModifying, setSuccess, oldKey, darc }) => {
  const [error, setError] = useState("");
  const { connection } = useContext(ConnectionContext);
  const [newKey, setNewKey] = useState("");
  const abort = () => {
    setModifying(false);
    setNewKey("");
    setError("");
  };

  const confirm = () => {
    if (!validateKey(newKey)) {
      setError("Not a valid public address");
      return;
    }
    setError("");
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
        <button className={classnames("text-green-400")} onClick={confirm}>
          <GiConfirmed />
        </button>
        <button className={classnames("text-red-400")} onClick={abort}>
          <MdCancel />
        </button>
      </div>
    </div>
  );
};

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
  const [error, setError] = useState("");
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewRule("");
    setError("");
    setShowNewRule(false);
  };

  useEffect(() => {
    const rule = getMultiSigRule(darc);
    if (rule !== null) setRule(rule);
  }, [darc, rule]);

  const confirm = () => {
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
          <button className={classnames("text-green-400")} onClick={confirm}>
            <GiConfirmed />
          </button>
          <button className={classnames("text-red-400")} onClick={abort}>
            <MdCancel />
          </button>
        </div>
        {error && (
          <Error message={error} reset={setError} title="Transaction failed" />
        )}
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

/**
 * Display the input to add a new administrator key in the consortium
 */
const NewAdminElem: FunctionComponent<{
  darc: Darc;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ darc, setSuccess }) => {
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [error, setError] = useState("");
  const { connection } = useContext(ConnectionContext);

  const abort = () => {
    setNewKey("");
    setError("");
    setShowNewAdmin(false);
  };

  const confirm = () => {
    if (!validateKey(newKey)) {
      setError("Not a valid public address");
      return;
    }
    setError("");
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
          <button className={classnames("text-green-400")} onClick={confirm}>
            <GiConfirmed />
          </button>
          <button className={classnames("text-red-400")} onClick={abort}>
            <MdCancel />
          </button>
        </div>
        {error && (
          <Error message={error} reset={setError} title="Transaction failed" />
        )}
      </div>
    </>
  ) : (
    <AddButton onClick={(e) => setShowNewAdmin(true)} />
  );
};

/**
 * The component for the administrator page of the application
 */
const Admin = () => {
  const [darc, setDarc] = useState<Darc>();
  const [admins, setAdmins] = useState<string[]>();
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getDarc().then((darc) => {
      setDarc(darc);
      console.log(darc);
      setAdmins(getAdmins(darc) as string[]);
    });
  }, [success]);

  return (
    <PageLayout title="Administrator Consortium" icon={FaUsers}>
      <div className="xl:w-1/2 p-3">
        <div className="space-y-3 p-3 bg-white shadow-lg rounded-lg">
          <PanelElement title="BASE Admin DARC ID">
            {darc ? (
              <div className="flex space-x-2">
                <span>{darc?.id.toString("hex")}</span>
                <CopyButton elem={darc?.id.toString("hex") as string} />
              </div>
            ) : (
              <Spinner />
            )}
          </PanelElement>
          <PanelElement title="Multisignature Policies">
            {darc ? (
              <ModifyMultisigRule darc={darc as Darc} setSuccess={setSuccess} />
            ) : (
              <Spinner />
            )}
          </PanelElement>
          <PanelElement title="DARC Version">
            <>
              {darc ? (
                <span className="font-bold mr-1">{darc.version.low}</span>
              ) : (
                <Spinner />
              )}
            </>
          </PanelElement>
          <PanelElement last title="Admininistrators">
            {admins?.map((item) => {
              return (
                <AdminElem
                  name={item}
                  darc={darc as Darc}
                  setSuccess={setSuccess}
                ></AdminElem>
              );
            }) || <Spinner />}
            <NewAdminElem darc={darc as Darc} setSuccess={setSuccess} />
          </PanelElement>
        </div>
      </div>
      <Success
        success={success}
        setSuccess={setSuccess}
        title="Transaction submitted"
      />
    </PageLayout>
  );
};

export default Admin;
