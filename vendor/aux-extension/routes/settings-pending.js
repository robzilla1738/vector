/* Aux-owned source, the Settings page placeholder (assets/extension-main-Dz1-AsCT.js): the skeleton a
 * settings route shows while it loads (header, title, a card and three rows).
 * Names the rest of the chunk uses keep their chunk names: $o the pending component.
 * Chunk names used: i JSX runtime, it whether the sidebar is collapsed, _e cn, ut the sidebar toggle,
 * $ Skeleton. */
function $o() {
  const e = it();
  return (0, i.jsxs)('div', {
    className: 'grid size-full min-h-0 grid-rows-[auto_minmax(0,1fr)]',
    children: [
      (0, i.jsxs)('header', {
        className: _e('flex h-11 shrink-0 items-center gap-2 pr-3', e ? 'pl-1.5' : 'pl-4'),
        children: [
          e && (0, i.jsx)(ut, {className: 'shrink-0 max-lg:aria-pressed:hidden'}),
          (0, i.jsx)($, {className: 'h-4 w-40'}),
          (0, i.jsx)($, {className: 'ml-auto size-8 rounded-lg'}),
        ],
      }),
      (0, i.jsx)('main', {
        className: 'min-h-0 overflow-y-auto px-8 pt-16 pb-40',
        children: (0, i.jsxs)('div', {
          className: 'mx-auto max-w-2xl space-y-8',
          children: [
            (0, i.jsxs)('div', {
              className: 'flex items-center gap-3',
              children: [(0, i.jsx)($, {className: 'size-8 rounded-lg'}), (0, i.jsx)($, {className: 'h-8 w-52'})],
            }),
            (0, i.jsx)($, {className: 'h-32 w-full rounded-xl'}),
            (0, i.jsxs)('div', {
              className: 'space-y-4',
              children: [
                (0, i.jsx)($, {className: 'h-8 w-56 rounded-full'}),
                (0, i.jsx)('div', {
                  children: Array.from({length: 3}, (t, r) =>
                    (0, i.jsxs)(
                      'div',
                      {
                        className: 'not-last:border-b-hairline space-y-1.5 py-4',
                        children: [
                          (0, i.jsxs)('div', {
                            className: 'flex items-center justify-between gap-3',
                            children: [(0, i.jsx)($, {className: 'h-4 w-2/5'}), (0, i.jsx)($, {className: 'h-3 w-24'})],
                          }),
                          (0, i.jsx)($, {className: 'h-3 w-4/5'}),
                        ],
                      },
                      r,
                    ),
                  ),
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
