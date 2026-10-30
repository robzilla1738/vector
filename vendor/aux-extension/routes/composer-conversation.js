/* Aux-owned source, composer pass 7: how a session's conversation is drawn
 * (assets/session-composer-Dc0LRfZA.js, from the attachment stack to turn navigation): user
 * messages with their attachments, mentions and skills; assistant text with citations and source
 * cards; tool steps, subagent steps and changed files; copy, edit, branch and retry actions;
 * branch, reconnect, compaction, error and system rows (routines, memory signals, agent messages);
 * the live activity line, day separators, worked-for folds, and the turn navigation rail.
 * Names the chunk uses elsewhere keep their chunk names: mo messageContent, fo TextWithMentions,
 * Jn citationSources, vo FileActions (exported), Om AssistantRun, Um StatusRow, Km SystemRow,
 * Gm UserMessage, Zm LiveActivity, t0 turnSummaries, So dayLabel, n0 DaySeparator, r0 TurnSegment,
 * er isCoderCall, h0 transcriptSegments, f0 TurnNavigation.
 * Chunk names used: a JSX runtime, g React, Y cn, Rs cva, me useSession, ge useApp, Ce useTRPC,
 * _e useQueryClient, ve useMutation, Sn/no/Xa/fa the message list, Vn/hr/ji/Ai text and markdown,
 * Na skills, Yc markdown, Gc the message bubble, Kt/hu/Ye tool steps, ha subagents, Ut openSession,
 * $t the side panel, ar copy, lr confirm, de toasts, at dayjs, Mt motion, Xn the attachment card,
 * qh the message editor, J Button, Ae/Pe/Ie tooltip parts, Eo the files panel, pn page href.
 * Aux change: the error row takes the 12px scale corner (rounded-xl) instead of the 16px step. */
var STACK_LIMIT = 3,
  STACK_ROTATE = 5,
  STACK_ROTATE_OPEN = 10,
  STACK_SCALE = 0.1,
  STACK_SHIFT_X = 5,
  STACK_OPEN_X = -8,
  STACK_OPEN_Y = -8; /** The text blocks of a message, without its hidden markup. */
function messageTextBlocks(e) {
  if (typeof e.content == 'string') {
    const n = Vn(e.content);
    return n.length > 0 ? [n] : [];
  }
  const t = [];
  for (const n of e.content) {
    if (n.type !== 'text') continue;
    const r = Vn(n.text);
    r.trim().length > 0 && t.push(r);
  }
  return t;
}
function metadataAttachments(e) {
  return e?.attachments ?? [];
}
function tabAttachmentsOf(e) {
  return metadataAttachments(e).filter(t => t.type === 'tab');
}
function mo(e, t) {
  return {attachments: metadataAttachments(t), textBlocks: messageTextBlocks(e)};
} /** Text split into plain runs, skills and @mentions of tabs, in order. */
function mentionSegments(e, t) {
  const n = mentionMatches(e, t);
  if (n.length === 0) return [{key: 'text:0', value: e}];
  const r = [];
  let s = 0;
  for (const o of n)
    o.start < s ||
      (o.start > s && r.push({key: `text:${s}`, value: e.slice(s, o.start)}),
      r.push({key: o.key, value: o.value}),
      (s = o.end));
  return (s < e.length && r.push({key: `text:${s}`, value: e.slice(s)}), r);
}
function mentionMatches(e, t) {
  const n = Array.from(new Map(t.map(s => [`@${s.name}`, s])).entries())
      .sort((s, o) => o[0].length - s[0].length)
      .map(([, s]) => s),
    r = Na(e).map(s => ({
      start: s.start,
      end: s.end,
      value: {type: 'skill', name: s.name, skillPath: s.skillPath},
      key: `skill:${s.skillPath}:${s.start}`,
    }));
  for (const s of n) {
    const o = `@${s.name}`;
    let i = e.indexOf(o);
    for (; i >= 0;)
      (r.push({start: i, end: i + o.length, value: s, key: `mention:${s.id}:${i}`}), (i = e.indexOf(o, i + o.length)));
  }
  return r.sort((s, o) => (s.start !== o.start ? s.start - o.start : o.end - s.end));
} /** A user message’s attachments, stacked like cards when several; click to fan them out. */
function MessageAttachments({attachments, sessionId}) {
  const n = attachments.slice(0, STACK_LIMIT),
    [r, s] = (0, g.useState)(false),
    [o, i] = (0, g.useState)(null);
  if (n.length === 0) return null;
  const c = n.length > 1,
    l = !c || r;
  return (0, a.jsxs)('div', {
    className: 'ml-auto flex w-fit max-w-full flex-col items-end gap-2',
    'data-testid': 'message-attachments',
    'data-state': l ? 'expanded' : 'collapsed',
    children: [
      c
        ? (0, a.jsxs)(J, {
            className: 'text-muted-foreground',
            variant: 'ghost',
            size: 'xs',
            'aria-expanded': l,
            onClick: () => s(u => !u),
            children: [
              (0, a.jsx)('span', {children: l ? 'Fold' : 'See all'}),
              l ? (0, a.jsx)(Mr, {className: 'size-4'}) : (0, a.jsx)(wa, {className: 'size-4'}),
            ],
          })
        : null,
      (0, a.jsx)(Mt.div, {
        layout: true,
        layoutDependency: l,
        className: '-mt-1 flex w-fit max-w-full flex-col items-end',
        initial: false,
        transition: {layout: {type: 'spring', stiffness: 300, damping: 28, mass: 0.9}},
        children: n.map((u, h) => {
          const d = n.length - h - 1,
            m = o === u.id,
            p = d > 0;
          return (0, a.jsx)(
            Mt.div,
            {
              animate: {
                rotate: l ? 0 : (m && p ? STACK_ROTATE_OPEN : STACK_ROTATE) * d,
                scale: l || m ? 1 : 1 - STACK_SCALE * d,
                x: l ? 0 : STACK_SHIFT_X * d + (m && p ? STACK_OPEN_X : 0),
                y: l ? 0 : m && p ? STACK_OPEN_Y : 0,
                opacity: l || m ? 1 : 1 - 0.01 * d,
              },
              className: h > 0 ? (l ? 'mt-2' : '-mt-8') : void 0,
              initial: false,
              layout: true,
              layoutDependency: l,
              onHoverEnd: () => i(f => (f === u.id ? null : f)),
              onHoverStart: () => i(u.id),
              style: {zIndex: h + 1, transformOrigin: '100% 100%'},
              transition: {
                layout: {type: 'spring', stiffness: 300, damping: 28, mass: 0.9},
                rotate: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
                scale: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
                x: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
                y: {duration: 0.22, ease: [0.22, 1, 0.36, 1]},
                opacity: {duration: 0.18, ease: [0.22, 1, 0.36, 1]},
              },
              children: (0, a.jsx)(Xn, {
                className: Y(!r && p && 'hover:bg-surface-primary', n.length > 1 && 'dark:bg-neutral-700'),
                attachment: u,
                sessionId,
              }),
            },
            u.id,
          );
        }),
      }),
    ],
  });
} /** A user message’s text, or its editor while being edited. */
function UserMessageBody({
  message,
  messageId,
  metadata,
  messageIndex,
  mode,
  onCancelEdit,
  onEditSubmitted,
  renderable,
}) {
  const l = (0, g.useMemo)(() => tabAttachmentsOf(metadata), [metadata]);
  if (mode === 'edit')
    return (0, a.jsxs)('div', {
      className: 'flex w-full min-w-0 flex-row items-start gap-3',
      children: [
        (0, a.jsx)('div', {className: 'size-8 shrink-0'}),
        (0, a.jsx)('div', {
          className: 'min-w-0 flex-1',
          children: (0, a.jsx)(qh, {
            message,
            messageId,
            metadata,
            onCancel: onCancelEdit,
            onSubmitted: onEditSubmitted,
          }),
        }),
      ],
    });
  const u = new Map();
  return renderable.textBlocks.map(h => {
    const d = u.get(h) ?? 0;
    return (
      u.set(h, d + 1),
      (0, a.jsx)(CollapsibleText, {tabAttachments: l, text: h}, `user-${messageIndex}:${h}:${d}`)
    );
  });
}
var /** Text that folds to its first lines, with Show more and Show less. */
  CollapsibleText = ({text, tabAttachments = [], collapsedLines = 20}) => {
    const r = (0, g.useRef)(null),
      [s, o] = (0, g.useState)(false),
      [i, c] = (0, g.useState)(false);
    return (
      (0, g.useEffect)(() => {
        const l = r.current;
        if (!l || s) return;
        const u = () => {
          if (l.clientWidth < 16) return;
          const d = getComputedStyle(l),
            m = parseFloat(d.fontSize),
            p = parseFloat(d.lineHeight),
            f = d.lineHeight.endsWith('px') ? p : m * (Number.isFinite(p) ? p : 1.2);
          c(l.scrollHeight > f * collapsedLines + 1);
        };
        if ((u(), typeof ResizeObserver > 'u')) return;
        const h = new ResizeObserver(u);
        return (
          h.observe(l),
          () => {
            h.disconnect();
          }
        );
      }, [collapsedLines, s, text]),
      (0, a.jsxs)(ba, {
        className: 'bg-accent text-accent-foreground no-squircle rounded-xl px-3 py-2 wrap-break-word',
        'data-testid': 'message-content',
        children: [
          (0, a.jsx)('div', {
            className: Y(
              'text-sm wrap-break-word whitespace-pre-wrap',
              !s && (collapsedLines === 3 ? 'line-clamp-3' : 'line-clamp-20'),
            ),
            ref: r,
            children: (0, a.jsx)(fo, {text, tabAttachments}),
          }),
          i
            ? (0, a.jsxs)(J, {
                className: 'text-muted-foreground -ml-2 w-fit',
                variant: 'ghost',
                size: 'xs',
                onClick: () => o(l => !l),
                children: [
                  (0, a.jsx)('span', {children: s ? 'Show less' : 'Show more'}),
                  s ? (0, a.jsx)(Ic, {className: 'size-4'}) : (0, a.jsx)(mn, {className: 'size-4'}),
                ],
              })
            : null,
        ],
      })
    );
  } /** TextWithMentions: text with its skills and tab mentions drawn as chips. */,
  fo = ({text, tabAttachments = [], singleLine = false}) => {
    const r = (0, g.useMemo)(() => mentionSegments(text, tabAttachments), [tabAttachments, text]);
    return (0, a.jsx)(a.Fragment, {
      children: r.map(s =>
        typeof s.value == 'string'
          ? (0, a.jsx)(
              'span',
              {
                className: singleLine ? void 0 : 'whitespace-pre-wrap',
                children: singleLine
                  ? s.value.replace(/\n/g, ' ')
                  : s.value
                      .split(
                        `
`,
                      )
                      .map((o, i) =>
                        (0, a.jsxs)(g.Fragment, {children: [i > 0 && (0, a.jsx)('br', {}), o]}, `${s.key}:${i}`),
                      ),
              },
              s.key,
            )
          : s.value.type === 'skill'
            ? (0, a.jsx)(SkillMention, {mention: s.value}, s.key)
            : (0, a.jsx)(TabMention, {attachment: s.value}, s.key),
      ),
    });
  },
  SkillMention = ({mention}) => {
    const t = yc();
    return (0, a.jsx)(uo, {type: 'skill', name: mention.name, icon: t.get(mention.skillPath)});
  },
  TabMention = ({attachment}) => {
    const t = (0, a.jsx)(uo, {type: 'tab', name: attachment.name, icon: attachment.faviconUrl});
    return attachment.url
      ? (0, a.jsx)(Pr, {
          className:
            'inline-flex max-w-full cursor-pointer align-top no-underline hover:no-underline focus:no-underline',
          onClick: n => {
            gn(n);
          },
          to: attachment.url,
          children: t,
        })
      : t;
  } /** A routine a message created, with Edit. */,
  RoutineCard = ({routine}) => {
    const [t, n] = (0, g.useState)(false),
      r = () => n(true),
      s = () => n(false);
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsxs)('article', {
          className:
            'bg-surface-primary border-border mt-2 flex w-full items-center gap-2 rounded-xl border p-2.5 select-none',
          children: [
            (0, a.jsx)('div', {
              className:
                'bg-surface-secondary text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg',
              children: (0, a.jsx)(Di, {className: 'size-4'}),
            }),
            (0, a.jsxs)('div', {
              className: 'min-w-0 flex-1',
              children: [
                (0, a.jsx)('p', {className: 'text-foreground truncate text-sm font-medium', children: routine.name}),
                (0, a.jsx)('p', {className: 'text-muted-foreground truncate text-xs', children: _i(routine)}),
              ],
            }),
            (0, a.jsx)(J, {variant: 'outline', size: 'sm', className: 'text-sm', onClick: r, children: 'Edit'}),
          ],
        }),
        (0, a.jsx)(cc, {open: t, routineId: routine.id, onClose: s}),
      ],
    });
  }; /** The sources a tool call returned (web search results among them). */
