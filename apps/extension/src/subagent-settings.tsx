import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './daemon';
import './subagent-settings.css';

type Level = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';
type Selection = {
  provider: string;
  modelId: string;
  thinkingLevel: Level;
  fastMode: boolean;
};
type Category = 'fast' | 'standard' | 'deep' | 'visual';
type Profile = {
  id: string;
  name: string;
  instructions: string;
  context: 'fresh' | 'forked';
  readOnly: boolean;
  allowedTools: string[];
};
type Tool = { name: string; label: string; readOnly: boolean };
type Model = {
  provider: string;
  modelId: string;
  name?: string;
  thinkingLevels: string[];
  inputModalities: string[];
  fastMode?: boolean;
};
type State = {
  profiles: Profile[];
  routing: Partial<Record<Category, Selection | null>>;
  catalog: Tool[];
  models: Model[];
};
const categories: Category[] = ['fast', 'standard', 'deep', 'visual'];
const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The subagent configuration could not be saved.';
const modelKey = (model: { provider: string; modelId: string }) =>
  JSON.stringify([model.provider, model.modelId]);
function supportedLevels(model: Model) {
  return model.thinkingLevels.length ? model.thinkingLevels : ['off'];
}
export function SubagentSettings({ accountId }: { accountId: number }) {
  const [state, setState] = useState<State>(),
    [routing, setRouting] = useState<State['routing']>({});
  const [editor, setEditor] = useState<Profile | 'new'>(),
    [removing, setRemoving] = useState<Profile>();
  const [pending, setPending] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const refresh = useCallback(async () => {
    const value = await rpc<State>('subagentConfiguration.list', { accountId });
    setState(value);
    return value;
  }, [accountId]);
  useEffect(() => {
    let disposed = false;
    void rpc<State>('subagentConfiguration.list', { accountId })
      .then((value) => {
        if (!disposed) {
          setState(value);
          setRouting(value.routing);
        }
      })
      .catch((cause) => {
        if (!disposed) setError(errorMessage(cause));
      });
    return () => {
      disposed = true;
    };
  }, [accountId]);
  async function mutate(action: () => Promise<unknown>, success: string) {
    setPending(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="subagent-settings" aria-label="Subagent configuration">
      <div>
        <h3>Child task profiles</h3>
        <p className="muted">
          New child tasks use these settings. Existing children retain their
          creation snapshot. Parent permissions and runtime limits always apply.
        </p>
      </div>
      {error && <ErrorNotice error={error} />}{' '}
      {notice && <output className="notice">{notice}</output>}
      {!state ? (
        <p role="status">
          {error
            ? 'Configuration could not be loaded.'
            : 'Loading subagent configuration…'}
        </p>
      ) : (
        <>
          <Button disabled={pending} onClick={() => setEditor('new')}>
            Add child profile
          </Button>
          {state.profiles.length === 0 ? (
            <Empty>No custom child profiles</Empty>
          ) : (
            state.profiles.map((profile) => (
              <article className="subagent-card" key={profile.id}>
                <h4>{profile.name}</h4>
                <p className="muted">
                  {profile.id} ·{' '}
                  {profile.context === 'fresh'
                    ? 'Fresh context'
                    : 'Forked text context'}{' '}
                  · {profile.readOnly ? 'Read-only' : 'Parent permissions'} ·{' '}
                  {profile.allowedTools.length} selected tools
                </p>
                <div className="subagent-actions">
                  <Button disabled={pending} onClick={() => setEditor(profile)}>
                    Edit {profile.name}
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => setRemoving(profile)}
                  >
                    Delete {profile.name}
                  </Button>
                </div>
              </article>
            ))
          )}
          <form
            className="subagent-form"
            onSubmit={(event) => {
              event.preventDefault();
              void mutate(async () => {
                const saved = await rpc<{ routing: State['routing'] }>(
                  'subagentConfiguration.setRouting',
                  { accountId, routing },
                  true,
                );
                setRouting(saved.routing);
              }, 'Category routing saved.');
            }}
          >
            <h3>Models by category</h3>
            <p className="muted">
              Choose an explicit configured model for each requested category.
              Saving never runs the selected models.
            </p>
            {categories.map((category) => {
              const selected = routing[category],
                model = state.models.find(
                  (model) =>
                    !!selected &&
                    modelKey(model) === modelKey(selected) &&
                    (category !== 'visual' ||
                      model.inputModalities.includes('image')),
                );
              return (
                <fieldset key={category}>
                  <legend>
                    {category[0]?.toUpperCase()}
                    {category.slice(1)}
                  </legend>
                  <label>
                    Model for {category}
                    <select
                      aria-label={`Model for ${category}`}
                      value={selected ? modelKey(selected) : ''}
                      disabled={pending}
                      onChange={(event) => {
                        const model = state.models.find(
                          (model) => modelKey(model) === event.target.value,
                        );
                        setRouting((previous) => ({
                          ...previous,
                          [category]: model
                            ? {
                                provider: model.provider,
                                modelId: model.modelId,
                                thinkingLevel: supportedLevels(
                                  model,
                                )[0] as Level,
                                fastMode: false,
                              }
                            : null,
                        }));
                      }}
                    >
                      <option value="">No category model selected</option>
                      {selected && !model && (
                        <option value={modelKey(selected)}>
                          Unavailable: {selected.provider}/{selected.modelId}
                        </option>
                      )}
                      {state.models
                        .filter(
                          (model) =>
                            category !== 'visual' ||
                            model.inputModalities.includes('image'),
                        )
                        .map((model) => (
                          <option key={modelKey(model)} value={modelKey(model)}>
                            {model.name ?? model.modelId} · {model.provider}
                          </option>
                        ))}
                    </select>
                  </label>
                  {selected && (
                    <>
                      <label>
                        Thinking level for {category}
                        <select
                          aria-label={`Thinking level for ${category}`}
                          disabled={pending || !model}
                          value={selected.thinkingLevel}
                          onChange={(event) =>
                            setRouting((previous) => ({
                              ...previous,
                              [category]: {
                                ...selected,
                                thinkingLevel: event.target.value as Level,
                              },
                            }))
                          }
                        >
                          {model &&
                            !supportedLevels(model).includes(
                              selected.thinkingLevel,
                            ) && (
                              <option value={selected.thinkingLevel}>
                                Unavailable: {selected.thinkingLevel}
                              </option>
                            )}
                          {model ? (
                            supportedLevels(model).map((level) => (
                              <option key={level}>{level}</option>
                            ))
                          ) : (
                            <option>{selected.thinkingLevel}</option>
                          )}
                        </select>
                      </label>
                      <label className="subagent-toggle">
                        <input
                          type="checkbox"
                          checked={selected.fastMode}
                          disabled={
                            pending || (!model?.fastMode && !selected.fastMode)
                          }
                          onChange={(event) =>
                            setRouting((previous) => ({
                              ...previous,
                              [category]: {
                                ...selected,
                                fastMode: event.target.checked,
                              },
                            }))
                          }
                        />
                        Fast mode for {category}
                      </label>
                      {!model && (
                        <small>
                          This model is no longer configured. Choose another
                          model or clear this category.
                        </small>
                      )}
                      {model && !model.fastMode && (
                        <small>This model does not advertise fast mode.</small>
                      )}
                    </>
                  )}
                </fieldset>
              );
            })}
            <div className="subagent-actions">
              <Button type="submit" className="primary" disabled={pending}>
                {pending ? 'Saving…' : 'Save category routing'}
              </Button>
              <Button
                disabled={pending}
                onClick={() => {
                  setError('');
                  void refresh().catch((cause) =>
                    setError(errorMessage(cause)),
                  );
                }}
              >
                Refresh model inventory
              </Button>
            </div>
          </form>
        </>
      )}
      {editor && state && (
        <ProfileEditor
          key={editor === 'new' ? 'new' : editor.id}
          accountId={accountId}
          profile={editor === 'new' ? undefined : editor}
          catalog={state.catalog}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setEditor(undefined);
            setNotice('Child profile saved.');
            setError('');
            try {
              await refresh();
            } catch (cause) {
              setError(`Saved, but refreshing failed: ${errorMessage(cause)}`);
            }
          }}
        />
      )}
      {removing && (
        <Dialog
          title="Delete child profile?"
          onClose={() => {
            if (!pending) setRemoving(undefined);
          }}
        >
          <div className="subagent-form">
            <p>
              Delete {removing.name} from the profiles available to future child
              tasks?
            </p>
            {error && <ErrorNotice error={error} />}
            <div className="subagent-actions">
              <Button
                className="danger"
                disabled={pending}
                onClick={() =>
                  void mutate(async () => {
                    await rpc(
                      'subagentConfiguration.removeProfile',
                      { accountId, profileId: removing.id },
                      true,
                    );
                    setRemoving(undefined);
                  }, 'Child profile deleted.')
                }
              >
                {pending ? 'Deleting…' : 'Delete profile'}
              </Button>
              <Button disabled={pending} onClick={() => setRemoving(undefined)}>
                Keep profile
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      {!state && error && (
        <Button
          onClick={() => {
            setError('');
            void refresh()
              .then((value) => setRouting(value.routing))
              .catch((cause) => setError(errorMessage(cause)));
          }}
        >
          Retry configuration
        </Button>
      )}
    </section>
  );
}
function ProfileEditor({
  accountId,
  profile,
  catalog,
  onClose,
  onSaved,
}: {
  accountId: number;
  profile?: Profile;
  catalog: Tool[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Profile>(
    profile ?? {
      id: 'custom-',
      name: '',
      instructions: '',
      context: 'fresh',
      readOnly: true,
      allowedTools: [],
    },
  );
  const [pending, setPending] = useState(false),
    [error, setError] = useState('');
  const unknown = draft.allowedTools.filter(
    (name) => !catalog.some((tool) => tool.name === name),
  );
  return (
    <Dialog
      title={profile ? 'Edit child profile' : 'Add child profile'}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <form
        className="subagent-form"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError('');
          void rpc(
            'subagentConfiguration.setProfile',
            { accountId, profile: draft, createOnly: !profile },
            true,
          )
            .then(onSaved)
            .catch((cause) => setError(errorMessage(cause)))
            .finally(() => setPending(false));
        }}
      >
        <label>
          Profile ID
          <input
            required
            pattern="custom-[A-Za-z0-9_-]{1,93}"
            disabled={pending || !!profile}
            value={draft.id}
            onChange={(event) =>
              setDraft((previous) => ({ ...previous, id: event.target.value }))
            }
          />
          <small>Start with custom-. The ID stays fixed after creation.</small>
        </label>
        <label>
          Profile name
          <input
            required
            maxLength={120}
            disabled={pending}
            value={draft.name}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Context
          <select
            aria-label="Context"
            disabled={pending}
            value={draft.context}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                context: event.target.value as Profile['context'],
              }))
            }
          >
            <option value="fresh">Fresh context</option>
            <option value="forked">Forked parent text</option>
          </select>
          <small>
            Forked context copies parent transcript text. Live browser and REPL
            handles stay with the parent.
          </small>
        </label>
        <label className="subagent-toggle">
          <input
            type="checkbox"
            checked={draft.readOnly}
            disabled={pending}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                readOnly: event.target.checked,
              }))
            }
          />
          Restrict to read-only exploration
        </label>
        <label>
          Instructions
          <textarea
            aria-label="Instructions"
            rows={8}
            maxLength={32000}
            disabled={pending}
            value={draft.instructions}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                instructions: event.target.value,
              }))
            }
          />
        </label>
        <fieldset>
          <legend>Selected tools</legend>
          <small>
            Selections narrow the parent's tools. Read-only mode additionally
            disables mutating tools, while retaining their saved selections.
          </small>
          {catalog.map((tool) => (
            <label className="subagent-toggle" key={tool.name}>
              <input
                type="checkbox"
                disabled={pending}
                checked={draft.allowedTools.includes(tool.name)}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    allowedTools: event.target.checked
                      ? [...previous.allowedTools, tool.name]
                      : previous.allowedTools.filter(
                          (name) => name !== tool.name,
                        ),
                  }))
                }
              />
              <span>
                {tool.label}
                <small>
                  {tool.name}
                  {draft.readOnly && !tool.readOnly
                    ? ' · Inactive in read-only mode'
                    : ''}
                </small>
              </span>
            </label>
          ))}
          {unknown.map((name) => (
            <label className="subagent-toggle" key={name}>
              <input
                type="checkbox"
                checked
                disabled={pending}
                onChange={() =>
                  setDraft((previous) => ({
                    ...previous,
                    allowedTools: previous.allowedTools.filter(
                      (value) => value !== name,
                    ),
                  }))
                }
              />
              Remove unavailable saved tool: {name}
            </label>
          ))}
        </fieldset>
        {error && <ErrorNotice error={error} />}
        <div className="subagent-actions">
          <Button type="submit" className="primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save child profile'}
          </Button>
          <Button disabled={pending} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
