import { AuxError } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export interface ResourceFundingAccounting {
  usage(
    runIds: readonly string[],
    excludedResourceIds: readonly string[],
  ): { costUsd: number; opaque: boolean };
  receipt(resourceId: string):
    | {
        runId: string;
        state: "reserved" | "running" | "settled";
        costUsd?: number;
        costEstimated: boolean;
        reservationUsd?: number;
        financialBound: "verified" | "unavailable";
      }
    | undefined;
}

type Row = {
  resource_id: string;
  run_id: string;
  state: "reserved" | "running" | "settled" | "cancelled";
  cost_usd: number | null;
  reservation_usd: number | null;
  cost_estimated: number;
  stop_ack: number;
};
function validated(row: Row) {
  if (
    (row.reservation_usd !== null && (!Number.isFinite(row.reservation_usd) || row.reservation_usd < 0)) ||
    (row.cost_usd !== null && (!Number.isFinite(row.cost_usd) || row.cost_usd < 0)) ||
    ![0, 1].includes(row.cost_estimated) ||
    ![0, 1].includes(row.stop_ack) ||
    !["reserved", "running", "settled", "cancelled"].includes(row.state) ||
    (row.state === "settled" && row.stop_ack !== 1) ||
    (row.cost_estimated === 0 && (row.state !== "settled" || row.cost_usd === null))
  )
    throw new AuxError("permission_denied", "The original cloud resource receipt is invalid.");
  return row;
}

/** Historical resource receipts remain independent of deleted run/member records. */
export function resourceFundingAccounting(repo: Repo): ResourceFundingAccounting {
  const receipt = repo.db
    .prepare(`SELECT resource_id,run_id,state,cost_usd,reservation_usd,cost_estimated,stop_ack
    FROM execution_resources WHERE resource_id=?`);
  const byRun = repo.db
    .prepare(`SELECT resource_id,run_id,state,cost_usd,reservation_usd,cost_estimated,stop_ack
    FROM execution_resources WHERE run_id=?`);
  return {
    receipt(resourceId) {
      const saved = receipt.get(resourceId) as Row | undefined;
      if (!saved) return undefined;
      const row = validated(saved);
      if (row.state === "cancelled") return undefined;
      return {
        runId: row.run_id,
        state: row.state,
        ...(row.cost_usd !== null ? { costUsd: row.cost_usd } : {}),
        costEstimated: row.cost_estimated === 1,
        ...(row.reservation_usd !== null ? { reservationUsd: row.reservation_usd } : {}),
        // Provider timeouts and reviewed rates do not establish a total outbound-transfer bound.
        financialBound: "unavailable",
      };
    },
    usage(runIds, excludedResourceIds) {
      const excluded = new Set(excludedResourceIds);
      let costUsd = 0,
        opaque = false;
      for (const runId of new Set(runIds)) {
        for (const saved of byRun.all(runId) as Row[]) {
          const row = validated(saved);
          if (excluded.has(row.resource_id) || row.state === "cancelled") continue;
          if (row.state !== "settled" || row.cost_estimated === 1 || row.cost_usd === null) {
            opaque = true;
            continue;
          }
          costUsd += row.cost_usd;
          if (!Number.isFinite(costUsd))
            throw new AuxError("permission_denied", "Cloud resource usage cannot be accounted safely.");
        }
      }
      return { costUsd, opaque };
    },
  };
}
