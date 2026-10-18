import { useLayoutEffect, useRef, useId, type ReactNode } from "react";
import { ModelProviderMark } from "../ui/model-provider";
import { moveMenuFocus } from "../keyboard-list";
import { shellIconRight } from "../ui/icons";

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
  const id = useId();
  useLayoutEffect(() => {
    if (!open) return;
    const panel = submenu.current;
    const button = trigger.current;
    if (!panel || !button) return;
    const place = () => {
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
    };
  }, [open]);
  const focusChoices = () => {
    enter.current = true;
    onOpen();
    if (open) {
      submenu.current?.querySelector<HTMLElement>('[role="menuitemradio"]:not(:disabled)')?.focus();
      enter.current = false;
    }
  };
  return (
    <>
      <button
        ref={trigger}
        type="button"
        role="menuitem"
        data-model-root
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onPointerMove={onOpen}
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
      {open && (
        <div
          ref={submenu}
          id={id}
          role="menu"
          aria-label={`${label} models`}
          className="composer-model-submenu popup-material"
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.key === "Tab") return;
            event.stopPropagation();
            if (event.key === "Escape" || event.key === "ArrowLeft") {
              event.preventDefault();
              onClose();
              trigger.current?.focus();
            } else moveMenuFocus(event);
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}
