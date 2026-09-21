import { useEffect } from "react";
import { create } from "zustand";
import { errToast, useStore } from "./store";
import type { PageTarget } from "@vector/contracts";

type Modifiers = { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean };

type Selection = {space: string; ids: string[]; anchor: string | null};
const useSelection = create<Selection>(() => ({space: "", ids: [], anchor: null}));

/** Selection is transient, scoped to a Space, and never includes agent-owned tabs. */
export function useTabSelection(tabs: PageTarget[], spaceId: string, activeId: string | null) {
  const state = useSelection();
  const setState = useSelection.setState;
  useEffect(() => { if (useSelection.getState().space !== spaceId) setState({space: spaceId, ids: [], anchor: null}); }, [spaceId]);
  const eligible = tabs.filter(tab => !tab.ownedByRuntime && tab.viewStatus !== "detached");
  const ids = state.space === spaceId ? state.ids.filter(id => eligible.some(tab => tab.pageId === id)) : [];
  const clear = () => { if (useSelection.getState() === state) setState({space: spaceId, ids: [], anchor: null}); };
  function select(id: string, event: Modifiers) {
    if (!event.metaKey && !event.ctrlKey && !event.shiftKey) { clear(); return false; }
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
  }
  function keyDown(event: React.KeyboardEvent) {
    if (event.nativeEvent.isComposing || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return false;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
      event.preventDefault(); event.stopPropagation();
      setState({space: spaceId, ids: eligible.map(tab => tab.pageId), anchor: activeId}); return true;
    }
    if (ids.length && event.key === "Escape") {
      event.preventDefault(); event.stopPropagation(); clear(); return true;
    }
    if (ids.length > 1 && ["Delete", "Backspace"].includes(event.key) && !event.metaKey && !event.ctrlKey) {
      event.preventDefault(); event.stopPropagation();
      const list = (event.target as HTMLElement).closest('[role="tablist"]');
      void useStore.getState().closeTabs(ids).then(done => {
        if (done) clear();
        requestAnimationFrame(() => {
          if (list?.isConnected && document.activeElement === document.body) list.querySelector<HTMLElement>('[role="tab"][tabindex="0"]')?.focus();
        });
      }).catch(errToast); return true;
    }
    return false;
  }
  return { ids, clear, select, keyDown, pagesFor: (page: PageTarget) => ids.includes(page.pageId) ? eligible.filter(tab => ids.includes(tab.pageId)) : [page] };
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
