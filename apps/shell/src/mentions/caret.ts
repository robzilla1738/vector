/** Measure wrapped text using the textarea's actual typography and scroll position. */
export function caretAnchor(input: HTMLTextAreaElement, caret: number): { left: number; top: number } {
  const style = getComputedStyle(input),
    box = input.getBoundingClientRect();
  const mirror = document.createElement("div");
  for (const key of [
    "font",
    "letterSpacing",
    "lineHeight",
    "padding",
    "border",
    "boxSizing",
    "wordSpacing",
    "tabSize",
  ] as const)
    mirror.style[key] = style[key];
  Object.assign(mirror.style, {
    position: "fixed",
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    visibility: "hidden",
    pointerEvents: "none",
  });
  mirror.textContent = input.value.slice(0, caret);
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  mirror.append(marker);
  document.body.append(mirror);
  const rect = marker.getBoundingClientRect();
  mirror.remove();
  return {
    left: Math.max(12, Math.min(rect.left - input.scrollLeft, window.innerWidth - Math.min(330, window.innerWidth - 24) - 12)),
    top: Math.max(12, Math.min(rect.bottom - input.scrollTop, window.innerHeight - Math.min(360, window.innerHeight / 2) - 12)),
  };
}
