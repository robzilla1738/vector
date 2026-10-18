import { ModelCapabilitySchema } from "@aux/contracts/model-registry";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  IMAGE_MODELS,
  DEFAULT_IMAGE_MODEL_ID,
  MODEL_PROVIDER_NAMES,
  ModelConnectionStatusSchema,
  ModelProviderSchema,
  type ModelProvider,
  type ModelConnectionStatus,
} from "@aux/contracts";
import { call, toast, errToast } from "../../store";
import { ModelProviderMark } from "../../ui/model-provider";
import { ActionMenu } from "../../ui";
import { useConfirm } from "../../ui/dialog";
import { ModelChoice } from "../../ui/model-choice";
import { SettingsField } from "../primitives";
import { usePreferenceCommand } from "./preference-command";
import {
  useModelControlOwner,
  useModelMountedCommand,
  type ModelControlOwner,
} from "./models-command-controls";
import { staticGrowProps as auxClassGrowProps } from "../../ui/class-props";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

export function ModelConnections({
  settings,
  active,
  disabled,
  onSave,
  onEdit,
  children,
  concise = false,
}: {
  concise?: boolean;
  children?: ReactNode;
  settings: Record<string, unknown>;
  active: boolean;
  disabled: boolean;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
  onEdit(provider: ModelProvider, focus: "model" | "key"): Promise<void>;
}) {
  const parsed = ModelConnectionStatusSchema.array()
    .max(ModelProviderSchema.options.length)
    .safeParse(settings.modelConnections);
  const owner = useModelControlOwner(
    active,
    JSON.stringify([
      settings.modelProvider,
      settings.modelConnections,
      settings.imageModel,
      settings.transcriptionModel,
    ]),
  );
  const reviewOwner = useModelControlOwner(active, "key-removal-review");
  const undoOwner = useModelControlOwner(active, "connection-toggle-undo");
  const connectionSnapshot = JSON.stringify([
    settings.modelProvider,
    parsed.success ? parsed.data : null,
    settings.imageModel,
    settings.transcriptionModel,
  ]);
  const currentConnections = useRef(connectionSnapshot);
  useLayoutEffect(() => {
    currentConnections.current = connectionSnapshot;
  }, [connectionSnapshot]);
  const connectionChanges = useRef(new Map<ModelProvider, object>());
  async function toggleConnection(connection: ModelConnectionStatus) {
    if (!parsed.success || !undoOwner.current()) throw new Error("Choose the current provider connection.");
    const original = undoOwner,
      token = {};
    connectionChanges.current.set(connection.provider, token);
    const enabled = !connection.enabled;
    const expected = JSON.stringify([
      settings.modelProvider,
      parsed.data.map((item) => (item.provider === connection.provider ? { ...item, enabled } : item)),
      settings.imageModel,
      settings.transcriptionModel,
    ]);
    const saved = await onSave({ modelConnection: { provider: connection.provider, enabled } });
    if (!saved || !original.current()) return saved;
    toast(
      `${MODEL_PROVIDER_NAMES[connection.provider]} ${enabled ? "reconnected" : "disconnected"}`,
      "info",
      {
        label: "Undo",
        run: () => {
          void (async () => {
            if (
              !original.current() ||
              connectionChanges.current.get(connection.provider) !== token ||
              currentConnections.current !== expected
            )
              throw new Error(
                "This connection changed after the original action. Review its current settings.",
              );
            connectionChanges.current.delete(connection.provider);
            if (
              !(await onSave({
                modelConnection: { provider: connection.provider, enabled: connection.enabled },
              }))
            )
              throw new Error("The connection change could not be undone.");
          })().catch(errToast);
        },
      },
    );
    return saved;
  }
  const scopeId = useId();
  const [pending, setPending] = useState<ModelControlOwner | null>(null);
  const [failure, setFailure] = useState<{ owner: ModelControlOwner; message: string } | null>(null);
  const busy = pending === owner,
    error = failure?.owner === owner ? failure.message : "";
  const decision = useRef<{
    owner: ModelControlOwner;
    reviewOwner: ModelControlOwner;
    confirm?: () => void;
    cancel?: () => void;
  } | null>(null);
  const [confirmRef, accept] = usePreferenceCommand<HTMLButtonElement>(
    "confirm-model-key-removal",
    scopeId,
    () => {
      if (!owner.current() || decision.current?.owner !== owner || !decision.current.confirm)
        throw new Error("Choose the original key removal review.");
      decision.current.confirm();
    },
  );
  const [cancelRef, cancel] = usePreferenceCommand<HTMLButtonElement>(
    "cancel-model-key-removal",
    scopeId,
    () => {
      if (!reviewOwner.current() || decision.current?.reviewOwner !== reviewOwner || !decision.current.cancel)
        throw new Error("Choose the original key removal review.");
      decision.current.cancel();
    },
  );
  useLayoutEffect(
    () => () => {
      const original = decision.current;
      if (original?.reviewOwner === reviewOwner) original.cancel?.();
    },
    [reviewOwner],
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
  const work = (action: () => Promise<unknown>) =>
    owner.completion(async () => {
      if (disabled || !owner.reserve("connection"))
        throw new Error("Choose the current provider connection.");
      setPending(owner);
      setFailure(null);
      try {
        const result = await action();
        if (result === false && owner.current())
          setFailure({
            owner,
            message:
              "The connection change was not saved. Check the storage or active-task error, then try again.",
          });
        return result;
      } catch (cause) {
        if (owner.current())
          setFailure({
            owner,
            message: cause instanceof Error ? cause.message : "Could not update this connection.",
          });
        throw cause;
      } finally {
        owner.finish("connection");
        if (owner.current()) setPending(null);
      }
    });
  const remove = (connection: ModelConnectionStatus) =>
    work(async () => {
      const original = { owner, reviewOwner };
      decision.current = original;
      const accepted = await confirm({
        title: `Remove ${MODEL_PROVIDER_NAMES[connection.provider]} key?`,
        description:
          "This disconnects the provider in this Profile and removes its saved OS credential. Environment credentials remain unused until you explicitly reconnect. Model choices are kept.",
        confirmLabel: "Remove saved key",
        danger: true,
      });
      if (decision.current === original) decision.current = null;
      if (!accepted) return;
      if (!owner.current()) throw new Error("The original provider connection changed before removal.");
      return onSave({
        modelCredential: { provider: connection.provider, key: "" },
        modelConnection: { provider: connection.provider, enabled: false },
      });
    });
  const [imageRef, chooseImage] = usePreferenceCommand<HTMLSelectElement>(
    "set-image-generation-model",
    scopeId,
    (original) => work(() => onSave({ imageModel: original.value === "off" ? null : original.value })),
  );
  const [voice, setVoice] = useState<{
    owner: ModelControlOwner;
    models: { id: string; name?: string }[];
    available: boolean;
    error?: string;
  } | null>(null);
  useEffect(() => {
    if (!active) return;
    let live = true;
    void call("models.transcription.list", {})
      .then((result) => {
        if (!live || !owner.current()) return;
        const models = ModelCapabilitySchema.array()
          .max(500)
          .parse(result.models)
          .filter((model) => model.transcription?.batch);
        setVoice({ owner, models, available: result.available });
      })
      .catch(() => {
        if (live && owner.current())
          setVoice({
            owner,
            models: [],
            available: false,
            error:
              "Voice model discovery is unavailable. Check the Gateway connection and try reopening Settings.",
          });
      });
    return () => {
      live = false;
    };
  }, [active, owner]);
  const voiceState = voice?.owner === owner ? voice : null;
  const voiceModels = voiceState?.models ?? [];
  const voiceValue = typeof settings.transcriptionModel === "string" ? settings.transcriptionModel : "off";
  const voiceOptions = [{ id: "off", name: "Off" }, ...voiceModels];
  if (voiceValue !== "off" && !voiceOptions.some((model) => model.id === voiceValue))
    voiceOptions.push({ id: voiceValue, name: `${voiceValue} (unavailable)` });
  const voiceHint =
    "Voice attachments use your regular Gateway account. Selecting a model makes no transcription request. Limits: 20 MB, 10 minutes, stereo, 192 kHz. Costs count toward your spending limits and are estimated when the provider omits a price; audio token usage may be unknown.";
  const saveVoice = (id: string) => work(() => onSave({ transcriptionModel: id === "off" ? null : id }));
  const gateway = parsed.success ? parsed.data.find((item) => item.provider === "gateway") : undefined;
  return (
    <>
      <SettingsField
        label="Providers"
        target="Provider connections"
        description="Disconnect stops future requests in this Profile, including environment credentials and localhost. Saved keys and model choices are kept for explicit reconnect. Requests already sent may finish. Remove saved key also disconnects the provider."
        hint={
          concise
            ? ""
            : "Disconnect stops future requests in this Profile, including environment credentials and localhost. Saved keys and model choices are kept for explicit reconnect. Requests already sent may finish. Remove saved key also disconnects the provider."
        }
      >
        {!parsed.success ? (
          <p {...staticHintProps}>Provider management is unavailable until the runtime reconnects.</p>
        ) : (
          parsed.data
            .filter(
              (connection) => connection.provider !== "openai-compatible" || !settings.customModelProviderId,
            )
            .map((connection) => (
              <ProviderConnectionRow
                key={connection.provider}
                connection={connection}
                owner={owner}
                disabled={disabled || busy}
                onEdit={onEdit}
                work={work}
                remove={remove}
                toggleConnection={toggleConnection}
              />
            ))
        )}
        {error && <p {...nativeAlertRoleProps}>{error}</p>}
      </SettingsField>
      {children}
      {concise ? (
        <ModelChoice
          label="Image-generation model"
          hint="Model used to generate and edit images."
          value={String(
            settings.imageModel === undefined ? DEFAULT_IMAGE_MODEL_ID : (settings.imageModel ?? "off"),
          )}
          automaticLabel="Default image model"
          automatic={settings.imageModel === undefined || settings.imageModel === DEFAULT_IMAGE_MODEL_ID}
          options={[
            ...IMAGE_MODELS.map((model) => ({
              id: model.id,
              name: model.label,
              provider: model.id.split("/")[0],
            })),
            { id: "off", name: "Off" },
          ]}
          disabled={!parsed.success || !active}
          pending={disabled || busy}
          loading={false}
          onChange={async (id) => {
            try {
              return (
                (await work(() =>
                  onSave({ imageModel: id === "off" ? null : (id ?? DEFAULT_IMAGE_MODEL_ID) }),
                )) === true
              );
            } catch {
              return false;
            }
          }}
        >
          {!!settings.imageModel && (!gateway?.enabled || gateway.credentialSource === "none") && (
            <p {...staticHintProps}>
              Connect Gateway with a key authorized for this image model before generating an image.
            </p>
          )}
        </ModelChoice>
      ) : (
        <SettingsField
          label="Image-generation model"
          description="Images use your Gateway connection independently of your chat provider. Aux uses the default image model unless you choose another or turn it off. Selecting a model makes no request."
          hint="Images use your Gateway connection independently of your chat provider. Aux uses the default image model unless you choose another or turn it off. Selecting a model makes no request."
        >
          <select
            aria-label="Image-generation model"
            disabled={disabled || busy || !parsed.success}
            value={String(
              settings.imageModel === undefined ? DEFAULT_IMAGE_MODEL_ID : (settings.imageModel ?? "off"),
            )}
            ref={imageRef}
            data-command-id="set-image-generation-model"
            onChange={chooseImage}
          >
            <option value="off">Off</option>
            {IMAGE_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
          {!!settings.imageModel && (!gateway?.enabled || gateway.credentialSource === "none") && (
            <p {...staticHintProps}>
              Connect Gateway with a key authorized for this image model before generating an image.
            </p>
          )}
          {!concise && (
            <p {...staticHintProps}>
              Image requests count toward your spending limits. Usage may be charged; image costs are
              estimated when the provider does not return a price.
            </p>
          )}
        </SettingsField>
      )}
      {concise ? (
        <ModelChoice
          label="Voice-transcription model"
          hint={voiceHint}
          value={voiceValue}
          automaticLabel="Off"
          automatic={voiceValue === "off"}
          options={voiceOptions}
          disabled={!active || !parsed.success}
          pending={disabled || busy}
          loading={!voiceState}
          onChange={async (id) => {
            try {
              return (await saveVoice(id ?? "off")) === true;
            } catch {
              return false;
            }
          }}
        >
          {voiceState?.error && <p {...staticHintProps}>{voiceState.error}</p>}
          {voiceValue !== "off" && !voiceState?.available && (
            <p {...staticHintProps}>
              Voice transcription is unavailable until its Gateway account, batch model and native audio
              decoder are ready. Originals are retained.
            </p>
          )}
        </ModelChoice>
      ) : (
        <SettingsField label="Voice-transcription model" description={voiceHint} hint={voiceHint}>
          <select
            aria-label="Voice-transcription model"
            disabled={disabled || busy || !parsed.success || !voiceState}
            value={voiceValue}
            onChange={(event) => {
              void saveVoice(event.currentTarget.value).catch(errToast);
            }}
          >
            {voiceOptions.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name ?? model.id}
              </option>
            ))}
          </select>
          {voiceState?.error && <p {...staticHintProps}>{voiceState.error}</p>}
          {voiceValue !== "off" && !voiceState?.available && (
            <p {...staticHintProps}>
              Voice transcription is unavailable until its Gateway account, batch model and native audio
              decoder are ready. Originals are retained.
            </p>
          )}
        </SettingsField>
      )}
      {confirmation}
    </>
  );
}

