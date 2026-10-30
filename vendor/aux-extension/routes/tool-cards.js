/* Aux-owned source, tool definitions pass 4 (assets/tool-definition-registry-Cc6FCFb2.js, after the
 * bundled diff renderer's React components, up to the embedded Aux mark): the diff card for file
 * edits and writes (file name, line counts, copy, sideways scrolling), the read, edit and write tool
 * definitions, a plain result card, browsing history results, MCP results with a settings link, the
 * memory search card, agent messages, the notification card, the REPL card (typed text redacted,
 * timing and tokens on hover) with its image generation placeholder, and the routine limit notice.
 * The embedded Aux mark after it (Sp, Lp, wp) belongs to scripts/lib/provided-ui.mjs and stays supplied.
 * Names the rest of the chunk uses keep their chunk names: Ng the file diff, and the tool definitions
 * rp read_file, op write_file, sp edit_file, ap get_time, Ri a plain result, Wr history search, cp
 * history_read, fp MCP tools, mp memory_search, pp message_agent, vp notification, xp repl, qr
 * routine_update.
 * Chunk names used: p JSX runtime, j React, Wm/$m the bundled patch and file diff components, bt
 * Button, $s the copy icon, Bs useCopy, Di toasts, Xr/Zr/Jr the tooltip root, trigger and popup, Yr
 * ScrollArea, oe Skeleton, eo/ga/Qr/io the favicon avatar, to the external link, no the URL host,
 * Ks the relative time, ta the notification icon, pn motion, Gs reduced motion, and the earlier
 * passes' W, pi, He, rn, ot, Ga, Ne, Bt, gi, mo, vi and Ke. */
