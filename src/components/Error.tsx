import classnames from "classnames";
import { FunctionComponent } from "react";
import { MdCancel } from "react-icons/md";

export type ErrorMessage = {
  message: string;
  title: string;
};

const Error: FunctionComponent<{
  errorMessage: ErrorMessage;
  reset: React.Dispatch<React.SetStateAction<ErrorMessage | undefined>>;
}> = ({ errorMessage, reset }) => {
  return (
    <div className="bg-red-100 text-red-600 py-1 px-2 capitalize rounded-lg text-sm">
      <div className="text-red-400 flex">
        <button onClick={(e) => reset(undefined)}>
          <MdCancel size={"1rem"} />
        </button>
        <span className={classnames("font-bold ml-3 text-red-600")}>
          {errorMessage.title}
        </span>
      </div>
      {errorMessage.message}
    </div>
  );
};
export default Error;