function ProviderConnectionRow({
  connection,
  owner,
  disabled,
  onEdit,
  work,
  remove,
  toggleConnection,
}: {
  connection: ModelConnectionStatus;
  owner: ModelControlOwner;
  disabled: boolean;
  onEdit(provider: ModelProvider, focus: "model" | "key"): Promise<void>;
  work(action: () => Promise<unknown>): Promise<unknown>;
  remove(connection: ModelConnectionStatus): Promise<unknown>;
  toggleConnection(connection: ModelConnectionStatus): Promise<unknown>;
}) {
  const scopeId = useId(),
    activate = useRef<(() => void) | null>(null);
  const [triggerRef, trigger] = useModelMountedCommand("manage-model-provider", scopeId, owner, () => {
    if (!owner.current() || disabled || !activate.current)
      throw new Error("Choose the current provider menu.");
    activate.current();
  });
  const [editRef, edit] = useModelMountedCommand("edit-provider-models", scopeId, owner, () =>
    work(() => onEdit(connection.provider, "model")),
  );
  const [authRef, auth] = useModelMountedCommand("reauthenticate-model-provider", scopeId, owner, () =>
    work(() => onEdit(connection.provider, "key")),
  );
  const [toggleRef, toggle] = useModelMountedCommand("toggle-model-provider-connection", scopeId, owner, () =>
    work(() => toggleConnection(connection)),
  );
  const [removeRef, removeKey] = useModelMountedCommand("remove-saved-model-key", scopeId, owner, () =>
    remove(connection),
  );
  const name = MODEL_PROVIDER_NAMES[connection.provider];
  return (
    <div {...staticRowProps} data-provider={connection.provider}>
      <ModelProviderMark provider={connection.provider} />
      <div {...auxClassGrowProps}>
        <strong>
          {name}
          {connection.selected ? " · Selected" : ""}
        </strong>
        <p {...staticHintProps}>
          {!connection.enabled
            ? "Disconnected"
            : connection.credentialUnavailable
              ? "Saved credential unavailable"
              : connection.credentialSource === "saved"
                ? "Saved key"
                : connection.credentialSource === "environment"
                  ? "Environment key"
                  : connection.localEndpoint
                    ? "Local endpoint"
                    : "No key configured"}
        </p>
      </div>
      <ActionMenu
        label={`Manage ${name}`}
        triggerControl={(node, originalActivate) => {
          triggerRef(node);
          activate.current = node ? originalActivate : null;
        }}
        onTrigger={trigger}
        actions={[
          {
            label: "Set models",
            disabled,
            controlRef: editRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              edit(event);
            },
          },
          {
            label: "Reauthenticate",
            disabled,
            controlRef: authRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              auth(event);
            },
          },
          {
            label: connection.enabled ? "Disconnect" : "Reconnect",
            disabled,
            controlRef: toggleRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              toggle(event);
            },
          },
          {
            label: "Remove saved key",
            danger: true,
            disabled:
              disabled || (connection.credentialSource !== "saved" && !connection.credentialUnavailable),
            controlRef: removeRef,
            onSelect: (event) => {
              if (!event) throw new Error("Choose the original provider control.");
              removeKey(event);
            },
          },
        ]}
      />
    </div>
  );
}