function toolSources(e) {
  const t = e.details?.sources,
    n = Array.isArray(t) ? t.filter(r => typeof r?.id == 'string' && typeof r?.url == 'string') : [];
  if (n.length > 0 || e.toolName !== 'websearch') return n;
  try {
    const r = JSON.parse(ea(e));
    return Array.isArray(r.results)
      ? r.results.flatMap(s =>
          typeof s.source_id == 'string' && typeof s.url == 'string'
            ? [
                {
                  id: s.source_id,
                  url: s.url,
                  title: typeof s.title == 'string' ? s.title : null,
                  publishDate: typeof s.publish_date == 'string' ? s.publish_date : null,
                  excerpt: s.excerpts?.[0] ?? null,
                },
              ]
            : [],
        )
      : [];
  } catch {
    return [];
  }
}
function splitRefs(e) {
  if (typeof e != 'string') return [];
  const t = new Set(),
    n = [];
  for (const r of e.split(',')) {
    const s = r.trim();
    !s || t.has(s) || (t.add(s), n.push(s));
  }
  return n;
}
var CITATION = /<citation\b[^>]*\brefs=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/citation>/gi,
  CITATION_TAG = /<\/?(?:citation|quote)\b[^>]*>/gi; /** Citation markup as plain markdown links, for copying. */
function citationsAsLinks(e, t) {
  return /<citation\b/i.test(e)
    ? e
        .replace(CITATION, (n, r, s, o) => {
          const i = o.replace(CITATION_TAG, '').replace(/\s+/g, ' ').trim(),
            c = splitRefs(s)
              .map(l => t.get(l))
              .find(l => l != null);
          return !c || !i ? i : `[${i}](${c.url})`;
        })
        .replace(CITATION_TAG, '')
    : e;
} /** citationSources: every source cited in a run, by id (and id#1). */
function Jn(e, t = []) {
  const n = new Map();
  for (const r of [...t, ...Array.from(e).flatMap(toolSources)])
    (n.set(r.id, r), /#\d+$/.test(r.id) || n.set(`${r.id}#1`, r));
  return n;
}
var /** Cited text with its source chip and a hover card of the sources. */
  Citation = ({refs, sourcesById, messageId, children}) => {
    const s = (0, g.useMemo)(() => splitRefs(refs), [refs]),
      o = (0, g.useMemo)(() => s.map(c => sourcesById.get(c)).filter(c => !!c), [s, sourcesById]),
      i = typeof children == 'string' ? hr(children.replace(/<\/?quote\b[^>]*>/gi, ' ')).trim() : children;
    return o.length === 0
      ? (0, a.jsx)(a.Fragment, {children: i})
      : (0, a.jsxs)(a.Fragment, {
          children: [
            i,
            (0, a.jsxs)(Ks, {
              children: [
                (0, a.jsxs)($s, {
                  'aria-label': `${o.length} citation source${o.length === 1 ? '' : 's'}`,
                  openOnHover: true,
                  nativeButton: false,
                  render: (0, a.jsx)(Bs, {
                    className:
                      'hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground mx-1 -mt-0.5 cursor-pointer px-1.5 py-[0.1em] align-baseline text-[80%] leading-none font-medium',
                    variant: 'secondary',
                  }),
                  children: [
                    (0, a.jsx)('span', {className: 'max-w-32 truncate', children: sourceHost(o[0].url)}),
                    o.length > 1 &&
                      (0, a.jsx)('span', {className: 'shrink-0 opacity-50', children: `+${o.length - 1}`}),
                  ],
                }),
                (0, a.jsx)(Ys, {
                  className: 'w-xs',
                  align: 'start',
                  side: 'bottom',
                  children: (0, a.jsx)(SourceCards, {sources: o}),
                }),
              ],
            }),
          ],
        });
  } /** Source cards: one at a time, with previous and next. */,
  SourceCards = ({sources}) => {
    const [t, n] = (0, g.useState)(0),
      r = i => () => {
        n(c => Math.max(Math.min(c + i, sources.length - 1), 0));
      },
      s = sources[t],
      o = s.excerpt ? hr(s.excerpt).replace(/\s+/g, ' ').trim() : '';
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsxs)('div', {
          className: 'flex items-center p-1',
          children: [
            (0, a.jsx)(J, {
              'aria-label': 'Previous citation',
              size: 'icon-sm',
              variant: 'ghost',
              shape: 'pill',
              disabled: t === 0,
              onClick: r(-1),
              children: (0, a.jsx)(zs, {}),
            }),
            (0, a.jsx)(J, {
              'aria-label': 'Next citation',
              size: 'icon-sm',
              variant: 'ghost',
              shape: 'pill',
              disabled: t === sources.length - 1,
              onClick: r(1),
              children: (0, a.jsx)(cr, {}),
            }),
          ],
        }),
        (0, a.jsx)('div', {
          className: 'p-1 pt-0',
          children: (0, a.jsx)(Pr, {
            to: s.url,
            onClick: i => {
              gn(i);
            },
            children: (0, a.jsxs)('div', {
              className: 'bg-background/60 space-y-1.5 rounded-xl px-3 py-2.5',
              children: [
                (0, a.jsxs)('div', {
                  className: 'flex items-center gap-1.5',
                  children: [
                    (0, a.jsxs)(Ma, {
                      className: 'size-4 rounded-xs',
                      children: [
                        (0, a.jsx)(ka, {src: gl(s.url)}),
                        (0, a.jsx)(Pa, {children: (0, a.jsx)(Cr, {className: 'size-3'})}),
                      ],
                    }),
                    (0, a.jsx)('p', {
                      className: 'text-primary line-clamp-1 text-sm font-medium',
                      children: s.title || sourceHost(s.url),
                    }),
                  ],
                }),
                o && (0, a.jsx)('p', {className: 'text-muted-foreground line-clamp-4 text-xs', children: o}),
              ],
            }),
          }),
        }),
      ],
    });
  },
  CITATION_ATTRIBUTES = ['refs'];
