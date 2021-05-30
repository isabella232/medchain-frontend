import { Instruction as InstructionType } from "@dedis/cothority/byzcoin";
import classnames from "classnames";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import classes from "../classes/classes";
import { ConnectionContext } from "../contexts/ConnectionContext";
import {
  byprosQuery,
  getDeferred,
  sendTransaction,
} from "../services/cothorityGateway";
import { hex2Bytes } from "../services/cothorityUtils";
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
      connection.public,
      instructionHash,
      Buffer.from(hex2Bytes(instanceID)),
      index
    );
    sendTransaction(tx, connection.private)
      .then((res) => {
        console.log(res);
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
          <div className="">{instructionData.invoke.contractID}</div>
        </PanelElement>
        <PanelElement title="Command">
          <div className="">{instructionData.invoke.command}</div>
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
        <div className="">{instructionData.invoke.contractID}</div>
      </PanelElement>
      <PanelElement title="Command">
        <div className="">{instructionData.invoke.command}</div>
      </PanelElement>
      <PanelElement
        title={`Signatures (${instructionData.signatures.length})`}
        last
      >
        <div className="">
          {instructionData.signatures.length == 0 ? "No signature" : signers}
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

  const executeTransaction = () => {
    const tx = executeDeferredTransaction(selectedTransaction.instanceid);
    sendTransaction(tx, connection.private)
      .then((res) => {
        console.log(res);
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
    setTransactionData(undefined);
    getDeferred(selectedTransaction.instanceid).then((result) => {
      console.log(result);
      setTransactionData(result);
      if (result.execresult.length !== 0) {
        setExecuted(true);
      }
    });
    // TODO implement transaction timestamp
    // getBlock().then((res) =>
    //   console.log(DataBody.decode(Buffer.from(res.payload)))
    // );
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
        <Spinner />
      )}
      {transactionData && !executed && (
        <ExecuteButton className="mt-4" onClick={openExecuteModal} />
      )}
      {error && (
        <Error message={error} reset={setError} title="Transaction failed" />
      )}
      {/* {success && (
        <Success
          message={success}
          reset={setSuccess}
          title="Transaction successfully executed"
        />
      )} */}
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
    // getDeferredData('a81b8d76b6a1453728a211c3823afb3b3ff0e572e77358f3ebadd4860f9b68ca')
    // TODO embed query in file
    byprosQuery(`SELECT
    encode(cothority.instruction.contract_iid, 'hex') as instanceid
  FROM
    cothority.instruction
  WHERE
    cothority.instruction.contract_name = 'deferred' 
  AND 
    cothority.instruction.type_id = 2
  AND
    cothority.instruction.contract_iid 
    NOT IN (
      SELECT 
        cothority.instruction.contract_iid
      FROM
        cothority.instruction
      INNER JOIN 
        cothority.transaction 
      ON
        cothority.transaction.transaction_id = cothority.instruction.transaction_id
      WHERE
        cothority.instruction.type_id = 3
      AND 
        cothority.instruction.contract_name = 'deferred'
      AND 
        cothority.instruction.Action = 'invoke:deferred.execProposedTx'
      AND 
        cothority.transaction.Accepted = TRUE
    ) `).then((reply) => {
      setTransactionsData(reply.reverse());
    });
    byprosQuery(`SELECT 
    encode(cothority.instruction.contract_iid,'hex') as instanceid
  FROM
    cothority.instruction
  INNER JOIN 
    cothority.transaction 
  ON
    cothority.transaction.transaction_id = cothority.instruction.transaction_id
  WHERE
    cothority.instruction.type_id = 3
  AND 
    cothority.instruction.contract_name = 'deferred'
  AND 
    cothority.instruction.Action = 'invoke:deferred.execProposedTx'
  AND 
    cothority.transaction.Accepted = TRUE`).then((reply) => {
      setTransactionsHistoryData(reply.reverse());
    });
    console.log(success);
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
