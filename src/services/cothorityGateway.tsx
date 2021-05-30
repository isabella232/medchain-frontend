import { ByzCoinRPC, ClientTransaction } from "@dedis/cothority/byzcoin";
import { SignerEd25519 } from "@dedis/cothority/darc";
import { Roster, WebSocketConnection } from "@dedis/cothority/network/index";
import { SkipchainRPC } from "@dedis/cothority/skipchain";
import { hex2Bytes } from "./cothorityUtils";
import { DeferredData, ProjectContract, Query, QueryReply } from "./messages";
import { getByzcoinID, getRosterStr } from "./roster";

export async function getDarc() {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  const darc = rpc.getDarc();
  return darc;
}

export async function byprosQuery(sqlInput: string) {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const ws = new WebSocketConnection(
    roster.list[0].getWebSocketAddress(),
    "ByzcoinProxy"
  );

  const query = new Query();
  query.query = sqlInput;

  const reply = await ws.send(query, QueryReply);
  return eval((reply as QueryReply).result.toString());
}

export async function getDeferred(instanceid: string) {
  const roster: Roster = Roster.fromTOML(getRosterStr());

  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  const proof = await rpc.getProof(hex2Bytes(instanceid));

  const deferred = DeferredData.decode(Buffer.from(proof.value));

  return deferred;
}

export async function getProject(instanceid: string) {
  const roster: Roster = Roster.fromTOML(getRosterStr());

  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  const proof = await rpc.getProof(hex2Bytes(instanceid));

  const project = ProjectContract.decode(Buffer.from(proof.value));

  return { instanceid: instanceid, project: project };
}

export async function getBlock(blockHash: string) {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));
  return new SkipchainRPC(roster).getSkipBlock(hex2Bytes(blockHash));
}

export async function sendTransaction(tx: ClientTransaction, pk: string) {
  const roster: Roster = Roster.fromTOML(getRosterStr());
  const rpc = await ByzCoinRPC.fromByzcoin(roster, hex2Bytes(getByzcoinID()));

  const sid = Buffer.from(hex2Bytes(pk));
  const signer = SignerEd25519.fromBytes(sid);

  await tx.updateCounters(rpc, [[signer]]);
  tx.signWith([[signer]]);
  await rpc.sendTransactionAndWait(tx);
  return tx.instructions[0].deriveId().toString("hex");
}
