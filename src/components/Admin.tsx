import Darc from "@dedis/cothority/darc/darc";
import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { AiFillEdit, AiFillMinusCircle } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { getDarc, sendTransaction } from "../services/cothorityGateway";
import { getAdmins, validateKey } from "../services/cothorityUtils";
import {
  addAdmintoDarc,
  removeFromAdmintoDarc,
} from "../services/instructionBuilder";
import { AddButton, ModifyButton, CopyButton } from "./Buttons";
import PageLayout from "./PageLayout";
import PanelElement from "./PanelElement";
import Spinner from "./Spinner";
import Error from "./Error";
import Success from "./Success";
import TransactionModal from "./TransactionModal";

const AdminElem: FunctionComponent<{
  name: string;
  darc: Darc;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ name, darc, success, setSuccess }) => {
  const [modifying, setModifying] = useState(false);
  const [error, setError] = useState("");

  const { connection } = useContext(ConnectionContext);
  const [removeAdminModalOpen, setRemoveAdminModalOpen] = useState(false);
  const updateKey = () => {
    setModifying(true);
  };

  const removeKey = () => {
    const tx = removeFromAdmintoDarc(darc, name);
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
    <div className="">
      <TransactionModal
        title="Remove Administrator"
        modalIsOpen={removeAdminModalOpen}
        setIsOpen={setRemoveAdminModalOpen}
        executeAction={() => removeKey()}
        abortAction={() => setRemoveAdminModalOpen(false)}
      >
        Remove admin{" "}
        <span className="font-bold text-primary-400 text-xs">{name}</span> from
        the Administrator consortium
      </TransactionModal>
      {modifying ? (
        <ModifyAdmin setModifying={setModifying} oldKey={name} />
      ) : (
        <div className="flex space-x-2">
          <p className="">{name}</p>

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
    </div>
  );
};

const ModifyAdmin: FunctionComponent<{
  setModifying: React.Dispatch<React.SetStateAction<boolean>>;
  oldKey: string;
}> = ({ setModifying, oldKey }) => {
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState("");
  const abort = () => {
    setModifying(false);
    setNewKey("");
    setError("");
  };

  const confirm = () => {
    // TODO call the execution of the transaction modal etc... -> sign tx
    if (!validateKey(newKey)) {
      setError("Not a valid public address");
      return;
    }
    setError("");
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
const NewAdminElem: FunctionComponent<{
  darc: Darc;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ darc, success, setSuccess }) => {
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
    // TODO call the execution of the transaction modal etc... -> sign tx
    if (!validateKey(newKey)) {
      setError("Not a valid public address");
      return;
    }
    setError("");
    console.log("Actual Darc :", darc);
    const tx = addAdmintoDarc(darc, newKey);
    console.log("new deff tx :", tx);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSuccess(res);
      })
      .catch((err) => console.log(err));
  };

  return showNewAdmin ? (
    <div className="">
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
    </div>
  ) : (
    <AddButton onClick={(e) => setShowNewAdmin(true)} />
  );
};

const Admin = () => {
  const [darc, setDarc] = useState<Darc>();
  const [admins, setAdmins] = useState<string[]>();
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // TODO add the true rules for the administration darc - 
    // evolve DARC tresh,
    // spawn project tresh
    // update - remove invoke on project tresh
    // Deferred - 1 admin
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
                <span className="">{darc?.id.toString("hex")}</span>
                <CopyButton elem={darc?.id.toString("hex") as string} />
              </div>
            ) : (
              <Spinner />
            )}
          </PanelElement>
          <PanelElement title="Multisignature Policies">
            {/* TODO modify the threshold policy by replicating the DARC and just changing the threshold */}
            <div className="">
              <span className="font-bold mr-1">2/3</span>
              <span>of signers</span>
              <ModifyButton className="mt-2" />
            </div>
          </PanelElement>
          <PanelElement title="DARC Version">
            <div className="">
              {darc ? (
                <span className="font-bold mr-1">{darc.version.low}</span>
              ) : (
                <Spinner />
              )}
            </div>
          </PanelElement>
          <PanelElement last title="Admininistrators">
            {admins?.map((item) => {
              return (
                <AdminElem
                  name={item}
                  darc={darc as Darc}
                  success={success}
                  setSuccess={setSuccess}
                ></AdminElem>
              );
            }) || <Spinner />}
            <NewAdminElem
              darc={darc as Darc}
              success={success}
              setSuccess={setSuccess}
            />
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
