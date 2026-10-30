/* Aux-owned source, the chat preview card (assets/chat-preview-card-J0uel3r2.js, the module body): the
 * square card each task shows on the Tasks page and New Tab: its time, title and status, the live
 * tool calls while it runs, the question or approval it waits on, the last reply, and the
 * artifact, tab preview or file list it produced; plus its loading placeholder.
 * Names the rest of the chunk uses keep their chunk names (both exported): dt ChatPreviewCard,
 * mt ChatPreviewCardSkeleton; k React and t JSX runtime stay as named.
 * Chunk names used: F/L/B React and JSX runtime, h cn, S classify error, U isAuxCode, b useApp,
 * A Badge, G Shimmer, Q RelativeTime, W/H/X the file URLs, K/Z isArtifactPath and isOutputPath,
 * $ useIsVisible, C useMutation, j normalize path, V clean user text, w Skeleton, R useQuery,
 * J useQueryClient, Y session error, _ message text, I useTRPC, ee pin, te the routine icon,
 * se/P/ae the tool registry, re/ne/ie question, approval and action confirmation, oe the JSON
 * parser module, le/z/ce/ue the draft blocks, de/me the error alert, fe Markdown, pe the permission
 * block language, he the session context menu, T toast, ge/xe/ve the tooltip parts, we the
 * duration, je isSupportedSuspension, be the file list, Ne/ye tab preview and channel badge.
 * Aux change: the card's images, tab preview and placeholder take the card's 12px corner (rounded-xl). */
var k = F(L(), 1),
  PAGE_CURL_IMAGE = '/assets/page-curl-top-DUIHG5WL.png',
  t = B(),
  /** A document's thumbnail, as a page with a curled corner. */
  DocumentThumbnail = ({artifact, className, sessionId}) => {
    const {accountId} = b(),
      thumbnail = z(W(sessionId, artifact.path, 'thumbnail', accountId));
    return (0, t.jsxs)('div', {
      className: h('relative h-full w-full select-none', className),
      children: [
        (0, t.jsx)('div', {
          className: 'h-full w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]',
          children: (0, t.jsx)('img', {
            alt: '',
            className: 'h-full w-full bg-white object-contain',
            draggable: false,
            src: thumbnail,
            style: {clipPath: 'polygon(0 0, 82.5% 0, 100% 13%, 100% 100%, 0 100%)'},
            loading: 'lazy',
          }),
        }),
        (0, t.jsx)('img', {
          alt: '',
          'aria-hidden': true,
          className: 'top-hairline right-hairline pointer-events-none absolute w-[26%]',
          draggable: false,
          src: PAGE_CURL_IMAGE,
        }),
      ],
    });
  },
  /** An image artifact. */
  ImageThumbnail = ({artifact, className, sessionId}) => {
    const {accountId} = b(),
      source = z(imageSource(artifact, sessionId, accountId));
    return source
      ? (0, t.jsx)('img', {
          alt: '',
          className: h(
            'inset-ring-border-surface-strong h-full w-full rounded-xl object-cover shadow-[0_0_8px_1px_rgba(0,0,0,0.1)] inset-ring-[0.5px] select-none',
            className,
          ),
          draggable: false,
          src: source,
        })
      : null;
  };
