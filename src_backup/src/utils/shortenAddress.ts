import { AccountAddress } from "@aptos-labs/ts-sdk";

export function shortenAddress(addr: AccountAddress | string, chars = 6) {
  const str = typeof addr === "string" ? addr : addr.toString();
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}
