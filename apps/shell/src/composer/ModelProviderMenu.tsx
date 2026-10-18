import { useCallback, useEffect, useLayoutEffect, useRef, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ModelProviderMark } from "../ui/model-provider";
import { moveMenuFocus } from "../keyboard-list";
import { shellIconLeft, shellIconRight } from "../ui/icons";

/** A submenu stays inside the owning native dialog's focus and dismissal scope. */
export function ModelProviderMenu({
  label,
  provider,
  open,
  onOpen,
  onClose,
  children,
}: {
  label: string;
  provider?: string;
  open: boolean;
  onOpen(): void;
  onClose(): void;
  children: ReactNode;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const submenu = useRef<HTMLDivElement>(null);
  const enter = useRef(false);
  const returning = useRef(false);
  const [narrow, setNarrow] = useState(() => window.innerWidth <= 640);
  const [menuRoot, setMenuRoot] = useState<HTMLElement | null>(null);
  const owner = narrow ? menuRoot : null;
  const attachTrigger = useCallback((button: HTMLButtonElement | null) => {
    trigger.current = button;
    if (button) setMenuRoot(button.closest<HTMLElement>(".composer-model-picker"));
  }, []);
  const id = useId();
  useEffect(() => {
    const resize = () => setNarrow(window.innerWidth <= 640);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useLayoutEffect(() => {
    if (!open) return;
    const panel = submenu.current;
    const button = trigger.current;
    if (!panel || !button) return;
    const hidden = owner
      ? [...owner.children]
          .filter((child): child is HTMLElement => child instanceof HTMLElement && child !== panel)
          .map((child) => ({ child, hidden: child.hidden, inert: child.inert }))
      : [];
    for (const { child } of hidden) {
      child.hidden = true;
      child.inert = true;
    }
    const place = () => {
      if (owner) return;
      const rect = button.getBoundingClientRect();
      const width = panel.offsetWidth;
      const right = rect.right + 8;
      const left = right + width <= window.innerWidth - 8 ? right : rect.left - width - 8;
      panel.style.left = `${Math.max(8, Math.min(left, window.innerWidth - width - 8))}px`;
      panel.style.top = `${Math.max(8, Math.min(rect.top, window.innerHeight - panel.offsetHeight - 8))}px`;
    };
    place();
    const frame = requestAnimationFrame(place);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(panel);
    observer?.observe(button);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    if (enter.current) {
      panel.querySelector<HTMLElement>('[role="menuitemradio"]:not(:disabled)')?.focus();
      enter.current = false;
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      for (const entry of hidden) {
        entry.child.hidden = entry.hidden;
        entry.child.inert = entry.inert;
      }
      if (returning.current) {
        returning.current = false;
        button.focus();
      }
    };
  }, [open, owner]);
  const focusChoices = () => {
    enter.current = true;
    onOpen();
    if (open) {
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
        <button type="button" role="menuitem" className="composer-model-submenu-back" onClick={closeChoices}>
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
        onPointerMove={narrow ? undefined : onOpen}
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
      {owner ? createPortal(panel, owner) : panel}
    </>
  );
}
