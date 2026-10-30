/* Aux-owned source, composer pass 2: sending, the queue and message editing
 * (assets/session-composer-Dc0LRfZA.js, from useComposerSend to MessageEditor). Names the chunk uses
 * elsewhere keep their chunk names: Vh useComposerSend, co refreshSession, lo setSessionStatus,
 * zh ConversationRow, uo InlineMention, Dr allTurns, qh MessageEditor.
 * Chunk names used: a JSX runtime, g React, Y cn, J Button, ge useApp, Ce useTRPC, _e useQueryClient,
 * ve useMutation, me useSession, ot session client, Kl while-responding preference, ir analytics,
 * lr confirm dialog, io queued messages, oo upload attachments, Cr/tu tab and skill icons, st message
 * key, Ra editor snapshot, jr mentions, He editor parts, hl submit key check, de toast, kt spinner. */
var /** useComposerSend: send, stop, steer or queue while a reply runs, and clear an interrupted queue first if asked. */
  Vh = ({
    sendMessage: sendMessageOverride,
    stop: stopOverride,
    onSubmitWhileResponding: submitWhileRespondingOverride,
  } = {}) => {
    const {accountId} = ge(),
      trpc = Ce(),
      queryClient = _e(),
      uploadAttachment = ve(trpc.sessions.files.uploadAttachment.mutationOptions()),
      removeQueuedMessage = ve(trpc.sessions.removeQueuedMessage.mutationOptions()),
      {currentSession} = me(),
      {sendMessage, steer, queue, interrupt} = ot(),
      whileRespondingMode = Kl(),
      {capture} = ir(),
      {confirmChoice} = lr(),
      setStatus = (0, g.useCallback)(
        nextStatus => {
          lo({accountId, currentSessionId: currentSession.id, nextStatus, queryClient, trpc});
        },
        [accountId, currentSession.id, queryClient, trpc],
      ),
      refreshSession = (0, g.useCallback)(() => {
        co({accountId, currentSessionId: currentSession.id, queryClient, trpc});
      }, [accountId, currentSession.id, queryClient, trpc]),
      confirmSubmit = (0, g.useCallback)(async () => {
        const queued = io(currentSession);
        if (currentSession.status !== 'interrupted' || queued.length === 0) return true;
        const noun = queued.length === 1 ? 'message' : 'messages',
          choice = await confirmChoice({
            title: 'Send message?',
            description: `You are about to send a message. Do you want to clear the ${queued.length} ${noun} previously queued?`,
            cancelResult: 'cancel',
            actions: [
              {result: 'clear', label: 'Clear queue', variant: 'destructive'},
              {result: 'send', label: 'Send message'},
            ],
          });
        return choice === 'cancel'
          ? false
          : (choice === 'clear' &&
              (await Promise.all(
                queued.map(entry =>
                  removeQueuedMessage.mutateAsync({sessionId: currentSession.id, message: entry.message, accountId}),
                ),
              ),
              refreshSession()),
            true);
      }, [accountId, confirmChoice, currentSession, refreshSession, removeQueuedMessage]),
      prepareOutgoingMessage = (0, g.useCallback)(
        async message =>
          currentSession.id
            ? await oo(
                message,
                async attachment =>
                  await uploadAttachment.mutateAsync({accountId, sessionId: currentSession.id, attachment}),
              )
            : message,
        [accountId, currentSession.id, uploadAttachment],
      );
    return {
      sendMessage: (0, g.useCallback)(
        async message => {
          currentSession.id &&
            currentSession.status !== 'running' &&
            currentSession.status !== 'suspended' &&
            setStatus('running');
          try {
            if (currentSession.status === 'interrupted') {
              (await steer(message, {mode: 'interrupt'}), capture('tasks.steer', {sessionId: currentSession.id}));
              return;
            }
            await (sendMessageOverride ?? sendMessage)(message);
          } catch (error) {
            throw (refreshSession(), error);
          }
        },
        [
          capture,
          currentSession.id,
          currentSession.status,
          refreshSession,
          sendMessage,
          sendMessageOverride,
          setStatus,
          steer,
        ],
      ),
      stop: (0, g.useCallback)(async () => {
        setStatus('interrupted');
        try {
          await (stopOverride ?? interrupt)();
        } catch (error) {
          throw (refreshSession(), error);
        }
      }, [interrupt, refreshSession, setStatus, stopOverride]),
      prepareOutgoingMessage,
      confirmSubmit,
      onSubmitWhileResponding: (0, g.useCallback)(
        async (message, options = {}) => {
          if (submitWhileRespondingOverride) {
            await submitWhileRespondingOverride(message, options);
            return;
          }
          const sendNow = options.whileResponding === 'send-now' || whileRespondingMode === 'steer',
            deliver = sendNow ? steer : queue,
            sessionKey = currentSession.id
              ? trpc.sessions.get.queryKey({sessionId: currentSession.id, accountId})
              : null,
            previous = sessionKey ? queryClient.getQueryData(sessionKey) : void 0;
          try {
            (await deliver(message),
              sendNow
                ? capture('tasks.steer', {sessionId: currentSession.id})
                : capture('tasks.queue', {sessionId: currentSession.id}));
          } catch (error) {
            if (sessionKey) {
              const {messages, ...rest} = currentSession;
              queryClient.setQueryData(sessionKey, previous ?? rest);
            }
            throw error;
          }
        },
        [
          accountId,
          capture,
          currentSession,
          whileRespondingMode,
          submitWhileRespondingOverride,
          queryClient,
          queue,
          steer,
          trpc.sessions.get,
        ],
      ),
    };
  } /** Refreshes a session and the session lists. */,
  co = ({accountId, currentSessionId, queryClient, trpc}) => {
    (queryClient.invalidateQueries(trpc.sessions.get.queryFilter({sessionId: currentSessionId, accountId})),
      queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
      queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})));
  } /** Sets a session’s status in the cache ahead of the server. */,
  lo = ({accountId, currentSessionId, nextStatus, queryClient, trpc}) => {
    const updatedAt = new Date().toISOString();
    (queryClient.setQueryData(
      trpc.sessions.get.queryKey({sessionId: currentSessionId, accountId}),
      session => session && {...session, status: nextStatus, updatedAt},
    ),
      queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
      queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})));
  } /** ConversationRow: one row of the conversation. */,
  zh = ({children, row}) => {
    const isActivity = row.type === 'assistant-activity';
    return (0, a.jsx)(AnnotationHost, {
      children: (0, a.jsx)('div', {className: Y('w-full max-w-full min-w-0', !isActivity && 'pb-2'), children}),
    });
  },
  AnnotationHost = ({children}) =>
    (0, a.jsx)('div', {
      className: 'relative w-full max-w-full min-w-0',
      'data-chat-annotation-host': '',
      children,
    }) /** InlineMention: a tab or skill mention inside a message. */,
  uo = ({type, name, icon}) => {
    const [failedIcon, setFailedIcon] = (0, g.useState)(),
      FallbackIcon = type === 'tab' ? Cr : tu,
      onError = () => setFailedIcon(icon);
    return (0, a.jsxs)('span', {
      className:
        'text-brand-content inline-flex max-w-full items-center gap-1 align-top text-sm leading-5 font-medium no-underline',
      children: [
        icon && icon !== failedIcon
          ? (0, a.jsx)('img', {alt: '', className: 'size-4 shrink-0 rounded-xs', draggable: false, src: icon, onError})
          : (0, a.jsx)(FallbackIcon, {className: 'size-4 shrink-0'}),
        (0, a.jsx)('span', {
          className: 'inline-block max-w-60 min-w-0 truncate align-baseline',
          title: name,
          children: name,
        }),
      ],
    });
  }; /** All turns of the cached pages, oldest first. */
