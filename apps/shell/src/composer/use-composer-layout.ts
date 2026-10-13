import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Measure the one-line editor independently of its expanded layout. */
export function useComposerLayout(
  input: RefObject<HTMLTextAreaElement | null>,
  value: string,
  inlineControls: boolean,
) {
  const field = useRef<HTMLDivElement>(null);
  const [multiline, setMultiline] = useState(false);
  useLayoutEffect(() => {
    const element = field.current;
    const textarea = input.current;
    if (!element || !textarea || inlineControls) return;
    const measure = () => {
      if (!element.clientWidth) return;
      const style = getComputedStyle(textarea);
      const inset = element.clientWidth <= 520 ? 6 : 8;
      const leading = element.querySelector<HTMLElement>(":scope > .home-tools-trigger");
      const trailing = element.querySelector<HTMLElement>(":scope > .composer-send-actions");
      const left = leading ? leading.offsetWidth + inset * 2 : 14;
      const right = trailing?.offsetWidth ? trailing.offsetWidth + inset * 2 : 14;
      element.style.setProperty("--composer-input-start", `${left}px`);
      element.style.setProperty("--composer-input-end", `${right}px`);
      const mirror = textarea.cloneNode() as HTMLTextAreaElement;
      mirror.removeAttribute("id");
      mirror.removeAttribute("aria-label");
      mirror.setAttribute("aria-hidden", "true");
      mirror.tabIndex = -1;
      mirror.inert = true;
      mirror.value = value;
      mirror.rows = 1;
      Object.assign(mirror.style, {
        position: "absolute",
        visibility: "hidden",
        pointerEvents: "none",
        width: `${element.clientWidth}px`,
        height: "0",
        minHeight: "0",
        maxHeight: "none",
        paddingLeft: `${left}px`,
        paddingRight: `${right}px`,
        fieldSizing: "fixed",
      });
      element.append(mirror);
      const oneLine =
        parseFloat(style.lineHeight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setMultiline(mirror.scrollHeight > oneLine + 1);
      mirror.remove();
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    const actions = element.querySelector<HTMLElement>(".composer-send-actions");
    if (actions) observer?.observe(actions);
    return () => observer?.disconnect();
  }, [input, value, inlineControls]);
  return { field, multiline };
}
