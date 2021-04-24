import { FunctionComponent } from "react";
import { FaExchangeAlt, FaUsers } from "react-icons/fa";
import { GoProject } from "react-icons/go";
import { IconType } from "react-icons/lib";
import { NavLink } from "react-router-dom";

const SidebarNavLink: FunctionComponent<{
  icon: IconType;
  title: string;
  to: string;
}> = ({ icon: Icon, title, to }) => {
  return (
    <NavLink
      exact
      to={to}
      className="block flex text-white items-center hover:bg-primary-600 px-3 py-2"
      activeClassName="bg-primary-600"
    >
      <Icon />
      <span className="ml-2 text-xl">{title}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  return (
    <div className="w-52 h-full bg-primary-400">
      <h1 className="font-bold text-white text-2xl m-3">Medchain</h1>
      <SidebarNavLink icon={FaUsers} title="Admins" to="/" />
      <SidebarNavLink
        icon={FaExchangeAlt}
        title="Transactions"
        to="/transactions"
      />
      <SidebarNavLink icon={GoProject} title="Projects" to="/projects" />
    </div>
  );
};

export default Sidebar;
