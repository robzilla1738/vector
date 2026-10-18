import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  ChannelCredentialsSchema,
  type ChannelOptions,
  type ChannelProvider,
  type ChannelSaveParams,
  type MethodResult,
  type Workspace,
} from "@aux/contracts";
import { bridge } from "../../bridge";
import { call } from "../../store";
import { errorMessage } from "../../error-message";
import { Dialog, Select, SettingsGroup, Switch, Tabs } from "../../ui";
import { useConfirm } from "../../ui/dialog";
import { shellIconClose } from "../../ui/icons";
import { SettingsField } from "../primitives";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import { ChannelMark, channelLabels } from "./ChannelMark";
import type { ChannelStatus } from "./Channels";

type Details = { peers: MethodResult<"channels.peers">; deliveries: MethodResult<"channels.deliveries"> };
type ChannelTab = "options" | "pairing" | "credentials";
const tabs = [
  { value: "options", label: "Options" },
  { value: "pairing", label: "Pairing" },
  { value: "credentials", label: "Credentials" },
] as const;
const setup = {
  slack: {
    url: "https://docs.slack.dev/apis/events-api/using-socket-mode/",
    text: "Enable Socket Mode and message events. Use a bot token with chat:write and users:read, plus history access for the conversations it should answer in. The app token needs connections:write.",
  },
  telegram: {
    url: "https://core.telegram.org/bots/tutorial#obtain-your-bot-token",
    text: "Create a bot with BotFather and copy its token. This connection uses long polling and leaves existing webhooks unchanged.",
  },
  discord: {
    url: "https://docs.discord.com/developers/quick-start/getting-started",
    text: "Create a Discord bot, enable Message Content Intent, and give it access to the conversations and threads it should answer in.",
  },
} as const;

