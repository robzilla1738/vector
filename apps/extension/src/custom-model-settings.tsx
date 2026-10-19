import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './daemon';
import './custom-model-settings.css';

import { ProviderEditor } from './custom-model-editor';
import type { CustomProvider as Provider } from './custom-model-types';

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The custom provider could not be updated.';
export function CustomModelSettings({
  accountId,
  onChanged,
}: {
  accountId: number;
  onChanged?: () => void | Promise<void>;
}) {
  const [providers, setProviders] = useState<Provider[]>();
  const [editor, setEditor] = useState<Provider | 'new'>();
  const [removing, setRemoving] = useState<Provider>();
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const refresh = useCallback(async () => {
    const rows = await rpc<Provider[]>('models.listCustomProviders', {
      accountId,
    });
    setProviders(rows);
    setError('');
  }, [accountId]);
  useEffect(() => {
    let active = true;
    void rpc<Provider[]>('models.listCustomProviders', { accountId })
      .then((rows) => {
        if (active) setProviders(rows);
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [accountId]);
  return (
    <section
      className="custom-model-settings"
      aria-label="Custom model providers"
    >
      <div className="custom-model-actions">
        <div>
          <h3>Custom providers</h3>
          <p className="muted">
            Configure a compatible endpoint and its ordered model list. Saving
            does not contact the provider.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditor('new');
            setNotice('');
          }}
        >
          Add custom provider
        </Button>
      </div>
      {error && <ErrorNotice error={error} />}{' '}
      {notice && <output className="notice">{notice}</output>}
      {providers === undefined ? (
        <p role="status">
          {error
            ? 'Provider inventory could not be loaded.'
            : 'Loading custom providers…'}
        </p>
      ) : providers.length === 0 ? (
        <Empty>No custom providers</Empty>
      ) : (
        providers.map((provider) => (
          <article className="custom-provider-card" key={provider.providerId}>
            <div className="custom-model-actions">
              <h3>{provider.name}</h3>
              <span className="muted">{provider.providerId}</span>
            </div>
            <p>{provider.baseUrl}</p>
            <p className="muted">
              {provider.apiStyle === 'openai-responses'
                ? 'OpenAI Responses'
                : 'OpenAI-compatible chat'}{' '}
              · Manually configured capabilities
            </p>
            <p className="muted">
              {provider.hasApiKey ? 'API key saved' : 'No API key saved'} ·{' '}
              {provider.headerNames.length} saved headers
            </p>
            <ol>
              {provider.modelIds.map((modelId) => (
                <li key={modelId}>{modelId}</li>
              ))}
            </ol>
            <div className="custom-model-actions">
              <Button
                onClick={() => {
                  setEditor(provider);
                  setNotice('');
                }}
              >
                Edit {provider.name}
              </Button>
              <Button onClick={() => setRemoving(provider)}>
                Remove {provider.name}
              </Button>
            </div>
          </article>
        ))
      )}
      {error && (
        <Button
          onClick={() => {
            setError('');
            void refresh().catch((cause) => setError(errorMessage(cause)));
          }}
        >
          Retry provider inventory
        </Button>
      )}
      {editor && (
        <ProviderEditor
          key={editor === 'new' ? 'new' : editor.providerId}
          accountId={accountId}
          provider={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setEditor(undefined);
            setNotice('Custom provider saved.');
            try {
              await refresh();
              await onChanged?.();
            } catch (cause) {
              setError(`Saved, but refreshing failed: ${errorMessage(cause)}`);
            }
          }}
        />
      )}
      {removing && (
        <Dialog
          title="Remove custom provider?"
          onClose={() => {
            if (!pending) setRemoving(undefined);
          }}
        >
          <div className="custom-model-editor">
            <p>
              Remove {removing.name}, its configured models and saved connection
              credentials?
            </p>
            {error && <ErrorNotice error={error} />}
            <div className="custom-model-actions">
              <Button
                disabled={pending}
                className="danger"
                onClick={() => {
                  setPending(true);
                  setError('');
                  void rpc(
                    'models.removeCustomProviderConfig',
                    { accountId, providerId: removing.providerId },
                    true,
                  )
                    .then(async () => {
                      setRemoving(undefined);
                      setNotice('Custom provider removed.');
                      await refresh();
                      await onChanged?.();
                    })
                    .catch((cause) => setError(errorMessage(cause)))
                    .finally(() => setPending(false));
                }}
              >
                {pending ? 'Removing…' : 'Remove provider'}
              </Button>
              <Button disabled={pending} onClick={() => setRemoving(undefined)}>
                Keep provider
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </section>
  );
}
