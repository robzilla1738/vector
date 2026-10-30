/* Aux-owned source, Settings › Statistics (assets/statistics-CsvIURox.js, from React to the end,
 * exported as component): how many sessions, the last active day, the weekly average, and a
 * heatmap of the last 13 weeks. The bundled maxBy helper before it ($) stays supplied.
 * Names the rest of the chunk uses keep their chunk names: V the page; y React stays as named, the JSX runtime is jsxRuntime
 * stay as named.
 * Chunk names used: w/C/O React and JSX runtime, L useSuspenseQuery, T useTRPC, P the route,
 * v dayjs, W the pending spinner, b/B the settings section and header, R DocumentTitle, $ maxBy.
 * The heatmap keeps its green data colour. */
var y = w(C()),
  jsxRuntime = O(),
  /** A heatmap cell's side. */
  CELL_PX = 11,
  /** The gap between the weekday labels. */
  CELL_GAP_PX = 2,
  /** The heatmap's weeks. */
  WEEKS = 13,
  /** Days in a week. */
  DAYS_PER_WEEK = 7;
/** The Statistics page. */
function V() {
  return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
    children: [
      (0, jsxRuntime.jsx)(R, {segments: ['Settings', 'Statistics']}),
      (0, jsxRuntime.jsx)(B, {
        children: (0, jsxRuntime.jsx)('h1', {
          className: 'font-display text-foreground mb-2 text-2xl font-[450]',
          children: 'Statistics',
        }),
      }),
      (0, jsxRuntime.jsx)(y.Suspense, {
        fallback: (0, jsxRuntime.jsx)('div', {className: 'px-3 py-2', children: (0, jsxRuntime.jsx)(W, {})}),
        children: (0, jsxRuntime.jsx)(SessionStatistics, {}),
      }),
    ],
  });
}
/** The overview and the activity heatmap, from every root session (archived ones too). */
var SessionStatistics = () => {
  const {userId} = P.useParams(),
    accountId = Number.parseInt(userId, 10),
    trpc = T(),
    {data: sessions} = L(
      trpc.sessions.list.queryOptions({archived: 'include', parent: 'root', accountId}, {gcTime: 0, staleTime: 0}),
    ),
    {heatmapData, maxCount, totalSessions, lastActiveDate, avgPerWeek} = (0, y.useMemo)(() => {
      const today = (0, v.default)().startOf('day'),
        start = today.day(0).subtract(84, 'day'),
        counts = new Map();
      let max = 0,
        inRange = 0;
      sessions.forEach(session => {
        const day = (0, v.default)(session.createdAt).startOf('day');
        if ((day.isAfter(start) || day.isSame(start, 'day')) && (day.isBefore(today) || day.isSame(today, 'day'))) {
          const key = day.format('YYYY-MM-DD'),
            count = (counts.get(key) ?? 0) + 1;
          (counts.set(key, count), (inRange += 1), count > max && (max = count));
        }
      });
      const weeks = [];
      for (let week = 0; week < WEEKS; week++) {
        const days = [];
        for (let weekday = 0; weekday < DAYS_PER_WEEK; weekday++) {
          const date = start.add(week * DAYS_PER_WEEK + weekday, 'day');
          if (date.isAfter(today)) break;
          const key = date.format('YYYY-MM-DD');
          days.push({date, count: counts.get(key) ?? 0});
        }
        weeks.push(days);
      }
      const latest = $(sessions, session => (0, v.default)(session.createdAt).valueOf()),
        lastActive = latest ? (0, v.default)(latest.createdAt) : null,
        perWeek = inRange / WEEKS;
      return {
        heatmapData: weeks,
        maxCount: max,
        totalSessions: sessions.length,
        lastActiveDate: lastActive,
        avgPerWeek: perWeek.toFixed(1),
      };
    }, [sessions]),
    monthLabels = (0, y.useMemo)(() => {
      const labels = [],
        seen = new Set();
      return (
        heatmapData.forEach((week, index) => {
          const firstOfMonth = week.find(day => day.date.date() === 1);
          if (firstOfMonth) {
            const month = firstOfMonth.date.format('YYYY-MM');
            if (seen.has(month)) return;
            (labels.push({label: firstOfMonth.date.format('MMM'), x: index * 13}), seen.add(month));
          }
        }),
        labels
      );
    }, [heatmapData]),
    opacityFor = count => (count === 0 || maxCount === 0 ? 0.1 : 0.3 + (count / maxCount) * 0.7);
  return (0, jsxRuntime.jsxs)('div', {
    className: 'space-y-2',
    children: [
      (0, jsxRuntime.jsx)(b, {
        label: 'Overview',
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'grid grid-cols-3 gap-2',
          children: [
            (0, jsxRuntime.jsxs)('div', {
              className: 'bg-surface-primary rounded-lg px-3 py-2',
              children: [
                (0, jsxRuntime.jsx)('div', {className: 'text-muted-foreground text-sm', children: 'Total Sessions'}),
                (0, jsxRuntime.jsx)('div', {className: 'text-xl font-medium', children: totalSessions}),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'bg-surface-primary rounded-lg px-3 py-2',
              children: [
                (0, jsxRuntime.jsx)('div', {className: 'text-muted-foreground text-sm', children: 'Last Active'}),
                (0, jsxRuntime.jsx)('div', {
                  className: 'text-xl font-medium',
                  children: lastActiveDate ? lastActiveDate.format('YYYY-MM-DD') : 'Never',
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'bg-surface-primary rounded-lg px-3 py-2',
              children: [
                (0, jsxRuntime.jsx)('div', {
                  className: 'text-muted-foreground text-sm',
                  children: 'Avg Sessions / Week',
                }),
                (0, jsxRuntime.jsx)('div', {className: 'text-xl font-medium', children: avgPerWeek}),
              ],
            }),
          ],
        }),
      }),
      (0, jsxRuntime.jsx)(b, {
        label: 'Activity heatmap',
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'bg-surface-primary rounded-lg p-3',
          children: [
            (0, jsxRuntime.jsx)('h3', {className: 'mb-4 text-sm font-medium', children: 'Activity Heatmap'}),
            (0, jsxRuntime.jsxs)('div', {
              className: 'flex',
              children: [
                (0, jsxRuntime.jsxs)('div', {
                  className: 'text-muted-foreground mt-6 mr-2 flex flex-col text-xs',
                  style: {gap: CELL_GAP_PX, lineHeight: `${CELL_PX}px`},
                  children: [
                    (0, jsxRuntime.jsx)('span', {className: 'invisible', children: 'Sun'}),
                    (0, jsxRuntime.jsx)('span', {children: 'Mon'}),
                    (0, jsxRuntime.jsx)('span', {className: 'invisible', children: 'Tue'}),
                    (0, jsxRuntime.jsx)('span', {children: 'Wed'}),
                    (0, jsxRuntime.jsx)('span', {className: 'invisible', children: 'Thu'}),
                    (0, jsxRuntime.jsx)('span', {children: 'Fri'}),
                    (0, jsxRuntime.jsx)('span', {className: 'invisible', children: 'Sat'}),
                  ],
                }),
                (0, jsxRuntime.jsxs)('div', {
                  className: 'flex-1 overflow-x-auto',
                  children: [
                    (0, jsxRuntime.jsx)('div', {
                      className: 'relative mb-2 h-4',
                      children: monthLabels.map(label =>
                        (0, jsxRuntime.jsx)(
                          'span',
                          {
                            className: 'text-muted-foreground absolute text-xs',
                            style: {left: label.x},
                            children: label.label,
                          },
                          `${label.label}-${label.x}`,
                        ),
                      ),
                    }),
                    (0, jsxRuntime.jsx)('svg', {
                      width: 169,
                      height: 91,
                      children: heatmapData.map((week, index) =>
                        (0, jsxRuntime.jsx)(
                          'g',
                          {
                            transform: `translate(${index * 13}, 0)`,
                            children: week.map((day, weekday) =>
                              (0, jsxRuntime.jsx)(
                                'rect',
                                {
                                  y: weekday * 13,
                                  width: CELL_PX,
                                  height: CELL_PX,
                                  rx: 2,
                                  fill: '#10B981',
                                  opacity: opacityFor(day.count),
                                  className: 'transition-opacity hover:opacity-100',
                                  children: (0, jsxRuntime.jsxs)('title', {
                                    children: [day.count, ' sessions on ', day.date.format('YYYY-MM-DD')],
                                  }),
                                },
                                day.date.toISOString(),
                              ),
                            ),
                          },
                          index,
                        ),
                      ),
                    }),
                  ],
                }),
              ],
            }),
            (0, jsxRuntime.jsxs)('div', {
              className: 'text-muted-foreground mt-2 flex items-center justify-end gap-2 text-xs',
              children: [
                (0, jsxRuntime.jsx)('span', {children: 'Less'}),
                (0, jsxRuntime.jsx)('div', {
                  className: 'flex gap-1',
                  children: [0, 0.25, 0.5, 0.75, 1].map(level =>
                    (0, jsxRuntime.jsx)(
                      'div',
                      {
                        className: 'size-[11px] rounded-[2px] bg-emerald-500',
                        style: {opacity: level === 0 ? 0.1 : 0.3 + level * 0.7},
                      },
                      level,
                    ),
                  ),
                }),
                (0, jsxRuntime.jsx)('span', {children: 'More'}),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
