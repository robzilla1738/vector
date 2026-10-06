import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { AuxError } from "@aux/contracts";

// Node maps IPv4 addresses into IPv6 for mixed BlockList checks. Keep the
// families separate so the mapped-IPv6 prohibition does not deny all IPv4.
const DENIED_V4 = new BlockList();
const DENIED_V6 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  DENIED_V4.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["::ffff:0:0", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["2001::", 32],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["ff00::", 8],
] as const)
  DENIED_V6.addSubnet(address, prefix, "ipv6");

export function isPublicNetworkAddress(address: string): boolean {
  const family = isIP(address);
  return family === 4 ? !DENIED_V4.check(address, "ipv4") : family === 6 && !DENIED_V6.check(address, "ipv6");
}

/** Vet every answer, then bind the actual socket to one vetted address. */
export async function resolveNetworkAddress(hostname: string, allowPrivateNetwork = false) {
  const addresses = await lookup(hostname.replace(/^\[|\]$/g, ""), { all: true, verbatim: true });
  if (
    !addresses.length ||
    (!allowPrivateNetwork && addresses.some((item) => !isPublicNetworkAddress(item.address)))
  )
    throw new AuxError("permission_denied", "Web tools cannot contact a private or local network address.");
  return addresses[0]!;
}
