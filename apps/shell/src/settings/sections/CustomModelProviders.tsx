import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  CustomModelProviderSchema,
  parseCustomModelProviderImport,
  type CustomModelProvider,
} from "@aux/contracts";
import { ActionMenu } from "../../ui";
import { Dialog, useConfirm } from "../../ui/dialog";
import { ModelProviderMark } from "../../ui/model-provider";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { staticGrowProps, staticHintProps, staticRowProps } from "../../ui/class-props";
import { SettingsField } from "../primitives";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import {
  useModelControlOwner,
  useModelMountedCommand,
  type ModelControlOwner,
} from "./models-command-controls";
import "./CustomModelProviders.css";

function providerJson(provider: CustomModelProvider): string {
  return JSON.stringify(
    {
      providers: {
        [provider.id]: {
          name: provider.name,
          api: provider.api,
          baseUrl: provider.baseUrl,
          authHeader: provider.authHeader,
          enabled: provider.enabled,
          models: provider.models.map((model) => ({
            id: model.id,
            name: model.name,
            contextWindow: model.contextTokens,
            maxTokens: model.maxOutputTokens,
            input: model.modalities,
            reasoning: model.reasoning === undefined ? undefined : model.reasoning !== "none",
            cost:
              model.inputUsdPerMTok !== undefined && model.outputUsdPerMTok !== undefined
                ? { input: model.inputUsdPerMTok, output: model.outputUsdPerMTok }
                : undefined,
          })),
        },
      },
    },
    null,
    2,
  );
}
const example = providerJson(
  CustomModelProviderSchema.parse({
    id: "my-provider",
    name: "My Provider",
    api: "openai-completions",
    baseUrl: "https://example.com/v1",
    models: [
      {
        id: "my-model",
        name: "My Model",
        modalities: ["text"],
        contextTokens: 128000,
        maxOutputTokens: 16384,
        source: "configured",
      },
    ],
  }),
);

