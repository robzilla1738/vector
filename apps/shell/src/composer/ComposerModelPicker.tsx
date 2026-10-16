import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { ModelCapability } from "@aux/contracts";
import { Menu } from "../ui/dialog";
import { shellIconCheck, shellIconDown, shellIconSearch } from "../ui/icons";
import "./ComposerModelPicker.css";

/** Presentation only; RunOptions owns the catalog and validates every selection. */
export function ComposerModelPicker({
  models,
  modelId,
  selectedModel,
  unsupported,
  disabled,
  loading,
  error,
  onRequest,
  onRetry,
  onChange,
}: {
  models: readonly ModelCapability[];
  modelId?: string;
  selectedModel?: ModelCapability;
  unsupported: boolean;
  disabled: boolean;
  loading: boolean;
  error?: string;
  onRequest(): void;
  onRetry(): void;
  onChange(modelId: string | undefined): void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setQuery("");
    }
  }, [disabled]);
  const filter = query.trim().toLocaleLowerCase();
  const matches = (text: string) => !filter || text.toLocaleLowerCase().includes(filter);
  const visible = models.filter((model) =>
    matches(`${model.name ?? ""} ${model.id} ${model.provider ?? ""}`),
  );
  const groups = new Map<string, ModelCapability[]>();
  for (const model of visible) {
    const provider = model.provider ?? "Models";
    const entries = groups.get(provider) ?? [];
    entries.push(model);
    groups.set(provider, entries);
  }
  const grouped = new Set(models.map((model) => model.provider ?? "Models")).size > 1;
  const absent = !!modelId && !models.some((model) => model.id === modelId);
  const absentName = selectedModel?.name ?? modelId ?? "";
  const showAbsent = absent && matches(`${absentName} ${modelId}`);
  const showAutomatic = matches("Automatic");
  const choose = (value: string | undefined) => {
    if (disabled) return;
    onChange(value);
    close();
  };
  function searchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.key === "Escape" || event.key === "Tab") return;
    event.stopPropagation();
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)');
    (event.key === "ArrowDown" ? items?.[0] : items?.[items.length - 1])?.focus();
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="composer-model-picker-trigger"
        aria-label="Composer model"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        title={selectedModel?.name ?? modelId ?? "Automatic"}
        disabled={disabled}
        onClick={() => {
          if (open) close();
          else {
            onRequest();
            setOpen(true);
          }
        }}
      >
        <span>{selectedModel?.name ?? modelId ?? "Automatic"}</span>
        {shellIconDown}
      </button>
      {open && !disabled && (
        <Menu
          id={id}
          label="Choose a model"
          className="composer-model-picker"
          anchor={trigger}
          returnFocus={trigger}
          initialFocusRef={search}
          menuRef={menu}
          placement="above-end"
          onClose={close}
        >
          <div className="composer-model-search" data-input-surface>
            {shellIconSearch}
            <input
              ref={search}
              type="search"
              aria-label="Search models"
              placeholder="Search models"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={searchKey}
            />
          </div>
          <div className="composer-model-list" aria-busy={loading}>
            {showAutomatic && (
              <button
                type="button"
                value=""
                role="menuitemradio"
                aria-checked={!modelId}
                onClick={() => choose(undefined)}
              >
                <span>Automatic</span>
                {!modelId && shellIconCheck}
              </button>
            )}
            {showAbsent && (
              <button type="button" value={modelId} role="menuitemradio" aria-checked="true" disabled>
                <span>
                  {absentName}
                  <small>
                    {unsupported
                      ? "Not supported for chat"
                      : loading
                        ? "Current selection"
                        : "Not listed in this catalog"}
                  </small>
                </span>
                {shellIconCheck}
              </button>
            )}
            {loading && <p role="status">Loading models…</p>}
            {error && (
              <div className="composer-model-error">
                <p role="alert">Model catalog unavailable: {error}</p>
                <button type="button" role="menuitem" onClick={onRetry}>
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && !visible.length && (
              <p role="status">{filter ? "No matching models" : "No models are available"}</p>
            )}
            {[...groups].map(([provider, entries]) => (
              <div key={provider} role="group" aria-label={grouped ? provider : "Models"}>
                {grouped && <p className="composer-model-provider">{provider}</p>}
                {entries.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    value={model.id}
                    role="menuitemradio"
                    aria-checked={modelId === model.id}
                    title={model.name ? `${model.name} · ${model.id}` : model.id}
                    onClick={() => choose(model.id)}
                  >
                    <span>{model.name ?? model.id}</span>
                    {modelId === model.id && shellIconCheck}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Menu>
      )}
    </>
  );
}
