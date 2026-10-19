/** Local channel management: docs/spec/daemon/services.md MCP client/local channels. */
import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { Check, Plus, RefreshCw, Shield, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rpc } from './daemon';
import './channels.css';

type Connection = {
  id: string;
  name: string;
  platform: 'telegram';
  enabled: boolean;
  status: 'running' | 'stopped' | 'errored';
  identity: { id: string; name: string };
  createdAt: number;
  error?: string;
};
type Pairing = {
  id: string;
  connectionId: string;
  senderId: string;
  displayName: string;
  createdAt: number;
  state: 'pending' | 'approved' | 'rejected';
};
type Principal = {
  connectionId: string;
  senderId: string;
  displayName: string;
  enabled: boolean;
  approvedAt: number;
};
type Policy = {
  permissionMode: 'read-only' | 'guard';
  allowTasks: boolean;
  allowReplies: boolean;
  model?: {
    provider: string;
    modelId: string;
    thinkingLevel: string;
    fastMode: boolean;
  };
};
type VerifyResult = { verified: true; identity: { id: string; name: string } };
type Mutate = <T = unknown>(
  method: string,
  input: Record<string, unknown>,
) => Promise<T>;
function errorText(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The local channel operation could not be completed.';
}
function date(value: number) {
  return new Date(value).toLocaleString();
}

