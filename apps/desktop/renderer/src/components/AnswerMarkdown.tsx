import type { ConversationSource } from "@aux/contracts";
import { CitationChip } from "./CitationChip";
import { backgroundLink, browserLinkUrl, openBrowserLink } from "../browser-links";
import { answerHeadings, answerFragment } from "../answer-headings";
import { answerTableCsv, answerTableMarkdown } from "../answer-table";
import { Children, isValidElement, memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { errToast, useStore } from "../store";
import { bridge } from "../bridge";
import { I } from "./icons";

// Model output is untrusted. Only explicit HTTP(S) links may leave the answer.
export const answerUrl = browserLinkUrl;

function CodeBlock({ children }: { children?: ReactNode }) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const code = Children.toArray(children).find(child => isValidElement<{className?:string}>(child));
  const language = isValidElement<{className?:string}>(code) ? code.props.className?.match(/language-([\w+-]+)/)?.[1] : undefined;
  useEffect(() => { if (!copied) return; const timer = window.setTimeout(() => setCopied(false), 1800); return () => window.clearTimeout(timer); }, [copied]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(pre.current?.textContent ?? "");
      setCopied(true);
    } catch (error) { errToast(error); }
  }
  return <div className="answer-code"><header><span>{language || "Code"}</span><button className="btn sm ghost" aria-pressed={wrap} onClick={() => setWrap(value => !value)}>Wrap</button><button className="btn sm" onClick={() => void copy()} aria-label="Copy code">{copied ? I.check : I.copy}{copied ? "Copied" : "Copy code"}</button></header><pre ref={pre} className={wrap ? "wrap" : ""} tabIndex={0} aria-label={language ? `${language} code` : "Code block"}>{children}</pre></div>;
}

function ResponseTable({ children }: { children?: ReactNode }) {
  const table = useRef<HTMLTableElement>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!copied) return; const timer = window.setTimeout(() => setCopied(false), 1800); return () => window.clearTimeout(timer); }, [copied]);
  const rows = () => Array.from(table.current?.rows ?? [], row => Array.from(row.cells, cell => cell.textContent ?? ""));
  async function copy() {
    try {
      const markdown = answerTableMarkdown(rows());
      await navigator.clipboard.writeText(markdown); setCopied(true);
    } catch (error) { errToast(error); }
  }
  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const csv = answerTableCsv(rows());
      const path = await bridge.saveFile("aux-table.csv", csv);
      if (path) useStore.getState().toast("Table saved");
    } catch (error) { errToast(error); }
    finally { setSaving(false); }
  }
  return <div className="answer-table-wrap"><div className="answer-table-actions"><button className="btn sm ghost" onClick={() => void copy()}>{copied ? I.check : I.copy}{copied ? "Copied" : "Copy table"}</button><button className="btn sm ghost" disabled={saving} onClick={() => void save()}>{I.downloadSm}{saving ? "Saving…" : "Save CSV"}</button></div><div className="answer-table" tabIndex={0} role="region" aria-label="Response table"><table ref={table}>{children}</table></div></div>;
}

const REMARK_PLUGINS = [remarkGfm, answerHeadings];
const answerUrlTransform = (value: string) => value.startsWith("#") ? value : answerUrl(value);

/** Parsing markdown is the costliest thing a conversation renders; only a new text re-parses. */
export const AnswerMarkdown = memo(function AnswerMarkdown({ text, onOpenLink, sources }: { text: string; sources?: ConversationSource[]; onOpenLink?: (url: string, background: boolean) => boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const components = useMemo<Components>(() => ({
      a: ({ href, children }) => {
        if (!href) return <span>{children}</span>;
        const matching = sources?.filter(source => source.url === href) ?? [];
        // The same URL in multiple Profiles is ambiguous. Preserve the ordinary link
        // so the existing account-selection path can resolve it on activation.
        const source = matching.length === 1 ? matching[0] : undefined;
        const Link = source ? CitationChip : "a";
        return <Link source={source!} href={href} title={source ? undefined : href} onAuxClick={event => { if (event.button === 1) { event.preventDefault(); const url=answerUrl(href); if(url && !onOpenLink?.(url,true)) void openBrowserLink(url,true).catch(errToast); } }} onClick={event => {
          event.preventDefault();
          if (href.startsWith("#")) {
            const fragment = answerFragment(href);
            const target = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-answer-heading], [id]") ?? [])
              .find(el => el.dataset.answerHeading === fragment || el.id === fragment);
            target?.scrollIntoView({ block: "start" });
            target?.focus({preventScroll:true});
            return;
          }
          const url = answerUrl(href);
          if (url && !onOpenLink?.(url,backgroundLink(event))) void openBrowserLink(url, backgroundLink(event)).catch(errToast);
        }}>{children}</Link>;
      },
      // Remote image markup must not make tracking requests from the trusted shell.
      // Actual captured screenshots are rendered separately from stored artifacts.
      img: ({ alt }) => <span className="answer-image-note">{alt ? `Image: ${alt}` : "Image"}</span>,
      pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
      table: ({ children }) => <ResponseTable>{children}</ResponseTable>,
    }), [onOpenLink, sources]);
  return <div className="answer-markdown" ref={root}><Markdown remarkPlugins={REMARK_PLUGINS} skipHtml urlTransform={answerUrlTransform} components={components}>{text}</Markdown></div>;
});
