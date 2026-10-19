import { Button, Dialog, ErrorNotice } from '@aux/ui';
import { useState } from 'react';
import {
  type CustomProvider,
  type ModelConfig,
  thinkingLevels,
} from './custom-model-types';
import { rpc } from './daemon';

type HeaderDraft = { id: string; name: string; value: string };
type ModelDraft = ModelConfig & { key: string };
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The custom provider could not be saved.';
export function ProviderEditor({
  accountId,
  provider,
  onClose,
  onSaved,
}: {
  accountId: number;
  provider?: CustomProvider;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [providerId, setProviderId] = useState(
      provider?.providerId ?? 'custom-',
    ),
    [name, setName] = useState(provider?.name ?? ''),
    [baseUrl, setBaseUrl] = useState(provider?.baseUrl ?? '');
  const [apiStyle, setApiStyle] = useState<CustomProvider['apiStyle']>(
    provider?.apiStyle ?? 'openai-compatible',
  );
  const [apiKey, setApiKey] = useState(''),
    [removeApiKey, setRemoveApiKey] = useState(false);
  const [headers, setHeaders] = useState<HeaderDraft[]>([]),
    [preserved, setPreserved] = useState(provider?.headerNames ?? []);
  const [models, setModels] = useState<ModelDraft[]>(
    (provider?.models ?? []).map((model) => ({
      ...model,
      key: crypto.randomUUID(),
    })),
  );
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  function changeModel(key: string, patch: Partial<ModelConfig>) {
    setModels((previous) =>
      previous.map((model) =>
        model.key === key ? { ...model, ...patch } : model,
      ),
    );
  }
  function move(index: number, delta: number) {
    setModels((previous) => {
      const rows = [...previous],
        row = rows.splice(index, 1)[0];
      if (row) rows.splice(index + delta, 0, row);
      return rows;
    });
  }
  return (
    <Dialog
      title={provider ? 'Edit custom provider' : 'Add custom provider'}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        className="custom-model-editor"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError('');
          void (async () => {
            if (!/^custom-[A-Za-z0-9_-]{1,93}$/.test(providerId))
              throw new Error(
                'Provider IDs must start with custom- and use letters, numbers, hyphens or underscores.',
              );
            const normalized = models.map(({ key: _key, ...model }) => ({
              ...model,
              id: model.id.trim(),
            }));
            if (
              normalized.some((model) => !model.id) ||
              new Set(normalized.map((model) => model.id)).size !==
                normalized.length
            )
              throw new Error('Each model needs a unique, nonempty ID.');
            const values: Record<string, string> = {};
            for (const header of headers) {
              const name = header.name.trim();
              if (!name || !header.value)
                throw new Error('Each new header needs a name and value.');
              if (
                [...Object.keys(values), ...preserved].some(
                  (previous) => previous.toLowerCase() === name.toLowerCase(),
                )
              )
                throw new Error(
                  'Header names must be unique. Uncheck a saved header before replacing it.',
                );
              Object.defineProperty(values, name, {
                value: header.value,
                enumerable: true,
              });
            }
            await rpc(
              'models.setCustomProvidersConfig',
              {
                accountId,
                providers: {
                  [providerId]: {
                    createOnly: !provider,
                    name: name.trim(),
                    baseUrl,
                    apiStyle,
                    models: normalized,
                    ...(apiKey && !removeApiKey ? { apiKey } : {}),
                    ...(removeApiKey ? { removeApiKey: true } : {}),
                    headers: values,
                    preserveHeaderNames: preserved,
                  },
                },
              },
              true,
            );
            setApiKey('');
            setHeaders([]);
            await onSaved();
          })()
            .catch((cause) => setError(errorMessage(cause)))
            .finally(() => setPending(false));
        }}
      >
        <div className="custom-model-grid">
          <label>
            Provider ID
            <input
              required
              disabled={pending || !!provider}
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              pattern="custom-[A-Za-z0-9_-]{1,93}"
            />
            <small>The ID stays fixed after creation.</small>
          </label>
          <label>
            Provider name
            <input
              required
              maxLength={200}
              disabled={pending}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        </div>
        <label>
          Base URL
          <input
            type="url"
            required
            maxLength={4096}
            disabled={pending}
            value={baseUrl}
            placeholder="https://example.com/v1"
            onChange={(event) => setBaseUrl(event.target.value)}
          />
          <small>
            Use HTTPS or loopback HTTP. Keep credentials out of the URL.
          </small>
        </label>
        <label>
          API style
          <select
            value={apiStyle}
            disabled={pending}
            onChange={(event) =>
              setApiStyle(event.target.value as CustomProvider['apiStyle'])
            }
          >
            <option value="openai-compatible">OpenAI-compatible chat</option>
            <option value="openai-responses">OpenAI Responses</option>
          </select>
        </label>
        <label>
          {provider?.hasApiKey ? 'Replace saved API key' : 'API key (optional)'}
          <input
            type="password"
            autoComplete="new-password"
            disabled={pending || removeApiKey}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          <small>
            {provider?.hasApiKey
              ? 'Leave blank to preserve the saved key.'
              : 'Leave blank for an endpoint that intentionally needs no API key.'}
          </small>
        </label>
        {provider?.hasApiKey && (
          <label className="custom-toggle">
            <input
              type="checkbox"
              checked={removeApiKey}
              disabled={pending}
              onChange={(event) => setRemoveApiKey(event.target.checked)}
            />
            Remove the saved API key
          </label>
        )}
        <fieldset>
          <legend>Request headers</legend>
          <small>
            Saved values are write-only. Values are literal; environment
            variables are not expanded.
          </small>
          {provider?.headerNames.map((header) => (
            <label className="custom-saved-header" key={header}>
              <input
                type="checkbox"
                checked={preserved.includes(header)}
                disabled={pending}
                onChange={(event) =>
                  setPreserved((previous) =>
                    event.target.checked
                      ? [...previous, header]
                      : previous.filter((name) => name !== header),
                  )
                }
              />
              Keep {header}
            </label>
          ))}
          {headers.map((header, index) => (
            <div className="custom-header-row" key={header.id}>
              <label>
                Header name {index + 1}
                <input
                  disabled={pending}
                  value={header.name}
                  onChange={(event) =>
                    setHeaders((previous) =>
                      previous.map((row) =>
                        row.id === header.id
                          ? { ...row, name: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Header value {index + 1}
                <input
                  type="password"
                  autoComplete="new-password"
                  disabled={pending}
                  value={header.value}
                  onChange={(event) =>
                    setHeaders((previous) =>
                      previous.map((row) =>
                        row.id === header.id
                          ? { ...row, value: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
              </label>
              <Button
                disabled={pending}
                onClick={() =>
                  setHeaders((previous) =>
                    previous.filter((row) => row.id !== header.id),
                  )
                }
              >
                Remove header {index + 1}
              </Button>
            </div>
          ))}
          <Button
            disabled={pending || headers.length + preserved.length >= 100}
            onClick={() =>
              setHeaders((previous) => [
                ...previous,
                { id: crypto.randomUUID(), name: '', value: '' },
              ])
            }
          >
            Add header
          </Button>
        </fieldset>
        <fieldset>
          <legend>Models in display order</legend>
          <small>
            Declare only capabilities and limits supported by this endpoint.
            Costs are optional prices per million tokens.
          </small>
          {models.map((model, index) => (
            <fieldset key={model.key}>
              <legend>Model {index + 1}</legend>
              <div className="custom-order">
                <Button
                  disabled={pending || index === 0}
                  aria-label={`Move model ${index + 1} up`}
                  onClick={() => move(index, -1)}
                >
                  Move up
                </Button>
                <Button
                  disabled={pending || index === models.length - 1}
                  aria-label={`Move model ${index + 1} down`}
                  onClick={() => move(index, 1)}
                >
                  Move down
                </Button>
                <Button
                  disabled={pending}
                  onClick={() =>
                    setModels((previous) =>
                      previous.filter((row) => row.key !== model.key),
                    )
                  }
                >
                  Remove model {index + 1}
                </Button>
              </div>
              <div className="custom-model-grid">
                <label>
                  Model ID {index + 1}
                  <input
                    required
                    maxLength={256}
                    disabled={pending}
                    value={model.id}
                    onChange={(event) =>
                      changeModel(model.key, { id: event.target.value })
                    }
                  />
                </label>
                <label>
                  Display name {index + 1}
                  <input
                    disabled={pending}
                    value={model.name ?? ''}
                    onChange={(event) =>
                      changeModel(model.key, {
                        name: event.target.value || undefined,
                      })
                    }
                  />
                </label>
              </div>
              <fieldset>
                <legend>Input capabilities for model {index + 1}</legend>
                <div className="custom-model-actions">
                  {(['text', 'image', 'pdf'] as const).map((modality) => (
                    <label key={modality} className="custom-toggle">
                      <input
                        type="checkbox"
                        disabled={pending}
                        checked={model.inputModalities.includes(modality)}
                        onChange={(event) =>
                          changeModel(model.key, {
                            inputModalities: event.target.checked
                              ? [...model.inputModalities, modality]
                              : model.inputModalities.filter(
                                  (value) => value !== modality,
                                ),
                          })
                        }
                      />
                      {modality === 'pdf'
                        ? 'PDF'
                        : modality === 'image'
                          ? 'Images'
                          : 'Text'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="custom-model-grid">
                <label>
                  Context window {index + 1}
                  <input
                    type="number"
                    min={1}
                    max={1000000000}
                    step={1}
                    disabled={pending}
                    value={model.contextWindow ?? ''}
                    onChange={(event) =>
                      changeModel(model.key, {
                        contextWindow: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  />
                  <small>Tokens; blank means unspecified.</small>
                </label>
                <label>
                  Output limit {index + 1}
                  <input
                    type="number"
                    min={1}
                    max={1000000000}
                    step={1}
                    disabled={pending}
                    value={model.outputLimit ?? ''}
                    onChange={(event) =>
                      changeModel(model.key, {
                        outputLimit: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      })
                    }
                  />
                  <small>Maximum output tokens; blank means unspecified.</small>
                </label>
              </div>
              <label className="custom-toggle">
                <input
                  type="checkbox"
                  disabled={pending}
                  checked={model.reasoning}
                  onChange={(event) =>
                    changeModel(model.key, {
                      reasoning: event.target.checked,
                      ...(!event.target.checked
                        ? { thinkingLevels: [], thinkingLevelMapping: {} }
                        : {}),
                    })
                  }
                />
                Reasoning supported for model {index + 1}
              </label>
              {model.reasoning && (
                <fieldset>
                  <legend>Thinking levels for model {index + 1}</legend>
                  <small>
                    Choose supported levels. Optional mappings translate Aux
                    levels to this provider's effort values.
                    {apiStyle === 'openai-responses'
                      ? ' Responses accepts none, minimal, low, medium, high, xhigh or max.'
                      : ''}
                  </small>
                  {thinkingLevels.map((level) => (
                    <div key={level} className="custom-model-grid">
                      <label className="custom-toggle">
                        <input
                          type="checkbox"
                          disabled={pending}
                          checked={model.thinkingLevels.includes(level)}
                          onChange={(event) => {
                            const mapping = { ...model.thinkingLevelMapping };
                            if (!event.target.checked) delete mapping[level];
                            changeModel(model.key, {
                              thinkingLevels: event.target.checked
                                ? [...model.thinkingLevels, level]
                                : model.thinkingLevels.filter(
                                    (value) => value !== level,
                                  ),
                              thinkingLevelMapping: mapping,
                            });
                          }}
                        />
                        {level}
                      </label>
                      {model.thinkingLevels.includes(level) && (
                        <label>
                          Provider effort for {level}, model {index + 1}
                          <input
                            disabled={pending}
                            value={model.thinkingLevelMapping?.[level] ?? ''}
                            placeholder="Use the default mapping"
                            onChange={(event) => {
                              const mapping = { ...model.thinkingLevelMapping };
                              if (event.target.value)
                                mapping[level] = event.target.value;
                              else delete mapping[level];
                              changeModel(model.key, {
                                thinkingLevelMapping: mapping,
                              });
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </fieldset>
              )}
              <div className="custom-model-grid">
                <label>
                  Input cost per million, model {index + 1}
                  <input
                    type="number"
                    min={0}
                    step="any"
                    disabled={pending}
                    value={model.costs?.inputPerMillion ?? ''}
                    onChange={(event) =>
                      changeModel(model.key, {
                        costs: {
                          ...model.costs,
                          inputPerMillion: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Output cost per million, model {index + 1}
                  <input
                    type="number"
                    min={0}
                    step="any"
                    disabled={pending}
                    value={model.costs?.outputPerMillion ?? ''}
                    onChange={(event) =>
                      changeModel(model.key, {
                        costs: {
                          ...model.costs,
                          outputPerMillion: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </fieldset>
          ))}
          <Button
            disabled={pending || models.length >= 200}
            onClick={() =>
              setModels((previous) => [
                ...previous,
                {
                  key: crypto.randomUUID(),
                  id: '',
                  inputModalities: ['text'],
                  reasoning: false,
                  thinkingLevels: [],
                },
              ])
            }
          >
            Add model
          </Button>
        </fieldset>
        {error && <ErrorNotice error={error} />}
        <div className="custom-model-actions">
          <Button type="submit" disabled={pending} className="primary">
            {pending ? 'Saving…' : 'Save custom provider'}
          </Button>
          <Button disabled={pending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
