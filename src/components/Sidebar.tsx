import classnames from "classnames";
import { FunctionComponent, useContext } from "react";
import { FaExchangeAlt, FaUsers } from "react-icons/fa";
import { GoProject } from "react-icons/go";
import { IconType } from "react-icons/lib";
import { NavLink } from "react-router-dom";
import { ConnectButton, DisconnectButton } from "../components/Buttons";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { formatAccountName } from "../tools/format";

const SidebarNavLink: FunctionComponent<{
  icon: IconType;
  title: string;
  to: string;
}> = ({ icon: Icon, title, to }) => {
  return (
    <NavLink
      exact
      to={to}
      className="block flex text-white items-center border-r-4 border-transparent hover:border-primary-200 hover:bg-primary-600 px-3 py-2"
      activeClassName="bg-primary-600 border-primary-200"
    >
      <Icon />
      <span className="ml-2 text-xl">{title}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  const { connection, setConnection } = useContext(ConnectionContext);

  return (
    <div className="w-52 flex flex-col h-full bg-primary-400">
      <h1 className="font-bold text-white text-2xl m-3">Medchain</h1>
      <SidebarNavLink icon={FaUsers} title="Admins" to="/admins" />
      <SidebarNavLink
        icon={FaExchangeAlt}
        title="Transactions"
        to="/transactions"
      />
      <SidebarNavLink icon={GoProject} title="Projects" to="/projects" />
      <div className="flex flex-col mt-auto mb-4 px-3">
        {!connection.connected ? (
          <div className="flex flex-col">
            <ConnectButton
              className={classnames("")}
              onClick={(e) => {
                setConnection({
                  connected: true,
                  public:
                    "ed25519:801c813bca03d0d0c09887b0ff87e6fa51fe782cbfca10323ccf88528e5e1b53",
                  private: "123",
                });
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="text-xs text-white font-bold mb-2">{`Connected to: ${formatAccountName(
              connection.public
            )}`}</p>
            <DisconnectButton
              className={classnames("")}
              onClick={(e) => {
                setConnection({ connected: false, public: "", private: "" });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
