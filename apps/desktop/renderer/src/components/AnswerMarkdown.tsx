import { useRef, useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { errToast, useStore } from "../store";
import { I } from "./icons";

// Model output is untrusted. Only explicit HTTP(S) links may leave the answer.
export function answerUrl(value: string): string {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function CodeBlock({ children }: { children?: ReactNode }) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(pre.current?.textContent ?? "");
      setCopied(true);
    } catch (error) { errToast(error); }
  }
  return <div className="answer-code"><button className="btn sm" onClick={() => void copy()} aria-label="Copy code">{copied ? I.check : I.copy}{copied ? "Copied" : "Copy code"}</button><pre ref={pre} tabIndex={0}>{children}</pre></div>;
}

export function AnswerMarkdown({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  return <div className="answer-markdown" ref={root}><Markdown remarkPlugins={[remarkGfm]} skipHtml
    urlTransform={value => value.startsWith("#") ? value : answerUrl(value)}
    components={{
      a: ({ href, children }) => {
        if (!href) return <span>{children}</span>;
        return <a href={href} title={href} onClick={event => {
          event.preventDefault();
          if (href.startsWith("#")) {
            const target = Array.from(root.current?.querySelectorAll("[id]") ?? []).find(el => `#${el.id}` === href);
            target?.scrollIntoView({ block: "nearest" });
            return;
          }
          const url = answerUrl(href);
          if (url) void useStore.getState().newTab(url).catch(errToast);
        }}>{children}</a>;
      },
      // Remote image markup must not make tracking requests from the trusted shell.
      // Actual captured screenshots are rendered separately from stored artifacts.
      img: ({ alt }) => <span className="answer-image-note">{alt ? `Image: ${alt}` : "Image"}</span>,
      pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
      table: ({ children }) => <div className="answer-table" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>,
    }}>{text}</Markdown></div>;
}
