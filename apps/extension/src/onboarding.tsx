/** Original local setup flow; docs/spec/ui/onboarding.md. No source files are read until consent. */
import { Button, ErrorNotice, Mark } from '@aux/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rpc } from './daemon';
import {
  type ImportProgress,
  type ImportSource,
  native,
  preference,
} from './native';
import type { Model, ModelSelection } from './types';
import './onboarding.css';

const stages = [
  'welcome',
  'browser-import',
  'password-import',
  'model',
  'permissions',
  'appearance',
  'finish',
] as const;
type Stage = (typeof stages)[number];
const titles: Record<Stage, string> = {
  welcome: 'Make room for what matters.',
  'browser-import': 'Bring your browser with you.',
  'password-import': 'Keep your passwords close.',
  model: 'Connect a model to start.',
  permissions: 'Choose what Aux can access.',
  appearance: 'Make Aux your own.',
  finish: 'Your local workspace is ready.',
};
type Perform = (operation: () => Promise<void>) => void;
type StepProps = {
  accountId: number;
  pending: boolean;
  perform: Perform;
  report: (error: string) => void;
  registerLeave: (leave?: () => Promise<void>) => void;
  ready: (value: boolean) => void;
};
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'This step could not be saved. Try again.';
const setting = (accountId: number, key: string, value: unknown) =>
  rpc('settings.set', { accountId, key, value }, true);
const jobKey = (accountId: number) => `aux.onboarding.browser-job.${accountId}`;

