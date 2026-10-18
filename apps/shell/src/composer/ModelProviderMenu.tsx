import { useCallback, useLayoutEffect, useRef, useId, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ModelProviderMark } from "../ui/model-provider";
import { moveMenuFocus } from "../keyboard-list";
import { shellIconLeft, shellIconRight } from "../ui/icons";

function modelMenuBounds(anchor: HTMLElement | null) {
  const region = anchor?.closest<HTMLElement>(".conversation, .home-ask, .settings-content, .main");
  const rect = region?.getBoundingClientRect();
  return {
    left: Math.max(0, rect?.left ?? 0),
    right: Math.min(window.innerWidth, rect?.right ?? window.innerWidth),
  };
}

/** A submenu stays inside the owning native dialog's focus and dismissal scope. */
export function ModelProviderMenu({
  label,
  provider,
  open,
  onOpen,
  onClose,
  children,
  menuAnchor,
}: {
  label: string;
  provider?: string;
  open: boolean;
  onOpen(): void;
  onClose(): void;
  children: ReactNode;
  menuAnchor: RefObject<HTMLElement | null>;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const submenu = useRef<HTMLDivElement>(null);
  const enter = useRef(false);
  const returning = useRef(false);
  const [narrow, setNarrow] = useState(true);
  const focusIndex = useRef(0);
  const [menuRoot, setMenuRoot] = useState<HTMLElement | null>(null);
  const owner = narrow ? menuRoot : null;
  const portalRoot = owner ?? menuRoot?.closest("dialog") ?? menuRoot;
  const attachTrigger = useCallback((button: HTMLButtonElement | null) => {
    trigger.current = button;
    if (button) setMenuRoot(button.closest<HTMLElement>(".composer-model-picker, .settings-model-picker"));
  }, []);
  const id = useId();
  const updateNarrow = useCallback(
    (next: boolean) => {
      if (next === narrow) return;
      const panel = submenu.current;
      const choices = panel?.querySelectorAll<HTMLElement>('[role="menuitemradio"]:not(:disabled)');
      if (open && (panel?.contains(document.activeElement) || next)) {
        focusIndex.current = Math.max(
          0,
          choices ? [...choices].indexOf(document.activeElement as HTMLElement) : 0,
        );
        enter.current = true;
      }
      setNarrow(next);
    },
    [narrow, open],
  );
  useLayoutEffect(() => {
    if (!open) return;
    const panel = submenu.current;
    const button = trigger.current;
    const anchor = menuAnchor.current;
    if (!panel || !button || !anchor || !portalRoot) return;
    const hidden = owner
      ? [...owner.children]
          .filter((child): child is HTMLElement => child instanceof HTMLElement && child !== panel)
          .map((child) => ({ child, hidden: child.hidden, inert: child.inert }))
      : [];
    for (const { child } of hidden) {
      child.hidden = true;
      child.inert = true;
    }
    let active = true;
    let settled = true;
    const place = () => {
      if (!active) return;
      if (!button.isConnected || !anchor.isConnected || menuAnchor.current !== anchor) {
        onClose();
        return;
      }
      const bounds = modelMenuBounds(menuAnchor.current);
      const nextNarrow = bounds.right - bounds.left <= 640;
      if (nextNarrow !== narrow) {
        settled = false;
        updateNarrow(nextNarrow);
        return;
      }
      if (owner) {
        panel.style.left = "";
        panel.style.top = "";
        panel.style.maxWidth = "";
        panel.style.maxHeight = "";
        return;
      }
      panel.style.maxWidth = `${Math.max(0, bounds.right - bounds.left - 16)}px`;
      panel.style.maxHeight = `${Math.max(0, Math.min(360, window.innerHeight - 16))}px`;
      const rect = button.getBoundingClientRect();
      const dialogRect = portalRoot.getBoundingClientRect();
      const width = panel.offsetWidth;
      const right = rect.right + 8;
      const left = right + width <= bounds.right - 8 ? right : rect.left - width - 8;
      const x = Math.max(bounds.left + 8, Math.min(left, bounds.right - width - 8));
      const y = Math.max(8, Math.min(rect.top, window.innerHeight - panel.offsetHeight - 8));
      panel.style.left = `${x - dialogRect.left - portalRoot.clientLeft + portalRoot.scrollLeft}px`;
      panel.style.top = `${y - dialogRect.top - portalRoot.clientTop + portalRoot.scrollTop}px`;
    };
    place();
    const frame = requestAnimationFrame(place);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(panel);
    observer?.observe(button);
    observer?.observe(portalRoot);
    const region = anchor.closest<HTMLElement>(".conversation, .home-ask, .settings-content, .main");
    if (region) observer?.observe(region);
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node) || !panel.contains(event.target)) place();
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", place);
    if (settled && enter.current) {
      const choices = panel.querySelectorAll<HTMLElement>('[role="menuitemradio"]:not(:disabled)');
      (choices[focusIndex.current] ?? choices[0])?.focus({ preventScroll: true });
      enter.current = false;
    }
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
      for (const entry of hidden) {
        entry.child.hidden = entry.hidden;
        entry.child.inert = entry.inert;
      }
      if (returning.current) {
        returning.current = false;
        if (button.isConnected) button.focus({ preventScroll: true });
      }
    };
  }, [open, owner, portalRoot, menuAnchor, narrow, updateNarrow, onClose]);
  const focusChoices = () => {
    const bounds = modelMenuBounds(menuAnchor.current);
    const nextNarrow = bounds.right - bounds.left <= 640;
    updateNarrow(nextNarrow);
    focusIndex.current = 0;
    enter.current = true;
    onOpen();
    if (open && nextNarrow === narrow) {
      submenu.current?.querySelector<HTMLElement>('[role="menuitemradio"]:not(:disabled)')?.focus();
      enter.current = false;
    }
  };
  const closeChoices = () => {
    returning.current = true;
    onClose();
  };
  const panel = open && (
    <div
      ref={submenu}
      id={id}
      role="menu"
      tabIndex={-1}
      aria-label={`${label} models`}
      className={`composer-model-list composer-model-submenu${owner ? " composer-model-submenu-nested" : " popup-material"}`}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.key === "Tab") return;
        event.stopPropagation();
        if (event.key === "Escape" || event.key === "ArrowLeft") {
          event.preventDefault();
          closeChoices();
        } else moveMenuFocus(event);
      }}
    >
      {owner && (
        <button
          type="button"
          role="menuitem"
          aria-label="Back to model providers"
          className="composer-model-submenu-back"
          onClick={closeChoices}
        >
          {shellIconLeft}
          <span>{label}</span>
        </button>
      )}
      {children}
    </div>
  );
  return (
    <>
      <button
        ref={attachTrigger}
        type="button"
        role="menuitem"
        data-model-root
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onPointerMove={() => {
          const bounds = modelMenuBounds(menuAnchor.current);
          const nextNarrow = bounds.right - bounds.left <= 640;
          updateNarrow(nextNarrow);
          if (!nextNarrow) onOpen();
        }}
        onClick={focusChoices}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" || event.nativeEvent.isComposing) return;
          event.preventDefault();
          event.stopPropagation();
          focusChoices();
        }}
      >
        <ModelProviderMark provider={provider} />
        <span>{label}</span>
        {shellIconRight}
      </button>
      {portalRoot ? createPortal(panel, portalRoot) : panel}
    </>
  );
}
