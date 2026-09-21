import { Readability } from '@mozilla/readability';

// Return inert structure, never page HTML, styles, handlers or form values.
export function extractArticle() {
  const tags = new Set(['p','h1','h2','h3','h4','h5','h6','blockquote','pre','code','ul','ol','li','strong','em','b','i','a','br','hr','table','thead','tbody','tr','th','td','figcaption']);
  const excluded = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','FORM','INPUT','TEXTAREA','SELECT','BUTTON','SVG','MATH']);
  let count = 0;
  let chars = 0;
  const serialize = (node, depth = 0) => {
    if (++count > 12000 || depth > 70 || chars > 250000) throw new Error('This article is too large for Reader view.');
    if (node.nodeType === Node.TEXT_NODE) { const text = node.textContent || ''; chars += text.length; return text; }
    if (node.nodeType !== Node.ELEMENT_NODE || excluded.has(node.tagName)) return null;
    if (node.tagName === 'IMG') return null;
    const children = [...node.childNodes].map(child => serialize(child, depth + 1)).filter(child => child !== null);
    const tag = node.tagName.toLowerCase();
    const sourceId = node.id ? node.id.slice(0, 1000) : undefined;
    if (!tags.has(tag)) return {tag:'div',children,...(sourceId ? {sourceId} : {})};
    let href;
    if (tag === 'a') {
      try { const raw = node.getAttribute('href'); if (!raw) return {tag:'span',children}; const url = new URL(raw, location.href); if (['http:','https:'].includes(url.protocol)) href = url.href; } catch {}
    }
    return {tag:tag==='a'&&!href?'span':tag,children,...(href ? {href} : {}),...(sourceId ? {sourceId} : {})};
  };
  if (document.getElementsByTagName('*').length > 30000) throw new Error('This page is too large for Reader view.');
  const article = new Readability(document.cloneNode(true), {maxElemsToParse:30000,serializer:serialize}).parse();
  if (!article || article.length < 200) throw new Error('No readable article was found on this page.');
  return {title:article.title,byline:article.byline || '',site:article.siteName || location.hostname,url:location.href,minutes:Math.max(1,Math.ceil(article.textContent.split(/\s+/).length/220)),content:article.content};
}
