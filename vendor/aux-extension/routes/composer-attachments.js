/* Aux-owned source, composer pass 1: attachments, the input layout, file previews and context usage
 * (assets/session-composer-Dc0LRfZA.js, from the attachment chip to the context-usage meter). The
 * rest of the chunk stays supplied for now. Names the chunk uses elsewhere keep their chunk names:
 * Xn AttachmentChip, Sd AttachmentsPreview, Pd ComposerInputLayout, ns ComposerAction, Ad
 * AuxCodeAgents, Tr useOpenSessionFile, Rd SessionFileView, tn PreviewUnavailable, Wd ContextUsage.
 * Chunk names used: a JSX runtime, g React, Y cn, J Button, Fe useQuery, ve useMutation, Ce useTRPC,
 * me useSession, ge useApp, At useComposer, Tt useEditor, Ve aux agents, Ut openAgent, de toast,
 * fn file-action labels, Ws session file URL, ta fetch, ya cached object URL, xd favicon palette,
 * fl favicon candidates, Ci page visible; Ma/ka/Pa Avatar, Sc image, Dl switch-by-value, Pr link,
 * gn link click; xi button group, It/Vt/gt/ft/We/_t menu parts; vr markdown; Ae/Pe/Ie popover;
 * Ea usage ring, $n separator, zn provider icon, Ni provider name, zl/Vl/Ul usage helpers, En token
 * count; lc/bc/rc/gr/xr/sc agent status and details; pl path label; icons yr, kt, Cr, ru, ou, ln,
 * or, mn, cn.
 * Aux change: the Open with buttons used fixed white and neutral fills (no dark mode); they take
 * the theme's border, background and muted tokens like every outline button. */
var /** AttachmentChip: a tab, selection, file or folder attached to the composer; a tab chip opens its tab. */
  Xn = ({attachment, className, isUploading = false, sessionId, onRemove}) => {
    const [candidateIndex, setCandidateIndex] = (0, g.useState)(0),
      isTab = attachment.type === 'tab',
      candidates = (0, g.useMemo)(() => previewCandidates(attachment, sessionId), [attachment, sessionId]),
      linksToTab = isTab && !isUploading,
      candidate = candidates[candidateIndex],
      imageUrl = ya(candidate),
      faviconUrl = isTab ? imageUrl : void 0,
      palette = Fe({
        queryKey: ['tab-favicon-palette', faviconUrl],
        queryFn: () => xd(faviconUrl, {maxSampleSize: 32}),
        enabled: !!faviconUrl,
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: 18e5,
        retry: false,
      }),
      tint = palette.data
        ? {'--tab-avatar-bg': palette.data.light.primary, '--tab-avatar-bg-dark': palette.data.dark.primary}
        : void 0,
      remove = event => {
        (event.preventDefault(), event.stopPropagation(), onRemove?.());
      },
      onLoadingStatus = status => {
        status === 'error' && setCandidateIndex(index => (index < candidates.length - 1 ? index + 1 : index));
      };
    (0, g.useEffect)(() => {
      setCandidateIndex(0);
    }, [candidates]);
    const removeButton =
        onRemove && !isUploading
          ? (0, a.jsx)(J, {
              className:
                'absolute top-1 right-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
              variant: 'ghost',
              size: 'icon-xs',
              type: 'button',
              'aria-label': `Remove ${attachment.name}`,
              onClick: remove,
              children: (0, a.jsx)(yr, {className: 'size-3!'}),
            })
          : null,
      card = (0, a.jsxs)('div', {
        className: Y(
          'bg-surface-primary hover:bg-surface-tertiary ring-border-surface relative flex h-11 w-45 shrink-0 items-center gap-2 overflow-hidden rounded-xl p-1.5 shadow-md ring-[0.5px] transition select-none',
          'backdrop-blur-md transition-colors duration-200',
          linksToTab && 'cursor-pointer',
          !linksToTab && 'group',
          className,
        ),
        'data-testid': 'input-attachment-preview',
        children: [
          attachment.type === 'file' && imageUrl && !isUploading
            ? (0, a.jsx)(Sc, {
                alt: attachment.name,
                className: 'my-0 size-8 shrink-0 rounded-md object-cover',
                src: imageUrl,
                onError: () => setCandidateIndex(candidates.length),
              })
            : (0, a.jsxs)(Ma, {
                className: Y(
                  'size-8 rounded-md border-none',
                  attachment.type === 'tab' &&
                    Y(
                      'flex items-center justify-center',
                      tint
                        ? 'bg-[color-mix(in_srgb,var(--tab-avatar-bg)_15%,transparent)] dark:bg-[color-mix(in_srgb,var(--tab-avatar-bg-dark)_15%,transparent)]'
                        : 'bg-background/40',
                    ),
                ),
                style: tint,
                children: [
                  (0, a.jsx)(
                    ka,
                    {
                      className: Y(attachment.type === 'tab' && 'size-5 rounded-sm'),
                      src: imageUrl,
                      onLoadingStatusChange: onLoadingStatus,
                    },
                    imageUrl,
                  ),
                  (0, a.jsx)(Pa, {
                    className: Y(
                      'text-muted-foreground [&>svg]:size-5',
                      attachment.type === 'tab' ? 'bg-transparent' : 'bg-background/40',
                    ),
                    children: (0, a.jsx)(Dl, {
                      value: attachment.type,
                      caseBy: {
                        tab: (0, a.jsx)(Cr, {}),
                        selection:
                          attachment.type === 'selection' && attachment.sourceKind === 'chat'
                            ? (0, a.jsx)(ru, {})
                            : (0, a.jsx)(ou, {}),
                        file: (0, a.jsx)(ln, {filename: attachment.name}),
                        directory: (0, a.jsx)(or, {}),
                      },
                    }),
                  }),
                ],
              }),
          (0, a.jsxs)('div', {
            className:
              'flex min-w-0 grow flex-col justify-center overflow-hidden pr-3 text-xs leading-none font-medium',
            children: [
              (0, a.jsx)('p', {
                className: 'text-primary text-box-trim overflow-hidden text-ellipsis whitespace-nowrap',
                children: (attachment.type === 'file' && attachment.pastedText?.preview) || attachment.name,
              }),
              (0, a.jsx)('p', {
                className:
                  'text-muted-foreground text-box-trim overflow-hidden font-normal text-ellipsis whitespace-nowrap',
                children: attachmentDetail(attachment),
              }),
            ],
          }),
          isUploading &&
            (0, a.jsx)('div', {
              className: 'absolute inset-0 flex items-center justify-center bg-black/50',
              'data-testid': 'input-attachment-loader',
              children: (0, a.jsx)(kt, {}),
            }),
          linksToTab ? null : removeButton,
        ],
      });
    return linksToTab
      ? (0, a.jsxs)('div', {
          className: 'group relative shrink-0',
          children: [
            (0, a.jsx)(Pr, {
              className: 'click-depth-effect-slightly block',
              onClick: event => {
                gn(event);
              },
              to: attachment.url,
              children: card,
            }),
            removeButton,
          ],
        })
      : card;
  };
