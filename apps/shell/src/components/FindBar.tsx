import "./FindBar.css";
import { conversationFinder, readerFinder } from "../text-surface-find";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useStore, call } from "../store";
import { I } from "./icons";
import { bridge } from "../bridge";
import { useShortcutLabels, withShortcut } from "../use-shortcut-label";

/** ⌘F — in-flow strip above the page so highlighting stays live. */
export function FindBar({ scope, inputRef, returnFocusRef }: {scope?: "reader"; inputRef?: RefObject<HTMLInputElement | null>; returnFocusRef?: RefObject<HTMLDivElement | null>} = {}) {
  const key = useShortcutLabels();
  const inReader = scope === "reader";
  const mode = useStore(s => s.mode);
  const conversationId = useStore(s => s.conversationId);
  const inConversation = !inReader && mode === "conversation";
  const inShell = inReader || inConversation;
  const finder = inReader ? readerFinder : conversationFinder;
  const activePageId = useStore((s) => s.activePageId);
  const epoch = useStore(s => s.pages.find(page => page.pageId === s.activePageId)?.documentEpoch);
  const loading = useStore(s => s.pages.find(page => page.pageId === s.activePageId)?.loading);
  const setOverlay = useStore((s) => s.setOverlay);
  const text = useStore((s) => s.findText);
  const res = useStore((s) => s.findMatches);
  const find = useStore((s) => s.find);
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const debounce = useRef<number | null>(null);
  const composing = useRef(false);
  const request = useRef(0);
  const [error, setError] = useState("");
  const search = useCallback(async (query: string, next = false, forward = true) => {
    const version = ++request.current;
    setError("");
    try { await find(query, next, forward); }
    catch (reason) { if (version === request.current) setError(reason instanceof Error ? reason.message : String(reason)); }
  }, [find]);

  useEffect(() => {
    let active = true;
    void bridge.focusShell().then(() => { if (active) { ref.current?.focus(); ref.current?.select(); } }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    setError("");
    useStore.setState({ findMatches: null });
    // Allow the shell to lay out and expose the newly selected native page first.
    let frame = 0, nextFrame = 0;
    const query = useStore.getState().findText;
    if ((inShell || (activePageId && !loading)) && query) frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        if (useStore.getState().findText === query) void search(query);
      });
    });
    return () => {
      ++request.current;
      cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame);
      if (debounce.current) window.clearTimeout(debounce.current);
      finder.clear();
      if (!inShell && activePageId) void call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
    };
  }, [activePageId, epoch, loading, search, inShell, conversationId, finder]);

  useEffect(() => {
    if (!inShell) return;
    const root = document.querySelector(inReader ? ".reader-scroll" : '[data-find-surface="conversation"]');
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const state = useStore.getState();
        if (!state.findText || (inReader ? state.overlay !== "reader" || !state.readerFindOpen : state.mode !== "conversation" || state.overlay !== "find")) return;
        try { useStore.setState({findMatches:finder.find(state.findText,false,true,false)}); }
        catch (error) { setError(error instanceof Error ? error.message : String(error)); }
      }, 100);
    });
    observer.observe(root,{subtree:true,childList:true,characterData:true});
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [inShell, inReader, conversationId, finder, activePageId]);

  const close = async () => {
    ++request.current;
    if (debounce.current) window.clearTimeout(debounce.current);
    finder.clear();
    if (inReader) useStore.setState({readerFindOpen:false}); else setOverlay(null);
    if (inShell) returnFocusRef?.current?.focus({preventScroll:true});
    if (!inShell && activePageId) await call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
  };
  const onChange = (v: string) => {
    ++request.current; setError("");
    useStore.setState({ findText: v, findMatches: null });
    if (debounce.current) window.clearTimeout(debounce.current);
    if (!composing.current) debounce.current = window.setTimeout(() => void search(v), 80);
  };

  return (
    <div className="findbar slide-down" role="search" onKeyDown={event => { if (event.nativeEvent.isComposing || event.keyCode === 229) return; if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); void close(); } }}>
      <span className="fb-ico">{I.find}</span>
      <input
        ref={ref}
        value={text}
        placeholder={inReader ? "Find in article" : inConversation ? "Find in loaded messages" : "Find in page"}
        title={inConversation ? "Searches loaded messages. Load earlier messages to include older replies." : undefined}
        aria-label={inReader ? "Find in article" : inConversation ? "Find in conversation" : "Find in page"}
        disabled={!inShell && !activePageId}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(e.target.value)}
        onCompositionStart={() => { composing.current = true; if (debounce.current) window.clearTimeout(debounce.current); }}
        onCompositionEnd={event => { composing.current = false; onChange(event.currentTarget.value); }}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === "Enter") {
            e.preventDefault();
            if (debounce.current) window.clearTimeout(debounce.current);
            void search(text, !!res, !e.shiftKey);
          }
          if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); void close(); }
        }}
      />
      {text && <button className="icon-btn sm" aria-label="Clear search" title="Clear search" onClick={() => { onChange(""); ref.current?.focus(); }}>{I.close}</button>}
      <span className={`fb-n nums ${error || res?.matches === 0 ? "none" : ""}`} aria-live="polite" title={error || undefined}>
        {error ? "Search unavailable" : res ? (res.matches === 0 ? "No results" : res.activeMatch ? `${res.activeMatch} of ${res.matches}` : `${res.matches} matches`) : text && (inShell || activePageId) && !composing.current ? "Searching…" : ""}
      </span>
      {error && <button className="btn sm ghost" title={error} aria-label={`Retry search: ${error}`} disabled={!text || (!inShell && (!activePageId || !!loading))} onClick={() => {
        if (debounce.current) window.clearTimeout(debounce.current);
        void search(text);
        ref.current?.focus();
      }}>Retry</button>}
      <button className="icon-btn sm" title={withShortcut("Previous", key("find-previous"))} aria-label="Previous match" disabled={!res || !res.matches} onClick={() => void search(text, true, false)}>{I.up}</button>
      <button className="icon-btn sm" title={withShortcut("Next", key("find-next"))} aria-label="Next match" disabled={!res || !res.matches} onClick={() => void search(text, true, true)}>{I.down}</button>
      <button className="btn sm ghost" onClick={() => void close()}>Done</button>
    </div>
  );
}
