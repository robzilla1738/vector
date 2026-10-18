import { IconButton } from "./button";
import { staticIconButtonProps } from "./class-props";
import { staticHintProps } from "./class-props";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
  type RefObject,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { shellIconClose, shellIconFolder, shellIconMore, shellIconSearch } from "./icons";
import { Menu } from "./dialog";
import "./ui.css";
import {
  nativeAriaHiddenProps as auxNativeAriaHiddenProps,
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "./native-attribute-props";
import { staticTextProps as auxClassTextProps } from "./class-props";
import {
  nativeGroupRoleProps,
  nativeCheckboxTypeProps,
  nativeMenuItemRoleProps,
} from "./native-attribute-props";

export { Dialog, Menu } from "./dialog";
export { Button, IconButton } from "./button";

/** Aux materials: native chrome owns page blur; reading surfaces remain stable. */
export function Surface({
  material = "panel",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { material?: "panel" | "floating" | "inset" | "reading" }) {
  return <div {...props} className={`ui-surface ${className}`} data-material={material} />;
}

export function SearchField({
  label,
  className = "",
  controlRef,
  onClear,
  clearLabel = "Clear search",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  controlRef?: RefObject<HTMLInputElement | null>;
  onClear(): void;
  clearLabel?: string;
}) {
  return (
    <div className={`ui-search-field ${className}`.trim()}>
      {shellIconSearch}
      <input {...props} ref={controlRef} type="search" aria-label={label} />
      {String(props.value ?? "").length > 0 && (
        <IconButton
          label={clearLabel}
          size={32}
          onClick={() => {
            onClear();
            controlRef?.current?.focus();
          }}
        >
          {shellIconClose}
        </IconButton>
      )}
    </div>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: T;
  onChange(value: T): void;
  items: readonly { value: T; label: ReactNode; disabled?: boolean }[];
}) {
  const enabled = items.filter((item) => !item.disabled);
  const stop = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  return (
    <div
      className="seg"
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey)
          return;
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')].filter(
          (node) => !node.disabled,
        );
        const index = radios.indexOf(event.target as HTMLButtonElement);
        if (index < 0 || !radios.length) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const backward = event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? radios.length - 1
              : (index + (backward ? -1 : 1) + radios.length) % radios.length;
        event.preventDefault();
        radios[next]?.focus();
        radios[next]?.click();
      }}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="radio"
          aria-checked={item.value === value}
          tabIndex={item.value === stop ? 0 : -1}
          disabled={item.disabled}
          className={item.value === value ? "on" : ""}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Kbd({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <kbd {...props} className={`ui-kbd ${className}`.trim()} />;
}

export function InputGroup({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`ui-input-group ${className}`.trim()} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`ui-textarea ${className}`.trim()} />;
}

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} {...auxNativeAriaHiddenProps} className={`ui-skeleton ${className}`.trim()} />;
}

