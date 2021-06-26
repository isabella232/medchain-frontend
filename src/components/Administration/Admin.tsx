import Darc from "@dedis/cothority/darc/darc";
import classnames from "classnames";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import classes from "../../classes/classes";
import { getDarc } from "../../services/cothorityGateway";
import {
  getAdmins
} from "../../services/cothorityUtils";
import { CopyButton } from "../Buttons";
import PageLayout from "../PageLayout";
import PanelElement from "../PanelElement";
import Spinner from "../Spinner";
import Success from "../Success";
import AdminElem from './AdminElem';
import ModifyMultisigRule from './ModifyMultisigRule';
import NewAdminElem from './NewAdminElem';


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
      setAdmins(getAdmins(darc) as string[]);
    });
  }, [success]);

  return (
    <PageLayout title="Administrator Consortium" icon={FaUsers}>
      <div className="xl:w-1/2 p-3">
        <div className={classnames(classes.box,"space-y-3")}>
          <PanelElement title="Base Admin DARC ID">
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
                key={item}
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
