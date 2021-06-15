import { Darc } from "@dedis/cothority/darc";
import { SkipBlock } from "@dedis/cothority/skipchain";
import { DataHeader } from "@dedis/cothority/byzcoin/proto";

export const identityRe: RegExp = /ed25519:[a-fA-F0-9]{64}/g;
export const multisigRe: RegExp = /\d+\/\d+/g;

/**
 * Get the list of administrators from the invoke:darc.evolve expression
 * @param darc The administration darc
 * @returns the list of admins
 */
export const getAdmins = (darc: Darc) => {
  const expr: string = darc.rules.getRule("invoke:darc.evolve").getExpr().toString();
  const admins = expr.match(identityRe);
  return admins;
};
/**
 * Get the multisignature rule from the darc given as argument
 * @param darc The administration darc
 * @returns the multisignature rule
 */
 export const getMultiSigRule = (darc: Darc) => {
  const expr: string = darc.rules.getRule("invoke:darc.evolve").getExpr().toString();
  const multisigRule = multisigRe.exec(expr);
  if (multisigRule !== null) return multisigRule[0]
  return multisigRule;
};
/**
 * Validate the key expression
 * @param key The public key
 * @returns true if the key is valid, false otherwise
 */
export const validateIdentity = (key: string): Boolean => {
  const re: RegExp = /ed25519:[a-fA-F0-9]{64}/;
  return re.test(key);
};
/**
 * Convert hexadecimal string as byte Buffer
 * @param hex The hex string
 * @returns The Buffer
 */
export function hex2Bytes(hex: string): Buffer {
  if (!hex) {
    return Buffer.allocUnsafe(0);
  }

  return Buffer.from(hex, "hex");
}
/**
 * Get the timestamp of a SkipBlock
 * @param block The Skipblock
 * @returns The timestamp at the time of the block creation
 */
export function getTimeString(block: SkipBlock): string {
  const timestamp = Number(DataHeader.decode(block.data).timestamp);
  const date = new Date(timestamp / 1000_000);
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();

  return (
      date.toISOString().slice(0, 10) +
      " at " +
      hours +
      ":" +
      minutes.substr(-2) +
      ":" +
      seconds.substr(-2)
  );
}
/**
 * Validate the multisignature rule expression
 * @param rule The multisignature rule
 * @returns true if the multisig rule is valid, false otherwise
 */
 export const validateMultisig = (rule: string): Boolean => {
  const re: RegExp = /\d+\/\d+/;
  return re.test(rule);
};
/**
 * Validate the public and private key expression
 * @param key The public or private key
 * @returns true if the key is valid, false otherwise
 */
 export const validateKeys = (rule: string): Boolean => {
  const re: RegExp = /[a-fA-F0-9]{64}/;
  return re.test(rule);
};

