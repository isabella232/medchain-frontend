import classnames from "classnames";
import { FunctionComponent } from "react";
import { GiConfirmed } from "react-icons/gi";
import { MdCancel } from "react-icons/md";


const ValidateAbort: FunctionComponent<{
  confirm: () => void;
  abort: () => void;
}> = ({ confirm, abort }) => {
  return (
    <>
      <button className={classnames("text-green-400")} onClick={confirm}>
        <GiConfirmed />
      </button>
      <button className={classnames("text-red-400")} onClick={abort}>
        <MdCancel />
      </button>
    </>
  );
};

export default ValidateAbort