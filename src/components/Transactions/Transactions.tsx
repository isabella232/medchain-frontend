import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import classes from "../../classes/classes";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { queries } from "../../services/byprosQueries";
import {
  byprosQuery,
  getBlock,
  getDeferred,
  sendTransaction
} from "../../services/cothorityGateway";
import { getTimeString } from "../../services/cothorityUtils";
import { executeDeferredTransaction } from "../../services/instructionBuilder";
import { DeferredData } from "../../services/messages";
import { CopyButton, ExecuteButton } from "../Buttons";
import Error, { ErrorMessage } from "../Error";
import PageLayout from "../PageLayout";
import Pager from "../Pager";
import PanelElement from "../PanelElement";
import Spinner from "../Spinner";
import Success from "../Success";
import TransactionModal from "../TransactionModal";
import Instruction from "./Instruction";
import {TransactionQueryResponse} from './transactionTypes'

const SelectedTransaction: FunctionComponent<{
  selectedTransaction: TransactionQueryResponse;
  setSelectedTransaction: React.Dispatch<React.SetStateAction<TransactionQueryResponse | undefined>>;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
}> = ({ selectedTransaction, setSelectedTransaction, success, setSuccess }) => {
  const [executeModalIsOpen, setExecuteModal] = useState(false);
  const [transactionData, setTransactionData] = useState<DeferredData>();
  const [executed, setExecuted] = useState<boolean>(false);
  const { connection } = useContext(ConnectionContext);
  const [error, setError] = useState<ErrorMessage | undefined>();
  const [date, setDate] = useState("");

  const executeTransaction = () => {
    const tx = executeDeferredTransaction(selectedTransaction.instanceid);
    sendTransaction(tx, connection.private)
      .then((res) => {
        setExecuteModal(false);
        setSuccess(res);
        setSelectedTransaction(undefined);
      })
      .catch((err) => {
        console.log(err);
        setExecuteModal(false);
        setError({
          message: err.toString(),
          title: "failed to execture the deferred transaction",
        });
      });
  };
  const openExecuteModal = () => {
    setExecuteModal(true);
  };

  useEffect(() => {
    setTransactionData(undefined);
    getDeferred(selectedTransaction.instanceid)
      .then((result) => {
        setTransactionData(result);
        if (result.execresult.length !== 0) {
          setExecuted(true);
        }
      })
      .catch((err) => {
        setError({
          message: err.toString(),
          title: "Failed to get the deferred transaction",
        });
        console.log(err);
      });

    getBlock(selectedTransaction.blockhash).then((res) =>
      setDate(getTimeString(res))
    );
  }, [selectedTransaction]);
  return (
    <div className={classnames(classes.box)}>
      <TransactionModal
        modalIsOpen={executeModalIsOpen}
        setIsOpen={setExecuteModal}
        title="Execute Transaction"
        executeAction={() => executeTransaction()}
        abortAction={() => setExecuteModal(false)}
      >
        <PanelElement title="Transaction instance ID">
          {selectedTransaction.instanceid}
        </PanelElement>
        <PanelElement title="Date">{date ? date : <Spinner />}</PanelElement>
        {transactionData
          ? transactionData.proposedtransaction.instructions.map(
              (instruction, idx) => {
                return (
                  <Instruction
                    instructionHash={transactionData?.instructionhashes[idx]}
                    instructionData={instruction}
                    index={idx}
                    instanceID={selectedTransaction.instanceid}
                    executed={executed}
                    setSuccess={setSuccess}
                    setError={setError}
                    setSelectedTransaction={setSelectedTransaction}
                  />
                );
              }
            )
          : !error && <Spinner />}
      </TransactionModal>
      <PanelElement title="Transaction instance ID">
        {selectedTransaction.instanceid}
        <CopyButton elem={selectedTransaction.instanceid} />
      </PanelElement>
      <PanelElement title="Date">{date ? date : <Spinner />}</PanelElement>
      {transactionData
        ? transactionData.proposedtransaction.instructions.map(
            (instruction, idx) => {
              return (
                <Instruction
                  instructionHash={transactionData?.instructionhashes[idx]}
                  instructionData={instruction}
                  index={idx}
                  instanceID={selectedTransaction.instanceid}
                  executed={executed}
                  setSuccess={setSuccess}
                  setError={setError}
                  setSelectedTransaction={setSelectedTransaction}
                />
              );
            }
          )
        : !error && <Spinner />}
      {transactionData && !executed && (
        <ExecuteButton className="mt-4" onClick={openExecuteModal} />
      )}
      {error && <Error errorMessage={error} reset={setError} />}
    </div>
  );
};

// TODO Change type
const Transactions = () => {
  const [viewIndex, setViewIndex] = useState(0);
  const [transactionsData, setTransactionsData] = useState([]);
  const [transactionsHistoryData, setTransactionsHistoryData] = useState([]);
  const [success, setSuccess] = useState("");
  useEffect(() => {
    byprosQuery(queries.pendingTransactions).then((reply) => {
      console.log(reply)
      setTransactionsData(reply.reverse());
    });
    byprosQuery(queries.transactionsHistory).then((reply) => {
      setTransactionsHistoryData(reply.reverse());
    });
  }, [success]);

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionQueryResponse>();
  return (
    <PageLayout title="Transactions" icon={FaExchangeAlt}>
      <nav className={classnames(classes.nav)}>
        <button
          className={classnames(
            classes.navButton,
            viewIndex === 0 && "border-primary-400"
          )}
          onClick={(e) => {
            if (viewIndex !== 0) setSelectedTransaction(undefined);
            setViewIndex(0);
          }}
        >
          Queue
        </button>
        <button
          className={classnames(
            classes.navButton,
            viewIndex === 1 && "border-primary-400"
          )}
          onClick={(e) => {
            if (viewIndex !== 1) setSelectedTransaction(undefined);
            setViewIndex(1);
          }}
        >
          History
        </button>
      </nav>
      <div className="flex">
        <div className="xl:w-1/2 w-full p-3">
          {viewIndex === 0 ? (
            <Pager
              data={transactionsData}
              selectedTransaction={selectedTransaction!}
              setSelectedTransaction={setSelectedTransaction}
            />
          ) : (
            <Pager
              data={transactionsHistoryData}
              selectedTransaction={selectedTransaction!}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
        </div>
        <div className="xl:w-1/2 w-full p-3">
          {selectedTransaction !== undefined && (
            <SelectedTransaction
              selectedTransaction={selectedTransaction}
              setSelectedTransaction={setSelectedTransaction}
              success={success}
              setSuccess={setSuccess}
            />
          )}
        </div>
      </div>

      <Success
        success={success}
        setSuccess={setSuccess}
        title="Transaction submitted"
      />
    </PageLayout>
  );
};

export default Transactions;
