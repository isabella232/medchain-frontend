import { network } from "@dedis/cothority";
import { ClientTransaction } from "@dedis/cothority/byzcoin";
import { addJSON, registerMessage } from "@dedis/cothority/protobuf";
import { Message } from "protobufjs/light";
import models from "./protobuf/models.json";
/**
 * File containing all protobuf message definitions
 */

/**
 * Protobuf definition of a Bypro Query
 */
export class Query extends Message<Query> {
  static register() {
    registerMessage("bypros.Query", Query);
  }

  query!: string;
}
/**
 * Protobuf definition of a Bypro Query reply
 */
export class QueryReply extends Message<QueryReply> {
  static register() {
    registerMessage("bypros.QueryReply", QueryReply);
  }

  readonly result!: Buffer;
}
/**
 * Protobuf definition of a Bypro follow request. We use this to ask bypros to follow a Byzcoin conode
 */
export class Follow extends Message<Follow> {
  static register() {
    registerMessage("bypros.Follow", Follow);
  }

  scid!: Buffer;
  target!: network.ServerIdentity;
}
/**
 * Protobuf definition of an empty protobuf reply
 */
export class EmptyReply extends Message<EmptyReply> {
  static register() {
    registerMessage("bypros.EmptyReply", EmptyReply);
  }
}
/**
 * Protobuf definition of a Bypro unfollow request. We use this to ask bypros to unfollow a Byzcoin conode
 */
export class Unfollow extends Message<Unfollow> {
  static register() {
    registerMessage("bypros.Unfollow", Unfollow);
  }
}
/**
 * Protobuf definition of a Bypro catchup request. We use this to ask bypros to catch up the Byzcoin missing data.
 */
export class CatchUpMsg extends Message<CatchUpMsg> {
  static register() {
    registerMessage("bypros.CatchUpMsg", CatchUpMsg);
  }

  scid!: Buffer;
  target!: network.ServerIdentity;
  fromblock!: Buffer;
  updateevery!: number;
}
/**
 * Protobuf definition of a Bypros catch up status
 */
export class CatchUpStatus extends Message<CatchUpStatus> {
  static register() {
    registerMessage("bypros.CatchUpStatus", CatchUpStatus);
  }

  message!: string;
  blockindex!: number;
  blockhash!: Buffer;

  toString(): string {
    return `message: ${this.message}, block index: ${
      this.blockindex
    }, block hash: ${this.blockhash.toString("hex")}`;
  }
}
/**
 * Protobuf definition of a Bypros catch up response.
 */
export class CatchUpResponse extends Message<CatchUpResponse> {
  static register() {
    registerMessage("bypros.CatchUpResponse", CatchUpResponse, CatchUpStatus);
  }

  status!: CatchUpStatus;
  done!: boolean;
  err!: string;

  toString(): string {
    return `status: ${this.status.toString()}, done: ${this.done}, err: ${
      this.err
    }`;
  }
}
/**
 * Protobuf definition of a Deferred contract instance
 */
export class DeferredData extends Message<DeferredData> {
  static register() {
    registerMessage("deferred.DeferredData", DeferredData);
  }

  proposedtransaction!: ClientTransaction;
  expireblockindex!: number;
  instructionhashes: Buffer[] = [];
  maxnumexecution!: number;
  execresult: Buffer[] = [];

  toString(): string {
    console.log(this.proposedtransaction);
    return `Deferred instance:
- Proposed transaction: ${this.proposedtransaction.instructions[0]}
- ExpireBlockIndex: ${this.expireblockindex}
- InstructionHashes: ${this.instructionhashes[0].toString("hex")}
- MaxNumExecution: ${this.maxnumexecution}
- ExecResult: ${this.execresult}`;
  }
}
/**
 * Protobuf definition of a Project contract instance
 */
export class ProjectContract extends Message<ProjectContract> {
  static register() {
    registerMessage("contracts.ProjectContract", ProjectContract);
  }

  name!: string;
  description!: number;
  authorizations!: Authorization[];

  toString(): string {
    return ``;
  }
}
/**
 * Protobuf definition of an Authorization object
 */
export class Authorization extends Message<Authorization> {
  static register() {
    registerMessage("contracts.Authorization", Authorization);
  }
  userid!: string;
  queryterms!: string[];

  toString(): string {
    return ``;
  }
}

addJSON(models);

ProjectContract.register();
Authorization.register();
Query.register();
QueryReply.register();
Follow.register();
EmptyReply.register();
Unfollow.register();
CatchUpMsg.register();
CatchUpResponse.register();
DeferredData.register();
CatchUpStatus.register();
