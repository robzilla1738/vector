import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './daemon';
import './plugin-settings.css';

type Tool = { name: string; description?: string; inputSchema?: unknown };
type Server =
  | {
      type: 'stdio';
      command: string;
      args: string[];
      env?: Record<string, string>;
    }
  | { type: 'http'; url: string; headers?: Record<string, string> };
type Row = {
  name: string;
  connected: boolean;
  connecting: boolean;
  settings: {
    server: Server;
    enabled: boolean;
    tools: Tool[];
    updatedAt: number;
  };
};
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The operation could not be completed.';
export function McpSettings({ accountId }: { accountId: number }) {
  const [rows, setRows] = useState<Row[]>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [editor, setEditor] = useState<Row | 'new'>();
  const [tools, setTools] = useState<Row>();
  const load = useCallback(async () => {
    const result = await rpc<Row[]>('mcp.listServers', { accountId });
    setRows(result);
  }, [accountId]);
  useEffect(() => {
    let active = true;
    async function refresh(initial: boolean) {
      try {
        const result = await rpc<Row[]>('mcp.listServers', { accountId });
        if (active) {
          setRows(result);
          if (initial) setError('');
        }
      } catch (error) {
        if (active) setError(message(error));
      }
    }
    void refresh(true);
    const timer = setInterval(() => {
      if (!document.hidden) void refresh(false);
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [accountId]);
  async function action(row: Row, method: string, extra = {}) {
    if (
      method === 'deleteServer' &&
      !confirm(`Remove “${row.name}” and its saved connection credentials?`)
    )
      return;
    setBusy(row.name);
    setError('');
    try {
      await rpc(`mcp.${method}`, { accountId, name: row.name, ...extra }, true);
      await load();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy('');
    }
  }
  return (
    <section className="plugin-settings">
      <div className="row spread wrap">
        <p className="muted">
          Connect local commands or remote MCP servers. Tasks can discover
          enabled, connected tools. Each unclassified operation requires an
          explicit action confirmation and is blocked in read-only sessions.
        </p>
        <Button disabled={!!busy} onClick={() => setEditor('new')}>
          Add server
        </Button>
      </div>
      {error && (
        <ErrorNotice
          error={error}
          retry={() => {
            void load()
              .then(() => setError(''))
              .catch((error) => setError(message(error)));
          }}
        />
      )}
      {!rows && !error && <p role="status">Loading tool servers…</p>}
      {rows?.length === 0 && <Empty>No tool servers configured.</Empty>}
      {rows?.map((row) => (
        <article className="plugin-card" key={row.name}>
          <div className="row spread wrap">
            <div>
              <h3>{row.name}</h3>
              <small>
                {row.settings.server.type === 'stdio'
                  ? row.settings.server.command
                  : row.settings.server.url}
              </small>
            </div>
            <label className="row">
              Enabled{' '}
              <input
                type="checkbox"
                checked={row.settings.enabled}
                disabled={!!busy}
                onChange={(event) => {
                  void action(row, 'setEnabled', {
                    enabled: event.target.checked,
                  });
                }}
              />
            </label>
          </div>
          <p className="muted">
            {row.connecting
              ? 'Connecting'
              : row.connected
                ? 'Connected'
                : 'Disconnected'}{' '}
            · {row.settings.tools.length} discovered tools
          </p>
          <div className="row wrap">
            <Button disabled={!!busy} onClick={() => setEditor(row)}>
              Edit
            </Button>
            <Button onClick={() => setTools(row)}>Inspect tools</Button>
            <Button
              disabled={!!busy || !row.settings.enabled}
              onClick={() => {
                void action(row, row.connected ? 'cancel' : 'connect');
              }}
            >
              {row.connected ? 'Disconnect' : 'Connect'}
            </Button>
            <Button
              disabled={!!busy || !row.connected}
              onClick={() => {
                void action(row, 'refreshTools');
              }}
            >
              Refresh tools
            </Button>
            <Button
              disabled={!!busy}
              onClick={() => {
                void action(row, 'deleteServer');
              }}
            >
              Remove
            </Button>
          </div>
          {busy === row.name && <p role="status">Updating this server…</p>}
        </article>
      ))}
      {editor && (
        <ServerEditor
          key={editor === 'new' ? 'new' : editor.name}
          accountId={accountId}
          row={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setEditor(undefined);
            try {
              await load();
            } catch (error) {
              setError(
                `Server saved, but the list could not refresh. ${message(error)}`,
              );
            }
          }}
        />
      )}
      {tools && (
        <Dialog
          title={`${tools.name} tools`}
          onClose={() => setTools(undefined)}
        >
          <p className="muted">
            Inventory from the last successful connection. Inspecting tools does
            not execute them.
          </p>
          {tools.settings.tools.length === 0 && (
            <Empty>This server advertised no tools.</Empty>
          )}
          {tools.settings.tools.map((tool) => (
            <details key={tool.name}>
              <summary>{tool.name}</summary>
              <p>{tool.description}</p>
              <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
            </details>
          ))}
        </Dialog>
      )}
    </section>
  );
}
function ServerEditor({
  accountId,
  row,
  onClose,
  onSaved,
}: {
  accountId: number;
  row?: Row;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const saved = row?.settings.server;
  const [name, setName] = useState(row?.name ?? '');
  const [type, setType] = useState<'stdio' | 'http'>(saved?.type ?? 'stdio');
  const [command, setCommand] = useState(
    saved?.type === 'stdio' ? saved.command : '',
  );
  const [args, setArgs] = useState(
    saved?.type === 'stdio' ? JSON.stringify(saved.args, null, 2) : '[]',
  );
  const [url, setUrl] = useState(saved?.type === 'http' ? saved.url : '');
  const savedValues =
    saved?.type === type
      ? saved.type === 'stdio'
        ? (saved.env ?? {})
        : (saved.headers ?? {})
      : {};
  const [preserved, setPreserved] = useState<string[]>(
    Object.keys(
      saved?.type === 'stdio' ? (saved.env ?? {}) : (saved?.headers ?? {}),
    ),
  );
  const [values, setValues] = useState<
    { id: string; key: string; value: string }[]
  >([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [tested, setTested] = useState<Tool[]>();
  function change() {
    setTested(undefined);
  }
  function input() {
    const record: Record<string, string> = Object.create(null);
    for (const item of values) {
      if (!item.key.trim() || item.key.trim() in record)
        throw new Error('Each credential needs a unique, nonempty name.');
      record[item.key.trim()] = item.value;
    }
    const keep = preserved.filter(
      (key) => key in savedValues && !(key in record),
    );
    let server: Server;
    if (type === 'stdio') {
      const parsed: unknown = JSON.parse(args);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((value) => typeof value === 'string')
      )
        throw new Error('Arguments must be a JSON array of strings.');
      server = { type, command, args: parsed, env: record };
    } else server = { type, url, headers: record };
    return {
      accountId,
      name: name.trim(),
      previousName: row?.name,
      server,
      ...(type === 'stdio'
        ? { preserveEnvKeys: keep }
        : { preserveHeaderKeys: keep }),
    };
  }
  async function submit(save: boolean) {
    setBusy(save ? 'save' : 'test');
    setError('');
    setTested(undefined);
    try {
      const result = await rpc<{ tools?: Tool[] }>(
        save ? 'mcp.saveServer' : 'mcp.testConnection',
        input(),
        true,
      );
      if (save) await onSaved();
      else setTested(result.tools ?? []);
    } catch (error) {
      let text = message(error);
      for (const value of values)
        if (value.value) text = text.replaceAll(value.value, '[redacted]');
      setError(text);
    } finally {
      setBusy('');
    }
  }
  return (
    <Dialog
      title={row ? 'Edit tool server' : 'Add tool server'}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="plugin-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(true);
        }}
        onChange={change}
      >
        <label>
          Name
          <input
            required
            value={name}
            disabled={!!busy}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          Connection
          <select
            value={type}
            disabled={!!busy}
            onChange={(event) => {
              setType(event.target.value as 'stdio' | 'http');
              setValues([]);
              setPreserved([]);
            }}
          >
            <option value="stdio">Local command (stdio)</option>
            <option value="http">Remote URL (streamable HTTP)</option>
          </select>
        </label>
        {type === 'stdio' ? (
          <>
            <label>
              Command
              <input
                required
                value={command}
                disabled={!!busy}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Absolute command path or executable name"
              />
            </label>
            <label>
              Arguments (JSON array)
              <textarea
                value={args}
                disabled={!!busy}
                onChange={(event) => setArgs(event.target.value)}
                spellCheck={false}
              />
            </label>
            <p className="muted">
              Testing or saving starts this command as your local user. Put
              secret values in environment fields below.
            </p>
          </>
        ) : (
          <>
            <label>
              Server URL
              <input
                required
                type="url"
                value={url}
                disabled={!!busy}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://your-server.example/mcp"
              />
            </label>
            <p className="muted">
              Use request headers for credentials. Interactive OAuth is
              unavailable in this build; saving does not open a sign-in flow.
            </p>
          </>
        )}
        <fieldset disabled={!!busy}>
          <legend>
            {type === 'stdio' ? 'Environment values' : 'Request headers'}
          </legend>
          <p className="muted">
            Saved values are write-only. Keep a saved key, remove it, or add the
            same key with a replacement value.
          </p>
          {Object.keys(savedValues).map((key) => (
            <label className="row" key={key}>
              <input
                type="checkbox"
                checked={preserved.includes(key)}
                onChange={(event) =>
                  setPreserved((current) =>
                    event.target.checked
                      ? [...current, key]
                      : current.filter((value) => value !== key),
                  )
                }
              />
              Keep saved {key}
            </label>
          ))}
          {values.map((value) => (
            <div className="credential-row" key={value.id}>
              <input
                aria-label="Credential name"
                value={value.key}
                onChange={(event) =>
                  setValues((current) =>
                    current.map((item) =>
                      item.id === value.id
                        ? { ...item, key: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <input
                aria-label={`Value for ${value.key || 'credential'}`}
                type="password"
                autoComplete="new-password"
                value={value.value}
                onChange={(event) =>
                  setValues((current) =>
                    current.map((item) =>
                      item.id === value.id
                        ? { ...item, value: event.target.value }
                        : item,
                    ),
                  )
                }
              />
              <Button
                onClick={() =>
                  setValues((current) =>
                    current.filter((item) => item.id !== value.id),
                  )
                }
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            onClick={() =>
              setValues((current) => [
                ...current,
                { id: crypto.randomUUID(), key: '', value: '' },
              ])
            }
          >
            Add {type === 'stdio' ? 'environment value' : 'header'}
          </Button>
        </fieldset>
        {error && <ErrorNotice error={error} />}
        {tested && (
          <output className="notice">
            Connection verified: {tested.length} tools discovered. Test
            connection has closed.
          </output>
        )}
        <div className="row wrap">
          <Button
            disabled={!!busy || !name.trim()}
            onClick={() => {
              void submit(false);
            }}
          >
            Test connection
          </Button>
          <Button
            type="submit"
            className="primary"
            disabled={!!busy || !name.trim()}
          >
            Verify and save
          </Button>
          <Button disabled={!!busy} onClick={onClose}>
            Cancel
          </Button>
          {busy && (
            <Button
              onClick={() => {
                void rpc(
                  'mcp.cancel',
                  { accountId, name: name.trim() },
                  true,
                ).catch((error) => setError(message(error)));
              }}
            >
              Stop connection
            </Button>
          )}
        </div>
        {busy && (
          <p role="status">
            Verifying the server and reading its tool inventory…
          </p>
        )}
      </form>
    </Dialog>
  );
}
