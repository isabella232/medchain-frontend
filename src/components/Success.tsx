import classnames from "classnames";
import { FunctionComponent, useState, useEffect } from "react";
import { MdCancel } from "react-icons/md";

const Success: FunctionComponent<{
  title: string;
  message: string;
  reset: React.Dispatch<React.SetStateAction<string>>;
}> = ({ title, message, reset }) => {
  const [enter, setEnter] = useState(false);
  useEffect(() => {
    setEnter(true);
    return () => reset("")
  }, [message,title]);
  return (
    <div className="overflow-hidden absolute right-0 top-10">
      <div
        className={classnames(
          "bg-green-100 text-green-600 rounded-lg text-sm py-1 px-2 capitalize mr-4",
          "transition duration-1000 ease-in-out",
          // "-translate-x-full",
          !enter && "transform translate-x-full opacity-0"
        )}
      >
        <div className="text-red-400 flex">
          <button
            onClick={(e) => {
              setEnter(false);
            }}
          >
            <MdCancel />
          </button>
          <span className={classnames("font-bold ml-3 text-green-600")}>
            {title}
          </span>
        </div>
        <div className="text-right">{message}</div>
      </div>
    </div>
  );
};

export default Success;
