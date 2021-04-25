import classnames from "classnames";
import { FunctionComponent } from "react";
import { FaUsers } from "react-icons/fa";
import classes from "../classes/classes";
import { ModifyButton } from "./Buttons";
import PageLayout from "./PageLayout";

const adminData = {
  identities: [
    "ed25519:801c813bca03d0d0c09887b0ff87e6fa51fe782cbfca10323ccf88528e5e1b53",
    "ed25519:801c813bca03d0d0c09887b0ff87e6fa51fe782cbfca10323ccf88528e5e1b53",
    "ed25519:801c813bca03d0d0c09887b0ff87e6fa51fe782cbfca10323ccf88528e5e1b53",
  ],
};
const PanelElement: FunctionComponent<{ title: string; last?: boolean }> = ({
  title,
  children,
  last,
}) => {
  return (
    <div className={classnames("py-3 text-xs", !last && "border-b border-gray-300")}>
      <h2 className={classnames("mb-2", classes.boxSubtitle)}>{title}</h2>
      {children}
    </div>
  );
};

const Admin = () => {
  return (
    <PageLayout title="Administrator Consortium" icon={FaUsers}>
      <div className="w-1/2 p-3">
        <div className="space-y-3 p-3 bg-white shadow-lg rounded-lg">
          <PanelElement title="BASE Admin DARC ID">
            <p className="">
              999b315d2e19ac4e670578e3cd84a95fac2f5e68ad9725bc5e10da9d8cbee419
            </p>
          </PanelElement>
          <PanelElement title="Multisignature Policies">
            <div className="">
              <span className="font-bold mr-1">2/3</span>
              <span>of signers</span>
              <ModifyButton className="mt-2" />
            </div>
          </PanelElement>
          <PanelElement title="DARC Version">
            <div className="">
              <span className="font-bold mr-1">3</span>
            </div>
          </PanelElement>
          <PanelElement last title="Admininistrators">
            <div className="">
              <div className="">
                {adminData.identities.map((item) => {
                  return <div>{item}</div>;
                })}
              </div>
              <textarea
                className="w-full p-2 h-20 border rounded-md mt-2 text-xs"
                value={adminData.identities.join("\n")}
              ></textarea>
              <ModifyButton className="mt-2" />
            </div>
          </PanelElement>
        </div>
      </div>
    </PageLayout>
  );
};

export default Admin;
