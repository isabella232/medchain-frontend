import { Darc } from "@dedis/cothority/darc";

export const identityRe: RegExp = /ed25519\:[a-fA-F0-9]{64}/g;

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
 * Validate the key expression
 * @param key The public key
 * @returns true if the key is valid, false otherwise
 */
export const validateKey = (key: string): Boolean => {
  const re: RegExp = /ed25519\:[a-fA-F0-9]{64}/;
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
