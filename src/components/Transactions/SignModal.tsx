import { Instruction as InstructionType } from "@dedis/cothority/byzcoin";
import { Darc } from "@dedis/cothority/darc";
import { FunctionComponent } from "react";
import PanelElement from "../PanelElement";
import TransactionModal from "../TransactionModal";

const SignModal: FunctionComponent<{
  signModalIsOpen: boolean;
  setSignModal: React.Dispatch<React.SetStateAction<boolean>>;
  signInstruction: () => void;
  instructionHash: Buffer;
  instructionData: InstructionType;
  signers: string[];
}> = ({
  signModalIsOpen,
  setSignModal,
  signInstruction,
  instructionHash,
  instructionData,
  signers,
}) => {
  return (
    <TransactionModal
      modalIsOpen={signModalIsOpen}
      setIsOpen={setSignModal}
      title="Sign Instruction"
      executeAction={() => signInstruction()}
      abortAction={() => setSignModal(false)}
    >
      <PanelElement title="Instruction Hash">
        <div>{instructionHash.toString("hex")}</div>
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
      <PanelElement title="Signatures" last>
        <div>
          {instructionData.signerIdentities.length === 0
            ? "No signature"
            : signers}
        </div>
      </PanelElement>
    </TransactionModal>
  );
};

export default SignModal