import type { KeyboardEvent } from "react";
import { availableForFocus, nativePickerOpen } from "./ui/focus";

/** Manual activation: arrows move focus; Enter/Space keep the control's action. */
export function moveListFocus(event: KeyboardEvent<HTMLElement>, selector: string, vertical = true) {
  if (event.nativeEvent.isComposing || event.defaultPrevented) return;
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const backward = vertical ? "ArrowUp" : "ArrowLeft";
  const forward = vertical ? "ArrowDown" : "ArrowRight";
  if (![backward, forward, "Home", "End"].includes(event.key)) return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(selector)].filter(availableForFocus);
  const index = rows.indexOf(event.target as HTMLElement);
  if (index < 0 || !rows.length) return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? rows.length - 1
        : (index + (event.key === backward ? -1 : 1) + rows.length) % rows.length;
  rows[next]?.focus();
  rows[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

const menuSearch = new WeakMap<HTMLElement, { text: string; time: number }>();

/** Menu-only typeahead; editable fields retain normal typing and cursor movement. */
export function moveMenuFocus(event: KeyboardEvent<HTMLElement>, selector = '[role^="menuitem"]') {
  const target = event.target as HTMLElement;
  if (target.closest('input, select, textarea, [contenteditable="true"]')) return;
  moveListFocus(event, selector);
  if (event.defaultPrevented) menuSearch.delete(event.currentTarget);
  if (
    event.defaultPrevented ||
    event.nativeEvent.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.key.length !== 1 ||
    event.key === " "
  )
    return;
  const root = event.currentTarget;
  const rows = [...root.querySelectorAll<HTMLElement>(selector)].filter(availableForFocus);
  if (!rows.length) return;
  const now = Date.now();
  const previous = menuSearch.get(root);
  const key = event.key.toLocaleLowerCase();
  let text = previous && now - previous.time < 700 ? previous.text + key : key;
  if ([...text].every((letter) => letter === key)) text = key;
  menuSearch.set(root, { text, time: now });
  const active = rows.findIndex((row) => row === target || row.contains(target));
  const start = text.length > 1 ? Math.max(0, active) : (active + 1) % rows.length;
  const ordered = [...rows.slice(start), ...rows.slice(0, start)];
  const match = ordered.find((row) =>
    (row.getAttribute("aria-label") ?? row.textContent ?? "").trim().toLocaleLowerCase().startsWith(text),
  );
  if (!match) return;
  event.preventDefault();
  match.focus();
  match.scrollIntoView({ block: "nearest", inline: "nearest" });
}

/** Keyboard behavior for a native details/summary menu without a second open state. */
export function detailsMenuKey(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.defaultPrevented || event.nativeEvent.isComposing || nativePickerOpen(event.target)) return;
  const details = event.currentTarget;
  const summary = details.querySelector("summary");
  if (event.target === summary && ["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    menuSearch.delete(details);
    details.open = true;
    const items = [...details.querySelectorAll<HTMLElement>('[role^="menuitem"]')].filter(availableForFocus);
    (event.key === "ArrowUp" ? items.at(-1) : items[0])?.focus();
    return;
  }
  if (!details.open) return;
  if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }
    menuSearch.delete(details);
    details.open = false;
    summary?.focus();
    return;
  }
  moveMenuFocus(event);
}
