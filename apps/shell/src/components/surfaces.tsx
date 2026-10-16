import { Suspense, lazy, useState, type ComponentType } from "react";
import { deferNamedSurface } from "./DeferredSurface";

/** The conversation path (markdown, run panels, timelines) stays out of the startup chunk. */
export const Conversation = deferNamedSurface(
  () => import("./Conversation"),
  "Conversation",
  "This conversation",
  true,
);

/** The scripted mock page only exists in the browser preview build. */
export const MockPage =
  import.meta.env.MODE === "mock"
    ? deferNamedSurface(() => import("./MockPage"), "MockPage", "Preview page", true, true)
    : null;

let Markdown: ComponentType<{ text: string }> | undefined;
const loadMarkdown = async () => {
  const module = await import("./AnswerMarkdown");
  Markdown = module.AnswerMarkdown;
  return { default: module.AnswerMarkdown };
};
const LazyMarkdown = lazy(loadMarkdown);

/** Markdown once its chunk is in; the same text as plain prose until then. */
export function AnswerPreview({ text }: { text: string }) {
  const [Surface] = useState(() => Markdown ?? LazyMarkdown);
  return (
    <Suspense fallback={<div className="answer-markdown plain">{text}</div>}>
      <Surface text={text} />
    </Suspense>
  );
}
AnswerPreview.preload = () => {
  void loadMarkdown().catch(() => {});
};

let PlainText: ComponentType<{ text: string }> | undefined;
const loadPlainText = async () => {
  const module = await import("./PlainAnswerText");
  PlainText = module.PlainAnswerText;
  return { default: module.PlainAnswerText };
};
const LazyPlainText = lazy(loadPlainText);

/** List excerpts stay text-only; the Markdown parser stays off the startup path. */
export function PlainAnswerPreview({ text }: { text: string }) {
  const [Surface] = useState(() => PlainText ?? LazyPlainText);
  return (
    <Suspense fallback={text}>
      <Surface text={text} />
    </Suspense>
  );
}