var /** How tool diffs render: unified, no file header, scrolling sideways. */
  DIFF_OPTIONS = {
    theme: {dark: 'pierre-dark', light: 'pierre-light'},
    diffStyle: 'unified',
    disableFileHeader: true,
    overflow: 'scroll',
  },
  /** Tool diffs' font size and block gap. */
  DIFF_STYLE = {
    '--diffs-font-size': '12px',
    '--diffs-gap-block': '0px',
  },
  /** A patch rendered with the tool diff options. */
  PatchDiff = ({options, style, ...props}) =>
    (0, p.jsx)(Wm, {
      ...props,
      options: {...DIFF_OPTIONS, ...options},
      style: {...DIFF_STYLE, ...style},
    }),
  /** Two file versions rendered with the tool diff options. */
  Ng = ({options, style, ...props}) =>
    (0, p.jsx)($m, {
      ...props,
      options: {...DIFF_OPTIONS, ...options},
      style: {...DIFF_STYLE, ...style},
    }),
  /** The diff card's block gap. */
  DIFF_CARD_STYLE = {
    '--diffs-gap-block': '0px',
  },
  /** A sideways wheel scrolls every code column of the diff together. */
  scrollDiffSideways = event => {
    const delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    if (delta === 0) return;
    const scrollers = Array.from(event.currentTarget.querySelectorAll('*'))
        .flatMap(node => Array.from(node.shadowRoot?.querySelectorAll('[data-code]') ?? []))
        .filter(node => node.scrollWidth > node.clientWidth),
      first = scrollers[0];
    if (!first) return;
    const max = first.scrollWidth - first.clientWidth,
      left = Math.max(0, Math.min(max, first.scrollLeft + delta));
    if (left !== first.scrollLeft) {
      (event.preventDefault(), event.stopPropagation());
      for (const scroller of scrollers)
        scroller.scrollLeft = Math.min(left, scroller.scrollWidth - scroller.clientWidth);
    }
  },
  /** An edit_file result as a diff. */
  EditDiff = props => {
    const {args, resultText, state} = props,
      patch = editDiffPatch(props),
      stats = patch ? Bt(patch) : void 0;
    return Ne(state)
      ? (0, p.jsx)(DiffError, {result: resultText ?? '', state})
      : !patch || !stats
        ? null
        : (0, p.jsx)(DiffCard, {patch, stats, filename: fileNameArg(args)});
  },
  /** A write_file result as a diff of added lines. */
  WriteDiff = props => {
    const {args, resultText, state} = props,
      patch = writeDiffPatch(props),
      stats = patch ? Bt(patch) : void 0;
    return Ne(state)
      ? (0, p.jsx)(DiffError, {result: resultText ?? '', state})
      : !patch || !stats
        ? null
        : (0, p.jsx)(DiffCard, {patch, stats, filename: fileNameArg(args)});
  },
  /** A failed edit or write. */
  DiffError = ({result, state}) =>
    (0, p.jsx)(W, {
      children: (0, p.jsx)(ot, {errorText: result, state}),
    }),
  /** A diff card: the file name, lines added and removed, a copy button and the diff. */
  DiffCard = ({patch, stats, filename}) => {
    const {copy} = Bs(),
      scrollRef = pi(patch),
      copyDiff = async () => {
        if (await copy(patch)) {
          Di.success('Copied diff to clipboard!');
          return;
        }
        Di.error('Failed to copy diff.');
      },
      copyButton = (0, p.jsxs)(bt, {
        className: 'text-muted-foreground shrink-0',
        variant: 'ghost',
        size: 'icon-xs',
        onClick: () => {
          copyDiff();
        },
        children: [(0, p.jsx)($s, {}), (0, p.jsx)('span', {className: 'sr-only', children: 'Copy diff'})],
      });
    return (0, p.jsxs)(W, {
      className: 'w-full max-w-full min-w-0 gap-0 overflow-hidden p-0',
      children: [
        (0, p.jsxs)('div', {
          className: 'text-muted-foreground flex items-center justify-between gap-2 border-b px-2.5 py-0.5 text-xs',
          children: [
            (0, p.jsxs)('div', {
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, p.jsx)('span', {className: 'text-muted-foreground truncate font-medium', children: filename}),
                (0, p.jsxs)('span', {className: 'shrink-0 text-green-500', children: ['+', stats.addedLines]}),
                (0, p.jsxs)('span', {className: 'shrink-0 text-rose-500', children: ['-', stats.removedLines]}),
              ],
            }),
            (0, p.jsxs)(Xr, {
              children: [(0, p.jsx)(Zr, {render: copyButton}), (0, p.jsx)(Jr, {children: 'Copy diff'})],
            }),
          ],
        }),
        (0, p.jsx)('div', {
          className: 'max-h-60 w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto',
          ref: scrollRef,
          onWheelCapture: scrollDiffSideways,
          children: (0, p.jsx)('div', {
            className: 'min-w-full',
            children: (0, p.jsx)(PatchDiff, {patch, options: {hunkSeparators: 'simple'}, style: DIFF_CARD_STYLE}),
          }),
        }),
      ],
    });
  },
  /** The file name a read step reads. */
  readFileName = ({call}) => fileNameArg(call.arguments),
  /** The path argument of a file tool. */
  pathArg = args => {
    if (typeof args.path == 'string') return args.path;
    if (typeof args.file_path == 'string') return args.file_path;
  },
  /** The file name of a file tool's path. */
  fileNameArg = args => pathArg(args)?.split(/[/\\]/).pop() ?? 'file',
  /** The content a write_file writes. */
  contentArg = args => (typeof args.content == 'string' ? args.content : void 0),
  /** An edit's diff with its file header. */
  editPatch = (args, diff) => {
    const path = pathArg(args);
    if (path)
      return `--- ${path}
+++ ${path}
${
  diff.endsWith(`
`)
    ? diff
    : `${diff}
`
}`;
  },
  /** A new file's content as an all-added patch. */
  writePatch = (args, content) => {
    const path = pathArg(args);
    if (!path) return;
    const lines = content.split(`
`),
      added = lines.map(line => `+${line}`).join(`
`),
      body =
        added.length > 0
          ? `${added}
`
          : '';
    return `--- /dev/null
+++ ${path}
@@ -0,0 +1,${lines.length} @@
${body}`;
  },
  /** The patch an edit_file result carries. */
  editDiffPatch = ({args, details}) => {
    const diff = details?.diff;
    return typeof diff == 'string' ? editPatch(args, diff) : void 0;
  },
  /** The patch a write_file call amounts to. */
  writeDiffPatch = ({args}) => {
    const content = contentArg(args);
    return content ? writePatch(args, content) : void 0;
  },
  /** The read_file tool (a skill when it reads SKILL.md). */
  rp = {
    expandMode: 'none',
    expandedContent: null,
    summaryKind: e => (readFileName(e) === 'SKILL.md' ? 'skill' : 'read'),
  },
  /** The write_file tool. */
  op = {
    expandedContent: WriteDiff,
    summaryKind: 'edit',
    diffStats: ({call, result}) => gi(call, result),
  },
  /** The edit_file tool. */
  sp = {
    expandedContent: EditDiff,
    summaryKind: 'edit',
    diffStats: ({call, result}) => gi(call, result),
  },
  /** The get_time tool: hidden. */
  ap = {hide: () => true, expandMode: 'none', expandedContent: null},
  /** A tool whose result shows as plain output. */
  Ri = {
    expandedContent: ({resultText, state}) =>
      (0, p.jsx)(W, {children: (0, p.jsx)(ot, {output: (0, p.jsx)(He, {content: resultText ?? ''}), state})}),
  },
  /** Browsing history results: favicon, title, host and when each page was last visited. */
  BrowsingHistoryResults = ({resultText, details, state}) => {
    const {showDeveloperOutput} = Ke(),
      history = (0, j.useMemo)(() => {
        if (typeof details == 'object' && details !== null && 'items' in details)
          return {items: Array.isArray(details.items) ? details.items : []};
        try {
          const parsed = JSON.parse(resultText ?? '');
          return {items: Array.isArray(parsed.items) ? parsed.items : []};
        } catch {
          return {items: []};
        }
      }, [resultText, details]);
    if (state === 'loading')
      return (0, p.jsx)(W, {
        children: (0, p.jsxs)('div', {
          className: 'space-y-2.5 px-1 py-1.5',
          children: [
            (0, p.jsx)(oe, {className: 'h-4 w-80'}),
            (0, p.jsx)(oe, {className: 'h-4 w-60'}),
            (0, p.jsx)(oe, {className: 'h-4 w-20'}),
          ],
        }),
      });
    const devOutput =
      showDeveloperOutput && resultText
        ? (0, p.jsx)(ot, {output: (0, p.jsx)(He, {content: resultText}), state, label: 'Results · Dev only'})
        : null;
    return history.items.length
      ? (0, p.jsxs)(W, {
          className: 'p-0',
          children: [
            devOutput,
            (0, p.jsx)(Yr, {
              className: '**:data-[slot=scroll-area-viewport]:max-h-30',
              children: (0, p.jsx)('div', {
                className: 'space-y-1 px-1 py-1.5',
                children: history.items.map((item, index) =>
                  (0, p.jsxs)(
                    bt,
                    {
                      className: 'w-full items-center justify-start no-underline!',
                      size: 'xs',
                      variant: 'ghost',
                      nativeButton: false,
                      render: (0, p.jsx)(to, {to: item.url}),
                      children: [
                        (0, p.jsxs)(eo, {
                          className: 'size-3.5 rounded-xs',
                          children: [
                            (0, p.jsx)(ga, {src: item.faviconUrl}),
                            (0, p.jsx)(Qr, {className: 'bg-transparent', children: (0, p.jsx)(io, {url: item.url})}),
                          ],
                        }),
                        (0, p.jsx)('p', {className: 'text-foreground m-0! grow truncate pr-8', children: item.title}),
                        (0, p.jsx)('span', {
                          className: 'text-muted-foreground shrink-0 text-xs font-medium',
                          children: hostLabel(item.url),
                        }),
                        (0, p.jsx)('span', {
                          className: 'text-muted-foreground shrink-0 text-xs font-medium',
                          children: (0, p.jsx)(Ks, {datetime: item.lastVisitTime}),
                        }),
                      ],
                    },
                    index,
                  ),
                ),
              }),
            }),
          ],
        })
      : (0, p.jsx)(W, {
          className: 'p-0',
          children:
            devOutput ??
            (0, p.jsx)('p', {className: 'text-muted-foreground px-2.5 py-2', children: 'No results found'}),
        });
  },
  /** A URL's host, or "-". */
  hostLabel = url => no(url) || '-',
  /** The history search tools. */
  Wr = {expandedContent: BrowsingHistoryResults, summaryKind: 'search'},
  /** The history_read tool. */
  cp = {
    expandedContent: Ri.expandedContent,
    summaryKind: 'read',
  },
  /** An MCP tool's output, with a settings link when its server needs reconnecting. */
  McpResult = props => {
    const {details, resultText, state} = props,
      {renderMcpSettingsLink} = Ke(),
      failed = state === 'error',
      canOpenSettings = details?.openSettings === true;
    return (0, p.jsxs)(W, {
      children: [
        (0, p.jsx)(ot, {
          errorText: failed ? resultText : void 0,
          output: !failed && (0, p.jsx)(He, {content: resultText ?? ''}),
          state,
        }),
        failed && canOpenSettings && renderMcpSettingsLink
          ? (0, p.jsxs)('div', {
              className: 'flex items-center justify-between gap-2 px-2 py-1',
              children: [
                (0, p.jsx)('p', {
                  className: 'text-muted-foreground text-xs',
                  children: 'Reconnect or refresh this server in MCP settings.',
                }),
                renderMcpSettingsLink(props),
              ],
            })
          : null,
      ],
    });
  },
  /** MCP tools. */
  fp = {...Ri, expandedContent: McpResult, summaryKind: 'mcp'},
  /** Memory search results that open the memory file. */
  MemorySearchCard = props => {
    const {openMemoryFile} = Ke();
    return (0, p.jsx)(Ga, {details: props.details, onOpenMemoryFile: openMemoryFile, state: props.state});
  },
  /** The memory_search tool. */
  mp = {
    expandedContent: MemorySearchCard,
    summaryKind: 'search',
  },
  /** The message_agent tool: the message sent, or the agents listed. */
  pp = {
    expandedContent: ({args, resultText, state}) =>
      (0, p.jsx)(W, {
        children: (0, p.jsx)(ot, {
          errorText: Ne(state) ? resultText : void 0,
          output: (0, p.jsx)(He, {content: args.action === 'list' ? (resultText ?? '') : String(args.message ?? '')}),
          state,
        }),
      }),
    standalone: ({args}) => args.action !== 'list',
  },
  /** A notification as it shows on the desktop. */
  NotificationCard = ({args}) => {
    const title = typeof args.title == 'string' ? args.title : 'Notification',
      message = typeof args.message == 'string' ? args.message : '';
    return (0, p.jsxs)('div', {
      className:
        'text-muted-foreground bg-secondary/50 inset-ring-muted flex h-18 max-w-[340px] items-center gap-3 rounded-xl p-2 px-3 text-sm shadow-lg inset-ring-[0.5px]',
      children: [
        (0, p.jsx)('div', {
          className: 'h-8 w-8 shrink-0 rounded-md bg-background',
          children: (0, p.jsx)(ta, {className: 'm-0.5 size-7 text-foreground'}),
        }),
        (0, p.jsxs)('div', {
          className: 'text-primary/90 font-system flex min-w-0 flex-1 flex-col text-[13px] tracking-tight',
          children: [
            (0, p.jsx)('p', {className: 'font-semibold', children: title}),
            message && (0, p.jsx)('p', {className: 'line-clamp-2 leading-[16px]', children: message}),
          ],
        }),
      ],
    });
  },
  /** The notification tool. */
  vp = {expandedContent: NotificationCard, standalone: true},
  /** Text a REPL script types into a page. */
  TYPED_TEXT = /\.(fill|type|pressSequentially|insertText)\(\s*(["'`])(?:\\[\s\S]|(?!\2)[\s\S])*?\2/gs;
/** A REPL script with the text it types redacted. */
function redactTypedText(code) {
  return code.replace(TYPED_TEXT, (match, method, quote) => `.${method}(${quote}[redacted]${quote}`);
}
var /** A REPL script and its output, with its time and token count on hover. */
  ReplCard = ({args, resultText, details}) => {
    const pending = !resultText,
      {elapsedMs} = details ?? {},
      code = args.code ?? '',
      shown = redactTypedText(code),
      output = resultText ?? '';
    return (0, p.jsx)(W, {
      className: 'group/repl-tool gap-0 p-0',
      children: (0, p.jsx)('div', {
        className: 'flex flex-col text-xs',
        children: (0, p.jsxs)('div', {
          className: 'max-h-40 grow overflow-auto whitespace-pre-wrap',
          children: [
            (0, p.jsxs)('div', {
              className: 'relative flex gap-2 p-2',
              children: [
                (0, p.jsx)('span', {className: 'text-muted-foreground select-none', children: '>'}),
                (0, p.jsx)('div', {
                  className: 'min-w-0 flex-1',
                  children: (0, p.jsx)(He, {className: 'text-primary max-h-none overflow-visible', content: shown}),
                }),
                elapsedMs &&
                  (0, p.jsxs)('small', {
                    className:
                      'text-muted-foreground/60 absolute top-2 right-2 text-xs opacity-0 transition-opacity group-hover/repl-tool:opacity-100',
                    children: [
                      elapsedMs.toFixed(0),
                      'ms',
                      ' ⋅ ',
                      Math.ceil((output.length + shown.length) / 4),
                      ' tokens',
                    ],
                  }),
              ],
            }),
            !pending &&
              output &&
              (0, p.jsx)(rn, {
                className: 'max-h-none overflow-visible p-2 pt-0',
                content: output,
                expandLabel: 'Show full code',
              }),
          ],
        }),
      }),
    });
  },
  /** A REPL step generating an image. */
  isGeneratingImage = ({call, state}) =>
    state === 'loading' && typeof call.arguments.code == 'string' && call.arguments.code.includes('imagegen.generate('),
  /** The placeholder an image takes while it generates. */
  ImageGenerationPlaceholder = () => {
    const reducedMotion = Gs();
    return (0, p.jsxs)('div', {
      'aria-hidden': true,
      className:
        'bg-web-content-background dark:bg-secondary/50 corner-shape-initial! relative mt-2 aspect-square w-full max-w-[min(20rem,100%)] overflow-hidden rounded-xl',
      children: [
        (0, p.jsx)(oe, {className: 'absolute inset-0 rounded-none opacity-60'}),
        (0, p.jsx)(pn.div, {
          animate: reducedMotion ? void 0 : {rotate: 360, scale: [0.92, 1.08, 0.92]},
          className: 'absolute -inset-1/3 blur-3xl',
          style: {
            background:
              'conic-gradient(from 40deg, transparent 0deg, color-mix(in oklch, var(--color-brand) 24%, transparent) 80deg, transparent 160deg, color-mix(in oklch, var(--color-chart-3) 18%, transparent) 250deg, transparent 330deg)',
          },
          transition: {duration: 12, ease: 'linear', repeat: Number.POSITIVE_INFINITY},
        }),
        (0, p.jsx)(pn.div, {
          animate: reducedMotion ? void 0 : {backgroundPosition: ['0px 0px', '14px 14px'], opacity: [0.18, 0.42, 0.18]},
          className: 'absolute inset-[7%]',
          style: {
            backgroundImage:
              'radial-gradient(circle, color-mix(in oklch, var(--color-foreground) 42%, transparent) 0 0.8px, transparent 1px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(ellipse at 47% 48%, black 8%, transparent 72%)',
          },
          transition: {duration: 4, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY},
        }),
        (0, p.jsx)(pn.div, {
          animate: reducedMotion ? void 0 : {x: ['-160%', '320%']},
          className:
            'absolute -inset-y-1/4 w-2/5 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent blur-xl dark:via-white/6',
          transition: {duration: 3.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.8},
        }),
        (0, p.jsx)('div', {
          className: 'ring-foreground/10 pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset',
        }),
      ],
    });
  },
  /** The repl tool. */
  xp = {
    footer: step => (isGeneratingImage(step) ? (0, p.jsx)(ImageGenerationPlaceholder, {}) : null),
    expandMode: 'manual',
    expandedContent: ReplCard,
    standalone: isGeneratingImage,
    summaryKind: ({call: step}) => (vi(step.arguments) === 'code' ? 'command' : 'browser'),
  },
  /** The routine limit notice under a failed routine step. */
  RoutineLimitNotice = step =>
    Ne(step.state) && mo(step.resultText ?? '')
      ? (0, p.jsx)(W, {
          className: 'px-2.5 py-2',
          children: (0, p.jsx)('p', {
            className: 'text-muted-foreground text-sm',
            children: 'You’ve reached the routine limit. Pause or remove a routine to run another.',
          }),
        })
      : null,
  /** The routine_update tool. */
  qr = {expandedContent: null, expandMode: 'none', footer: RoutineLimitNotice, standalone: true}
