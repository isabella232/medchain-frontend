import classNames from "classnames";
import { FunctionComponent, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { formatHash } from "../tools/formatHash";
import PageLayout from "./PageLayout";

const transactionsData = {
  history: [
    {
      transactionID:
        "8effcce9fa8de9f52c0172db38d0be1e2a1a5371a5e4a2fa8e3f4e9499357f3a",
      instructions: [
        {
          hash:
            "1e74b5dc39d56b40a3c4b8471794effa863d3c1f8c11ff8e864ba243ce56471a",
          instID:
            "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
          action: "invoke:value.update",
          signatures: 0,
        },
      ],
      expireBlockIndex: 54,
      maxNumExecution: 1,
    },
    {
      transactionID:
        "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
      instructions: [
        {
          hash:
            "1e74b5dc39d56b40a3c4b8471794effa863d3c1f8c11ff8e864ba243ce56471a",
          instID:
            "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
          action: "invoke:value.update",
          signatures: 0,
        },
      ],
      expireBlockIndex: 54,
      maxNumExecution: 1,
    },
    {
      transactionID:
        "8effcce9fa8de9f52c0172db38d0be1e2a1a5371a5e4a2fa8e3f4e9499357f3a",
      instructions: [
        {
          hash:
            "1e74b5dc39d56b40a3c4b8471794effa863d3c1f8c11ff8e864ba243ce56471a",
          instID:
            "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
          action: "invoke:value.update",
          signatures: 0,
        },
      ],
      expireBlockIndex: 54,
      maxNumExecution: 1,
    },
  ],
  pending: [
    {
      transactionID:
        "e9b1a4698d0fc49354271df809acadd2ac87f8314b2ee7514c62c3ba1af93c51",
      instructions: [
        {
          hash:
            "1e74b5dc39d56b40a3c4b8471794effa863d3c1f8c11ff8e864ba243ce56471a",
          instID:
            "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
          action: "invoke:value.update",
          signatures: 0,
        },
        {
          hash:
            "1e74b5dc39d56b40a3c4b8471794effa863d3c1f8c11ff8e864ba243ce56471a",
          instID:
            "2faa782974aece23c57e961e0c767fb7bb56228efedd5eac7b8a6e9b3d058779",
          action: "invoke:value.update",
          signatures: 0,
        },
      ],
      expireBlockIndex: 54,
      maxNumExecution: 1,
    },
  ],
};

// TODO Change type
const TransactionLine: FunctionComponent<{
  transactionDetails: any;
  onClick: any;
}> = ({ transactionDetails, onClick }) => {
  return (
    <button
      className="focus:outline-none shadow-lg w-full px-8 py-2 rounded-lg text-gray-700 text-sm hover:border-primary-400 border-2 border-transparent space-x-8 flex justify-between bg-white"
      onClick={onClick}
    >
      <span>{formatHash(transactionDetails.transactionID)}</span>
      <span className="">{`${transactionDetails.instructions[0].action}`}</span>
      <span className="font-bold">{`${transactionDetails.instructions[0].signatures} signatures`}</span>
    </button>
  );
};
const Transactions = () => {
  const [viewIndex, setViewIndex] = useState(0);
  //   TODO create a tx type
  const [selectedTransaction, setSelectedTransaction] = useState<any>();
  return (
    <PageLayout title="Transactions" icon={FaExchangeAlt}>
      <nav className="space-x-4 bg-white px-8 pt-2 shadow-md mb-4">
        <button
          className={classNames(
            "focus:outline-none border-b-4 border-transparent text-xs py-3 tracking-wide font-bold  uppercase  box-content",
            viewIndex == 0 && "border-primary-400"
          )}
          onClick={(e) => {
            if (viewIndex != 0) setSelectedTransaction(undefined);
            setViewIndex(0);
          }}
        >
          Queue
        </button>
        <button
          className={classNames(
            "focus:outline-none border-b-4 border-transparent text-xs py-3 tracking-wide font-bold  uppercase  box-content",
            viewIndex == 1 && "border-primary-400"
          )}
          onClick={(e) => {
            if (viewIndex != 1) setSelectedTransaction(undefined);
            setViewIndex(1);
          }}
        >
          History
        </button>
      </nav>
      <div className="flex">
        <div className="w-1/2 p-3 space-y-4 ">
          {viewIndex == 0
            ? transactionsData.pending.map((v) => {
                return (
                  <TransactionLine
                    transactionDetails={v}
                    onClick={() => setSelectedTransaction(v)}
                  />
                );
              })
            : transactionsData.history.map((v) => {
                return (
                  <TransactionLine
                    transactionDetails={v}
                    onClick={() => setSelectedTransaction(v)}
                  />
                );
              })}
        </div>
        <div className="w-1/2 p-3">
          {selectedTransaction != undefined && (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-3">
                <button onClick={() => setSelectedTransaction(undefined)}>
                  <IoMdCloseCircle />
                </button>
              </div>
              <div className="p-3">
                <p className="font-bold uppercase text-sm text-gray-700 mb-2">
                  Deferred Transacation
                </p>
                <p className="font-bold">Transaction ID</p>
                {selectedTransaction.transactionID}
              </div>

              {selectedTransaction.instructions.map(
                (instruction: any, index: number) => {
                  return (
                    <div className="border-t-2 border-gray-300 p-3">
                      <div className="text-sm">
                        <p className="font-bold uppercase text-sm text-gray-700 mb-2">{`Instruction ${index}`}</p>
                        <p className="font-bold">Instruction hash</p>
                        <p>{instruction.hash}</p>
                        <p className="font-bold">Instruction ID</p>
                        <p>{instruction.instID}</p>
                        <p className="font-bold">Action</p>
                        <p>{instruction.action}</p>
                        <p className="font-bold">Signatures</p>
                        <p>{instruction.signatures}</p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Transactions;
