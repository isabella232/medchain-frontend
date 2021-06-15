import { Instruction as InstructionType } from "@dedis/cothority/byzcoin";
import { Darc } from "@dedis/cothority/darc";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { ConnectionContext } from "../../contexts/ConnectionContext";
import { sendTransaction } from "../../services/cothorityGateway";
import { hex2Bytes } from "../../services/cothorityUtils";
import { signDeferredTransaction } from "../../services/instructionBuilder";
import { CopyButton, SignButton } from "../Buttons";
import { ErrorMessage } from "../Error";
import PanelElement from "../PanelElement";
import SignModal from "./SignModal";

const Instruction: FunctionComponent<{
  instructionHash: Buffer;
  instructionData: InstructionType;
  index: number;
  instanceID: string;
  executed?: boolean;
  setError: React.Dispatch<React.SetStateAction<ErrorMessage | undefined>>;
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
  }, [instructionData]);

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
        setError({ message: err, title: "Failed to send the transaction" });
      });
  };

  return (
    <div>
      <SignModal
        signModalIsOpen={signModalIsOpen}
        setSignModal={setSignModal}
        signInstruction={signInstruction}
        instructionHash={instructionHash}
        instructionData={instructionData}
        signers={signers}
      />
      <PanelElement title="Instruction Hash">
        {instructionHash.toString("hex")}{" "}
        <CopyButton elem={instructionHash.toString("hex")} />
      </PanelElement>
      <PanelElement title="Contract">
        <div>
          {instructionData.invoke
            ? instructionData.invoke.contractID
            : instructionData.spawn.contractID}
        </div>
      </PanelElement>
      <PanelElement title="Command">
        <div>
          {instructionData.invoke ? instructionData.invoke.command : "spawn"}
        </div>
      </PanelElement>
      {console.log(instructionData)}
      <PanelElement
        title={`Arguments`}
      >
        {
            instructionData.invoke? 
                instructionData.invoke.contractID === 'darc'?
                instructionData.invoke.command === 'evolve' && 
                    <div>
                        {Darc.decode(instructionData.invoke.args[0].value).toString()}
                    </div>
                :
                instructionData.invoke.contractID === 'project' && 
                <>
                <div>
                    <span className="font-bold mr-2">UserID:</span>{instructionData.invoke.args[0].value.toString()}
                </div>
                <div>
                    <span className="font-bold mr-2">Query term:</span>{instructionData.invoke.args[1].value.toString()}
                </div>
                </>
            :
            <div>
                <>
                <div>
                    <span className="font-bold mr-2">Description:</span>{instructionData.spawn.args[0].value.toString()}
                </div>
                <div>
                    <span className="font-bold mr-2">Project Name:</span>{instructionData.spawn.args[1].value.toString()}
                </div>
                </>
            </div>
        }
      </PanelElement>
      <PanelElement
        title={`Signatures (${instructionData.signatures.length})`}
        last
      >
        <div>
          {instructionData.signatures.length === 0
            ? "No signature"
            : signers.map((signer) => {
                return <div>{signer}</div>;
              })}
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

export default Instruction;
