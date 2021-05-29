import { FunctionComponent } from "react";
import { MdCancel } from "react-icons/md";

const Error: FunctionComponent<{
  message: string;
  reset: React.Dispatch<React.SetStateAction<string>>;
}> = ({ message, reset }) => {
  return (
    <div className="bg-red-100 text-red-600 py-1 px-2 capitalize rounded-lg">
      <div className="text-red-400">
        <button onClick={(e) => reset("")}>
          <MdCancel />
        </button>
      </div>
      {message}
    </div>
  );
};
export default Error;
