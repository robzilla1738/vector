import { useId, type ReactNode } from "react";

export function SettingsSection({
  name,
  title = name,
  hidden = false,
  className = "",
  children,
}: {
  name: string;
  title?: string;
  hidden?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className || undefined} data-settings-section={name} hidden={hidden}>
    <h2 className="drawer-section">{title}</h2>
      {children}
    </section>
  );
}

/** Search metadata lives on the same field that renders the control. */
export function SettingsField({
  label,
  hint,
  description,
  searchTerms = [],
  target,
  compact = false,
  children,
}: {
  label: string;
  hint?: ReactNode;
  description?: string;
  searchTerms?: readonly string[];
  target?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const supportingText = hint ?? description;
  return (
    <div
      className={`field ui-setting${compact ? " compact" : ""}`}
      data-setting={target ?? label}
      data-settings-field={label}
      data-settings-description={description ?? (typeof hint === "string" ? hint : "")}
      data-settings-terms={JSON.stringify(searchTerms)}
      tabIndex={-1}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={supportingText ? `${id}-hint` : undefined}
    >
      <span id={`${id}-label`} className="setting-label">
        {label}
      </span>
      <div className="ui-setting-control">{children}</div>
      {supportingText && (
        <span id={`${id}-hint`} className="hint">
          {supportingText}
        </span>
      )}
    </div>
  );
}
