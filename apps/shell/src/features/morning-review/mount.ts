import { confirmationFromSuspension } from "../permissions/confirmation";
import { createElement, lazy, Suspense } from "react";
import type { FeatureMount, ComposerPluginProps } from "../registry";
import { call, useStore } from "../../store";
import { executeCommand } from "../../commands";
import { SettingsField } from "../../settings/primitives";
import { SettingsDialogControl } from "../../settings/SettingsDialogControl";
import { NightOverlays } from "./NightOverlays";
export { NightOverlays } from "./NightOverlays";
const NightSettings = lazy(() =>
  import("./NightSettings").then((module) => ({ default: module.NightSettings })),
);
function NightSettingsSection({ active = false }: { active?: boolean }) {
  return createElement(SettingsField, {
    compact: true,
    label: "Night shift",
    hint: "Schedule queued work and set overnight time, power and spending limits.",
    children: createElement(SettingsDialogControl, {
      active,
      label: "Night shift",
      action: "Configure…",
      children: createElement(
        Suspense,
        { fallback: createElement("p", { role: "status" }, "Loading night shift settings…") },
        createElement(NightSettings),
      ),
    }),
  });
}

import {
  bootNightReview,
  queueTonight,
  reviewNightItem,
  useNightReview,
  nightReviewGeneration,
} from "./state";
function QueueButton({ disabled = false }: Partial<ComposerPluginProps>) {
  return createElement(
    "button",
    {
      className: "btn sm ghost",
      "data-command-id": "queue-for-tonight",
      disabled,
      onClick: () => void executeCommand("queue-for-tonight"),
    },
    "Queue for tonight",
  );
}
export const mount: FeatureMount = {
  feature: "overnightReview",
  boot: bootNightReview,
  overlays: [NightOverlays],
  composerActions: [QueueButton],
  settingsSections: [{ category: "Routines", component: NightSettingsSection }],
  commands: {
    "queue-for-tonight": (_context, invocation) =>
      invocation.payload && "queue" in invocation.payload
        ? queueTonight(invocation.payload.queue)
        : useNightReview.setState({ queueOpen: true, inboxOpen: false, queueVisited: true }),
    "review-overnight": () => useNightReview.setState({ inboxOpen: true, queueOpen: false }),
    "review-overnight-item": async (_context, invocation) => {
      if (!invocation.payload || !("decision" in invocation.payload))
        throw new Error("Choose an overnight item to review.");
      const generation = nightReviewGeneration();
      const { id, decision } = invocation.payload;
      const item = await reviewNightItem(id, decision);
      if (generation !== nightReviewGeneration()) return;
      if (decision === "apply" && item?.runId) {
        useNightReview.setState({ inboxOpen: false });
        useStore.getState().openConversation(item.runId);
        const detail = await call("runs.get", { runId: item.runId });
        if (generation !== nightReviewGeneration()) return;
        if (
          detail.run.status !== "needs_input" ||
          !detail.suspension ||
          detail.suspension.runId !== item.runId
        )
          return;
        const confirmation = confirmationFromSuspension(detail.suspension);
        if (confirmation) useStore.setState({ confirmation });
      }
    },
    "configure-night-shift": async (_context, invocation) => {
      if (!invocation.payload || !("nightShift" in invocation.payload))
        throw new Error("Review night shift settings before saving.");
      const nightShift = invocation.payload.nightShift;
      const acknowledgement = await call("settings.set", { nightShift });
      useStore.setState((state) => ({ settings: { ...state.settings, nightShift } }));
      return acknowledgement;
    },
  },
};
