import { useCallback, useRef, useState, type ReactNode } from "react";
import { ModelProviderMark, modelProviderName } from "./model-provider";
import { Popover } from "./popover";
import { Check, ChevronDown, Search } from "./icons";
import { ActionMenu, type MenuAction } from "./index";
import { ModelProviderMenu } from "../composer/ModelProviderMenu";
import { moveListFocus } from "../keyboard-list";
import { SettingsField } from "../settings/primitives";
import "../composer/ComposerModelPicker.css";
import "../settings/sections/ModelsOverview.css";

export type ModelOption = { id: string; name?: string; provider?: string; textGeneration?: boolean };

export function ModelChoice({
  label,
  hint,
  value,
  automatic,
  automaticLabel = "Automatic",
  options,
  disabled,
  pending = false,
  loading,
  onChange,
  actions,
  children,
}: {
  label: string;
  hint: string;
  value: string;
  automatic?: boolean;
  automaticLabel?: string;
  options: ModelOption[];
  disabled: boolean;
  pending?: boolean;
  loading: boolean;
  onChange(value: string | undefined): Promise<boolean>;
  actions?: MenuAction[];
  children?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const attachTrigger = useCallback((node: HTMLButtonElement | null) => {
    trigger.current = node;
  }, []);
  const [providerOpen, setProviderOpen] = useState<string | null>(null);
  const selected = options.find((model) => model.id === value);
  const name = selected?.name ?? value.split("/").at(-1) ?? "Choose model";
  const matched = options.filter((model) =>
    `${model.id} ${model.name ?? ""} ${modelProviderName(model.provider ?? "")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const groups = new Map<string, ModelOption[]>();
  for (const model of matched) {
    const group = model.provider ?? "";
    groups.set(group, [...(groups.get(group) ?? []), model]);
  }
  const modelRows = (models: ModelOption[], close: () => void, root: boolean) =>
    models.map((model) => (
      <button
        type="button"
        key={model.id}
        disabled={disabled || pending}
        role="menuitemradio"
        data-model-root={root ? "" : undefined}
        aria-checked={!automatic && value === model.id}
        onClick={() =>
          void onChange(model.id).then((ok) => {
            if (ok) {
              setProviderOpen(null);
              close();
            }
          })
        }
      >
        <ModelProviderMark provider={model.provider} />
        <span>{model.name ?? model.id}</span>
        {!automatic && value === model.id && <Check />}
      </button>
    ));
  const control = (close: () => void): ReactNode => (
    <div
      className="settings-model-picker model-choice-picker"
      onKeyDown={(event) => {
        if (event.target === search.current) {
          if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
          event.preventDefault();
          const choices = event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "[data-model-root]:not(:disabled)",
          );
          (event.key === "ArrowDown" ? choices[0] : choices[choices.length - 1])?.focus();
          return;
        }
        moveListFocus(event, "[data-model-root]:not(:disabled)");
      }}
    >
      <label className="settings-model-search" data-input-surface>
        <Search />
        <input
          ref={search}
          aria-label={`Search models for ${label.toLowerCase()}`}
          placeholder="Search models"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setProviderOpen(null);
          }}
        />
      </label>
      <div className="settings-model-options" role="menu" aria-label={`${label} models`}>
        {loading && <p>Loading models…</p>}
        {!loading && !matched.length && <p>No matching models. Use Model settings to enter a model ID.</p>}
        {[...groups].map(([group, models]) =>
          group && !query.trim() ? (
            <ModelProviderMenu
              key={group}
              menuAnchor={trigger}
              provider={group}
              label={modelProviderName(group)}
              open={providerOpen === group}
              onOpen={() => setProviderOpen(group)}
              onClose={() => setProviderOpen(null)}
            >
              {modelRows(models, close, false)}
            </ModelProviderMenu>
          ) : (
            <div key={group}>{modelRows(models, close, true)}</div>
          ),
        )}
        {automatic !== undefined && (
          <button
            className="model-choice-default"
            type="button"
            data-model-root
            role="menuitemradio"
            aria-checked={automatic}
            disabled={disabled || pending}
            onClick={() =>
              void onChange(undefined).then((ok) => {
                if (ok) close();
              })
            }
          >
            {automaticLabel} {automatic && <Check />}
          </button>
        )}
      </div>
    </div>
  );
  return (
    <SettingsField compact label={label} hint={hint}>
      <div className="settings-model-control">
        <Popover
          label={`${label} selection`}
          triggerControl={attachTrigger}
          align="end"
          className="settings-model-trigger"
          disabled={disabled}
          initialFocusRef={search}
          trigger={
            <>
              <ModelProviderMark provider={selected?.provider} />
              <span title={name || "Choose model"}>{name || "Choose model"}</span>
              <ChevronDown />
            </>
          }
        >
          {control}
        </Popover>
        {actions?.length ? <ActionMenu label={`${label} options`} actions={actions} /> : null}
      </div>
      {children}
    </SettingsField>
  );
}
