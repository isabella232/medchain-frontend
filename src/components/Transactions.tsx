import { Instruction as InstructionType } from "@dedis/cothority/byzcoin";
import classnames from "classnames";
import { FunctionComponent, useEffect, useState, useContext } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import classes from "../classes/classes";
import { ConnectionContext } from "../contexts/ConnectionContext";
import {
  byprosQuery,
  getBlock,
  getDeferred,
  sendTransaction,
} from "../services/cothorityGateway";
import { hex2Bytes } from "../services/cothorityUtils";
import {
  executeDeferredTransaction,
  signDeferredTransaction,
} from "../services/instructionBuilder";
import { DeferredData } from "../services/messages";
import { AbortButton, ExecuteButton, SignButton, CopyButton } from "./Buttons";
import PageLayout from "./PageLayout";
import Pager from "./Pager";
import PanelElement from "./PanelElement";
import TransactionModal from "./TransactionModal";
import DataBody from "@dedis/cothority/byzcoin/proto/data-body";
import Spinner from "./Spinner";

const Instruction: FunctionComponent<{
  instructionHash: Buffer;
  instructionData: InstructionType;
  index: number;
  instanceID: string;
  executed?: boolean;
}> = ({ instructionHash, instructionData, index, instanceID, executed }) => {
  const { connection, setConnection } = useContext(ConnectionContext);
  const openSignModal = () => {
    setIsOpen(true);
  };
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
      })
      .catch((err) => console.log(err));
  };

  const [modalIsOpen, setIsOpen] = useState(false);
  return (
    <div className="">
      <TransactionModal
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        title="Sign Instruction"
        executeAction={() => signInstruction()}
        abortAction={() => setIsOpen(false)}
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
              : instructionData.signerIdentities.map((signer) =>
                  signer.toString()
                )}
          </div>
        </PanelElement>
      </TransactionModal>
      <PanelElement title="Instruction Hash">
      {instructionHash.toString("hex")} <CopyButton elem={instructionHash.toString("hex")}/>
      </PanelElement>
      <PanelElement title="Contract">
        <div className="">{instructionData.invoke.contractID}</div>
      </PanelElement>
      <PanelElement title="Command">
        <div className="">{instructionData.invoke.command}</div>
      </PanelElement>
      <PanelElement title="Signatures" last>
        <div className="">
          {instructionData.signatures.length == 0
            ? "No signature"
            : instructionData.signatures}
        </div>
      </PanelElement>

      {!executed && <SignButton onClick={openSignModal} />}
    </div>
  );
};

const SelectedTransaction: FunctionComponent<{
  selectedTransaction: any;
  setSelectedTransaction: any;
}> = ({ selectedTransaction, setSelectedTransaction }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<DeferredData>();
  const [executed, setExecuted] = useState<boolean>(false);
  const { connection } = useContext(ConnectionContext);
  const executeTransaction = () => {
    const tx = executeDeferredTransaction(selectedTransaction.instanceid);
    sendTransaction(tx, connection.private)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  };
  const openSignModal = () => {
    setIsOpen(true);
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
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        title="Execute Transaction"
        executeAction={() => executeTransaction()}
        abortAction={() => setIsOpen(false)}
      ></TransactionModal>
      <PanelElement title="Transaction instance ID">
        {selectedTransaction.instanceid}  
        <CopyButton elem={selectedTransaction.instanceid}/>
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
              />
            );
          }
        )
      ) : (
        <Spinner />
      )}
      {transactionData && !executed && (
        <ExecuteButton className="mt-4" onClick={openSignModal} />
      )}
    </div>
  );
};
// TODO Change type

const Transactions = () => {
  const [viewIndex, setViewIndex] = useState(0);
  const [transactionsData, setTransactionsData] = useState([]);
  const [transactionsHistoryData, setTransactionsHistoryData] = useState([]);

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
  }, []);

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
        <div className="w-1/2 p-3">
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

        <div className="w-1/2 p-3">
          {selectedTransaction !== undefined && (
            <SelectedTransaction
              selectedTransaction={selectedTransaction}
              setSelectedTransaction={setSelectedTransaction}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Transactions;
