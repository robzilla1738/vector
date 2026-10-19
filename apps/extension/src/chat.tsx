import { TurnRail } from './turn-rail';
import './intrinsic-surfaces.css';
import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Paperclip,
  Plus,
  Square,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { rpc } from './daemon';
import type {
  Attachment,
  Message,
  Model,
  ModelSelection,
  Session,
} from './types';

const attachmentTypes = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);
const extensionTypes: Record<string, string> = {
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};
interface DraftFile {
  key: string;
  file: File;
  mediaType: string;
  previewUrl?: string;
}
function fileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      if (typeof value !== 'string' || !value.includes(','))
        reject(new Error('The selected file could not be read.'));
      else resolve(value.slice(value.indexOf(',') + 1));
    };
    reader.onerror = () =>
      reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}
function fileSize(size: number) {
  return size < 1024
    ? `${size} B`
    : size < 1048576
      ? `${Math.ceil(size / 1024)} KB`
      : `${(size / 1048576).toFixed(1)} MB`;
}
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [files, setFiles] = useState<DraftFile[]>([]);
  const chooser = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  const uploaded = useRef(new Map<string, { sessionId: string; id: string }>());
  const draftSession = useRef<string | undefined>(undefined);
  const creationKey = useRef(crypto.randomUUID());
  const submission = useRef<
    { key: string; sessionId: string; procedure: string } | undefined
  >(undefined);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState('');
  const [effort, setEffort] = useState('medium');
  const [extendedBrowsing, setExtendedBrowsing] = useState(false);
  const [permission, setPermission] = useState('guard');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [delivery, setDelivery] = useState('queue');
  const [latest, setLatest] = useState(true);
  const transcript = useRef<HTMLElement>(null);
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
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const url of previewUrls.current) URL.revokeObjectURL(url);
    };
  }, []);
  useEffect(() => {
    editor?.setEditable(!pending);
  }, [editor, pending]);
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
        const [record, rows, fileMetadata] = await Promise.all([
          rpc<Session>('sessions.get', { accountId, sessionId }),
          rpc<Message[]>('sessions.messageRows', { accountId, sessionId }),
          rpc<Attachment[]>('sessions.attachments', { accountId, sessionId }),
        ]);
        if (active) {
          setSession(record);
          setMessages(rows);
          setAttachments(fileMetadata);
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
    setAttachments([]);
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
  function chooseFiles(selected: FileList | null) {
    if (!selected || submitting.current) return;
    const additions: DraftFile[] = [];
    let size = files.reduce((total, entry) => total + entry.file.size, 0);
    let failure = '';
    for (const file of selected) {
      const mediaType = attachmentTypes.has(file.type)
        ? file.type
        : extensionTypes[file.name.split('.').pop()?.toLowerCase() ?? ''];
      if (!mediaType) {
        failure = `${file.name}: choose text, CSV, JSON, PDF or a supported image.`;
        continue;
      }
      if (!file.size || file.size > 2 * 1024 * 1024) {
        failure = `${file.name}: files must be nonempty and at most 2 MB.`;
        continue;
      }
      if (
        files.length + additions.length >= 10 ||
        size + file.size > 8 * 1024 * 1024
      ) {
        failure = 'Choose at most ten files totaling 8 MB.';
        break;
      }
      const previewUrl = mediaType.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;
      if (previewUrl) previewUrls.current.add(previewUrl);
      additions.push({
        key: crypto.randomUUID(),
        file,
        mediaType,
        ...(previewUrl ? { previewUrl } : {}),
      });
      size += file.size;
    }
    if (additions.length) {
      setFiles((previous) => [...previous, ...additions]);
      dispatchKey.current = crypto.randomUUID();
    }
    setError(failure);
  }
  function removeFile(file: DraftFile) {
    if (submitting.current) return;
    setFiles((previous) => previous.filter((entry) => entry.key !== file.key));
    dispatchKey.current = crypto.randomUUID();
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
      previewUrls.current.delete(file.previewUrl);
    }
    const remote = uploaded.current.get(file.key);
    if (remote)
      void rpc(
        'sessions.removeAttachment',
        { accountId, sessionId: remote.sessionId, attachmentId: remote.id },
        true,
      ).catch((e) =>
        setError(
          e instanceof Error
            ? e.message
            : 'The uploaded draft file could not be removed.',
        ),
      );
    uploaded.current.delete(file.key);
  }
  async function downloadFile(file: Attachment) {
    try {
      const result = await rpc<Attachment & { base64: string }>(
        'sessions.readAttachment',
        { accountId, sessionId, attachmentId: file.id },
      );
      const bytes = Uint8Array.from(atob(result.base64), (character) =>
        character.charCodeAt(0),
      );
      const url = URL.createObjectURL(
        new Blob([bytes], { type: result.mediaType }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'The attachment could not be retrieved.',
      );
    }
  }
  async function submit() {
    const text = editor?.getText().trim();
    if (!text || submitting.current) return;
    const chosen = models.find((item) => item.id === model);
    if (!chosen) {
      setError('Connect a model to start. Open Preferences → AI connections.');
      return;
    }
    const key = dispatchKey.current;
    const selectedFiles = [...files];
    if (
      selectedFiles.some(
        (file) =>
          !file.mediaType.startsWith('text/') &&
          file.mediaType !== 'application/json',
      ) &&
      (chosen.provider !== 'vercel-ai-gateway' ||
        chosen.modelId !== 'meta/muse-spark-1.3-contributor')
    ) {
      setError(
        'Choose Muse Spark to submit images or PDF files, or attach UTF-8 text.',
      );
      return;
    }
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      let target = sessionId ?? draftSession.current;
      let current = session;
      if (!target) {
        const created = await rpc<Session>(
          'sessions.create',
          {
            accountId,
            triggerIdempotencyKey: creationKey.current,
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
          },
          true,
        );
        target = created.id;
        draftSession.current = target;
        current = created;
        if (mounted.current) setSession(created);
      }
      if (
        !sessionId &&
        draftSession.current &&
        current?.id === draftSession.current &&
        current.status === 'idle' &&
        (current.model.provider !== chosen.provider ||
          current.model.modelId !== chosen.modelId ||
          current.model.thinkingLevel !==
            (chosen.thinkingLevels?.includes(effort) ? effort : 'off') ||
          current.permissionMode !== permission ||
          current.runtimeConfig?.proactiveMode !== extendedBrowsing)
      ) {
        await rpc(
          'sessions.update',
          {
            accountId,
            sessionId: target,
            model: {
              provider: chosen.provider,
              modelId: chosen.modelId,
              thinkingLevel: chosen.thinkingLevels?.includes(effort)
                ? effort
                : 'off',
              fastMode: false,
            },
            permissionMode: permission,
            runtimeConfig: { proactiveMode: extendedBrowsing },
          },
          true,
        );
      }
      const ids: string[] = [];
      for (const file of selectedFiles) {
        let cached = uploaded.current.get(file.key);
        if (!cached || cached.sessionId !== target) {
          const result = await rpc<Attachment>(
            'sessions.uploadAttachment',
            {
              accountId,
              sessionId: target,
              idempotencyKey: file.key,
              fileName: file.file.name,
              mediaType: file.mediaType,
              base64: await fileBase64(file.file),
            },
            true,
          );
          cached = { sessionId: target, id: result.id };
          uploaded.current.set(file.key, cached);
        }
        ids.push(cached.id);
      }
      let attempt = submission.current;
      if (!attempt || attempt.key !== key || attempt.sessionId !== target) {
        attempt = {
          key,
          sessionId: target,
          procedure:
            session?.status === 'running' || session?.status === 'suspended'
              ? `sessions.${delivery}`
              : 'sessions.prompt',
        };
        submission.current = attempt;
      }
      const result = await rpc<Session>(
        attempt.procedure,
        {
          accountId,
          sessionId: target,
          message: text,
          prompt: text,
          idempotencyKey: key,
          attachmentIds: ids,
        },
        true,
      );
      localStorage.removeItem(draftKey);
      if (!mounted.current) return;
      editor?.commands.clearContent();
      localStorage.removeItem(draftKey);
      for (const file of selectedFiles)
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
          previewUrls.current.delete(file.previewUrl);
        }
      setFiles([]);
      uploaded.current.clear();
      submission.current = undefined;
      dispatchKey.current = crypto.randomUUID();
      setSession(result);
      if (!sessionId) onSession(result.id);
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error
            ? e.message
            : 'The message could not be sent. Your draft and files are retained.',
        );
    } finally {
      submitting.current = false;
      if (mounted.current) setPending(false);
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
      <TurnRail
        messages={messages}
        transcript={transcript}
        visible={!!sessionId}
        onNavigate={() => setLatest(false)}
      />
      <section
        aria-label="Conversation transcript"
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
            <article
              key={message.id}
              data-message-id={message.id}
              className={`message ${message.role}`}
            >
              <small>
                {message.role === 'tool'
                  ? 'Tool activity'
                  : message.role === 'user'
                    ? 'You'
                    : 'Aux'}
              </small>
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
              {message.attachmentIds?.map((id) => {
                const file = attachments.find((entry) => entry.id === id);
                return (
                  <div className="transcript-attachment row wrap" key={id}>
                    <span className="attachment-icon" aria-hidden="true">
                      <Paperclip size={16} />
                    </span>
                    <span className="attachment-label">
                      <strong>{file?.fileName ?? 'Attached file'}</strong>
                      <small>
                        {file
                          ? `${fileSize(file.size)} · ${file.mediaType}`
                          : 'Metadata unavailable.'}
                      </small>
                    </span>
                    {file && (
                      <Button
                        onClick={() => void downloadFile(file)}
                        aria-label={`Download ${file.fileName}`}
                      >
                        <Download size={14} />
                        Download
                      </Button>
                    )}
                  </div>
                );
              })}
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
      </section>
      {!latest && (
        <Button className="latest" onClick={() => setLatest(true)}>
          <ArrowDown size={14} />
          Latest activity
        </Button>
      )}
      {queuedEdit && (
        <Dialog
          title="Edit queued input"
          onClose={() => {
            if (!pending) setQueuedEdit(undefined);
          }}
        >
          <textarea
            className="message-edit-body"
            aria-label="Queued input"
            value={queuedEdit.prompt}
            onChange={(event) =>
              setQueuedEdit({ ...queuedEdit, prompt: event.target.value })
            }
          />
          {error && <ErrorNotice error={error} />}
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
          <Button disabled={pending} onClick={() => setQueuedEdit(undefined)}>
            Cancel
          </Button>
        </Dialog>
      )}
      <footer className="composer-wrap chat-bottom-actions">
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
                disabled={pending || index === session.queue.length - 1}
                aria-label={`Move queued message ${index + 1} down`}
                onClick={() =>
                  void mutate('sessions.moveQueuedMessage', {
                    queuedMessageId: item.id,
                    version: item.version,
                    beforeTimestamp:
                      session.queue[index + 2]?.timestamp ?? null,
                  })
                    .then(setSession)
                    .catch(() => {})
                }
              >
                ↓
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
        {files.length > 0 && (
          <section aria-label="Selected files" className="stack">
            <small>Files stay on this device until you send the message.</small>
            {files.map((file) => (
              <div className="row spread" key={file.key}>
                {file.previewUrl && (
                  <img
                    src={file.previewUrl}
                    alt={`Local preview of ${file.file.name}`}
                    style={{
                      maxWidth: 96,
                      maxHeight: 72,
                      objectFit: 'contain',
                    }}
                  />
                )}
                <span>
                  {file.file.name}
                  <small className="muted">
                    {' '}
                    · {fileSize(file.file.size)} · {file.mediaType}
                  </small>
                </span>
                <Button
                  disabled={pending}
                  aria-label={`Remove ${file.file.name} from draft`}
                  onClick={() => removeFile(file)}
                >
                  <X size={14} />
                  Remove
                </Button>
              </div>
            ))}
          </section>
        )}
        <input
          ref={chooser}
          type="file"
          multiple
          hidden
          disabled={pending}
          accept=".txt,.md,.csv,.json,.pdf,.png,.jpg,.jpeg,.gif,.webp"
          aria-label="Choose files to attach"
          onChange={(event) => {
            chooseFiles(event.currentTarget.files);
            event.currentTarget.value = '';
          }}
        />
        <div className="composer">
          <EditorContent editor={editor} />
          <div className="composer-actions row spread">
            <div className="row wrap">
              <Button
                className="icon"
                disabled={pending || files.length >= 10}
                aria-label="Attach files"
                onClick={() => chooser.current?.click()}
              >
                <Paperclip size={16} />
              </Button>
              <select
                disabled={pending}
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
                disabled={pending}
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
                disabled={pending}
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
                disabled={pending}
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
                aria-label="Send message"
                title={
                  files.length
                    ? 'Send message and attached files'
                    : 'Send message'
                }
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