export function CustomModelProviders({
  settings,
  active,
  disabled,
  onSave,
}: {
  settings: Record<string, unknown>;
  active: boolean;
  disabled: boolean;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
}) {
  const providers = useMemo(() => {
    const parsed = CustomModelProviderSchema.array().safeParse(settings.customModelProviders ?? []);
    return parsed.success ? parsed.data : [];
  }, [settings.customModelProviders]);
  const scopeId = useId();
  const owner = useModelControlOwner(active, `custom-providers:${String(settings.modelConnectionRevision)}`);
  const [dialog, setDialog] = useState<{ owner: ModelControlOwner; editing?: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<ModelControlOwner | null>(null);
  const [failure, setFailure] = useState<{ owner: ModelControlOwner; message: string } | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const decision = useRef<{ owner: ModelControlOwner; confirm?: () => void; cancel?: () => void } | null>(
    null,
  );
  const [confirmRef, accept] = usePreferenceCommand<HTMLButtonElement>(
    "confirm-custom-model-provider-removal",
    scopeId,
    () => {
      if (!owner.current() || decision.current?.owner !== owner || !decision.current.confirm)
        throw new Error("Choose the current provider removal review.");
      decision.current.confirm();
    },
  );
  const [cancelRef, cancel] = usePreferenceCommand<HTMLButtonElement>(
    "cancel-custom-model-provider-removal",
    scopeId,
    () => {
      if (!owner.current() || decision.current?.owner !== owner || !decision.current.cancel)
        throw new Error("Choose the current provider removal review.");
      decision.current.cancel();
    },
  );
  const { confirm, confirmation } = useConfirm({
    confirmControl: (node, settle) => {
      confirmRef(node);
      if (decision.current) decision.current.confirm = settle;
    },
    cancelControl: (node, settle) => {
      cancelRef(node);
      if (decision.current) decision.current.cancel = settle;
    },
    onConfirm: accept,
    onCancel: cancel,
  });
  const busy = pending === owner;
  const unavailable = disabled || busy || !active || typeof settings.modelConnectionRevision !== "string";
  const close = () => {
    if (!busy) {
      setDialog(null);
      setDraft("");
      setFailure(null);
    }
  };
  useLayoutEffect(() => {
    setDialog(null);
    setDraft("");
    setFailure(null);
    return () => {
      if (decision.current?.owner === owner) {
        decision.current.cancel?.();
        decision.current = null;
      }
    };
  }, [owner]);
  const work = (action: () => Promise<unknown>) =>
    owner.completion(async () => {
      if (unavailable || !owner.reserve("custom-provider"))
        throw new Error("Choose the current custom provider connection.");
      setPending(owner);
      setFailure(null);
      try {
        const result = await action();
        if (result === false && owner.current())
          setFailure({
            owner,
            message: "The provider was not saved. Check the connection or active-task error and try again.",
          });
        return result;
      } catch (error) {
        if (owner.current())
          setFailure({
            owner,
            message: error instanceof Error ? error.message : "Could not save this provider.",
          });
        throw error;
      } finally {
        owner.finish("custom-provider");
        if (owner.current()) setPending(null);
      }
    });
  const edit = (provider?: CustomModelProvider) => {
    if (unavailable || !owner.current()) return;
    setDraft(provider ? providerJson(provider) : "");
    setFailure(null);
    setDialog({ owner, editing: provider?.id });
  };
  const save = () =>
    work(async () => {
      let input: unknown;
      try {
        input = JSON.parse(draft);
      } catch {
        throw new Error("Enter valid provider JSON.");
      }
      let imported: ReturnType<typeof parseCustomModelProviderImport>;
      try {
        imported = parseCustomModelProviderImport(input);
      } catch (error) {
        if (error instanceof z.ZodError)
          throw new Error(error.issues[0]?.message ?? "Check the provider configuration.");
        throw error;
      }
      if (dialog?.editing && imported.provider.id !== dialog.editing)
        throw new Error("Keep this provider's id when editing. Add a new provider to use another id.");
      const patch: Record<string, unknown> = { customModelProvider: imported.provider };
      if (!dialog?.editing)
        Object.assign(patch, {
          customModelProviderId: imported.provider.id,
          modelConnection: { provider: "openai-compatible", enabled: imported.provider.enabled },
        });
      if (imported.apiKey !== undefined)
        patch.modelCredential = {
          provider: "openai-compatible",
          connectionId: imported.provider.id,
          key: imported.apiKey,
        };
      const saved = await onSave(patch);
      if (saved && owner.current()) {
        setDraft("");
        setDialog(null);
      }
      return saved;
    });
  const remove = (provider: CustomModelProvider) =>
    work(async () => {
      const original = { owner };
      decision.current = original;
      const accepted = await confirm({
        title: `Remove ${provider.name}?`,
        description:
          "This removes its configuration and saved key from this Profile. Active tasks must be stopped first.",
        confirmLabel: "Remove provider",
        danger: true,
      });
      if (decision.current === original) decision.current = null;
      if (!accepted) return;
      if (!owner.current())
        throw new Error("This provider changed. Review its current configuration before removing it.");
      return onSave({ removeCustomModelProviderId: provider.id });
    });
  return (
    <>
      <SettingsField
        label="Custom providers"
        hint="Connect named providers with their own endpoint, key and models."
      >
        {providers.map((provider) => (
          <CustomProviderRow
            key={provider.id}
            provider={provider}
            owner={owner}
            disabled={unavailable}
            selected={
              settings.modelProvider === "openai-compatible" && settings.customModelProviderId === provider.id
            }
            edit={() => edit(provider)}
            remove={() => remove(provider)}
            select={() =>
              work(() =>
                onSave({
                  customModelProvider: { ...provider, enabled: true },
                  customModelProviderId: provider.id,
                  modelConnection: { provider: "openai-compatible", enabled: true },
                }),
              )
            }
            toggle={() =>
              work(() => onSave({ customModelProvider: { ...provider, enabled: !provider.enabled } }))
            }
          />
        ))}
        <div {...staticRowProps}>
          <PreferenceAction
            {...smallButtonProps}
            command="add-custom-model-provider"
            scopeId={scopeId}
            disabled={unavailable}
            invoke={() => edit()}
          >
            Add custom provider
          </PreferenceAction>
          {!!settings.customModelProviderId && (
            <PreferenceAction
              {...smallGhostButtonProps}
              command="use-manual-model-endpoint"
              scopeId={scopeId}
              disabled={unavailable}
              invoke={() =>
                work(() => onSave({ customModelProviderId: null, modelProvider: "openai-compatible" }))
              }
            >
              Use a compatible endpoint
            </PreferenceAction>
          )}
        </div>
        {failure?.owner === owner && dialog?.owner !== owner && <p role="alert">{failure.message}</p>}
      </SettingsField>
      {dialog?.owner === owner && (
        <Dialog
          label={dialog.editing ? "Edit custom provider" : "Add custom provider"}
          onClose={close}
          initialFocusRef={editor}
          className="aux-dialog-surface popup-material custom-model-provider-dialog"
        >
          <h3>{dialog.editing ? "Edit custom provider" : "Connect a custom provider"}</h3>
          <p {...staticHintProps}>
            Paste one provider configuration. Leave apiKey out to keep the saved key for this endpoint.
          </p>
          <label htmlFor={`${scopeId}-json`}>Provider JSON</label>
          <textarea
            id={`${scopeId}-json`}
            ref={editor}
            className="field-input custom-provider-json"
            aria-label="Provider JSON"
            value={draft}
            placeholder={example}
            spellCheck={false}
            autoComplete="off"
            maxLength={1000000}
            disabled={busy}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
          {failure?.owner === owner && <p role="alert">{failure.message}</p>}
          <div className="custom-provider-dialog-actions">
            <PreferenceAction
              {...smallGhostButtonProps}
              command="cancel-custom-model-provider"
              scopeId={scopeId}
              disabled={busy}
              invoke={close}
            >
              Cancel
            </PreferenceAction>
            <PreferenceAction
              {...smallButtonProps}
              command="save-custom-model-provider"
              scopeId={scopeId}
              disabled={busy || !draft.trim()}
              invoke={save}
            >
              {busy ? "Saving…" : "Save"}
            </PreferenceAction>
          </div>
        </Dialog>
      )}
      {confirmation}
    </>
  );
}

function CustomProviderRow({
  provider,
  owner,
  disabled,
  selected,
  edit,
  select,
  toggle,
  remove,
}: {
  provider: CustomModelProvider;
  owner: ModelControlOwner;
  disabled: boolean;
  selected: boolean;
  edit(): void;
  select(): unknown;
  toggle(): unknown;
  remove(): unknown;
}) {
  const scopeId = useId(),
    activate = useRef<(() => void) | null>(null);
  const [triggerRef, trigger] = useModelMountedCommand("manage-custom-model-provider", scopeId, owner, () => {
    if (disabled || !activate.current) throw new Error("Choose the current provider menu.");
    activate.current();
  });
  const [editRef, editAction] = useModelMountedCommand("edit-custom-model-provider", scopeId, owner, edit);
  const [toggleRef, toggleAction] = useModelMountedCommand(
    "toggle-custom-model-provider",
    scopeId,
    owner,
    toggle,
  );
  const [removeRef, removeAction] = useModelMountedCommand(
    "remove-custom-model-provider",
    scopeId,
    owner,
    remove,
  );
  return (
    <div {...staticRowProps} data-custom-provider={provider.id}>
      <ModelProviderMark provider={provider.id} />
      <div {...staticGrowProps}>
        <strong>
          {provider.name}
          {selected ? " · Selected" : ""}
        </strong>
        <p {...staticHintProps}>{provider.enabled ? provider.baseUrl : "Disconnected"}</p>
      </div>
      <PreferenceAction
        {...smallGhostButtonProps}
        command="select-custom-model-provider"
        scopeId={scopeId}
        disabled={disabled || (selected && provider.enabled)}
        invoke={select}
      >
        Use
      </PreferenceAction>
      <ActionMenu
        label={`Manage ${provider.name}`}
        triggerControl={(node, original) => {
          triggerRef(node);
          activate.current = node ? original : null;
        }}
        onTrigger={trigger}
        actions={[
          {
            label: "Edit configuration",
            disabled,
            controlRef: editRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              editAction(event);
            },
          },
          {
            label: provider.enabled ? "Disconnect" : "Reconnect",
            disabled,
            controlRef: toggleRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              toggleAction(event);
            },
          },
          {
            label: "Remove provider",
            danger: true,
            disabled,
            controlRef: removeRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              removeAction(event);
            },
          },
        ]}
      />
    </div>
  );
}
