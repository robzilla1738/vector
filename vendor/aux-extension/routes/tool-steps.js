/* Aux-owned source, tool definitions pass 3 (assets/tool-definition-registry-Cc6FCFb2.js, from browse
 * classification to the step icon): what a REPL step does and to which apps (read, search, send,
 * create, update), a routine's fields from its result, details and arguments, skill names in words,
 * the tool runtime context the hosts fill in (file and routine links, MCP and subagent icons), the
 * subagent tool definitions, a tool step's title (its summary with file and routine links and diff
 * stats) and its icon (symbol, file type, MCP server, favicon with a fallback, subagent).
 * The bundled diff renderer after it stays supplied.
 * Names the rest of the chunk uses keep their chunk names: Cg classifyBrowse, fl routineMode, ml
 * routineFields, gl routineSchedule, _l/bl routine verbs, Cl skillName, xg ToolRuntimeProvider, Ke
 * useToolRuntime, Ll/wl the subagent tool definitions, kl StepTitle, Tl StepIcon.
 * Chunk names used: p JSX runtime, j React, qe cn, Kr markdown, qs shimmer text, Ws Badge, mi the
 * subagent mark, ra the file type icon, pa the MCP icon, the first pass's icons, and the second
 * pass's tl, dl, ho, jn, vi and po. */
