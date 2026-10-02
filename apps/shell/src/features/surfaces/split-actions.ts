import type { SplitGroup } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore, tabCommand } from "../../store";
import { persistLayout } from "../../store/persistence";
import { isLocal } from "../../tab-window-transfer";
import { addPane, canSplitPage, flipLayout, focusPane, removePane, resizeSplit, separate, splitGroupForPage, swapPanes, type Layout } from "../../workspace";

export const localSplitPage = (pageId: string) => {
  const page = useStore.getState().pages.find(page => page.pageId === pageId);
  return page && isLocal(page) && !page.ownedByRuntime && page.controller === "none" && canSplitPage(page) ? page : undefined;
};

let splitOperations: Promise<unknown> = Promise.resolve();
const resizeOrigins = new Map<string, Layout>();
const nativePair = (group: SplitGroup) => JSON.stringify([group.panes, group.layout, group.ratios[0]]);

async function synchronizePairs(before: SplitGroup[], after: SplitGroup[], valid = () => true) {
  if (!valid()) throw new Error("The tabs changed. Try splitting them again.");
  for (const group of before) if (group.panes.length === 2 && !after.some(next => next.id === group.id && next.panes.length === 2)) {
    if (!valid()) throw new Error("The tabs changed. Try splitting them again.");
    await tabCommand({ kind: "unsplit", pageId: group.panes[0]! });
  }
  for (const group of after) {
    if (!valid()) throw new Error("The tabs changed. Try splitting them again.");
    const old = before.find(item => item.id === group.id);
    if (group.panes.length === 2 && (!old || nativePair(group) !== nativePair(old)))
      await tabCommand({ kind: "split", pageIds: [group.panes[0]!, group.panes[1]!], layout: group.layout as "row" | "column", ratio: group.ratios[0]! });
  }
}

/** Serialize native ACKs before persisting the shared organization. */
export function commitSplit(layout: Layout, previous = useStore.getState().layout, nativePrevious = previous, valid = () => true) {
  const operation = splitOperations.then(async () => {
    if (layout === previous && nativePrevious === previous) return;
    const before = previous.splitGroups ?? [], after = layout.splitGroups ?? [];
    const signature = JSON.stringify(before);
    const nativeBefore = nativePrevious.splitGroups ?? [];
    const changed = [...nativeBefore, ...before, ...after].filter(group => {
      const next = after.find(item => item.id === group.id);
      return [before, nativeBefore].some(groups => JSON.stringify(groups.find(item => item.id === group.id)) !== JSON.stringify(next));
    });
    const available = () => valid() && changed.every(group => group.panes.every(id => localSplitPage(id) && useStore.getState().layout.tabSpace[id] === previous.tabSpace[id]));
    if (JSON.stringify(useStore.getState().layout.splitGroups ?? []) !== signature || !available()) throw new Error("The tabs changed. Try splitting them again.");
    try {
      await synchronizePairs(nativeBefore, after, available);
      const current = useStore.getState().layout;
      if (JSON.stringify(current.splitGroups ?? []) !== signature || !available()) throw new Error("The tabs changed. Try splitting them again.");
      const next = { ...current, splitGroups: after };
      persistLayout(next);
      useStore.setState({ layout: next });
      for (const id of resizeOrigins.keys()) if (!after.some(group => group.id === id)) resizeOrigins.delete(id);
    } catch (reason) {
      if (!valid()) throw reason;
      // An ACK or organization race can leave the native mirror partly changed.
      // Reconcile only affected human tabs still owned by this window.
      const affected = new Set(changed.flatMap(group => group.panes));
      if (!affected.size) throw reason;
      try {
        if (![...affected].every(localSplitPage)) throw new Error("The split tabs moved or became unavailable.");
        let current = useStore.getState().layout;
        if (nativePrevious !== previous && JSON.stringify(current.splitGroups ?? []) === signature) {
          current = { ...current, splitGroups: nativeBefore };
          useStore.setState({ layout: current });
        }
        const restore = current.splitGroups ?? [];
        for (const group of restore) if (group.panes.some(id => affected.has(id)) && !group.panes.every(localSplitPage))
          throw new Error("The split tabs moved or became unavailable.");
        const representatives = new Set([...nativeBefore, ...after].filter(group => group.panes.length === 2 && group.panes.some(id => affected.has(id))).map(group => group.panes[0]!));
        const restoreSignature = JSON.stringify(restore);
        const available = () => valid() && JSON.stringify(useStore.getState().layout.splitGroups ?? []) === restoreSignature && [...affected].every(localSplitPage);
        for (const pageId of representatives) {
          if (!available()) throw new Error("The split tabs moved or became unavailable.");
          await tabCommand({ kind: "unsplit", pageId });
        }
        await synchronizePairs([], restore.filter(group => group.panes.some(id => affected.has(id))), available);
      } catch (restoreError) {
        throw new AggregateError([reason, restoreError], "The split could not be restored. Try separating its tabs.");
      }
      throw reason;
    }
  });
  splitOperations = operation.catch(() => {});
  return operation;
}

