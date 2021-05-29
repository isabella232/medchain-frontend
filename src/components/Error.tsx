import classnames from "classnames";
import { FunctionComponent } from "react";
import { MdCancel } from "react-icons/md";

const Error: FunctionComponent<{
  message: string;
  reset: React.Dispatch<React.SetStateAction<string>>;
  title: string
}> = ({ message, reset, title }) => {
  return (
    <div className="bg-red-100 text-red-600 py-1 px-2 capitalize rounded-lg text-sm">
      <div className="text-red-400 flex">
        <button onClick={(e) => reset("")}>
          <MdCancel />
        </button>
        <span className={classnames("font-bold ml-3 text-red-600")}>
          {title}
        </span>
      </div>
      {message}
    </div>
  );
};
export default Error;
