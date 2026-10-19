import { Button, Dialog, ErrorNotice } from '@aux/ui';
import { useEffect, useState } from 'react';
import { rpc } from './daemon';
import './subagent-settings.css';

type SearchStatus = {
  provider: 'perplexity';
  configured: boolean;
  enabled: boolean;
  maxResults: number;
  credentialRequired: boolean;
  endpoint: string;
};
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The search configuration could not be saved.';
export function SearchSettings({ accountId }: { accountId: number }) {
  const [status, setStatus] = useState<SearchStatus>(),
    [apiKey, setApiKey] = useState(''),
    [maxResults, setMaxResults] = useState(5),
    [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [clearing, setClearing] = useState(false);
  useEffect(() => {
    let disposed = false;
    void rpc<SearchStatus>('search.status', { accountId })
      .then((value) => {
        if (!disposed) {
          setStatus(value);
          setMaxResults(value.maxResults);
        }
      })
      .catch((cause) => {
        if (!disposed) setError(errorMessage(cause));
      });
    return () => {
      disposed = true;
    };
  }, [accountId]);
  async function update(
    procedure: string,
    input: Record<string, unknown>,
    success: string,
  ) {
    setPending(true);
    setError('');
    setNotice('');
    try {
      const value = await rpc<SearchStatus>(
        procedure,
        { accountId, ...input },
        true,
      );
      setStatus(value);
      if (procedure !== 'search.setEnabled') setMaxResults(value.maxResults);
      setNotice(success);
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      return false;
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      className="subagent-settings"
      aria-label="Web search configuration"
    >
      <div>
        <h3>Web search</h3>
        <p className="muted">
          Perplexity Search uses its own credential and provider charges. Your
          AI Gateway key is not reused.
        </p>
      </div>
      {error && <ErrorNotice error={error} />}{' '}
      {notice && <output className="notice">{notice}</output>}
      {!status ? (
        <p role="status">
          {error
            ? 'Search status could not be loaded.'
            : 'Loading search configuration…'}
        </p>
      ) : (
        <>
          <p>
            {status.configured
              ? 'A Search API key is saved.'
              : 'No Search API key is saved.'}{' '}
            This shows local configuration; it does not verify the key with the
            provider.
          </p>
          <label className="subagent-toggle">
            <input
              type="checkbox"
              checked={status.enabled}
              disabled={pending || !status.configured}
              onChange={(event) =>
                void update(
                  'search.setEnabled',
                  { enabled: event.target.checked },
                  event.target.checked
                    ? 'Web search enabled.'
                    : 'Web search disabled. Saved key preserved.',
                )
              }
            />
            Enable web search
          </label>
          <form
            className="subagent-form"
            onSubmit={(event) => {
              event.preventDefault();
              void update(
                'search.configure',
                {
                  apiKey,
                  maxResults,
                  enabled: status.enabled || !status.configured,
                },
                'Search credential saved. No search request was sent.',
              ).then((saved) => {
                if (saved) setApiKey('');
              });
            }}
          >
            <label>
              {status.configured ? 'Replace Search API key' : 'Search API key'}
              <input
                type="password"
                required
                autoComplete="new-password"
                maxLength={8192}
                disabled={pending}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <small>
                Saved keys are write-only. Leave this blank and use the enable
                switch to preserve the current key.
              </small>
            </label>
            <label>
              Maximum search results
              <input
                type="number"
                min={1}
                max={10}
                step={1}
                required
                disabled={pending}
                value={maxResults}
                onChange={(event) => setMaxResults(Number(event.target.value))}
              />
              <small>
                Changing this limit requires submitting a new or replacement
                key.
              </small>
            </label>
            <div className="subagent-actions">
              <Button
                type="submit"
                disabled={pending || !apiKey}
                className="primary"
              >
                {pending
                  ? 'Saving…'
                  : status.configured
                    ? 'Replace search credential'
                    : 'Save search credential'}
              </Button>
              {status.configured && (
                <Button disabled={pending} onClick={() => setClearing(true)}>
                  Remove search credential
                </Button>
              )}
            </div>
          </form>
        </>
      )}
      {!status && error && (
        <Button
          onClick={() => {
            setError('');
            void rpc<SearchStatus>('search.status', { accountId })
              .then((value) => {
                setStatus(value);
                setMaxResults(value.maxResults);
              })
              .catch((cause) => setError(errorMessage(cause)));
          }}
        >
          Retry search status
        </Button>
      )}
      {clearing && (
        <Dialog
          title="Remove Search API key?"
          onClose={() => {
            if (!pending) setClearing(false);
          }}
        >
          <div className="subagent-form">
            <p>
              Remove the saved Perplexity Search credential and disable web
              search for this account?
            </p>
            {error && <ErrorNotice error={error} />}
            <div className="subagent-actions">
              <Button
                disabled={pending}
                className="danger"
                onClick={() =>
                  void update(
                    'search.clear',
                    {},
                    'Search credential removed. Web search disabled.',
                  ).then((saved) => {
                    if (saved) {
                      setClearing(false);
                      setApiKey('');
                    }
                  })
                }
              >
                Remove search key
              </Button>
              <Button disabled={pending} onClick={() => setClearing(false)}>
                Keep search key
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
