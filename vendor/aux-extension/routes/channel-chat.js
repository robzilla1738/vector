/* Aux-owned source: the Channels chat page (assets/route-VV0zL3cm.js, the module body, exported as component):
 * the channel rail with unread counts, the add/edit dialog and archive; the feed built from a
 * versioned socket (snapshots, cursor-checked events, a resync on a gap, reconnecting with backoff,
 * revoked access), the unread line and read marks, optimistic sends with retry, reactions, older
 * pages, typing and presence; and the task side panel.
 * Names the rest of the chunk uses keep their chunk names: Je the page (exported).
 * Chunk names used: W/G React, X JSX runtime, L cn, Y useNavigate, Z useParams, Q the account token,
 * z the channel chat origin, ne its transport, ae archive icon, ee/se/te/H/re context menu parts,
 * ie plus icon, oe icon and color picker, de Input, O useMutation, V useQuery, J useQueryClient,
 * ce Skeleton, le the Connect client, me the channel icon, A the Main channel, ue Composer,
 * fe TaskCard, ge/pe the session providers, he pending request link, ve Conversation, xe the chat
 * context, ye pencil, P Button, B toast, ke/Ce/be/je dialog parts, _e DocumentTitle. */
var React = W(G(), 1),
  jsxRuntime = X();