function previewCandidates(attachment, sessionId) {
  if (attachment.type === 'tab') return fl(attachment.url, attachment.faviconUrl);
  const preview = imagePreviewUrl(attachment, sessionId);
  return preview ? [preview] : [];
}
function imagePreviewUrl(attachment, sessionId) {
  if (attachment.type === 'selection') return attachment.previewImage;
  if (!(attachment.type !== 'file' || !attachment.mimeType.startsWith('image/'))) {
    if (attachment.data) return `data:${attachment.mimeType};base64,${attachment.data}`;
    if (sessionId && attachment.path) return Ws(sessionId, attachment.path);
  }
} /** The second line of an attachment chip: host, selection kind, path, pasted-text size or file type. */
function attachmentDetail(attachment) {
  if (attachment.type === 'tab')
    try {
      return new URL(attachment.url).hostname;
    } catch {
      return attachment.url;
    }
  if (attachment.type === 'selection')
    return attachment.sourceKind === 'chat'
      ? 'Annotation'
      : attachment.selectionKind === 'region'
        ? 'Selected Area'
        : 'Selected Text';
  if (attachment.type === 'directory') return attachment.path;
  const path = attachment.path ?? attachment.name;
  if (attachment.pastedText)
    return `Pasted text · ${attachment.pastedText.characterCount.toLocaleString('en-US')} chars`;
  const extension = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1).trim() : '';
  if (extension.length > 0) return extension.toUpperCase();
  const subtype = attachment.mimeType.split('/').at(1)?.trim();
  return subtype ? subtype.toUpperCase() : 'Uploading...';
}
var /** AttachmentsPreview: the composer’s attachment chips, including files still uploading. */
  Sd = () => {
    const {attachments, uploadQueue, removeAttachment} = At(),
      removeFor = attachment => () => removeAttachment(attachment);
    return attachments.length === 0 && uploadQueue.length === 0
      ? null
      : (0, a.jsxs)('div', {
          className:
            'flex min-w-0 shrink-0 scrollbar-none flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain p-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          'data-testid': 'attachments-preview',
          children: [
            attachments.map(attachment =>
              (0, a.jsx)(Xn, {className: 'shadow-xs', attachment, onRemove: removeFor(attachment)}, attachment.id),
            ),
            uploadQueue.map((name, index) =>
              (0, a.jsx)(
                Xn,
                {
                  className: 'shadow-xs',
                  attachment: {id: `uploading:${index}:${name}`, type: 'file', name, mimeType: ''},
                  isUploading: true,
                },
                `uploading:${index}:${name}`,
              ),
            ),
          ],
        });
  } /** ComposerInputLayout: the input between the left and right actions, wrapping onto a second row when it grows. */,
  Pd = ({children, badges}) => {
    const {getText} = Tt(),
      container = (0, g.useRef)(null),
      badgeSlot = (0, g.useRef)(null),
      {actionWidths, isMultiline} = useActionWidths(container, badgeSlot),
      onKeyDownCapture = event => {
        if (
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          (event.key !== 'Backspace' && event.key !== 'Delete') ||
          !(event.target instanceof HTMLElement) ||
          !event.target.isContentEditable ||
          getText().length > 0
        )
          return;
        const dismissButtons = badgeSlot.current?.querySelectorAll(
            'button[data-composer-badge-dismiss]:not(:disabled)',
          ),
          lastDismiss = dismissButtons?.item(dismissButtons.length - 1);
        lastDismiss && (event.preventDefault(), event.stopPropagation(), lastDismiss.click());
      };
    return (0, a.jsxs)('div', {
      ref: container,
      onKeyDownCapture,
      'data-multiline': isMultiline,
      className: Y('relative flex items-start', isMultiline && 'flex-col pb-9.5 @max-[520px]/composer:pb-9'),
      style: {paddingLeft: isMultiline ? 0 : actionWidths.left, paddingRight: isMultiline ? 0 : actionWidths.right},
      children: [
        (0, a.jsx)('div', {
          ref: badgeSlot,
          className: Y(
            'shrink-0 empty:hidden',
            isMultiline ? 'absolute bottom-2 @max-[520px]/composer:bottom-1.5' : 'py-2 @max-[520px]/composer:py-1.5',
          ),
          style: isMultiline ? {left: actionWidths.left} : void 0,
          children: badges,
        }),
        (0, a.jsx)('div', {className: 'w-full min-w-0', children}),
      ],
    });
  } /** ComposerAction: a left or right action slot. */,
  ns = ({children, position}) =>
    (0, a.jsx)('div', {
      'data-chat-action': position,
      className: Y(
        'absolute bottom-2 flex items-center @max-[520px]/composer:bottom-1.5',
        position === 'left' ? 'left-2 @max-[520px]/composer:left-1.5' : 'right-2 @max-[520px]/composer:right-1.5',
      ),
      children,
    }),
  MULTILINE_TOLERANCE = 2,
  MEASURE_GUTTER = 16 /** Measures the action slots and whether the input needs two rows, by laying out a hidden copy of it. */,
  useActionWidths = (containerRef, badgesRef) => {
    const [actionWidths, setActionWidths] = (0, g.useState)({left: 36, right: 36}),
      [isMultiline, setIsMultiline] = (0, g.useState)(false);
    return (
      (0, g.useLayoutEffect)(() => {
        let setupFrame = 0,
          measureFrame = 0,
          teardown;
        const setup = () => {
          const container = containerRef.current,
            input = container?.querySelector('[data-testid="chat-input"]');
          if (!container || !input) {
            setupFrame = requestAnimationFrame(setup);
            return;
          }
          const composer = container.parentElement,
            leftAction = composer.querySelector('[data-chat-action="left"]'),
            rightAction = composer.querySelector('[data-chat-action="right"]'),
            probe = input.cloneNode(true);
          (probe.removeAttribute('data-testid'),
            probe.removeAttribute('role'),
            probe.removeAttribute('tabindex'),
            (probe.contentEditable = 'false'),
            (probe.inert = true),
            probe.setAttribute('aria-hidden', 'true'),
            Object.assign(probe.style, {
              left: '0',
              top: '0',
              position: 'absolute',
              pointerEvents: 'none',
              visibility: 'hidden',
              height: 'auto',
              maxHeight: 'none',
            }),
            container.appendChild(probe));
          const measure = () => {
              const left = leftAction
                  ? leftAction.offsetWidth + Number.parseFloat(getComputedStyle(leftAction).left)
                  : 36,
                right = rightAction
                  ? rightAction.offsetWidth + Number.parseFloat(getComputedStyle(rightAction).right)
                  : 36;
              setActionWidths(current => (current.left === left && current.right === right ? current : {left, right}));
              const badgesWidth = badgesRef.current?.getBoundingClientRect().width ?? 0,
                available = container.getBoundingClientRect().width - left - right - badgesWidth;
              ((probe.style.width = `${Math.max(0, available - MEASURE_GUTTER)}px`),
                (probe.innerHTML = input.innerHTML));
              const hasAttachments = !!composer.querySelector('[data-testid="attachments-preview"]');
              setIsMultiline(
                hasAttachments || probe.getBoundingClientRect().height > singleLineHeight(input) + MULTILINE_TOLERANCE,
              );
            },
            remeasure = () => {
              (cancelAnimationFrame(measureFrame), (measureFrame = requestAnimationFrame(measure)));
            };
          measure();
          const mutations = new MutationObserver(remeasure);
          (mutations.observe(input, {characterData: true, childList: true, subtree: true}),
            mutations.observe(composer, {childList: true}));
          const resizes = new ResizeObserver(remeasure);
          for (const element of [input, container, badgesRef.current, leftAction, rightAction])
            element && resizes.observe(element);
          teardown = () => {
            (mutations.disconnect(), resizes.disconnect(), probe.remove());
          };
        };
        return (
          setup(),
          () => {
            (cancelAnimationFrame(setupFrame), cancelAnimationFrame(measureFrame), teardown?.());
          }
        );
      }, [containerRef, badgesRef]),
      {actionWidths, isMultiline}
    );
  },
  singleLineHeight = element => {
    const style = window.getComputedStyle(element);
    return (
      (Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2) +
      Number.parseFloat(style.paddingTop) +
      Number.parseFloat(style.paddingBottom)
    );
  } /** AuxCodeAgents: the Aux Code agents list. */,
  Ad = () => {
    const {auxCodeAgents: agents} = Ve(),
      [expanded, setExpanded] = (0, g.useState)(true);
    return (0, a.jsxs)('div', {
      className: 'min-h-0 flex-1 overflow-y-auto px-3 pt-2 pb-6',
      children: [
        (0, a.jsxs)('button', {
          type: 'button',
          'aria-expanded': expanded,
          className:
            'bg-secondary hover:bg-secondary/80 focus-visible:ring-ring/50 flex h-8 w-full items-center gap-1.5 rounded-lg px-2.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2',
          onClick: () => setExpanded(open => !open),
          children: [
            (0, a.jsx)('span', {className: 'text-primary', children: 'Aux Code'}),
            (0, a.jsx)('span', {className: 'text-muted-foreground font-normal tabular-nums', children: agents.length}),
            (0, a.jsx)(mn, {
              className: Y('text-muted-foreground size-3.5 transition-transform', !expanded && '-rotate-90'),
            }),
          ],
        }),
        expanded &&
          (0, a.jsx)('div', {
            className: 'flex flex-col gap-0.5 pt-1',
            children: agents.map(agent => (0, a.jsx)(AuxCodeAgentRow, {agent}, agent.id)),
          }),
      ],
    });
  },
  folderName = path => path.replace(/\/+$/, '').split('/').pop() || path,
  AuxCodeAgentRow = ({agent}) => {
    const openAgent = Ut(),
      status = lc(agent),
      active = status !== 'done' && status !== 'starting';
    return (0, a.jsxs)('button', {
      type: 'button',
      title: agent.cwd ? pl(agent.cwd) : void 0,
      className:
        'hover:bg-muted dark:hover:bg-muted/50 focus-visible:ring-ring/50 flex w-full min-w-0 items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors outline-none focus-visible:ring-2',
      onClick: () => {
        openAgent(agent.id);
      },
      children: [
        (0, a.jsx)(bc, {className: 'mt-[3px] size-3.5', status}),
        (0, a.jsxs)('span', {
          className: 'min-w-0 flex-1',
          children: [
            (0, a.jsxs)('span', {
              className: 'flex min-w-0 items-baseline gap-2 text-sm',
              children: [
                agent.cwd &&
                  (0, a.jsx)('span', {
                    className: 'text-muted-foreground max-w-[40%] shrink-0 truncate',
                    children: folderName(agent.cwd),
                  }),
                (0, a.jsx)('span', {
                  className: 'text-primary min-w-0 flex-1 truncate font-medium',
                  children: agent.title,
                }),
              ],
            }),
            active &&
              (0, a.jsx)('span', {
                className: 'text-muted-foreground block truncate pt-0.5 text-[13px]',
                children: (0, a.jsx)(rc, {preview: agent}),
              }),
            (0, a.jsxs)('span', {
              className: 'text-muted-foreground flex min-w-0 items-center gap-1.5 pt-0.5 text-xs',
              children: [
                agent.model && (0, a.jsx)(gr, {model: agent.model}),
                agent.model && (0, a.jsx)('span', {'aria-hidden': 'true', children: '·'}),
                (0, a.jsx)('span', {className: 'shrink-0', children: (0, a.jsx)(xr, {item: sc(agent)})}),
              ],
            }),
          ],
        }),
      ],
    });
  } /** useOpenSessionFile: opens or reveals a session file on this computer. */,
  Tr = () => {
    const {currentSession} = me(),
      {accountId} = ge(),
      trpc = Ce(),
      open = ve(trpc.meta.open.mutationOptions());
    return (0, g.useCallback)(
      async (path, mode = 'open') => {
        try {
          await open.mutateAsync({path, session: currentSession, mode, accountId});
        } catch (error) {
          (de.error(mode === 'reveal' ? fn().revealError : 'There was an error opening the file.'),
            console.error(error));
        }
      },
      [accountId, currentSession, open],
    );
  } /** SessionFileView: a session file, or a preview passed in. */,
  Rd = ({path, preview}) =>
    preview
      ? (0, a.jsx)(StaticFilePreview, {path, preview})
      : (0, a.jsx)(SessionFilePreview, {
          path,
        }) /** A session file’s preview, refreshed every 5s while the session runs. */,
  SessionFilePreview = ({path}) => {
    const {currentSession} = me(),
      {accountId} = ge(),
      trpc = Ce(),
      openFile = Tr(),
      visible = Ci(),
      live = currentSession.status === 'running' || currentSession.status === 'suspended',
      metadataQuery = Fe(
        trpc.sessions.files.metadata.queryOptions(
          {sessionId: currentSession.id, accountId, path},
          {refetchOnMount: 'always', refetchInterval: visible && live ? 5e3 : false},
        ),
      ),
      url = new URL(Ws(currentSession.id, path, {accountId})),
      metadata = metadataQuery.data;
    metadata?.mtimeMs !== void 0 && url.searchParams.set('v', `${metadata.mtimeMs}-${metadata.size}`);
    const fileUrl = url.toString(),
      textQuery = Fe({
        queryKey: ['session-output-file-text', accountId, currentSession.id, path, fileUrl],
        enabled: visible && metadata?.kind === 'text',
        gcTime: 0,
        queryFn: async ({signal: context}) => {
          const response = await ta(fileUrl, {signal: context});
          if (!response.ok) throw new Error('Failed to load file preview');
          return response.text();
        },
      }),
      open = (0, g.useCallback)(() => {
        openFile(path, openModeFor(metadata));
      }, [metadata, openFile, path]);
    return (0, a.jsx)(FilePreview, {
      metadata,
      fileUrl,
      textContent: textQuery.data,
      metadataState: metadataQuery,
      textState: textQuery,
      onOpenFile: open,
      openControl: (0, a.jsx)(PreviewErrorBoundary, {
        fallback: (0, a.jsx)(OpenFileButton, {onOpenFile: open}),
        children: (0, a.jsx)(OpenWithMenu, {path, onOpenFile: open}),
      }),
    });
  },
  StaticFilePreview = ({preview}) => {
    const open = (0, g.useCallback)(() => {
      window.open(preview.fileUrl, '_blank', 'noopener,noreferrer');
    }, [preview.fileUrl]);
    return (0, a.jsx)(FilePreview, {
      metadata: preview.metadata,
      fileUrl: preview.fileUrl,
      textContent: preview.textContent,
      metadataState: {isError: false, isLoading: false},
      textState: {isError: false, isLoading: false},
      onOpenFile: open,
    });
  },
  FilePreview = ({fileUrl, metadata, metadataState, onOpenFile, openControl, textContent, textState}) =>
    (0, a.jsxs)('div', {
      className: 'relative flex min-h-0 flex-1 flex-col overflow-hidden',
      children: [
        (0, a.jsx)('div', {
          className: 'absolute top-2 right-2 z-10 backdrop-blur-lg',
          children: openControl ?? (0, a.jsx)(OpenFileButton, {onOpenFile}),
        }),
        (0, a.jsxs)('div', {
          className: 'flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent text-left',
          children: [
            metadataState.isLoading && (0, a.jsx)(PreviewMessage, {children: 'Loading preview...'}),
            metadataState.isError && (0, a.jsx)(tn, {}),
            metadata &&
              (0, a.jsx)(
                PreviewErrorBoundary,
                {
                  fallback: (0, a.jsx)(tn, {}),
                  children: (0, a.jsx)(FileContentPreview, {metadata, fileUrl, textContent, textState}),
                },
                metadata.path,
              ),
          ],
        }),
      ],
    }),
  OpenFileButton = ({onOpenFile}) =>
    (0, a.jsx)(J, {
      variant: 'secondary',
      'aria-label': 'Open file',
      onClick: onOpenFile,
      children: (0, a.jsx)(cn, {className: 'size-3.5'}),
    }) /** Open the file with its default app, another app, or reveal it. */,
  OpenWithMenu = ({path, onOpenFile}) => {
    const {currentSession} = me(),
      {accountId} = ge(),
      trpc = Ce(),
      openFile = Tr(),
      request = {path, accountId, session: {id: currentSession.id}},
      appsQuery = Fe(trpc.meta.listOpenApps.queryOptions(request, {staleTime: 6e4})),
      openWith = ve(trpc.meta.openWith.mutationOptions()),
      defaultApp = appsQuery.data?.apps.find(app => app.default),
      otherApps = appsQuery.data?.apps.filter(app => !app.default) ?? [],
      openIn = async appPath => {
        try {
          await openWith.mutateAsync({...request, appPath});
        } catch (error) {
          (de.error('There was an error opening the file.'), console.error(error));
        }
      };
    return (0, a.jsxs)(xi, {
      className: 'rounded-xl shadow-lg',
      children: [
        defaultApp
          ? (0, a.jsxs)(J, {
              variant: 'outline',
              className: 'border-border bg-background hover:bg-muted',
              disabled: openWith.isPending,
              onClick: () => openIn(defaultApp.appPath),
              children: [
                defaultApp.iconDataUrl
                  ? (0, a.jsx)('img', {alt: '', src: defaultApp.iconDataUrl, className: 'size-4'})
                  : (0, a.jsx)('span', {className: 'size-4'}),
                (0, a.jsx)('span', {className: 'max-w-32 truncate', children: defaultApp.appName}),
              ],
            })
          : (0, a.jsx)(J, {
              variant: 'outline',
              size: 'icon',
              className: 'border-border bg-background hover:bg-muted',
              'aria-label': 'Open file',
              onClick: onOpenFile,
              children: (0, a.jsx)(cn, {className: 'size-3.5'}),
            }),
        (0, a.jsxs)(It, {
          children: [
            (0, a.jsx)(Vt, {
              render: (0, a.jsx)(J, {
                variant: 'outline',
                className: 'border-border bg-background hover:bg-muted aria-expanded:bg-muted',
                size: 'icon',
                disabled: openWith.isPending,
                'aria-label': 'Open with another app',
              }),
              children: (0, a.jsx)(mn, {className: 'size-3.5'}),
            }),
            (0, a.jsx)(gt, {
              align: 'end',
              children: (0, a.jsxs)(ft, {
                children: [
                  otherApps.map(app =>
                    (0, a.jsxs)(
                      We,
                      {
                        onClick: () => openIn(app.appPath),
                        children: [
                          app.iconDataUrl
                            ? (0, a.jsx)('img', {alt: '', src: app.iconDataUrl, className: 'size-4'})
                            : (0, a.jsx)('span', {className: 'size-4'}),
                          (0, a.jsx)('span', {className: 'truncate', children: app.appName}),
                        ],
                      },
                      app.appPath,
                    ),
                  ),
                  otherApps.length > 0 && (0, a.jsx)(_t, {}),
                  (0, a.jsx)(We, {
                    onClick: () => {
                      openFile(path, 'reveal');
                    },
                    children: fn().revealLabel,
                  }),
                ],
              }),
            }),
          ],
        }),
      ],
    });
  } /** Images, PDFs and HTML in a frame; text as markdown, code or a table. */,
  FileContentPreview = ({metadata, fileUrl, textContent, textState}) => {
    if (metadata.kind === 'image' || metadata.kind === 'pdf')
      return (0, a.jsx)(FramePreview, {fileUrl, title: metadata.name});
    if (metadata.kind === 'html')
      return (0, a.jsx)(FramePreview, {
        fileUrl,
        title: metadata.name,
        sandbox: 'allow-scripts allow-forms allow-popups',
      });
    if (metadata.kind === 'text') {
      if (textState.isLoading) return (0, a.jsx)(PreviewMessage, {children: 'Loading text preview...'});
      if (textState.isError) return (0, a.jsx)(tn, {});
      const preview = textPreviewFor(metadata, textContent ?? '');
      return preview.type === 'table'
        ? (0, a.jsx)(TablePreview, {preview})
        : (0, a.jsx)(vr, {
            className: 'scroll-fade-effect-y flex-1 overflow-auto px-6 pt-8 pb-20 text-sm',
            children: preview.content,
          });
    }
    return (0, a.jsx)(tn, {});
  },
  PreviewErrorBoundary = class extends g.Component {
    state = {hasError: false};
    static getDerivedStateFromError() {
      return {hasError: true};
    }
    render() {
      return this.state.hasError ? this.props.fallback : this.props.children;
    }
  },
  FramePreview = ({fileUrl, sandbox, title}) => {
    const src = ya(fileUrl);
    return src
      ? (0, a.jsx)('iframe', {title, src, sandbox, className: 'size-full min-h-0 border-0 bg-white'})
      : (0, a.jsx)(PreviewMessage, {children: 'Loading preview...'});
  },
  TablePreview = ({preview}) => {
    const [header, ...body] = preview.rows;
    return header
      ? (0, a.jsxs)('div', {
          className: 'scroll-fade-effect-y min-h-0 flex-1 overflow-auto p-3 text-sm',
          children: [
            preview.notes.length > 0 &&
              (0, a.jsx)('p', {className: 'text-muted-foreground mb-2 text-xs', children: preview.notes.join(' ')}),
            (0, a.jsxs)('table', {
              className: 'w-full min-w-max border-separate border-spacing-0 text-left',
              children: [
                (0, a.jsx)('thead', {
                  className: 'bg-secondary sticky top-0 z-10',
                  children: (0, a.jsx)('tr', {
                    children: header.map((heading, index) =>
                      (0, a.jsx)(
                        'th',
                        {
                          className:
                            'border-border max-w-64 border-b px-3 py-2 align-top text-xs font-medium whitespace-nowrap',
                          title: heading,
                          children: (0, a.jsx)('span', {className: 'block truncate', children: heading || ' '}),
                        },
                        index,
                      ),
                    ),
                  }),
                }),
                (0, a.jsx)('tbody', {
                  children: body.map((row, rowIndex) =>
                    (0, a.jsx)(
                      'tr',
                      {
                        children: row.map((cell, cellIndex) =>
                          (0, a.jsx)(
                            'td',
                            {
                              className: 'border-border/70 max-w-64 border-b px-3 py-2 align-top whitespace-nowrap',
                              title: cell,
                              children: (0, a.jsx)('span', {className: 'block truncate', children: cell || ' '}),
                            },
                            cellIndex,
                          ),
                        ),
                      },
                      rowIndex,
                    ),
                  ),
                }),
              ],
            }),
          ],
        })
      : (0, a.jsx)(PreviewMessage, {children: 'No rows to preview.'});
  },
  PreviewMessage = ({children}) =>
    (0, a.jsx)('div', {
      className: 'text-muted-foreground flex flex-1 items-center justify-center px-6 text-center text-sm',
      children,
    }),
  tn = () => {
    const {previewAction} = fn();
    return (0, a.jsxs)(PreviewMessage, {
      children: ['This file cannot be previewed inline. Use Open to ', previewAction, '.'],
    });
  },
  MARKDOWN_EXTENSIONS = new Set(['md', 'mdx', 'markdown']),
  DELIMITERS = {csv: ',', tsv: '	'},
  MAX_PREVIEW_ROWS = 100,
  MAX_PREVIEW_COLUMNS = 12,
  openModeFor = metadata => (metadata?.kind === 'binary' || metadata?.kind === 'directory' ? 'reveal' : 'open'),
  textPreviewFor = (metadata, text) => {
    const extension = metadata.extension?.replace(/^\./, '').toLowerCase();
    return isDelimited(extension)
      ? tablePreview(text, DELIMITERS[extension], extension)
      : metadata.mimeType.startsWith('text/markdown') || (extension && MARKDOWN_EXTENSIONS.has(extension))
        ? {content: text, type: 'markdown'}
        : {content: codeBlock(text, extension), type: 'code'};
  } /** A CSV or TSV preview: the first 100 rows and 12 columns. */,
  tablePreview = (text, delimiter, extension) => {
    const rows = parseDelimited(text, delimiter).filter(row => row.some(cell => cell.trim().length > 0));
    if (!rows.length) return {notes: [], rows: [], type: 'table'};
    const widest = Math.max(...rows.map(row => row.length), 0),
      columns = Math.min(widest, MAX_PREVIEW_COLUMNS),
      [header, ...body] = rows.slice(0, MAX_PREVIEW_ROWS).map(row => fitRow(row, columns));
    if (!header) return {content: codeBlock(text, extension), type: 'code'};
    const notes = [];
    return (
      rows.length > MAX_PREVIEW_ROWS && notes.push(`Previewing first ${MAX_PREVIEW_ROWS} rows.`),
      widest > MAX_PREVIEW_COLUMNS && notes.push(`Showing first ${MAX_PREVIEW_COLUMNS} columns.`),
      {notes, rows: [header, ...body], type: 'table'}
    );
  },
  isDelimited = extension =>
    extension === 'csv' || extension === 'tsv' /** Splits delimited text into rows, honouring quotes. */,
  parseDelimited = (text, delimiter) => {
    const rows = [];
    let row = [],
      cell = '',
      quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index],
        next = text[index + 1];
      if (char === '"') {
        if (quoted && next === '"') {
          ((cell += '"'), (index += 1));
          continue;
        }
        quoted = !quoted;
        continue;
      }
      if (char === delimiter && !quoted) {
        (row.push(cell), (cell = ''));
        continue;
      }
      if (
        (char ===
          `
` ||
          char === '\r') &&
        !quoted
      ) {
        (row.push(cell),
          rows.push(row),
          (row = []),
          (cell = ''),
          char === '\r' &&
            next ===
              `
` &&
            (index += 1));
        continue;
      }
      cell += char;
    }
    return (row.push(cell), rows.push(row), rows);
  },
  fitRow = (row, width) => Array.from({length: width}, (unused, index) => cleanCell(row[index] ?? '')),
  cleanCell = cell => cell.replace(/\r?\n/g, ' ').trim(),
  codeBlock = (text, language) =>
    ['```' + (language && language !== 'txt' ? language : 'text'), text, '```'].join(`
`) /** ContextUsage: how full the context window is, when it auto-compacts, and subscription limits left. */,
  Wd = () => {
    const {currentSession} = me(),
      enabled = ma(),
      {subscriptionProviderId, usageQuery} = zl(currentSession.model.provider, enabled),
      usedTokens = currentSession.contextWindow?.usedTokens ?? 0,
      totalTokens = currentSession.contextWindow?.totalTokens ?? 0,
      autoCompactAt = Vl({provider: currentSession.model.provider, id: currentSession.model.modelId}, totalTokens);
    if (!enabled) return null;
    const percentRaw = totalTokens > 0 ? (usedTokens / totalTokens) * 100 : 0,
      percent = Math.max(0, Math.min(100, percentRaw)),
      roundedPercent = Math.round(percent),
      usage = Ul(usageQuery.data?.usage),
      windows = ['five_hour', 'weekly', 'monthly'].flatMap(kind => {
        const window = usage.find(candidate => candidate.kind === kind);
        return window ? [{kind, window}] : [];
      });
    return (0, a.jsxs)(Ae, {
      children: [
        (0, a.jsx)(Pe, {
          render: (0, a.jsx)('div', {
            className: 'flex size-6 shrink-0 items-center justify-center',
            'data-testid': 'model-adjacent-indicator',
          }),
          children: (0, a.jsx)(Ea, {percent}),
        }),
        (0, a.jsxs)(Ie, {
          className: 'min-w-60 flex-col items-stretch gap-0 px-0 py-1.5',
          children: [
            (0, a.jsx)(UsageRow, {
              className: 'flex-row-reverse',
              value: `${roundedPercent}% Full`,
              label: totalTokens > 0 ? `${En(usedTokens)}/${En(totalTokens)} tokens` : void 0,
            }),
            autoCompactAt !== void 0 &&
              (0, a.jsx)(UsageRow, {
                label: 'Auto-compacts at',
                value: `${En(autoCompactAt)} (${Math.round((autoCompactAt / totalTokens) * 100)}%)`,
              }),
            subscriptionProviderId &&
              windows.length > 0 &&
              (0, a.jsxs)(a.Fragment, {
                children: [
                  (0, a.jsx)($n, {className: 'my-1'}),
                  (0, a.jsxs)('div', {
                    className: 'text-muted-foreground flex items-center gap-1 px-3 py-2',
                    children: [
                      (0, a.jsx)(zn, {provider: subscriptionProviderId, className: 'size-3'}),
                      (0, a.jsx)('p', {className: 'text-xs leading-none', children: Ni(subscriptionProviderId)}),
                    ],
                  }),
                  windows.map(({kind, window}) => {
                    const left = Math.max(100 - Math.round(window.usedPercent), 0);
                    return (0, a.jsx)(
                      UsageRow,
                      {
                        label: USAGE_WINDOW_LABELS[kind],
                        value: (0, a.jsxs)(a.Fragment, {
                          children: [
                            left < 30 &&
                              (0, a.jsx)('span', {
                                className: Y(
                                  'mr-1 inline-block size-2 shrink-0 rounded-full bg-amber-400',
                                  left < 10 && 'bg-red-400',
                                ),
                              }),
                            `${left}% left`,
                          ],
                        }),
                      },
                      kind,
                    );
                  }),
                ],
              }),
          ],
        }),
      ],
    });
  },
  UsageRow = ({className, label, value}) =>
    (0, a.jsxs)('div', {
      className: Y('flex items-start justify-between gap-1 px-3 py-1 text-[13px] font-medium', className),
      children: [
        (0, a.jsx)('p', {className: 'text-muted-foreground', children: label}),
        (0, a.jsx)('p', {className: 'shrink-0 text-right', children: value}),
      ],
    }),
  USAGE_WINDOW_LABELS = {five_hour: '5 hours', monthly: 'Monthly', weekly: 'Weekly'};
