import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChannelProvider, ChannelSaveParams, MethodResult, Workspace } from "@aux/contracts";
import { bridge, inNativeHost, inMock } from "../../bridge";
import { call } from "../../store";
import { ActionMenu, SettingsGroup, Switch } from "../../ui";
import { shellIconGearSm, shellIconPlusSm } from "../../ui/icons";
import { SettingsField, SettingsSection } from "../primitives";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import { useSettingsStatusOwner } from "./use-settings-status-owner";
import { ChannelMark, channelLabels } from "./ChannelMark";
import { ChannelEditor } from "./ChannelEditor";
import "./Channels.css";

export type ChannelStatus = MethodResult<"channels.save">;
type Snapshot = { connections: ChannelStatus[]; workspaces: Workspace[] };
const errorLabels = {
  authentication: "Reconnect credentials",
  scope: "Review bot permissions",
  identity: "Bot identity changed",
  webhook: "An existing webhook owns this bot",
  rate_limited: "Waiting for messenger rate limit",
  network: "Messenger unavailable",
  invalid_response: "Messenger returned an invalid response",
  delivery_unknown: "Reply needs review",
  runtime: "Open Aux to review this connection",
} as const;

export function ChannelsSettings({ active }: { active: boolean }) {
  return (
    <SettingsSection name="Channels" hidden={!active} className="channels-settings">
      <SettingsField
        layout="feature"
        label="Aux, anywhere"
        target="Messenger connections"
        hint="Control Aux from Slack, Discord or Telegram to work remotely or build a chatbot for your team."
        searchTerms={["Channels", "Slack", "Discord", "Telegram", "pairing", "messengers"]}
        details={
          <img
            className="setting-illustration"
            src="/settings/channels.webp"
            width={288}
            height={160}
            alt=""
            loading="lazy"
            decoding="async"
          />
        }
      />
      {active && (inNativeHost || inMock) && !bridge.privateMode && bridge.windowKind === "normal" ? (
        <ChannelConnections key={bridge.windowId} />
      ) : (
        active && <p className="hint">Manage channels in a normal Aux desktop window.</p>
      )}
    </SettingsSection>
  );
}

function ChannelConnections() {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => ({ windowId, privateMode }), [windowId, privateMode]);
  const admitted = useCallback(() => !bridge.privateMode && bridge.windowKind === "normal", []);
  const [getOwner, current, snapshot, busy, error, read, change, fail] = useSettingsStatusOwner<Snapshot>(
    identity,
    windowId,
    privateMode,
    admitted,
  );
  const [dialog, setDialog] = useState<{
    provider: ChannelProvider;
    editing?: ChannelStatus;
    owner: ReturnType<typeof getOwner>;
  } | null>(null);
  const dialogRef = useRef(dialog);
  useLayoutEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);
  const scope = useId();
  const load = useCallback(async (): Promise<Snapshot> => {
    const [connections, workspaces] = await Promise.all([
      call("channels.list", {}),
      call("workspaces.list", {}),
    ]);
    return { connections, workspaces };
  }, []);
  const reload = useCallback(() => {
    const owner = getOwner();
    if (current(owner) && !owner.pending)
      read(owner, load, (value) => {
        fail(owner, "");
        return value;
      });
  }, [getOwner, current, read, load, fail]);
  useEffect(() => {
    reload();
    const stop = bridge.onEvent((event) => {
      if (event.type === "channels.changed") reload();
    });
    const status = bridge.onRuntimeStatus(() => reload());
    return () => {
      stop();
      status();
    };
  }, [reload]);
  const perform = async (action: () => Promise<unknown>) => {
    const owner = getOwner();
    if (!current(owner) || owner.pending) throw new Error("Choose the current channel control.");
    return change(
      owner,
      async () => {
        await action();
        if (!current(owner)) throw new Error("The original channel window retired.");
        return load();
      },
      (value) => value,
    );
  };
  const open = (provider: ChannelProvider, editing?: ChannelStatus) => {
    const owner = getOwner();
    if (current(owner) && !owner.pending) setDialog({ provider, editing, owner });
  };
  const close = () => {
    if (!busy) {
      setDialog(null);
      reload();
    }
  };
  return (
    <>
      <SettingsGroup title="Messengers">
        {snapshot?.connections.map((connection) => (
          <ChannelRow
            key={connection.connectionId}
            connection={connection}
            busy={busy}
            onManage={() => open(connection.provider, connection)}
            onToggle={(enabled) =>
              perform(() =>
                call("channels.save", {
                  connectionId: connection.connectionId,
                  expectedRevision: connection.revision,
                  provider: connection.provider,
                  name: connection.name,
                  workspaceId: connection.workspaceId,
                  enabled,
                  options: connection.options,
                }),
              )
            }
          />
        ))}
        <div className="channels-add-row">
          <AddChannel disabled={busy || !snapshot} onAdd={(provider) => open(provider)} />
        </div>
      </SettingsGroup>
      {!snapshot && !error && (
        <p className="hint" role="status">
          Loading messengers…
        </p>
      )}
      {error && (
        <div className="channels-error" role="alert">
          <p>{error}</p>
          <PreferenceAction
            className="btn sm"
            command="reload-channel-settings"
            scopeId={scope}
            invoke={reload}
          >
            Reload
          </PreferenceAction>
        </div>
      )}
      {dialog && current(dialog.owner) && snapshot && (
        <ChannelEditor
          key={`${dialog.editing?.connectionId ?? dialog.provider}:${dialog.editing?.revision ?? "new"}`}
          provider={dialog.provider}
          connection={dialog.editing}
          workspaces={snapshot.workspaces}
          busy={busy}
          onClose={close}
          onSave={async (input: ChannelSaveParams) => {
            const original = dialog;
            await perform(() => call("channels.save", input));
            if (current(original.owner) && dialogRef.current === original) setDialog(null);
          }}
          onAction={perform}
          onRemoved={() => {
            if (dialogRef.current === dialog) setDialog(null);
          }}
        />
      )}
    </>
  );
}

