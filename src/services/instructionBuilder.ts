import {
  Argument,
  ClientTransaction,
  Instruction,
} from "@dedis/cothority/byzcoin";
import { Darc, IdentityWrapper, SignerEd25519 } from "@dedis/cothority/darc";
import { arrayRemove } from "../tools/helpers";
import { getAdmins, hex2Bytes } from "./cothorityUtils";
import { getDarcID } from "./roster";

// Admins #####################################################################################

/**
 * Evolve a darc given an administrator list and the current darc as argument
 * @param adminList The list of administrators of the consortium
 * @param darc The current darc
 * @returns the evolved darc with the new list of administrators
 */
export const evolveDarcWithAdminList = (adminList: string[], darc: Darc) => {
  var newDarc: Darc = darc.evolve();
  const multisigExpr = Buffer.from(`threshold<2/3,${adminList.join(",")}>`);
  const orExpr = Buffer.from(`${adminList.join("|")}`);
  newDarc.rules.setRuleExp("spawn:darc", multisigExpr);
  newDarc.rules.setRuleExp("invoke:darc.evolve", multisigExpr);
  newDarc.rules.setRuleExp("spawn:project", multisigExpr);
  newDarc.rules.setRuleExp("invoke:project.add", multisigExpr);
  newDarc.rules.setRuleExp("invoke:project.remove", multisigExpr);
  newDarc.rules.setRuleExp("spawn:deferred", orExpr);
  newDarc.rules.setRuleExp("invoke:deferred.addProof", orExpr);
  newDarc.rules.setRuleExp("invoke:deferred.execProposedTx", orExpr);
  return newDarc;
};
/**
 * Evolve a darc to add an administrator in the consortium
 * @param darc The current darc
 * @param admin The admin to add
 * @returns the evolved darc with the new administrators list
 */
export const addAdmintoDarc = (
  darc: Darc,
  admin: string
): ClientTransaction => {
  var admins = getAdmins(darc) as string[];
  admins.push(admin);
  var newDarc = evolveDarcWithAdminList(admins, darc);
  const tx = createDarcEvolveInstruction(newDarc);
  return createDeferredTransaction(tx);
};
/**
 * Evolve a darc to remove an administrator in the consortium
 * @param darc The current darc
 * @param admin The admin to remove
 * @returns the evolved darc with the new administrators list
 */
export const removeAdminFromDarc = (
  darc: Darc,
  admin: string
): ClientTransaction => {
  var admins = getAdmins(darc);
  admins = arrayRemove(admins as string[], admin);
  const newDarc = evolveDarcWithAdminList(admins, darc);
  const tx = createDarcEvolveInstruction(newDarc);
  return createDeferredTransaction(tx);
};
/**
 * Evolve a darc to modify the key of an administrator in the consortium
 * @param darc The current darc
 * @param admin The old admin key
 * @param admin The new admin key
 * @returns the evolved darc with the new administrators list
 */
export const modifyAdminFromDarc = (
  darc: Darc,
  admin: string,
  newAdmin: string
): ClientTransaction => {
  var admins = getAdmins(darc);
  admins = arrayRemove(admins as string[], admin);
  admins.push(newAdmin);
  const newDarc = evolveDarcWithAdminList(admins, darc);
  const tx = createDarcEvolveInstruction(newDarc);
  return createDeferredTransaction(tx);
};
/**
 * Helper method to create the evolution transaction
 * @param darc The evolved darc
 * @returns the evolution transaction
 */
export const createDarcEvolveInstruction = (darc: Darc): ClientTransaction => {
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

// Deferred Transactions ######################################################################

/**
 * Returns a deferred transaction for the transaction given as argument
 * @param tx The transaction
 * @returns the deferred transaction
 */
const createDeferredTransaction = (
  tx: ClientTransaction
): ClientTransaction => {
  const txArg = new Argument({
    name: "proposedTransaction",
    value: Buffer.from(ClientTransaction.encode(tx).finish()),
  });
  const deferredInstruction = Instruction.createSpawn(
    hex2Bytes(getDarcID()),
    "deferred",
    [txArg]
  );
  const deferredTransaction = ClientTransaction.make(2, deferredInstruction);
  return deferredTransaction;
};
/**
 * Create a transaction to sign a deferred transaction
 * @param sk The secret key of the signer
 * @param instructionHash The instruction hash to sign
 * @param instanceID The instanceID of the deferred transaction to sign
 * @param index The index of the instruction to sign
 * @returns the signature transaction
 */
export const signDeferredTransaction = (
  sk: string,
  instructionHash: Buffer,
  instanceID: Buffer,
  index: number //TODO modify this index during the transaction panel refactoring
) => {
  const sid = Buffer.from(hex2Bytes(sk));
  const signer = SignerEd25519.fromBytes(sid);
  const wrapper = IdentityWrapper.fromIdentity(signer);
  const pkBuf = Buffer.from(IdentityWrapper.encode(wrapper).finish());
  const signature = signer.sign(instructionHash);
  const b = Buffer.allocUnsafe(4);
  b.writeInt32LE(0, 0);
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
/**
 * Create a transaction to execute a deferred transaction
 * @param instanceID The instanceID of the deferred transaction to execute
 * @returns the execution transaction
 */
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

// Projects ###################################################################################

/**
 * Create a transaction to spawn a project contract
 * @param userID The ID of the user
 * @param userID The access right to add
 * @param instanceID The instance ID of the project contract
 * @returns the transaction to add the user right to the project
 */
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
/**
 * Create a transaction to add a user right to a project contract
 * @param userID The ID of the user
 * @param userID The access right to add
 * @param instanceID The instance ID of the project contract
 * @returns the transaction to add the user right to the project
 */
export const addUserRightsToProject = (
  userID: string,
  queryTerm: string,
  instanceID: Buffer
) => {
  const userIDArg = new Argument({
    name: "userID",
    value: Buffer.from(userID),
  });
  const queryTermArg = new Argument({
    name: "queryTerm",
    value: Buffer.from(queryTerm),
  });
  const instruction = Instruction.createInvoke(instanceID, "project", "add", [
    userIDArg,
    queryTermArg,
  ]);
  const tx = ClientTransaction.make(2, instruction);
  return tx;
};