function sourceHost(e) {
  return xl(e).replace(/^www\./, '') || 'source';
}
var MARKDOWN_TAGS = {citation: [...CITATION_ATTRIBUTES], 'image-carousel': ['items']},
  VIEWABLE_TYPES = new Set([
    'application/pdf',
    'image/avif',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
  ]),
  DOWNLOAD_URL_TTL = 1e4,
  VIEW_URL_TTL = 6e4 /** Assistant text: markdown with citations and image carousels. */,
  AssistantText = (0, g.memo)(
    ({citationSourcesById, part, runId, sessionId}) => {
      const s = (0, g.useMemo)(() => {
          const i = Vn(part.text).replace(
            /\uE200citation\s+refs=(['"])([^'"<>\uE200\uE201]*)\1\s*\uE201/g,
            '<citation refs=$1$2$1></citation>',
          );
          return ji(Ai(i, sessionId));
        }, [part.text, sessionId]),
        o = (0, g.useMemo)(
          () => ({
            citation: ({refs, children}) =>
              (0, a.jsx)(Citation, {
                messageId: runId,
                refs: typeof refs == 'string' ? refs : void 0,
                sourcesById: citationSourcesById,
                children,
              }),
            a: i => (0, a.jsx)(MarkdownLink, {...i}),
            'image-carousel': ({items}) => {
              if (typeof items != 'string' || items.length === 0) return null;
              try {
                const c = JSON.parse(decodeURIComponent(items));
                return (0, a.jsx)(va, {imageClassName: 'bg-background', images: c, sessionId});
              } catch {
                return null;
              }
            },
          }),
          [citationSourcesById, runId, sessionId],
        );
      return (0, a.jsx)(ba, {
        className: 'w-full max-w-full min-w-0 overflow-visible bg-transparent pb-2',
        'data-testid': 'message-content',
        children: (0, a.jsx)(Yc, {allowedTags: MARKDOWN_TAGS, components: o, sessionId, children: s}),
      });
    },
    (e, t) =>
      e.part.text === t.part.text &&
      e.sessionId === t.sessionId &&
      e.runId === t.runId &&
      e.citationSourcesById === t.citationSourcesById,
  ) /** A markdown link; file links open or download the artifact. */,
  MarkdownLink = ({href, children, className, node, onClick, rel, target, ...c}) => {
    const l = async u => {
      onClick?.(u);
      const h = typeof href == 'string' ? href : void 0,
        d = artifactName(h);
      if (u.defaultPrevented || !h) return;
      if (!d) {
        await gn(u);
        return;
      }
      u.preventDefault();
      const m = window.open('', '_blank');
      m && (m.opener = null);
      try {
        const p = await ta(h);
        if (!p.ok) throw new Error(`Failed to fetch session file: ${p.status}`);
        const f = await p.blob(),
          x = URL.createObjectURL(f),
          b = p.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? '';
        VIEWABLE_TYPES.has(b) && m
          ? ((m.location.href = x), window.setTimeout(() => URL.revokeObjectURL(x), VIEW_URL_TTL))
          : (m?.close(), downloadUrl(x, d), window.setTimeout(() => URL.revokeObjectURL(x), DOWNLOAD_URL_TTL));
      } catch (p) {
        (m?.close(), de.error('There was an error opening the file.'), console.error(p));
      }
    };
    return (0, a.jsx)('a', {
      ...c,
      className: Y('text-primary font-medium wrap-anywhere underline', className),
      'data-streamdown': 'link',
      href: typeof href == 'string' ? href : void 0,
      onClick: l,
      rel,
      target,
      children,
    });
  };
function artifactName(e) {
  if (e?.includes('/files/content'))
    try {
      const t = new URL(e),
        n = t.searchParams.get('path');
      return !Si(t) || !n ? void 0 : ut(n) || 'artifact';
    } catch {
      return;
    }
}
function downloadUrl(e, t) {
  const n = document.createElement('a');
  ((n.href = e), (n.download = t), (n.rel = 'noreferrer'), document.body.append(n), n.click(), n.remove());
}
var WebStep = ({isLastItem, steps, children}) => {
    const r = hu(steps);
    let s = steps[r.stepIndex];
    return (
      s.call.name === 'webfetch' &&
        (s =
          steps.find(
            o =>
              o.call.name === 'webfetch' &&
              o.result &&
              !o.result.isError &&
              sa({...o, isStreaming: false}).icon.type === 'image',
          ) ?? s),
      (0, a.jsx)(Kt, {
        expandMode: 'manual',
        isActiveGroup: false,
        icon: dt(Ye(s.call.name).icon, s),
        inlineTimelineChildren: true,
        isLastItem,
        title: (0, a.jsx)('span', {title: r.fullText, children: r.text}),
        children,
      })
    );
  },
  isToolStep = e => e.part.type === 'toolCall';
function stepStatus(e, t) {
  return e.result ? 'done' : t === 'streaming' ? 'streaming' : t === 'stopped' ? 'stopped' : 'done';
}
var /** An assistant run’s tool steps, grouped, with subagents and coder runs set apart. */
  ToolSteps = ({
    hasNextStepsRow = false,
    hiddenToolCallIds = [],
    ungrouped = false,
    suspendedToolCallId,
    sessionId,
    status,
    steps,
  }) => {
    const c = status === 'streaming',
      l = steps
        .filter(isToolStep)
        .filter(d => !hiddenToolCallIds.includes(d.part.id))
        .map(d => ({
          step: d,
          props: mr(d.part, d.result, {isStreaming: c, sessionId, isSuspended: d.part.id === suspendedToolCallId}),
        }))
        .filter(({props}) => !Ye(props.call.name).hide?.(props)),
      u = ungrouped ? l.map(d => ({type: 'tool', step: d})) : Ja(l, ({props}) => Kn(props));
    if (u.length === 0) return null;
    const h = ({step, props}, p) => {
      const f = Ye(step.part.name);
      if (f.hide?.(props)) return null;
      const {title, icon, footer, expandMode, expandedContent} = f,
        y = aa(step.result);
      return (0, a.jsx)(
        Kt,
        {
          title: dt(title, props),
          icon: dt(icon, props),
          expandMode,
          footer: (0, a.jsxs)(a.Fragment, {children: [dt(footer, props), (0, a.jsx)(MessageImages, {images: y})]}),
          isActiveGroup: c,
          isLastItem: p,
          hideConnector: y.length > 0,
          bare: f.bare?.(props),
          children: dt(expandedContent, props),
        },
        pt(step),
      );
    };
    return (0, a.jsx)('div', {
      className: '[&+&]:-mt-2',
      children: u.map((d, m) => {
        const p = m === u.length - 1 && !hasNextStepsRow;
        switch (d.type) {
          case 'subagents':
            return (0, a.jsx)(
              SubagentSteps,
              {isLastItem: p, status, steps: d.steps.map(({step}) => step)},
              pt(d.steps[0].step),
            );
          case 'group':
            return (0, a.jsx)(
              WebStep,
              {
                isLastItem: p,
                steps: d.steps.map(({props}) => props),
                children: d.steps.map((f, x) => h(f, p && x === d.steps.length - 1)),
              },
              pt(d.steps[0].step),
            );
          case 'tool':
            return h(d.step, p);
          default:
            return d;
        }
      }),
    });
  } /** Subagent steps: running while any of them runs. */,
  SubagentSteps = ({steps, isLastItem, status}) => {
    const r = ha(),
      s = (0, g.useMemo)(() => new Map(r.map(c => [c.sessionId, c])), [r]),
      o = steps.some(c => {
        const {taskId} = c.result?.details ?? {},
          u = stepStatus(c, status) === 'streaming';
        return taskId ? (s.get(taskId)?.isRunning ?? u) : u;
      }),
      i = steps.length;
    return (0, a.jsx)(Kt, {
      expandMode: 'force-open',
      icon: (0, a.jsx)(Rt, {color: 'mono'}),
      isActiveGroup: o,
      isLastItem,
      contentClassName: '-ml-[30px] w-[calc(100%+30px)] [&>div]:pb-1 [&>div]:pt-1.5',
      title: `${o ? 'Running' : 'Ran'} ${i} Subagent${i === 1 ? '' : 's'}`,
      children: (0, a.jsx)('div', {
        className: 'flex flex-col pl-[34px]',
        children: steps.map(c => {
          const {taskId} = c.result?.details ?? {};
          return (0, a.jsx)(
            SubagentStep,
            {item: taskId ? s.get(taskId) : void 0, step: c, taskId},
            taskId ?? c.part.id,
          );
        }),
      }),
    });
  },
  SubagentStep = ({item, step, taskId}) => {
    const r = Ut(),
      s = $t(),
      o = (0, g.useCallback)(() => {
        if (taskId) {
          if (s) {
            s.openSubagents(taskId);
            return;
          }
          r(taskId);
        }
      }, [taskId, s, r]),
      i = step.part.arguments,
      c = item?.description ?? i.description ?? 'Subagent';
    return (0, a.jsx)(Xc, {
      description: c,
      color: item?.color,
      model: item && (0, a.jsx)(gr, {actualModel: la(item), model: item.model}),
      time: item && (0, a.jsx)(xr, {item}),
      activity: item && (0, a.jsx)(ua, {item}),
      isRunning: item?.isRunning,
      onClick: o,
    });
  },
  MessageImages = ({images}) =>
    images.length === 0
      ? null
      : (0, a.jsx)(va, {
          imageClassName: 'bg-background size-40 max-w-none object-cover transition hover:shadow-lg',
          itemClassName: 'basis-auto',
          images: images.map((t, n) => ({alt: `Image ${n + 1}`, src: `data:${t.mimeType};base64,${t.data}`})),
        }) /** FileActions: open, reveal, copy the path of, or delete a file a run touched. */,
  vo = ({children, path, enabled = true, showDefaultAppBadge = true}) => {
    const {currentSession} = me(),
      {accountId} = ge(),
      i = Ce(),
      c = _e(),
      {copy} = ar(),
      {confirm} = lr(),
      [h, d] = (0, g.useState)(false),
      [m, p] = (0, g.useState)(false),
      [f, x] = (0, g.useState)(ut(path)),
      b = fn(),
      v = {path, accountId, session: {id: currentSession.id}},
      C = Fe(i.meta.listOpenApps.queryOptions(v, {enabled: enabled && h, staleTime: 6e4})),
      S = ve(i.meta.copyFile.mutationOptions()),
      y = ve(i.meta.openWith.mutationOptions()),
      k = ve(i.meta.open.mutationOptions()),
      M = ve(i.sessions.files.rename.mutationOptions()),
      w = ve(i.sessions.files.delete.mutationOptions()),
      I = () => {
        c.invalidateQueries(i.sessions.files.list.queryFilter({sessionId: currentSession.id, accountId}));
      };
    if (!enabled) return children;
    const R = async () => {
        try {
          (await S.mutateAsync(v), de.success('Copied'));
        } catch (U) {
          (de.error('There was an error copying the file.'), console.error(U));
        }
      },
      j = async () => {
        try {
          const {absolutePath} = await c.fetchQuery(i.meta.resolvePath.queryOptions(v));
          (await copy(absolutePath)) && de.success('Path copied');
        } catch (U) {
          (de.error('There was an error copying the path.'), console.error(U));
        }
      },
      N = async () => {
        try {
          await k.mutateAsync({...v, mode: 'reveal'});
        } catch (U) {
          (de.error(b.revealError), console.error(U));
        }
      },
      O = async U => {
        try {
          await y.mutateAsync({...v, appPath: U});
        } catch (ae) {
          (de.error('There was an error opening the file.'), console.error(ae));
        }
      },
      W = async U => {
        U.preventDefault();
        const ae = f.trim();
        if (!ae || ae === ut(path)) {
          p(false);
          return;
        }
        try {
          (await M.mutateAsync({sessionId: currentSession.id, accountId, path, name: ae}), I(), p(false));
        } catch (_) {
          (de.error('There was an error renaming the file.'), console.error(_));
        }
      },
      se = () => {
        const U = ut(path);
        confirm(
          {
            title: `Delete “${U}”?`,
            description: 'This will permanently delete the file from this task.',
            ui: {action: 'Delete', variant: 'destructive'},
          },
          async () => {
            try {
              (await w.mutateAsync({sessionId: currentSession.id, accountId, path}), I());
            } catch (ae) {
              (de.error('There was an error deleting the file.'), console.error(ae));
            }
          },
        );
      };
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsxs)(ni, {
          open: h,
          onOpenChange: d,
          children: [
            (0, a.jsx)(di, {render: children}),
            (0, a.jsx)(ai, {
              className: 'w-52',
              onClick: U => U.stopPropagation(),
              children: (0, a.jsxs)(ii, {
                children: [
                  (0, a.jsx)(Ge, {onClick: R, children: (0, a.jsx)('span', {children: 'Copy file'})}),
                  (0, a.jsx)(Ge, {onClick: j, children: (0, a.jsx)('span', {children: 'Copy path'})}),
                  (0, a.jsx)(Vr, {}),
                  (0, a.jsx)(Ge, {onClick: N, children: (0, a.jsx)('span', {children: b.revealLabel})}),
                  (0, a.jsxs)(ti, {
                    children: [
                      (0, a.jsx)(si, {children: (0, a.jsx)('span', {children: 'Open with...'})}),
                      (0, a.jsx)(mi, {
                        className: 'max-h-72 w-56 overflow-y-auto',
                        children: C.isLoading
                          ? (0, a.jsxs)(Ge, {
                              disabled: true,
                              children: [
                                (0, a.jsx)(kt, {className: 'size-3.5'}),
                                (0, a.jsx)('span', {children: 'Loading apps…'}),
                              ],
                            })
                          : C.isError
                            ? (0, a.jsx)(Ge, {
                                disabled: true,
                                children: (0, a.jsx)('span', {children: 'Failed to load apps'}),
                              })
                            : C.data?.apps.length
                              ? C.data.apps.map(U =>
                                  (0, a.jsxs)(
                                    Ge,
                                    {
                                      onClick: () => O(U.appPath),
                                      children: [
                                        U.iconDataUrl
                                          ? (0, a.jsx)('img', {alt: '', src: U.iconDataUrl, className: 'size-4'})
                                          : (0, a.jsx)('span', {className: 'size-4'}),
                                        (0, a.jsx)('span', {className: 'truncate', children: U.appName}),
                                        showDefaultAppBadge && U.default
                                          ? (0, a.jsx)('span', {
                                              className: 'text-muted-foreground ml-auto text-xs',
                                              children: 'Default',
                                            })
                                          : null,
                                      ],
                                    },
                                    U.appPath,
                                  ),
                                )
                              : (0, a.jsx)(Ge, {
                                  disabled: true,
                                  children: (0, a.jsx)('span', {children: 'No apps available'}),
                                }),
                      }),
                    ],
                  }),
                  (0, a.jsx)(Vr, {}),
                  (0, a.jsx)(Ge, {
                    onClick: () => {
                      (x(ut(path)), p(true));
                    },
                    children: (0, a.jsx)('span', {children: 'Rename'}),
                  }),
                  (0, a.jsx)(Ge, {
                    variant: 'destructive',
                    disabled: w.isPending,
                    onClick: se,
                    children: (0, a.jsx)('span', {children: 'Delete'}),
                  }),
                ],
              }),
            }),
          ],
        }),
        (0, a.jsx)(Hs, {
          open: m,
          onOpenChange: p,
          children: (0, a.jsxs)(Gs, {
            children: [
              (0, a.jsx)(pi, {children: (0, a.jsx)(gi, {children: 'Rename'})}),
              (0, a.jsx)('form', {
                id: `rename-artifact-form-${path}`,
                onSubmit: W,
                children: (0, a.jsx)(vi, {autoFocus: true, value: f, onChange: U => x(U.currentTarget.value)}),
              }),
              (0, a.jsxs)(fi, {
                children: [
                  (0, a.jsx)(oi, {disabled: M.isPending, children: 'Cancel'}),
                  (0, a.jsxs)(ri, {
                    type: 'submit',
                    form: `rename-artifact-form-${path}`,
                    disabled: M.isPending || !f.trim(),
                    children: [M.isPending && (0, a.jsx)(kt, {}), (0, a.jsx)('span', {children: 'Rename'})],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  } /** The files a run changed: one created file, or the list. */,
  ChangedFiles = ({files}) => {
    if (files.length === 0) return null;
    const t = files.length === 1 && files[0]?.type === 'created' ? files[0] : void 0;
    return t ? (0, a.jsx)(CreatedFile, {file: t}) : (0, a.jsx)(ChangedFileList, {files});
  },
  CreatedFile = ({file}) => {
    const {currentSession} = me(),
      n = Eo(),
      r = ut(file.path);
    return (0, a.jsx)(vo, {
      path: file.path,
      showDefaultAppBadge: false,
      children: (0, a.jsxs)('button', {
        type: 'button',
        className:
          'bg-surface-primary ring-border hover:bg-muted/40 mt-3 flex w-full items-center gap-1 overflow-hidden rounded-xl px-2 text-left ring-[0.5px] transition-colors',
        onClick: () => {
          n(file.path);
        },
        children: [
          (0, a.jsx)(Pc, {className: 'size-[48px] rounded-md', path: file.path, sessionId: currentSession.id}),
          (0, a.jsxs)('div', {
            className: 'flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2',
            children: [
              (0, a.jsx)('p', {
                className: 'text-muted-foreground text-xs font-medium tracking-wide',
                children: 'Created file',
              }),
              (0, a.jsx)('p', {className: 'text-foreground text-sm font-medium', children: r}),
            ],
          }),
        ],
      }),
    });
  },
  ChangedFileList = ({files}) => {
    const t = Eo(),
      n = files.length === 1 ? '1 File Changed' : `${files.length} Files Changed`;
    return (0, a.jsxs)('div', {
      className: 'bg-surface-primary ring-border mt-3 overflow-hidden rounded-xl ring-[0.5px]',
      children: [
        (0, a.jsx)('div', {
          className: 'px-3 pt-2.5 pb-1',
          children: (0, a.jsx)('p', {
            className: 'text-muted-foreground text-xs font-medium tracking-wide',
            children: n,
          }),
        }),
        (0, a.jsx)('div', {
          className: 'flex flex-col gap-0.5 px-1 pb-1',
          children: files.map(r => {
            const s = ut(r.path);
            return (0, a.jsx)(
              vo,
              {
                path: r.path,
                showDefaultAppBadge: false,
                children: (0, a.jsxs)(J, {
                  variant: 'ghost',
                  className: 'h-9 w-full justify-start gap-2 px-2 font-normal',
                  onClick: () => {
                    t(r.path);
                  },
                  children: [
                    (0, a.jsx)(ln, {className: 'text-muted-foreground size-4 shrink-0', filename: s}),
                    (0, a.jsx)(Pi, {className: 'min-w-0 grow text-left text-sm', children: s}),
                  ],
                }),
              },
              r.path,
            );
          }),
        }),
      ],
    });
  },
  ActionBar = ({className, children, ...n}) =>
    (0, a.jsx)('div', {className: Y('flex items-center gap-0', className), ...n, children}),
  ActionButton = ({tooltip, children, label, className, variant = 'ghost', size = 'icon-xs', ...i}) => {
    const c = (0, a.jsxs)(J, {
      className: Y(
        "text-muted-foreground hover:text-foreground relative [&_svg:not([class*='size-'])]:size-3.5",
        className,
      ),
      size,
      type: 'button',
      variant,
      ...i,
      children: [children, (0, a.jsx)('span', {className: 'sr-only', children: label || tooltip})],
    });
    return tooltip
      ? (0, a.jsxs)(Ae, {
          children: [(0, a.jsx)(Pe, {render: c}), (0, a.jsx)(Ie, {children: (0, a.jsx)('p', {children: tooltip})})],
        })
      : c;
  };
function copyText(e, t) {
  if (e.role === 'user') {
    if (typeof e.content == 'string') return e.content.trim();
    const n = [];
    for (const r of e.content)
      if (r.type === 'text') {
        const s = r.text.trim();
        s && n.push(s);
      }
    return n
      .join(
        `
`,
      )
      .trim();
  }
  if (e.role === 'assistant') {
    const n = [];
    for (const r of e.content)
      if (r.type === 'text') {
        const s = r.text.trim();
        s && n.push(s);
      }
    return citationsAsLinks(
      kc(
        n
          .join(
            `
`,
          )
          .trim(),
      ),
      t ?? new Map(),
    );
  }
  return '';
}
function useBranchSession(e) {
  const {accountId} = ge(),
    n = Ce(),
    r = _e(),
    s = Aa(),
    o = ve(n.sessions.branch.mutationOptions()),
    i = Ut();
  return (0, g.useCallback)(async () => {
    if (!(!s?.currentSession.id || !e))
      try {
        const c = await o.mutateAsync({sessionId: s.currentSession.id, messageId: e, accountId});
        (await r.invalidateQueries(n.sessions.listPreviewItems.queryFilter({accountId})),
          await r.invalidateQueries(n.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
          await i(c.session.id, {replace: true}));
      } catch (c) {
        de.error(c instanceof Error ? c.message : 'Failed to branch the session.');
      }
  }, [accountId, s, o, e, i, r, n]);
}
function messageTime(e) {
  const t = (0, at.default)(e);
  return t.isSame((0, at.default)(), 'day') ? t.format('hh:mm A') : t.format('dddd hh:mm A');
}
var useCopyMessage = (e, t) => {
  const {copy} = ar();
  return (0, g.useCallback)(async () => {
    const r = copyText(e, t);
    if (!r) {
      de.error("There's no text to copy!");
      return;
    }
    (await copy(r)) && de.success('Copied to clipboard!');
  }, [copy, e, t]);
};
function UserMessageActions({message, onEdit}) {
  const n = useCopyMessage(message),
    r = messageTime(message.timestamp);
  return (0, a.jsxs)(ActionBar, {
    className:
      'justify-en -mr-0.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100',
    children: [
      (0, a.jsx)('span', {className: 'text-muted-foreground mr-1 text-[13px] font-medium select-none', children: r}),
      (0, a.jsx)(ActionButton, {onClick: n, tooltip: 'Copy', children: (0, a.jsx)(sr, {})}),
      onEdit &&
        (0, a.jsx)(ActionButton, {
          'data-testid': 'message-edit-button',
          onClick: onEdit,
          tooltip: 'Edit',
          children: (0, a.jsx)(qc, {}),
        }),
    ],
  });
} /** An assistant message’s actions: copy, retry, branch, memory updates and time. */
function AssistantActions({
  alwaysVisible = false,
  citationSourcesById,
  isDone,
  isStreaming,
  memoryExtraction,
  message,
  messageId,
}) {
  const {accountId} = ge(),
    l = Yo(),
    u = Aa(),
    h = useBranchSession(messageId),
    d = useCopyMessage(message, citationSourcesById),
    m = messageTime(message.timestamp),
    p = (0, g.useCallback)(
      f => {
        l({to: '/u/$userId/settings/memories/files', params: {userId: String(accountId)}, search: {path: f}});
      },
      [accountId, l],
    );
  return isStreaming || !isDone
    ? null
    : (0, a.jsxs)('div', {
        className: Y(
          '-ml-0.5 flex min-h-6 items-center gap-1.5 transition-opacity focus-visible:opacity-100',
          alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover/message:opacity-100',
        ),
        children: [
          (0, a.jsxs)(ActionBar, {
            className: '-ml-0.5',
            children: [
              (0, a.jsx)(ActionButton, {onClick: d, tooltip: 'Copy', children: (0, a.jsx)(sr, {})}),
              u &&
                !u.currentSession.parentId &&
                (0, a.jsx)(ActionButton, {
                  'data-slot': 'branch-action',
                  disabled: !messageId,
                  onClick: h,
                  tooltip: 'Branch',
                  children: (0, a.jsx)(Jl, {}),
                }),
              memoryExtraction &&
                (0, a.jsxs)(Ae, {
                  disableHoverablePopup: false,
                  children: [
                    (0, a.jsx)(Pe, {
                      render: (0, a.jsxs)(J, {
                        className:
                          "text-muted-foreground hover:text-foreground relative [&_svg:not([class*='size-'])]:size-3.5",
                        size: 'icon-xs',
                        type: 'button',
                        variant: 'ghost',
                        children: [
                          (0, a.jsx)(Ac, {}),
                          (0, a.jsx)('span', {className: 'sr-only', children: 'Memory updated'}),
                        ],
                      }),
                    }),
                    (0, a.jsxs)(Ie, {
                      className: 'flex max-w-72 flex-col items-start gap-1.5 py-2',
                      children: [
                        (0, a.jsx)('p', {className: 'text-muted-foreground font-medium', children: 'Memory updated'}),
                        (0, a.jsx)(vr, {
                          className: 'prose-sm text-[13px] leading-5 font-normal',
                          children: memoryExtraction.summary,
                        }),
                        memoryExtraction.files.length > 0 &&
                          (0, a.jsx)('div', {
                            className: 'flex max-w-full flex-wrap gap-1',
                            children: memoryExtraction.files.map(f =>
                              (0, a.jsxs)(
                                Bs,
                                {
                                  className: 'hover:bg-muted h-5 max-w-full cursor-pointer gap-1 truncate',
                                  render: (0, a.jsx)('button', {type: 'button', onClick: () => p(f.path)}),
                                  size: 'sm',
                                  variant: 'secondary',
                                  children: [
                                    (0, a.jsx)(ln, {
                                      className: 'text-muted-foreground size-3 shrink-0',
                                      'data-icon': 'inline-start',
                                      filename: f.path,
                                    }),
                                    (0, a.jsx)('span', {className: 'truncate text-xs', children: f.path}),
                                    (f.addedLines > 0 || f.removedLines > 0) &&
                                      (0, a.jsxs)('span', {
                                        className: 'flex shrink-0 items-center gap-0.5 text-xs tabular-nums',
                                        children: [
                                          f.addedLines > 0 &&
                                            (0, a.jsxs)('span', {
                                              className: 'text-green-500',
                                              children: ['+', f.addedLines],
                                            }),
                                          f.removedLines > 0 &&
                                            (0, a.jsxs)('span', {
                                              className: 'text-rose-500',
                                              children: ['-', f.removedLines],
                                            }),
                                        ],
                                      }),
                                  ],
                                },
                                f.path,
                              ),
                            ),
                          }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
          (0, a.jsx)('span', {className: 'text-muted-foreground text-[13px] font-medium select-none', children: m}),
        ],
      });
}
var UserMessageActionsMemo = (0, g.memo)(UserMessageActions),
  AssistantActionsMemo = (0, g.memo)(AssistantActions),
  bubbleVariants = Rs('w-full min-w-0', {
    variants: {
      role: {user: 'max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]', assistant: 'max-w-full'},
      mode: {view: '', edit: 'max-w-full'},
    },
    defaultVariants: {mode: 'view'},
  }); /** A message’s frame: its role, width and steering state. */
function MessageFrame({role, mode = 'view', children, steeringState}) {
  return (0, a.jsx)('div', {
    className: 'group/message w-full',
    'data-role': role,
    'data-testid': `message-${role}`,
    'data-steering-state': steeringState,
    children: (0, a.jsx)(Gc, {className: bubbleVariants({role, mode}), from: role, children}),
  });
}
var /** AssistantRun: a run’s text and steps, its errors and payment prompts, and its actions. */
  Om = (0, g.memo)(({itemWindow, row, state}) => {
    const {
        alwaysVisibleAssistantRunId,
        canChangePlan,
        hideAssistantActions,
        isReadonly,
        onAddCreditsClick,
        onPaymentRequiredClick,
        onRetryAssistant,
        paymentRequiredCreditRefreshAt,
        paymentRequiredPlan,
        pendingToolCallId,
        sessionId,
      } = Sn(),
      f = no(),
      {broadcast} = Ls(),
      b = !isReadonly && !hideAssistantActions && !row.isHandoff,
      v = itemWindow.items,
      C = row.assistantMessages.at(-1);
    if (!C || v.length === 0) return null;
    const S = `agent-run/${row.runId}/`,
      y = `agent-run/${row.renderKey ?? row.runId}/`,
      k = f?.runId === row.runId ? f.steps.map(j => j.part.id) : [],
      M = C.stopReason === 'aborted',
      w = C.provider === 'aux',
      I = !isReadonly && (M || C.stopReason === 'error'),
      R = () => broadcast(da, {sessionId});
    return (0, a.jsxs)(MessageFrame, {
      role: 'assistant',
      children: [
        v.map((j, N) => {
          const O = j.key.startsWith(S) ? y + j.key.slice(S.length) : j.key;
          return j.type === 'steps'
            ? (0, a.jsx)(
                ToolSteps,
                {
                  hasNextStepsRow: hasToolCalls(v[N + 1]) || (N === v.length - 1 && itemWindow.hasNextStepsRow),
                  sessionId,
                  status: j.status,
                  suspendedToolCallId: pendingToolCallId,
                  steps: j.steps,
                  hiddenToolCallIds: k,
                },
                O,
              )
            : j.type === 'error'
              ? (0, a.jsx)(
                  Wc,
                  {
                    actions: {
                      addCredits: w ? onAddCreditsClick : void 0,
                      report: R,
                      retry: I ? onRetryAssistant : void 0,
                      upgrade: w && canChangePlan ? onPaymentRequiredClick : void 0,
                    },
                    classified: Zo({
                      aborted: M,
                      errorMessage: j.errorMessage,
                      provider: C.provider,
                      diagnostics: C.diagnostics,
                      billing: {plan: paymentRequiredPlan, creditRefreshAt: paymentRequiredCreditRefreshAt},
                    }),
                    children: (0, a.jsx)(Qc, {}),
                  },
                  O,
                )
              : (0, a.jsx)(
                  AssistantText,
                  {citationSourcesById: row.metadata.citationSourcesById, part: j.part, runId: row.runId, sessionId},
                  O,
                );
        }),
        itemWindow.showActions &&
          (0, a.jsxs)(a.Fragment, {
            children: [
              row.createdRoutines?.map(j => (0, a.jsx)(RoutineCard, {routine: j}, j.id)),
              !!row.generatedFiles?.length && (0, a.jsx)(ChangedFiles, {files: row.generatedFiles}),
            ],
          }),
        b &&
          itemWindow.showActions &&
          (0, a.jsx)(AssistantActionsMemo, {
            alwaysVisible: row.runId === alwaysVisibleAssistantRunId,
            citationSourcesById: row.metadata.citationSourcesById,
            isDone: gh(C),
            isStreaming: row.isStreaming,
            memoryExtraction: row.memoryExtraction,
            message: C,
            messageId: state.messageId,
          }),
      ],
    });
  }),
  hasToolCalls = e =>
    e?.type === 'steps' &&
    e.steps.some(t => t.part.type === 'toolCall'); /** The divider in a branched session that links to the parent. */
function BranchedFrom({parentSession}) {
  const t = Ut();
  return (0, a.jsxs)('div', {
    className:
      'text-muted-foreground hover:text-secondary-foreground my-2 flex min-w-0 items-center gap-3 text-xs font-medium transition-colors',
    children: [
      (0, a.jsx)('div', {className: 'bg-accent h-px flex-1'}),
      (0, a.jsxs)('div', {
        className: 'flex min-w-0 items-center gap-1 whitespace-nowrap',
        children: [
          (0, a.jsx)(nu, {className: 'size-4 shrink-0'}),
          (0, a.jsx)('span', {children: 'Branched from'}),
          (0, a.jsx)('button', {
            className: 'text-brand-content/80 max-w-64 min-w-0 truncate underline-offset-2 hover:underline',
            onClick: () => {
              t(parentSession.id);
            },
            type: 'button',
            children: parentSession.title,
          }),
        ],
      }),
      (0, a.jsx)('div', {className: 'bg-accent h-px flex-1'}),
    ],
  });
}
var RetryingRow = ({attempt, maxAttempts}) =>
  (0, a.jsx)('div', {
    className: 'text-muted-foreground flex flex-col gap-2 px-2 py-1 text-sm',
    children: `Retrying... ${attempt}/${maxAttempts}`,
  });
function ReconnectRow({phase, message}) {
  return (0, a.jsxs)('div', {
    className: 'flex flex-col gap-2 px-2 py-1 text-sm',
    children: [
      (0, a.jsx)('div', {
        className: Y('text-muted-foreground', phase === 'failed' && 'text-foreground'),
        children: phase === 'failed' ? 'Could not reconnect' : 'Reconnecting…',
      }),
      phase === 'failed' && message && (0, a.jsx)('div', {className: 'text-muted-foreground', children: message}),
    ],
  });
}
var /** StatusRow: compaction, retry, reconnect and error rows. */
  Um = ({row}) => {
    if (row.type === 'compacting') {
      const t =
        row.state === 'running'
          ? 'Context automatically compacting'
          : row.state === 'error'
            ? 'Compaction failed'
            : 'Context compacted';
      return (0, a.jsx)(Kt, {
        icon: (0, a.jsx)(gc, {className: 'opacity-55'}),
        title:
          row.state === 'running'
            ? (0, a.jsx)(an, {as: 'span', children: t})
            : (0, a.jsx)('span', {className: row.state === 'error' ? 'text-destructive' : void 0, children: t}),
        expandMode: row.state === 'done' && row.summary?.trim() ? 'manual' : 'none',
        isActiveGroup: false,
        isLastItem: true,
        children:
          row.state === 'done' && row.summary?.trim()
            ? (0, a.jsx)(vr, {className: 'text-muted-foreground max-h-64 overflow-y-auto', children: row.summary})
            : null,
      });
    }
    return row.type === 'session-branch'
      ? (0, a.jsx)(BranchedFrom, {parentSession: row.parentSession})
      : row.type === 'retrying'
        ? (0, a.jsx)(RetryingRow, {attempt: row.retry.attempt, maxAttempts: row.retry.maxAttempts})
        : row.type === 'reconnecting'
          ? (0, a.jsx)(ReconnectRow, {message: row.reconnect.error ?? void 0, phase: row.reconnect.phase})
          : row.type === 'error'
            ? (0, a.jsx)(ErrorRow, {message: row.message})
            : row.type === 'generated-files'
              ? (0, a.jsx)(ChangedFiles, {files: row.files})
              : null;
  },
  ErrorRow = ({message}) =>
    (0, a.jsxs)('div', {
      className:
        'border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-xl border px-3 py-2 text-sm',
      children: [
        (0, a.jsx)(Tc, {className: 'mt-0.5 size-4 shrink-0'}),
        (0, a.jsx)('span', {className: 'min-w-0 flex-1 wrap-break-word', children: message}),
      ],
    }) /** SystemRow: a routine trigger, a memory signal or a message from another agent. */,
  Km = ({row}) => {
    const {copy} = ar(),
      {accountId} = ge(),
      r = x => {
        const b = row.metadata?.[x];
        return typeof b == 'string' ? b : void 0;
      },
      s = r('routineId'),
      o = r('fromSessionId'),
      i = row.kind === 'routine_trigger',
      c = row.kind === 'agent_message',
      l = c && r('report') !== void 0,
      u = r('fromTitle'),
      h = i
        ? {
            label: 'Triggered by',
            name: r('routineName') ?? 'Routine',
            href: s ? pageHref(`/u/${accountId}/settings/routines/${encodeURIComponent(s)}`) : void 0,
            icon: Ki,
          }
        : c
          ? {
              label: 'Message from',
              name: l ? ['Aux Code', u].filter(Boolean).join(' · ') : u || 'another agent',
              href: o ? pageHref(`/u/${accountId}/tasks/${encodeURIComponent(o)}`) : void 0,
              icon: l ? oa : hn,
            }
          : void 0,
      d = i ? afterFirstParagraph(row.content) : c ? (r('text') ?? row.content) : row.content,
      m = (0, g.useCallback)(async () => {
        if (!d) {
          de.error("There's no text to copy!");
          return;
        }
        (await copy(d)) && de.success('Copied to clipboard!');
      }, [copy, d]),
      [p, f] = (0, g.useState)(false);
    return !h && row.kind !== 'memory_signal'
      ? null
      : (0, a.jsxs)(MessageFrame, {
          role: 'user',
          children: [
            h
              ? (0, a.jsx)(SystemSource, {...h})
              : (0, a.jsxs)('div', {
                  className: 'text-muted-foreground ml-auto flex w-fit items-center gap-1 opacity-50',
                  children: [
                    (0, a.jsx)('span', {className: 'text-xs font-medium select-none', children: 'System Notification'}),
                    (0, a.jsx)(Oi, {className: 'size-3'}),
                  ],
                }),
            h
              ? (0, a.jsx)(CollapsibleText, {text: d, collapsedLines: 3})
              : (0, a.jsxs)('div', {
                  className: 'bg-secondary -mt-1 ml-auto max-w-full rounded-xl px-2.5 py-1.5',
                  'data-testid': 'message-content',
                  children: [
                    (0, a.jsx)('div', {
                      className:
                        'text-muted-foreground ml-auto flex w-fit items-center gap-1.5 text-[13px] leading-[16px] select-none [&>svg]:size-3 [&>svg]:min-w-3',
                      children: 'Memory signal',
                    }),
                    p &&
                      (0, a.jsx)('pre', {
                        className: 'max-h-50 overflow-y-auto pt-1 whitespace-pre-wrap',
                        children: row.content,
                      }),
                  ],
                }),
            (0, a.jsx)('div', {
              className:
                '-mt-1.5 ml-auto flex min-h-6 items-center gap-1.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-visible:opacity-100',
              children: (0, a.jsxs)(ActionBar, {
                className: '-ml-0.5',
                children: [
                  !h &&
                    (0, a.jsx)(ActionButton, {
                      onClick: () => f(x => !x),
                      tooltip: p ? 'Hide system message' : 'Show system message',
                      children: p ? (0, a.jsx)(Mr, {}) : (0, a.jsx)(Vi, {}),
                    }),
                  (0, a.jsx)(ActionButton, {onClick: m, tooltip: 'Copy', children: (0, a.jsx)(sr, {})}),
                ],
              }),
            }),
          ],
        });
  },
  pageHref = e => pn(e),
  SystemSource = ({label, name, href, icon}) =>
    (0, a.jsxs)('div', {
      className: 'text-muted-foreground ml-auto flex max-w-full items-baseline gap-1 text-xs font-medium',
      children: [
        (0, a.jsx)('span', {className: 'shrink-0 select-none', children: label}),
        href
          ? (0, a.jsxs)('a', {
              className:
                'text-brand-content decoration-brand/20 min-w-0 wrap-anywhere decoration-dotted underline-offset-2 hover:underline',
              href,
              target: '_blank',
              rel: 'noreferrer',
              onClick: wr,
              children: [
                (0, a.jsx)(icon, {
                  'aria-hidden': 'true',
                  className: 'mr-1 inline-block size-3.5 align-[-0.125em] text-current',
                }),
                name,
              ],
            })
          : (0, a.jsx)('span', {children: name}),
      ],
    }),
  afterFirstParagraph = e =>
    e.match(/\r?\n\r?\n([\s\S]*)$/)?.[1] ??
    e /** UserMessage: a user message, its attachments and actions, and editing it. */,
  Gm = (0, g.memo)(({row, state}) => {
    const {isReadonly, sessionId} = Sn(),
      {currentSession} = me(),
      o = Kr(row.messageKey),
      i = Kr(row.metadataKey),
      c = Nt(),
      l = pa(),
      [u, h] = (0, g.useState)('view'),
      d = (0, g.useMemo)(
        () =>
          o?.role === 'steering' &&
          l.some(M => {
            const w = c.getState().messagesByKey[M];
            return w?.role === 'user' && w.metadata?.steer && w.metadata.steeringMessageId === o.id;
          }),
        [o, l, c],
      ),
      m = currentSession.trigger?.type === 'standalone-routine' && row.messageIndex === 0;
    if (!o) return null;
    const p = o.role === 'steering',
      f = p ? {role: 'user', content: o.content, timestamp: o.timestamp} : o,
      x = p ? {role: 'user-message-metadata', attachments: o.attachments, timestamp: o.timestamp} : i,
      {messageId} = state,
      v = mo(f, x),
      C = v.attachments.length > 0 || v.textBlocks.length > 0 || u === 'edit',
      S = !isReadonly && C && !p,
      y = () => {
        h('edit');
      },
      k = () => {
        h('view');
      };
    return (0, a.jsxs)(MessageFrame, {
      mode: u,
      role: 'user',
      steeringState: p ? (d ? 'consumed' : 'pending') : void 0,
      children: [
        (0, a.jsx)(MessageAttachments, {attachments: v.attachments, sessionId}),
        (0, a.jsx)(UserMessageBody, {
          message: f,
          messageId,
          messageIndex: row.messageIndex,
          mode: u,
          metadata: x,
          onEditSubmitted: k,
          onCancelEdit: k,
          renderable: v,
        }),
        S &&
          (0, a.jsx)('div', {
            className: 'flex min-h-6 items-center justify-end',
            children: (0, a.jsx)(UserMessageActionsMemo, {message: f, onEdit: m ? void 0 : y}),
          }),
      ],
    });
  }); /** A value that holds for a moment before changing, so the activity line does not flicker. */
function useSteadyValue(e, t, n, r = 1e3) {
  const [s, o] = (0, g.useState)(() => ({key: e, since: Date.now()})),
    i = (0, g.useRef)(t);
  return (
    (0, g.useLayoutEffect)(() => {
      if (e === s.key) {
        i.current = t;
        return;
      }
      const c = () => {
          ((i.current = t), o({key: e, since: Date.now()}));
        },
        l = n ? r - (Date.now() - s.since) : 0;
      if (l <= 0) {
        c();
        return;
      }
      const u = setTimeout(c, l);
      return () => clearTimeout(u);
    }, [e, t, n, r, s]),
    !n || e === s.key ? t : i.current
  );
} /** The live activity line: the current tool or Thinking. */
function ActivityLine({active, thinkingHeader = 'Thinking', defer = true}) {
  const r = active ? `tool:${active.call.id}` : 'thinking',
    s = useSteadyValue(r, {key: r, active, thinkingHeader}, defer),
    o = s.active ? Ye(s.active.call.name) : void 0,
    i = (0, a.jsxs)(a.Fragment, {
      children: [
        s.active &&
          o &&
          (0, a.jsx)('span', {
            className: '-ml-1 flex size-6 shrink-0 items-center justify-center',
            children: dt(o.icon, s.active),
          }),
        (0, a.jsx)('span', {
          className: 'min-w-0 truncate',
          children: s.active && o ? dt(o.title, s.active) : (0, a.jsx)(an, {as: 'span', children: s.thinkingHeader}),
        }),
      ],
    });
  return (0, a.jsx)('span', {
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
    className: 'text-muted-foreground grid min-w-0',
    children: (0, a.jsx)(Sr, {initial: false, children: (0, a.jsx)(ActivityFrame, {children: i}, s.key)}),
  });
}
function ActivityFrame({children}) {
  const t = Vs(),
    n = ul();
  return (0, a.jsx)(Mt.span, {
    'aria-hidden': !n || void 0,
    'data-activity-current': n,
    className: 'flex min-h-6 min-w-0 items-center gap-1.5 [grid-area:1/1]',
    initial: {y: t ? 0 : 8, opacity: 0, filter: t ? 'none' : 'blur(2px)'},
    animate: {y: 0, opacity: 1, filter: 'none'},
    exit: {y: t ? 0 : -8, opacity: 0, filter: t ? 'none' : 'blur(2px)', transition: {duration: t ? 0 : 0.15}},
    transition: {duration: t ? 0 : 0.15, delay: t ? 0 : 0.05, ease: 'easeInOut'},
    children,
  });
}
var /** LiveActivity: the activity line while the agent works. */
  Zm = () => {
    const e = no();
    return e ? (0, a.jsx)(ActivityTimeline, {activity: e}) : null;
  },
  ActivityTimeline = ({activity}) => {
    const {sessionId} = Sn(),
      {active, steps, thinkingHeader} = activity;
    return (0, a.jsx)(Kt, {
      expandMode: 'manual',
      isActiveGroup: true,
      isLastItem: true,
      inlineTimelineChildren: true,
      icon: null,
      title: (0, a.jsx)(ActivityLine, {active, thinkingHeader, defer: !!activity.runId}),
      children:
        steps.length > 0 ? (0, a.jsx)(ToolSteps, {sessionId, status: 'streaming', steps, ungrouped: true}) : null,
    });
  },
  HOUR = 36e5; /** turnSummaries: each turn’s question, first and last activity, and start. */
function t0(e) {
  let t = false,
    n;
  return e.map(r => {
    const s = r.find(({row}) => row.turn)?.row.turn,
      o = r.find(({row}) => row.type === 'message' && !row.isSteer)?.row,
      i = r.find(({row}) => row.type === 'assistant-activity')?.row,
      c = r.findLast(({row}) => row.type === 'assistant-activity')?.row,
      l =
        s?.startedAt ??
        (o?.type === 'message' ? o.timestamp : void 0) ??
        (i?.type === 'assistant-activity' ? i.assistantMessages[0]?.timestamp : void 0);
    if (l === void 0 || !Number.isFinite(l)) return;
    let u;
    return (
      (!t || (n !== void 0 && Number.isFinite(n) && l - n > HOUR)) && (u = l),
      (t = true),
      (n =
        s?.finalStartedAt ??
        (c?.type === 'assistant-activity' ? c.assistantMessages.at(-1)?.timestamp : void 0) ??
        s?.finishedAt ??
        l),
      u
    );
  });
} /** dayLabel: Today, Yesterday, a weekday or a date, with the time. */
function So(e, t = Date.now(), n = 'en-US') {
  const r = new Date(e),
    s = new Date(t),
    o = Math.max(
      (Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()) - Date.UTC(r.getFullYear(), r.getMonth(), r.getDate())) /
        864e5,
      0,
    );
  let i;
  o <= 1
    ? ((i = new Intl.RelativeTimeFormat(n, {numeric: 'auto'}).format(-o, 'day')),
      n.startsWith('en') && (i = i.charAt(0).toUpperCase() + i.slice(1)))
    : (i = new Intl.DateTimeFormat(
        n,
        o <= 7
          ? {weekday: 'long'}
          : o <= 365
            ? {weekday: 'short', month: 'short', day: 'numeric'}
            : {month: 'short', day: 'numeric', year: 'numeric'},
      ).format(r));
  const c = new Intl.DateTimeFormat(n, {hour: 'numeric', minute: '2-digit'}).format(r);
  return {day: i, time: c, separator: o > 7 ? ' at ' : ' '};
}
function n0({timestamp}) {
  const [t] = (0, g.useState)(Date.now),
    {day, time, separator} = So(timestamp, t);
  return (0, a.jsx)('div', {
    role: 'separator',
    'aria-label': `${day}${separator}${time}`,
    className: 'flex justify-center py-4',
    children: (0, a.jsxs)('time', {
      dateTime: new Date(timestamp).toISOString(),
      className: 'text-muted-foreground/80 text-xs font-normal tracking-[0.01em] select-none',
      children: [(0, a.jsx)('span', {className: 'font-medium', children: day}), separator, time],
    }),
  });
}
var /** TurnSegment: a turn’s rows, folded to its last answer when long. */
  r0 = ({segment, renderRows}) => {
    const n = fa(),
      r = Xa(),
      s = (0, g.useRef)(null),
      [o, i] = (0, g.useState)(),
      [c, l] = (0, g.useState)(false),
      [u, h] = (0, g.useState)(false),
      d = Xl(s, '0px'),
      {turnId, isActive, workedForMs, finalStartedAt, forceOpen, onOpen, bodyPreviewLoaded} = segment,
      S = segment.bodyLoaded ?? true,
      y = o ?? (isActive && (finalStartedAt === void 0 || !!forceOpen)),
      k = y || isActive,
      M = k || (d && !bodyPreviewLoaded),
      w = isActive || !S || workedForMs === void 0 || workedForMs >= 1e3,
      I = (0, g.useCallback)(async () => {
        if (!(!onOpen || S || c)) {
          (l(true), h(false));
          try {
            await onOpen();
          } catch {
            h(true);
          } finally {
            l(false);
          }
        }
      }, [onOpen, S, c]),
      R = N => {
        (N && h(false), i(N));
      },
      j = N => {
        r.preserveElementViewportPosition(N.currentTarget);
      };
    return (
      (0, g.useEffect)(() => {
        if (turnId && k) return n.retainTurnBody(turnId);
      }, [n, turnId, k]),
      (0, g.useEffect)(() => {
        M && !u && I();
      }, [M, u, I]),
      (0, g.useLayoutEffect)(() => {
        o && S && s.current && r.preserveElementViewportPosition(s.current);
      }, [o, S, r]),
      (0, a.jsxs)(rl, {
        open: y && S,
        onOpenChange: R,
        children: [
          w && (0, a.jsx)(Jc, {ref: s, loading: y && !S && !u, onClick: j, children: (0, a.jsx)(WorkedFor, {segment})}),
          y &&
            !S &&
            u &&
            (0, a.jsx)('button', {
              className: 'text-muted-foreground py-2 text-sm',
              onClick: I,
              type: 'button',
              children: 'Couldn’t load activity. Retry',
            }),
          segment.chunks.map(N =>
            N.type === 'visible'
              ? (0, a.jsx)(g.Fragment, {children: renderRows(N.rows)}, N.key)
              : (0, a.jsx)(el, {children: (0, a.jsx)(RetainTurn, {turnId, children: renderRows(N.rows)})}, N.key),
          ),
        ],
      })
    );
  },
  RetainTurn = ({turnId, children}) => {
    const n = fa();
    return (
      (0, g.useEffect)(() => {
        if (turnId) return n.retainTurnBody(turnId);
      }, [n, turnId]),
      children
    );
  } /** Worked for: how long a turn ran, counting while it runs. */,
  WorkedFor = ({segment}) => {
    const {currentSession} = me(),
      [n, r] = (0, g.useState)(Date.now),
      {isActive, startedAt, finalStartedAt, workedForMs} = segment,
      l = isActive
        ? kr(currentSession.suspension)
          ? Date.parse(currentSession.suspension.createdAt)
          : currentSession.status !== 'running'
            ? Date.parse(currentSession.updatedAt)
            : void 0
        : void 0,
      u = isActive && finalStartedAt === void 0 && l === void 0,
      h =
        startedAt === void 0
          ? workedForMs
          : Math.max(0, (finalStartedAt ?? l ?? (isActive ? n : startedAt + (workedForMs ?? 0))) - startedAt);
    return (
      (0, g.useEffect)(() => {
        if (!u) return;
        const d = setInterval(() => r(Date.now()), 1e3);
        return () => clearInterval(d);
      }, [u]),
      (0, a.jsx)(tl, {duration: h, working: u})
    );
  },
  isSteerNotice = e => e.type === 'system-message' && e.metadata.deliveryMode === 'steer',
  startsTurn = e =>
    (e.type === 'message' && !e.isSteer) ||
    (e.type === 'system-message' && !isSteerNotice(e)); /** Rows grouped into turns. */
function turnGroups(e) {
  const t = [];
  let n;
  for (const r of e) {
    const s = startsTurn(r.row),
      o = r.row.turn?.id;
    ((!n || (o !== void 0 ? o !== n.turnId : s && !n.isInputPrefixOpen)) &&
      ((n = {rows: [], turnId: o, isInputPrefixOpen: true}), t.push(n)),
      n.rows.push(r),
      (!s || r.row.type === 'message') && (n.isInputPrefixOpen = false));
  }
  return t;
}
function splitTail(e) {
  const t = e.agentRunItemWindow;
  if (!t) return {tailRow: e};
  const n = t.items.findLastIndex(o => o.type === 'steps');
  if (n < 0) return {tailRow: e};
  const r = $e(e.row),
    s = t.start + n + 1;
  return {
    foldRow: {...e, agentRunItemWindow: {...t, items: t.items.slice(0, n + 1), showActions: false}},
    tailRow: {...e, agentRunItemWindow: {...t, items: t.items.slice(n + 1), start: s}, key: `${r}/items:${s}`},
  };
}
function workedForMs(e) {
  const t = e.flatMap(({row}) => (row.type === 'assistant-activity' ? row.assistantMessages : [])),
    n = t[0]?.timestamp,
    r = t.at(-1),
    s = r?.completedAt ?? r?.timestamp;
  if (!(n === void 0 || s === void 0 || s < n)) return s - n;
}
var er = ({part}) => part.type === 'toolCall' && part.name === 'start_coder',
  onlySteps = (e = []) =>
    e.length === 1 &&
    e[0].type === 'steps' &&
    e[0].steps.length > 0 &&
    e[0].steps.every(er); /** Coder runs split out of their run, so each shows on its own. */
function splitCoderRuns(e) {
  const t = e.agentRunItemWindow;
  if (!t?.items.some(s => s.type === 'steps' && s.steps.some(er))) return [e];
  const n = [];
  let r = [];
  for (const s of t.items) {
    if (s.type !== 'steps') {
      r.push(s);
      continue;
    }
    let o = [];
    for (const i of s.steps) {
      if (!er(i)) {
        o.push(i);
        continue;
      }
      (o.length > 0 && r.push({...s, steps: o}),
        r.length > 0 && n.push(r),
        n.push([{...s, key: `${s.key}/${i.index}`, steps: [i]}]),
        (o = []),
        (r = []));
    }
    o.length > 0 && r.push({...s, steps: o});
  }
  return (
    r.length > 0 && n.push(r),
    n.map((s, o) => {
      const i = o === n.length - 1;
      return {
        ...e,
        key: o === 0 ? e.key : `${e.key}/piece:${o}`,
        agentRunItemWindow: {
          ...t,
          items: s,
          showActions: i && t.showActions,
          hasNextStepsRow: i ? t.hasNextStepsRow : !onlySteps(s),
        },
      };
    })
  );
}
function foldRuns(e) {
  const t = [];
  for (const n of e.flatMap(splitCoderRuns)) {
    const r =
        (n.row.type === 'message' && n.row.isSteer) || onlySteps(n.agentRunItemWindow?.items) ? 'visible' : 'fold',
      s = t.at(-1);
    s?.type === r ? s.rows.push(n) : t.push({type: r, key: `${r}:${n.key}`, rows: [n]});
  }
  return t;
} /** transcriptSegments: rows as turns, folds and day separators. */
function h0(e, t = {}) {
  const n = [],
    r = o => {
      o.length !== 0 && n.push({type: 'rows', key: `rows:${o[0].key}`, rows: o});
    },
    s = turnGroups(e);
  return (
    s.forEach((o, i) => {
      let c = 0;
      for (; c < o.rows.length && startsTurn(o.rows[c].row);) c += 1;
      const l = o.rows[0]?.row.turn,
        u = l ? !l.finishedAt : t.isTrailingTurnStreaming === true && i === s.length - 1,
        h = o.rows.find(({row}) => row.type === 'message' && !row.isSteer)?.row,
        d = l?.startedAt ?? (h?.type === 'message' ? h.timestamp : void 0),
        m = l?.finalStartedAt,
        p = o.rows.slice(0, c),
        f = o.rows.slice(c);
      r(p);
      const x = f.findLastIndex(({row}) => row.type === 'assistant-activity'),
        b = f.findLastIndex(({row}) => row.type === 'compacting'),
        v = Math.max(x, b);
      if (v < 0) {
        ((u || l?.hasBody) &&
          n.push({
            type: 'run-fold',
            key: `turn:${l?.id ?? p[0]?.key}`,
            turnId: l?.id,
            isActive: u,
            startedAt: d,
            finalStartedAt: m,
            chunks: [],
            onOpen: o.rows[0]?.row.onLoadBody,
            bodyLoaded: o.rows[0]?.row.bodyLoaded,
            bodyPreviewLoaded: o.rows[0]?.row.bodyPreviewLoaded,
          }),
          r(f));
        return;
      }
      let C = f.slice(0, v + 1),
        S = f.slice(v + 1);
      const y =
        !u ||
        m !== void 0 ||
        (!l && f.some(({row}) => row.type === 'assistant-activity' && row.assistantMessages.some(qr)));
      if (x >= 0 && y) {
        const {foldRow, tailRow} = splitTail(f[x]),
          R = f.slice(x + 1);
        ((C = [...f.slice(0, x), ...(foldRow ? [foldRow] : []), ...R.filter(({row}) => row.type === 'compacting')]),
          (S = [
            ...(tailRow.agentRunItemWindow && tailRow.agentRunItemWindow.items.length === 0 ? [] : [tailRow]),
            ...R.filter(({row}) => row.type !== 'compacting'),
          ]));
      }
      const k = foldRuns(C);
      if (!u && !l?.hasBody && !k.some(w => w.type === 'fold')) {
        (r(C), r(S));
        return;
      }
      const M = t.isTrailingTurnStreaming === true && i === s.length - 1;
      (n.push({
        type: 'run-fold',
        key: `turn:${l?.id ?? p[0]?.key ?? o.rows[0]?.key}`,
        turnId: l?.id,
        startedAt: d,
        finalStartedAt:
          m ??
          (!l && u && f.some(({row}) => row.type === 'assistant-activity' && row.assistantMessages.some(qr))
            ? Date.now()
            : void 0),
        onOpen: o.rows[0]?.row.onLoadBody,
        bodyLoaded: o.rows[0]?.row.bodyLoaded,
        bodyPreviewLoaded: o.rows[0]?.row.bodyPreviewLoaded,
        forceOpen:
          f.some(
            ({row}) =>
              row.type === 'assistant-activity' &&
              row.items.some(
                I =>
                  I.type === 'steps' &&
                  I.steps.some(R => R.part.type === 'toolCall' && R.part.id === t.pendingToolCallId),
              ),
          ) ||
          f.some(
            ({row}) =>
              row.type === 'error' ||
              (row.type === 'assistant-activity' &&
                row.items.some(
                  I =>
                    I.type === 'error' ||
                    (I.type === 'steps' &&
                      I.steps.some(
                        R =>
                          R.result?.isError || (R.part.type === 'toolCall' && R.part.name === 'subagent' && !R.result),
                      )),
                )),
          ),
        isActive:
          u ||
          (t.pendingToolCallId !== void 0 &&
            f.some(
              ({row}) =>
                row.type === 'assistant-activity' &&
                row.items.some(
                  I =>
                    I.type === 'steps' &&
                    I.steps.some(R => R.part.type === 'toolCall' && R.part.id === t.pendingToolCallId),
                ),
            )) ||
          M ||
          f.some(({row}) => (row.type === 'assistant-activity' && row.isStreaming) || row.type === 'thinking'),
        workedForMs: l ? (l.finalStartedAt ?? l.finishedAt ?? Date.now()) - l.startedAt : workedForMs(o.rows),
        chunks: k,
      }),
        r(S));
    }),
    n
  );
}
var NAV_MARKER = '_marker_9kc8m_2',
  NAV_LINE = '_line_9kc8m_12',
  NAV_STYLES = {
    marker: NAV_MARKER,
    line: NAV_LINE,
  } /** TurnNavigation: the rail of turn markers beside the transcript, with previews. */,
  f0 = ({items, transcriptRef, onNavigate}) => {
    const [r, s] = (0, g.useState)(new Set()),
      [o, i] = (0, g.useState)(null),
      [c, l] = (0, g.useState)(false),
      [u, h] = (0, g.useState)(false),
      [d, m] = (0, g.useState)(false),
      p = Vs(),
      f = (0, g.useRef)(null),
      x = (0, g.useRef)(null),
      b = items.find(j => r.has(j.key))?.key,
      v = () => m(true),
      C = j => () => i(j),
      S = () => i(null),
      y = j => N => {
        N.detail === 0 && onNavigate(j);
      },
      k = () => {
        f.current || i(null);
      },
      M = j => {
        if (j.button !== 0) return;
        const N = j.target.closest('[data-turn-key]')?.dataset.turnKey;
        N &&
          ((f.current = {pointerId: j.pointerId, key: N}),
          l(true),
          i(items.findIndex(O => O.key === N)),
          j.currentTarget.setPointerCapture(j.pointerId),
          onNavigate(N));
      },
      w = j => {
        if (f.current?.pointerId !== j.pointerId) return;
        const N = j.currentTarget.getBoundingClientRect(),
          O = document.elementFromPoint(N.left + N.width / 2, j.clientY)?.closest('[data-turn-key]'),
          W = O?.dataset.turnKey;
        !W ||
          !j.currentTarget.contains(O) ||
          W === f.current.key ||
          ((f.current.key = W), i(items.findIndex(se => se.key === W)), onNavigate(W));
      },
      I = () => {
        ((f.current = null), l(false), i(null));
      },
      R = j => {
        j.currentTarget.releasePointerCapture(j.pointerId);
      };
    return (
      (0, g.useEffect)(() => {
        const j = transcriptRef.current?.querySelector('[data-testid="message-list-scroller"]');
        if (!j) return;
        const N = j.querySelector('[data-testid="message-list-column"]'),
          O = () => {
            if (!N) return;
            const le = j.offsetWidth > 0 ? j.getBoundingClientRect().width / j.offsetWidth : 1,
              V = (N.getBoundingClientRect().left - j.getBoundingClientRect().left) / le;
            h(V + parseFloat(getComputedStyle(N).paddingLeft) >= 48);
          },
          W = new ResizeObserver(O);
        (W.observe(j), N && W.observe(N), window.addEventListener('resize', O), O());
        const se = new Set(),
          U = new Set(),
          ae = new IntersectionObserver(
            le => {
              for (const V of le) {
                const K = V.target.dataset.chatTurnKey;
                K && (V.isIntersecting ? se.add(K) : se.delete(K));
              }
              s(new Set(se));
            },
            {root: j, rootMargin: '-16px 0px 0px 0px'},
          ),
          _ = () => {
            const le = new Set(j.querySelectorAll('[data-chat-turn-key]'));
            for (const V of U) le.has(V) || (ae.unobserve(V), U.delete(V), se.delete(V.dataset.chatTurnKey));
            for (const V of le) U.has(V) || (U.add(V), ae.observe(V));
            s(new Set(se));
          },
          ce = new MutationObserver(_);
        return (
          ce.observe(j, {childList: true, subtree: true}),
          _(),
          () => {
            (ce.disconnect(), ae.disconnect(), W.disconnect(), window.removeEventListener('resize', O));
          }
        );
      }, [transcriptRef]),
      (0, g.useEffect)(() => {
        const j = Array.from(x.current?.querySelectorAll('[data-turn-key]') ?? []).find(O => O.dataset.turnKey === b),
          N = x.current;
        if (j && N && !f.current) {
          const O = j.offsetTop;
          O < N.scrollTop
            ? (N.scrollTop = O)
            : O + j.offsetHeight > N.scrollTop + N.clientHeight && (N.scrollTop = O + j.offsetHeight - N.clientHeight);
        }
      }, [b]),
      items.length < 4 || !u
        ? null
        : (0, a.jsx)(Mt.nav, {
            'aria-label': 'Turn navigation',
            className: 'absolute top-1/2 left-4 z-20 -translate-y-1/2',
            initial: p || d ? false : {opacity: 0},
            animate: {opacity: 1},
            onAnimationComplete: v,
            transition: {duration: p || d ? 0 : 0.15, ease: [0.23, 1, 0.32, 1]},
            children: (0, a.jsx)('div', {
              ref: x,
              className:
                'relative flex max-h-[min(70vh,40rem)] touch-none [scrollbar-width:none] flex-col overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden',
              'data-prompt-rail-list': true,
              'data-scrubbing': c || void 0,
              onPointerLeave: k,
              onPointerDown: M,
              onPointerMove: w,
              onLostPointerCapture: I,
              onPointerUp: R,
              onPointerCancel: I,
              children: items.map((j, N) => {
                const O = o === null ? 4 : Math.abs(N - o);
                return (0, a.jsxs)(
                  Ks,
                  {
                    modal: false,
                    children: [
                      (0, a.jsx)($s, {
                        openOnHover: true,
                        delay: 0,
                        render: (0, a.jsx)('button', {type: 'button'}),
                        tabIndex: 0,
                        'data-turn-key': j.key,
                        'data-scrub-target': (c && o === N) || void 0,
                        'aria-label': `Jump to turn ${N + 1}: ${j.label}`,
                        'aria-current': r.has(j.key) ? 'true' : void 0,
                        className: 'group flex h-[9px] w-9 shrink-0 items-center outline-none',
                        onPointerEnter: C(N),
                        onFocus: C(N),
                        onBlur: S,
                        onClick: y(j.key),
                        children: (0, a.jsx)('span', {
                          className: 'flex h-0.5 w-[30px] items-center',
                          'aria-hidden': 'true',
                          children: (0, a.jsx)('span', {
                            className: NAV_STYLES.marker,
                            'data-neighbor-distance': O <= 3 ? O : void 0,
                            children: (0, a.jsx)('span', {className: NAV_STYLES.line}),
                          }),
                        }),
                      }),
                      (0, a.jsxs)(Ys, {
                        side: 'right',
                        sideOffset: 0,
                        initialFocus: false,
                        finalFocus: false,
                        className:
                          'w-80 max-w-[calc(100vw-1rem)] animate-none! rounded-xl px-2.5 py-2 text-[13px] leading-[18px] transition-none!',
                        children: [
                          (0, a.jsx)('p', {className: 'truncate font-medium', children: j.label}),
                          j.response &&
                            (0, a.jsx)('p', {
                              className: 'text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap',
                              children: j.response,
                            }),
                        ],
                      }),
                    ],
                  },
                  j.key,
                );
              }),
            }),
          })
    );
  }
