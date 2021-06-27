import classnames from "classnames";
import { FunctionComponent } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import Modal from "react-modal";
import { AbortButton, ExecuteButton } from "./Buttons";

const TransactionModal: FunctionComponent<{
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalIsOpen: boolean;
  operation?: string;
  title: string;
  children?: React.ReactNode;
  executeAction: React.MouseEventHandler<HTMLButtonElement>;
  abortAction: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ setIsOpen, modalIsOpen, operation, title, children, executeAction, abortAction }) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      className={"bg-white rounded-lg shadow-lg p-6 w-1/2 overflow-y-auto"}
      overlayClassName={classnames(
        "fixed inset-0",
        "flex flex-col items-center justify-center",
        "bg-white bg-opacity-80"
      )}
    >
      <div className="flex ">
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className={classnames("text-red-400")}
        >
          <IoMdCloseCircle size={"1rem"}/>
        </button>
        <span className={classnames("font-bold text-gray-600 ml-3")}>
          {title}
        </span>
      </div>
      {children}
      <div className="flex space-x-2">
          <ExecuteButton className="mt-4" onClick={executeAction} />
          <AbortButton className="mt-4" onClick={abortAction} />
        </div>
    </Modal>
  );
};

export default TransactionModal;
