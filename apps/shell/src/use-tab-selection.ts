import { useEffect, useMemo, useRef } from "react";
import { create } from "zustand";
import { errToast, useStore } from "./store";
import type { PageTarget } from "@aux/contracts";
import type { TabMembership } from "./use-tab-membership";

type Modifiers = { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean };

type Selection = {space: string; ids: string[]; anchor: string | null};
const useSelection = create<Selection>(() => ({space: "", ids: [], anchor: null}));

/** Selection is transient, scoped to a Space, and never includes agent-owned tabs.
 *  The returned callbacks keep a stable identity — they read the latest state
 *  through a ref — so memoized tab rows are not re-rendered by callback churn. */
export function useTabSelection(tabs: TabMembership[], spaceId: string, activeId: string | null, focusAfterClose: () => void) {
  const state = useSelection();
  const setState = useSelection.setState;
  useEffect(() => { if (useSelection.getState().space !== spaceId) setState({space: spaceId, ids: [], anchor: null}); }, [spaceId]);
  const eligible = tabs;
  const eligibleIds = new Set(eligible.map(tab => tab.pageId));
  const ids = state.space === spaceId ? state.ids.filter(id => eligibleIds.has(id)) : [];
  const latest = useRef({ state, ids, eligible, activeId, spaceId, focusAfterClose });
  latest.current = { state, ids, eligible, activeId, spaceId, focusAfterClose };
  const api = useMemo(() => ({
    clear() {
      const { state, spaceId } = latest.current;
      if (useSelection.getState() === state) setState({space: spaceId, ids: [], anchor: null});
    },
    select(id: string, event: Modifiers) {
      const { state, ids, eligible, activeId, spaceId } = latest.current;
      if (!event.metaKey && !event.ctrlKey && !event.shiftKey) { api.clear(); return false; }
      if (!eligible.some(tab => tab.pageId === id)) return false;
      const anchor = state.space === spaceId && state.anchor ? state.anchor : activeId ?? id;
      let next = ids.length ? ids : eligible.some(tab => tab.pageId === activeId) ? [activeId!] : [];
      if (event.shiftKey) {
        const from = eligible.findIndex(tab => tab.pageId === anchor), to = eligible.findIndex(tab => tab.pageId === id);
        const range = eligible.slice(Math.min(from < 0 ? to : from, to), Math.max(from, to) + 1).map(tab => tab.pageId);
        next = event.metaKey || event.ctrlKey ? [...new Set([...next, ...range])] : range;
      } else next = next.includes(id) ? next.filter(value => value !== id) : [...next, id];
      setState({space: spaceId, ids: next, anchor: event.shiftKey ? anchor : id});
      return true;
    },
    keyDown(event: React.KeyboardEvent) {
      const { ids, eligible, activeId, spaceId } = latest.current;
      if (event.nativeEvent.isComposing || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return false;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        event.preventDefault(); event.stopPropagation();
        setState({space: spaceId, ids: eligible.map(tab => tab.pageId), anchor: activeId}); return true;
      }
      if (ids.length && event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); api.clear(); return true;
      }
      if (ids.length > 1 && ["Delete", "Backspace"].includes(event.key) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault(); event.stopPropagation();
        void useStore.getState().closeTabs(ids).then(done => {
          if (done) api.clear();
          requestAnimationFrame(() => {
            if (document.activeElement === document.body) latest.current.focusAfterClose();
          });
        }).catch(errToast); return true;
      }
      return false;
    },
    pagesFor: (page: PageTarget) => {
      const { ids, eligible } = latest.current;
      if (!ids.includes(page.pageId)) return [page];
      const pages = new Map(useStore.getState().pages.map(tab => [tab.pageId, tab]));
      return eligible.filter(tab => ids.includes(tab.pageId)).flatMap(tab => {
        const current = pages.get(tab.pageId);
        return current ? [current] : [];
      });
    },
  }), [setState]);
  return { ids, ...api };
}

/** The window shortcut shares the same scoped selection as both tab layouts. */
export async function closeSelectedTabs() {
  const selection = useSelection.getState();
  const browser = useStore.getState();
  if (selection.space !== browser.layout.activeSpaceId) return false;
  const ids = selection.ids.filter(id => browser.pages.some(page => page.pageId === id && !page.ownedByRuntime && page.viewStatus !== "detached"));
  if (ids.length < 2) return false;
  if (await browser.closeTabs(ids) && useSelection.getState() === selection) useSelection.setState({space: selection.space, ids: [], anchor: null});
  return true;
}