export async function splitAdd(pageId: string, edge: "left" | "right" | "top" | "bottom" = "right") {
  const state = useStore.getState(), primary = state.activePageId;
  if (!primary || !localSplitPage(primary) || !localSplitPage(pageId)) throw new Error("Choose two available tabs in this window.");
  const next = addPane(state.layout, primary, pageId, edge);
  if (next === state.layout) throw new Error("A split holds up to four tabs in the same Space.");
  await commitSplit(next, state.layout);
  await state.activate(pageId);
}
export function splitSwap(pageId: string) { const layout = useStore.getState().layout; return commitSplit(swapPanes(layout, pageId), layout); }
export function splitFlip(pageId: string) { const layout = useStore.getState().layout; return commitSplit(flipLayout(layout, pageId), layout); }
export function splitSeparate(pageId: string) { const layout = useStore.getState().layout; return commitSplit(separate(layout, pageId), layout); }
export async function splitClose(pageId: string) {
  const state = useStore.getState(), group = splitGroupForPage(state.layout, pageId);
  if (!group || !localSplitPage(pageId)) return;
  await commitSplit(removePane(state.layout, pageId), state.layout);
  await tabCommand({ kind: "close", pageId });
}
export async function splitFocus(pageId: string, direction: 1 | -1) {
  const state = useStore.getState(), group = splitGroupForPage(state.layout, pageId);
  if (!group) return;
  const next = group.panes[(group.panes.indexOf(pageId) + direction + group.panes.length) % group.panes.length]!;
  await commitSplit(focusPane(state.layout, next), state.layout); await state.activate(next);
}
export function splitResize(pageId: string, divider: number, ratio: number, persist = true) {
  const previous = useStore.getState().layout, group = splitGroupForPage(previous, pageId);
  if (!group || !group.panes.every(localSplitPage)) return;
  const next = resizeSplit(previous, pageId, divider, ratio);
  if (persist) {
    const origin = resizeOrigins.get(group.id) ?? previous;
    resizeOrigins.delete(group.id);
    return commitSplit(next, previous, origin);
  }
  if (!resizeOrigins.has(group.id)) resizeOrigins.set(group.id, previous);
  useStore.setState({ layout: next });
}

export function visibleSplitGroup(layout: Layout, pageId: string | null): SplitGroup | null {
  const group = splitGroupForPage(layout, pageId);
  return group && group.panes.every(localSplitPage) ? group : null;
}
export const togglePictureInPicture = async (pageId: string) => {
  if (!localSplitPage(pageId)) throw new Error("Choose an available browser page in this window.");
  const result = await bridge.pictureInPicture(pageId, "toggle");
  if (result.reason === "no-playing-video") useStore.getState().toast("No playing video on this page");
  else if (result.reason) throw new Error(result.reason);
};