export function ScrollArea({
  className = "",
  children,
  onScroll,
  tabIndex,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    const next = {
      top: node.scrollTop > 1,
      bottom: node.scrollTop + node.clientHeight < node.scrollHeight - 1,
    };
    setEdges((previous) => (previous.top === next.top && previous.bottom === next.bottom ? previous : next));
  }, []);
  useLayoutEffect(() => {
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    if (ref.current) {
      observer?.observe(ref.current);
      for (const child of ref.current.children) observer?.observe(child);
    }
    return () => observer?.disconnect();
  }, [children, measure]);
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={tabIndex ?? (edges.top || edges.bottom ? 0 : undefined)}
      data-fade-top={edges.top || undefined}
      data-fade-bottom={edges.bottom || undefined}
      onScroll={(event) => {
        measure();
        onScroll?.(event);
      }}
      className={`ui-scroll-area ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function SettingsRow({
  label,
  hint,
  children,
  compact = false,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div
      className={`field ui-setting${compact ? " compact" : ""}`}
      data-setting={label}
      tabIndex={-1}
      {...nativeGroupRoleProps}
      aria-labelledby={`${id}-label`}
      aria-describedby={hint ? `${id}-hint` : undefined}
    >
      <span id={`${id}-label`} className="setting-label">
        {label}
      </span>
      <div className="ui-setting-control">{children}</div>
      {hint && (
        <span id={`${id}-hint`} {...staticHintProps}>
          {hint}
        </span>
      )}
    </div>
  );
}

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="ui-settings-group" aria-label={title}>
      {title && <h4>{title}</h4>}
      <div>{children}</div>
    </section>
  );
}

export function Switch({
  controlRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onClickCapture,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role"> & {
  controlRef?: (node: HTMLInputElement | null) => void;
}) {
  const drag = useRef<{
    input: HTMLInputElement;
    pointerId: number;
    x: number;
    checked: boolean;
    center: number;
    moved: boolean;
  }>(undefined);
  const suppressClick = useRef(false);
  const reset = (input: HTMLInputElement) => {
    drag.current = undefined;
    input.removeAttribute("data-dragging");
    input.style.removeProperty("--switch-thumb-center");
  };
  useLayoutEffect(() => {
    const current = drag.current;
    if (
      current &&
      (props.disabled || props.readOnly || (props.checked !== undefined && props.checked !== current.checked))
    ) {
      suppressClick.current = current.moved;
      reset(current.input);
    }
  }, [props.disabled, props.readOnly, props.checked]);
  return (
    <input
      {...props}
      ref={controlRef}
      {...nativeCheckboxTypeProps}
      role="switch"
      className={`ui-switch ${props.className ?? ""}`}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.isPrimary === false ||
          props.disabled ||
          props.readOnly ||
          drag.current
        )
          return;
        suppressClick.current = false;
        drag.current = {
          input: event.currentTarget,
          pointerId: event.pointerId,
          x: event.clientX,
          checked: event.currentTarget.checked,
          center: event.currentTarget.checked ? 26 : 14,
          moved: false,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId || event.defaultPrevented) return;
        const delta = event.clientX - current.x;
        if (!current.moved && Math.abs(delta) <= 3) return;
        current.moved = true;
        current.center = Math.max(14, Math.min(26, (current.checked ? 26 : 14) + delta));
        event.preventDefault();
        event.currentTarget.setAttribute("data-dragging", "");
        event.currentTarget.style.setProperty("--switch-thumb-center", `${current.center}px`);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const input = event.currentTarget;
        reset(input);
        if (input.hasPointerCapture?.(event.pointerId)) input.releasePointerCapture(event.pointerId);
        if (!current.moved) return;
        suppressClick.current = true;
        const nextChecked = current.center >= 20;
        if (
          !event.defaultPrevented &&
          !input.disabled &&
          !input.readOnly &&
          input.checked === current.checked &&
          input.checked !== nextChecked
        )
          input.click();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (drag.current?.pointerId !== event.pointerId) return;
        suppressClick.current = drag.current.moved;
        reset(event.currentTarget);
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        if (drag.current?.pointerId !== event.pointerId) return;
        suppressClick.current = drag.current.moved;
        reset(event.currentTarget);
      }}
      onClickCapture={(event) => {
        // A drag commits through the checkbox's native click; consume its trailing pointer click.
        if (suppressClick.current && event.detail > 0) {
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
    />
  );
}
export function Checkbox({
  controlRef,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  controlRef?: (node: HTMLInputElement | null) => void;
}) {
  return (
    <input
      {...props}
      ref={controlRef}
      {...nativeCheckboxTypeProps}
      className={`ui-checkbox ${props.className ?? ""}`}
    />
  );
}
export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ui-text-field ${props.className ?? ""}`} />;
}
export function Select({
  controlRef,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { controlRef?: (node: HTMLSelectElement | null) => void }) {
  const button = useRef<HTMLButtonElement | null>(null);
  const attach = useCallback(
    (node: HTMLSelectElement | null) => {
      button.current?.remove();
      button.current = null;
      if (node && !props.multiple && props.size === undefined) {
        // Chromium owns the label clone; React owns the original options and selection.
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.append(document.createElement("selectedcontent"));
        node.prepend(trigger);
        button.current = trigger;
      }
      controlRef?.(node);
    },
    [controlRef, props.multiple, props.size],
  );
  return <select {...props} ref={attach} className={`ui-select ${props.className ?? ""}`} />;
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  children,
  className = "",
  disabled = false,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange(): void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`ui-radio-card${checked ? " selected" : ""} ${className}`.trim()}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {children}
    </label>
  );
}

