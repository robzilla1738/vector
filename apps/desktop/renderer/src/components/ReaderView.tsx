import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { bridge, type ReaderArticle, type ReaderNode } from '../bridge';
import { useStore, errToast } from '../store';

const tags = new Set(['div','span','p','h1','h2','h3','h4','h5','h6','blockquote','pre','code','ul','ol','li','strong','em','b','i','a','br','hr','table','thead','tbody','tr','th','td','figcaption']);
function renderNode(node: ReaderNode, key = 'article'): ReactNode {
  if (typeof node === 'string') return node;
  const tag = tags.has(node.tag) ? node.tag : 'div';
  const href = tag === 'a' && /^https?:\/\//i.test(node.href ?? '') ? node.href : undefined;
  return createElement(tag, {key, ...(href ? {href} : {})}, ...node.children.map((child,index) => renderNode(child, `${key}-${index}`)));
}

export function ReaderView() {
  const pageId = useStore(state => state.activePageId);
  const setOverlay = useStore(state => state.setOverlay);
  const [article, setArticle] = useState<ReaderArticle | null>(null);
  const [error, setError] = useState('');
  const [size, setSize] = useState(() => Math.max(16, Math.min(26, Number(localStorage.getItem('aux.reader.fontSize')) || 20)));
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); }, []);
  useEffect(() => {
    let current = true;
    setArticle(null); setError('');
    if (!pageId) { setError('Open an article to use Reader view.'); return; }
    void bridge.readArticle(pageId).then(value => {if(current)setArticle(value);}).catch(error => {if(current)setError(error instanceof Error ? error.message : String(error));});
    return () => {current=false;};
  }, [pageId]);
  function resize(delta: number) {
    const next = Math.max(16, Math.min(26, size + delta));
    setSize(next); localStorage.setItem('aux.reader.fontSize', String(next));
  }
  return <section className="reader-view" aria-label="Reader view">
    <header className="reader-toolbar">
      <button className="btn sm" ref={close} onClick={() => setOverlay(null)}>Back to page</button>
      <span className="sp" />
      <button className="btn sm" aria-label="Smaller reading text" disabled={size<=16} onClick={() => resize(-2)}>A−</button>
      <button className="btn sm" aria-label="Larger reading text" disabled={size>=26} onClick={() => resize(2)}>A+</button>
    </header>
    <div className="reader-scroll" style={{fontSize:size}} onClick={event => {
      const link = (event.target as HTMLElement).closest('a');
      if (!link) return;
      event.preventDefault();
      if (!/^https?:\/\//i.test(link.href)) return;
      void useStore.getState().newTab(link.href).then(() => setOverlay(null)).catch(errToast);
    }}>
      {error ? <div className="reader-empty" role="status"><h2>Reader view isn’t available</h2><p>{error}</p></div> : !article ? <p className="reader-empty" role="status">Preparing article…</p> : <article className="reader-article">
        <div className="reader-meta">{article.site} · {article.minutes} min read</div>
        <h1>{article.title}</h1>
        {article.byline && <p className="reader-byline">{article.byline}</p>}
        <div className="reader-content">{renderNode(article.content)}</div>
      </article>}
    </div>
  </section>;
}
