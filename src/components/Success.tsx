
import { FunctionComponent } from "react";
import { MdCancel } from "react-icons/md";

const Success: FunctionComponent<{
  message: string;
  reset: React.Dispatch<React.SetStateAction<string>>;
}> = ({ message, reset }) => {
  return (
    <div className="bg-green-100 text-green-600 py-1 px-2 capitalize rounded-lg">
      <div className="text-red-400">
        <button onClick={(e) => reset("")}>
          <MdCancel />
        </button>
      </div>
      {message}
    </div>
  );
};
export default Success;