function AddChannel({ disabled, onAdd }: { disabled: boolean; onAdd(provider: ChannelProvider): void }) {
  const scope = useId(),
    activate = useRef<() => void>(() => {});
  const [control, trigger] = usePreferenceCommand<HTMLButtonElement>("add-channel", scope, () =>
    activate.current(),
  );
  return (
    <ActionMenu
      label="Add messenger"
      triggerControl={(node, toggle) => {
        control(node);
        activate.current = toggle;
      }}
      onTrigger={trigger}
      actions={(["slack", "telegram", "discord"] as const).map((provider) => ({
        label: channelLabels[provider],
        icon: <ChannelMark provider={provider} />,
        disabled,
        onSelect: () => onAdd(provider),
      }))}
    >
      {shellIconPlusSm}
      <span>Add</span>
    </ActionMenu>
  );
}

function ChannelRow({
  connection,
  busy,
  onManage,
  onToggle,
}: {
  connection: ChannelStatus;
  busy: boolean;
  onManage(): void;
  onToggle(enabled: boolean): Promise<unknown>;
}) {
  const scope = useId();
  const [control, toggle] = usePreferenceCommand<HTMLInputElement>("toggle-channel", scope, (input) =>
    onToggle(input.checked),
  );
  const status = !connection.enabled
    ? "Disabled"
    : connection.errorCode
      ? errorLabels[connection.errorCode]
      : connection.status === "connected"
        ? "Connected"
        : connection.status === "connecting"
          ? "Connecting…"
          : "Offline";
  return (
    <SettingsField
      label={connection.name}
      icon={<ChannelMark provider={connection.provider} />}
      searchable={false}
      hint={
        connection.uncertainDeliveries
          ? `${status} · ${connection.uncertainDeliveries} replies need review`
          : `${status} · ${connection.options.audience === "everyone" ? "Everyone" : "Paired people only"}`
      }
    >
      <Switch
        aria-label={`Enable ${connection.name}`}
        checked={connection.enabled}
        disabled={busy}
        controlRef={control}
        onChange={toggle}
        data-command-id="toggle-channel"
      />
      <PreferenceAction
        className="icon-btn"
        command="manage-channel"
        scopeId={scope}
        disabled={busy}
        aria-label={`Manage ${connection.name}`}
        invoke={onManage}
      >
        {shellIconGearSm}
      </PreferenceAction>
    </SettingsField>
  );
}
