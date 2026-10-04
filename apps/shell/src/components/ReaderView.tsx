import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import "./ReaderView.css";
import { backgroundLink, openBrowserLink } from "../browser-links";
import { moveListFocus } from "../keyboard-list";
import { readerOutline, readerSectionId } from "../reader-outline";
import { readReaderArticle } from "../reader-article";
import { FindBar } from "./FindBar";
import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { bridge, type ReaderArticle, type ReaderNode } from '../bridge';
import { useStore, call, errToast } from '../store';
import { openPeekLink } from '../peek-link';
import { useFeature } from '../use-feature';

const tags = new Set(['div','span','p','h1','h2','h3','h4','h5','h6','blockquote','pre','code','ul','ol','li','strong','em','b','i','a','br','hr','table','thead','tbody','tr','th','td','figcaption']);
function renderNode(node: ReaderNode, key = 'article'): ReactNode {
  if (typeof node === 'string') return node;
  const tag = tags.has(node.tag) ? node.tag : 'div';
  const href = tag === 'a' && /^https?:\/\//i.test(node.href ?? '') ? node.href : undefined;
  return createElement(tag, {key, ...(href ? {href} : {}), ...(node.sourceId ? {'data-reader-source-id': node.sourceId} : {}), ...(/^h[1-6]$/.test(tag) ? {id: readerSectionId(key), tabIndex: -1} : {})}, ...node.children.map((child,index) => renderNode(child, `${key}-${index}`)));
}

const positions = new Map<string, number>();
function readingPreferences() {
  try {
    if (!bridge.privateMode) return {
      size: Math.max(16, Math.min(26, Number(localStorage.getItem('aux.reader.fontSize')) || 20)),
      font: localStorage.getItem('aux.reader.font') === 'sans' ? 'sans' : 'serif',
    };
  } catch { /* Reading remains available without local storage. */ }
  return {size:20,font:'serif'};
}

