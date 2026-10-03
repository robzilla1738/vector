import { createElement, lazy, Suspense } from "react";
import type { FeatureMount, ComposerPluginProps } from "../registry";
import { call, useStore } from "../../store";
import { executeCommand } from "../../commands";
import { NightOverlays } from "./NightOverlays";
export { NightOverlays } from "./NightOverlays";
import { OvernightCard } from "./MorningReview";
const NightSettings = lazy(() => import("./NightSettings").then(module => ({ default: module.NightSettings })));
function NightSettingsSection() {
  return createElement(Suspense, { fallback: createElement("p", { role: "status" }, "Loading night shift settings…") }, createElement(NightSettings));
}
import { bootNightReview, queueTonight, reviewNightItem, useNightReview, nightReviewGeneration } from "./state";
function QueueButton({ disabled = false }: Partial<ComposerPluginProps>) {
  return createElement("button", { className: "btn sm ghost", "data-command-id": "queue-for-tonight", disabled, onClick: () => void executeCommand("queue-for-tonight") }, "Queue for tonight");
}
export const mount: FeatureMount = {
  feature: "overnightReview", boot: bootNightReview, sidebarFooterItems: [OvernightCard], startItems: [OvernightCard], overlays: [NightOverlays],
  composerActions: [QueueButton], settingsSections: [{ category: "Automations", component: NightSettingsSection }],
  commands: {
    "queue-for-tonight": (_context, invocation) => invocation.payload && "queue" in invocation.payload
      ? queueTonight(invocation.payload.queue) : useNightReview.setState({ queueOpen: true, inboxOpen: false, queueVisited: true }),
    "review-overnight": () => useNightReview.setState({ inboxOpen: true, queueOpen: false }),
    "review-overnight-item": async (_context, invocation) => {
      if (!invocation.payload || !("decision" in invocation.payload)) throw new Error("Choose an overnight item to review.");
      const generation = nightReviewGeneration();
      const { id, decision } = invocation.payload;
      const item = await reviewNightItem(id, decision);
      if (generation !== nightReviewGeneration()) return;
      if (decision === "apply" && item?.runId) {
        useNightReview.setState({ inboxOpen: false }); useStore.getState().openConversation(item.runId);
        const detail = await call("runs.get", { runId: item.runId });
        if (generation !== nightReviewGeneration()) return;
        if (detail.run.config?.nightShiftItemId || detail.run.status !== "needs_input" || !detail.suspension?.request.approvalId) return;
        const pending = await call("safety.approvals.pending", { threadId: detail.suspension.threadId });
        const approval = pending.find(entry => entry.approvalId === detail.suspension!.request.approvalId && entry.action.turnId === item.runId);
        if (generation !== nightReviewGeneration()) return;
        if (!approval || useStore.getState().runs.find(run => run.runId === item.runId)?.config?.nightShiftItemId) return;
        if (!approval.action.category || !approval.action.confirmation) throw new Error("The pending action has no verified confirmation category. Refresh the review before continuing.");
        useStore.setState({ confirmation: { approvalId: approval.approvalId, turnId: approval.action.turnId,
          threadId: approval.action.threadId, category: approval.action.category, confirmation: approval.action.confirmation,
          instruction: detail.suspension.request.instruction, action: approval.action.action, origin: approval.action.origin ?? "" } });
      }
    },
    "configure-night-shift": async (_context, invocation) => {
      if (!invocation.payload || !("nightShift" in invocation.payload)) throw new Error("Review night shift settings before saving.");
      const nightShift = invocation.payload.nightShift;
      await call("settings.set", { nightShift });
      useStore.setState(state => ({ settings: { ...state.settings, nightShift } }));
    },
  },
};
