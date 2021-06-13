/**
 * Method used to display a smaller formatted version of a hash
 * @param hash The hash value
 * @returns The formatted hash value
 */
export const formatHash = (hash: string) =>
  `${hash.substr(0, 8 + 2)} ... ${hash.substr(-8)}`;

/**
 * Method used to display a smaller formatted version of the account name
 * @param hash The account name
 * @returns The formatted account name
 */
export const formatAccountName = (accountName: string) =>
  `${accountName.substr(0, 8 + 2)}...${accountName.substr(-8)}`;
