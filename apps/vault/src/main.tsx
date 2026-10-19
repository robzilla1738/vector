// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable versioned records and import previews may repeat field labels; updated revisions remount the parent.
import { Button, Dialog, Empty, ErrorNotice, Mark } from '@aux/ui';
import {
  Copy,
  Eye,
  EyeOff,
  LockKeyhole,
  Plus,
  Search,
  Settings,
  Star,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@aux/ui/tokens.css';
import './styles.css';
import type { FillContext, Snapshot, VaultItem, VaultStatus } from './client';
import { backgroundRequest, reconnect, resolveAccount, rpc } from './client';

function App() {
  const [accountId, setAccountId] = useState<number>();
  const [status, setStatus] = useState<VaultStatus>();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [editor, setEditor] = useState<VaultItem | 'new'>();
  const [settings, setSettings] = useState(false);
  const [importing, setImporting] = useState(false);
  const [context, setContext] = useState<FillContext>();
  const clearSecrets = useCallback(() => {
    setSnapshot(undefined);
    setSelectedId('');
    setEditor(undefined);
    setContext(undefined);
    setSettings(false);
    setImporting(false);
    setNotice('');
  }, []);
  const refresh = useCallback(
    async (id: number) => {
      const current = await rpc<VaultStatus>('passwordManager.auth.status', {
        accountId: id,
      });
      setStatus(current);
      if (current.locked) {
        clearSecrets();
        return;
      }
      const data = await rpc<Snapshot>('vault.getSnapshot', { accountId: id });
      setSnapshot(data);
      setVaultId((previous) =>
        data.vaults.some((vault) => vault.id === previous)
          ? previous
          : (data.vaults[0]?.id ?? ''),
      );
    },
    [clearSecrets],
  );
  const connect = useCallback(() => {
    setError('');
    void resolveAccount()
      .then(async (account) => {
        setAccountId(account.accountId);
        await refresh(account.accountId);
      })
      .catch((error) => setError(error.message));
  }, [refresh]);
  useEffect(connect, [connect]);
  useEffect(() => {
    if (accountId === undefined) return;
    let active = true;
    const interval = setInterval(() => {
      void rpc<VaultStatus>('passwordManager.auth.status', { accountId })
        .then((current) => {
          if (!active) return;
          setStatus((previous) =>
            current.locked || !previous?.locked ? current : previous,
          );
          if (current.locked) clearSecrets();
        })
        .catch((error) => {
          if (active) {
            clearSecrets();
            setError(error.message);
          }
        });
    }, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [accountId, clearSecrets]);
  useEffect(() => {
    const theme = localStorage.getItem('aux.theme') ?? 'system';
    document.documentElement.dataset.theme =
      theme === 'system'
        ? matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
  }, []);
  async function mutate(procedure: string, input: Record<string, unknown>) {
    if (accountId === undefined)
      throw new Error('The local account is not ready.');
    setPending(true);
    setError('');
    try {
      const result = await rpc(procedure, { accountId, ...input }, true);
      await refresh(accountId);
      return result;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'This Vault change could not be saved.',
      );
      throw error;
    } finally {
      setPending(false);
    }
  }
  async function pageContext() {
    try {
      const target = await backgroundRequest<FillContext>({
        type: 'aux.vault.pageContext',
      });
      setContext(target);
      setNotice(
        `Choose a matching login for ${new URL(target.documentUrl).hostname}.`,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Focus a login field before filling.',
      );
    }
  }
  const selected = snapshot?.items.find((item) => item.id === selectedId);
  if (accountId === undefined || !status)
    return (
      <main className="vault-gate">
        <Mark />
        <h1>Aux Vault</h1>
        {error ? (
          <ErrorNotice
            error={error}
            retry={() => {
              reconnect();
              connect();
            }}
          />
        ) : (
          <p role="status">Checking your local Vault…</p>
        )}
      </main>
    );
  if (status.locked)
    return (
      <AuthGate
        key={`${accountId}.${status.initialized}`}
        accountId={accountId}
        initialized={status.initialized}
        onUnlocked={() => refresh(accountId)}
        error={error}
      />
    );
  const rows = (snapshot?.items ?? []).filter(
    (item) =>
      item.state === 'active' &&
      (!vaultId || item.vaultId === vaultId) &&
      (!category || item.category === category) &&
      `${item.title} ${item.subtitle} ${item.tags.join(' ')}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <div className="vault">
      <header className="vault-header row spread">
        <strong>Aux Vault</strong>
        <div className="row">
          <Button
            className="icon ghost"
            aria-label="Import saved items"
            title="Import"
            onClick={() => setImporting(true)}
          >
            <Upload size={16} />
          </Button>
          <Button
            className="icon ghost"
            aria-label="Preferences"
            onClick={() => setSettings(true)}
          >
            <Settings size={16} />
          </Button>
          <Button
            className="icon ghost"
            aria-label="Lock vault"
            disabled={pending}
            onClick={() =>
              void mutate('passwordManager.auth.lock', {}).catch(() => {})
            }
          >
            <LockKeyhole size={16} />
          </Button>
        </div>
      </header>
      {error && <ErrorNotice error={error} />}{' '}
      {notice && <output className="vault-notice">{notice}</output>}
      <div className="vault-panes">
        <section className="vault-list">
          <div className="search-row">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Find a saved item"
              placeholder="Find a saved item"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button
              className="icon ghost"
              aria-label="New item"
              onClick={() => setEditor('new')}
            >
              <Plus size={16} />
            </Button>
          </div>
          <div className="row filters">
            <select
              aria-label="Vault"
              value={vaultId}
              onChange={(event) => setVaultId(event.target.value)}
            >
              {snapshot?.vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All items</option>
              <option value="login">Logins</option>
              <option value="card">Cards</option>
              <option value="secure-note">Secure notes</option>
              <option value="identity">Identities</option>
            </select>
          </div>
          <div className="items" role="listbox" aria-label="Saved items">
            {!snapshot ? (
              <Empty>Loading…</Empty>
            ) : rows.length === 0 ? (
              <Empty>
                {query
                  ? 'No saved items matched.'
                  : 'Add a login, card or secure note.'}
              </Empty>
            ) : (
              rows.map((item) => (
                <button
                  className="vault-item"
                  type="button"
                  role="option"
                  aria-selected={selectedId === item.id}
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className="item-glyph" aria-hidden="true">
                    {item.title.slice(0, 1).toLocaleUpperCase()}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle || item.category}</small>
                  </span>
                  {item.favorite && <Star size={12} aria-label="Favorite" />}
                </button>
              ))
            )}
          </div>
        </section>
        <section className="vault-detail">
          {selected ? (
            <ItemDetail
              key={`${selected.id}.${selected.revision}`}
              item={selected}
              accountId={accountId}
              context={context}
              pending={pending}
              onEdit={() => setEditor(selected)}
              onDelete={() => {
                if (confirm('Delete this item? This cannot be undone.'))
                  void mutate('vault.deleteItem', { itemId: selected.id })
                    .then(() => setSelectedId(''))
                    .catch(() => {});
              }}
              onFill={() => {
                if (!context) {
                  void pageContext();
                  return;
                }
                setPending(true);
                void backgroundRequest<{ filled: boolean }>({
                  type: 'aux.vault.fill',
                  accountId,
                  itemId: selected.id,
                  contextToken: context.contextToken,
                })
                  .then(() => {
                    setNotice('The selected fields are filled.');
                    setContext(undefined);
                  })
                  .catch((error) => setError(error.message))
                  .finally(() => setPending(false));
              }}
              onError={setError}
            />
          ) : (
            <Empty>
              <LockKeyhole size={32} />
              <p>Select an item to view it.</p>
              <Button onClick={() => void pageContext()}>Fill this page</Button>
            </Empty>
          )}
        </section>
      </div>
      {editor && snapshot && (
        <ItemEditor
          item={editor === 'new' ? undefined : editor}
          vaultId={vaultId}
          vaults={snapshot.vaults}
          pending={pending}
          onClose={() => setEditor(undefined)}
          onSave={async (fields) => {
            const result = (await mutate(
              editor === 'new' ? 'vault.createItem' : 'vault.updateItem',
              editor === 'new'
                ? { item: fields }
                : {
                    itemId: editor.id,
                    baseRevision: editor.revision,
                    patch: fields,
                  },
            )) as VaultItem;
            setSelectedId(result.id);
            setEditor(undefined);
          }}
        />
      )}
      {settings && (
        <VaultSettings
          accountId={accountId}
          snapshot={snapshot}
          pending={pending}
          mutate={mutate}
          onClose={() => setSettings(false)}
          onError={setError}
        />
      )}{' '}
      {importing && snapshot && (
        <ImportDialog
          accountId={accountId}
          vaultId={vaultId}
          onClose={() => setImporting(false)}
          onImported={() => refresh(accountId)}
        />
      )}
    </div>
  );
}

function AuthGate({
  accountId,
  initialized,
  onUnlocked,
  error: parentError,
}: {
  accountId: number;
  initialized: boolean;
  onUnlocked: () => Promise<void>;
  error: string;
}) {
  const [mode, setMode] = useState(initialized ? 'unlock' : 'setup');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recovery, setRecovery] = useState('');
  const [issuedKey, setIssuedKey] = useState('');
  const [verification, setVerification] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [biometry, setBiometry] = useState<{
    available: boolean;
    enrolled: boolean;
  }>();
  useEffect(() => {
    let active = true;
    void rpc<{ available: boolean; enrolled: boolean }>(
      'passwordManager.auth.biometricStatus',
      { accountId },
    )
      .then((value) => {
        if (active) setBiometry(value);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [accountId]);
  async function submit() {
    if (mode !== 'unlock' && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const procedure =
        mode === 'setup'
          ? 'passwordManager.auth.setup'
          : mode === 'recover'
            ? 'passwordManager.auth.recoverPassword'
            : 'passwordManager.auth.unlock';
      const result = await rpc<{ recoveryKey?: string }>(
        procedure,
        {
          accountId,
          ...(mode === 'recover'
            ? { recoveryKey: recovery, newPassword: password }
            : { password }),
        },
        true,
      );
      setPassword('');
      setConfirmPassword('');
      setRecovery('');
      if (result.recoveryKey) {
        setIssuedKey(result.recoveryKey);
        return;
      }
      await onUnlocked();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The Vault could not be unlocked.',
      );
    } finally {
      setPending(false);
    }
  }
  if (issuedKey)
    return (
      <main className="vault-gate recovery">
        <h2>Save your recovery key</h2>
        <p>
          Keep this key somewhere safe. It is required if you lose your Vault
          password. A replacement key invalidates your previous key.
        </p>
        <code className="recovery-key">{issuedKey}</code>
        <div className="row">
          <Button
            onClick={() =>
              void navigator.clipboard
                .writeText(issuedKey)
                .then(() => setCopied(true))
                .catch(() => setError('The recovery key could not be copied.'))
            }
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            onClick={() => {
              const blob = new Blob([`${issuedKey}\n`], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'aux-vault-recovery.txt';
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Save file
          </Button>
        </div>
        <label className="row">
          <input
            type="checkbox"
            checked={saved}
            onChange={(event) => setSaved(event.target.checked)}
          />
          I saved this key somewhere safe.
        </label>
        <label>
          Enter the last six characters to verify your saved key
          <input
            className="field"
            autoComplete="off"
            value={verification}
            onChange={(event) => setVerification(event.target.value)}
          />
        </label>
        {error && <ErrorNotice error={error} />}
        <Button
          className="primary"
          disabled={!saved || verification !== issuedKey.slice(-6) || pending}
          onClick={() => {
            setPending(true);
            void rpc(
              'passwordManager.auth.verifyRecovery',
              { accountId, recoveryKey: issuedKey },
              true,
            )
              .then(() => {
                setIssuedKey('');
                return onUnlocked();
              })
              .catch((error) => setError(error.message))
              .finally(() => setPending(false));
          }}
        >
          Finish
        </Button>
      </main>
    );
  return (
    <main className="vault-gate">
      <Mark />
      <h2>
        {mode === 'setup'
          ? 'Set up your local Vault'
          : mode === 'recover'
            ? 'Recover vault access'
            : 'Unlock your vault'}
      </h2>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {mode === 'recover' && (
          <label>
            Recovery key
            <input
              className="field"
              type="password"
              required
              autoComplete="off"
              value={recovery}
              onChange={(event) => setRecovery(event.target.value.trim())}
            />
          </label>
        )}
        <label>
          {mode === 'unlock' ? 'Vault password' : 'New Vault password'}
          <input
            className="field"
            type="password"
            autoComplete={
              mode === 'unlock' ? 'current-password' : 'new-password'
            }
            minLength={mode === 'unlock' ? 1 : 8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {mode !== 'unlock' && (
          <label>
            Repeat the new password
            <input
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        )}
        {(error || parentError) && <ErrorNotice error={error || parentError} />}
        <Button type="submit" className="primary" disabled={pending}>
          {pending
            ? 'Opening…'
            : mode === 'unlock'
              ? 'Unlock'
              : mode === 'setup'
                ? 'Create Vault'
                : 'Recover access'}
        </Button>
        {mode === 'unlock' && biometry?.available && biometry.enrolled && (
          <Button
            disabled={pending}
            onClick={() => {
              setPending(true);
              setError('');
              void rpc(
                'passwordManager.auth.biometricUnlock',
                { accountId },
                true,
              )
                .then(onUnlocked)
                .catch((error) => setError(error.message))
                .finally(() => setPending(false));
            }}
          >
            Use Touch ID
          </Button>
        )}
        {initialized && (
          <Button
            className="ghost"
            onClick={() => {
              setMode(mode === 'unlock' ? 'recover' : 'unlock');
              setError('');
              setPassword('');
              setConfirmPassword('');
            }}
          >
            {mode === 'unlock' ? 'Use a recovery key' : 'Back to unlock'}
          </Button>
        )}
      </form>
      <small>Your encrypted Vault stays in your local Aux account.</small>
    </main>
  );
}

function Secret({
  label,
  value,
  onError,
}: {
  label: string;
  value: string;
  onError: (error: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="secret">
      <small>{label}</small>
      <div className="row">
        <input
          aria-label={label}
          type={visible ? 'text' : 'password'}
          readOnly
          value={value}
        />
        <Button
          className="icon ghost"
          aria-label={visible ? 'Hide value' : 'Show value'}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
        <Button
          className="icon ghost"
          aria-label={`Copy ${label}`}
          title={copied ? 'Copied' : 'Copy'}
          onClick={() =>
            void navigator.clipboard
              .writeText(value)
              .then(() => setCopied(true))
              .catch(() => onError('This value could not be copied.'))
          }
        >
          <Copy size={14} />
        </Button>
      </div>
    </div>
  );
}
function ItemDetail({
  item,
  accountId,
  context,
  pending,
  onEdit,
  onDelete,
  onFill,
  onError,
}: {
  item: VaultItem;
  accountId: number;
  context?: FillContext;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onFill: () => void;
  onError: (error: string) => void;
}) {
  const [history, setHistory] = useState<VaultItem[]>();
  return (
    <>
      <div className="row spread">
        <h2>{item.title}</h2>
        <Button onClick={onEdit}>Edit</Button>
      </div>
      {item.loginFields && (
        <>
          <div className="detail-field">
            <small>Username</small>
            <span>{item.loginFields.username}</span>
          </div>
          <Secret
            label="Password"
            value={item.loginFields.password}
            onError={onError}
          />
        </>
      )}
      {item.urls.map((url) => (
        <a
          key={url}
          className="website"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {url}
        </a>
      ))}
      {item.sections.map((section, index) => (
        <section key={`${index}.${section.title}`}>
          <h3>{section.title}</h3>
          {section.fields.map((field, index) =>
            field.secret ? (
              <Secret
                key={`${index}.${field.name}`}
                label={field.name}
                value={field.value}
                onError={onError}
              />
            ) : (
              <div className="detail-field" key={`${index}.${field.name}`}>
                <small>{field.name}</small>
                <span>{field.value}</span>
              </div>
            ),
          )}
        </section>
      ))}
      {item.notes && (
        <div className="detail-field">
          <small>Private notes</small>
          <p className="notes">{item.notes}</p>
        </div>
      )}
      <small>{item.tags.join(' · ')}</small>
      <div className="stack detail-actions">
        {item.loginFields && (
          <Button disabled={pending} onClick={onFill}>
            {context ? 'Fill selected fields' : 'Choose a field to fill'}
          </Button>
        )}
        <Button
          disabled={pending}
          onClick={() =>
            void rpc<VaultItem[]>('vault.getItemHistory', {
              accountId,
              itemId: item.id,
            })
              .then(setHistory)
              .catch((error) => onError(error.message))
          }
        >
          Earlier versions
        </Button>
        <Button disabled={pending} onClick={onDelete}>
          Delete
        </Button>
      </div>
      {history && (
        <Dialog title="Earlier versions" onClose={() => setHistory(undefined)}>
          {history.length === 0 ? (
            <Empty>No earlier versions.</Empty>
          ) : (
            history.map((version) => (
              <section key={version.revision}>
                <small>
                  {new Date(version.updatedAt).toLocaleString()} · Version{' '}
                  {version.revision}
                </small>
                {version.loginFields && (
                  <Secret
                    label="Earlier password"
                    value={version.loginFields.password}
                    onError={onError}
                  />
                )}
                <p>{version.title}</p>
              </section>
            ))
          )}
        </Dialog>
      )}
    </>
  );
}

type ItemDraft = Omit<VaultItem, 'id' | 'revision' | 'createdAt' | 'updatedAt'>;
const categoryFields: Record<string, string[]> = {
  card: ['Name on card', 'Card number', 'Expiry', 'Security code'],
  identity: [
    'Given name',
    'Family name',
    'Email address',
    'Phone number',
    'Address',
    'Organization',
  ],
};
function ItemEditor({
  item,
  vaultId,
  vaults,
  pending,
  onClose,
  onSave,
}: {
  item?: VaultItem;
  vaultId: string;
  vaults: { id: string; name: string }[];
  pending: boolean;
  onClose: () => void;
  onSave: (fields: ItemDraft) => Promise<void>;
}) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [category, setCategory] = useState(item?.category ?? 'login');
  const [destination, setDestination] = useState(item?.vaultId ?? vaultId);
  const [username, setUsername] = useState(item?.loginFields?.username ?? '');
  const [password, setPassword] = useState(item?.loginFields?.password ?? '');
  const [urls, setUrls] = useState(item?.urls.join('\n') ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [tags, setTags] = useState(item?.tags.join(', ') ?? '');
  const [favorite, setFavorite] = useState(item?.favorite ?? false);
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      item?.sections.flatMap((section) =>
        section.fields.map((field) => [field.name, field.value]),
      ) ?? [],
    ),
  );
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  return (
    <Dialog title={item ? 'Edit saved item' : 'New item'} onClose={onClose}>
      <form
        className="stack item-editor"
        onSubmit={(event) => {
          event.preventDefault();
          const websites = urls
            .split('\n')
            .map((url) => url.trim())
            .filter(Boolean);
          try {
            for (const value of websites) {
              if (!['http:', 'https:'].includes(new URL(value).protocol))
                throw new Error('Invalid URL');
            }
          } catch {
            setError('Enter complete HTTP or HTTPS website addresses.');
            return;
          }
          const sections = (categoryFields[category] ?? []).length
            ? [
                {
                  title: category === 'card' ? 'Card details' : 'Identity',
                  fields: (categoryFields[category] ?? []).map((name) => ({
                    name,
                    value: fields[name] ?? '',
                    secret: category === 'card',
                  })),
                },
                ...(item?.sections ?? [])
                  .map((section) => ({
                    ...section,
                    fields: section.fields.filter(
                      (field) =>
                        !(categoryFields[category] ?? []).includes(field.name),
                    ),
                  }))
                  .filter((section) => section.fields.length),
              ]
            : (item?.sections ?? []);
          void onSave({
            vaultId: destination,
            category,
            title,
            subtitle: username,
            urls: websites,
            tags: tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
            favorite,
            state: item?.state ?? 'active',
            reprompt: false,
            agentAccessPolicy: item?.agentAccessPolicy ?? 'while-unlocked',
            notes,
            ...(category === 'login'
              ? {
                  loginFields: {
                    username,
                    password,
                    ...(item?.loginFields?.totp
                      ? { totp: item.loginFields.totp }
                      : {}),
                  },
                }
              : {}),
            sections,
          }).catch((error) => setError(error.message));
        }}
      >
        <label>
          Item name
          <input
            className="field"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="row">
          <label>
            Category
            <select
              value={category}
              disabled={!!item}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="login">Login</option>
              <option value="card">Card</option>
              <option value="secure-note">Secure note</option>
              <option value="identity">Identity</option>
            </select>
          </label>
          <label>
            Vault
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            >
              {vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {category === 'login' && (
          <>
            <label>
              Username
              <input
                className="field"
                autoComplete="off"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                className="field"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <Button
              disabled={generating}
              onClick={() => {
                setGenerating(true);
                void rpc<{ password: string }>(
                  'passwordManager.generatePassword',
                  {
                    length: 24,
                    lowercase: true,
                    uppercase: true,
                    digits: true,
                    symbols: true,
                  },
                  true,
                )
                  .then((result) => setPassword(result.password))
                  .catch((error) => setError(error.message))
                  .finally(() => setGenerating(false));
              }}
            >
              Create a password
            </Button>
          </>
        )}
        {(categoryFields[category] ?? []).map((name) => (
          <label key={name}>
            {name}
            <input
              className="field"
              type={
                category === 'card' && name !== 'Name on card'
                  ? 'password'
                  : 'text'
              }
              autoComplete="off"
              value={fields[name] ?? ''}
              onChange={(event) =>
                setFields({ ...fields, [name]: event.target.value })
              }
            />
          </label>
        ))}
        <label>
          Website addresses, one per line
          <textarea
            value={urls}
            onChange={(event) => setUrls(event.target.value)}
          />
        </label>
        <label>
          Private notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <label>
          Tags
          <input
            className="field"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Separate tags with commas"
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(event) => setFavorite(event.target.checked)}
          />
          Mark as favorite
        </label>
        {error && <ErrorNotice error={error} />}
        <Button
          type="submit"
          className="primary"
          disabled={pending || !title.trim() || !destination}
        >
          Save to vault
        </Button>
      </form>
    </Dialog>
  );
}

function VaultSettings({
  accountId,
  snapshot,
  pending,
  mutate,
  onClose,
  onError,
}: {
  accountId: number;
  snapshot?: Snapshot;
  pending: boolean;
  mutate: (
    procedure: string,
    input: Record<string, unknown>,
  ) => Promise<unknown>;
  onClose: () => void;
  onError: (error: string) => void;
}) {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [biometry, setBiometry] = useState<{
    available: boolean;
    enrolled: boolean;
  }>();
  useEffect(() => {
    let active = true;
    void rpc<{ available: boolean; enrolled: boolean }>(
      'passwordManager.auth.biometricStatus',
      { accountId },
    )
      .then((value) => {
        if (active) setBiometry(value);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [accountId]);
  return (
    <Dialog title="Vault preferences" onClose={onClose}>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (password !== confirmation) {
            setError('The passwords do not match.');
            return;
          }
          void mutate('passwordManager.auth.changePassword', {
            currentPassword: current,
            newPassword: password,
          })
            .then(() => {
              setCurrent('');
              setPassword('');
              setConfirmation('');
              onClose();
            })
            .catch((error) => setError(error.message));
        }}
      >
        <h3>Change Vault password</h3>
        <label>
          Current Vault password
          <input
            className="field"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        </label>
        <label>
          New password
          <input
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Repeat the new password
          <input
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={pending}>
          Save
        </Button>
      </form>
      <hr />
      <form
        className="row"
        onSubmit={(event) => {
          event.preventDefault();
          void mutate('vault.createVault', {
            name,
            type: 'personal',
            appearance: {},
          })
            .then(() => setName(''))
            .catch((error) => setError(error.message));
        }}
      >
        <input
          className="field"
          aria-label="Vault name"
          placeholder="Vault name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={pending}>
          Create
        </Button>
      </form>
      <div className="stack">
        <h3>Export saved items</h3>
        <p>This file can contain readable passwords. Store it securely.</p>
        <Button
          disabled={!snapshot}
          onClick={() => {
            if (
              !confirm('Export readable saved items? Store the file securely.')
            )
              return;
            try {
              const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'aux-vault-export.json';
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch {
              onError('The Vault export could not be created.');
            }
          }}
        >
          Export
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            if (
              confirm(
                'Saved items will be permanently removed from this local account.',
              )
            )
              void mutate('vault.clear', { confirmed: true })
                .then(onClose)
                .catch((error) => setError(error.message));
          }}
        >
          Delete all items
        </Button>
      </div>
      <section className="stack">
        <h3>Touch ID</h3>
        {biometry?.available ? (
          <>
            <p>
              {biometry.enrolled
                ? 'Touch ID is enabled for this Vault.'
                : 'Enter your current Vault password above, then choose to enable Touch ID.'}
            </p>
            <Button
              disabled={pending || (!biometry.enrolled && !current)}
              onClick={() =>
                void mutate(
                  biometry.enrolled
                    ? 'passwordManager.auth.biometricRemove'
                    : 'passwordManager.auth.biometricEnroll',
                  biometry.enrolled ? {} : { currentPassword: current },
                )
                  .then((value) => {
                    setBiometry(
                      value as { available: boolean; enrolled: boolean },
                    );
                    setCurrent('');
                  })
                  .catch((error) => setError(error.message))
              }
            >
              {biometry.enrolled
                ? 'Turn off Touch ID unlock'
                : 'Enable Touch ID unlock'}
            </Button>
          </>
        ) : (
          <small>
            Touch ID is unavailable until the native secure-credential helper
            and device permissions are ready.
          </small>
        )}
      </section>

      {error && <ErrorNotice error={error} />}
      <span hidden>{accountId}</span>
    </Dialog>
  );
}
function ImportDialog({
  accountId,
  vaultId,
  onClose,
  onImported,
}: {
  accountId: number;
  vaultId: string;
  onClose: () => void;
  onImported: () => Promise<void>;
}) {
  const [source, setSource] = useState('generic-csv');
  const [data, setData] = useState('');
  const [preview, setPreview] = useState<{
    total: number;
    valid: number;
    errors: { row: number; message: string }[];
    items: { title: string; category: string }[];
  }>();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  return (
    <Dialog title="Import saved items" onClose={onClose}>
      <div className="stack">
        <label>
          Import source
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPreview(undefined);
            }}
          >
            {[
              ['aux-json', 'Aux JSON'],
              ['generic-csv', 'CSV'],
              ['apple-csv', 'Apple Passwords CSV'],
              ['onepassword-csv', '1Password CSV'],
              ['lastpass-csv', 'LastPass CSV'],
              ['dashlane-csv', 'Dashlane CSV'],
              ['proton-csv', 'Proton CSV'],
              ['bitwarden-json', 'Bitwarden JSON'],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <input
          type="file"
          accept=".csv,.json,text/csv,application/json"
          aria-label="Choose an exported password file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 16000000) {
              setError('Choose a file smaller than 16 MB.');
              return;
            }
            void file
              .text()
              .then((text) => {
                setData(text);
                setPreview(undefined);
              })
              .catch(() => setError('This file could not be read.'));
          }}
        />
        <p className="muted">
          Choose a file you exported. Aux does not open another browser or
          password manager profile.
        </p>
        <Button
          disabled={!data || pending}
          onClick={() => {
            setPending(true);
            setError('');
            void rpc<NonNullable<typeof preview>>(
              'passwordImport.preview',
              { accountId, vaultId, source, data },
              true,
            )
              .then(setPreview)
              .catch((error) => setError(error.message))
              .finally(() => setPending(false));
          }}
        >
          Review imported items
        </Button>
        {preview && (
          <>
            <p>
              {preview.valid} of {preview.total} items can be imported.
            </p>
            {preview.errors.map((error) => (
              <p key={error.row} className="error">
                Row {error.row}: {error.message}
              </p>
            ))}
            <ul>
              {preview.items.slice(0, 20).map((item, index) => (
                <li key={`${index}.${item.title}`}>
                  {item.title} · {item.category}
                </li>
              ))}
            </ul>
            <Button
              className="primary"
              disabled={pending || preview.valid === 0}
              onClick={() => {
                setPending(true);
                void rpc(
                  'passwordImport.commit',
                  { accountId, vaultId, source, data, accepted: true },
                  true,
                )
                  .then(async () => {
                    setData('');
                    await onImported();
                    onClose();
                  })
                  .catch((error) => setError(error.message))
                  .finally(() => setPending(false));
              }}
            >
              Import selected items
            </Button>
          </>
        )}
        {error && <ErrorNotice error={error} />}
      </div>
    </Dialog>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Vault root is missing.');
createRoot(root).render(<App />);
