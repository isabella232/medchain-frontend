import classnames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";
import { NextButton, PreviousButton } from "../components/Buttons";
import { formatHash } from "../tools/format";

const TransactionLine: FunctionComponent<{
  transactionDetails: any;
  onClick: any;
  selected?: boolean;
}> = ({ transactionDetails, onClick, selected }) => {
  return (
    <button
      className={classnames(
        "focus:outline-none shadow w-full px-8 py-2 rounded-lg text-sm hover:border-primary-400 border-2 border-transparent space-x-8 flex justify-between bg-white",
        selected && "border-primary-400"
      )}
      onClick={onClick}
    >
      <span>{transactionDetails.instanceid}</span>
    </button>
  );
};

const Pager: FunctionComponent<{
  data: any[];
  setSelectedTransaction: any;
  selectedTransaction: any;
}> = ({ data, setSelectedTransaction, selectedTransaction }) => {
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  useEffect(() => {
    setMaxPage(Math.floor(data.length / 10));
  }, [data, page]);
  const nextPage = () => {
    if (page < maxPage) {
      setPage(page + 1);
    }
  };
  const previousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="space-y-2">
      {data?.slice(10 * page, 10 * page + 10).map((v) => {
        return (
          <TransactionLine
            transactionDetails={v}
            onClick={() => setSelectedTransaction(v)}
            selected={selectedTransaction === v}
          />
        );
      })}
      <div className="space-x-2 flex mt-4">
        <PreviousButton onClick={(e) => previousPage()} />
        <NextButton onClick={(e) => nextPage()} />
      </div>
    </div>
  );
};
export default Pager;
