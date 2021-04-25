import { FunctionComponent } from "react";
import { FaWrench, FaPlus, FaMinus, FaSignature } from "react-icons/fa";
import { BsLightningFill } from "react-icons/bs";
import { BiLogInCircle, BiLogOutCircle } from "react-icons/bi";
import classnames from "classnames";
import { IconType } from "react-icons";

const ButtonBase: FunctionComponent<{
  className?: string;
  icon: IconType;
  text: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ className, icon: Icon, text, onClick }) => {
  return (
    <button
      className={classnames(
        "tracking-wider px-5 py-1 text-sm rounded leading-loose font-semibold flex justify-center items-center capitalize",
        className
      )}
      title=""
      onClick={onClick}
    >
      <Icon className="mr-1" /> <span>{text}</span>
    </button>
  );
};

export const ModifyButton: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-green-400 hover:bg-green-600",
        className
      )}
      icon={FaWrench}
      text="Modify"
    />
  );
};

export const ExecuteButton: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-purple-400 hover:bg-purple-600",
        className
      )}
      icon={BsLightningFill}
      text="Execute"
    />
  );
};

export const AddButton: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-green-400 hover:bg-green-600",
        className
      )}
      icon={FaPlus}
      text="Add"
    />
  );
};

export const RemoveButton: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-red-400 hover:bg-red-600",
        className
      )}
      icon={FaMinus}
      text="remove"
    />
  );
};

export const SignButton: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-primary-400 hover:bg-primary-600",
        className
      )}
      icon={FaSignature}
      text="sign"
    />
  );
};

export const ConnectButton: FunctionComponent<{
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ className, onClick }) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-green-400 hover:bg-green-600",
        className
      )}
      icon={BiLogInCircle}
      text="connect"
      onClick={onClick}
    />
  );
};

export const DisconnectButton: FunctionComponent<{
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ className, onClick }) => {
  return (
    <ButtonBase
      className={classnames(
        "text-white bg-red-400 hover:bg-red-600",
        className
      )}
      icon={BiLogOutCircle}
      text="disconnect"
      onClick={onClick}
    />
  );
};