/** The channel rail, with its add/edit dialog. */
function ChannelRail({channels, unreadCounts = {}, selected, onSelect, onSave, onArchive}) {
  const [editing, setEditing] = (0, React.useState)(),
    [saving, setSaving] = (0, React.useState)(false),
    [archiving, setArchiving] = (0, React.useState)(false),
    archive = async channel => {
      setArchiving(true);
      try {
        (await onArchive(channel.id), channel.id === selected && onSelect(A.id), B.success(`Archived ${channel.name}`));
      } catch (error) {
        B.error(error instanceof Error ? error.message : 'Could not archive channel');
      } finally {
        setArchiving(false);
      }
    };
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsxs)('nav', {
        'aria-label': 'Channels',
        className:
          'bg-secondary/50 border-border flex min-h-0 w-52 shrink-0 flex-col border-r px-2 py-3 select-none max-md:hidden',
        children: [
          (0, jsxRuntime.jsxs)('div', {
            className: 'text-muted-foreground mb-1 flex h-7 shrink-0 items-center justify-between pr-1 pl-2',
            children: [
              (0, jsxRuntime.jsx)('h2', {className: 'text-xs font-medium', children: 'Channels'}),
              (0, jsxRuntime.jsx)(P, {
                variant: 'ghost',
                size: 'icon-xs',
                'aria-label': 'Add channel',
                onClick: () => setEditing({...A, id: crypto.randomUUID(), name: ''}),
                children: (0, jsxRuntime.jsx)(ie, {className: 'size-3.5'}),
              }),
            ],
          }),
          (0, jsxRuntime.jsx)('div', {
            className: 'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto',
            children: [...channels]
              .sort((first, second) =>
                first.isMain || first.id === 'main' ? -1 : second.isMain || second.id === 'main' ? 1 : 0,
              )
              .map(channel => {
                const isSelected = channel.id === selected,
                  unread = unreadCounts[channel.id] ?? 0;
                return (0, jsxRuntime.jsxs)(
                  ee,
                  {
                    children: [
                      (0, jsxRuntime.jsx)(re, {
                        render: (0, jsxRuntime.jsx)('div', {className: 'shrink-0'}),
                        children: (0, jsxRuntime.jsxs)(P, {
                          variant: 'ghost',
                          className: L(
                            'h-7 w-full min-w-0 justify-start gap-2 rounded-md px-2 text-[13px] font-normal transition-none',
                            isSelected
                              ? 'bg-accent text-foreground'
                              : unread
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                          ),
                          'aria-label': `${channel.name}${unread ? `, ${unread} unread messages` : ''}`,
                          'aria-current': isSelected ? 'page' : void 0,
                          onClick: () => onSelect(channel.id),
                          children: [
                            (0, jsxRuntime.jsx)(me, {
                              name: channel.icon,
                              color: channel.color,
                              className: 'size-3.5 shrink-0',
                            }),
                            (0, jsxRuntime.jsx)('span', {
                              className: L('min-w-0 truncate', unread && 'font-semibold'),
                              children: channel.name,
                            }),
                            unread > 0 &&
                              (0, jsxRuntime.jsx)('span', {
                                'aria-hidden': 'true',
                                className:
                                  'text-foreground ml-auto min-w-4 shrink-0 rounded-full bg-current/10 px-1 text-center text-[10px] leading-4 font-semibold tabular-nums',
                                children: unread > 99 ? '99+' : unread,
                              }),
                          ],
                        }),
                      }),
                      (0, jsxRuntime.jsx)(se, {
                        children: (0, jsxRuntime.jsxs)(te, {
                          children: [
                            (0, jsxRuntime.jsxs)(H, {
                              disabled: archiving,
                              onClick: () => setEditing(channel),
                              children: [(0, jsxRuntime.jsx)(ye, {className: 'size-4'}), 'Edit'],
                            }),
                            (0, jsxRuntime.jsxs)(H, {
                              disabled: archiving || channel.isMain || channel.id === A.id,
                              onClick: () => {
                                archive(channel);
                              },
                              children: [(0, jsxRuntime.jsx)(ae, {className: 'size-4'}), 'Archive'],
                            }),
                          ],
                        }),
                      }),
                    ],
                  },
                  channel.id,
                );
              }),
          }),
        ],
      }),
      (0, jsxRuntime.jsx)(ke, {
        open: !!editing,
        onOpenChange: open => {
          !open && !saving && setEditing(void 0);
        },
        children: (0, jsxRuntime.jsxs)(Ce, {
          className: 'sm:max-w-sm',
          children: [
            (0, jsxRuntime.jsx)(be, {
              children: (0, jsxRuntime.jsx)(je, {
                children: channels.some(event => event.id === editing?.id) ? 'Edit channel' : 'New channel',
              }),
            }),
            editing &&
              (0, jsxRuntime.jsxs)('form', {
                className: 'space-y-4',
                onSubmit: async icon => {
                  if ((icon.preventDefault(), !(!editing.name.trim() || saving))) {
                    setSaving(true);
                    try {
                      (await onSave({...editing, name: editing.name.trim()}), onSelect(editing.id), setEditing(void 0));
                    } catch (error) {
                      B.error(error instanceof Error ? error.message : 'Could not save channel');
                    } finally {
                      setSaving(false);
                    }
                  }
                },
                children: [
                  (0, jsxRuntime.jsxs)('div', {
                    className: 'flex items-center gap-3',
                    children: [
                      (0, jsxRuntime.jsx)(oe, {
                        icon: editing.icon,
                        color: editing.color,
                        onIconChange: color => setEditing({...editing, icon: color}),
                        onColorChange: event => setEditing({...editing, color: event}),
                      }),
                      (0, jsxRuntime.jsx)(de, {
                        autoFocus: true,
                        'aria-label': 'Channel name',
                        placeholder: 'Channel name',
                        maxLength: 100,
                        value: editing.name,
                        disabled: editing.isMain || editing.id === 'main' || saving,
                        onChange: event => setEditing({...editing, name: event.target.value}),
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsxs)('label', {
                    className: 'text-muted-foreground block text-sm',
                    children: [
                      'Channel instructions',
                      (0, jsxRuntime.jsx)('textarea', {
                        'aria-label': 'Channel instructions',
                        value: editing.instructions,
                        onChange: other => setEditing({...editing, instructions: other.target.value}),
                        className:
                          'border-border text-foreground mt-2 min-h-24 w-full rounded-lg border bg-transparent p-3',
                      }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)(P, {
                    type: 'submit',
                    disabled: !editing.name.trim() || saving,
                    className: 'w-full',
                    children: saving ? 'Saving…' : 'Save channel',
                  }),
                ],
              }),
          ],
        }),
      }),
    ],
  });
}
/** The feed's rows: the stored messages, kept to the latest attempt of each response, then the live streams. */
function feedMessages(stored, streaming, viewerId) {
  const byId = new Map(stored.map(message => [message.id, message])),
    latestByResponse = new Map();
  for (const message of [...stored].sort((first, second) => first.sequence - second.sequence))
    message.response_id &&
      (message.stream_state === 'streaming' || message.stream_state === 'interrupted') &&
      latestByResponse.set(message.response_id, message.id);
  for (const message of Object.values(streaming).sort((first, second) => first.timestamp - second.timestamp))
    latestByResponse.set(message.responseId, message.id);
  const finished = new Set(
      stored
        .filter(
          message =>
            message.stream_state === 'complete' &&
            message.message.role === 'published-message' &&
            message.message.kind !== 'progress',
        )
        .map(message => message.response_id)
        .filter(Boolean),
    ),
    rows = [...byId.values()]
      .sort((message, first) => message.sequence - first.sequence)
      .flatMap(message => {
        const body = message.message;
        if (message.stream_state !== 'complete' && finished.has(message.response_id)) return [];
        if (
          message.stream_state === 'interrupted' &&
          stored.some(reply => reply.reply_to === message.id && reply.message.role === 'user')
        )
          return [];
        if (
          (message.stream_state === 'streaming' || message.stream_state === 'interrupted') &&
          message.response_id &&
          latestByResponse.get(message.response_id) !== message.id
        )
          return [];
        const live = message.stream_state === 'streaming' ? streaming[message.id] : void 0;
        return body.role !== 'user' && body.role !== 'published-message'
          ? []
          : [
              {
                id: message.id,
                isOwn: body.role === 'user' && (!message.author_user_id || message.author_user_id === viewerId),
                authorLabel:
                  body.role === 'user' && message.author_user_id && message.author_user_id !== viewerId
                    ? `Member ${message.author_user_id.slice(0, 8)}`
                    : void 0,
                isStreaming: message.stream_state === 'streaming',
                isInterrupted: message.stream_state === 'interrupted',
                message:
                  body.role === 'user'
                    ? body
                    : {
                        role: 'assistant',
                        content:
                          message.stream_state === 'interrupted'
                            ? ''
                            : (live?.content ?? body.presentation?.widget?.prompt ?? body.content),
                        timestamp: body.timestamp,
                      },
                presentation: body.role === 'published-message' ? body.presentation : void 0,
                attachments: body.role === 'user' ? body.metadata?.attachments : void 0,
                replyTo: message.reply_to ?? void 0,
                reaction: message.reactions[0],
                ...(body.role === 'user'
                  ? {delivery: message.agent_read_at ? 'read' : 'sent', readAt: message.agent_read_at ?? void 0}
                  : {}),
              },
            ];
      });
  for (const live of Object.values(streaming))
    byId.has(live.id) ||
      finished.has(live.responseId) ||
      latestByResponse.get(live.responseId) !== live.id ||
      rows.push({
        id: live.id,
        isStreaming: true,
        message: {role: 'assistant', content: live.content, timestamp: live.timestamp},
      });
  return rows;
}
/** Whether a message came from someone else. */
function isIncoming(message, viewerId) {
  return (
    message.message.role === 'published-message' ||
    (message.message.role === 'user' && !!message.author_user_id && message.author_user_id !== viewerId)
  );
}
/** Where the unread line sits; it stays while the channel is read. */
function unreadMarker(current, channelId, readSequence, messages, viewerId, reading) {
  const switched = current?.channelId !== channelId,
    sequence = Math.max(readSequence, messages.at(-1)?.sequence ?? 0);
  return !switched && (current.markerId || sequence <= current.sequence)
    ? current
    : {
        channelId,
        sequence,
        markerId:
          switched || !reading
            ? messages.find(
                message =>
                  message.sequence > Math.max(readSequence, switched ? 0 : current.sequence) &&
                  isIncoming(message, viewerId),
              )?.id
            : void 0,
      };
}
var /** Read state: the unread line, read marks and every channel's unread count. */
  useChannelReads = (accountId, channelId, messages, viewerId, request) => {
    const queryClient = J(),
      queryKey = ['channel-chat', accountId, 'read-state'],
      readStates = V({
        queryKey,
        queryFn: () => request('/channels/read-state'),
        refetchInterval: 5e3,
        refetchOnWindowFocus: 'always',
      }),
      readState = readStates.data?.find(state => state.channel_id === channelId),
      [reading, setReading] = (0, React.useState)(() => document.visibilityState === 'visible' && document.hasFocus()),
      [marker, setMarker] = (0, React.useState)(),
      lastSequence = messages.at(-1)?.sequence ?? readState?.read_sequence ?? 0;
    if (channelId && readState) {
      const nextMarker = unreadMarker(marker, channelId, readState.read_sequence, messages, viewerId, reading);
      nextMarker !== marker && setMarker(nextMarker);
    }
    const pendingReads = (0, React.useRef)(new Set()),
      markRead = (0, React.useCallback)(
        messageId => {
          const message = messages.find(candidate => candidate.id === messageId);
          if (!channelId || !readState || !message || message.sequence <= readState.read_sequence) return;
          const sequence = message.sequence;
          pendingReads.current.has(sequence) ||
            (pendingReads.current.add(sequence),
            request(`/channels/${encodeURIComponent(channelId)}/read`, {sequence})
              .then(saved => {
                queryClient.setQueryData(queryKey, states =>
                  states?.map(state =>
                    state.channel_id === channelId && state.read_sequence < saved.read_sequence
                      ? {
                          ...state,
                          ...saved,
                          unread_count: messages.filter(
                            row => row.sequence > saved.read_sequence && isIncoming(row, viewerId),
                          ).length,
                        }
                      : state,
                  ),
                );
              })
              .catch(() => {})
              .finally(() => pendingReads.current.delete(sequence)));
        },
        [channelId, readState, messages, viewerId, request, queryClient, accountId],
      ),
      dismissUnread = (0, React.useCallback)(() => {
        if (!channelId) return;
        (setReading(document.visibilityState === 'visible' && document.hasFocus()),
          setMarker({channelId, sequence: lastSequence}));
        const last = messages.at(-1);
        last && markRead(last.id);
      }, [channelId, lastSequence, messages, markRead]);
    return {
      firstUnreadId: marker?.channelId === channelId ? marker?.markerId : void 0,
      setReading,
      dismissUnread,
      markRead,
      unreadCounts: Object.fromEntries(readStates.data?.map(state => [state.channel_id, state.unread_count]) ?? []),
    };
  };
/** A list with an item replaced, added or (when deleted) removed. */
function upsertById(items, item) {
  return item.deleted
    ? items.filter(other => other.id !== item.id)
    : [...items.filter(other => other.id !== item.id), item];
}
/** A snapshot with one event applied. */
function applyChannelEvent(snapshot, event) {
  const next = {...snapshot, cursor: event.cursor};
  switch (event.type) {
    case 'channel.updated':
      next.channel = event.data;
      break;
    case 'reaction.updated':
      next.reactions = [
        ...snapshot.reactions.filter(
          item =>
            !(
              item.message_id === event.data.message_id &&
              item.user_id === event.data.user_id &&
              item.emoji === event.data.emoji
            ),
        ),
        ...(event.data.deleted ? [] : [event.data]),
      ];
      break;
    case 'message.updated':
      next.messages = upsertById(snapshot.messages, event.data).sort(
        (first, second) => first.sequence - second.sequence,
      );
      break;
    case 'task.updated':
      next.tasks = upsertById(snapshot.tasks, {
        ...event.data,
        preview: snapshot.tasks.find(item => item.id === event.data.id)?.preview,
      });
      break;
    case 'command.updated':
      next.commands = upsertById(snapshot.commands, event.data).filter(item => item.status !== 'delivered');
      break;
    case 'response.updated':
      next.responses = upsertById(snapshot.responses, event.data);
      break;
    case 'member.updated':
      next.members = [
        ...snapshot.members.filter(item => item.user_id !== event.data.user_id),
        ...(event.data.deleted ? [] : [event.data]),
      ];
  }
  return next;
}
/** The channel's socket and what it has said. */
function useChannelSocket(accountId, channelId) {
  const [snapshot, setSnapshot] = (0, React.useState)(),
    [streaming, setStreaming] = (0, React.useState)({}),
    [readReceipts, setReadReceipts] = (0, React.useState)({}),
    [failedInputs, setFailedInputs] = (0, React.useState)([]),
    [viewerId, setViewerId] = (0, React.useState)(''),
    [error, setError] = (0, React.useState)(),
    [connected, setConnected] = (0, React.useState)(false),
    [presence, setPresence] = (0, React.useState)([]),
    [typers, setTypers] = (0, React.useState)({}),
    socketRef = (0, React.useRef)(void 0),
    cursor = (0, React.useRef)('0'),
    nextBefore = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      (setReadReceipts({}), setFailedInputs([]));
      let closed = false,
        attempts = 0,
        retryTimer;
      const connect = async () => {
        try {
          const token = await Q(accountId);
          if (closed) return;
          const url = new URL(`${z}/channel-chat/channels/${encodeURIComponent(channelId)}/ws`);
          url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
          const socket = new WebSocket(url, ['aux-channel-v2', `bearer.${token}`]);
          ((socketRef.current = socket),
            (socket.onmessage = event => {
              if (closed || socketRef.current !== socket) return;
              const frame = JSON.parse(event.data);
              if (frame.version !== 2) {
                socket.close(1002, 'Unsupported protocol');
                return;
              }
              switch (frame.type) {
                case 'snapshot':
                  ((cursor.current = frame.snapshot.cursor),
                    (nextBefore.current =
                      frame.snapshot.messages.length === 60 ? frame.snapshot.messages[0].sequence : null),
                    setSnapshot(frame.snapshot),
                    setStreaming(Object.fromEntries(frame.streaming.map(item => [item.id, item]))),
                    setViewerId(frame.viewerId),
                    setError(void 0));
                  break;
                case 'event':
                  if (BigInt(frame.event.cursor) <= BigInt(cursor.current)) break;
                  if (BigInt(frame.event.cursor) !== BigInt(cursor.current) + 1n) {
                    socket.send(JSON.stringify({type: 'resync'}));
                    break;
                  }
                  if (
                    ((cursor.current = frame.event.cursor),
                    setSnapshot(current => current && applyChannelEvent(current, frame.event)),
                    frame.event.type === 'message.updated' && !frame.event.data.deleted)
                  ) {
                    const id = frame.event.data.id;
                    setFailedInputs(failed => (failed.includes(id) ? failed.filter(other => other !== id) : failed));
                  }
                  if (
                    frame.event.type === 'message.updated' &&
                    (frame.event.data.deleted || frame.event.data.stream_state !== 'streaming')
                  ) {
                    const id = frame.event.data.id;
                    setStreaming(current => {
                      const rest = {...current};
                      return (delete rest[id], rest);
                    });
                  }
                  break;
                case 'model.read':
                  (setReadReceipts(current => ({
                    ...current,
                    ...Object.fromEntries(frame.ids.map(id => [id, frame.at])),
                  })),
                    setSnapshot(
                      current =>
                        current && {
                          ...current,
                          responses: [
                            ...current.responses,
                            ...frame.ids
                              .filter(id => !current.responses.some(response => response.id === id))
                              .map(id => ({id, status: 'preparing'})),
                          ],
                        },
                    ));
                  break;
                case 'input.failed':
                  setFailedInputs(current => [...current, frame.id]);
                  break;
                case 'task.preview':
                  setSnapshot(
                    current =>
                      current && {
                        ...current,
                        tasks: current.tasks.map(task =>
                          task.id === frame.preview.id ? {...task, preview: frame.preview} : task,
                        ),
                      },
                  );
                  break;
                case 'streaming':
                  setStreaming(current => {
                    const existing = current[frame.streaming.id];
                    return existing &&
                      existing.attemptId === frame.streaming.attemptId &&
                      existing.revision >= frame.streaming.revision
                      ? current
                      : {...current, [frame.streaming.id]: frame.streaming};
                  });
                  break;
                case 'streaming.removed':
                  setStreaming(current => {
                    const rest = {...current};
                    return (delete rest[frame.id], rest);
                  });
                  break;
                case 'ready':
                  ((attempts = 0), setConnected(true));
                  break;
                case 'presence':
                  setPresence(frame.userIds);
                  break;
                case 'typing':
                  setTypers(current => ({...current, [frame.userId]: frame.active ? frame.expiresAt : 0}));
              }
            }),
            (socket.onclose = event => {
              if (!(closed || socketRef.current !== socket)) {
                if ((setConnected(false), event.code === 1008)) {
                  (setError(new Error('Channel access was revoked.')), setSnapshot(void 0), setStreaming({}));
                  return;
                }
                (setError(new Error('Reconnecting to channel…')),
                  (retryTimer = setTimeout(connect, Math.min(1e3 * 2 ** attempts++, 1e4))));
              }
            }),
            (socket.onerror = () => socket.close()));
        } catch (error) {
          if (closed) return;
          (setError(error instanceof Error ? error : new Error('Unable to connect')),
            (retryTimer = setTimeout(connect, Math.min(1e3 * 2 ** attempts++, 1e4))));
        }
      };
      return (
        connect(),
        () => {
          ((closed = true), clearTimeout(retryTimer), socketRef.current?.close());
        }
      );
    }, [accountId, channelId]),
    (0, React.useEffect)(() => {
      const nextExpiry = Math.min(...Object.values(typers).filter(expiresAt => expiresAt > Date.now()));
      if (!Number.isFinite(nextExpiry)) return;
      const timer = setTimeout(
        () =>
          setTypers(current =>
            Object.fromEntries(Object.entries(current).filter(([, expiresAt]) => expiresAt > Date.now())),
          ),
        Math.max(0, nextExpiry - Date.now()),
      );
      return () => clearTimeout(timer);
    }, [typers]),
    {
      readReceipts,
      failedInputs,
      snapshot,
      streaming,
      viewerId,
      error,
      connected,
      presence,
      typers,
      nextBefore,
      appendHistory: older =>
        setSnapshot(
          current =>
            current && {
              ...current,
              messages: [
                ...older,
                ...current.messages.filter(message => !older.some(older => older.id === message.id)),
              ],
            },
        ),
      typing: active => {
        socketRef.current?.readyState === WebSocket.OPEN &&
          socketRef.current.send(JSON.stringify({type: 'typing', active}));
      },
    }
  );
}
/** Everything the page needs: the feed, the API and the sends. */
function useChannelChat(accountId, channelId) {
  const queryClient = J(),
    socket = useChannelSocket(accountId, channelId),
    [loadingOlder, setLoadingOlder] = (0, React.useState)(false),
    queryKey = (0, React.useMemo)(() => ['channel-chat', accountId], [accountId]),
    [pending, setPending] = (0, React.useState)([]),
    api = (0, React.useMemo)(() => {
      const authedFetch = async (url, init) => {
        const response = await fetch(url, {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...init?.headers,
            authorization: `Bearer ${await Q(accountId)}`,
          },
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${response.status})`);
        }
        return response;
      };
      return {
        request: async (path, body, method = 'PUT') => {
          const response = await authedFetch(
            `${z}/channel-chat${path}`,
            body ? {method, body: JSON.stringify(body)} : void 0,
          );
          return response.status === 204 ? void 0 : response.json();
        },
        client: rootSessionId =>
          le({links: [ne({host: {kind: 'cloud', rootSessionId}, apiBaseUrl: z, fetchApi: authedFetch})]}),
      };
    }, [accountId]),
    channels = V({queryKey: [...queryKey, 'channels'], queryFn: () => api.request('/channels')}),
    refreshChannels = () => queryClient.invalidateQueries({queryKey: [...queryKey, 'channels']}),
    feed = {
      error: socket.error,
      isPending: !socket.snapshot && !socket.error,
      isFetchingNextPage: loadingOlder,
      hasNextPage: socket.nextBefore.current !== null,
      fetchNextPage: async () => {
        if (socket.nextBefore.current !== null) {
          setLoadingOlder(true);
          try {
            const page = await api.request(
              `/channels/${encodeURIComponent(channelId)}?before=${socket.nextBefore.current}`,
            );
            ((socket.nextBefore.current = page.nextBefore), socket.appendHistory(page.messages));
          } finally {
            setLoadingOlder(false);
          }
        }
      },
    },
    warm = () => {
      queryClient
        .fetchQuery({
          queryKey: [...queryKey, channelId, 'warm'],
          queryFn: () => api.request(`/channels/${encodeURIComponent(channelId)}/warm`, {}, 'POST'),
          staleTime: 6e4,
          retry: false,
        })
        .catch(() => {});
    },
    saveChannel = O({
      mutationFn: channel => api.request(`/channels/${encodeURIComponent(channel.id)}`, channel),
      onSuccess: refreshChannels,
    }),
    archiveChannel = O({
      mutationFn: id => api.request(`/channels/${encodeURIComponent(id)}`, {archived: true}, 'PATCH'),
      onSuccess: refreshChannels,
    }),
    deliver = async input => {
      (reads.dismissUnread(),
        setPending(current => [...current.filter(item => item.id !== input.id), {...input, delivery: 'sending'}]));
      try {
        return (
          await api.request(
            `/channels/${encodeURIComponent(channelId)}/messages`,
            {id: input.id, text: input.message.content, replyTo: input.replyTo, attachments: input.attachments},
            'POST',
          ),
          setPending(current => current.map(item => (item.id === input.id ? {...item, delivery: 'sent'} : item))),
          true
        );
      } catch {
        return (
          setPending(current => current.map(item => (item.id === input.id ? {...item, delivery: 'failed'} : item))),
          false
        );
      }
    },
    messages = (0, React.useMemo)(
      () =>
        (socket.snapshot?.messages ?? []).map(message =>
          socket.readReceipts[message.id] && !message.agent_read_at
            ? {...message, agent_read_at: socket.readReceipts[message.id]}
            : message,
        ),
      [socket.snapshot?.messages, socket.readReceipts],
    ),
    reads = useChannelReads(accountId, socket.snapshot?.channel.id, messages, socket.viewerId, api.request);
  (0, React.useEffect)(() => {
    const storedIds = new Set(socket.snapshot?.messages.map(current => current.id));
    setPending(current =>
      current.some(item => storedIds.has(item.id)) ? current.filter(item => !storedIds.has(item.id)) : current,
    );
  }, [socket.snapshot?.messages]);
  const storedById = new Map(messages.map(message => [message.id, message])),
    rows = feedMessages(messages, socket.streaming, socket.viewerId);
  rows.push(
    ...pending
      .filter(item => !storedById.has(item.id))
      .map(item =>
        socket.failedInputs.includes(item.id)
          ? {...item, delivery: 'failed'}
          : socket.readReceipts[item.id]
            ? {...item, delivery: 'read', readAt: socket.readReceipts[item.id]}
            : item,
      ),
  );
  const react = O({
      mutationFn: ({id, emoji}) =>
        api.request(`/channels/${encodeURIComponent(channelId)}/messages/${encodeURIComponent(id)}/reactions`, {
          emoji,
          selected: !socket.snapshot?.reactions.some(
            reaction => reaction.message_id === id && reaction.user_id === socket.viewerId && reaction.emoji === emoji,
          ),
        }),
      onSuccess: refreshChannels,
    }),
    retryCommand = O({
      mutationFn: id =>
        api.request(`/channels/${encodeURIComponent(channelId)}/retry/${encodeURIComponent(id)}`, {}, 'POST'),
      onSuccess: refreshChannels,
    });
  return {
    ...reads,
    channels,
    feed,
    messages: rows,
    saveChannel,
    archiveChannel,
    react,
    retryCommand,
    api,
    tasks: socket.snapshot?.tasks ?? [],
    commands: socket.snapshot?.commands ?? [],
    channel: socket.snapshot?.channel,
    connected: socket.connected,
    isOwner:
      socket.snapshot?.members.some(member => member.user_id === socket.viewerId && member.role === 'owner') ?? false,
    online: socket.presence.length,
    humanTypers: Object.entries(socket.typers)
      .filter(([entry, expiresAt]) => entry !== socket.viewerId && expiresAt > Date.now())
      .map(([entry]) => `Member ${entry.slice(0, 8)}`),
    warm,
    setTyping: socket.typing,
    typing:
      socket.snapshot?.responses.some(
        response =>
          ['queued', 'preparing'].includes(response.status) &&
          !!(storedById.get(response.id)?.agent_read_at || socket.readReceipts[response.id]) &&
          !Object.values(socket.streaming).some(item => item.responseId === response.id),
      ) ?? false,
    send: (text, replyTo, attachments, sendOrigin) =>
      deliver({
        id: crypto.randomUUID(),
        message: {role: 'user', content: text, timestamp: Date.now()},
        replyTo,
        attachments,
        sendOrigin,
      }),
    retry: id => {
      const input = pending.find(item => item.id === id);
      input
        ? deliver(input)
        : rows.some(item => item.id === id && item.isInterrupted) &&
          deliver({
            id: crypto.randomUUID(),
            message: {role: 'user', content: 'Please finish your previous reply.', timestamp: Date.now()},
            replyTo: id,
          });
    },
  };
}
/** The route: one page per account and channel. */
function ChannelChatRoute() {
  const {userId, channelId} = Z({from: '/_web/(profile)/u/$userId/experimental/v2/channels/$channelId'});
  return (0, jsxRuntime.jsx)(ChannelChatPage, {accountId: Number(userId), channelId}, `${userId}:${channelId}`);
}
/** The page. */
function ChannelChatPage({accountId, channelId}) {
  const chat = useChannelChat(accountId, channelId),
    navigate = Y(),
    [replyTo, setReplyTo] = (0, React.useState)(),
    [tasksOpen, setTasksOpen] = (0, React.useState)(() => window.matchMedia('(min-width: 768px)').matches),
    channels = chat.channels.data ?? [A],
    title = chat.channel?.name ?? channels.find(channel => channel.id === channelId)?.name ?? 'Chat',
    sessionClient = (0, React.useMemo)(
      () => chat.api.client(chat.channel?.cloudSessionId ?? ''),
      [chat.api, chat.channel?.cloudSessionId],
    ),
    showError = error => B.error(error.message),
    rows = chat.typing
      ? [
          ...chat.messages,
          {
            id: 'orchestrator-typing',
            message: {role: 'assistant', content: '', timestamp: Date.now()},
            isStreaming: true,
          },
        ]
      : chat.messages,
    page = (0, jsxRuntime.jsx)(xe, {
      value: {accountId, tasks: chat.tasks, canOpen: chat.isOwner},
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'bg-background text-foreground relative flex h-full min-h-0',
        children: [
          (0, jsxRuntime.jsx)(_e, {title: `${title} · Aux`}),
          (0, jsxRuntime.jsx)(ChannelRail, {
            channels,
            unreadCounts: chat.unreadCounts,
            selected: chat.channel?.id ?? channelId,
            onSelect: id => {
              navigate({
                to: '/u/$userId/experimental/v2/channels/$channelId',
                params: {userId: String(accountId), channelId: id},
              });
            },
            onSave: async channel => {
              await chat.saveChannel.mutateAsync(channel);
            },
            onArchive: async id => {
              await chat.archiveChannel.mutateAsync(id);
            },
          }),
          (0, jsxRuntime.jsxs)('main', {
            className: 'flex min-h-0 min-w-0 flex-1 flex-col',
            children: [
              (0, jsxRuntime.jsxs)('header', {
                className: 'flex shrink-0 items-center justify-between px-6 py-4 select-none',
                children: [
                  (0, jsxRuntime.jsxs)('h1', {
                    className: 'font-medium max-md:hidden',
                    children: [
                      title,
                      chat.online > 1 &&
                        (0, jsxRuntime.jsxs)('span', {
                          className: 'text-muted-foreground ml-2 text-xs font-normal',
                          children: [chat.online, ' online'],
                        }),
                    ],
                  }),
                  (0, jsxRuntime.jsx)('select', {
                    'aria-label': 'Channel',
                    value: chat.channel?.id ?? channelId,
                    className: 'bg-background max-w-48 rounded px-2 py-1 font-medium md:hidden',
                    onChange: event => {
                      navigate({
                        to: '/u/$userId/experimental/v2/channels/$channelId',
                        params: {userId: String(accountId), channelId: event.target.value},
                      });
                    },
                    children: channels.map(channel =>
                      (0, jsxRuntime.jsx)('option', {value: channel.id, children: channel.name}, channel.id),
                    ),
                  }),
                  (0, jsxRuntime.jsx)(he, {}),
                  (0, jsxRuntime.jsx)(P, {
                    variant: 'ghost',
                    size: 'sm',
                    onClick: () => setTasksOpen(open => !open),
                    children: chat.feed.isPending ? 'Tasks' : `Tasks · ${chat.tasks.length}`,
                  }),
                ],
              }),
              chat.feed.error &&
                (0, jsxRuntime.jsx)('p', {
                  role: 'alert',
                  className: 'text-destructive px-6 py-2 text-sm',
                  children: chat.feed.error.message,
                }),
              chat.commands
                .filter(command => command.error)
                .map(command =>
                  (0, jsxRuntime.jsxs)(
                    'div',
                    {
                      role: 'alert',
                      className: 'text-destructive flex items-center gap-2 px-6 py-2 text-sm',
                      children: [
                        (0, jsxRuntime.jsx)('span', {children: command.error}),
                        (0, jsxRuntime.jsx)(P, {
                          size: 'xs',
                          variant: 'ghost',
                          disabled: chat.retryCommand.isPending,
                          onClick: () => chat.retryCommand.mutate(command.id, {onError: showError}),
                          children: 'Retry',
                        }),
                      ],
                    },
                    command.id,
                  ),
                ),
              (0, jsxRuntime.jsx)(ve, {
                messages: rows,
                loading: chat.feed.isPending,
                firstUnreadId: chat.firstUnreadId,
                onRead: chat.markRead,
                onReadingChange: chat.setReading,
                allMessages: chat.messages,
                typing: chat.typing,
                history: chat.feed.hasNextPage
                  ? (0, jsxRuntime.jsx)(P, {
                      variant: 'ghost',
                      disabled: chat.feed.isFetchingNextPage,
                      onClick: () => {
                        chat.feed.fetchNextPage();
                      },
                      children: 'Load older messages',
                    })
                  : void 0,
                onReact: (id, emoji) => chat.react.mutate({id, emoji}, {onError: showError}),
                onReply: setReplyTo,
                onRetry: chat.retry,
                onAnswer: (id, text) => chat.send(text, id),
                onJump: id =>
                  document.getElementById(`chat-${id}`)?.scrollIntoView({block: 'center', behavior: 'smooth'}),
              }),
              (0, jsxRuntime.jsxs)('div', {
                className: 'mx-auto w-full max-w-3xl shrink-0 px-4 pt-2 pb-5',
                children: [
                  !!chat.humanTypers.length &&
                    (0, jsxRuntime.jsxs)('p', {
                      role: 'status',
                      className: 'text-muted-foreground pb-2 text-xs select-none',
                      children: [chat.humanTypers.join(', '), ' typing…'],
                    }),
                  (0, jsxRuntime.jsx)(ue, {
                    onActivate: chat.warm,
                    draftKey: `aux:channel-draft:v2:${accountId}:${channelId}`,
                    onTyping: chat.setTyping,
                    replyTo,
                    onCancelReply: () => setReplyTo(void 0),
                    onSubmit: async (text, attachments, sendOrigin) => {
                      const sent = await chat.send(text, replyTo?.id, attachments, sendOrigin);
                      return (sent && setReplyTo(void 0), sent);
                    },
                  }),
                ],
              }),
            ],
          }),
          tasksOpen &&
            (0, jsxRuntime.jsxs)('aside', {
              'aria-label': 'Channel tasks',
              className:
                'border-border bg-background flex w-72 shrink-0 flex-col overflow-y-auto border-l p-4 max-lg:w-56 max-md:absolute max-md:inset-y-16 max-md:right-0 max-md:z-20 max-md:w-72 max-md:shadow-xl',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'mb-3 flex items-center justify-between',
                  children: [
                    (0, jsxRuntime.jsx)('h2', {className: 'text-sm font-medium select-none', children: 'Tasks'}),
                    (0, jsxRuntime.jsx)(P, {
                      variant: 'ghost',
                      size: 'xs',
                      onClick: () => setTasksOpen(false),
                      children: 'Close',
                    }),
                  ],
                }),
                chat.feed.isPending &&
                  (0, jsxRuntime.jsx)(ce, {
                    'aria-label': 'Loading tasks',
                    className: 'h-24 w-full motion-reduce:animate-none',
                  }),
                !chat.feed.isPending &&
                  !chat.tasks.length &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-muted-foreground text-sm select-none',
                    children: 'Tasks appear here when Aux starts working.',
                  }),
                chat.tasks.map(task =>
                  (0, jsxRuntime.jsxs)(
                    'div',
                    {
                      className: 'mb-3',
                      children: [
                        (0, jsxRuntime.jsx)(fe, {accountId, canOpen: chat.isOwner, task}),
                        chat.isOwner &&
                          task.environment.type === 'cloud' &&
                          ['pending', 'running', 'suspended'].includes(task.status) &&
                          (0, jsxRuntime.jsx)(CloudTaskProvider, {accountId, task, clientFactory: chat.api.client}),
                      ],
                    },
                    task.id,
                  ),
                ),
              ],
            }),
        ],
      }),
    });
  return chat.isOwner && chat.channel?.cloudSessionId
    ? (0, jsxRuntime.jsx)(
        ge,
        {accountId, sessionId: chat.channel.cloudSessionId, client: sessionClient, children: page},
        `${accountId}:${chat.channel.cloudSessionId}`,
      )
    : page;
}
/** A cloud task's session provider, with its own client. */
function CloudTaskProvider({accountId, task, clientFactory}) {
  const client = (0, React.useMemo)(() => clientFactory(task.id), [clientFactory, task.id]);
  return (0, jsxRuntime.jsx)(pe, {accountId, sessionId: task.id, suspended: task.status === 'suspended', client});
}
var Je = ChannelChatRoute;
