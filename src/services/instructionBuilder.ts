import {
  Argument,
  ClientTransaction,
  Instruction,
} from "@dedis/cothority/byzcoin";
import { Darc, IdentityWrapper, SignerEd25519 } from "@dedis/cothority/darc";
import { arrayRemove } from "../tools/helpers";
import { getAdmins, hex2Bytes } from "./cothorityUtils";
import { getDarcID } from "./roster";

export const changeAdminList = (adminList: string[], darc: Darc) => {
  var newDarc: Darc = darc.evolve();
  newDarc.rules.list.map((rule) => []);
  return newDarc;
};

export const addAdmintoDarc = (darc: Darc, admin: string) => {
  var newDarc = darc.evolve();
  var admins = getAdmins(darc);
  const op = "|";
  const expr = Buffer.from(`${admins?.join("|")}${op}${admin}`);
  newDarc.rules.setRuleExp("_sign", expr);
  const tx = createDarcEvolveInstruction(newDarc);
  return createDeferredTransaction(tx);
};

export const removeFromAdmintoDarc = (darc: Darc, admin: string) => {
  var newDarc = darc.evolve();
  var admins = getAdmins(darc);
  console.log(admins);
  admins = arrayRemove(admins as string[], admin);
  console.log(admins);
  const op = "|";
  const expr = Buffer.from(`${admins?.join("|")}`);
  newDarc.rules.setRuleExp("_sign", expr);
  const tx = createDarcEvolveInstruction(newDarc);
  return createDeferredTransaction(tx);
};

export const createDarcEvolveInstruction = (darc: Darc) => {
  const txArg = new Argument({ name: "darc", value: darc.toBytes() });
  const instruction = Instruction.createInvoke(
    hex2Bytes(getDarcID()),
    "darc",
    "evolve",
    [txArg]
  );
  const tx = ClientTransaction.make(2, instruction);
  return tx;
};

export const signDeferredTransaction = (
  sk: string,
  pk: string,
  instructionHash: Buffer,
  instanceID: Buffer,
  index: number
) => {
  const sid = Buffer.from(hex2Bytes(sk));
  const signer = SignerEd25519.fromBytes(sid);
  const wrapper = IdentityWrapper.fromIdentity(signer);
  const pkBuf = Buffer.from(IdentityWrapper.encode(wrapper).finish());
  const signature = signer.sign(instructionHash);
  const b = Buffer.allocUnsafe(4);
  b.writeInt32LE(0, 0);
  const indexBuf = Buffer.from([index]);
  const identityArg = new Argument({ name: "identity", value: pkBuf });
  const signatureArg = new Argument({ name: "signature", value: signature });
  const indexArg = new Argument({ name: "index", value: b });
  const instruction = Instruction.createInvoke(
    instanceID,
    "deferred",
    "addProof",
    [identityArg, signatureArg, indexArg]
  );
  const tx = ClientTransaction.make(2, instruction);
  return tx;
};

export const executeDeferredTransaction = (instanceID: string) => {
  const instruction = Instruction.createInvoke(
    hex2Bytes(instanceID),
    "deferred",
    "execProposedTx",
    []
  );
  const tx = ClientTransaction.make(2, instruction);
  return tx;
};

export const spawnProjectInstruction = (darc: Darc) => {
  const nameArg = new Argument({ name: "name", value: Buffer.from("test") });
  const descriptionArg = new Argument({
    name: "description",
    value: Buffer.from("description"),
  });

  const instruction = Instruction.createSpawn(
    hex2Bytes(getDarcID()),
    "project",
    [nameArg, descriptionArg]
  );
  const tx = ClientTransaction.make(2, instruction);
  return tx;
};

// TODO type everything
const createDeferredTransaction = (tx: ClientTransaction) => {
  const txArg = new Argument({
    name: "proposedTransaction",
    value: Buffer.from(ClientTransaction.encode(tx).finish()),
  });
  const deferredInstruction = Instruction.createSpawn(
    hex2Bytes(getDarcID()),
    "deferred",
    [txArg]
  );
  console.log("deferred instruction: ", deferredInstruction);
  const deferredTransaction = ClientTransaction.make(2, deferredInstruction);
  return deferredTransaction;
};
