import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MODEL_PROVIDER_NAMES, type ModelCapability } from "@aux/contracts";
import { Menu } from "../ui/dialog";
import { shellIconCheck, shellIconDown, shellIconSearch, shellIconOpen } from "../ui/icons";
import "./ComposerModelPicker.css";
import { ModelProviderMenu } from "./ModelProviderMenu";
import { moveMenuFocus } from "../keyboard-list";

const PROVIDER_NAMES: Record<string, string> = { ...MODEL_PROVIDER_NAMES, meta: "Meta", alibaba: "Alibaba" };

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
  onSettings,
  label = "Composer model",
}: {
  models: readonly ModelCapability[];
  modelId?: string;
  selectedModel?: ModelCapability;
  unsupported: boolean;
  disabled: boolean;
  loading: boolean;
  error?: string;
  label?: string;
  onSettings?(): void;
  onRequest?(): void;
  onRetry(): void;
  onChange(modelId: string | undefined): void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [providerOpen, setProviderOpen] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
    setQuery("");
    setProviderOpen(null);
  };
  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setQuery("");
      setProviderOpen(null);
    }
  }, [disabled]);
  const providerName = (provider: string) => PROVIDER_NAMES[provider] ?? provider;
  const filter = query.trim().toLocaleLowerCase();
  const matches = (text: string) => !filter || text.toLocaleLowerCase().includes(filter);
  const visible = models.filter((model) =>
    matches(`${model.name ?? ""} ${model.id} ${providerName(model.provider ?? "")}`),
  );
  const groups = new Map<string, ModelCapability[]>();
  for (const model of visible) {
    const provider = model.provider ?? "Models";
    const entries = groups.get(provider) ?? [];
    entries.push(model);
    groups.set(provider, entries);
  }
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
    const items = menu.current?.querySelectorAll<HTMLButtonElement>("[data-model-root]:not(:disabled)");
    (event.key === "ArrowDown" ? items?.[0] : items?.[items.length - 1])?.focus();
  }
  const modelRows = (entries: ModelCapability[], root: boolean) =>
    entries.map((model) => (
      <button
        key={model.id}
        type="button"
        value={model.id}
        role="menuitemradio"
        data-model-root={root ? "" : undefined}
        aria-checked={modelId === model.id}
        title={model.name ? `${model.name} · ${model.id}` : model.id}
        onClick={() => choose(model.id)}
      >
        <span>{model.name ?? model.id}</span>
        {modelId === model.id && shellIconCheck}
      </button>
    ));
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="composer-model-picker-trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        title={selectedModel?.name ?? modelId ?? "Automatic"}
        disabled={disabled}
        onClick={() => {
          if (open) close();
          else {
            onRequest?.();
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
          placement="auto-end"
          onClose={close}
          onMenuKeyDown={(event) => {
            moveMenuFocus(event, "[data-model-root]");
            if (event.defaultPrevented) setProviderOpen(null);
          }}
        >
          <div className="composer-model-search" data-input-surface>
            {shellIconSearch}
            <input
              ref={search}
              type="search"
              aria-label="Search models"
              placeholder="Search models"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setProviderOpen(null);
              }}
              onKeyDown={searchKey}
            />
          </div>
          <div className="composer-model-list" aria-busy={loading}>
            {showAutomatic && (
              <button
                data-model-root
                onMouseEnter={() => setProviderOpen(null)}
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
              <button
                type="button"
                value={modelId}
                role="menuitemradio"
                data-model-root
                aria-checked="true"
                disabled
              >
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
                <button type="button" role="menuitem" data-model-root onClick={onRetry}>
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && !visible.length && (
              <p role="status">{filter ? "No matching models" : "No models are available"}</p>
            )}
            {[...groups].map(([provider, entries]) =>
              !filter && provider !== "Models" ? (
                <ModelProviderMenu
                  key={provider}
                  label={providerName(provider)}
                  open={providerOpen === provider}
                  onOpen={() => setProviderOpen(provider)}
                  onClose={() => setProviderOpen(null)}
                >
                  {modelRows(entries, false)}
                </ModelProviderMenu>
              ) : (
                <div key={provider} role="group" aria-label={providerName(provider)}>
                  {filter && provider !== "Models" && (
                    <p className="composer-model-provider">{providerName(provider)}</p>
                  )}
                  {modelRows(entries, true)}
                </div>
              ),
            )}
          </div>
          {onSettings && (
            <button
              type="button"
              role="menuitem"
              data-model-root
              className="composer-model-settings"
              onMouseEnter={() => setProviderOpen(null)}
              onClick={() => {
                close();
                onSettings();
              }}
            >
              <span>Settings</span>
              {shellIconOpen}
            </button>
          )}
        </Menu>
      )}
    </>
  );
}
