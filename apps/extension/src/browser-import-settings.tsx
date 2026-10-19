import { Button, Dialog, ErrorNotice } from '@aux/ui';
import { ChevronDown, Globe } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { type ImportProgress, type ImportSource, native } from './native';
import './browser-import-settings.css';

const categories = [
  'bookmarks',
  'history',
  'passwords',
  'cookies',
  'extensions',
  'preferences',
];
const running = (job?: ImportProgress) =>
  job?.status === 'queued' || job?.status === 'running';
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'Browser import could not continue.';
export function BrowserImportSettings({ accountId }: { accountId: number }) {
  const [open, setOpen] = useState(false),
    [menu, setMenu] = useState(false);
  const [sources, setSources] = useState<ImportSource[]>([]),
    [sourceId, setSourceId] = useState(''),
    [profileId, setProfileId] = useState('');
  const [selected, setSelected] = useState<string[]>([]),
    [consent, setConsent] = useState(false),
    [archive, setArchive] = useState<File>();
  const [job, setJob] = useState<ImportProgress>(),
    [pending, setPending] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('');
  const source = sources.find((item) => item.id === sourceId),
    active = running(job);
  const capability = useCallback(async () => {
    const api = native?.auxBrowserImport;
    if (!api || !native?.auxAccount)
      throw new Error(
        'Browser import is unavailable in this native build. Install the rebuilt Aux browser to import data.',
      );
    const context = await native.auxAccount.getProfileContext();
    if (
      context.browserMode !== 'default' ||
      context.accountId !== accountId ||
      context.isLocked !== false
    )
      throw new Error(
        'Unlock the current account in a regular browser profile before importing.',
      );
    return api;
  }, [accountId]);
  useEffect(() => {
    if (!open) return;
    let live = true;
    setLoading(true);
    void capability()
      .then((api) => api.getImportSources())
      .then((items) => {
        if (live) setSources(items);
      })
      .catch((reason) => {
        if (live) setError(message(reason));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [open, capability]);
  useEffect(() => {
    if (!active || !job?.jobId) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout>;
    const jobId = job.jobId;
    async function poll() {
      try {
        const api = await capability(),
          next = await api.getImportProgress(jobId);
        if (live) {
          setJob(next);
          setError('');
        }
      } catch (reason) {
        if (live) setError(message(reason));
      }
      if (live) timer = setTimeout(poll, 1000);
    }
    timer = setTimeout(poll, 500);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [active, job?.jobId, capability]);
  async function perform(action: () => Promise<void>) {
    setPending(true);
    setError('');
    try {
      await action();
    } catch (reason) {
      setError(message(reason));
    } finally {
      setPending(false);
    }
  }
  function choose(item: ImportSource) {
    setSourceId(item.id);
    setProfileId(item.profiles[0]?.id ?? '');
    setSelected(
      (item.categories ?? []).filter(
        (value) => value === 'bookmarks' || value === 'history',
      ),
    );
    setConsent(false);
    setArchive(undefined);
    setMenu(false);
    setJob(undefined);
  }
  return (
    <>
      <div className="setting">
        <div>
          <strong>Import browser data</strong>
          <small>Choose a source, profile and supported data categories.</small>
        </div>
        <Button onClick={() => setOpen(true)}>
          {active ? 'View import' : 'Import…'}
        </Button>
      </div>
      {open && (
        <Dialog
          title="Import browser data"
          onClose={() => {
            if (!pending) {
              setOpen(false);
              setMenu(false);
            }
          }}
        >
          <div className="settings-browser-import">
            <div className="browser-import-body stack">
              <p>
                Aux reads only the source and categories you authorize.
                Passwords imported here belong to the browser; Vault file import
                is separate.
              </p>
              {error && <ErrorNotice error={error} />}
              {loading && <p role="status">Finding import sources…</p>}
              <Button
                className="browser-import-selected"
                disabled={
                  loading ||
                  pending ||
                  active ||
                  !sources.some((item) => item.installed)
                }
                aria-expanded={menu}
                aria-controls="browser-import-sources"
                onClick={() => setMenu((value) => !value)}
              >
                <Globe size={20} />
                <span>{source?.name ?? 'Choose a browser'}</span>
                <ChevronDown size={16} />
              </Button>
              {menu && (
                <fieldset
                  id="browser-import-sources"
                  className="browser-import-sources"
                  aria-label="Import sources"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      event.stopPropagation();
                      setMenu(false);
                    }
                  }}
                >
                  {sources
                    .filter((item) => item.installed)
                    .map((item) => (
                      <Button
                        key={item.id}
                        className="browser-import-option"
                        aria-pressed={sourceId === item.id}
                        onClick={() => choose(item)}
                      >
                        <Globe size={18} />
                        <span>{item.name}</span>
                      </Button>
                    ))}
                </fieldset>
              )}
              {!loading &&
                !error &&
                !sources.some((item) => item.installed) && (
                  <p>No supported import sources were detected.</p>
                )}
              {source && (
                <fieldset
                  disabled={pending || active}
                  className="browser-import-fields stack"
                >
                  <legend>Source and data</legend>
                  <label>
                    Source profile
                    <select
                      value={profileId}
                      onChange={(event) => {
                        setProfileId(event.target.value);
                        setConsent(false);
                      }}
                    >
                      {source.profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {source.id === 'safari' && (
                    <label>
                      Safari export ZIP
                      <input
                        type="file"
                        accept=".zip,application/zip"
                        onChange={(event) => {
                          setArchive(event.target.files?.[0]);
                          setConsent(false);
                        }}
                      />
                      <small>Choose the export to read. Maximum 16 MiB.</small>
                    </label>
                  )}
                  <strong>Data to import</strong>
                  {categories.map((category) => (
                    <label className="browser-import-check" key={category}>
                      <input
                        type="checkbox"
                        disabled={!source.categories?.includes(category)}
                        checked={selected.includes(category)}
                        onChange={(event) => {
                          setSelected((values) =>
                            event.target.checked
                              ? [...values, category]
                              : values.filter((value) => value !== category),
                          );
                          setConsent(false);
                        }}
                      />
                      {category}
                      {!source.categories?.includes(category) && (
                        <small>Unavailable</small>
                      )}
                    </label>
                  ))}
                  <label className="browser-import-check">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                    />
                    I authorize reading this source and importing the selected
                    data.
                  </label>
                </fieldset>
              )}
              {job && (
                <div role="status" className="stack">
                  <strong>
                    {job.status === 'succeeded'
                      ? 'Import completed'
                      : job.status === 'cancelled'
                        ? 'Import cancelled'
                        : job.status === 'failed'
                          ? 'Import failed'
                          : 'Import in progress'}
                  </strong>
                  <progress
                    max={Math.max(1, job.total)}
                    value={job.completed}
                  />
                  <span>
                    {job.completed} of {job.total}
                    {job.category ? ` · ${job.category}` : ''}
                  </span>
                  {job.error && <ErrorNotice error={job.error} />}
                </div>
              )}
            </div>
            <div className="row spread browser-import-footer">
              <Button disabled={pending} onClick={() => setOpen(false)}>
                {active ? 'Keep importing in background' : 'Close'}
              </Button>
              {active ? (
                <Button
                  disabled={pending}
                  onClick={() =>
                    perform(async () => {
                      if (!job) return;
                      const api = await capability();
                      await api.cancelImport(job.jobId);
                      setJob(await api.getImportProgress(job.jobId));
                    })
                  }
                >
                  Cancel import
                </Button>
              ) : (
                <Button
                  disabled={
                    pending ||
                    loading ||
                    !source ||
                    !profileId ||
                    !selected.length ||
                    !consent ||
                    (source.id === 'safari' && !archive)
                  }
                  onClick={() =>
                    perform(async () => {
                      if (!source) return;
                      const api = await capability();
                      let safariArchive:
                        | { fileName: string; data: number[] }
                        | undefined;
                      if (source.id === 'safari') {
                        if (
                          !archive ||
                          !/\.zip$/i.test(archive.name) ||
                          archive.size === 0 ||
                          archive.size > 16 * 1024 * 1024
                        )
                          throw new Error(
                            'Choose a nonempty Safari export ZIP no larger than 16 MiB.',
                          );
                        safariArchive = {
                          fileName: archive.name,
                          data: Array.from(
                            new Uint8Array(await archive.arrayBuffer()),
                          ),
                        };
                      }
                      const options = {
                        sourceId: source.id,
                        sourceProfileId: profileId,
                        categories: selected,
                        ...(safariArchive ? { safariArchive } : {}),
                      };
                      await capability();
                      setJob(await api.startImport(options));
                      setConsent(false);
                    })
                  }
                >
                  {pending ? 'Starting…' : 'Import selected data'}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
