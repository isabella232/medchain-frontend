export const formatHash = (hash: string) =>
  `${hash.substr(0, 8 + 2)} ... ${hash.substr(-8)}`;

export const formatAccountName = (accountName: string) =>
  `${accountName.substr(0, 8 + 2)}...${accountName.substr(-8)}`;
