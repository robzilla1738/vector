import { createHash } from "node:crypto";
import { AuxError, CloudResourceQuoteSchema, type CloudResourceQuote } from "@aux/contracts";
export { CloudResourceQuoteSchema, type CloudResourceQuote } from "@aux/contracts";

export function cloudQuoteIdentity(quote: CloudResourceQuote) {
  const json = JSON.stringify(CloudResourceQuoteSchema.parse(quote));
  return { json, digest: createHash("sha256").update(json).digest("hex") };
}
export interface CloudMeteredUsage {
  activeCpuMs: number;
  durationMs: number;
  memoryMB: number;
  outboundBytes: number;
}
/** No exposed ports: Internet downloads are free; only outbound bytes are billed. */
export function cloudMeteredCost(quote: CloudResourceQuote, usage: CloudMeteredUsage): number {
  if (Object.values(usage).some((value) => !Number.isFinite(value) || value < 0))
    throw new AuxError("permission_denied", "The provider's final resource meters are invalid.");
  const { rates } = CloudResourceQuoteSchema.parse(quote);
  const amount =
    rates.creationUsd +
    (usage.activeCpuMs / 3_600_000) * rates.cpuUsdPerCoreHour +
    (((Math.ceil(usage.durationMs / 60_000) / 60) * usage.memoryMB) / 1024) * rates.memoryUsdPerGBHour +
    (usage.outboundBytes / 1_000_000_000) * rates.outboundUsdPerGB;
  if (!Number.isFinite(amount))
    throw new AuxError("permission_denied", "Cloud usage cannot be priced safely.");
  return amount;
}
