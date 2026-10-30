/* Aux-owned source, tool definitions pass 5 (assets/tool-definition-registry-Cc6FCFb2.js, from after the
 * embedded Aux mark to the end of the module body): the Aux Code handoff card, the web fetch card
 * (citation marker dropped), web search results (and the partial results of an output too large), the
 * to-do list card and its status icons, the tool definitions by tool name, and the registry the hosts
 * call: a tool's definition with its title and icon, a step's view of a call and its result, and
 * rendering a definition's part.
 * Names the rest of the chunk uses keep their chunk names: kp CoderHandoffCard, Vp TodoStatusIcon,
 * Hg toolDefinition, Vg toolStepProps, Fg renderToolPart (all exported).
 * Chunk names used: p JSX runtime, j React, qe cn, wp the Aux mark (scripts/lib/provided-ui.mjs), ro the
 * handoff arrow, oe Skeleton, bt Button, eo/Qr/io the favicon avatar, to the external link, no the URL
 * host, na the partial JSON parser, Aa/aa/ca the spinner, check and cancelled icons, Js a result's text,
 * oo isPlainObject, and the earlier passes' cards and tool definitions. */
/** The card a start_coder step shows: handed off to Aux Code, the task title and its prompt. */
kp = ({title, prompt, status, onOpen}) =>
    (0, p.jsxs)('div', {
      className: qe(
        'relative -mx-2 flex min-w-0 flex-col gap-1.5 rounded-lg px-2 py-1.5',
        onOpen && 'hover:bg-muted dark:hover:bg-muted/50 transition-colors',
      ),
      children: [
        onOpen &&
          (0, p.jsx)('button', {
            type: 'button',
            'aria-label': `Open ${title || 'Aux Code'}`,
            className: 'focus-visible:ring-ring/50 absolute inset-0 rounded-lg outline-none focus-visible:ring-2',
            onClick: onOpen,
          }),
        (0, p.jsxs)('span', {
          className: 'text-muted-foreground flex w-full min-w-0 items-center gap-1.5 text-sm',
          children: [
            (0, p.jsx)(ro, {className: 'size-4 shrink-0'}),
            (0, p.jsx)('span', {className: 'shrink-0', children: 'Handed off to'}),
            (0, p.jsx)(wp, {className: 'text-foreground'}),
            (0, p.jsx)('span', {className: 'text-foreground -ml-0.5 shrink-0 font-medium', children: 'Aux Code'}),
            title &&
              (0, p.jsxs)(p.Fragment, {
                children: [
                  (0, p.jsx)('span', {children: '·'}),
                  (0, p.jsx)('span', {className: 'text-foreground min-w-0 truncate', children: title}),
                ],
              }),
            status && (0, p.jsx)('span', {className: 'relative ml-auto flex shrink-0', children: status}),
          ],
        }),
        prompt &&
          (0, p.jsx)('span', {
            className:
              'border-border text-muted-foreground ml-[7px] line-clamp-2 border-l-2 pl-3 text-[13px] leading-5',
            children: prompt,
          }),
      ],
    }),
  /** A start_coder result: the host's coder card, or the handoff card. */
  CoderHandoff = ({args, details, resultText, state}) => {
    const {renderCoderCard} = Ke();
    if (Ne(state)) return (0, p.jsx)(W, {children: (0, p.jsx)(ot, {errorText: resultText, state})});
    const handoff = {
      taskId: typeof details?.taskId == 'string' ? details.taskId : void 0,
      title: String(details?.title ?? args.description ?? ''),
      prompt: String(args.prompt ?? ''),
    };
    return renderCoderCard?.(handoff) ?? (0, p.jsx)(kp, {title: handoff.title, prompt: handoff.prompt});
  },
  /** The start_coder tool. */
  START_CODER_TOOL = {
    bare: ({state}) => !Ne(state),
    expandMode: 'force-open',
    expandedContent: CoderHandoff,
    standalone: true,
  },
  /** The citation marker a web fetch result starts with. */
  CITATION_PREFIX = /^<webfetch-citation source_id="[^"]+"><\/webfetch-citation>\s*/,
  /** A web fetch result without its citation marker. */
  stripCitation = text => text.replace(CITATION_PREFIX, ''),
  /** A fetched page's content. */
  WebfetchCard = ({resultText, args, state}) => {
    const isText = args.format === 'text',
      content = resultText && stripCitation(resultText);
    return state === 'loading'
      ? (0, p.jsx)(W, {
          children: (0, p.jsxs)('div', {
            className: 'space-y-2.5 px-1 py-1.5',
            children: [
              (0, p.jsx)(oe, {className: 'h-4 w-full'}),
              (0, p.jsx)(oe, {className: 'h-4 w-80'}),
              (0, p.jsx)(oe, {className: 'h-4 w-60'}),
            ],
          }),
        })
      : content
        ? (0, p.jsx)(W, {
            className: 'p-0',
            children: (0, p.jsx)('div', {
              className: qe('scroll-fade-effect-y max-h-50 overflow-auto text-sm', !isText && 'p-3'),
              children: (0, p.jsx)(rn, {content}),
            }),
          })
        : (0, p.jsx)(W, {
            className: 'px-2.5 py-2',
            children: (0, p.jsx)('p', {className: 'opacity-80', children: 'No content fetched'}),
          });
  },
  /** The webfetch tool. */
  WEBFETCH_TOOL = {
    expandMode: 'manual',
    expandedContent: WebfetchCard,
    summaryKind: 'search',
  },
  /** The partial JSON parser. */
  partialJson = na(),
  /** Web search results, or what can be read of an output too large to return. */
  parseSearchResults = text => {
    try {
      return JSON.parse(text);
    } catch {}
    if (!text.startsWith('[Output too large')) return null;
    const start = text.indexOf('{');
    if (start === -1) return null;
    try {
      const partial = (0, partialJson.parseJSON)(text.slice(start)),
        results = partial.results?.flatMap(result => (result?.url ? [{...result, url: result.url}] : [])) ?? [];
      return {search_id: partial.search_id ?? '', results, truncated: true};
    } catch {
      return null;
    }
  },
  /** Web search results: favicon, title and host. */
  WebsearchCard = ({resultText = '', state}) => {
    const parsed = (0, j.useMemo)(() => parseSearchResults(resultText), [resultText]);
    return state === 'loading'
      ? (0, p.jsx)(W, {
          children: (0, p.jsxs)('div', {
            className: 'max-w-[400px] space-y-1.5 px-1 py-1.5',
            children: [
              (0, p.jsxs)('div', {
                className: 'flex items-center gap-2',
                children: [(0, p.jsx)(oe, {className: 'size-3 min-w-3'}), (0, p.jsx)(oe, {className: 'h-1.5 w-full'})],
              }),
              (0, p.jsxs)('div', {
                className: 'flex items-center gap-2 opacity-75',
                children: [
                  (0, p.jsx)(oe, {className: 'size-3 min-w-3'}),
                  (0, p.jsx)(oe, {className: 'h-1.5 w-full max-w-80'}),
                ],
              }),
              (0, p.jsxs)('div', {
                className: 'flex items-center gap-2 opacity-50',
                children: [
                  (0, p.jsx)(oe, {className: 'size-3 min-w-3'}),
                  (0, p.jsx)(oe, {className: 'h-1.5 w-full max-w-60'}),
                ],
              }),
            ],
          }),
        })
      : parsed
        ? parsed.results.length
          ? (0, p.jsxs)(W, {
              className: 'gap-0 p-0',
              children: [
                (0, p.jsx)('div', {
                  className: 'max-h-30 space-y-1 overflow-y-auto px-1 py-1.5',
                  children: parsed.results.map(result =>
                    (0, p.jsxs)(
                      bt,
                      {
                        className: 'w-full items-center justify-start no-underline!',
                        nativeButton: false,
                        size: 'xs',
                        variant: 'ghost',
                        render: (0, p.jsx)(to, {to: result.url}),
                        children: [
                          (0, p.jsx)(eo, {
                            className: 'size-3.5 rounded-xs',
                            children: (0, p.jsx)(Qr, {
                              className: 'bg-transparent',
                              children: (0, p.jsx)(io, {url: result.url}),
                            }),
                          }),
                          (0, p.jsx)('p', {
                            className: 'text-primary m-0! grow truncate pr-4',
                            children: result.title ?? result.url,
                          }),
                          (0, p.jsx)('span', {
                            className: 'text-muted-foreground shrink-0 text-xs font-medium',
                            children: no(result.url),
                          }),
                        ],
                      },
                      result.url,
                    ),
                  ),
                }),
                parsed.truncated &&
                  (0, p.jsx)('div', {
                    className: 'text-muted-foreground px-2.5 pb-1.5 text-xs font-medium select-none',
                    children: 'Search result too large, saved as a file',
                  }),
              ],
            })
          : (0, p.jsx)(W, {
              className: 'px-2.5 py-2',
              children: (0, p.jsx)('p', {
                className: 'opacity-80',
                children: parsed?.truncated ? 'Search result large - truncated' : 'No search results found',
              }),
            })
        : (0, p.jsx)(W, {children: (0, p.jsx)(He, {content: resultText})});
  },
  /** The websearch tool. */
  WEBSEARCH_TOOL = {expandedContent: WebsearchCard, summaryKind: 'search'},
  /** A to-do's status icon. */
  Vp = ({status}) => {
    switch (status) {
      case 'pending':
        return (0, p.jsx)('div', {className: 'size-4 shrink-0 rounded-full border-2'});
      case 'in_progress':
        return (0, p.jsx)(Aa, {className: 'size-4 shrink-0 animate-spin text-green-500'});
      case 'completed':
        return (0, p.jsx)('div', {
          className: 'm-[1px] flex size-3.5 shrink-0 items-center justify-center rounded-full bg-green-500/20',
          children: (0, p.jsx)(aa, {className: 'size-2.5! text-green-500'}),
        });
      case 'cancelled':
        return (0, p.jsx)(ca, {className: 'text-border size-4 shrink-0'});
      default:
        return null;
    }
  },
  /** The to-do list. */
  TodosCard = ({args, resultText}) => {
    const todos = Array.isArray(args.todos) ? args.todos : [];
    return (0, p.jsx)(W, {
      className: 'gap-0',
      children:
        todos.length > 0
          ? (0, p.jsx)(p.Fragment, {
              children: todos.map((todo, index) =>
                (0, p.jsxs)(
                  'div',
                  {
                    className: 'flex items-center gap-1.5 rounded-md p-1',
                    children: [
                      (0, p.jsx)('div', {
                        className: 'flex size-5 items-center justify-center',
                        children: (0, p.jsx)(Vp, {status: todo.status}),
                      }),
                      (0, p.jsx)('p', {className: 'text-primary truncate text-sm', children: todo.content}),
                    ],
                  },
                  todo.id || `${todo.status}:${todo.content}:${index}`,
                ),
              ),
            })
          : (0, p.jsx)(He, {content: resultText || '-'}),
    });
  },
  /** The write_todos tool: its summary only. */
  WRITE_TODOS_TOOL = {
    hide: () => true,
    expandedContent: TodosCard,
    expandMode: 'manual',
  },
  /** The tool definitions by tool name. */
  TOOL_DEFINITIONS = {
    request_action_confirmation: Ka,
    ask_user_question: Ya,
    bash: Ua,
    bash_interact: Ba,
    browsing_history_search: Wr,
    edit_file: sp,
    get_time: ap,
    history_read: cp,
    history_search: Wr,
    memory_search: mp,
    message_agent: pp,
    notification: vp,
    read_file: rp,
    repl: xp,
    routine_update: qr,
    'routine.update': qr,
    start_coder: START_CODER_TOOL,
    subagent: Ll,
    subagent_wait: wl,
    webfetch: WEBFETCH_TOOL,
    websearch: WEBSEARCH_TOOL,
    write_file: op,
    write_todos: WRITE_TODOS_TOOL,
  },
  /** A tool's definition, with its step title and icon. */
  Hg = name => ({
    ...(TOOL_DEFINITIONS[name] ?? (name.startsWith('mcp__') ? fp : Ri)),
    title: kl,
    icon: Tl,
  }),
  /** What a tool step's parts get from a call and its result. */
  Vg = (call, result, options) => {
    const streaming = options?.isStreaming ?? !result;
    return {
      call,
      args: call.arguments ?? {},
      result,
      resultText: result ? Js(result) : '',
      state: result
        ? result.isError
          ? 'error'
          : 'idle'
        : options?.isSuspended
          ? 'suspended'
          : streaming
            ? 'loading'
            : 'idle',
      details: oo(result?.details) ? result.details : void 0,
      sessionId: options?.sessionId,
    };
  },
  /** A definition's part rendered, when it has one. */
  Fg = (Component, props) => (Component ? (0, j.createElement)(Component, props) : null);
