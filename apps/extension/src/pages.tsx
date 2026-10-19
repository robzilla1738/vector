import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { ChannelsSettings } from './channels';
import { rpc } from './daemon';
import { preference } from './native';
import type { Session } from './types';

type Item = Record<string, unknown>;
export function Tasks({
  accountId,
  archived = false,
}: {
  accountId: number;
  archived?: boolean;
}) {
  const [rows, setRows] = useState<Session[]>();
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [cards, setCards] = useState(false);
  const [order, setOrder] = useState('desc');
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    try {
      const data = await rpc<Session[] | { items: Session[] }>(
        'sessions.list',
        { accountId, archived: archived ? 'only' : 'exclude', order },
      );
      setRows(Array.isArray(data) ? data : data.items);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tasks could not be loaded.');
    }
  }, [accountId, archived, order]);
  useEffect(() => {
    void load();
  }, [load]);
  async function action(row: Session, method: string) {
    if (
      method === 'delete' &&
      !confirm('Delete this item? This cannot be undone.')
    )
      return;
    setBusy(row.id);
    try {
      await rpc(
        `sessions.${method}`,
        {
          accountId,
          sessionId: row.id,
          ...(method === 'update' ? { pinned: !row.pinned } : {}),
        },
        true,
      );
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'The change could not be saved.',
      );
    } finally {
      setBusy('');
    }
  }
  return (
    <main className="secondary wide">
      <div className="row spread">
        <h1>{archived ? 'Archived tasks' : 'Tasks'}</h1>
        <Button onClick={() => (location.hash = '/chat')}>Start a task</Button>
      </div>
      <div className="row wrap">
        <input
          className="field"
          aria-label="Find tasks"
          placeholder="Find tasks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Any status</option>
          <option value="running">In progress</option>
          <option value="suspended">Waiting for you</option>
          <option value="errored">Failed</option>
          <option value="idle">Finished</option>
        </select>
        <select
          aria-label="Sort"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="desc">Most recent</option>
          <option value="asc">Earliest</option>
        </select>
        <Button onClick={() => setCards(!cards)}>
          {cards ? 'Rows' : 'Cards'}
        </Button>
      </div>
      {error && <ErrorNotice error={error} retry={() => void load()} />}
      <div className={cards ? 'task-grid' : 'stack'}>
        {!rows ? (
          <Empty>Loading…</Empty>
        ) : (
          rows
            .filter(
              (row) =>
                (!status || row.status === status) &&
                row.title.toLowerCase().includes(query.toLowerCase()),
            )
            .map((row) => (
              <div className="task-row" key={row.id}>
                <a href={`#/chat/${row.id}`}>
                  <strong>{row.title || 'Start a task'}</strong>
                  <small>
                    {row.status} ·{' '}
                    {new Date(row.updatedAt ?? row.createdAt).toLocaleString()}
                  </small>
                </a>
                <div className="row">
                  <Button
                    disabled={busy === row.id}
                    onClick={() => void action(row, 'update')}
                  >
                    {row.pinned ? 'Unpin task' : 'Pin task'}
                  </Button>
                  <Button
                    disabled={busy === row.id}
                    onClick={() =>
                      void action(row, archived ? 'unarchive' : 'archive')
                    }
                  >
                    {archived ? 'Restore task' : 'Archive task'}
                  </Button>
                  <Button
                    disabled={busy === row.id}
                    onClick={() => void action(row, 'delete')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>
      {rows?.length === 0 && <Empty>Your next task starts here.</Empty>}
    </main>
  );
}
const settingsSections = [
  ['general', 'Browser basics'],
  ['appearance', 'Look and layout'],
  ['agents', 'Task behavior'],
  ['model', 'AI connections'],
  ['plugins/mcps', 'Tool servers'],
  ['plugins/skills', 'Skills'],
  ['channels', 'Channels'],
  ['context-awareness', 'Activity context'],
  ['mini-popup', 'Quick popup'],
  ['privacy', 'Privacy and blocking'],
  ['developers', 'Developer tools'],
] as const;
export function Settings({
  accountId,
  section,
}: {
  accountId: number;
  section: string;
}) {
  const [settings, setSettings] = useState<Item>();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState('');
  const [provider, setProvider] = useState('vercel-ai-gateway');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    void rpc<Item>('settings.getAll', { accountId })
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, [accountId]);
  async function save(name: string, value: unknown) {
    setPending(true);
    setError('');
    try {
      await rpc('settings.set', { accountId, key: name, value }, true);
      setSettings((current) => ({ ...current, [name]: value }));
      if (name === 'theme') {
        localStorage.setItem('aux.theme', String(value));
        const next =
          value === 'system'
            ? matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : String(value);
        document.documentElement.dataset.theme = next;
        await preference('setBrowserColorScheme', value);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'This setting could not be saved. Try again.',
      );
    } finally {
      setPending(false);
    }
  }
  async function nativeAction(method: string, ...args: unknown[]) {
    setPending(true);
    setError('');
    try {
      const result = await preference(method, ...args);
      setNotice(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'This setting could not be saved.',
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="settings">
      <nav aria-label="Preferences sections">
        {settingsSections.map(([path, label]) => (
          <a
            aria-current={section === path ? 'page' : undefined}
            href={`#/settings/${path}`}
            key={path}
          >
            {label}
          </a>
        ))}
      </nav>
      <main className="secondary">
        <h2>
          {settingsSections.find(([path]) => path === section)?.[1] ??
            'Preferences'}
        </h2>
        {error && <ErrorNotice error={error} />}
        <div className="stack">
          {section === 'channels' && (
            <ChannelsSettings key={accountId} accountId={accountId} />
          )}
          {section === 'appearance' && (
            <>
              <Setting
                label="Color mode"
                description="Choose how Aux looks on this Mac."
              >
                <select
                  disabled={pending}
                  value={String(settings?.theme ?? 'system')}
                  onChange={(e) => void save('theme', e.target.value)}
                >
                  <option value="system">Follow this Mac</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Setting>
              <Setting label="Tab layout">
                <Button
                  disabled={pending}
                  onClick={() => void nativeAction('setTabStyle', 'vertical')}
                >
                  Sidebar tabs
                </Button>
                <Button
                  disabled={pending}
                  onClick={() => void nativeAction('setTabStyle', 'horizontal')}
                >
                  Top tabs
                </Button>
              </Setting>
              <Setting label="Page zoom">
                <select
                  defaultValue="1"
                  disabled={pending}
                  onChange={(e) =>
                    void nativeAction('setDefaultZoom', Number(e.target.value))
                  }
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((value) => (
                    <option key={value} value={value}>
                      {value * 100}%
                    </option>
                  ))}
                </select>
              </Setting>
            </>
          )}
          {section === 'general' && (
            <>
              <Setting label="Make Aux your default browser">
                <Button
                  disabled={pending}
                  onClick={() => void nativeAction('setAsDefaultBrowser')}
                >
                  Open
                </Button>
              </Setting>
              <Setting label="Installed version">
                <Button onClick={() => void nativeAction('getBrowserVersion')}>
                  Refresh
                </Button>
              </Setting>
              <Setting
                label="Local account"
                description="This account stays on this Mac."
              />
            </>
          )}
          {section === 'agents' && (
            <>
              <Setting label="Default access">
                <select
                  disabled={pending}
                  value={String(settings?.permissionMode ?? 'guard')}
                  onChange={(e) => void save('permissionMode', e.target.value)}
                >
                  <option value="read-only">Ask first</option>
                  <option value="guard">Limited access</option>
                  <option value="full-access">Full access</option>
                </select>
              </Setting>
              <Setting label="Task sound">
                <input
                  type="checkbox"
                  disabled={pending}
                  checked={settings?.completionSoundEnabled === true}
                  onChange={(e) =>
                    void save('completionSoundEnabled', e.target.checked)
                  }
                />
              </Setting>
              <Setting label="Follow the active browser tab">
                <input
                  type="checkbox"
                  disabled={pending}
                  checked={settings?.followActiveTab === true}
                  onChange={(e) =>
                    void save('followActiveTab', e.target.checked)
                  }
                />
              </Setting>
            </>
          )}
          {section === 'model' && (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                setPending(true);
                setError('');
                void rpc(
                  'models.setCredential',
                  {
                    accountId,
                    providerId: provider,
                    credential: { type: 'api_key', key },
                  },
                  true,
                )
                  .then(() => {
                    setKey('');
                    setNotice(
                      'Connection saved. Choose an available model in your task.',
                    );
                  })
                  .catch((e) => setError(e.message))
                  .finally(() => setPending(false));
              }}
            >
              <label>
                Provider
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  {[
                    'vercel-ai-gateway',
                    'openrouter',
                    'openai',
                    'anthropic',
                    'google',
                  ].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                API key
                <input
                  className="field"
                  type="password"
                  autoComplete="off"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </label>
              <Button
                type="submit"
                className="primary"
                disabled={pending || !key}
              >
                Save connection
              </Button>
              <p className="muted">
                Credentials stay in your local account. Saving a connection does
                not run a paid request.
              </p>
            </form>
          )}
          {section === 'context-awareness' && (
            <Setting
              label="Keep activity context"
              description="Capture needs the corresponding system permissions."
            >
              <input
                type="checkbox"
                disabled={pending}
                checked={settings?.contextAwarenessEnabled === true}
                onChange={(e) =>
                  void save('contextAwarenessEnabled', e.target.checked)
                }
              />
            </Setting>
          )}
          {section === 'developers' && (
            <Button
              disabled={pending}
              onClick={() => {
                setPending(true);
                void rpc('developers.checkCliInstallation', { accountId })
                  .then((result) => setNotice(JSON.stringify(result)))
                  .catch((e) => setError(e.message))
                  .finally(() => setPending(false));
              }}
            >
              Command line tools
            </Button>
          )}
          {![
            'general',
            'appearance',
            'agents',
            'model',
            'context-awareness',
            'developers',
            'channels',
          ].includes(section) && (
            <BackendPanel
              accountId={accountId}
              procedure={
                section === 'plugins/mcps'
                  ? 'mcp.connectionStatus'
                  : section === 'plugins/skills'
                    ? 'projects.listSkillsForSettings'
                    : section === 'privacy'
                      ? 'adblock.getState'
                      : 'settings.getAll'
              }
            />
          )}{' '}
          {notice && <output className="notice">{notice}</output>}
        </div>
      </main>
    </div>
  );
}
function Setting({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="setting row spread wrap">
      <div>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </div>
      <div className="row">{children}</div>
    </div>
  );
}
export function BackendPanel({
  accountId,
  procedure,
}: {
  accountId: number;
  procedure: string;
}) {
  const [data, setData] = useState<unknown>();
  const [error, setError] = useState('');
  useEffect(() => {
    setData(undefined);
    setError('');
    void rpc(procedure, { accountId })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [accountId, procedure]);
  if (error) return <ErrorNotice error={error} />;
  if (data === undefined) return <Empty>Loading…</Empty>;
  return <pre className="backend-data">{JSON.stringify(data, null, 2)}</pre>;
}
export function Collection({
  accountId,
  kind,
}: {
  accountId: number;
  kind: 'projects' | 'routines' | 'memory' | 'inbox';
}) {
  const [rows, setRows] = useState<Item[]>();
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [path, setPath] = useState('');
  const [pending, setPending] = useState(false);
  const [file, setFile] = useState('');
  const [content, setContent] = useState('');
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(async () => {
    try {
      const data = await rpc<
        Item[] | { items?: Item[]; files?: Item[]; messages?: Item[] }
      >(
        `${kind}.${kind === 'memory' ? 'listFiles' : kind === 'inbox' ? 'overview' : 'list'}`,
        { accountId },
      );
      setRows(
        Array.isArray(data)
          ? data
          : (data.items ?? data.files ?? data.messages ?? []),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This could not be loaded.');
    }
  }, [accountId, kind]);
  useEffect(() => {
    void load();
  }, [load]);
  async function create() {
    setPending(true);
    setError('');
    try {
      if (kind === 'projects')
        await rpc(
          'projects.create',
          { accountId, id: crypto.randomUUID(), name, workspacePath: path },
          true,
        );
      if (kind === 'routines')
        await rpc(
          'routines.create',
          {
            accountId,
            name,
            prompt: body,
            kind: 'cron',
            triggerKind: 'schedule',
            scheduleKind: 'once',
            runAt: new Date(path).toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            projectId: null,
          },
          true,
        );
      setDialog(false);
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'The change could not be saved.',
      );
    } finally {
      setPending(false);
    }
  }
  const title = {
    projects: 'Projects',
    routines: 'Routines',
    memory: 'Memory',
    inbox: 'Updates',
  }[kind];
  return (
    <main className="secondary">
      <div className="row spread">
        <h1>{title}</h1>
        {(kind === 'projects' || kind === 'routines') && (
          <Button onClick={() => setDialog(true)}>
            {kind === 'projects' ? 'New project' : 'New routine'}
          </Button>
        )}
      </div>
      {error && <ErrorNotice error={error} retry={() => void load()} />}
      <div className="stack">
        {!rows ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>Nothing here yet.</Empty>
        ) : (
          rows.map((item, index) => (
            <div
              key={String(item.id ?? item.path ?? index)}
              className="task-row"
            >
              <div>
                <strong>
                  {String(
                    item.name ??
                      item.title ??
                      item.filePath ??
                      item.path ??
                      'Update',
                  )}
                </strong>
                <small>
                  {String(
                    item.state ??
                      item.workspacePath ??
                      item.content ??
                      item.lastUpdatedAt ??
                      '',
                  )}
                </small>
              </div>
              {kind === 'memory' && (
                <Button
                  onClick={() => {
                    const filePath = String(item.filePath ?? item.path);
                    setFile(filePath);
                    setLoaded(false);
                    void rpc<{ content: string }>('memory.readFile', {
                      accountId,
                      filePath,
                    })
                      .then((result) => {
                        setContent(result.content);
                        setLoaded(true);
                      })
                      .catch((e) => setError(e.message));
                  }}
                >
                  Edit
                </Button>
              )}
              {kind === 'routines' && (
                <Button
                  disabled={pending}
                  onClick={() => {
                    setPending(true);
                    void rpc<{ id?: string; sessionId?: string }>(
                      'routines.runNow',
                      { accountId, routineId: item.id },
                      true,
                    )
                      .then((result) => {
                        const id = result.sessionId ?? result.id;
                        if (id) location.hash = `/chat/${id}`;
                      })
                      .catch((e) => setError(e.message))
                      .finally(() => setPending(false));
                  }}
                >
                  Run now
                </Button>
              )}
            </div>
          ))
        )}
      </div>
      {file && (
        <Dialog title={file} onClose={() => setFile('')}>
          <textarea
            className="memory-editor"
            value={content}
            disabled={!loaded || pending}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            disabled={!loaded || pending}
            onClick={() => {
              setPending(true);
              void rpc(
                'memory.writeFile',
                { accountId, filePath: file, content },
                true,
              )
                .then(() => setFile(''))
                .catch((e) => setError(e.message))
                .finally(() => setPending(false));
            }}
          >
            Save
          </Button>
        </Dialog>
      )}
      {dialog && (
        <Dialog
          title={kind === 'projects' ? 'New project' : 'New routine'}
          onClose={() => setDialog(false)}
        >
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <label>
              {kind === 'projects' ? 'Project name' : 'Routine name'}
              <input
                className="field"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {kind === 'routines' && (
              <label>
                What should happen?
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
            )}
            <label>
              {kind === 'projects' ? 'Working folder' : 'Run at'}
              <input
                type={kind === 'routines' ? 'datetime-local' : 'text'}
                className="field"
                required
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={pending}>
              Create
            </Button>
          </form>
        </Dialog>
      )}
    </main>
  );
}