export function ChannelsSettings({ accountId }: { accountId: number }) {
  const [connections, setConnections] = useState<Connection[]>();
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [selected, setSelected] = useState('');
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Connection>();
  const inFlight = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const refresh = useCallback(async () => {
    try {
      const [rows, requests] = await Promise.all([
        rpc<Connection[]>('channel.connections.list', { accountId }),
        rpc<Pairing[]>('channel.pairing.list', { accountId }),
      ]);
      if (mounted.current) {
        setConnections(rows);
        setPairings(requests);
        setSelected((current) =>
          rows.some((row) => row.id === current)
            ? current
            : (rows[0]?.id ?? ''),
        );
        setLoadError('');
      }
    } catch (e) {
      if (mounted.current) setLoadError(errorText(e));
    }
  }, [accountId]);
  useEffect(() => {
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await refresh();
      if (active) timer = setTimeout(() => void poll(), 5000);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [refresh]);
  async function mutate<T>(
    method: string,
    input: Record<string, unknown>,
  ): Promise<T> {
    if (inFlight.current)
      throw new Error('Wait for the current channel operation to finish.');
    inFlight.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await rpc<T>(method, { accountId, ...input }, true);
      await refresh();
      return result;
    } catch (e) {
      if (mounted.current) setError(errorText(e));
      throw e;
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const connection = connections?.find((row) => row.id === selected);
  return (
    <section className="channels" aria-label="Local channels">
      <div className="row spread wrap">
        <p className="channel-intro">
          Receive private Telegram messages on this Mac. Each sender needs your
          approval before starting a task.
        </p>
        <div className="row">
          <Button
            disabled={busy}
            onClick={() => void refresh()}
            aria-label="Refresh channels"
          >
            <RefreshCw size={15} />
          </Button>
          <Button
            className="primary"
            disabled={busy}
            onClick={() => setAdding(true)}
          >
            <Plus size={15} />
            Add connection
          </Button>
        </div>
      </div>
      {(error || loadError) && (
        <ErrorNotice error={error || loadError} retry={() => void refresh()} />
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {connections === undefined ? (
        <p role="status">Loading local channels…</p>
      ) : connections.length === 0 ? (
        <Empty>
          No channel connections yet. Add a bot, verify its identity, then
          enable receiving when you’re ready.
        </Empty>
      ) : (
        <div className="channel-layout">
          <section className="channel-list" aria-label="Connections">
            {connections.map((row) => (
              <button
                type="button"
                key={row.id}
                className="channel-connection"
                disabled={busy}
                aria-pressed={row.id === selected}
                onClick={() => setSelected(row.id)}
              >
                <strong>{row.name}</strong>
                <span>@{row.identity.name}</span>
                <span className={`channel-status ${row.status}`}>
                  {row.status === 'running'
                    ? 'Receiving'
                    : row.status === 'errored'
                      ? 'Needs attention'
                      : 'Stopped'}
                </span>
                {pairings.some(
                  (request) =>
                    request.connectionId === row.id &&
                    request.state === 'pending',
                ) && <small>Sender approval needed</small>}
              </button>
            ))}
          </section>
          {connection && (
            <ConnectionDetails
              key={`${accountId}.${connection.id}`}
              accountId={accountId}
              connection={connection}
              pairings={pairings.filter(
                (request) => request.connectionId === connection.id,
              )}
              busy={busy}
              mutate={mutate}
              onRemove={() => setRemoving(connection)}
              onNotice={setNotice}
            />
          )}
        </div>
      )}
      {adding && (
        <ConnectDialog
          mutate={mutate}
          busy={busy}
          onClose={() => setAdding(false)}
          onSaved={(row) => {
            setSelected(row.id);
            setAdding(false);
            setNotice(
              'Bot identity verified and saved. Enable receiving to check for new messages.',
            );
          }}
        />
      )}
      {removing && (
        <Dialog
          title="Remove channel connection?"
          onClose={() => setRemoving(undefined)}
        >
          {error && <ErrorNotice error={error} />}
          <p>
            Remove <strong>{removing.name}</strong> (@{removing.identity.name})?
            This stops receiving, removes its stored token, and clears this
            connection’s sender permissions and delivery records.
          </p>
          <p>
            Existing tasks remain in your task history. No message is sent to
            Telegram.
          </p>
          <div className="row">
            <Button disabled={busy} onClick={() => setRemoving(undefined)}>
              Cancel
            </Button>
            <Button
              className="danger"
              disabled={busy}
              onClick={() =>
                void mutate('channel.connections.remove', {
                  connectionId: removing.id,
                })
                  .then(() => setRemoving(undefined))
                  .catch(() => {})
              }
            >
              <Trash2 size={14} />
              Remove connection
            </Button>
          </div>
        </Dialog>
      )}
    </section>
  );
}

function ConnectDialog({
  mutate,
  busy,
  onClose,
  onSaved,
}: {
  mutate: Mutate;
  busy: boolean;
  onClose: () => void;
  onSaved: (connection: Connection) => void;
}) {
  const [name, setName] = useState(''),
    [token, setToken] = useState(''),
    [verified, setVerified] = useState<VerifyResult>();
  const [error, setError] = useState('');
  return (
    <Dialog title="Add Telegram connection" onClose={onClose}>
      <p>
        Use a bot token you are authorized to manage. Verification reads the
        bot’s identity only. Receiving stays off until you enable it.
      </p>
      {error && <ErrorNotice error={error} />}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          void mutate<Connection>('channel.connections.create', {
            platform: 'telegram',
            name: name.trim(),
            token: token.trim(),
            enabled: false,
          })
            .then((row) => {
              setToken('');
              onSaved(row);
            })
            .catch((e) => setError(errorText(e)));
        }}
      >
        <label>
          Connection name
          <input
            className="field"
            value={name}
            maxLength={200}
            required
            disabled={busy}
            onChange={(event) => setName(event.target.value)}
            placeholder="Personal assistant"
          />
        </label>
        <label>
          Bot token
          <input
            className="field"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={250}
            disabled={busy}
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              setVerified(undefined);
              setError('');
            }}
          />
        </label>
        <small>
          The token is stored privately on this Mac. It is never shown in
          connection results.
        </small>
        {verified && (
          <p className="notice" role="status">
            <Check size={14} />
            Verified @{verified.identity.name} · bot ID {verified.identity.id}
          </p>
        )}
        <div className="row wrap">
          <Button
            disabled={busy || !token.trim()}
            onClick={() =>
              void mutate<VerifyResult>('channel.connections.test', {
                token: token.trim(),
              })
                .then((result) => {
                  setVerified(result);
                  setError('');
                })
                .catch((e) => setError(errorText(e)))
            }
          >
            Test identity
          </Button>
          <Button
            className="primary"
            type="submit"
            disabled={busy || !name.trim() || !token.trim()}
          >
            {busy ? 'Checking…' : 'Verify and save'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ConnectionDetails({
  accountId,
  connection,
  pairings,
  busy,
  mutate,
  onRemove,
  onNotice,
}: {
  accountId: number;
  connection: Connection;
  pairings: Pairing[];
  busy: boolean;
  mutate: Mutate;
  onRemove: () => void;
  onNotice: (message: string) => void;
}) {
  const [principals, setPrincipals] = useState<Principal[]>(),
    [policy, setPolicy] = useState<Policy>(),
    [savedPolicy, setSavedPolicy] = useState<Policy>();
  const [name, setName] = useState(connection.name),
    [error, setError] = useState(''),
    [dataError, setDataError] = useState(''),
    [approving, setApproving] = useState<Pairing & { policy: Policy }>(),
    [reviewing, setReviewing] = useState(''),
    [removing, setRemoving] = useState<Principal>(),
    [rotating, setRotating] = useState(false);
  const mounted = useRef(true);
  const load = useCallback(
    async (includePolicy = false) => {
      try {
        const rows = await rpc<Principal[]>('channel.principals.list', {
          accountId,
          connectionId: connection.id,
        });
        if (mounted.current) setPrincipals(rows);
        if (includePolicy) {
          const current = await rpc<Policy>('channel.policies.get', {
            accountId,
            connectionId: connection.id,
          });
          if (mounted.current) {
            setPolicy(current);
            setSavedPolicy(current);
          }
        }
        if (mounted.current) setDataError('');
      } catch (e) {
        if (mounted.current) setDataError(errorText(e));
      }
    },
    [accountId, connection.id],
  );
  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const poll = async () => {
      await load(false);
      if (active) timer = setTimeout(() => void poll(), 5000);
    };
    void load(true).then(() => {
      if (active) timer = setTimeout(() => void poll(), 5000);
    });
    return () => {
      mounted.current = false;
      active = false;
      clearTimeout(timer);
    };
  }, [load]);
  const pending = pairings.filter((row) => row.state === 'pending');
  async function review(request: Pairing) {
    if (reviewing) return;
    setReviewing(request.id);
    setError('');
    try {
      const current = await rpc<Policy>('channel.policies.get', {
        accountId,
        connectionId: connection.id,
      });
      if (mounted.current) setApproving({ ...request, policy: current });
    } catch (e) {
      if (mounted.current) setError(errorText(e));
    } finally {
      if (mounted.current) setReviewing('');
    }
  }
  const act = async (method: string, input: Record<string, unknown>) => {
    setError('');
    try {
      await mutate(method, { connectionId: connection.id, ...input });
      await load();
    } catch (e) {
      setError(errorText(e));
      throw e;
    }
  };
  return (
    <div className="channel-detail stack">
      <header className="row spread wrap">
        <div>
          <h3>{connection.name}</h3>
          <p className="muted">
            Telegram · @{connection.identity.name} · bot ID{' '}
            {connection.identity.id}
          </p>
        </div>
        <Button
          disabled={busy}
          onClick={() =>
            void mutate<VerifyResult>('channel.connections.test', {
              connectionId: connection.id,
            })
              .then((result) =>
                onNotice(
                  `Verified @${result.identity.name} (bot ${result.identity.id}). No message was sent.`,
                ),
              )
              .catch(() => {})
          }
        >
          Test identity
        </Button>
      </header>
      {connection.error && <ErrorNotice error={connection.error} />}
      {(error || dataError) && (
        <ErrorNotice error={error || dataError} retry={() => void load(true)} />
      )}
      <section className="channel-card stack" aria-label="Connection controls">
        <label className="channel-toggle">
          <input
            type="checkbox"
            checked={connection.enabled}
            disabled={busy}
            onChange={(event) =>
              void act('channel.connections.update', {
                enabled: event.target.checked,
              }).catch(() => {})
            }
          />
          <span>
            <strong>Receive messages</strong>
            <small>
              Checks Telegram while the local Aux daemon is running.
            </small>
          </span>
        </label>
        <div className="row wrap">
          <span className={`channel-status ${connection.status}`}>
            {connection.status === 'running'
              ? 'Receiving'
              : connection.status === 'errored'
                ? 'Needs attention'
                : 'Stopped'}
          </span>
          <Button
            disabled={busy || !connection.enabled}
            onClick={() =>
              void act('channel.connections.restart', {}).catch(() => {})
            }
          >
            Restart receiving
          </Button>
        </div>
        <form
          className="row wrap"
          onSubmit={(event) => {
            event.preventDefault();
            void act('channel.connections.update', { name: name.trim() })
              .then(() => onNotice('Connection name saved.'))
              .catch(() => {});
          }}
        >
          <label className="channel-grow">
            Connection name
            <input
              className="field"
              value={name}
              required
              maxLength={200}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <Button
            type="submit"
            disabled={busy || !name.trim() || name.trim() === connection.name}
          >
            Save name
          </Button>
        </form>
        <div className="row wrap">
          <Button disabled={busy} onClick={() => setRotating(true)}>
            Replace token
          </Button>
          <Button className="danger" disabled={busy} onClick={onRemove}>
            <Trash2 size={14} />
            Remove connection
          </Button>
        </div>
      </section>
      <section
        className="channel-card stack"
        aria-label="Sender pairing requests"
      >
        <div className="row">
          <Shield size={17} />
          <h3>Sender approval</h3>
        </div>
        <p>
          Names can be imitated. Check the numeric sender ID before granting
          access to local tasks.
        </p>
        {pending.length === 0 ? (
          <p className="muted">No pending sender requests.</p>
        ) : (
          pending.map((request) => (
            <div className="channel-sender" key={request.id}>
              <div>
                <strong>{request.displayName}</strong>
                <small>
                  Sender ID {request.senderId} · received{' '}
                  {date(request.createdAt)}
                </small>
              </div>
              <div className="row">
                <Button
                  disabled={busy || !!reviewing}
                  onClick={() => void review(request)}
                >
                  Review access
                </Button>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void act('channel.pairing.reject', {
                      requestId: request.id,
                    }).catch(() => {})
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
      <section className="channel-card stack" aria-label="Approved senders">
        <h3>Approved senders</h3>
        {principals === undefined ? (
          <p role="status">Loading approved senders…</p>
        ) : principals.length === 0 ? (
          <p className="muted">No senders have local access.</p>
        ) : (
          principals.map((principal) => (
            <div className="channel-sender" key={principal.senderId}>
              <div>
                <strong>{principal.displayName}</strong>
                <small>
                  Sender ID {principal.senderId} · approved{' '}
                  {date(principal.approvedAt)}
                </small>
              </div>
              <div className="row wrap">
                <Button
                  disabled={busy}
                  onClick={() =>
                    void act('channel.principals.update', {
                      senderId: principal.senderId,
                      enabled: !principal.enabled,
                    }).catch(() => {})
                  }
                >
                  {principal.enabled ? 'Disable access' : 'Enable access'}
                </Button>
                <Button
                  className="danger"
                  disabled={busy}
                  onClick={() => setRemoving(principal)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
      <section className="channel-card stack" aria-label="Channel task policy">
        <h3>Task permissions</h3>
        {!policy ? (
          <p role="status">Loading permissions…</p>
        ) : (
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              void mutate<Policy>('channel.policies.update', {
                connectionId: connection.id,
                policy,
              })
                .then((result) => {
                  setPolicy(result);
                  setSavedPolicy(result);
                  onNotice(
                    'Channel task permissions saved. Existing channel work was stopped before the new policy takes effect.',
                  );
                })
                .catch(() => {});
            }}
          >
            <label>
              Task access
              <select
                disabled={busy}
                value={policy.permissionMode}
                onChange={(event) =>
                  setPolicy({
                    ...policy,
                    permissionMode: event.target
                      .value as Policy['permissionMode'],
                  })
                }
              >
                <option value="read-only">Read-only</option>
                <option value="guard">Limited access, with approvals</option>
              </select>
            </label>
            <label className="channel-toggle">
              <input
                type="checkbox"
                disabled={busy}
                checked={policy.allowTasks}
                onChange={(event) =>
                  setPolicy({ ...policy, allowTasks: event.target.checked })
                }
              />
              <span>
                <strong>Allow tasks from approved senders</strong>
                <small>
                  New senders still need a separate pairing approval.
                </small>
              </span>
            </label>
            <label className="channel-toggle">
              <input
                type="checkbox"
                disabled={busy}
                checked={policy.allowReplies}
                onChange={(event) =>
                  setPolicy({ ...policy, allowReplies: event.target.checked })
                }
              />
              <span>
                <strong>Allow reply requests</strong>
                <small>
                  Each outgoing message still needs your exact confirmation in
                  its task. Nothing is sent automatically.
                </small>
              </span>
            </label>
            <small>
              Model:{' '}
              {policy.model
                ? `${policy.model.provider}/${policy.model.modelId}`
                : 'account default'}
            </small>
            <div className="row">
              <Button
                className="primary"
                type="submit"
                disabled={
                  busy || JSON.stringify(policy) === JSON.stringify(savedPolicy)
                }
              >
                Save permissions
              </Button>
              <Button disabled={busy} onClick={() => void load(true)}>
                Reload saved permissions
              </Button>
            </div>
          </form>
        )}
      </section>
      {approving && policy && (
        <Dialog
          title="Approve this channel sender?"
          onClose={() => setApproving(undefined)}
        >
          {error && <ErrorNotice error={error} />}
          <p>
            <strong>{approving.displayName}</strong> · sender ID{' '}
            <strong>{approving.senderId}</strong>
          </p>
          <p>
            This approval applies only to @{connection.identity.name}.{' '}
            {approving.policy.allowTasks
              ? 'Pending messages can start local tasks as soon as you approve.'
              : 'Tasks are disabled. This sender can start tasks if you enable them later.'}{' '}
            Saved task policy:{' '}
            <strong>
              {approving.policy.permissionMode === 'guard'
                ? 'limited access with approvals'
                : 'read-only'}
            </strong>
            .
          </p>
          <p>
            Outgoing messages require separate confirmation. Review the task
            permissions above before granting access.
          </p>
          <div className="row">
            <Button disabled={busy} onClick={() => setApproving(undefined)}>
              Cancel
            </Button>
            <Button
              className="primary"
              disabled={busy}
              onClick={() =>
                void act('channel.pairing.approve', {
                  requestId: approving.id,
                  expectedPolicy: approving.policy,
                })
                  .then(() => setApproving(undefined))
                  .catch(() => {})
              }
            >
              Approve sender
            </Button>
          </div>
        </Dialog>
      )}
      {removing && (
        <Dialog
          title="Remove sender access?"
          onClose={() => setRemoving(undefined)}
        >
          {error && <ErrorNotice error={error} />}
          <p>
            Remove {removing.displayName} (sender {removing.senderId}) from this
            connection? Current work is stopped and pending messages are
            discarded. A future message requires a new pairing approval.
          </p>
          <Button
            className="danger"
            disabled={busy}
            onClick={() =>
              void act('channel.principals.remove', {
                senderId: removing.senderId,
              })
                .then(() => setRemoving(undefined))
                .catch(() => {})
            }
          >
            Remove sender
          </Button>
        </Dialog>
      )}
      {rotating && (
        <TokenDialog
          busy={busy}
          connection={connection}
          mutate={mutate}
          onClose={() => setRotating(false)}
          onSaved={() => {
            setRotating(false);
            onNotice('Token verified and replaced for this bot.');
          }}
        />
      )}
    </div>
  );
}

function TokenDialog({
  connection,
  mutate,
  busy,
  onClose,
  onSaved,
}: {
  connection: Connection;
  mutate: Mutate;
  busy: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  return (
    <Dialog title="Replace bot token" onClose={onClose}>
      <p>
        The replacement must belong to @{connection.identity.name} (bot{' '}
        {connection.identity.id}). Verification reads bot identity only.
      </p>
      {error && <ErrorNotice error={error} />}
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          void mutate('channel.connections.update', {
            connectionId: connection.id,
            token: token.trim(),
          })
            .then(() => {
              setToken('');
              onSaved();
            })
            .catch((e) => setError(errorText(e)));
        }}
      >
        <label>
          Replacement token
          <input
            className="field"
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            disabled={busy}
            maxLength={250}
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        <Button
          className="primary"
          type="submit"
          disabled={busy || !token.trim()}
        >
          Verify and replace
        </Button>
      </form>
    </Dialog>
  );
}