export function ChannelEditor({
  provider,
  connection,
  workspaces,
  busy,
  onClose,
  onSave,
  onAction,
  onRemoved,
}: {
  provider: ChannelProvider;
  connection?: ChannelStatus;
  workspaces: Workspace[];
  busy: boolean;
  onClose(): void;
  onSave(input: ChannelSaveParams): Promise<void>;
  onAction(action: () => Promise<unknown>): Promise<unknown>;
  onRemoved(): void;
}) {
  const scope = useId(),
    panel = useId(),
    windowId = bridge.windowId;
  const [tab, setTab] = useState<ChannelTab>(connection ? "options" : "credentials");
  const [name, setName] = useState(connection?.name ?? channelLabels[provider]);
  const [workspaceId, setWorkspaceId] = useState(connection?.workspaceId ?? workspaces[0]?.workspaceId ?? "");
  const [options, setOptions] = useState<ChannelOptions>(
    connection?.options ?? { audience: "paired", requireMentionsInThreads: true, followUp: "queue" },
  );
  const [botToken, setBotToken] = useState(""),
    [appToken, setAppToken] = useState("");
  const [details, setDetails] = useState<Details | null>(null),
    [failure, setFailure] = useState("");
  const live = useRef(true),
    sequence = useRef(0),
    pending = useRef(busy);
  const nameInput = useRef<HTMLInputElement>(null);
  const current = useCallback(
    () =>
      live.current && bridge.windowId === windowId && !bridge.privateMode && bridge.windowKind === "normal",
    [windowId],
  );
  useLayoutEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      ++sequence.current;
    };
  }, []);
  useLayoutEffect(() => {
    pending.current = busy;
  }, [busy]);
  const { confirm, confirmation } = useConfirm();
  const reload = useCallback(async () => {
    if (!connection || !current()) return;
    const request = ++sequence.current;
    try {
      const input = { connectionId: connection.connectionId, expectedRevision: connection.revision };
      const [peers, deliveries] = await Promise.all([
        call("channels.peers", input),
        call("channels.deliveries", input),
      ]);
      if (current() && request === sequence.current) setDetails({ peers, deliveries });
    } catch (reason) {
      if (current() && request === sequence.current) setFailure(errorMessage(reason));
    }
  }, [connection, current]);
  useEffect(() => {
    void reload();
    return bridge.onEvent((event) => {
      if (
        event.type === "channels.changed" &&
        event.payload.connectionId === connection?.connectionId &&
        !pending.current
      )
        void reload();
    });
  }, [connection?.connectionId, reload]);
  const work = async (action: () => Promise<unknown>) => {
    if (!current() || pending.current) throw new Error("Choose the original channel control.");
    setFailure("");
    try {
      await onAction(action);
      if (current()) await reload();
    } catch (reason) {
      if (current()) setFailure(errorMessage(reason));
      throw reason;
    }
  };
  const save = async () => {
    if (!current() || pending.current) throw new Error("Choose the original channel draft.");
    let credentials;
    if (!connection || botToken || appToken) {
      const parsed = ChannelCredentialsSchema.safeParse({
        provider,
        botToken,
        ...(provider === "slack" ? { appToken } : {}),
      });
      if (!parsed.success)
        throw new Error(
          provider === "slack" ? "Enter both the bot token and app token." : "Enter the bot token.",
        );
      credentials = parsed.data;
    }
    await onSave({
      connectionId: connection?.connectionId,
      expectedRevision: connection?.revision ?? null,
      provider,
      name: name.trim(),
      workspaceId,
      enabled: connection?.enabled ?? true,
      options,
      credentials,
    });
  };
  const [form, submit] = usePreferenceCommand<HTMLFormElement>("save-channel", scope, save, (reason) => {
    if (current()) setFailure(errorMessage(reason));
  });
  const control = connection
    ? { connectionId: connection.connectionId, expectedRevision: connection.revision }
    : null;
  const remove = async () => {
    if (
      !control ||
      !current() ||
      !(await confirm({
        title: `Remove ${name}?`,
        description:
          "This stops this channel's current tasks and removes its credentials and pairing records from Aux.",
        confirmLabel: "Remove",
        danger: true,
      }))
    )
      return;
    if (!current()) return;
    await work(() => call("channels.remove", control));
    if (current()) onRemoved();
  };
  const retry = async (delivery: MethodResult<"channels.deliveries">[number]) => {
    if (!control || !current()) return;
    let title = "Original reply";
    let guidance = "The original connection or permission has retired. This reply is retained for review.";
    if (delivery.canRetry) {
      title = delivery.state === "unknown" ? "Retry an unconfirmed reply?" : "Retry this reply?";
      guidance =
        delivery.state === "unknown"
          ? "The messenger may already have received this reply. Retrying can create a duplicate."
          : "Send this reply again to the original conversation.";
    }
    const accepted = await confirm({
      title,
      description: `${delivery.peerName} · conversation ${delivery.conversationId}\n\n${delivery.text}\n\n${guidance}`,
      confirmLabel: delivery.canRetry ? "Retry reply" : "Done",
    });
    if (accepted && delivery.canRetry && current())
      await work(() => call("channels.retryDelivery", { ...control, deliveryId: delivery.deliveryId }));
  };
  return (
    <>
      <Dialog
        label={connection ? `Manage ${connection.name}` : `Connect ${channelLabels[provider]}`}
        className="aux-dialog-surface popup-material channel-editor"
        onClose={() => {
          if (!busy) onClose();
        }}
        initialFocusRef={tab === "credentials" ? nameInput : undefined}
      >
        <header className="channel-editor-header">
          <ChannelMark provider={provider} />
          <h3>{connection?.name ?? channelLabels[provider]}</h3>
          <PreferenceAction
            className="icon-btn"
            command="cancel-channel"
            scopeId={`${scope}:close`}
            aria-label="Close channel settings"
            disabled={busy}
            invoke={onClose}
          >
            {shellIconClose}
          </PreferenceAction>
        </header>
        <Tabs<ChannelTab>
          label="Channel settings"
          value={tab}
          onChange={setTab}
          items={tabs}
          panelId={panel}
          className="channel-editor-tabs"
        />
        <form
          ref={form}
          data-command-id="save-channel"
          onSubmit={(event) => {
            event.preventDefault();
            submit(event);
          }}
        >
          <div
            role="tabpanel"
            id={panel}
            aria-labelledby={`${panel}-${tab}`}
            className="channel-editor-panel"
          >
            {tab === "options" && (
              <>
                <SettingsGroup title="Access">
                  <SettingsField
                    label="Access permission"
                    hint="Set who can use this bot to request tasks and receive replies in the selected Space."
                  >
                    <Select
                      aria-label="Access permission"
                      value={options.audience}
                      disabled={busy}
                      onChange={(event) =>
                        setOptions({ ...options, audience: event.target.value as ChannelOptions["audience"] })
                      }
                    >
                      <option value="paired">Paired people only</option>
                      <option value="everyone">Everyone</option>
                    </Select>
                  </SettingsField>
                  <SettingsField label="Space" hint="Channel tasks and their context stay in this Space.">
                    <Select
                      aria-label="Channel Space"
                      value={workspaceId}
                      disabled={busy}
                      onChange={(event) => setWorkspaceId(event.target.value)}
                    >
                      {!workspaces.length && <option value="">Create a Space first</option>}
                      {workspaces.map((workspace) => (
                        <option key={workspace.workspaceId} value={workspace.workspaceId}>
                          {workspace.name}
                        </option>
                      ))}
                    </Select>
                  </SettingsField>
                </SettingsGroup>
                {options.audience === "everyone" && (
                  <p className="hint">
                    Anyone who can message this bot can request tasks and receive their results. Blocked
                    people remain blocked. Replies are visible in the original messenger conversation.
                  </p>
                )}
                <SettingsGroup title="Chat behavior">
                  <SettingsField
                    label="Require mentions in threads"
                    hint="Require an @mention for the bot to respond in a thread or topic."
                  >
                    <Switch
                      aria-label="Require mentions in threads"
                      checked={options.requireMentionsInThreads}
                      disabled={busy}
                      onChange={(event) =>
                        setOptions({ ...options, requireMentionsInThreads: event.target.checked })
                      }
                    />
                  </SettingsField>
                  <SettingsField
                    label="Follow-up behavior"
                    hint="Queue follow-ups while Aux runs or steer the current run."
                  >
                    <Select
                      aria-label="Follow-up behavior"
                      value={options.followUp}
                      disabled={busy}
                      onChange={(event) =>
                        setOptions({ ...options, followUp: event.target.value as ChannelOptions["followUp"] })
                      }
                    >
                      <option value="queue">Queue</option>
                      <option value="steer">Steer</option>
                    </Select>
                  </SettingsField>
                </SettingsGroup>
                {control && (
                  <SettingsGroup title="Connection">
                    <SettingsField label="Reconnect" hint="Use this when messages stop arriving.">
                      <PreferenceAction
                        className="btn sm"
                        command="reconnect-channel"
                        scopeId={scope}
                        disabled={busy || !connection?.enabled}
                        invoke={() => work(() => call("channels.reconnect", control))}
                      >
                        Reconnect
                      </PreferenceAction>
                    </SettingsField>
                    <SettingsField label="Remove channel">
                      <PreferenceAction
                        className="btn sm ghost danger"
                        command="remove-channel"
                        scopeId={scope}
                        disabled={busy}
                        invoke={remove}
                      >
                        Remove…
                      </PreferenceAction>
                    </SettingsField>
                  </SettingsGroup>
                )}
              </>
            )}
            {tab === "pairing" && (
              <>
                <p className="hint">
                  Send <code>/pair</code> to this bot, then approve the person's authenticated messenger
                  identity here. Pairing requests expire after 10 minutes.
                </p>
                {details
                  ? (["paired", "pending", "blocked"] as const).map((state) => {
                      const peers = details.peers.filter((peer) => peer.state === state);
                      if (!peers.length) return null;
                      return (
                        <SettingsGroup
                          key={state}
                          title={
                            state === "paired"
                              ? "Paired"
                              : state === "blocked"
                                ? "Blocked"
                                : "Requests and recent people"
                          }
                        >
                          {peers.map((peer) => (
                            <SettingsField
                              key={peer.peerKey}
                              label={peer.name}
                              hint={peer.providerUserId}
                              searchable={false}
                            >
                              {state !== "paired" && (
                                <PreferenceAction
                                  className="btn sm"
                                  command="pair-channel-person"
                                  scopeId={`${scope}:${peer.peerKey}`}
                                  disabled={busy || Boolean(peer.expiresAt && peer.expiresAt <= Date.now())}
                                  invoke={() =>
                                    work(() =>
                                      call("channels.peer", {
                                        ...control!,
                                        peerKey: peer.peerKey,
                                        action: "pair",
                                        requestId: peer.requestId,
                                      }),
                                    )
                                  }
                                >
                                  {state === "blocked" ? "Unblock & pair" : "Pair"}
                                </PreferenceAction>
                              )}
                              {state !== "blocked" && (
                                <PreferenceAction
                                  className="btn sm ghost"
                                  command="block-channel-person"
                                  scopeId={`${scope}:${peer.peerKey}`}
                                  disabled={busy}
                                  invoke={() =>
                                    work(() =>
                                      call("channels.peer", {
                                        ...control!,
                                        peerKey: peer.peerKey,
                                        action: "block",
                                      }),
                                    )
                                  }
                                >
                                  Block
                                </PreferenceAction>
                              )}
                            </SettingsField>
                          ))}
                        </SettingsGroup>
                      );
                    })
                  : connection && (
                      <p className="hint" role="status">
                        Loading people…
                      </p>
                    )}
                {!connection && <p className="hint">Connect this messenger before pairing people.</p>}
                {details?.peers.length === 0 && <p className="hint">No one is paired yet.</p>}
                {details && details.deliveries.length > 0 && (
                  <SettingsGroup title="Replies needing review">
                    {details.deliveries.map((delivery) => (
                      <SettingsField
                        key={delivery.deliveryId}
                        searchable={false}
                        label={delivery.peerName}
                        hint={
                          delivery.state === "unknown"
                            ? "Delivery is unconfirmed. Review before retrying."
                            : "This reply was not delivered."
                        }
                      >
                        <PreferenceAction
                          className="btn sm"
                          command="retry-channel-delivery"
                          scopeId={`${scope}:${delivery.deliveryId}`}
                          disabled={busy}
                          invoke={() => retry(delivery)}
                        >
                          Review…
                        </PreferenceAction>
                      </SettingsField>
                    ))}
                  </SettingsGroup>
                )}
              </>
            )}
            {tab === "credentials" && (
              <>
                <p className="hint">
                  {setup[provider].text}{" "}
                  <a href={setup[provider].url} target="_blank" rel="noreferrer">
                    Setup guide
                  </a>
                </p>
                <SettingsGroup title="Connection">
                  <SettingsField label="Name">
                    <input
                      className="field-input"
                      ref={nameInput}
                      aria-label="Channel name"
                      value={name}
                      maxLength={200}
                      required
                      disabled={busy}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </SettingsField>
                  <SettingsField label="Space" hint="Channel tasks and their context stay in this Space.">
                    <Select
                      aria-label="Channel Space"
                      value={workspaceId}
                      disabled={busy}
                      onChange={(event) => setWorkspaceId(event.target.value)}
                    >
                      {!workspaces.length && <option value="">Create a Space first</option>}
                      {workspaces.map((workspace) => (
                        <option key={workspace.workspaceId} value={workspace.workspaceId}>
                          {workspace.name}
                        </option>
                      ))}
                    </Select>
                  </SettingsField>
                  <SettingsField
                    label="Bot token"
                    hint={
                      connection
                        ? "Leave blank to keep the saved credentials."
                        : "Saved securely in this Profile's OS credential store."
                    }
                  >
                    <input
                      className="field-input"
                      type="password"
                      aria-label="Bot token"
                      value={botToken}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={busy}
                      onChange={(event) => setBotToken(event.target.value)}
                    />
                  </SettingsField>
                  {provider === "slack" && (
                    <SettingsField label="App token">
                      <input
                        className="field-input"
                        type="password"
                        aria-label="App token"
                        value={appToken}
                        autoComplete="off"
                        spellCheck={false}
                        disabled={busy}
                        onChange={(event) => setAppToken(event.target.value)}
                      />
                    </SettingsField>
                  )}
                </SettingsGroup>
                <p className="hint">
                  Text requests use Aux's normal task approvals. Use <code>/stop</code> in the originating
                  conversation to stop its task, or use Stop and Take over in Aux.
                </p>
              </>
            )}
          </div>
          {failure && (
            <p className="field-error" role="alert">
              {failure}
            </p>
          )}
          {connection && tab !== "pairing" && (
            <p className="hint channel-save-hint">
              Saving restarts this channel and stops its current tasks.
            </p>
          )}
          <footer className="channel-editor-actions">
            <PreferenceAction
              className="btn sm ghost"
              command="cancel-channel"
              scopeId={`${scope}:cancel`}
              disabled={busy}
              invoke={onClose}
            >
              Done
            </PreferenceAction>
            {tab !== "pairing" && (
              <button
                className="btn sm primary"
                type="submit"
                disabled={busy || !workspaceId || !name.trim()}
              >
                {busy ? "Saving…" : connection ? "Save" : "Connect"}
              </button>
            )}
          </footer>
        </form>
      </Dialog>
      {confirmation}
    </>
  );
}