/** Where an image artifact loads from. */
function imageSource(artifact, sessionId, accountId) {
  if (artifact.data && artifact.mimeType) return `data:${artifact.mimeType};base64,${artifact.data}`;
  if (!artifact.path) return;
  const url = X(artifact.path, sessionId, {accountId});
  if (url) return url;
  const path = localFilePath(artifact.path);
  return path ? H(sessionId, path, {accountId}) : artifact.path;
}
/** The local path a URL names, when it is one Aux serves. */
function localFilePath(url) {
  try {
    const parsed = new URL(url, 'http://localhost'),
      path = parsed.searchParams.get('path');
    if (path && parsed.pathname.includes('/files/content')) return j(path);
  } catch {
    return;
  }
  const normalized = j(url);
  return K(normalized) || Z(normalized) ? normalized : void 0;
}
/** A live preview of the session's tab. */
var TabPreview = ({className, targetId, title}) =>
    (0, t.jsxs)('div', {
      className: h(
        'bg-surface-primary border-glass relative aspect-1440/900 overflow-clip rounded-xl shadow-[0_0_8px_1px_rgba(0,0,0,0.1)]',
        className,
      ),
      children: [
        (0, t.jsx)(Ne, {className: 'mt-[0.5px] bg-transparent', targetId, title}),
        (0, t.jsx)('div', {
          className: 'pointer-events-none absolute inset-0',
          style: {
            background:
              'radial-gradient(80% 80% at 50% 10%, rgba(250, 250, 250, 0.15) 0%, rgba(250, 250, 250, 0.00) 100%)',
          },
        }),
      ],
    }),
  jsonParser = oe(),
  DOCUMENT_EXTENSIONS = new Set([
    'csv',
    'doc',
    'docx',
    'hwp',
    'hwpx',
    'key',
    'numbers',
    'odp',
    'ods',
    'odt',
    'pages',
    'pdf',
    'ppt',
    'pptx',
    'rtf',
    'tsv',
    'xls',
    'xlsm',
    'xlsx',
  ]),
  IMAGE_EXTENSIONS = new Set(['avif', 'bmp', 'gif', 'heic', 'heif', 'jpeg', 'jpg', 'png', 'svg', 'webp']),
  MARKDOWN_IMAGE = /!\[[^\]]*]\((?<url><[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
  CODE_BLOCK = /```(?<language>[^\s`]+)[^\n]*\n(?<code>[\s\S]*?)```/g;
/** What a session produced: changed files, images in its reply, draft blocks, inline images, and the one to show if there is one. */
function sessionArtifacts(session) {
  const artifacts = [],
    seen = new Set();
  for (const file of session.latestRun.filesChanged) {
    if (!file.artifact) continue;
    const path = j(file.path),
      key = artifactKey(path);
    seen.has(key) ||
      (seen.add(key),
      artifacts.push({kind: fileKind(path), path, sizeBytes: file.artifact.sizeBytes, source: 'filesChanged'}));
  }
  for (const message of session.latestRun.finalAssistantMessage ?? [])
    for (const block of message.content) {
      if (block.type === 'text') {
        for (const match of block.text.matchAll(MARKDOWN_IMAGE)) {
          const url = match.groups?.url,
            path = url?.startsWith('<') && url.endsWith('>') ? url.slice(1, -1) : url,
            key = path ? artifactKey(path) : void 0;
          path &&
            key &&
            !seen.has(key) &&
            (seen.add(key), artifacts.push({kind: 'image', path, source: 'markdownImage'}));
        }
        for (const match of block.text.matchAll(CODE_BLOCK)) {
          const language = match.groups?.language,
            code = match.groups?.code ?? '';
          if (!language || !isDraftLanguage(language)) continue;
          const data = parseDraftBlock(code);
          data && artifacts.push({kind: 'draft-block', language, data: le(data), source: 'draftBlock'});
        }
      }
      const image = block;
      image.type === 'image' &&
        image.mimeType &&
        image.data &&
        artifacts.push({data: image.data, kind: 'image', mimeType: image.mimeType, source: 'inlineImage'});
    }
  const previewable = artifacts.filter(
    artifact => artifact.kind === 'document' || artifact.kind === 'html' || artifact.kind === 'image',
  );
  return {
    artifacts,
    representativeArtifact: artifacts.length === 1 ? artifacts[0] : previewable.length === 1 ? previewable[0] : void 0,
  };
}
var HIDDEN_BLOCK_LANGUAGES = new Set(['imessage-permission', pe]);
/** A reply without the draft and permission blocks it carries. */
function withoutArtifactBlocks(text) {
  return text
    .replace(CODE_BLOCK, (block, language) =>
      isDraftLanguage(language) || HIDDEN_BLOCK_LANGUAGES.has(language) ? '' : block,
    )
    .trim();
}
/** What identifies an artifact. */
function artifactKey(path) {
  return `path:${artifactPath(path) ?? path}`;
}
/** An artifact's path inside the session, when it has one. */
function artifactPath(url) {
  try {
    const parsed = new URL(url, 'http://localhost'),
      path = parsed.searchParams.get('path');
    if (path && parsed.pathname.includes('/files/content')) return j(path);
  } catch {
    return;
  }
  const normalized = j(url);
  return normalized.startsWith('artifacts/') || normalized.startsWith('output/') ? normalized : void 0;
}
/** What kind of file a path is. */
function fileKind(path) {
  const extension = fileExtension(path);
  return extension === 'html' || extension === 'htm'
    ? 'html'
    : IMAGE_EXTENSIONS.has(extension)
      ? 'image'
      : DOCUMENT_EXTENSIONS.has(extension)
        ? 'document'
        : 'other';
}
/** A path's lowercase extension. */
function fileExtension(path) {
  const name = (path.split(/[?#]/, 1)[0] ?? '').split('/').at(-1) ?? '';
  return (name.includes('.') ? name.split('.').at(-1) : void 0)?.toLowerCase() ?? '';
}
/** A draft block's JSON, or null. */
function parseDraftBlock(code) {
  if (code.trim().length === 0) return {};
  try {
    const value = (0, jsonParser.parseJSON)(code);
    return typeof value == 'object' && value !== null && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
/** Whether a code block is a draft block. */
function isDraftLanguage(language) {
  return ce.includes(language);
}
/** The tool calls a running session is making; polls while the page is visible. */
var LiveToolCalls = ({className, sessionId}) => {
  const trpc = I(),
    {accountId} = b(),
    visible = $(),
    toolCalls =
      R(
        trpc.sessions.liveToolCalls.queryOptions(
          {accountId, sessionId},
          {refetchInterval: visible ? 900 : false, staleTime: 0},
        ),
      ).data ?? [];
  return toolCalls.length === 0
    ? null
    : (0, t.jsx)('ol', {
        className: h('mt-2 flex min-w-0 flex-col gap-1', className),
        children: toolCalls.map((toolCall, index) => (0, t.jsx)(LiveToolCall, {index, toolCall}, toolCall.id)),
      });
};
/** A tool call's icon and title. */
function LiveToolCall({index, toolCall}) {
  const tool = ae(toolCall.name),
    state = se(toolCall, void 0, {isStreaming: true});
  return tool.hide?.(state)
    ? null
    : (0, t.jsxs)('li', {
        className:
          'text-muted-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 flex min-w-0 items-center gap-1.5 duration-150',
        style: {animationDelay: `${index * 35}ms`},
        children: [
          (0, t.jsx)('span', {
            className: 'flex size-[14px] shrink-0 items-center justify-center [&>svg]:size-[14px]! [&>svg]:opacity-50',
            children: P(tool.icon, state),
          }),
          (0, t.jsx)('div', {
            className: 'min-w-0 truncate text-xs font-medium [&_*]:truncate [&_svg]:size-[14px]! [&_svg]:opacity-50',
            children: P(tool.title, state),
          }),
        ],
      });
}
/** Images do not render in the preview text. */
var MARKDOWN_COMPONENTS = {img: () => null},
  /** ChatPreviewCard. */
  dt = ({session, taskLinkProps, onOpenRoutine, className}) => {
    const {accountId} = b(),
      trpc = I(),
      [menuOpen, setMenuOpen] = (0, k.useState)(false),
      artifacts = sessionArtifacts(session),
      hasArtifacts = artifacts.artifacts.length > 0,
      running = session.status === 'running',
      tabTargetId = session.activeTabTargetId,
      platform = session.trigger?.type === 'channel' ? session.trigger.channel : void 0,
      reply = withoutArtifactBlocks(_(session.latestRun?.finalAssistantMessage?.at(-1) ?? {content: []})).trim(),
      sessionError = Y(session),
      preview =
        reply ||
        (sessionError
          ? ''
          : session.latestRun?.userMessage
              .filter(message => message.role === 'user')
              .map(message => V(_(message)))
              .filter(Boolean).join(`

`)),
      {data: billing} = R(
        trpc.billing.getSubscription.queryOptions(
          {accountId, fresh: true},
          {enabled: !!sessionError && S(sessionError).kind === 'credits-aux-v2', staleTime: 6e4},
        ),
      ),
      classifiedError = sessionError
        ? S({
            ...sessionError,
            billing: {
              plan: billing
                ? billing.subscription && ['active', 'trialing'].includes(billing.subscription.status)
                  ? billing.subscription.plan.slug
                  : 'free'
                : void 0,
              creditRefreshAt: billing?.credit.refresh_at,
            },
          })
        : null,
      openRoutine = event => {
        (event.preventDefault(), event.stopPropagation(), session.routine && onOpenRoutine(session.routine.id));
      };
    return (0, t.jsx)(he, {
      session,
      open: menuOpen,
      onOpenChange: setMenuOpen,
      children: (0, t.jsxs)('article', {
        className: h(
          'bg-surface-secondary hover:bg-surface-primary ring-border-surface-strong relative aspect-square w-full overflow-hidden rounded-xl shadow-md ring-[0.5px] transition-all select-none hover:shadow-lg',
          menuOpen && 'bg-surface-primary shadow-lg',
          className,
        ),
        children: [
          (0, t.jsx)('a', {
            ...taskLinkProps,
            'aria-label': session.title,
            className:
              'focus-visible:ring-ring/50 absolute top-0 left-0 z-20 size-full focus-visible:ring-2 focus-visible:outline-none',
          }),
          (0, t.jsxs)('div', {
            className: 'flex h-full flex-col px-3 pt-2',
            children: [
              (0, t.jsxs)('div', {
                className: 'mb-0.5 flex shrink-0 items-center',
                children: [
                  (0, t.jsx)('time', {
                    className: 'text-muted-foreground line-clamp-1 min-w-0 grow text-xs font-medium opacity-80',
                    dateTime: running ? session.latestRun.startedAt : session.updatedAt,
                    children: running
                      ? (0, t.jsx)(WorkingFor, {startedAt: session.latestRun.startedAt})
                      : (0, t.jsx)(Q, {datetime: session.updatedAt}),
                  }),
                  (0, t.jsx)(ye, {className: 'ml-1.5', platform, channelName: session.channel?.name}),
                  session.routine &&
                    session.status !== 'suspended' &&
                    (0, t.jsxs)(ve, {
                      children: [
                        (0, t.jsx)(ge, {
                          tabIndex: 0,
                          'aria-label': `Open routine: ${session.routine.name}`,
                          className:
                            'text-muted-foreground hover:text-foreground relative z-30 ml-1.5 flex max-w-[60%] min-w-0 shrink-0 cursor-pointer items-center gap-1 text-xs',
                          onClick: openRoutine,
                          children: (0, t.jsx)('span', {
                            className: 'truncate',
                            children: session.routine.scheduleLabel,
                          }),
                        }),
                        (0, t.jsx)(xe, {
                          children: (0, t.jsxs)('div', {
                            children: [
                              (0, t.jsx)('div', {children: session.routine.name}),
                              (0, t.jsx)('div', {children: session.routine.scheduleLabel}),
                            ],
                          }),
                        }),
                      ],
                    }),
                  session.pinned && (0, t.jsx)(ee, {className: 'text-muted-foreground ml-1.5 size-3 shrink-0'}),
                  session.unread && (0, t.jsx)('span', {className: 'bg-brand ml-1.5 size-1.5 rounded-full'}),
                  session.status === 'suspended' &&
                    (0, t.jsx)(A, {
                      variant: 'success',
                      size: 'sm',
                      className: 'ml-1.5',
                      children:
                        session.suspension?.kind === 'ask-user-question'
                          ? 'Asked question'
                          : session.suspension?.kind === 'approval'
                            ? 'Permission approval'
                            : 'Action confirm',
                    }),
                  session.status === 'interrupted' &&
                    (0, t.jsx)(A, {variant: 'secondary', size: 'sm', className: 'ml-1.5', children: 'Interrupted'}),
                  U(session) &&
                    (0, t.jsx)(A, {variant: 'outline', size: 'sm', className: 'ml-1.5', children: 'Aux Code'}),
                ],
              }),
              (0, t.jsxs)('h3', {
                className: 'text-foreground flex min-w-0 shrink-0 items-center gap-1.5 text-sm font-semibold',
                children: [
                  (0, t.jsx)('span', {
                    className: 'min-w-0 truncate',
                    children: running
                      ? (0, t.jsx)(G, {
                          as: 'span',
                          shimmerColor: 'var(--color-foreground)',
                          className: 'text-surface-tertiary-foreground',
                          children: session.title,
                        })
                      : (0, t.jsx)('span', {children: session.title}),
                  }),
                  session.trigger?.type === 'standalone-routine' &&
                    (0, t.jsx)(te, {className: 'text-muted-foreground size-3.5 shrink-0', 'aria-label': 'Routine'}),
                ],
              }),
              session.status === 'suspended'
                ? (0, t.jsx)(SuspensionPrompt, {className: 'relative z-30 mt-3 min-h-0 flex-1', session})
                : running
                  ? (0, t.jsxs)(t.Fragment, {
                      children: [
                        (0, t.jsx)('div', {
                          className: 'min-h-16 shrink-0',
                          children: (0, t.jsx)(LiveToolCalls, {sessionId: session.id}),
                        }),
                        tabTargetId &&
                          (0, t.jsx)(TabPreview, {className: 'mt-4 w-full shrink-0', targetId: tabTargetId}),
                      ],
                    })
                  : (0, t.jsxs)(t.Fragment, {
                      children: [
                        classifiedError &&
                          (0, t.jsx)(de, {
                            classified: classifiedError,
                            meta: {className: 'mt-3', compact: true},
                            children: (0, t.jsx)(me, {}),
                          }),
                        preview &&
                          (0, t.jsx)('div', {
                            className: h(
                              'text-muted-foreground mt-1 shrink-0 text-xs font-medium opacity-80',
                              hasArtifacts || tabTargetId
                                ? 'line-clamp-3'
                                : 'min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,black_calc(100%-12px),transparent)]',
                            ),
                            children: (0, t.jsx)(fe, {components: MARKDOWN_COMPONENTS, children: preview}),
                          }),
                        hasArtifacts &&
                          (0, t.jsx)('div', {
                            className: 'mt-4',
                            children: (0, t.jsx)(ArtifactPreview, {
                              artifacts: artifacts.artifacts,
                              representativeArtifact: artifacts.representativeArtifact,
                              sessionId: session.id,
                            }),
                          }),
                        !hasArtifacts &&
                          tabTargetId &&
                          (0, t.jsx)(TabPreview, {className: 'mt-4 w-full', targetId: tabTargetId}),
                      ],
                    }),
            ],
          }),
        ],
      }),
    });
  },
  /** The question, approval or confirmation a session waits on, answered in the card. */
  SuspensionPrompt = ({session, className}) => {
    const {accountId} = b(),
      trpc = I(),
      queryClient = J(),
      resolve = C(trpc.sessions.resolveSuspension.mutationOptions()),
      interrupt = C(trpc.sessions.interrupt.mutationOptions()),
      suspension = session.suspension;
    if (!je(suspension)) return null;
    const refresh = () =>
        Promise.all([
          queryClient.invalidateQueries(trpc.sessions.get.queryFilter({sessionId: session.id, accountId})),
          queryClient.invalidateQueries(
            trpc.sessions.turns.activeMessages.queryFilter({sessionId: session.id, accountId}),
          ),
          queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
          queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
        ]),
      respond = async (response, fallback) => {
        try {
          await resolve.mutateAsync({
            sessionId: session.id,
            toolCallId: suspension.toolCallId,
            suspensionId: suspension.id,
            response,
            accountId,
          });
        } catch (error) {
          T.error(error instanceof Error ? error.message : fallback);
        } finally {
          await refresh();
        }
      },
      cancel = async () => {
        try {
          await interrupt.mutateAsync({sessionId: session.id, accountId});
        } catch (error) {
          T.error(error instanceof Error ? error.message : 'Failed to cancel question');
        } finally {
          await refresh();
        }
      },
      onAnswers = answers => respond({answers}, 'Failed to submit answers'),
      onApproval = (verdict, always) => respond({verdict, always}, 'Failed to resolve approval'),
      onConfirmation = result => respond(result, 'Failed to resolve review'),
      promptClassName = h(
        'ring-border-surface-strong mb-3 max-h-none overflow-hidden rounded-md px-2 shadow-md ring-[0.5px]',
        className,
      );
    switch (suspension.kind) {
      case 'ask-user-question':
        return (0, t.jsx)(re, {
          className: promptClassName,
          questions: suspension.request.questions,
          onCancel: cancel,
          onSubmit: onAnswers,
        });
      case 'approval':
        return (0, t.jsx)(
          ne,
          {
            className: promptClassName,
            scope: suspension.request.scope,
            toolCallId: suspension.toolCallId,
            sourceTaskId: suspension.request.source?.taskId,
            onResolve: onApproval,
          },
          suspension.id ?? suspension.createdAt,
        );
      case 'action-confirmation':
        return (0, t.jsx)(
          ie,
          {className: promptClassName, request: suspension.request, sessionId: session.id, onSubmit: onConfirmation},
          suspension.id ?? suspension.createdAt,
        );
      default:
        return suspension;
    }
  },
  /** The artifact to show, or the file list. */
  ArtifactPreview = ({artifacts, representativeArtifact, sessionId}) =>
    representativeArtifact?.kind === 'image'
      ? (0, t.jsx)(ImageThumbnail, {artifact: representativeArtifact, className: 'size-full', sessionId})
      : isDocumentArtifact(representativeArtifact)
        ? (0, t.jsx)(DocumentThumbnail, {artifact: representativeArtifact, className: 'size-full', sessionId})
        : representativeArtifact?.kind === 'draft-block'
          ? (0, t.jsx)(ue, {
              className: 'w-full zoom-75 overflow-hidden rounded-lg border shadow-sm',
              data: representativeArtifact.data,
              language: representativeArtifact.language,
              sessionId,
            })
          : (0, t.jsx)(be, {
              artifacts,
              className: 'h-full items-start',
              sessionId,
            }),
  /** How long a running session has worked. */
  WorkingFor = ({startedAt}) => {
    const [now, setNow] = (0, k.useState)(Date.now),
      started = new Date(startedAt).getTime();
    return (
      (0, k.useEffect)(() => {
        setNow(Date.now());
        const timer = window.setInterval(() => setNow(Date.now()), 1e3);
        return () => window.clearInterval(timer);
      }, [startedAt]),
      (0, t.jsx)('span', {className: 'tabular-nums', children: `Working for ${we(now - started)}`})
    );
  },
  /** ChatPreviewCardSkeleton. */
  mt = ({className, ...props}) =>
    (0, t.jsxs)('div', {
      className: h(
        'bg-surface-secondary ring-border-surface-strong aspect-square w-full rounded-xl p-3 shadow-md ring-[0.5px]',
        className,
      ),
      ...props,
      children: [
        (0, t.jsx)(w, {className: 'mb-2 h-2 w-18 rounded-sm'}),
        (0, t.jsx)(w, {className: 'mb-4 h-3 w-38 rounded-sm'}),
        (0, t.jsx)(w, {className: 'mb-3 h-2 w-full rounded-sm opacity-70'}),
        (0, t.jsx)(w, {className: 'mb-3 h-2 w-11/12 rounded-sm opacity-70'}),
        (0, t.jsx)(w, {className: 'h-2 w-9/12 rounded-sm opacity-70'}),
      ],
    });
/** Whether an artifact is a document or a web page. */
function isDocumentArtifact(artifact) {
  return !!artifact && (artifact.kind === 'document' || artifact.kind === 'html');
}
