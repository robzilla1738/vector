/* Aux-owned source, tool definitions pass 2 (assets/tool-definition-registry-Cc6FCFb2.js, from the
 * tool state helpers after the bundled strip-ansi to the step summaries): the tool state labels, the
 * card a tool's details sit in, terminal output (sticks to the bottom, long output truncated), the
 * terminal and terminal-input cards, memory search result chips with their excerpt popovers, the
 * output section, the action review and question cards, a routine's schedule in words (event
 * triggers, one-off runs, RRULE recurrences), and each tool's step summary (action, detail, icon,
 * diff stats) with the markdown links a summary carries.
 * The isPlainObject helper and bundled strip-ansi before it stay supplied, and so does the rest of
 * the chunk for now: browse classification and step rows (pass 3), the tool cards (pass 4), and the
 * bundled syntax highlighter and diff renderer, which stay supplied.
 * Names the rest of the chunk uses keep their chunk names: Ne isErrorState, bg resultImages, W ToolCard,
 * pi useStickToBottom, He OutputPre, rn TruncatedOutput, Ua/Ba the terminal tool definitions, Ga
 * MemorySearchResults, yg FILE_LINK_CLASS, ot OutputSection, Ka/Ya the action review and question
 * tool definitions, tl scheduleLabel, dl plainSummary, ho summarizeStep, cl skillFromRead, Bt/gi diff
 * stats, mo isRoutineLimitError, jn APP_PATTERNS, vi replIcon, po stripStringsAndComments.
 * Chunk names used: p JSX runtime, j React, qe cn, Kr markdown, Ii file icon, bt Button, Xr/Zr/Jr
 * the hover card root, trigger and popup, Yr ScrollArea, zt dayjs, ro the answer arrow icon, oo
 * isPlainObject, Na stripAnsi, and pass 3's fl/ml/gl/_l/bl routine helpers and Cl skillName. */
