import { lazy, Suspense, useEffect } from "react";
import { useStore } from "../../store";
import { Dialog } from "../../ui/dialog";
import { MorningReviewInbox } from "./MorningReview";
import { useNightReview } from "./state";

const QueueTonight = lazy(() => import("./QueueTonight"));

export function NightOverlays() {
  const inbox = useNightReview((state) => state.inboxOpen);
  const queue = useNightReview((state) => state.queueOpen);
  const queueVisited = useNightReview((state) => state.queueVisited);
  const overlay = useStore((state) => state.overlay);
  useEffect(() => {
    if (overlay && (useNightReview.getState().inboxOpen || useNightReview.getState().queueOpen))
      useNightReview.setState({ inboxOpen: false, queueOpen: false });
  }, [overlay]);
  // Suppress the modal during navigation's commit, before effects clear local flags.
  // Keep the visited queue mounted so navigation preserves unfinished edits.
  return (
    <>
      {(queue || queueVisited) && (
        <Suspense fallback={queue && !overlay ? <output>Loading saved work…</output> : null}>
          <QueueTonight active={queue && !overlay} />
        </Suspense>
      )}
      {inbox && !queue && !overlay && (
        <Dialog
          label="Overnight review"
          className="aux-dialog-surface"
          onClose={() => useNightReview.setState({ inboxOpen: false })}
        >
          <MorningReviewInbox />
        </Dialog>
      )}
    </>
  );
}
