import { staticHintProps } from "../ui/class-props";
import { useId, type ReactNode } from "react";
import { staticDrawerSectionProps as auxClassDrawerSectionProps } from "../ui/class-props";
import { nativeGroupRoleProps } from "../ui/native-attribute-props";

export function SettingsSection({
  name,
  title,
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
      {title && <h2 {...auxClassDrawerSectionProps}>{title}</h2>}
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
  searchable = true,
  target,
  compact = false,
  surface = "card",
  layout = "row",
  icon,
  details,
  children,
}: {
  label: string;
  hint?: ReactNode;
  description?: string;
  searchTerms?: readonly string[];
  /** Dynamic library items are indexed through their containing Settings section. */
  searchable?: boolean;
  target?: string;
  compact?: boolean;
  surface?: "card" | "plain";
  layout?: "row" | "feature";
  icon?: ReactNode;
  details?: ReactNode;
  children?: ReactNode;
}) {
  const id = useId();
  const supportingText = hint ?? description;
  return (
    <div
      className={`field ui-setting${compact ? " compact" : ""}${surface === "plain" ? " ui-setting-plain" : ""}${layout === "feature" ? " ui-setting-feature" : ""}`}
      data-setting={searchable ? (target ?? label) : undefined}
      data-settings-field={searchable ? label : undefined}
      data-settings-description={description ?? (typeof hint === "string" ? hint : "")}
      data-settings-terms={JSON.stringify(searchTerms)}
      tabIndex={-1}
      {...nativeGroupRoleProps}
      aria-labelledby={`${id}-label`}
      aria-describedby={supportingText ? `${id}-hint` : undefined}
    >
      {icon && (
        <span className="setting-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span id={`${id}-label`} className="setting-label">
        {label}
      </span>
      {children !== undefined && children !== null && <div className="ui-setting-control">{children}</div>}
      {details && <div className="setting-details">{details}</div>}
      {supportingText && (
        <span id={`${id}-hint`} {...staticHintProps}>
          {supportingText}
        </span>
      )}
    </div>
  );
}
