import { Instruction as InstructionType } from "@dedis/cothority/byzcoin";
import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import classes from "../classes/classes";
import { ConnectionContext } from "../contexts/ConnectionContext";
import { queries } from "../services/byprosQueries";
import {
  byprosQuery,
  getBlock,
  getDeferred,
  sendTransaction,
} from "../services/cothorityGateway";
import { getTimeString, hex2Bytes } from "../services/cothorityUtils";
import {
  executeDeferredTransaction,
  signDeferredTransaction,
} from "../services/instructionBuilder";
import { DeferredData } from "../services/messages";
import { CopyButton, ExecuteButton, SignButton } from "./Buttons";
import Error from "./Error";
import PageLayout from "./PageLayout";
import Pager from "./Pager";
import PanelElement from "./PanelElement";
import Spinner from "./Spinner";
import Success from "./Success";
import TransactionModal from "./TransactionModal";


const Instruction: FunctionComponent<{
  instructionHash: Buffer;
  instructionData: InstructionType;
  index: number;
  instanceID: string;
  executed?: boolean;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTransaction: any;
}> = ({
  instructionHash,
  instructionData,
  index,
  instanceID,
  executed,
  setError,
  setSuccess,
  setSelectedTransaction,
}) => {
  const { connection } = useContext(ConnectionContext);
  const [signModalIsOpen, setSignModal] = useState(false);
  const [signers, setSigners] = useState<string[]>([]);
  const openSignModal = () => {
    setSignModal(true);
  };

  useEffect(() => {
    setSigners(
      instructionData.signerIdentities.map((signer) => signer.toString())
    );
  });

  const signInstruction = () => {
    const tx = signDeferredTransaction(
      connection.private,
      instructionHash,
      Buffer.from(hex2Bytes(instanceID)),
      index
    );
    sendTransaction(tx, connection.private)
      .then((res) => {
        setSignModal(false);
        setSuccess(res);
        setSelectedTransaction(undefined);
      })
      .catch((err) => {
        console.log(err);
        setSignModal(false);
        setError(err);
      });
  };

  return (
    <div className="">
      <TransactionModal
        modalIsOpen={signModalIsOpen}
        setIsOpen={setSignModal}
        title="Sign Instruction"
        executeAction={() => signInstruction()}
        abortAction={() => setSignModal(false)}
      >
        <PanelElement title="Instruction Hash">
          <div className="">{instructionHash.toString("hex")}</div>
        </PanelElement>
        <PanelElement title="Contract">
          <div className="">{instructionData.invoke? instructionData.invoke.contractID : instructionData.spawn.contractID}</div>
        </PanelElement>
        <PanelElement title="Command">
          <div className="">{instructionData.invoke? instructionData.invoke.command : "spawn"}</div>
        </PanelElement>
        <PanelElement title="Signatures" last>
          <div className="">
            {instructionData.signerIdentities.length === 0
              ? "No signature"
              : signers}
          </div>
        </PanelElement>
      </TransactionModal>
      <PanelElement title="Instruction Hash">
        {instructionHash.toString("hex")}{" "}
        <CopyButton elem={instructionHash.toString("hex")} />
      </PanelElement>
      <PanelElement title="Contract">
        <div className="">{instructionData.invoke? instructionData.invoke.contractID: instructionData.spawn.contractID}</div>
      </PanelElement>
      <PanelElement title="Command">
        <div className="">{instructionData.invoke? instructionData.invoke.command : "spawn"}</div>
      </PanelElement>
      <PanelElement
        title={`Signatures (${instructionData.signatures.length})`}
        last
      >
        <div className="">
          {instructionData.signatures.length == 0 ? "No signature" : signers.map(signer => {
            return <div>{signer}</div>
          } )}
        </div>
      </PanelElement>

      {!executed &&
        (!signers.includes(connection.public) ? (
          <SignButton onClick={openSignModal} />
        ) : (
          <span className="text-xs font-bold text-primary-400">
            You already signed the instruction
          </span>
        ))}
    </div>
  );
};

const SelectedTransaction: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
  success: any;
  setSuccess: any;
}> = ({ selectedTransaction, setSelectedTransaction, success, setSuccess }) => {
  const [executeModalIsOpen, setExecuteModal] = useState(false);
  const [transactionData, setTransactionData] = useState<DeferredData>();
  const [executed, setExecuted] = useState<boolean>(false);
  const { connection } = useContext(ConnectionContext);
  const [error, setError] = useState("");
  const [date, setDate] = useState("")

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
        setError(err.toString());
      });
  };
  const openExecuteModal = () => {
    setExecuteModal(true);
  };

  useEffect(() => {
    console.log(selectedTransaction)
    setTransactionData(undefined);
    getDeferred(selectedTransaction.instanceid).then((result) => {
      setTransactionData(result);
      if (result.execresult.length !== 0) {
        setExecuted(true);
      }
    }).catch(err => {setError(err.toString())
    console.log(err)});

    getBlock(selectedTransaction.blockhash).then((res) =>
      setDate(getTimeString(res))
    );
  }, [selectedTransaction]);
  return (
    <div className="bg-white rounded-lg shadow-lg p-3">
      <TransactionModal
        modalIsOpen={executeModalIsOpen}
        setIsOpen={setExecuteModal}
        title="Execute Transaction"
        executeAction={() => executeTransaction()}
        abortAction={() => setExecuteModal(false)}
      ></TransactionModal>
      <PanelElement title="Transaction instance ID">
        {selectedTransaction.instanceid}
        <CopyButton elem={selectedTransaction.instanceid} />
      </PanelElement>
      <PanelElement title="Date">
        {date? date: <Spinner/>}
      </PanelElement>
      {transactionData ? (
        transactionData.proposedtransaction.instructions.map(
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
      ) : (
       !error &&  <Spinner />
      )}
      {transactionData && !executed && (
        <ExecuteButton className="mt-4" onClick={openExecuteModal} />
      )}
      {error && (
        <Error message={error} reset={setError} title="Transaction failed" />
      )}
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
      setTransactionsData(reply.reverse());
    });
    byprosQuery(queries.transactionsHistory).then((reply) => {
      setTransactionsHistoryData(reply.reverse());
    });
  }, [success]);

  const [selectedTransaction, setSelectedTransaction] = useState<any>();
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
              selectedTransaction={selectedTransaction}
              setSelectedTransaction={setSelectedTransaction}
            />
          ) : (
            <Pager
              data={transactionsHistoryData}
              selectedTransaction={selectedTransaction}
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
