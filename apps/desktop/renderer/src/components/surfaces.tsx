import { Suspense, lazy, type ComponentProps, type ComponentType } from "react";
import type { Conversation as ConversationPane } from "./Conversation";
import { deferSurface } from "./DeferredSurface";

/** The conversation path (markdown, run panels, timelines) stays out of the startup chunk. */
export const Conversation = deferSurface<NonNullable<ComponentProps<typeof ConversationPane>>>(async () => { const module = await import("./Conversation"); return {default:module.Conversation}; }, "This conversation", true);

/** The scripted mock page only exists in the browser preview build. */
export const MockPage = deferSurface(async () => { const module = await import("./MockPage"); return {default:module.MockPage}; }, "Preview page", true, true);

let Markdown: ComponentType<{ text: string }> | undefined;
const loadMarkdown = async () => { const module = await import("./AnswerMarkdown"); Markdown = module.AnswerMarkdown; return {default:module.AnswerMarkdown}; };
const LazyMarkdown = lazy(loadMarkdown);

/** Markdown once its chunk is in; the same text as plain prose until then. */
export function AnswerPreview({ text }: { text: string }) {
  if (Markdown) return <Markdown text={text} />;
  return <Suspense fallback={<div className="answer-markdown plain">{text}</div>}><LazyMarkdown text={text} /></Suspense>;
}
AnswerPreview.preload = () => { void loadMarkdown().catch(() => {}); };
