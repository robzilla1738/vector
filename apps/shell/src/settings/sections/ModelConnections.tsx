import { useRef, useState } from "react";
import {
  IMAGE_MODELS,
  MODEL_PROVIDER_NAMES,
  ModelConnectionStatusSchema,
  type ModelProvider,
} from "@aux/contracts";
import { ActionMenu } from "../../ui";
import { useConfirm } from "../../ui/confirm";
import { SettingsField } from "../primitives";

export function ModelConnections({
  settings,
  disabled,
  onSave,
  onEdit,
}: {
  settings: Record<string, unknown>;
  disabled: boolean;
  onSave(patch: Record<string, unknown>): Promise<boolean>;
  onEdit(provider: ModelProvider, focus: "model" | "key"): Promise<void>;
}) {
  const parsed = ModelConnectionStatusSchema.array().length(5).safeParse(settings.modelConnections);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const busyRef = useRef(false);
  const { confirm, confirmation } = useConfirm();
  const work = async (action: () => Promise<unknown>) => {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      if ((await action()) === false)
        setError(
          "The connection change was not saved. Check the storage or active-task error, then try again.",
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this connection.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const gateway = parsed.success ? parsed.data.find((item) => item.provider === "gateway") : undefined;
  return (
    <>
      <SettingsField
        label="Provider connections"
        hint="Disconnect stops future requests in this Profile, including environment credentials and localhost. Saved keys and model choices are kept for explicit reconnect. Requests already sent may finish. Remove saved key also disconnects the provider."
      >
        {!parsed.success ? (
          <p className="hint">Provider management is unavailable until the runtime reconnects.</p>
        ) : (
          parsed.data.map((connection) => {
            const name = MODEL_PROVIDER_NAMES[connection.provider];
            return (
              <div className="row" key={connection.provider} data-provider={connection.provider}>
                <div className="grow">
                  <strong>
                    {name}
                    {connection.selected ? " · Selected" : ""}
                  </strong>
                  <p className="hint">
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
                  actions={[
                    {
                      label: "Set models",
                      disabled: disabled || busy,
                      onSelect: () => void work(() => onEdit(connection.provider, "model")),
                    },
                    {
                      label: "Reauthenticate",
                      disabled: disabled || busy,
                      onSelect: () => void work(() => onEdit(connection.provider, "key")),
                    },
                    {
                      label: connection.enabled ? "Disconnect" : "Reconnect",
                      disabled: disabled || busy,
                      onSelect: () =>
                        void work(() =>
                          onSave({
                            modelConnection: { provider: connection.provider, enabled: !connection.enabled },
                          }),
                        ),
                    },
                    {
                      label: "Remove saved key",
                      danger: true,
                      disabled:
                        disabled ||
                        busy ||
                        (connection.credentialSource !== "saved" && !connection.credentialUnavailable),
                      onSelect: () =>
                        void work(async () => {
                          if (
                            !(await confirm({
                              title: `Remove ${name} key?`,
                              description:
                                "This disconnects the provider in this Profile and removes its saved OS credential. Environment credentials remain unused until you explicitly reconnect. Model choices are kept.",
                              confirmLabel: "Remove saved key",
                              danger: true,
                            }))
                          )
                            return;
                          return onSave({
                            modelCredential: { provider: connection.provider, key: "" },
                            modelConnection: { provider: connection.provider, enabled: false },
                          });
                        }),
                    },
                  ]}
                />
              </div>
            );
          })
        )}
        {error && <p role="alert">{error}</p>}
      </SettingsField>
      <SettingsField
        label="Image-generation model"
        hint="Off until you choose a model. Images use the Gateway connection and send the image prompt to Google through Gateway, independently of your chat provider. Selecting a model makes no request. One image is requested with no model fallback; provider usage may be charged."
      >
        <select
          aria-label="Image-generation model"
          disabled={disabled || busy || !parsed.success}
          value={String(settings.imageModel ?? "off")}
          onChange={(event) => {
            const value = event.target.value;
            void work(() => onSave({ imageModel: value === "off" ? null : value }));
          }}
        >
          <option value="off">Off</option>
          {IMAGE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
        {!!settings.imageModel && (!gateway?.enabled || gateway.credentialSource === "none") && (
          <p className="hint">
            Connect Gateway with a key authorized for this image model before generating an image.
          </p>
        )}
        <p className="hint">
          Image generation is unavailable while a run, day or routine spend cap is set. Image spend is
          recorded separately and is not yet included in Usage totals.
        </p>
      </SettingsField>
      {confirmation}
    </>
  );
}
