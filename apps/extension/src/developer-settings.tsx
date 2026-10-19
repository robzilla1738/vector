import { Button, Empty, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './daemon';
import './plugin-settings.css';

type Cli = {
  available: boolean;
  installed: boolean;
  conflict: boolean;
  path: string;
  executable?: string;
  onPath: boolean;
};
type Destination = {
  id: string;
  path: string;
  installed: boolean;
  original: boolean;
};
const labels: Record<string, string> = {
  general: 'Shared agent skills',
  codex: 'Codex',
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  opencode: 'OpenCode',
};
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Developer tools could not be updated.';
export function DeveloperSettings({ accountId }: { accountId: number }) {
  const [cli, setCli] = useState<Cli>();
  const [destinations, setDestinations] = useState<Destination[]>();
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      rpc<Cli>('developers.checkCliInstallation', { accountId }),
      rpc<Destination[]>('developers.checkAgentInstallations', { accountId }),
      rpc<{ body: string }>('developers.getAuxBrowserSkill', { accountId }),
    ]);
    const [cli, destinations, skill] = results;
    if (cli.status === 'fulfilled') setCli(cli.value);
    if (destinations.status === 'fulfilled')
      setDestinations(destinations.value);
    if (skill.status === 'fulfilled') setInstructions(skill.value.body);
    const failures = results
      .filter((result) => result.status === 'rejected')
      .map((result) =>
        result.status === 'rejected' ? message(result.reason) : '',
      );
    if (failures.length) throw new Error(failures.join(' '));
  }, [accountId]);
  useEffect(() => {
    void load().catch((error) => setError(message(error)));
  }, [load]);
  async function install(id?: string) {
    const destination = destinations?.find((item) => item.id === id);
    if (
      !confirm(
        id
          ? `Install Aux browser instructions at ${destination?.path}? Existing files are preserved.`
          : `Create the Aux command at ${cli?.path}? Existing commands are preserved.`,
      )
    )
      return;
    setBusy(id ?? 'cli');
    setError('');
    try {
      await rpc(
        id ? 'developers.installAuxBrowserSkill' : 'developers.installCli',
        { accountId, ...(id ? { id } : {}) },
        true,
      );
      await load();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy('');
    }
  }
  return (
    <section className="plugin-settings">
      {busy && <p role="status">Installing locally…</p>}
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
      <article className="plugin-card">
        <h3>Aux command line</h3>
        {!cli ? (
          <p role="status">Checking bundled command…</p>
        ) : (
          <>
            <p>
              {cli.installed
                ? 'Command installed'
                : cli.conflict
                  ? 'An existing command occupies the destination'
                  : cli.available
                    ? 'Bundled command ready to install'
                    : 'Bundled executable unavailable; launch an assembled Aux installation.'}
            </p>
            <code>{cli.path}</code>
            {cli.installed && !cli.onPath && (
              <p className="muted">
                The daemon’s PATH does not include this directory. Add
                ~/.local/bin to your shell PATH, or invoke the displayed
                absolute path.
              </p>
            )}
            <div className="row">
              <Button
                disabled={
                  !!busy || !cli.available || cli.installed || cli.conflict
                }
                onClick={() => {
                  void install();
                }}
              >
                Install command
              </Button>
            </div>
          </>
        )}
      </article>
      <article className="plugin-card">
        <h3>Coding-agent skill destinations</h3>
        <p className="muted">
          These are local instruction-file destinations. File presence does not
          prove an agent application is installed. Existing instruction files
          are preserved.
        </p>
        {!destinations && <p role="status">Checking instruction files…</p>}
        {destinations?.map((item) => (
          <div className="setting row spread wrap" key={item.id}>
            <div>
              <strong>{labels[item.id] ?? item.id}</strong>
              <small>{item.path}</small>
              <small>
                {item.installed
                  ? item.original
                    ? 'Aux instructions present'
                    : 'Existing customized or independent instructions present'
                  : 'Not installed'}
              </small>
            </div>
            <Button
              disabled={!!busy || item.installed}
              onClick={() => {
                void install(item.id);
              }}
            >
              Install skill
            </Button>
          </div>
        ))}
        <Button
          disabled={!!busy}
          onClick={() => {
            void load()
              .then(() => setError(''))
              .catch((error) => setError(message(error)));
          }}
        >
          Refresh installation status
        </Button>
      </article>
      <article className="plugin-card">
        <h3>Connect through MCP</h3>
        <p>
          Configure your coding agent to launch the installed{' '}
          <code>aux mcp</code> command using stdio. Run <code>aux --help</code>{' '}
          for profile and account selection. The browser must be available and
          unlocked for browser operations.
        </p>
        <p className="muted">
          Connecting an agent does not authorize external messages. Browser and
          tool approval policies continue to apply.
        </p>
      </article>
      <details>
        <summary>Aux browser skill instructions</summary>
        {instructions ? (
          <pre>{instructions}</pre>
        ) : (
          <Empty>Instructions could not be loaded.</Empty>
        )}
      </details>
    </section>
  );
}