export function Onboarding({ accountId }: { accountId: number }) {
  const [stage, setStage] = useState<Stage>('welcome');
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [deferred, setDeferred] = useState(false);
  const [completed, setCompleted] = useState<Partial<Record<Stage, boolean>>>(
    {},
  );
  const ready = useCallback(
    (value: boolean) => {
      setCompleted((current) => ({ ...current, [stage]: value }));
    },
    [stage],
  );
  const leave = useRef<(() => Promise<void>) | undefined>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const perform = useCallback<Perform>((operation) => {
    setPending(true);
    setError('');
    void operation()
      .catch((error) => setError(message(error)))
      .finally(() => setPending(false));
  }, []);
  const registerLeave = useCallback((callback?: () => Promise<void>) => {
    leave.current = callback;
  }, []);
  const load = useCallback(async () => {
    const values = await rpc<Record<string, unknown>>('settings.getAll', {
      accountId,
    });
    const saved = values['onboarding.stage'];
    setStage(stages.includes(saved as Stage) ? (saved as Stage) : 'welcome');
    setDeferred(values['onboarding.modelDeferred'] === true);
    setLoaded(true);
  }, [accountId]);
  useEffect(() => {
    perform(load);
  }, [load, perform]);
  useEffect(() => {
    document.title = `${titles[stage]} · Aux setup`;
    if (loaded) heading.current?.focus();
  }, [loaded, stage]);
  async function move(next: Stage, skip = false) {
    await leave.current?.();
    if (stage === 'model' && stages.indexOf(next) > stages.indexOf(stage)) {
      if (!skip) {
        const [inventory, settings] = await Promise.all([
          rpc<{
            credentials: { providerId: string; exists: boolean }[];
            models: Model[];
          }>('models.listSettingsInventory', { accountId }),
          rpc<Record<string, unknown>>('settings.getAll', { accountId }),
        ]);
        const selection = settings['models.default'] as
          | ModelSelection
          | undefined;
        if (
          !selection ||
          !inventory.credentials.some(
            (item) => item.exists && item.providerId === selection.provider,
          ) ||
          !inventory.models.some(
            (model) =>
              model.provider === selection.provider &&
              model.modelId === selection.modelId,
          )
        )
          throw new Error(
            'Save a model and its provider credential, or choose “Set up later” explicitly.',
          );
      }
      await setting(accountId, 'onboarding.modelDeferred', skip);
      setDeferred(skip);
    }
    await setting(accountId, 'onboarding.stage', next);
    setStage(next);
  }
  const index = stages.indexOf(stage);
  const step: StepProps = {
    accountId,
    pending,
    perform,
    report: setError,
    registerLeave,
    ready,
  };
  return (
    <main className="setup-page">
      <section
        className="setup-card"
        aria-label="Set up Aux"
        aria-busy={pending}
      >
        <header className="setup-header">
          <Mark />
          <span>Set up Aux</span>
          <small>
            Step {index + 1} of {stages.length}
          </small>
        </header>
        <ol className="setup-progress" aria-label="Setup progress">
          {stages.map((item, position) => (
            <li
              key={item}
              aria-current={item === stage ? 'step' : undefined}
              data-complete={position < index}
            >
              <span className="sr-only">{titles[item]}</span>
            </li>
          ))}
        </ol>
        <div className="setup-body">
          <h1 ref={heading} tabIndex={-1}>
            {titles[stage]}
          </h1>
          {!loaded ? (
            <p>Loading your saved setup…</p>
          ) : (
            <>
              {stage === 'welcome' && (
                <>
                  <p>
                    Aux stays on this Mac. Choose what to bring along, connect
                    AI when you are ready, and decide which local tools can
                    help.
                  </p>
                  <div className="setup-art" aria-hidden="true">
                    <span>Find</span>
                    <Mark />
                    <span>Do</span>
                  </div>
                  <p className="muted">
                    Optional steps can be skipped. Your progress is saved as you
                    continue.
                  </p>
                </>
              )}
              {stage === 'browser-import' && <BrowserImport {...step} />}
              {stage === 'password-import' && <PasswordImport {...step} />}
              {stage === 'model' && <ModelSetup {...step} />}
              {stage === 'permissions' && <Permissions {...step} />}
              {stage === 'appearance' && <Appearance {...step} />}
              {stage === 'finish' && (
                <>
                  <p>
                    {deferred
                      ? 'Model setup is deferred. You can browse now and add credentials in Settings before starting an AI task.'
                      : 'Your saved model credentials will be used when you start a task.'}
                  </p>
                  <p>
                    Optional imports and system grants remain available later.
                    Finishing saves this account’s setup on this Mac.
                  </p>
                </>
              )}
            </>
          )}
          {error && (
            <ErrorNotice
              error={error}
              retry={!loaded ? () => perform(load) : undefined}
            />
          )}
        </div>
        <footer className="setup-footer">
          <Button
            disabled={pending || !loaded || index === 0}
            onClick={() => perform(() => move(stages[index - 1] as Stage))}
          >
            Back
          </Button>
          {index > 0 && index < stages.length - 1 && (
            <Button
              disabled={pending || !loaded}
              onClick={() =>
                perform(() => move(stages[index + 1] as Stage, true))
              }
            >
              {stage === 'model' ? 'Set up later' : 'Skip for now'}
            </Button>
          )}
          <Button
            className="primary"
            disabled={
              pending ||
              !loaded ||
              (['browser-import', 'password-import'].includes(stage) &&
                !completed[stage])
            }
            onClick={() =>
              perform(async () => {
                if (stage !== 'finish') return move(stages[index + 1] as Stage);
                await rpc(
                  'accounts.completeOnboarding',
                  { accountId, deferModelSetup: deferred },
                  true,
                );
                location.hash = '/';
              })
            }
          >
            {pending ? 'Saving…' : stage === 'finish' ? 'Open Aux' : 'Continue'}
          </Button>
        </footer>
      </section>
    </main>
  );
}

