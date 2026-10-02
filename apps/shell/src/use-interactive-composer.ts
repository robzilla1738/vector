import { useLayoutEffect, useRef, type RefObject } from "react";

let nextInstance = 0;
const markedDocuments = new WeakSet<Document>();

/** A committed typeability witness, never native authority or paint evidence. */
export function commitInteractiveComposer(input: HTMLTextAreaElement | null, instance: string): (() => void) | undefined {
  const document = input?.ownerDocument;
  const view = document?.defaultView;
  if (!input || !document || !view || view.location.protocol !== "chrome:" || view.location.hostname !== "aux" ||
      !input.isConnected || input.disabled || input.matches(":disabled") || input.readOnly || document.visibilityState !== "visible" ||
      input.closest("[inert], [aria-hidden='true']")) return;
  for (let node: Element | null = input; node; node = node.parentElement) {
    const style = view.getComputedStyle(node);
    if (node.hasAttribute("hidden") || style.display === "none" || style.visibility !== "visible" ||
        Number.parseFloat(style.opacity) === 0) return;
  }
  const rect = input.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const left = Math.max(0, rect.left), right = Math.min(view.innerWidth, rect.right);
  const top = Math.max(0, rect.top), bottom = Math.min(view.innerHeight, rect.bottom);
  if (right <= left || bottom <= top || document.elementFromPoint((left + right) / 2, (top + bottom) / 2) !== input) return;
  input.dataset.auxInteractiveInstance = instance;
  if (!markedDocuments.has(document)) {
    view.performance.mark("aux-interactive", { detail: { instance } });
    markedDocuments.add(document);
  }
  return () => {
    if (input.dataset.auxInteractiveInstance === instance) delete input.dataset.auxInteractiveInstance;
  };
}

export function useInteractiveComposer(home: boolean, input: RefObject<HTMLTextAreaElement | null>) {
  const instance = useRef<string>("");
  // Only the committed layout effect writes the witness. Abandoned renders do not.
  useLayoutEffect(() => {
    if (!home) return;
    if (!instance.current) instance.current = `composer-${++nextInstance}`;
    return commitInteractiveComposer(input.current, instance.current);
  });
}
