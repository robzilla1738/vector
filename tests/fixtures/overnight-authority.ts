import { AuxError } from "@aux/contracts";
import type { Repo } from "../../apps/runtime/src/store/repo.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { BrowserEgress } from "../../apps/runtime/src/safety/browser-egress.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { NativePermissionController } from "../../apps/runtime/src/safety/native-permission.js";
import { installOvernightAuthority } from "../../apps/runtime/src/services/overnight-authority.js";
import {
  checkNightShiftDispatch,
  nightShiftEffectAuthority,
} from "../../apps/runtime/src/features/overnight-review/service.js";
import { fixtureTurnMentions } from "./turn-mentions.js";

/** A real controller for fixtures with no installed native leases. Any browser permission refuses. */
export function fixtureEmptyOvernightAuthority(repo: Repo): void {
  const native = new NullNativeBridge();
  const page = (id: string) => {
    const value = repo.getPage(id);
    if (!value) throw new AuxError("not_found", "No fixture native page");
    return value;
  };
  const approvals = new ApprovalStore(repo.db);
  const egress = new BrowserEgress({
    runAncestry: (runId) => [runId],
    profileId: "fixture",
    native,
    run: () => null,
    page,
    ownsPage: () => false,
    audit: () => {},
    approve: async () => false,
  });
  const gate = new SafetyDispatchGate({
    approvals,
    journal: new DecisionJournal(repo.db),
    managedRules: () => [],
    userRules: () => [],
    localCeiling: () => "ask",
    audit: () => {},
  });
  const controller = new NativePermissionController({
    profileId: "fixture",
    approvals,
    egress,
    gate,
    mentions: fixtureTurnMentions(page),
    page,
    run: (id) => repo.getRun(id),
    requiresTurn: () => true,
    sourceCheck: () => {
      throw new AuxError("backend_unavailable", "This fixture has no native source authority");
    },
    standingOnly: (id) => !!repo.getRun(id)?.config?.nightShiftItemId,
    assertDispatch: (id) => checkNightShiftDispatch(repo, id),
    overnightAuthority: (id) => nightShiftEffectAuthority(repo, id),
    retireReservation: (input) => native.permissionRetire(input),
  });
  installOvernightAuthority(repo, controller);
}
