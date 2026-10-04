import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
} from "../ui/native-attribute-props";
import { useEffect, useReducer, useState } from "react";
import type { Run, Suspension } from "@aux/contracts";
import { call, useStore } from "../store";
import {
  EMPTY_HANDOFF_CUTOUT,
  reduceHandoffCutout,
  type HandoffObservationSnapshot,
  type HandoffRect,
} from "./handoff-cutout";
import "./AgentOverlay.css";

const COPY = "Finish this step in the page, then return to Aux.";

function handoffRunId(runs: readonly Run[], pageId: string): string | null {
  let best: Run | undefined;
  for (const run of runs) {
    if (run.status !== "needs_input" || !run.pageIds.includes(pageId)) continue;
    if (
      !best ||
      run.createdAt > best.createdAt ||
      (run.createdAt === best.createdAt && run.runId > best.runId)
    )
      best = run;
  }
  return best?.runId ?? null;
}

/** A pending handoff for this run. Tool `turnId` is not the run id and is not compared. */
function pendingHandoff(
  runId: string,
  statusMessage: string | undefined,
  detail: { run: Pick<Run, "runId" | "status">; suspension?: Suspension | null },
): string | null {
  const suspension = detail.suspension;
  if (detail.run.runId !== runId || detail.run.status !== "needs_input") return null;
  if (
    !suspension ||
    suspension.state !== "pending" ||
    suspension.kind !== "handoff" ||
    suspension.runId !== runId
  )
    return null;
  if (statusMessage && suspension.request.instruction !== statusMessage) return null;
  return suspension.suspensionId;
}

function cutoutClip(rect: HandoffRect): string {
  const right = rect.x + rect.w;
  const bottom = rect.y + rect.h;
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, ${rect.x}px ${rect.y}px, ${right}px ${rect.y}px, ${right}px ${bottom}px, ${rect.x}px ${bottom}px)`;
}

/**
 * Hole for one handoff. Geometry comes only from observation snapshots.
 * There is no page-scroll event, so this does not listen for wheel input.
 */
export function HandoffCutoutFrame({
  open,
  suspensionId,
  snapshot,
  pageId,
  documentEpoch,
  url,
}: {
  open: boolean;
  suspensionId: string | null;
  snapshot: HandoffObservationSnapshot | null;
  pageId: string | null;
  documentEpoch: number | null;
  url: string | null;
}) {
  const [state, dispatch] = useReducer(reduceHandoffCutout, EMPTY_HANDOFF_CUTOUT);
  useEffect(() => {
    if (!open || !suspensionId) {
      dispatch({ type: "close" });
      return;
    }
    if (snapshot?.suspensionId === suspensionId) dispatch({ type: "snapshot", snapshot });
    if (pageId !== null && documentEpoch !== null && url !== null)
      dispatch({ type: "navigate", pageId, documentEpoch, url });
  }, [open, suspensionId, snapshot, pageId, documentEpoch, url]);
  const cutout = open && state.suspensionId === suspensionId && !state.closed ? state.cutout : null;
  if (!cutout) return null;
  return (
    <div
      className="agent-handoff"
      data-cutout="open"
      data-cutout-x={cutout.x}
      data-cutout-y={cutout.y}
      data-cutout-w={cutout.w}
      data-cutout-h={cutout.h}
    >
      <div className="agent-handoff-shield" style={{ clipPath: cutoutClip(cutout) }} {...auxNativeAriaHiddenProps} />
      <p className="agent-handoff-copy" role="status">
        {COPY}
      </p>
    </div>
  );
}

/** Stage overlay for a paused handoff on the visible page. */
export function AgentOverlay({
  pageId,
  snapshot = null,
}: {
  pageId: string;
  snapshot?: HandoffObservationSnapshot | null;
}) {
  const runId = useStore((state) => handoffRunId(state.runs, pageId));
  const statusMessage = useStore((state) =>
    runId ? state.runs.find((run) => run.runId === runId)?.statusMessage : undefined,
  );
  const trackedPageId = useStore((state) => {
    const run = runId ? state.runs.find((item) => item.runId === runId) : undefined;
    return run?.pageIds.includes(pageId) ? pageId : null;
  });
  const documentEpoch = useStore(
    (state) => state.pages.find((page) => page.pageId === trackedPageId)?.documentEpoch ?? null,
  );
  const url = useStore((state) => state.pages.find((page) => page.pageId === trackedPageId)?.url ?? null);
  const [handoffId, setHandoffId] = useState<string | null>(null);
  useEffect(() => {
    if (!runId) {
      setHandoffId(null);
      return;
    }
    let live = true;
    void call("runs.get", { runId })
      .then((detail) => {
        if (!live) return;
        setHandoffId(pendingHandoff(runId, statusMessage, detail));
      })
      .catch(() => {
        if (live) setHandoffId(null);
      });
    return () => {
      live = false;
    };
  }, [runId, statusMessage]);
  if (!handoffId) return null;
  return (
    <HandoffCutoutFrame
      open
      suspensionId={handoffId}
      snapshot={snapshot}
      pageId={trackedPageId}
      documentEpoch={documentEpoch}
      url={url}
    />
  );
}
