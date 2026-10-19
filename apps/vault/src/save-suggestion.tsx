import { useEffect, useState } from 'react';
import type { SaveSuggestion as Suggestion } from './autofill-protocol';
import { backgroundRequest, type Snapshot } from './client';

export function SaveSuggestion({
  accountId,
  snapshot,
  onSaved,
  onError,
}: {
  accountId: number;
  snapshot: Snapshot;
  onSaved: () => void | Promise<void>;
  onError: (error: unknown) => void;
}) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState(snapshot.vaults[0]?.id ?? '');
  const [itemId, setItemId] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    void backgroundRequest<Suggestion | null>({
      type: 'aux.vault.pendingSave',
      accountId,
    })
      .then((value) => {
        if (disposed) return;
        setSuggestion(value);
        setTitle(value?.title ?? '');
      })
      .catch((cause) => {
        if (!disposed) onError(cause);
      });
    return () => {
      disposed = true;
    };
  }, [accountId, onError]);
  if (!suggestion) return null;
  const matches = snapshot.items.filter(
    (item) =>
      item.state === 'active' &&
      item.category === 'login' &&
      item.urls.some(
        (url) => new URL(url).origin === new URL(suggestion.documentUrl).origin,
      ),
  );
  const selected = matches.find((item) => item.id === itemId);
  return (
    <section
      aria-label="Save submitted login"
      className="vault-save-suggestion"
    >
      <h3>Save this submitted login?</h3>
      <p>
        {new URL(suggestion.documentUrl).hostname} ·{' '}
        {suggestion.username || 'No username detected'}
      </p>
      <p>
        The form was submitted. Aux has not verified whether sign-in succeeded.
      </p>
      <label>
        Save action
        <select
          disabled={pending}
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
        >
          <option value="">Create a new login</option>
          {matches.map((item) => (
            <option key={item.id} value={item.id}>
              Update {item.title} ·{' '}
              {item.loginFields?.username || 'No username'}
            </option>
          ))}
        </select>
      </label>
      {!selected && (
        <>
          <label>
            Title
            <input
              value={title}
              disabled={pending}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Vault
            <select
              value={destination}
              disabled={pending}
              onChange={(event) => setDestination(event.target.value)}
            >
              {snapshot.vaults.map((vault) => (
                <option key={vault.id} value={vault.id}>
                  {vault.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <button
        type="button"
        disabled={pending || (!selected && (!title.trim() || !destination))}
        onClick={() => {
          setPending(true);
          setError('');
          void backgroundRequest({
            type: 'aux.vault.acceptSave',
            accountId,
            suggestionToken: suggestion.suggestionToken,
            vaultId: destination,
            title,
            itemId: selected?.id,
            baseRevision: selected?.revision,
          })
            .then(async () => {
              setSuggestion(null);
              await onSaved();
            })
            .catch((cause) =>
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'The login could not be saved.',
              ),
            )
            .finally(() => setPending(false));
        }}
      >
        {pending
          ? 'Saving…'
          : selected
            ? 'Update selected login'
            : 'Save new login'}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setPending(true);
          void backgroundRequest({
            type: 'aux.vault.dismissSave',
            accountId,
            suggestionToken: suggestion.suggestionToken,
          })
            .then(() => setSuggestion(null))
            .catch((cause) =>
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'The suggestion could not be dismissed.',
              ),
            )
            .finally(() => setPending(false));
        }}
      >
        Dismiss
      </button>
    </section>
  );
}
