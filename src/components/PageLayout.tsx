import { FunctionComponent } from "react";
import { IconType } from "react-icons";

const PageLayout: FunctionComponent<{ title: string; icon: IconType }> = ({
  title,
  children,
  icon: Icon,
}) => {
  return (
    <div className="w-full h-full overflow-y-scroll bg-light-400 text-gray-600 overflow-x-hidden">
      <div className="flex items-center p-3 text-primary-600">
        <Icon />
        <h1 className="font-bold text-xl ml-3 ">{title}</h1>
      </div>
      {children}
    </div>
  );
};

export default PageLayout;