export function Tabs<T extends string>({
  label,
  value,
  onChange,
  items,
  panelId,
  className = "",
  orientation = "horizontal",
}: {
  label: string;
  value: T;
  onChange(value: T): void;
  items: readonly { value: T; label: ReactNode; ariaLabel?: string; disabled?: boolean }[];
  panelId: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  const buttons = useRef(new Map<T, HTMLButtonElement>());
  const enabled = items.filter((item) => !item.disabled);
  const stop = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  const focus = (next: T) => {
    onChange(next);
    buttons.current.get(next)?.focus();
  };
  return (
    <div
      className={`ui-tabs ${className}`.trim()}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={(event) => {
        if (
          !(event.target instanceof HTMLButtonElement) ||
          !enabled.length ||
          event.nativeEvent.isComposing ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        const index = enabled.findIndex((item) => buttons.current.get(item.value) === event.target);
        if (index < 0) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const forward = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
        const backward = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
        let next: T | undefined;
        if (event.key === "Home") next = enabled[0]?.value;
        else if (event.key === "End") next = enabled[enabled.length - 1]?.value;
        else if (event.key === forward) next = enabled[(index + 1) % enabled.length]?.value;
        else if (event.key === backward) next = enabled[(index + enabled.length - 1) % enabled.length]?.value;
        if (next === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        focus(next);
      }}
    >
      {items.map((item) => (
        <button
          key={item.value}
          ref={(node) => {
            if (node) buttons.current.set(item.value, node);
            else buttons.current.delete(item.value);
          }}
          {...auxNativeButtonTypeProps}
          role="tab"
          id={`${panelId}-${item.value}`}
          aria-controls={panelId}
          aria-label={item.ariaLabel}
          aria-selected={item.value === value}
          tabIndex={item.value === stop ? 0 : -1}
          className={item.value === value ? "active" : ""}
          disabled={item.disabled}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export type MenuAction = {
  label: string;
  icon?: ReactNode;
  onSelect(event?: MouseEvent<HTMLButtonElement>): void;
  controlRef?: (node: HTMLButtonElement | null) => void;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
};
export function ActionMenu({
  label,
  actions,
  children = shellIconMore,
  triggerRef,
  triggerControl,
  onTrigger,
}: {
  label: string;
  actions: MenuAction[];
  children?: ReactNode;
  triggerRef?: (node: HTMLButtonElement | null) => void;
  triggerControl?: (node: HTMLButtonElement | null, activate: () => void) => void;
  onTrigger?: (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const openAtEnd = useRef(false);
  const id = useId();
  const triggerMode = useRef<"toggle" | "first" | "last">("toggle");
  const activate = useCallback(() => {
    const mode = triggerMode.current;
    triggerMode.current = "toggle";
    openAtEnd.current = mode === "last";
    if (mode === "toggle") setOpen((value) => !value);
    else setOpen(true);
  }, []);
  const requestTrigger = (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
    mode: "toggle" | "first" | "last",
  ) => {
    triggerMode.current = mode;
    try {
      if (onTrigger) onTrigger(event);
      else activate();
    } finally {
      triggerMode.current = "toggle";
    }
  };
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        ref={(node) => {
          trigger.current = node;
          triggerRef?.(node);
          triggerControl?.(node, activate);
        }}
        {...auxNativeButtonTypeProps}
        className="icon-btn ui-menu-trigger"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={(event) => requestTrigger(event, "toggle")}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            requestTrigger(event, event.key === "ArrowUp" ? "last" : "first");
          }
        }}
      >
        {children}
      </button>
      {open && (
        <Menu
          id={id}
          label={label}
          onClose={close}
          anchor={trigger}
          returnFocus={trigger}
          atEnd={openAtEnd.current}
          className="menu ctx-menu ui-action-menu"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              ref={action.controlRef}
              {...auxNativeButtonTypeProps}
              {...nativeMenuItemRoleProps}
              className={`menu-item${action.danger ? " danger" : ""}`}
              disabled={action.disabled}
              onClick={(event) => {
                close();
                trigger.current?.focus({ preventScroll: true });
                action.onSelect(event);
              }}
            >
              <span className="menu-ico">{action.icon}</span>
              <span {...auxClassTextProps}>{action.label}</span>
              {action.shortcut && <Kbd>{action.shortcut}</Kbd>}
            </button>
          ))}
        </Menu>
      )}
    </>
  );
}

export function ListRow({
  title,
  description,
  leading,
  trailing,
  selected = false,
  disabled = false,
  onOpen,
  openRef,
}: {
  title: string;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onOpen(event?: MouseEvent<HTMLButtonElement>): void;
  openRef?: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <div className={`ui-list-row${selected ? " selected" : ""}`}>
      <button
        ref={openRef}
        {...auxNativeButtonTypeProps}
        className="ui-list-open"
        disabled={disabled}
        onClick={onOpen}
        aria-current={selected ? "true" : undefined}
        title={title}
      >
        {leading && <span className="ui-list-icon">{leading}</span>}
        <span className="ui-list-copy">
          <strong>{title}</strong>
          {description && <small>{description}</small>}
        </span>
      </button>
      {trailing && <div className="ui-list-actions">{trailing}</div>}
    </div>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "active" | "success" | "warning" | "error";
}) {
  return (
    <span className="ui-status" data-tone={tone}>
      <span {...auxNativeAriaHiddenProps} />
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = shellIconFolder,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      <span className="ui-empty-icon" {...auxNativeAriaHiddenProps}>
        {icon}
      </span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function DetailPane({
  title,
  metadata,
  actions,
  onClose,
  children,
  className = "",
  headingRef,
  closeRef,
}: {
  title: string;
  metadata?: ReactNode;
  actions?: ReactNode;
  onClose?: (event?: MouseEvent<HTMLButtonElement>) => void;
  closeRef?: (node: HTMLButtonElement | null) => void;
  children: ReactNode;
  className?: string;
  headingRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <section className={`ui-detail-pane ${className}`} aria-label={title}>
      <header>
        <div>
          <strong ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
            {title}
          </strong>
          {metadata && <small>{metadata}</small>}
        </div>
        <div className="ui-detail-actions">
          {actions}
          {onClose && (
            <button
              ref={closeRef}
              {...auxNativeButtonTypeProps}
              {...staticIconButtonProps}
              aria-label={`Close ${title}`}
              onClick={onClose}
            >
              {shellIconClose}
            </button>
          )}
        </div>
      </header>
      <div className="ui-detail-content">{children}</div>
    </section>
  );
}

export function ComposerFrame({
  context,
  notices,
  controls,
  controlsInside = false,
  children,
}: {
  context?: ReactNode;
  notices?: ReactNode;
  controls?: ReactNode;
  controlsInside?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="composer-frame-wrap">
      {notices && <div className="composer-notices">{notices}</div>}
      <Surface material="inset" className="composer-frame">
        {context && <div className="composer-context">{context}</div>}
        {children}
        {controlsInside && controls}
      </Surface>
      {!controlsInside && controls}
    </div>
  );
}

/** Shared saved-work list anatomy; execution/revision authority stays with each owner. */
export function WorkRow({
  title,
  summary,
  metadata,
  status,
  icon,
  disabled,
  onOpen,
  actions,
}: {
  title: string;
  summary: string;
  metadata: ReactNode;
  status: string;
  icon: ReactNode;
  disabled?: boolean;
  onOpen(): void;
  actions: MenuAction[];
}) {
  return (
    <div className="ui-work-row">
      <ListRow
        title={title}
        leading={icon}
        disabled={disabled}
        onOpen={onOpen}
        description={
          <>
            <span className="ui-work-summary">{summary}</span>
            <span className="ui-work-meta">{metadata}</span>
          </>
        }
        trailing={
          <>
            <Badge label={status} />
            <ActionMenu
              label={`Actions for ${title}`}
              actions={actions.map((action) => ({ ...action, disabled: disabled || action.disabled }))}
            />
          </>
        }
      />
    </div>
  );
}