function BrowserImport({
  accountId,
  pending,
  perform,
  report,
  registerLeave,
  ready,
}: StepProps) {
  const [sources, setSources] = useState<ImportSource[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>();
  const [loading, setLoading] = useState(true);
  const source = sources.find((item) => item.id === sourceId);
  const active =
    progress?.status === 'queued' || progress?.status === 'running';
  useEffect(() => {
    ready(progress?.status === 'succeeded');
  }, [progress?.status, ready]);
  const api = native?.auxBrowserImport;
  const cancel = useCallback(async () => {
    if (!api || !progress) return;
    await api.cancelImport(progress.jobId);
    setProgress({ ...progress, status: 'cancelled' });
  }, [progress]);
  useEffect(() => {
    registerLeave(active ? cancel : undefined);
    return () => registerLeave();
  }, [active, cancel, registerLeave]);
  useEffect(() => {
    let live = true;
    void (async () => {
      if (!api)
        throw new Error(
          'Browser import is unavailable in this native build. Install the native importer, or skip this optional step.',
        );
      const detected = await api.getImportSources();
      if (live) setSources(detected);
      const saved = await chrome.storage.local.get(jobKey(accountId));
      const jobId = saved[jobKey(accountId)];
      const previous =
        typeof jobId === 'string'
          ? await api.getImportProgress(jobId)
          : undefined;
      if (live) {
        setSources(detected);
        setProgress(previous);
      }
    })()
      .catch((error) => {
        if (live) report(message(error));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [accountId, report]);
  const jobId = progress?.jobId;
  useEffect(() => {
    if (!api || !active || !jobId) return;
    let live = true;
    const timer = setInterval(() => {
      void api
        .getImportProgress(jobId)
        .then((result) => {
          if (live) setProgress(result);
        })
        .catch((error) => {
          if (live) report(message(error));
        });
    }, 750);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [active, jobId, report]);
  return (
    <div className="stack">
      <p>
        Choose a source and profile before Aux reads any import data.
        Unavailable categories stay disabled.
      </p>
      {loading && <p>Finding import sources…</p>}
      {sources
        .filter((item) => item.installed)
        .map((item) => (
          <label className="setup-source" key={item.id}>
            <input
              type="radio"
              name="browser-source"
              disabled={pending || active}
              checked={sourceId === item.id}
              onChange={() => {
                setSourceId(item.id);
                setProfileId(item.profiles[0]?.id ?? '');
                setCategories(
                  (item.categories ?? []).filter((category) =>
                    ['bookmarks', 'history'].includes(category),
                  ),
                );
                setConsent(false);
              }}
            />
            <span>
              <strong>{item.name}</strong>
              <small>{item.profiles.length} available profiles</small>
            </span>
          </label>
        ))}
      {!loading && api && !sources.some((item) => item.installed) && (
        <p>
          No supported source profiles were detected. You can skip and import
          later.
        </p>
      )}
      {source && (
        <>
          <label>
            Source profile
            <select
              disabled={pending || active}
              value={profileId}
              onChange={(event) => {
                setProfileId(event.target.value);
                setConsent(false);
              }}
            >
              {source.profiles.map((profile) => (
                <option value={profile.id} key={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset disabled={pending || active}>
            <legend>Data to bring along</legend>
            {[
              'bookmarks',
              'history',
              'passwords',
              'cookies',
              'extensions',
              'preferences',
            ].map((category) => (
              <label className="setup-check" key={category}>
                <input
                  type="checkbox"
                  disabled={!source.categories?.includes(category)}
                  checked={categories.includes(category)}
                  onChange={(event) =>
                    setCategories((values) =>
                      event.target.checked
                        ? [...values, category]
                        : values.filter((value) => value !== category),
                    )
                  }
                />
                {category}
                {!source.categories?.includes(category) && (
                  <small>Unavailable</small>
                )}
              </label>
            ))}
          </fieldset>
          <label className="setup-check">
            <input
              type="checkbox"
              disabled={pending || active}
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            I authorize reading the selected profile and importing these
            categories.
          </label>
          <Button
            disabled={
              pending || active || !consent || !categories.length || !api
            }
            onClick={() =>
              perform(async () => {
                if (!api) return;
                const job = await api.startImport({
                  sourceId,
                  ...(profileId ? { sourceProfileId: profileId } : {}),
                  categories,
                });
                setProgress(job);
                await chrome.storage.local.set({
                  [jobKey(accountId)]: job.jobId,
                });
              })
            }
          >
            Import selected data
          </Button>
        </>
      )}
      {progress && (
        <div className="setup-result" role="status">
          <strong>{progress.status}</strong>
          <p>
            {progress.status === 'cancelled' ? 'Last reported: ' : ''}
            {progress.completed} of {progress.total} completed
            {progress.category ? ` · ${progress.category}` : ''}
          </p>
          {active && (
            <progress
              max={Math.max(1, progress.total)}
              value={progress.completed}
            />
          )}
          {progress.error && <ErrorNotice error={progress.error} />}
          {active && (
            <Button disabled={pending} onClick={() => perform(cancel)}>
              Cancel remaining work
            </Button>
          )}
          <small>
            Completed writes remain if you cancel. Import is never treated as a
            rollback.
          </small>
        </div>
      )}
    </div>
  );
}

type ImportPreview = {
  jobId: string;
  count: number;
  nextCursor: number | null;
  errors: { row: number; code: string; message: string }[];
  items: {
    id: string;
    title: string;
    username: string;
    category: string;
    passwordPresent: boolean;
  }[];
};
function PasswordImport({
  accountId,
  pending,
  perform,
  report,
  registerLeave,
  ready,
}: StepProps) {
  const [vaults, setVaults] = useState<{ id: string; name: string }[]>([]);
  const [vaultId, setVaultId] = useState('');
  const [format, setFormat] = useState('csv');
  const [preview, setPreview] = useState<ImportPreview>();
  const [accepted, setAccepted] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number }>();
  useEffect(() => {
    let live = true;
    void rpc<{ id: string; name: string }[]>('vault.listVaults', {
      accountId,
    })
      .then((vaults) => {
        if (live) {
          setVaults(vaults);
          setVaultId(vaults[0]?.id ?? '');
        }
      })
      .catch((error) => {
        if (live) report(message(error));
      });
    return () => {
      live = false;
    };
  }, [accountId, report]);
  useEffect(() => {
    ready(result !== undefined);
  }, [result, ready]);
  const cancel = useCallback(async () => {
    if (!preview) return;
    try {
      await rpc(
        'nativeImport.cancel',
        { accountId, jobId: preview.jobId },
        true,
      );
    } finally {
      setPreview(undefined);
    }
  }, [accountId, preview]);
  useEffect(() => {
    registerLeave(preview ? cancel : undefined);
    return () => registerLeave();
  }, [preview, cancel, registerLeave]);
  return (
    <div className="stack">
      <p>
        Choose an export yourself, review the item counts, then import into your
        unlocked encrypted Vault. Nothing is submitted to AI.
      </p>
      <label>
        Destination Vault
        <select
          value={vaultId}
          disabled={pending || !!preview}
          onChange={(event) => setVaultId(event.target.value)}
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name}
            </option>
          ))}
        </select>
      </label>
      {!vaults.length && (
        <p>
          Unlock or finish setting up your Vault before importing passwords.{' '}
          <a href="#/unlock">Open the security gate</a>
        </p>
      )}
      <label>
        Export format
        <select
          disabled={pending || !!preview}
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="csv">CSV export</option>
          <option value="bitwarden-json">Bitwarden JSON</option>
          <option value="1password-json">1Password JSON</option>
          <option value="1password-1pux">1Password 1PUX</option>
        </select>
      </label>
      <p className="muted">
        Export files can contain unencrypted passwords. Keep the chosen file
        private and remove it when you no longer need it.
      </p>
      {!preview && (
        <Button
          disabled={pending || !vaultId}
          onClick={() =>
            perform(async () => {
              const file = await rpc<{
                cancelled: boolean;
                path: string | null;
              }>('nativeImport.pickFile', { accountId }, true);
              if (file.cancelled || !file.path) return;
              const review = await rpc<ImportPreview>(
                'nativeImport.prepare',
                {
                  accountId,
                  vaultId,
                  path: file.path,
                  format,
                  authorized: true,
                },
                true,
              );
              setPreview(review);
              setAccepted(false);
              setResult(undefined);
            })
          }
        >
          Choose export and review
        </Button>
      )}
      {preview && (
        <div className="setup-result">
          <h2>{preview.count} items ready for review</h2>
          <p>
            {preview.errors.length} source errors. Password values remain
            hidden.
          </p>
          <ul>
            {preview.items.slice(0, 5).map((item) => (
              <li key={item.id}>
                {item.title}{' '}
                <small>
                  {item.category} ·{' '}
                  {item.passwordPresent ? 'Password present' : 'No password'}
                </small>
              </li>
            ))}
          </ul>
          {preview.count > 5 && (
            <small>Showing the first five reviewed items.</small>
          )}
          {preview.errors.slice(0, 5).map((error) => (
            <p key={`${error.row}.${error.code}`}>
              Row {error.row}: {error.message}
            </p>
          ))}
          <label className="setup-check">
            <input
              type="checkbox"
              checked={accepted}
              disabled={pending}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            Import these items into the selected Vault.
          </label>
          <div className="row">
            <Button disabled={pending} onClick={() => perform(cancel)}>
              Cancel review
            </Button>
            <Button
              disabled={pending || !accepted || !preview.count}
              onClick={() =>
                perform(async () => {
                  try {
                    const result = await rpc<{
                      created: number;
                      skipped: number;
                    }>(
                      'nativeImport.commit',
                      { accountId, jobId: preview.jobId, accepted: true },
                      true,
                    );
                    setPreview(undefined);
                    setResult(result);
                  } finally {
                    setPreview(undefined);
                  }
                })
              }
            >
              Import encrypted items
            </Button>
          </div>
        </div>
      )}
      {result && (
        <p role="status">
          {result.created} items encrypted and saved. {result.skipped}{' '}
          duplicates skipped.
        </p>
      )}
    </div>
  );
}

function ModelSetup({ accountId, pending, perform, report }: StepProps) {
  const [provider, setProvider] = useState('vercel-ai-gateway');
  const [key, setKey] = useState('');
  const [modelId, setModelId] = useState('meta/muse-spark-1.3-contributor');
  const [effort, setEffort] = useState('medium');
  const [credentials, setCredentials] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [notice, setNotice] = useState('');
  const reload = useCallback(async () => {
    const inventory = await rpc<{
      credentials: { providerId: string; exists: boolean }[];
      models: Model[];
    }>('models.listSettingsInventory', { accountId });
    setCredentials(
      inventory.credentials
        .filter((item) => item.exists)
        .map((item) => item.providerId),
    );
    setModels(inventory.models);
  }, [accountId]);
  useEffect(() => {
    void reload().catch((error) => report(message(error)));
  }, [reload, report]);
  const selected = models.find(
    (model) => model.provider === provider && model.modelId === modelId,
  );
  const efforts =
    selected?.thinkingLevels ??
    (provider === 'vercel-ai-gateway' &&
    modelId === 'meta/muse-spark-1.3-contributor'
      ? ['minimal', 'low', 'medium', 'high', 'xhigh', 'max']
      : []);
  return (
    <form
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        perform(async () => {
          if (key)
            await rpc(
              'models.setCredential',
              {
                accountId,
                providerId: provider,
                credential: { type: 'api_key', key },
              },
              true,
            );
          else if (!credentials.includes(provider))
            throw new Error('Enter an API key for this provider.');
          await rpc(
            'models.setAiGatewayModelIds',
            { accountId, providerId: provider, modelIds: [modelId] },
            true,
          );
          await setting(accountId, 'models.default', {
            provider,
            modelId,
            thinkingLevel: efforts.includes(effort) ? effort : 'off',
            fastMode: false,
          } satisfies ModelSelection);
          await setting(accountId, 'onboarding.modelDeferred', false);
          setKey('');
          await reload();
          setNotice(
            'Credential and model saved on this Mac. The connection is checked when you start a task.',
          );
        });
      }}
    >
      <p>
        Credentials are write-only. Saving a connection does not send a paid
        model request. Choose “Set up later” to finish without AI.
      </p>
      <label>
        Provider
        <select
          value={provider}
          disabled={pending}
          onChange={(event) => {
            setProvider(event.target.value);
            setModelId(
              event.target.value === 'vercel-ai-gateway'
                ? 'meta/muse-spark-1.3-contributor'
                : '',
            );
            setKey('');
            setNotice('');
          }}
        >
          {[
            'vercel-ai-gateway',
            'openrouter',
            'openai',
            'anthropic',
            'google',
          ].map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label>
        API key
        {credentials.includes(provider) && (
          <small>Saved credential available; leave blank to keep it.</small>
        )}
        <input
          type="password"
          autoComplete="off"
          value={key}
          disabled={pending}
          onChange={(event) => setKey(event.target.value)}
          required={!credentials.includes(provider)}
        />
      </label>
      <label>
        Model ID
        <input
          value={modelId}
          list="setup-models"
          required
          disabled={pending}
          onChange={(event) => setModelId(event.target.value)}
        />
        <datalist id="setup-models">
          {models
            .filter((model) => model.provider === provider)
            .map((model) => (
              <option key={model.id} value={model.modelId}>
                {model.name}
              </option>
            ))}
        </datalist>
      </label>
      {!!efforts.length && (
        <label>
          Effort
          <select
            value={efforts.includes(effort) ? effort : efforts[0]}
            disabled={pending}
            onChange={(event) => setEffort(event.target.value)}
          >
            {efforts.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      )}
      <Button type="submit" disabled={pending}>
        Save model connection
      </Button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
}

const grants = [
  [
    'accessibility',
    'Accessibility',
    'Read accessible controls and operate apps you approve.',
  ],
  [
    'screenRecording',
    'Screen capture',
    'Capture the screen for an authorized task.',
  ],
  ['contacts', 'Contacts', 'Search your contacts when you ask.'],
  [
    'fullDiskAccess',
    'Full disk access',
    'Open the system settings pane; Aux cannot infer the grant.',
  ],
] as const;
function Permissions({ accountId, pending, perform, report }: StepProps) {
  const [permissions, setPermissions] = useState<Record<string, unknown>>();
  const [bundleId, setBundleId] = useState('');
  const refresh = useCallback(async () => {
    setPermissions(
      await rpc('computerUse.permissions', {
        accountId,
        automationTargets: bundleId ? [bundleId] : [],
      }),
    );
  }, [accountId, bundleId]);
  useEffect(() => {
    let live = true;
    void rpc<Record<string, unknown>>('computerUse.permissions', { accountId })
      .then((value) => {
        if (live) setPermissions(value);
      })
      .catch((error) => {
        if (live) report(message(error));
      });
    return () => {
      live = false;
    };
  }, [accountId, report]);
  return (
    <div className="stack">
      <p>
        These grants are optional and separate. Clicking a request never counts
        as permission being granted.
      </p>
      {grants.map(([kind, title, detail]) => (
        <div className="setup-permission" key={kind}>
          <div>
            <strong>{title}</strong>
            <p>{detail}</p>
            <small>
              {typeof permissions?.[kind] === 'string'
                ? String(permissions[kind])
                : 'Status unavailable'}
            </small>
          </div>
          <Button
            disabled={pending || permissions?.[kind] === 'granted'}
            onClick={() =>
              perform(async () => {
                await rpc(
                  'computerUse.requestPermission',
                  { accountId, kind },
                  true,
                );
                await refresh();
              })
            }
          >
            Request
          </Button>
        </div>
      ))}
      <label>
        Automation target app bundle ID
        <input
          value={bundleId}
          onChange={(event) => setBundleId(event.target.value)}
          placeholder="com.apple.TextEdit"
        />
      </label>
      <div className="row">
        <Button
          disabled={
            pending || !/^[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(bundleId)
          }
          onClick={() =>
            perform(async () => {
              await rpc(
                'computerUse.requestPermission',
                { accountId, kind: 'automation', bundleId },
                true,
              );
              await refresh();
            })
          }
        >
          Request this app’s automation grant
        </Button>
      </div>
      {Array.isArray(permissions?.automation) &&
        permissions.automation.map(
          (value: { bundleId: string; state: string }) => (
            <small key={value.bundleId}>
              {value.bundleId}: {value.state}
            </small>
          ),
        )}
      <div className="setup-result">
        <strong>Messages</strong>
        <p>
          {typeof permissions?.messages === 'string'
            ? permissions.messages
            : 'Requires a separately approved operation.'}{' '}
          No blanket message access is enabled here.
        </p>
      </div>
      <Button disabled={pending} onClick={() => perform(refresh)}>
        Refresh actual permission status
      </Button>
    </div>
  );
}

function Appearance({ accountId, pending, perform, report }: StepProps) {
  const [theme, setTheme] = useState('system');
  const [shortcut, setShortcut] = useState('');
  const [notice, setNotice] = useState('');
  const [defaultState, setDefaultState] = useState('Not checked');
  useEffect(() => {
    let live = true;
    void rpc<{ theme?: string }>('settings.getAll', { accountId })
      .then((values) => {
        if (live) setTheme(values.theme ?? 'system');
      })
      .catch((error) => {
        if (live) report(message(error));
      });
    const get = native?.auxMiniPopup?.getShortcut;
    if (get)
      void get()
        .then((value) => {
          if (live && typeof value === 'string') setShortcut(value);
        })
        .catch((error) => {
          if (live) report(message(error));
        });
    return () => {
      live = false;
    };
  }, [accountId, report]);
  return (
    <div className="stack">
      <label>
        Appearance
        <select
          value={theme}
          disabled={pending}
          onChange={(event) => {
            const value = event.target.value;
            perform(async () => {
              await setting(accountId, 'theme', value);
              setTheme(value);
              localStorage.setItem('aux.theme', value);
              document.documentElement.dataset.theme =
                value === 'system'
                  ? matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                  : value;
              await preference('setBrowserColorScheme', value);
            });
          }}
        >
          <option value="system">Use system appearance</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label>
        Global Aux shortcut
        <input
          value={shortcut}
          disabled={pending}
          onChange={(event) => setShortcut(event.target.value)}
          placeholder="Read from native shortcut settings"
        />
      </label>
      <Button
        disabled={pending || !shortcut}
        onClick={() =>
          perform(async () => {
            const set = native?.auxMiniPopup?.setShortcut;
            const get = native?.auxMiniPopup?.getShortcut;
            if (!set || !get)
              throw new Error(
                'This native build cannot register the global shortcut.',
              );
            await set(shortcut);
            const actual = await get();
            if (typeof actual !== 'string')
              throw new Error('Native shortcut state could not be verified.');
            setShortcut(actual);
            setNotice('Native shortcut registration saved.');
          })
        }
      >
        Save global shortcut
      </Button>
      <div className="setup-result">
        <strong>Default browser</strong>
        <p>{defaultState}</p>
        <Button
          disabled={pending}
          onClick={() =>
            perform(async () => {
              await preference('setAsDefaultBrowser');
              const result = await preference('getDefaultBrowserState');
              setDefaultState(
                typeof result === 'string' ? result : JSON.stringify(result),
              );
            })
          }
        >
          Ask macOS to use Aux
        </Button>
      </div>
      <p className="muted">
        The command line tool is bundled with Aux. Add its installed location to
        your shell when you need it; setup does not edit shell configuration.
      </p>
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
