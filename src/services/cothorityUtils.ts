import { Darc } from "@dedis/cothority/darc";

export const keyRegex:RegExp = /ed25519\:[a-fA-F0-9]{64}/g

/**
 * Create a list of administrators from the _sign expression
 * @param darc The administration darc
 * @returns the list of admins
 */
export const getAdmins = (darc: Darc) => {
  const signExpr: string = darc.rules.getRule("_sign").getExpr().toString();
  console.log(signExpr)
  const admins = signExpr.match(keyRegex)
  console.log(admins)
  return admins;
};

/**
 * Validate the key expression
 * @param key The public key
 * @returns true if the key is valid, false otherwise
 */
 export const validateKey = (key: string):Boolean => {
    const re:RegExp = /ed25519\:[a-fA-F0-9]{64}/
    return re.test(key);
  };
  

  export function hex2Bytes(hex: string): Buffer {
    if (!hex) {
      return Buffer.allocUnsafe(0);
    }
  
    return Buffer.from(hex, "hex");
  }
  