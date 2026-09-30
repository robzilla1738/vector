/** Viewport rect from an observation element. Suspensions do not carry one. */
export type HandoffRect = { x: number; y: number; w: number; h: number };

/** `content.scroll` from a page observation. This is document scroll, not a wheel delta. */
export type HandoffScroll = { x: number; y: number; maxY: number };

export type HandoffObservationSnapshot = {
  suspensionId: string;
  pageId: string;
  documentEpoch: number;
  url: string;
  scroll: HandoffScroll;
  /** Element rect measured at `scroll`. Null when this snapshot does not name one target. */
  rect: HandoffRect | null;
  /** Current field value. A change does not close the hole. */
  value?: string;
  /** The person submitted the page step. */
  submitted?: boolean;
};

export type HandoffCutoutState = {
  suspensionId: string | null;
  pageId: string | null;
  documentEpoch: number | null;
  url: string | null;
  scroll: HandoffScroll | null;
  rect: HandoffRect | null;
  cutout: HandoffRect | null;
  closed: boolean;
};

export const EMPTY_HANDOFF_CUTOUT: HandoffCutoutState = {
  suspensionId: null,
  pageId: null,
  documentEpoch: null,
  url: null,
  scroll: null,
  rect: null,
  cutout: null,
  closed: false,
};

export type HandoffCutoutEvent =
  | { type: "snapshot"; snapshot: HandoffObservationSnapshot }
  | { type: "navigate"; pageId: string; documentEpoch: number; url: string }
  | { type: "close" };

type ObservedElement = {
  ref?: string;
  rect?: { x?: number; y?: number; w?: number; h?: number };
  value?: string;
  focused?: boolean;
};

/** The observation fields the cutout reads. Full observations carry these; compact shell events do not. */
export type HandoffObservationSource = {
  pageId: string;
  documentEpoch: number;
  content: {
    url: string;
    scroll: { x?: number; y?: number; maxY?: number };
    elements?: readonly ObservedElement[];
  };
};

function finiteRect(
  value: { x?: number; y?: number; w?: number; h?: number } | undefined,
): HandoffRect | null {
  if (!value) return null;
  const { x, y, w, h } = value;
  if (typeof x !== "number" || typeof y !== "number" || typeof w !== "number" || typeof h !== "number")
    return null;
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  return { x, y, w, h };
}

function finiteScroll(value: { x?: number; y?: number; maxY?: number } | undefined): HandoffScroll | null {
  if (!value) return null;
  const { x, y, maxY } = value;
  if (typeof x !== "number" || typeof y !== "number" || typeof maxY !== "number") return null;
  if (![x, y, maxY].every(Number.isFinite)) return null;
  return { x, y, maxY };
}

function sameRect(left: HandoffRect | null, right: HandoffRect | null): boolean {
  return (
    !!left && !!right && left.x === right.x && left.y === right.y && left.w === right.w && left.h === right.h
  );
}

/** Viewport position of the anchor rect after document scroll moves from `from` to `to`. */
function shiftRect(rect: HandoffRect, from: HandoffScroll, to: HandoffScroll): HandoffRect | null {
  const x = rect.x - (to.x - from.x);
  const y = rect.y - (to.y - from.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y, w: rect.w, h: rect.h };
}

function closedState(suspensionId: string | null): HandoffCutoutState {
  return { ...EMPTY_HANDOFF_CUTOUT, suspensionId, closed: true };
}

function openFrom(snapshot: HandoffObservationSnapshot): HandoffCutoutState {
  return {
    suspensionId: snapshot.suspensionId,
    pageId: snapshot.pageId,
    documentEpoch: snapshot.documentEpoch,
    url: snapshot.url,
    scroll: snapshot.scroll,
    rect: snapshot.rect,
    cutout: snapshot.rect ? { ...snapshot.rect } : null,
    closed: false,
  };
}

function navigated(state: HandoffCutoutState, pageId: string, documentEpoch: number, url: string): boolean {
  if (!state.rect || !state.pageId || state.documentEpoch === null || state.url === null) return false;
  return state.pageId !== pageId || state.documentEpoch !== documentEpoch || state.url !== url;
}

/**
 * Place the handoff hole from observation snapshots.
 * Scroll is the change in `content.scroll` since the anchor measurement.
 * Typing keeps the hole. Submit or navigation closes it.
 */
export function reduceHandoffCutout(
  state: HandoffCutoutState,
  event: HandoffCutoutEvent,
): HandoffCutoutState {
  if (event.type === "close")
    return state.suspensionId === null && state.cutout === null ? state : EMPTY_HANDOFF_CUTOUT;
  if (event.type === "navigate") {
    if (state.closed || !navigated(state, event.pageId, event.documentEpoch, event.url)) return state;
    return closedState(state.suspensionId);
  }
  const snapshot = event.snapshot;
  if (state.closed && state.suspensionId === snapshot.suspensionId) return state;
  if (snapshot.submitted) return closedState(snapshot.suspensionId);
  if (state.suspensionId !== snapshot.suspensionId || !state.rect || !state.scroll) {
    if (!snapshot.rect) {
      if (state.suspensionId === snapshot.suspensionId && !state.rect && !state.closed) return state;
      return { ...EMPTY_HANDOFF_CUTOUT, suspensionId: snapshot.suspensionId };
    }
    return openFrom(snapshot);
  }
  if (navigated(state, snapshot.pageId, snapshot.documentEpoch, snapshot.url))
    return closedState(snapshot.suspensionId);
  // `snapshot.value` is not a close. A later rect is not re-applied; the anchor was measured at `state.scroll`.
  const cutout = shiftRect(state.rect, state.scroll, snapshot.scroll);
  if (!cutout || sameRect(state.cutout, cutout)) return state;
  return { ...state, cutout };
}

function measured(elements: readonly ObservedElement[]): { element: ObservedElement; rect: HandoffRect }[] {
  return elements.flatMap((element) => {
    const rect = finiteRect(element.rect);
    return rect ? [{ element, rect }] : [];
  });
}

/**
 * Read one target rect and the document scroll that measured it.
 * A focused element wins. Several unfocused rects do not invent a target.
 */
export function handoffSnapshotFromObservation(
  suspensionId: string,
  observation: HandoffObservationSource,
  options?: { targetRef?: string; submitted?: boolean },
): HandoffObservationSnapshot | null {
  const scroll = finiteScroll(observation.content.scroll);
  if (
    !scroll ||
    !observation.pageId ||
    !observation.content.url ||
    !Number.isFinite(observation.documentEpoch)
  )
    return null;
  const elements = measured(observation.content.elements ?? []);
  const named = options?.targetRef
    ? elements.find((item) => item.element.ref === options.targetRef)
    : undefined;
  const focused = elements.filter((item) => item.element.focused === true);
  const chosen = options?.targetRef
    ? named
    : focused.length === 1
      ? focused[0]
      : elements.length === 1
        ? elements[0]
        : undefined;
  return {
    suspensionId,
    pageId: observation.pageId,
    documentEpoch: observation.documentEpoch,
    url: observation.content.url,
    scroll,
    rect: chosen?.rect ?? null,
    ...(chosen?.element.value !== undefined ? { value: chosen.element.value } : {}),
    ...(options?.submitted ? { submitted: true } : {}),
  };
}