/** What a REPL step does (read, search, send, create, update, browse or other) and to which apps. */
function Cg(repl) {
  const icon = vi(repl),
    code = po(repl.code ?? ''),
    targets = [...new Set(jn.filter(({pattern: entry}) => entry.test(code)).map(({target: entry}) => entry))];
  if (targets.length === 0)
    return {target: icon === 'code' ? 'code' : 'the web', action: icon === 'code' ? 'other' : 'browse'};
  const target = targets.length > 2 ? 'apps' : targets.join(' and ');
  if (targets.length > 1) return {target, action: 'other'};
  const actions = new Set();
  for (const match of code.matchAll(/\b([\w$]+(?:\s*\.\s*[\w$]+)+)\s*\(/g)) {
    const callee = match[1].replace(/\s/g, '');
    if (/^(?:console|JSON|Object|Array|Math)\./.test(callee)) continue;
    const method = callee.split('.').at(-1);
    if (!/^(?:getClient|listAccounts|listWorkspaces)$/.test(method)) {
      if (!jn.some(app => app.target === target && app.pattern.test(`${callee}(`))) {
        actions.add('other');
        continue;
      }
      /\.search(?:\.|$)/i.test(callee)
        ? actions.add('search')
        : /^(?:sendDm|sendMessage|postMessage|tweet|reply)$/.test(method)
          ? actions.add('send')
          : /^(?:createPage|createDatabase|addNew|create)$/.test(method)
            ? actions.add('create')
            : /^(?:updatePage|update|addFromMarkdown|append|set)$/.test(method)
              ? actions.add('update')
              : /^(?:get[A-Z]\w*|list|history|replies|info|retrieve|read\w*)$/.test(method)
                ? actions.add('read')
                : actions.add('other');
    }
  }
  return {target, action: actions.size === 1 ? [...actions][0] : 'other'};
}
var /** A routine_update call's mode. */
  fl = args => {
    const mode = args.mode;
    return mode === 'create' || mode === 'update' || mode === 'delete' ? mode : 'view';
  },
  /** The routine a result's details carry. */
  routineDetails = ({details: step}) =>
    isObject(step)
      ? {
          routine: routineFromDetails(step.routine),
          routineId: stringOrUndefined(step.routineId),
          name: stringOrUndefined(step.name),
        }
      : {},
  /** A routine's fields: its details, then its arguments, then its result text. */
  ml = step => {
    const fromDetails = routineDetails(step),
      text = step.resultText ?? '';
    return {
      id:
        fromDetails.routine?.id ?? fromDetails.routineId ?? stringOrUndefined(step.args.id) ?? resultField(text, 'id'),
      name:
        fromDetails.routine?.name ?? fromDetails.name ?? stringOrUndefined(step.args.name) ?? resultField(text, 'name'),
      scheduleKind:
        fromDetails.routine?.scheduleKind ?? scheduleKindOf(step.args.scheduleKind) ?? resultScheduleKind(text),
      rrule: fromDetails.routine?.rrule ?? stringOrUndefined(step.args.rrule) ?? resultField(text, 'rrule'),
      runAt: fromDetails.routine?.runAt ?? stringOrUndefined(step.args.runAt) ?? resultField(text, 'runAt'),
      nextRunAt: fromDetails.routine?.nextRunAt ?? resultField(text, 'nextRunAt'),
      timezone: fromDetails.routine?.timezone ?? stringOrUndefined(step.args.timezone) ?? resultField(text, 'timezone'),
    };
  },
  /** A routine from details. */
  routineFromDetails = routine => {
    if (isObject(routine))
      return {
        id: stringOrUndefined(routine.id),
        name: stringOrUndefined(routine.name),
        scheduleKind: scheduleKindOf(routine.scheduleKind),
        rrule: stringOrUndefined(routine.rrule),
        runAt: stringOrUndefined(routine.runAt),
        nextRunAt: stringOrUndefined(routine.nextRunAt),
        timezone: stringOrUndefined(routine.timezone),
      };
  },
  /** A routine's schedule in words, when it has one. */
  gl = routine => {
    if (
      !(!routine.scheduleKind && !routine.rrule) &&
      !(routine.scheduleKind === 'recurring' && !routine.rrule) &&
      !(routine.scheduleKind === 'once' && !(routine.runAt || routine.nextRunAt))
    )
      return tl(routine);
  },
  /** A `key: value` line in a result. */
  resultField = (text, key) => {
    const prefix = `${key}: `;
    return text
      .split(/\r?\n/)
      .find(line => line.startsWith(prefix))
      ?.slice(prefix.length);
  },
  /** The schedule kind in a result. */
  resultScheduleKind = text => scheduleKindOf(resultField(text, 'scheduleKind')),
  /** A string, or undefined. */
  stringOrUndefined = value => (typeof value == 'string' ? value : void 0),
  /** once or recurring, or undefined. */
  scheduleKindOf = value => {
    if (value === 'once' || value === 'recurring') return value;
  },
  /** Any object. */
  isObject = value => !!(value && typeof value == 'object'),
  /** A routine mode while it runs. */
  _l = mode =>
    mode === 'create' ? 'Creating' : mode === 'update' ? 'Updating' : mode === 'delete' ? 'Deleting' : 'Viewing',
  /** A routine mode once done. */
  bl = mode =>
    mode === 'create' ? 'Created' : mode === 'update' ? 'Updated' : mode === 'delete' ? 'Deleted' : 'Viewed',
  /** Words a skill name keeps in capitals. */
  UPPERCASE_WORDS = new Set(['API', 'CSV', 'DOCX', 'HTML', 'PDF', 'PPTX', 'URL', 'XLSX']),
  /** A skill's name in words: its own name, or its folder name title-cased. */
  Cl = ({name, path}) => {
    const base = path.endsWith('.md') ? path.replace(/\.md$/, '') : path,
      trimmed = name?.trim();
    if (trimmed && trimmed !== base && trimmed !== path && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) return trimmed;
    const words = trimmed || base;
    return words === 'x-twitter'
      ? 'X / Twitter'
      : words
          .split('-')
          .map(word =>
            UPPERCASE_WORDS.has(word.toUpperCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1),
          )
          .join(' ');
  },
  /** What the hosts give the tool steps: link and icon renderers. */
  ToolRuntimeContext = (0, j.createContext)({}),
  /** Provides the tool runtime. */
  xg = ({children, runtime}) => (0, p.jsx)(ToolRuntimeContext, {value: runtime, children}),
  /** The tool runtime. */
  Ke = () => (0, j.useContext)(ToolRuntimeContext),
  /** Draws the fallback when the subagent icon throws. */
  SubagentIconBoundary = class extends j.Component {
    state = {hasError: false};
    static getDerivedStateFromError() {
      return {hasError: true};
    }
    render() {
      return this.state.hasError ? this.props.fallback : this.props.children;
    }
  },
  /** A subagent step's icon. */
  SubagentIcon = props =>
    (0, p.jsx)(SubagentIconBoundary, {
      fallback: (0, p.jsx)(mi, {color: 'mono', className: 'size-4 shrink-0'}),
      children: (0, p.jsx)(RuntimeSubagentIcon, {...props}),
    }),
  /** The host's subagent icon, or the subagent mark. */
  RuntimeSubagentIcon = props => Ke().renderSubagentIcon?.(props) ?? (0, p.jsx)(mi, {className: 'size-4 shrink-0'}),
  /** The subagent tool: only spawns and resumes show. */
  Ll = {
    expandMode: 'none',
    expandedContent: null,
    hide: ({args}) => !['spawn', 'resume'].includes(typeof args.action == 'string' ? args.action : ''),
    standalone: true,
  },
  /** The subagent_wait tool: hidden. */
  wl = {
    expandedContent: null,
    hide: () => true,
    standalone: true,
  },
  /** A tool step's title: its summary, links drawn by the host, diff stats and an error badge. */
  kl = props => {
    const {renderFileLink, renderRoutineLink} = Ke(),
      summary = ho({call: props.call, result: props.result, isStreaming: props.state === 'loading'}),
      {action, detail, diffStats} = summary,
      isFileChange = props.result && (props.call.name === 'write_file' || props.call.name === 'edit_file'),
      stopPropagation = event => event.stopPropagation(),
      text = (0, p.jsxs)(p.Fragment, {
        children: [
          action &&
            (0, p.jsxs)('span', {className: 'shrink-0 whitespace-nowrap', children: [action, detail ? ' ' : '']}),
          detail &&
            (0, p.jsx)('span', {
              className: qe('min-w-0 truncate', isFileChange && 'group-aria-expanded/accordion-trigger:hidden'),
              children: detail.includes('](#aux-')
                ? (0, p.jsx)(Kr, {
                    mode: 'static',
                    remarkPlugins: [],
                    className:
                      'inline! size-auto! whitespace-nowrap! [&_a]:inline [&_a]:whitespace-nowrap [&_p]:inline',
                    controls: false,
                    urlTransform: url => (/^(#aux-file:|#aux-routine:|https?:)/.test(url) ? url : ''),
                    components: {
                      p: ({children: event}) => (0, p.jsx)(p.Fragment, {children: event}),
                      a: ({href: event = '', children}) => {
                        if (event.startsWith('#aux-file:')) {
                          const path = decodeURIComponent(event.slice('#aux-file:'.length));
                          return (
                            renderFileLink?.(path, children, !isFileChange) ??
                            (0, p.jsx)('span', {
                              className:
                                'text-brand-content/80 group-hover/accordion-trigger:text-brand-content decoration-brand/20 no-underline decoration-dotted underline-offset-2 hover:underline',
                              title: path,
                              children,
                            })
                          );
                        }
                        if (event.startsWith('#aux-routine:')) {
                          const id = decodeURIComponent(event.slice('#aux-routine:'.length));
                          return renderRoutineLink?.(id, children) ?? (0, p.jsx)('span', {children});
                        }
                        return (0, p.jsx)('a', {
                          href: event,
                          target: '_blank',
                          rel: 'noreferrer',
                          onClick: stopPropagation,
                          children,
                        });
                      },
                    },
                    children: detail,
                  })
                : dl({...summary, action: void 0}),
            }),
        ],
      });
    return (0, p.jsxs)('span', {
      className: 'inline-flex max-w-full min-w-0 items-center gap-2',
      children: [
        props.state === 'loading'
          ? (0, p.jsx)(qs, {
              as: 'span',
              className: 'inline-flex! min-w-0 items-baseline gap-1 [&_*]:text-transparent!',
              children: text,
            })
          : (0, p.jsx)('span', {className: 'inline-flex min-w-0 items-baseline gap-1', children: text}),
        diffStats &&
          (0, p.jsxs)('span', {
            className: 'flex shrink-0 gap-2 group-aria-expanded/accordion-trigger:hidden',
            children: [
              (0, p.jsxs)('span', {className: 'text-green-500', children: ['+', diffStats.addedLines]}),
              (0, p.jsxs)('span', {className: 'text-rose-500', children: ['-', diffStats.removedLines]}),
            ],
          }),
        props.state === 'error' && (0, p.jsx)(Ws, {variant: 'secondary', size: 'sm', children: 'Error'}),
      ],
    });
  },
  /** The icon for each symbol name. */
  SYMBOL_ICONS = {
    tool: Ai,
    terminal: Ea,
    code: xa,
    browser: Ai,
    click: La,
    type: Ta,
    scroll: Ia,
    screenshot: ya,
    tab: fa,
    search: ma,
    history: ha,
    memory: la,
    skill: Ys,
    edit: Zs,
    subagent: mi,
    routine: ea,
    notification: ia,
    question: da,
    confirmation: Qs,
    todo: Ca,
    clock: ua,
    email: wa,
    google: Xs,
    slack: Pa,
    notion: Da,
    linkedin: Ra,
    x: oa,
    message: ka,
    user: Sa,
    agents: sa,
  },
  /** A tool step's icon. */
  Tl = props => {
    const runtime = Ke(),
      {icon} = ho({call: props.call, result: props.result, isStreaming: props.state === 'loading'});
    if (icon.type === 'mcp') return runtime.renderMcpIcon?.(props) ?? (0, p.jsx)(pa, {className: 'size-4 opacity-55'});
    if (icon.type === 'file') return (0, p.jsx)(ra, {extension: icon.extension, className: 'size-4 opacity-55'});
    if (icon.type === 'image') return (0, p.jsx)(ImageIcon, {icon}, icon.url);
    if (icon.name === 'subagent') return (0, p.jsx)(SubagentIcon, {...props});
    const Icon = SYMBOL_ICONS[icon.name];
    return (0, p.jsx)(Icon, {className: 'size-4 opacity-55'});
  },
  /** An image icon that falls back to a symbol when it fails to load. */
  ImageIcon = ({icon}) => {
    const [failed, setFailed] = (0, j.useState)(false),
      Fallback = SYMBOL_ICONS[icon.fallback],
      fail = () => setFailed(true);
    return failed
      ? (0, p.jsx)(Fallback, {className: 'size-4 opacity-55'})
      : (0, p.jsx)('img', {
          src: icon.url,
          alt: '',
          loading: 'lazy',
          className: 'size-4 rounded-[3px] object-contain',
          onError: fail,
        });
  };
