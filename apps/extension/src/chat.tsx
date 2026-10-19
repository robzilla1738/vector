import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowDown, ArrowUp, Plus, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { rpc } from './daemon';
import type { Message, Model, ModelSelection, Session } from './types';
export function Chat({
  accountId,
  sessionId,
  onSession,
}: {
  accountId: number;
  sessionId?: string;
  onSession: (id: string) => void;
}) {
  const [session, setSession] = useState<Session>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState('');
  const [effort, setEffort] = useState('medium');
  const [extendedBrowsing, setExtendedBrowsing] = useState(false);
  const [permission, setPermission] = useState('guard');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [delivery, setDelivery] = useState('queue');
  const [latest, setLatest] = useState(true);
  const transcript = useRef<HTMLDivElement>(null);
  const [answer, setAnswer] = useState('');
  const [queuedEdit, setQueuedEdit] = useState<{
    id: string;
    version: number;
    prompt: string;
  }>();
  const dispatchKey = useRef(crypto.randomUUID());
  const draftKey = `aux.draft.${accountId}.${sessionId ?? 'new'}`;
  const editor = useEditor({
    extensions: [StarterKit],
    content: localStorage.getItem(draftKey) ?? '',
    editorProps: {
      attributes: {
        'aria-label': 'What should Aux work on?',
        role: 'textbox',
        'aria-multiline': 'true',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          document.querySelector<HTMLButtonElement>('[data-send]')?.click();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      localStorage.setItem(draftKey, editor.getHTML());
      dispatchKey.current = crypto.randomUUID();
    },
  });
  useEffect(() => {
    let active = true;
    void rpc<Model[]>('models.listAvailable', { accountId })
      .then((rows) => {
        if (active) {
          setModels(rows);
          setModel(rows[0]?.id ?? '');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [accountId]);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      if (!sessionId) return;
      try {
        const [record, rows] = await Promise.all([
          rpc<Session>('sessions.get', { accountId, sessionId }),
          rpc<Message[]>('sessions.messageRows', { accountId, sessionId }),
        ]);
        if (active) {
          setSession(record);
          setMessages(rows);
          setModel(`${record.model.provider}/${record.model.modelId}`);
          setEffort(record.model.thinkingLevel);
          setPermission(record.permissionMode);
        }
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : 'The task could not be loaded.',
          );
      }
      if (active) timer = setTimeout(() => void refresh(), 1000);
    }
    setSession(undefined);
    setMessages([]);
    void refresh();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [accountId, sessionId]);
  useEffect(() => {
    if (latest && messages.length)
      transcript.current?.scrollTo({
        top: transcript.current.scrollHeight,
        behavior: 'instant',
      });
  }, [messages, latest]);
  async function mutate(procedure: string, input: Record<string, unknown>) {
    setPending(true);
    setError('');
    try {
      return await rpc<Session>(
        procedure,
        { accountId, sessionId, ...input },
        true,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'The change could not be saved.',
      );
      throw e;
    } finally {
      setPending(false);
    }
  }
  async function submit() {
    const text = editor?.getText().trim();
    if (!text || pending) return;
    const chosen = models.find((item) => item.id === model);
    if (!chosen) {
      setError('Connect a model to start. Open Preferences → AI connections.');
      return;
    }
    try {
      let result: Session;
      if (!sessionId) {
        result = await mutate('sessions.createAndPrompt', {
          message: text,
          triggerIdempotencyKey: dispatchKey.current,
          model: {
            provider: chosen.provider,
            modelId: chosen.modelId,
            thinkingLevel: chosen.thinkingLevels?.includes(effort)
              ? effort
              : 'off',
            fastMode: false,
          } satisfies ModelSelection,
          permissionMode: permission,
          runtimeConfig: { proactiveMode: extendedBrowsing },
          incognito: chrome?.extension?.inIncognitoContext ?? false,
        });
      } else {
        const procedure =
          session?.status === 'running'
            ? `sessions.${delivery}`
            : 'sessions.prompt';
        result = await mutate(procedure, {
          message: text,
          prompt: text,
          idempotencyKey: dispatchKey.current,
        });
      }
      editor?.commands.clearContent();
      localStorage.removeItem(draftKey);
      setSession(result);
      if (!sessionId) onSession(result.id);
    } catch {
      /* The error remains visible and the draft is preserved. */
    }
  }
  async function updateSelection(input: Record<string, unknown>) {
    if (!sessionId) return;
    try {
      setSession(await mutate('sessions.update', input));
    } catch {}
  }
  const running = session?.status === 'running';
  const suspension = session?.suspension;
  return (
    <div className="chat">
      <header className="chat-header row spread">
        <span>{session?.title ?? 'Start a task'}</span>
        <Button
          className="icon ghost"
          aria-label="Start a task"
          onClick={() => (location.hash = '/chat')}
        >
          <Plus size={16} />
        </Button>
      </header>
      <div
        className="transcript"
        ref={transcript}
        onScroll={() => {
          const element = transcript.current;
          if (element)
            setLatest(
              element.scrollHeight - element.scrollTop - element.clientHeight <
                60,
            );
        }}
      >
        {messages.length === 0 ? (
          <Empty>Give Aux a task and add any useful context.</Empty>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`message ${message.role}`}>
              <small>
                {message.role === 'tool'
                  ? 'Tool activity'
                  : message.role === 'user'
                    ? 'You'
                    : 'Aux'}
              </small>
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </article>
          ))
        )}
        {running && (
          <p className="muted" role="status">
            Working…
          </p>
        )}
        {suspension && (
          <section className="approval stack">
            <strong>
              {suspension.kind === 'ask-user-question'
                ? 'A detail is needed'
                : 'Allow this action?'}
            </strong>
            <p>
              {String(
                suspension.request.message ??
                  suspension.request.title ??
                  'Review the requested operation.',
              )}
            </p>
            <pre>
              {JSON.stringify(
                suspension.request.operation ??
                  suspension.request.questions ??
                  suspension.request,
                null,
                2,
              )}
            </pre>
            {suspension.kind === 'ask-user-question' ? (
              <>
                <textarea
                  aria-label="Answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <Button
                  disabled={pending || !answer.trim()}
                  onClick={() =>
                    void mutate('sessions.resolveSuspension', {
                      toolCallId: suspension.toolCallId,
                      response: { answers: [{ header: 'Answer', answer }] },
                    })
                      .then(setSession)
                      .catch(() => {})
                  }
                >
                  Submit answer
                </Button>
              </>
            ) : (
              <div className="row">
                <Button
                  disabled={pending}
                  onClick={() =>
                    void mutate('sessions.resolveSuspension', {
                      toolCallId: suspension.toolCallId,
                      response:
                        suspension.kind === 'action-confirmation'
                          ? { verdict: 'confirm' }
                          : { verdict: 'allow', always: false },
                    })
                      .then(setSession)
                      .catch(() => {})
                  }
                >
                  Allow once
                </Button>
                <Button
                  disabled={pending}
                  onClick={() =>
                    void mutate('sessions.resolveSuspension', {
                      toolCallId: suspension.toolCallId,
                      response:
                        suspension.kind === 'action-confirmation'
                          ? { verdict: 'cancel' }
                          : { verdict: 'deny', always: false },
                    })
                      .then(setSession)
                      .catch(() => {})
                  }
                >
                  Decline
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
      {!latest && (
        <Button className="latest" onClick={() => setLatest(true)}>
          <ArrowDown size={14} />
          Latest activity
        </Button>
      )}
      {queuedEdit && (
        <Dialog
          title="Edit queued input"
          onClose={() => setQueuedEdit(undefined)}
        >
          <textarea
            aria-label="Queued input"
            value={queuedEdit.prompt}
            onChange={(event) =>
              setQueuedEdit({ ...queuedEdit, prompt: event.target.value })
            }
          />
          <Button
            disabled={pending || !queuedEdit.prompt.trim()}
            onClick={() =>
              void mutate('sessions.updateQueuedMessage', {
                queuedMessageId: queuedEdit.id,
                version: queuedEdit.version,
                prompt: queuedEdit.prompt,
              })
                .then((value) => {
                  setSession(value);
                  setQueuedEdit(undefined);
                })
                .catch(() => {})
            }
          >
            Save
          </Button>
        </Dialog>
      )}
      <footer className="composer-wrap">
        {error && <ErrorNotice error={error} />}
        <div className="queue">
          {session?.queue?.map((item, index) => (
            <div className="row spread" key={item.id ?? item.timestamp}>
              <span>{item.prompt}</span>
              <Button
                disabled={pending}
                onClick={() =>
                  setQueuedEdit({
                    id: item.id,
                    version: item.version,
                    prompt: item.prompt,
                  })
                }
              >
                Edit
              </Button>
              <Button
                disabled={pending || index === 0}
                aria-label={`Move queued message ${index + 1} up`}
                onClick={() =>
                  void mutate('sessions.moveQueuedMessage', {
                    queuedMessageId: item.id,
                    version: item.version,
                    beforeTimestamp:
                      session.queue[index - 1]?.timestamp ?? null,
                  })
                    .then(setSession)
                    .catch(() => {})
                }
              >
                ↑
              </Button>
              <Button
                disabled={pending}
                onClick={() =>
                  void mutate('sessions.removeQueuedMessage', {
                    version: item.version,
                    queuedMessageId: item.id,
                  })
                    .then(setSession)
                    .catch(() => {})
                }
              >
                Remove {index + 1}
              </Button>
            </div>
          ))}
        </div>
        <div className="composer">
          <EditorContent editor={editor} />
          <div className="composer-actions row spread">
            <div className="row wrap">
              <select
                aria-label="Model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  const selected = models.find((m) => m.id === e.target.value);
                  if (selected)
                    void updateSelection({
                      model: {
                        provider: selected.provider,
                        modelId: selected.modelId,
                        thinkingLevel: effort,
                        fastMode: false,
                      },
                    });
                }}
              >
                <option value="">Connect a model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name ?? m.id}
                  </option>
                ))}
              </select>
              <select
                aria-label="Effort"
                value={effort}
                onChange={(e) => {
                  setEffort(e.target.value);
                  if (session)
                    void updateSelection({
                      model: {
                        ...session.model,
                        thinkingLevel: e.target.value,
                      },
                    });
                }}
              >
                {(
                  models.find((m) => m.id === model)?.thinkingLevels ?? ['off']
                ).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <Button
                aria-pressed={extendedBrowsing}
                onClick={() => {
                  setExtendedBrowsing(!extendedBrowsing);
                  void updateSelection({
                    runtimeConfig: { proactiveMode: !extendedBrowsing },
                  });
                }}
              >
                Extended browsing
              </Button>
              <select
                aria-label="Access"
                value={permission}
                onChange={(e) => {
                  setPermission(e.target.value);
                  void updateSelection({ permissionMode: e.target.value });
                }}
              >
                <option value="read-only">Ask first</option>
                <option value="guard">Limited access</option>
                <option value="full-access">Full access</option>
              </select>
              {running && (
                <select
                  aria-label="Delivery"
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                >
                  <option value="queue">Add to queue</option>
                  <option value="steer">Send now</option>
                </select>
              )}
            </div>
            <div className="row">
              {running && (
                <Button
                  className="icon"
                  aria-label="Stop task"
                  disabled={pending}
                  onClick={() =>
                    void mutate('sessions.interrupt', {})
                      .then(setSession)
                      .catch(() => {})
                  }
                >
                  <Square size={14} />
                </Button>
              )}
              <Button
                data-send
                className="primary icon"
                aria-label="Start"
                disabled={pending || !model}
                onClick={() => void submit()}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </div>
        </div>
        <small className="local-note">
          Tasks run with your local account’s access rules.
        </small>
      </footer>
    </div>
  );
}
