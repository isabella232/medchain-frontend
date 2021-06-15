import { ByzCoinRPC, ClientTransaction } from "@dedis/cothority/byzcoin";
import { Darc, SignerEd25519 } from "@dedis/cothority/darc";
import { Roster, WebSocketConnection } from "@dedis/cothority/network/index";
import { SkipBlock, SkipchainRPC } from "@dedis/cothority/skipchain";
import { hex2Bytes } from "./cothorityUtils";
import { DeferredData, ProjectContract, Query, QueryReply } from "./messages";
import { getByzcoinID, getRosterStr } from "./roster";

/**
 * Method to get the genesis DARC
 * @returns the genesis DARC
 */
export async function getDarc(): Promise<Darc> {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  const darc = rpc.getDarc();
  return darc;
}
/**
 * Get the web socket connection to a conode. It returns the connection to the first one in the list.
 * @returns the web socket connection to a conode
 */
export function getWSConnection(): WebSocketConnection {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const ws = new WebSocketConnection(
    roster.list[0].getWebSocketAddress(),
    "ByzcoinProxy"
  );
  return ws;
}
/**
 * Get the RPC Connection to the roster of nodes.
 * @returns the RPC connection to the roster of conodes
 */
export async function getRPConnection(): Promise<ByzCoinRPC> {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  return rpc;
}
/**
 * Execute a Bypros query given as argument
 * @param sqlInput The SQL query
 * @returns the result of the query
 */
export async function byprosQuery(sqlInput: string) {
  const ws = getWSConnection();
  const query = new Query();
  query.query = sqlInput;
  const reply = await ws.send(query, QueryReply);
  return JSON.parse((reply as QueryReply).result.toString());
}
/**
 * Get the deferred transaction data given the instance ID of the deferred transaction
 * @param instanceid The instance ID
 * @returns Deferred transaction data
 */
export async function getDeferred(instanceid: string) {
  const rpc = await getRPConnection();
  const proof = await rpc.getProof(hex2Bytes(instanceid));
  const deferred = DeferredData.decode(Buffer.from(proof.value));

  return deferred;
}
/**
 * Get a project contract data given the instance ID of the project contract
 * @param instanceid The instance ID of the project contract
 * @returns Project data
 */
export async function getProject(instanceid: string) {
  const rpc = await getRPConnection();
  const proof = await rpc.getProof(hex2Bytes(instanceid));
  console.log(proof.value);
  const project = ProjectContract.decode(Buffer.from(proof.value));

  return { instanceid: instanceid, project: project };
}
/**
 * Get a block given the hash of the block
 * @param blockHash the block hash
 * @returns The Skipblock
 */
export async function getBlock(blockHash: string): Promise<SkipBlock> {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  return new SkipchainRPC(roster).getSkipBlock(hex2Bytes(blockHash));
}
/**
 * Send a transaction given as input to the conodes roster. It adds the signature of the secret key given as argument
 * @param tx the transaction to sign and send to the conodes roster
 * @param sk the secret key used to sign the transaction
 * @returns The instance ID of the first instruction
 */
export async function sendTransaction(tx: ClientTransaction, sk: string) {
  const rpc = await getRPConnection();

  const sid = Buffer.from(hex2Bytes(sk));
  const signer = SignerEd25519.fromBytes(sid);

  await tx.updateCounters(rpc, [[signer]]);
  tx.signWith([[signer]]);
  await rpc.sendTransactionAndWait(tx);
  return tx.instructions[0].deriveId().toString("hex");
}