export function ReaderView() {
  const canPeek = useFeature('peek');
  const findOpen = useStore(state => state.readerFindOpen);
  const page = useStore(state => state.pages.find(page => page.pageId === state.activePageId));
  const pageId = page?.pageId;
  const key = `${pageId}:${page?.documentEpoch}:${page?.url}`;
  const setOverlay = useStore(state => state.setOverlay);
  const [loaded, setLoaded] = useState<{key:string;article:ReaderArticle;offlineSavedAt?:number} | null>(null);
  const article = loaded?.key === key ? loaded.article : null;
  const offlineSavedAt = loaded?.key === key ? loaded.offlineSavedAt : undefined;
  const [error, setError] = useState('');
  const [contentsOpen, setContentsOpen] = useState(false);
  const contentsMenu = useRef<HTMLElement>(null);
  const firstSection = useRef<HTMLButtonElement>(null);
  const contentsButton = useRef<HTMLButtonElement>(null);
  const sections = useMemo(() => article ? readerOutline(article.content) : [], [article]);
  const [refresh, setRefresh] = useState(0);
  const [preferences, setPreferences] = useState(readingPreferences);
  const [storageNotice, setStorageNotice] = useState('');
  const close = useRef<HTMLButtonElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const back = () => setOverlay(null);
  useEffect(() => {
    let current = true;
    void bridge.focusShell().then(() => { if(current)close.current?.focus(); }).catch(() => {});
    return () => {current=false;};
  }, []);
  useEffect(() => {
    let current = true;
    setLoaded(null); setError(''); setContentsOpen(false);
    if (!pageId) { setError('Open an article to use Reader view.'); return; }
    if (page.loading) return;
    const markRead = (url: string | undefined) => {
      const item = url && useStore.getState().bookmarks.find(bookmark => bookmark.url === url && bookmark.readingList);
      if (item && !item.readAt) void call("bookmarks.markRead", { url, read: true }).catch(() => {});
    };
    void readReaderArticle(pageId).then(article => {if(current){setLoaded({key,article});markRead(page?.url);}}).catch(async error => {
      // Reading-list offline copies are the fallback when live extraction fails.
      const url = page?.url;
      if (!current || !url || bridge.privateMode) { if (current) setError(errorMessage(error)); return; }
      try {
        const saved = await call("bookmarks.offline.get", {url});
        if (!current) return;
        if (saved.article) { setLoaded({key, article: JSON.parse(saved.article) as ReaderArticle, offlineSavedAt: saved.savedAt ?? undefined}); markRead(url); return; }
      } catch { /* fall through to the live error */ }
      if (current) setError(errorMessage(error));
    });
    return () => {current=false;};
  }, [pageId, key, page?.loading, page?.url, refresh]);
  useLayoutEffect(() => {
    const node = scroll.current;
    if (!node || !article) return;
    node.scrollTop = positions.get(key) ?? 0;
    return () => {
      positions.delete(key); positions.set(key,node.scrollTop);
      if (positions.size > 50) positions.delete(positions.keys().next().value!);
    };
  }, [key,article]);
  useEffect(() => {
    if (!contentsOpen) return;
    firstSection.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!contentsMenu.current?.contains(event.target as Node) && !contentsButton.current?.contains(event.target as Node)) setContentsOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [contentsOpen]);
  function jump(target: HTMLElement) {
    setContentsOpen(false);
    target.scrollIntoView({block: "start"});
    target.tabIndex = -1; target.focus({preventScroll: true});
  }
  function preference(next: typeof preferences) {
    setPreferences(next); setStorageNotice('');
    if (bridge.privateMode) return;
    try {
      localStorage.setItem('aux.reader.fontSize', String(next.size));
      localStorage.setItem('aux.reader.font', next.font);
    } catch { setStorageNotice('Reading style is kept for this view; it could not be saved.'); }
  }
  return <section className={`reader-view${findOpen ? " reader-finding" : ""}`} aria-label="Reader view" onKeyDown={event => {
    if(event.nativeEvent.isComposing || event.keyCode===229)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(contentsOpen){setContentsOpen(false);contentsButton.current?.focus();}else back();}
  }}>
    <header className="reader-toolbar">
      <button {...smallButtonProps} ref={close} onClick={back}>Back to page</button>
      {sections.length > 1 && <button ref={contentsButton} {...smallGhostButtonProps} aria-expanded={contentsOpen} aria-controls="reader-contents" onClick={() => setContentsOpen(value => !value)}>Contents</button>}
      <span className="sp" />
      <select aria-label="Reading font" value={preferences.font} onChange={event=>preference({...preferences,font:event.target.value})}><option value="serif">Serif</option><option value="sans">Sans serif</option></select>
      <button {...smallButtonProps} aria-label="Smaller reading text" disabled={preferences.size<=16} onClick={() => preference({...preferences,size:preferences.size-2})}>A−</button>
      <button {...smallButtonProps} aria-label="Larger reading text" disabled={preferences.size>=26} onClick={() => preference({...preferences,size:preferences.size+2})}>A+</button>
      {storageNotice&&<output className="reader-notice" data-block>{storageNotice}</output>}
    {contentsOpen && <nav ref={contentsMenu} onKeyDown={event => moveListFocus(event, "button")} id="reader-contents" className="reader-contents" aria-label="Article contents">
      {sections.map((section, index) => <button key={section.id} ref={index === 0 ? firstSection : undefined} className={section.level > 2 ? "reader-subsection" : ""} onClick={() => { const target = scroll.current?.querySelector<HTMLElement>(`#${section.id}`); if (target) jump(target); }}>{section.title}</button>)}
    </nav>}
    </header>
    {findOpen && <FindBar scope="reader" returnFocusRef={scroll} />}
    <div ref={scroll} tabIndex={-1} className="reader-scroll" role="region" aria-label="Reader article" style={{fontSize:preferences.size}} onAuxClick={event => {
      if (event.button !== 1) return;
      const link = (event.target as HTMLElement).closest('a');
      if (link) { event.preventDefault(); void openBrowserLink(link.href, true).catch(errToast); }
    }} onClick={event => {
      const link = (event.target as HTMLElement).closest('a');
      if (!link) return;
      event.preventDefault();
      if (!/^https?:\/\//i.test(link.href)) return;
      if (canPeek && event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        void openPeekLink(link.href).catch(errToast);
        return;
      }
      if (article && !backgroundLink(event)) {
        const destination = new URL(link.href), source = new URL(article.url);
        if (destination.origin === source.origin && destination.pathname === source.pathname && destination.search === source.search && destination.hash) {
          let anchor = destination.hash.slice(1); try { anchor = decodeURIComponent(anchor); } catch {}
          const target = [...(scroll.current?.querySelectorAll<HTMLElement>('[data-reader-source-id]') ?? [])].find(node => node.dataset.readerSourceId === anchor);
          if (target) { jump(target); return; }
        }
      }
      void openBrowserLink(link.href, backgroundLink(event)).catch(errToast);
    }}>
      {error ? <div className="reader-empty" role="status"><h2>Reader view isn’t available</h2><p>{error}</p><button {...smallButtonProps} onClick={()=>setRefresh(value=>value+1)}>Try again</button></div> : !article ? <output className="reader-empty" data-block>Preparing article…</output> : <article className="reader-article" data-find-surface="reader">
        <div className="reader-meta">{offlineSavedAt ? `Offline copy · saved ${new Date(offlineSavedAt).toLocaleString()} · ` : ""}{article.site} · {article.minutes} min read</div>
        <h1>{article.title}</h1>
        {article.byline && <p className="reader-byline">{article.byline}</p>}
        <div className={`reader-content${preferences.font==='sans'?' reader-sans':''}`}>{renderNode(article.content)}</div>
      </article>}
    </div>
  </section>;
}