var /** A tool call still running. */
  isLoadingState = state => state === 'loading',
  /** A tool call that failed. */
  Ne = state => state === 'error',
  /** Terminal output without ANSI codes, CRs or the still-running marker. */
  cleanTerminalOutput = output =>
    Na(output)
      .replaceAll(
        `\r
`,
        `
`,
      )
      .replaceAll('\r', '')
      .replace(/^\[session \d+ still running\]\n?/gm, ''),
  /** The images in a tool result. */
  bg = result => (result?.content ?? []).filter(part => part.type === 'image'),
  /** A tool state in words. */
  stateLabel = state =>
    state === 'suspended' ? 'Waiting for input' : isLoadingState(state) ? 'Running' : Ne(state) ? 'Error' : 'Done',
  /** The answers in an ask_user_question result, by question header. */
  parseQuestionAnswers = text => {
    const lines = text.split(/\r?\n/),
      start = lines.findIndex(line => line.trim() === 'User responses to asked questions:');
    if (start === -1) return new Map();
    const answers = new Map();
    for (const line of lines.slice(start + 1)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('- ')) continue;
      const colon = trimmed.indexOf(': ');
      if (colon === -1) continue;
      const header = trimmed.slice(2, colon).trim(),
        answer = trimmed
          .slice(colon + 2)
          .trim()
          .replace(/^custom: /, '');
      header.length > 0 && answers.set(header, answer);
    }
    return answers;
  },
  /** Characters of output shown before "Show full output". */
  OUTPUT_LIMIT = 8e3,
  /** The card a tool's details sit in. */
  W = ({children, className, ...props}) =>
    (0, p.jsx)('div', {
      className: qe(
        'bg-surface-primary ring-border-surface-strong flex flex-col gap-2 rounded-lg p-1.5 shadow-xs ring-[0.5px] contain-[layout_paint]',
        className,
      ),
      ...props,
      children,
    }),
  /** A ref whose element keeps scrolled to the bottom as `content` grows. */
  pi = content => {
    const ref = (0, j.useRef)(null);
    return (
      (0, j.useLayoutEffect)(() => {
        const element = ref.current;
        if (!element) return;
        const scroll = () => element.scrollTo({top: element.scrollHeight});
        scroll();
        const frame = requestAnimationFrame(scroll),
          observer = new ResizeObserver(scroll);
        return (
          observer.observe(element),
          () => {
            (cancelAnimationFrame(frame), observer.disconnect());
          }
        );
      }, [content]),
      ref
    );
  },
  /** Preformatted tool output. */
  He = ({content, className}) =>
    (0, p.jsx)('pre', {
      className: qe(
        'text-muted-foreground max-h-96 overflow-x-auto overflow-y-auto font-mono text-xs whitespace-pre-wrap',
        className,
      ),
      children: content,
    }),
  /** Output cut at `limit` characters until the reader asks for all of it. */
  rn = ({className, content, expandLabel = 'Show full output', limit = OUTPUT_LIMIT}) => {
    const [expanded, setExpanded] = (0, j.useState)(false),
      truncated = content.length > limit && !expanded,
      shown = truncated
        ? `${content.slice(0, limit).trimEnd()}

...`
        : content;
    return (0, p.jsxs)(p.Fragment, {
      children: [
        (0, p.jsx)(He, {className, content: shown}),
        truncated &&
          (0, p.jsx)('div', {
            className: 'p-1',
            children: (0, p.jsx)(bt, {
              variant: 'secondary',
              size: 'xs',
              onClick: () => setExpanded(true),
              children: expandLabel,
            }),
          }),
      ],
    });
  },
  isRunningState = state => state === 'loading',
  /** A terminal command and its output. */
  BashCard = ({args, resultText, state}) => {
    const command = String(args.command ?? '-'),
      output = cleanTerminalOutput(resultText ?? '') || (isRunningState(state) ? 'Waiting for tool result...' : '-'),
      scrollRef = pi(output);
    return (0, p.jsx)(W, {
      className: 'gap-0 p-0',
      children: (0, p.jsxs)('div', {
        className: 'flex flex-col font-mono text-xs',
        children: [
          (0, p.jsx)('div', {
            className: 'flex shrink-0 items-center p-2 pb-0',
            children: (0, p.jsx)('p', {
              className: 'text-accent-foreground font-mono text-xs',
              children: `$ ${command}`,
            }),
          }),
          (0, p.jsx)('div', {
            className: 'text-muted-foreground scroll-fade-effect-y max-h-20 grow overflow-auto p-2 whitespace-pre-wrap',
            ref: scrollRef,
            children: (0, p.jsx)(rn, {className: 'max-h-none overflow-visible', content: output}),
          }),
        ],
      }),
    });
  },
  /** The bash tool. */
  Ua = {
    expandedContent: BashCard,
    expandMode: 'manual',
    summaryKind: 'command',
  },
  /** What a bash_interact call sent and the output since. */
  BashInteractCard = ({args, resultText, state}) => {
    const action =
        [
          args.resize && `resize ${JSON.stringify(args.resize)}`,
          args.input !== void 0 && `write ${JSON.stringify(args.input)}`,
          args.signal && `signal ${String(args.signal)}`,
        ]
          .filter(Boolean)
          .join(', ') || `poll ${String(args.exec_session_id ?? '')}`,
      output = cleanTerminalOutput(resultText ?? '') || (isRunningState(state) ? 'Waiting for tool result...' : '-'),
      scrollRef = pi(output);
    return (0, p.jsx)(W, {
      className: 'gap-0 p-0',
      children: (0, p.jsxs)('div', {
        className: 'flex flex-col font-mono text-xs',
        children: [
          (0, p.jsx)('div', {
            className: 'flex shrink-0 items-center p-2 pb-0',
            children: (0, p.jsx)('p', {className: 'text-accent-foreground font-mono text-xs', children: `$ ${action}`}),
          }),
          (0, p.jsx)('div', {
            className: 'text-muted-foreground scroll-fade-effect-y max-h-20 grow overflow-auto p-2 whitespace-pre-wrap',
            ref: scrollRef,
            children: (0, p.jsx)(rn, {className: 'max-h-none overflow-visible', content: output}),
          }),
        ],
      }),
    });
  },
  /** The bash_interact tool. */
  Ba = {
    expandedContent: BashInteractCard,
    expandMode: 'manual',
    summaryKind: 'command',
  },
  /** A memory file's path inside the memory folder. */
  memoryRelativePath = path => {
    const normalized = path.replaceAll('\\', '/'),
      at = normalized.lastIndexOf('/memory/');
    return at === -1 ? normalized : normalized.slice(at + 8);
  },
  /** Memory search results: a chip per result, its excerpt on hover. */
  Ga = ({details, state, onOpenMemoryFile}) => {
    const results = (0, j.useMemo)(
      () =>
        typeof details == 'object' && details !== null && 'results' in details && Array.isArray(details.results)
          ? details.results
          : [],
      [details],
    );
    return state === 'loading'
      ? null
      : details?.skipped === 'indexing'
        ? (0, p.jsx)('p', {
            className: 'text-muted-foreground',
            children: 'Memory setup or indexing is in progress. This search was skipped.',
          })
        : results.length === 0
          ? (0, p.jsx)('p', {className: 'text-muted-foreground', children: 'No results found'})
          : (0, p.jsx)(Yr, {
              className: '-mt-1 -ml-1 min-w-0 **:data-[slot=scroll-area-scrollbar]:hidden',
              effect: false,
              children: (0, p.jsx)('div', {
                className: 'flex w-max items-center gap-1',
                children: results.map(result =>
                  (0, p.jsxs)(
                    Xr,
                    {
                      disableHoverablePopup: false,
                      children: [
                        (0, p.jsx)(Zr, {
                          render: (0, p.jsxs)(bt, {
                            className: 'h-6.5 max-w-[200px] shrink-0 justify-start px-2',
                            size: 'sm',
                            type: 'button',
                            variant: 'secondary',
                            onClick: () => onOpenMemoryFile?.(result.path),
                            children: [
                              (0, p.jsx)(Ii, {className: 'text-muted-foreground size-3.5'}),
                              (0, p.jsx)('span', {
                                className: 'text-surface-primary-foreground truncate text-xs font-normal select-none',
                                children: result.title,
                              }),
                            ],
                          }),
                        }),
                        (0, p.jsxs)(Jr, {
                          className: 'flex max-w-72 flex-col p-0',
                          children: [
                            (0, p.jsx)('div', {
                              className: 'max-h-48 overflow-y-auto p-2.5',
                              children: (0, p.jsx)(Kr, {
                                className: 'prose-sm text-[13px] leading-5 font-normal',
                                children: result.excerpt,
                              }),
                            }),
                            (0, p.jsxs)('footer', {
                              className:
                                'text-muted-foreground flex w-full min-w-0 items-center gap-1 border-t px-2 py-1.5 text-xs',
                              children: [
                                (0, p.jsx)(Ii, {className: 'size-3.5 shrink-0'}),
                                (0, p.jsxs)('span', {
                                  className: 'truncate',
                                  children: [
                                    memoryRelativePath(result.path),
                                    (0, p.jsxs)('span', {
                                      className: 'shrink-0 tabular-nums',
                                      children: [':', result.line],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    },
                    result.chunkId,
                  ),
                ),
              }),
            });
  },
  /** A file link in a step summary. */
  yg =
    'text-brand-content/80 group-hover/accordion-trigger:text-brand-content decoration-brand/20 no-underline decoration-dotted underline-offset-2 hover:underline',
  /** A tool's output or error under a heading with its state. */
  ot = ({output, errorText, className, label = 'Output', state}) => {
    const failed = Ne(state);
    return !errorText && !output
      ? null
      : (0, p.jsxs)('div', {
          className,
          children: [
            (0, p.jsxs)('div', {
              className: 'flex items-center justify-between gap-2 px-2 py-1',
              children: [
                (0, p.jsx)('h5', {className: 'text-muted-foreground text-xs font-medium', children: label}),
                (0, p.jsx)('span', {
                  className: qe('text-muted-foreground text-xs font-medium', failed && 'text-destructive'),
                  children: errorText ? 'Error' : stateLabel(state),
                }),
              ],
            }),
            (0, p.jsx)('div', {
              className: 'max-h-48 overflow-auto px-2 py-1 [&_pre]:max-h-none [&_pre]:overflow-visible',
              children: errorText
                ? (0, p.jsx)('pre', {
                    className: 'text-muted-foreground font-mono text-xs whitespace-pre-wrap',
                    children: errorText,
                  })
                : output,
            }),
          ],
        });
  },
  /** The message of an action review request. */
  ActionReviewCard = ({args}) => {
    const review = (0, j.useMemo)(() => parseActionReview(args), [args]);
    return review
      ? (0, p.jsx)(W, {
          children: (0, p.jsx)('p', {
            className: 'text-foreground text-sm break-words whitespace-pre-wrap',
            children: review.message,
          }),
        })
      : (0, p.jsx)(W, {children: 'Action review request is missing a renderable artifact.'});
  },
  /** The request_action_confirmation tool. */
  Ka = {
    expandMode: 'manual',
    expandedContent: ActionReviewCard,
    standalone: true,
  };
/** An action review request, or null when it cannot be drawn. */
function parseActionReview(args) {
  const title = nonEmptyString(args.title),
    message = nonEmptyString(args.message),
    artifact = parseArtifact(args.artifact);
  return !title || !message || !artifact ? null : {title, message, artifact};
}
/** A review's artifact: a screenshot or plain data. */
function parseArtifact(value) {
  if (!isRecord(value)) return null;
  const type = nonEmptyString(value.type);
  if (!type) return null;
  if (type === 'screenshot') {
    const path = nonEmptyString(value.path);
    return path ? {type, path, alt: nonEmptyString(value.alt), caption: nonEmptyString(value.caption)} : null;
  }
  const data = value.data;
  return isPlainData(data) ? {type, data} : null;
}
/** An object of plain data values. */
function isPlainData(value) {
  return isRecord(value) ? Object.values(value).every(isDataValue) : false;
}
/** A plain data value. */
function isDataValue(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value)
    ? true
    : Array.isArray(value)
      ? value.every(isDataValue)
      : isPlainData(value);
}
/** A non-array object. */
function isRecord(value) {
  return typeof value == 'object' && value !== null && !Array.isArray(value);
}
var /** A non-empty string, or undefined. */
  nonEmptyString = value => (typeof value == 'string' && value.length > 0 ? value : void 0),
  /** The questions asked and the answers given. */
  QuestionsCard = ({args, resultText}) => {
    const questions = Array.isArray(args.questions) ? args.questions : [],
      answers = (0, j.useMemo)(() => parseQuestionAnswers(resultText ?? ''), [resultText]);
    return (0, p.jsx)('div', {
      className: '-mt-2 -ml-2 w-full',
      children: questions.map((question, index) => {
        const answer = answers.get(question.header);
        return (0, p.jsxs)(
          'div',
          {
            className: 'flex flex-col gap-0.5 rounded-xl px-1.5 py-0.5',
            children: [
              (0, p.jsx)('div', {
                children: (0, p.jsx)('p', {
                  className: 'text-foreground text-sm font-medium',
                  children: question.question,
                }),
              }),
              answer != null
                ? (0, p.jsxs)('div', {
                    className: 'flex shrink-0 gap-2',
                    children: [
                      (0, p.jsx)(ro, {className: 'text-muted mt-px size-4'}),
                      (0, p.jsx)('p', {className: 'grow', children: answer}),
                    ],
                  })
                : null,
            ],
          },
          `${question.header}-${index}`,
        );
      }),
    });
  },
  /** The ask_user_question tool. */
  Ya = {
    expandedContent: QuestionsCard,
    expandMode: 'force-open',
    standalone: true,
  },
  /** Event trigger sources in words. */
  EVENT_SOURCE_LABELS = {
    'web-push-notification': 'web push',
    webhook: 'webhook',
    'agent-to-agent': 'agent message',
    email: 'email',
  };
/** An event trigger in words. */
function eventTriggerLabel(filter) {
  const source = EVENT_SOURCE_LABELS[filter?.source ?? ''] ?? filter?.source ?? 'event',
    from = filter?.from?.replace(/^https?:\/\//, ''),
    conversation = filter?.externalConversationId;
  return ['When', source, from ? `from ${from}` : void 0, conversation ? `in ${conversation}` : void 0, 'arrives']
    .filter(Boolean)
    .join(' ');
}
/** A routine's schedule in words. */
function tl(routine, now = new Date()) {
  if (routine.triggerKind === 'event') return eventTriggerLabel(routine.eventFilter);
  if (routine.scheduleKind === 'once') return onceLabel(routine.runAt ?? routine.nextRunAt, routine.timezone, now);
  if (routine.rrule) {
    const start = routine.rrule.match(/^DTSTART(?:;TZID=([^:]+))?:(\d{8}T\d{6})(Z)?/);
    if (start && /(?:^|;)COUNT=1(?:;|$)/.test(rruleBody(routine.rrule))) {
      const local = start[2].replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6');
      return onceLabel(
        (start[3]
          ? (0, zt.default)(`${local}Z`)
          : zt.default.tz(local, start[1] ?? routine.timezone ?? 'UTC')
        ).toDate(),
        routine.timezone ?? start[1],
        now,
      );
    }
    return recurrenceLabel(routine.rrule);
  }
  return 'Custom schedule';
}
/** An RRULE recurrence in words. */
function recurrenceLabel(rrule) {
  const rule = parseRrule(rrule),
    interval = Math.max(Number.parseInt(rule.interval ?? '1', 10) || 1, 1),
    times = timesOfDayLabel(rule);
  if (rule.freq === 'MINUTELY') return interval === 1 ? 'Every minute' : `Every ${interval}m`;
  if (rule.freq === 'HOURLY') return interval === 1 ? 'Every hour' : `Every ${interval}h`;
  if (rule.freq === 'DAILY') {
    const label = interval === 1 ? hourlyRangeLabel(rule) : void 0;
    return label || [interval === 1 ? 'Everyday' : `Every ${interval} days`, times].filter(Boolean).join(' ');
  }
  if (rule.freq === 'WEEKLY') {
    const label = weekdaysLabel(rule.byday);
    return interval === 1
      ? ['Every', label || 'week', times].filter(Boolean).join(' ')
      : [`Every ${interval} weeks`, label ? `on ${label}` : void 0, times].filter(Boolean).join(' ');
  }
  if (rule.freq === 'MONTHLY') {
    const label = monthDaysLabel(rule.bymonthday);
    return [interval === 1 ? 'Every month' : `Every ${interval} months`, label ? `on ${label}` : void 0, times]
      .filter(Boolean)
      .join(' ');
  }
  return 'Custom schedule';
}
var /** The RRULE line of a rule. */
  rruleBody = rrule =>
    (
      rrule
        .trim()
        .split(/\r?\n/)
        .find(line => line.startsWith('RRULE:')) ?? rrule
    ).replace(/^RRULE:/, '');
/** An RRULE's parts, keys lowercased and values uppercased. */
function parseRrule(rrule) {
  return Object.fromEntries(
    rruleBody(rrule)
      .split(';')
      .map(pair => pair.split('='))
      .filter(pair => !!(pair[0] && pair[1]))
      .map(([key, value]) => [key.toLowerCase(), value.toUpperCase()]),
  );
}
/** The times of day a rule runs at. */
function timesOfDayLabel(rule) {
  if (!rule.byhour) return;
  const hours = numberList(rule.byhour, 0, 23),
    minutes = numberList(rule.byminute, 0, 59),
    minuteList = minutes.length ? minutes : [0],
    times = hours.flatMap(hour => minuteList.map(minute => clockLabel(hour, minute))).filter(time => !!time);
  if (!times.length) return;
  const shown = times.length > 4 ? [...times.slice(0, 3), `${times.length - 3} more`] : times;
  return new Intl.ListFormat('en-US', {style: 'long', type: 'conjunction'}).format(shown);
}
/** A run every N minutes across a range of hours, when the rule is that. */
function hourlyRangeLabel(rule) {
  const hours = numberList(rule.byhour, 0, 23),
    minutes = rule.byminute ? numberList(rule.byminute, 0, 59) : [0],
    step = 60 / minutes.length,
    evenMinutes = Number.isInteger(step) && minutes.every((value, index) => value === index * step),
    consecutive = hours.every((value, index) => value === hours[0] + index);
  if (!evenMinutes || !consecutive || hours.length * minutes.length < 4) return;
  const every = step === 60 ? 'Every hour' : `Every ${step} minutes`;
  return hours.length === 24
    ? every
    : `${every}, ${clockLabel(hours[0], 0)}–${clockLabel(hours[hours.length - 1], minutes[minutes.length - 1])}`;
}
var /** RRULE weekday codes. */
  WEEKDAY_NAMES = {
    MO: 'Monday',
    TU: 'Tuesday',
    WE: 'Wednesday',
    TH: 'Thursday',
    FR: 'Friday',
    SA: 'Saturday',
    SU: 'Sunday',
  };
/** BYDAY in words. */
function weekdaysLabel(byday) {
  const days = byday
    ?.split(',')
    .map(code => code.match(/[A-Z]{2}$/)?.[0])
    .reduce((names, code) => {
      const name = code ? WEEKDAY_NAMES[code] : void 0;
      return (name && names.push(name), names);
    }, []);
  if (days?.length) return new Intl.ListFormat('en-US', {style: 'long', type: 'conjunction'}).format(days);
}
/** BYMONTHDAY in words. */
function monthDaysLabel(bymonthday) {
  const days = bymonthday
    ?.split(',')
    .map(day => Number.parseInt(day, 10))
    .filter(day => Number.isSafeInteger(day) && day >= 1 && day <= 31)
    .map(day => `day ${day}`);
  if (days?.length) return new Intl.ListFormat('en-US', {style: 'long', type: 'conjunction'}).format(days);
}
/** A comma list of whole numbers in [min, max], sorted and deduplicated. */
function numberList(list, min, max) {
  return [
    ...new Set(
      list
        ?.split(',')
        .map(value => value.trim())
        .filter(value => /^\d+$/.test(value))
        .map(value => Number.parseInt(value, 10))
        .filter(value => value >= min && value <= max) ?? [],
    ),
  ].sort((value, other) => value - other);
}
/** A one-off run: Today, Tomorrow or the date, and the time. */
function onceLabel(date, timezone, now = new Date()) {
  if (!date) return 'Once';
  const when = inTimezone(date, timezone);
  if (!when?.isValid()) return 'Once';
  const today = inTimezone(now, timezone) ?? (0, zt.default)(now);
  return `${when.isSame(today, 'day') ? 'Today' : when.isSame(today.add(1, 'day'), 'day') ? 'Tomorrow' : when.format('MMM D')} ${when.format(when.minute() === 0 ? 'hA' : 'h:mmA')}`;
}
/** A dayjs date in a timezone, or as is when the timezone is invalid. */
function inTimezone(date, timezone) {
  const value = (0, zt.default)(date);
  if (value.isValid()) {
    if (!timezone) return value;
    try {
      return value.tz(timezone);
    } catch {
      return value;
    }
  }
}
/** A time like 9AM or 9:30PM. */
function clockLabel(hour, minute) {
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;
  const suffix = hour >= 12 ? 'PM' : 'AM',
    hour12 = hour % 12 || 12;
  return minute === 0 ? `${hour12}${suffix}` : `${hour12}:${minute.toString().padStart(2, '0')}${suffix}`;
}
var /** Text escaped for inline markdown, whitespace collapsed. */
  escapeMarkdown = text => text.replace(/([\\`*&_{}[\]()<>!#|~])/g, '\\$1').replace(/\s+/g, ' '),
  /** A string argument, or "". */
  stringArg = value => (typeof value == 'string' ? value : ''),
  /** A plain object, or undefined. */
  plainObject = value => (oo(value) ? value : void 0),
  /** A markdown link to an Aux file or routine. */
  markdownLink = (label, kind, target) =>
    `[${escapeMarkdown(label)}](#aux-${kind}:${encodeURIComponent(target).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16)}`)})`;
/** A summary as plain text, links reduced to their labels. */
function dl({action, detail}) {
  return [
    action,
    detail
      .replace(/\[((?:\\.|[^\]\\])*)\]\(#aux-(?:file|routine):[^)]*\)/g, '$1')
      .replace(/\\([\\`*&_{}[\]()<>!#|~])/g, '$1'),
  ]
    .filter(Boolean)
    .join(' ');
}
/** A tool step's summary: its action, detail, icon and diff stats. */
function ho(step) {
  const {call, result} = step,
    context = {
      ...step,
      args: call.arguments ?? {},
      resultText:
        result?.content.filter(part => part.type === 'text').map(part => part.text).join(`
`) ?? '',
      details: plainObject(result?.details),
    },
    summarize = TOOL_SUMMARIES[call.name];
  if (summarize) return summarize(context);
  if (call.name.startsWith('mcp__')) {
    const [, server = 'MCP', tool = call.name] = call.name.match(/^mcp__(.+?)__(.+)$/) ?? [];
    return {detail: escapeMarkdown(`${server} / ${tool}`), icon: {type: 'mcp', serverName: server}};
  }
  return {detail: escapeMarkdown(call.name), icon: {type: 'symbol', name: 'tool'}};
}
var /** The word for a step's phase: done, streaming or not started. */
  byPhase = (step, streaming, done, idle) => (step.result ? done : step.isStreaming ? streaming : idle);
/** A skill's name and icon from its SKILL.md read. */
function cl(call, result) {
  const path = stringArg(call.arguments.path) || stringArg(call.arguments.file_path),
    frontmatter =
      (
        result?.content.filter(part => part.type === 'text').map(part => part.text).join(`
`) ?? ''
      ).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '',
    field = key =>
      frontmatter
        .match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'))?.[1]
        ?.trim()
        .replace(/^['"]|['"]$/g, '');
  return {
    name: Cl({
      name: stringArg(plainObject(result?.details)?.skillName) || field('name'),
      path: path.split(/[/\\]/).at(-2) ?? 'skill',
    }),
    icon: stringArg(plainObject(result?.details)?.skillIcon) || field('icon'),
  };
}
var /** Reading, writing and editing files (and using a skill). */
  fileSummary = step => {
    const path = stringArg(step.args.path) || stringArg(step.args.file_path),
      fileName = path.split(/[/\\]/).pop() || 'file',
      isRead = step.call.name === 'read_file';
    if (isRead && fileName === 'SKILL.md') {
      const {name, icon} = cl(step.call, step.result);
      return {
        action: step.result?.isError ? 'Failed to read' : byPhase(step, 'Using', 'Used', 'Use'),
        detail: `${markdownLink(name, 'file', path)} skill`,
        icon:
          icon && /^https?:\/\//.test(icon)
            ? {type: 'image', url: icon, fallback: 'skill'}
            : {type: 'symbol', name: 'skill'},
      };
    }
    const isEdit = step.call.name === 'edit_file';
    return {
      action: isRead
        ? step.result?.isError
          ? 'Read failed'
          : byPhase(step, 'Reading', 'Read', 'Read')
        : isEdit
          ? step.result?.isError
            ? 'Edit failed'
            : byPhase(step, 'Editing', 'Edited', 'Edit')
          : step.result?.isError
            ? 'Write failed'
            : byPhase(step, 'Writing', 'Wrote', 'Write'),
      detail: path ? markdownLink(fileName, 'file', path) : escapeMarkdown(fileName),
      icon: isEdit
        ? {type: 'symbol', name: 'edit'}
        : {type: 'file', extension: fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : ''},
      ...(!isRead && step.result && !step.result.isError ? {diffStats: gi(step.call, step.result)} : {}),
    };
  };
/** Lines added and removed in a diff. */
function Bt(diff) {
  const stats = {addedLines: 0, removedLines: 0};
  for (const line of diff.split(`
`))
    line.startsWith('+++') ||
      line.startsWith('---') ||
      line.startsWith('@@') ||
      (line.startsWith('+') && stats.addedLines++, line.startsWith('-') && stats.removedLines++);
  return stats;
}
/** The diff stats of a file write or edit. */
function gi(call, result) {
  if (!result || result.isError) return;
  if (call.name === 'edit_file') {
    const diff = plainObject(result.details)?.diff;
    return typeof diff == 'string' ? Bt(diff) : void 0;
  }
  const content = stringArg(call.arguments.content);
  return call.name === 'write_file' && content
    ? Bt(
        content
          .split(
            `
`,
          )
          .map(line => `+${line}`).join(`
`),
      )
    : void 0;
}
var /** Each tool's step summary. */
  TOOL_SUMMARIES = {
    read_file: fileSummary,
    write_file: fileSummary,
    edit_file: fileSummary,
    bash: step => ({
      detail: escapeMarkdown(
        step.result?.isError && /interrupted|aborted/i.test(step.resultText)
          ? 'Interrupted'
          : stringArg(step.args.title) || 'Run command',
      ),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    bash_interact: step => ({
      detail: escapeMarkdown(
        [
          step.args.resize && 'Resize terminal',
          step.args.input === '' && 'Send Ctrl-C',
          step.args.input === '' && 'Send EOF',
          step.args.input !== void 0 && step.args.input !== '' && step.args.input !== '' && 'Send input',
          step.args.signal === 'interrupt' && 'Interrupt command',
          step.args.signal === 'terminate' && 'Terminate command',
          step.args.signal === 'kill' && 'Kill command',
        ]
          .filter(Boolean)
          .join(' · ') || 'Poll command',
      ),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    fd: step => ({
      action: byPhase(step, 'Finding', 'Found', 'Find'),
      detail: escapeMarkdown(stringArg(step.args.pattern) ? `"${step.args.pattern}"` : 'files'),
      icon: {type: 'symbol', name: 'search'},
    }),
    rg: step => ({
      action: byPhase(step, 'Searching', 'Searched', 'Search'),
      detail: escapeMarkdown(`"${stringArg(step.args.pattern)}"`),
      icon: {type: 'symbol', name: 'search'},
    }),
    bg_start: step => ({
      action: byPhase(step, 'Starting', 'Started', 'Start'),
      detail: escapeMarkdown(stringArg(step.args.title) || 'background command'),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    bg_monitor: step => ({
      action: byPhase(step, 'Watching', 'Watching', 'Watch'),
      detail: escapeMarkdown(stringArg(step.args.description) || 'background command'),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    bg_status: step => ({
      action: byPhase(step, 'Checking', 'Checked', 'Check'),
      detail: escapeMarkdown(stringArg(step.args.id) || 'background command'),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    bg_list: () => ({detail: 'Background commands', icon: {type: 'symbol', name: 'terminal'}}),
    bg_kill: step => ({
      action: byPhase(step, 'Stopping', 'Stopped', 'Stop'),
      detail: escapeMarkdown(Array.isArray(step.args.ids) ? step.args.ids.join(', ') : 'background command'),
      icon: {type: 'symbol', name: 'terminal'},
    }),
    memory_read: step => ({
      action: byPhase(step, 'Reading memory', 'Read memory', 'Read memory'),
      detail: escapeMarkdown(stringArg(step.args.path) || 'pages'),
      icon: {type: 'symbol', name: 'memory'},
    }),
    memory_write: step => ({
      action: step.result?.isError
        ? 'Memory update failed'
        : byPhase(step, 'Updating memory', 'Updated memory', 'Update memory'),
      detail: escapeMarkdown(stringArg(step.args.path)),
      icon: {type: 'symbol', name: 'memory'},
    }),
    workflow: step => ({
      action: step.result?.isError
        ? 'Workflow failed'
        : step.args.background === true
          ? byPhase(step, 'Starting workflow', 'Started workflow', 'Start workflow')
          : byPhase(step, 'Running workflow', 'Ran workflow', 'Run workflow'),
      detail: escapeMarkdown(
        stringArg(step.args.script).match(/\bmeta\s*=\s*\{[^}]*?\bname\s*:\s*(['"`])(.*?)\1/)?.[2] ?? '',
      ),
      icon: {type: 'symbol', name: 'subagent'},
    }),
    automation_create: step => ({
      action: byPhase(step, 'Scheduling', 'Scheduled', 'Schedule'),
      detail: escapeMarkdown(stringArg(step.args.title) || 'automation'),
      icon: {type: 'symbol', name: 'clock'},
    }),
    automation_list: () => ({detail: 'Automations', icon: {type: 'symbol', name: 'clock'}}),
    automation_delete: step => ({
      action: byPhase(step, 'Deleting', 'Deleted', 'Delete'),
      detail: escapeMarkdown(Array.isArray(step.args.ids) ? step.args.ids.join(', ') : 'automation'),
      icon: {type: 'symbol', name: 'clock'},
    }),
    start_coder: step => ({
      action: step.result?.isError
        ? 'Could not start Aux Code'
        : byPhase(step, 'Starting Aux Code', 'Started Aux Code', 'Start Aux Code'),
      detail: escapeMarkdown(stringArg(step.details?.title) || stringArg(step.args.description)),
      icon: {type: 'symbol', name: 'code'},
    }),
    repl: step => ({
      detail: escapeMarkdown(
        !step.result && step.isStreaming && stringArg(step.args.code).includes('imagegen.generate(')
          ? 'Generating image…'
          : stringArg(step.args.title) || 'Run code',
      ),
      icon: {type: 'symbol', name: vi({title: stringArg(step.args.title), code: stringArg(step.args.code)})},
    }),
    webfetch: step => {
      let host = 'page';
      try {
        host = new URL(stringArg(step.args.url)).hostname.replace(/^www\./, '');
      } catch {}
      const favicon = stringArg(step.details?.faviconUrl);
      return {
        action: step.result?.isError ? 'Fetch failed' : byPhase(step, 'Fetching', 'Fetched', 'Fetch'),
        detail: escapeMarkdown(stringArg(step.details?.title) || host),
        icon: favicon ? {type: 'image', url: favicon, fallback: 'browser'} : {type: 'symbol', name: 'browser'},
      };
    },
    websearch: step => ({
      action: step.result?.isError ? 'Search failed' : byPhase(step, 'Searching', 'Searched', 'Search'),
      detail: escapeMarkdown(stringArg(step.args.objective) ? `"${step.args.objective}"` : 'the web'),
      icon: {type: 'symbol', name: 'search'},
    }),
    browsing_history_search: step => {
      const queries = Array.isArray(step.args.queries)
        ? step.args.queries
            .filter(query => typeof query == 'string')
            .map(query => `“${query}”`)
            .join(' ')
        : stringArg(step.args.argquery);
      return {
        action: byPhase(step, 'Searching', 'Searched', 'Search'),
        detail: escapeMarkdown(step.result && queries ? `${queries} from the browsing history` : 'browsing history'),
        icon: {type: 'symbol', name: 'history'},
      };
    },
    history_search: step => {
      const queries = Array.isArray(step.args.queries)
        ? step.args.queries
            .filter(query => typeof query == 'string')
            .map(query => `“${query}”`)
            .join(' ')
        : '';
      return {
        action: step.result?.isError
          ? queries
            ? 'Search failed'
            : 'Browse failed'
          : queries
            ? byPhase(step, 'Searching', 'Searched', 'Search')
            : byPhase(step, 'Browsing', 'Browsed', 'Browse'),
        detail: escapeMarkdown(queries ? `history for ${queries}` : 'recent activity'),
        icon: {type: 'symbol', name: 'history'},
      };
    },
    history_read: step => ({
      action: step.result?.isError ? 'Read failed' : byPhase(step, 'Reading', 'Read', 'Read'),
      detail: 'activity evidence',
      icon: {type: 'symbol', name: 'history'},
    }),
    search_channels: step => ({
      action: byPhase(step, 'Searching', 'Searched', 'Search'),
      detail: 'channels',
      icon: {type: 'symbol', name: 'search'},
    }),
    search_threads: step => ({
      action: byPhase(step, 'Searching', 'Searched', 'Search'),
      detail: 'conversations',
      icon: {type: 'symbol', name: 'search'},
    }),
    read_thread: step => ({
      action: byPhase(step, 'Reading', 'Read', 'Read'),
      detail: 'conversation history',
      icon: {type: 'symbol', name: 'message'},
    }),
    route_message: step => ({
      action: byPhase(step, 'Choosing', 'Chose', 'Choose'),
      detail: 'the conversation for this request',
      icon: {type: 'symbol', name: 'message'},
    }),
    send_message: step => ({
      action: byPhase(step, 'Publishing', 'Published', 'Publish'),
      detail: 'a reply',
      icon: {type: 'symbol', name: 'message'},
    }),
    memory_search: step => {
      if (step.details?.skipped === 'indexing')
        return {
          action: 'Skipped',
          detail: 'memory search — memory setup in progress',
          icon: {type: 'symbol', name: 'memory'},
        };
      const queries = Array.isArray(step.args.queries)
        ? step.args.queries.filter(query => typeof query == 'string')
        : stringArg(step.args.query)
          ? [stringArg(step.args.query)]
          : [];
      return {
        action: byPhase(step, 'Searching', 'Searched', 'Search'),
        detail: escapeMarkdown(queries.length ? `memory for “${queries.join('”, “')}”` : 'memory'),
        icon: {type: 'symbol', name: 'memory'},
      };
    },
    message_agent: step => {
      const icon = {type: 'symbol', name: 'agents'};
      if (step.args.action === 'list')
        return {
          action: step.result?.isError ? 'Agent lookup failed' : byPhase(step, 'Finding', 'Found', 'Find'),
          detail: 'active agents',
          icon,
        };
      const recipient = stringArg(step.details?.recipientTitle) || stringArg(step.args.to) || 'parent agent';
      return {
        action: step.result?.isError ? 'Could not message' : byPhase(step, 'Messaging', 'Messaged', 'Message'),
        detail: escapeMarkdown(recipient),
        icon,
      };
    },
    notification: step => ({
      action: step.result?.isError ? 'Notification failed' : byPhase(step, 'Notifying', 'Notified', 'Notify'),
      detail: escapeMarkdown(stringArg(step.args.title)),
      icon: {type: 'symbol', name: 'notification'},
    }),
    subagent: step => {
      let action, detail;
      switch (step.args.action) {
        case 'list_models':
          ((action = step.result?.isError
            ? 'Model lookup failed'
            : byPhase(step, 'Finding models', 'Found models', 'Find models')),
            (detail = stringArg(step.args.query) || 'available models'));
          break;
        case 'spawn':
          ((action = byPhase(step, 'Spawning', 'Spawned', 'Spawn')), (detail = stringArg(step.args.description)));
          break;
        case 'resume':
          ((action = byPhase(step, 'Resuming', 'Resumed', 'Resume')), (detail = stringArg(step.args.task_id)));
          break;
        default:
          ((action = byPhase(step, 'Waiting', 'Waited', 'Wait')), (detail = stringArg(step.args.task_id)));
      }
      return {action, detail: escapeMarkdown(detail), icon: {type: 'symbol', name: 'subagent'}};
    },
    subagent_wait: step => ({
      action: byPhase(step, 'Waiting', 'Waited', 'Wait'),
      detail: 'for subagent',
      icon: {type: 'symbol', name: 'subagent'},
    }),
    ask_user_question: step => {
      const count = Number(step.resultText.match(/Asked user (\d+) question\(s\)/)?.[1] ?? 0);
      return {
        action: byPhase(step, 'Preparing', 'Asked', 'Ask'),
        detail: step.result ? (count > 1 ? `${count} questions` : 'a question') : 'questions',
        icon: {type: 'symbol', name: 'question'},
      };
    },
    request_action_confirmation: step => ({
      detail: step.result
        ? step.resultText.includes('User confirmed')
          ? 'Action confirmed'
          : 'Action not confirmed'
        : step.isStreaming
          ? 'Reviewing action'
          : 'Review action',
      icon: {type: 'symbol', name: 'confirmation'},
    }),
    write_todos: step => {
      const icon = {type: 'symbol', name: 'todo'};
      if (!step.result || step.result.isError)
        return {
          action: step.result?.isError ? 'Failed to update' : step.isStreaming ? 'Updating' : 'Update',
          detail: 'to-do list',
          icon,
        };
      if (!Array.isArray(step.details?.previousTodos) || !Array.isArray(step.details?.updatedTodos))
        return {action: 'Updated', detail: 'to-do list', icon};
      const previous = step.details.previousTodos,
        updated = step.details.updatedTodos;
      if (updated.length === 0) return {action: previous.length ? 'Cleared' : 'Checked', detail: 'to-do list', icon};
      const previousStatus = new Map(previous.map(todo => [todo.id, todo.status]));
      for (const status of ['in_progress', 'completed', 'pending', 'cancelled']) {
        const changed = updated.filter(
          todo =>
            todo.status === status &&
            (status === 'pending' ? !previousStatus.has(todo.id) : previousStatus.get(todo.id) !== status),
        );
        if (!changed.length) continue;
        const label =
          status === 'completed'
            ? `Completed ${updated.filter(todo => todo.status === 'completed').length} of ${updated.length}`
            : status === 'in_progress'
              ? 'Started'
              : status === 'pending'
                ? 'Added'
                : 'Cancelled';
        return {
          action:
            status === 'completed'
              ? `${label}${changed.length === 1 ? '' : ' to-dos'}`
              : `${label} ${changed.length === 1 ? 'to-do' : `${changed.length} to-dos`}`,
          detail: changed.length === 1 ? escapeMarkdown(changed[0].content) : '',
          icon,
        };
      }
      return {action: 'Checked', detail: 'to-do list', icon};
    },
    get_time: () => ({detail: 'Get Time', icon: {type: 'symbol', name: 'clock'}}),
    notify_parent: notifyParentSummary,
    routine_update: routineSummary,
    'routine.notify_parent': notifyParentSummary,
    'routine.update': routineSummary,
  };
/** A routine notifying its parent task. */
function notifyParentSummary() {
  return {action: 'Notified', detail: 'parent task', icon: {type: 'symbol', name: 'routine'}};
}
/** Creating, changing, pausing or viewing a routine. */
function routineSummary(step) {
  const mode = fl(step.args),
    routine = ml(step),
    name = routine.name,
    schedule = gl(routine),
    icon = {type: 'symbol', name: 'routine'};
  if (step.result?.isError)
    return {detail: mo(step.resultText) ? 'Routine limit reached.' : 'Routine update failed', icon};
  const link = name ? (routine.id ? markdownLink(name, 'routine', routine.id) : escapeMarkdown(name)) : 'routine';
  return mode === 'update' && (step.args.status === 'paused' || step.args.status === 'active')
    ? {
        action:
          step.args.status === 'paused'
            ? byPhase(step, 'Pausing', 'Paused', 'Pause')
            : byPhase(step, 'Resuming', 'Resumed', 'Resume'),
        detail: link,
        icon,
      }
    : step.result
      ? {
          action: (mode === 'create' || mode === 'update') && name ? 'Scheduled' : bl(mode),
          detail: `${link}${(mode === 'create' || mode === 'update') && name && schedule ? ` for ${escapeMarkdown(schedule)}` : ''}`,
          icon,
        }
      : {action: step.isStreaming ? _l(mode) : mode[0].toUpperCase() + mode.slice(1), detail: 'routine', icon};
}
var /** The routine limit error. */
  mo = text => text.includes('Free plan can create up to') || text.includes('Free plan can run up to'),
  /** Apps a REPL script uses, by the calls in it. */
  jn = [
    {icon: 'user', target: 'iMessage', pattern: /\bimessage\.contacts\b/},
    {icon: 'message', target: 'iMessage', pattern: /\bimessage\./},
    {icon: 'email', target: 'Gmail', pattern: /\bgmail\./},
    {icon: 'google', target: 'Google', pattern: /\bgoogleAccounts\./},
    {
      icon: 'slack',
      target: 'Slack',
      pattern:
        /\b(?:slack|slackClient)\.|\b\w+\.(?:conversations\.(?:history|replies|list|info)|chat\.postMessage|search\.(?:messages|all))\s*\(/,
    },
    {icon: 'linkedin', target: 'LinkedIn', pattern: /\blinkedin\./},
    {icon: 'x', target: 'X', pattern: /\btwitter\./},
    {icon: 'notion', target: 'Notion', pattern: /\b(?:_?notion|notionClient)\./},
  ],
  /** The icon a REPL step takes, from its title and code. */
  vi = repl => {
    const title = repl.title?.toLowerCase() ?? '',
      code = po(repl.code ?? ''),
      app = jn.find(({pattern}) => pattern.test(code));
    return app
      ? app.icon
      : code.includes('page') || code.includes('tabs') || code.includes('openTab') || code.includes('closeTab')
        ? title.includes('type')
          ? 'type'
          : code.includes('openTab')
            ? 'tab'
            : code.includes('click') || code.includes('check') || code.includes('selectOption')
              ? 'click'
              : title.includes('scroll')
                ? 'scroll'
                : title.includes('screenshot') || title.includes('snapshot') || code.includes('snapshot')
                  ? 'screenshot'
                  : 'browser'
        : 'code';
  },
  /** Code without its strings and comments. */
  po = code => code.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ' ');
