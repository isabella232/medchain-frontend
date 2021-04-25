export const formatHash = (hash: string) =>
    `${hash.substr(0, 8 + 2)} ... ${hash.substr(-8)}`