function Dr(pages) {
  return [...pages].reverse().flatMap(page => page.turns);
} /** The turn pages after an edit: the new overview, then the earlier turns still cached. */
function pagesAfterEdit(cached, overview, messageKey) {
  if (!overview.turns.at(-1)) throw new Error('Failed to resolve the edited turn.');
  const turns = cached ? Dr(cached.pages) : [],
    editedTurn = turns.find(turn => turn.input.some((input, index) => st(input, index) === messageKey));
  if (!editedTurn) return {pages: [overview], pageParams: [null]};
  const kept = new Set(overview.turns.map(turn => turn.id)),
    earlier = turns.filter(turn => turn.ordinal < editedTurn.ordinal && !kept.has(turn.id));
  return earlier.length === 0
    ? {pages: [overview], pageParams: [null]}
    : {
        pages: [
          overview,
          {
            turns: earlier,
            transcriptRevision: overview.transcriptRevision,
            nextCursor: cached?.pages.at(-1)?.nextCursor,
          },
        ],
        pageParams: [null, overview.nextCursor ?? null],
      };
}
function messagePlainText(message) {
  if (typeof message.content == 'string') return message.content;
  let text = '';
  for (const part of message.content) part.type === 'text' && (text += part.text);
  return text;
} /** MessageEditor: edits a sent message in place and resends it from there. */
function qh({message, messageId, metadata, onCancel, onSubmitted}) {
  const {accountId} = ge(),
    trpc = Ce(),
    queryClient = _e(),
    {currentSession, prepareBrowserAction} = me(),
    {client} = ot(),
    editMessage = ve(trpc.sessions.editUserMessage.mutationOptions()),
    submitting = (0, g.useRef)(false),
    [pending, setPending] = (0, g.useState)(false),
    [initialSnapshot] = (0, g.useState)(() => Ra(messagePlainText(message))),
    latest = (0, g.useRef)(initialSnapshot),
    [snapshot, setSnapshot] = (0, g.useState)(initialSnapshot),
    {skillMention} = jr({includeTabs: false}),
    hasFiles =
      metadata?.attachments.some(attachment => attachment.type === 'file' || attachment.type === 'directory') ?? false,
    canSubmit = snapshot.plainText.trim().length > 0 || hasFiles,
    onChange = (0, g.useCallback)(next => {
      ((latest.current = next), setSnapshot(next));
    }, []),
    submit = (0, g.useCallback)(async () => {
      if (!currentSession.id || submitting.current || !canSubmit) return;
      ((submitting.current = true), setPending(true));
      const content = latest.current.plainText.trim();
      try {
        await prepareBrowserAction();
        const rowId =
          messageId ??
          (
            await queryClient.fetchQuery(
              trpc.sessions.messageRows.queryOptions({sessionId: currentSession.id, accountId}),
            )
          ).find(row => row.messageKey === st(message, 0))?.id;
        if (!rowId) throw new Error('Failed to resolve the edited message.');
        const result = await editMessage.mutateAsync({
          sessionId: currentSession.id,
          messageId: rowId,
          content,
          accountId,
        });
        (await Promise.all([
          queryClient.cancelQueries(
            trpc.sessions.turns.activeMessages.queryFilter({sessionId: currentSession.id, accountId}),
          ),
          queryClient.cancelQueries(
            trpc.sessions.turns.list.infiniteQueryFilter({sessionId: currentSession.id, accountId}),
          ),
          queryClient.cancelQueries(trpc.sessions.messageRows.queryFilter({sessionId: currentSession.id, accountId})),
        ]),
          queryClient.setQueryData(
            trpc.sessions.get.queryKey({sessionId: currentSession.id, accountId}),
            result.session,
          ),
          queryClient.setQueryData(
            trpc.sessions.turns.activeMessages.queryKey({sessionId: currentSession.id, accountId}),
            result.messages,
          ));
        const turnsKey = trpc.sessions.turns.list.infiniteQueryKey({sessionId: currentSession.id, accountId}),
          pages = pagesAfterEdit(queryClient.getQueryData(turnsKey), result.overview, st(message, 0));
        queryClient.setQueryData(turnsKey, pages);
        const lastTurn = result.overview.turns.at(-1);
        if (!lastTurn) throw new Error('Failed to resolve the edited turn.');
        (client.setTurns(Dr(pages.pages), result.overview.transcriptRevision),
          client.replaceEditedMessages(result.messages, lastTurn.id),
          onSubmitted(),
          Promise.all([
            queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
            queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
            queryClient.invalidateQueries(
              trpc.sessions.turns.activeMessages.queryFilter({sessionId: currentSession.id, accountId}),
            ),
            queryClient.invalidateQueries(
              trpc.sessions.messageRows.queryFilter({sessionId: currentSession.id, accountId}),
            ),
          ]).catch(() => {}));
      } catch (error) {
        de.error(error instanceof Error ? error.message : 'Failed to edit the message.');
      } finally {
        ((submitting.current = false), setPending(false));
      }
    }, [
      accountId,
      canSubmit,
      client,
      currentSession.id,
      editMessage,
      messageId,
      message,
      onSubmitted,
      prepareBrowserAction,
      queryClient,
      trpc.sessions.get,
      trpc.sessions.listPreviewItems,
      trpc.sessions.messageRows,
      trpc.sessions.turns,
    ]),
    send = (0, g.useCallback)(() => {
      submit();
    }, [submit]),
    onKeyDown = (0, g.useCallback)(
      event =>
        event.key !== 'Enter' || !hl(event) || event.shiftKey || event.altKey
          ? false
          : (event.preventDefault(), send(), true),
      [send],
    );
  return (0, a.jsxs)('div', {
    className: 'flex w-full flex-col gap-2',
    children: [
      (0, a.jsx)('div', {
        className: 'bg-surface-primary rounded-xl border px-2 py-1',
        'data-testid': 'message-editor',
        children: (0, a.jsxs)(He, {
          disabled: pending,
          initialSnapshot,
          onChange,
          children: [
            (0, a.jsx)(He.SkillMentions, {value: skillMention}),
            (0, a.jsx)(He.Keymap, {onKeyDown}),
            (0, a.jsx)(He.SubmitOnEnter, {canSubmit, onSubmit: send}),
            (0, a.jsx)(He.Editor, {
              className: 'max-h-80 min-h-20 overflow-y-auto px-1 py-1',
              placeholder: 'Edit message',
            }),
          ],
        }),
      }),
      (0, a.jsxs)('div', {
        className: 'flex flex-row justify-end gap-1',
        children: [
          (0, a.jsx)(J, {disabled: pending, onClick: onCancel, variant: 'secondary', size: 'sm', children: 'Cancel'}),
          (0, a.jsx)(J, {
            'data-testid': 'message-editor-send-button',
            disabled: !currentSession.id || pending || !canSubmit,
            onClick: send,
            size: 'sm',
            children: pending ? (0, a.jsx)(kt, {}) : 'Send',
          }),
        ],
      }),
    ],
  });
}
