/* Aux-owned source: the Settings content layout (assets/route-DMfKuXmY.js, the module body): the scroll area,
 * its page width, and the section rail: marks for the page's data-settings-section headings that follow
 * the scroll position and jump on click. Pages with their own layout skip the scroll area.
 * Names the rest of the chunk uses keep their chunk names: J the component (exported).
 * Chunk names used: _/N React, R JSX runtime, C useRouterState, L/z/k tooltip, $ useMatchRoute, b cn, w the page
 * class, I Outlet, q ScrollArea. */
var React = _(N(), 1),
  jsxRuntime = R(),
  /** A current section's mark. */
  ACTIVE_OPACITY = 1,
  /** Any other mark. */
  INACTIVE_OPACITY = 0.2,
  /** The section rail. */
  SectionRail = ({viewportRef, contentRef}) => {
    const pathname = C({select: value => value.location.pathname}),
      [sections, setSections] = (0, React.useState)([]),
      jump = (0, React.useRef)(null),
      selectSection = value => () => {
        ((jump.current = {title: value, settled: false}),
          setSections(content => content.map(headings => ({...headings, isActive: headings.title === value}))),
          contentRef.current
            ?.querySelector(`[data-settings-section="${CSS.escape(value)}"]`)
            ?.scrollIntoView({behavior: 'smooth', block: 'start'}));
      };
    return (
      (0, React.useEffect)(() => {
        const value = viewportRef.current,
          content = contentRef.current;
        if (!value || !content) return;
        let headings = [],
          titles = [],
          frame = 0;
        jump.current = null;
        const activeTitle = () => {
            if (jump.current) return jump.current.title;
            if (value.scrollTop > 0 && value.scrollTop + value.clientHeight >= value.scrollHeight - 1)
              return titles.at(-1) ?? null;
            const viewportTop = value.getBoundingClientRect().top;
            let active = null;
            for (const heading of headings) {
              const title = heading.dataset.settingsSection;
              title && heading.getBoundingClientRect().top - viewportTop <= 41 && (active = title);
            }
            return active ?? titles[0] ?? null;
          },
          update = () => {
            const viewportTop = activeTitle();
            setSections(titles.map(active => ({title: active, isActive: active === viewportTop})));
          },
          schedule = () => {
            (cancelAnimationFrame(frame), (frame = requestAnimationFrame(update)));
          },
          handleScroll = () => {
            (jump.current?.settled && (jump.current = null), schedule());
          },
          handleScrollEnd = () => {
            jump.current && (jump.current.settled = true);
          },
          collect = () => {
            ((headings = [...content.querySelectorAll('[data-settings-section]')].filter(
              viewportTop => viewportTop.dataset.settingsSection,
            )),
              (titles = headings.map(viewportTop => viewportTop.dataset.settingsSection)),
              update());
          };
        (collect(),
          value.addEventListener('scroll', handleScroll, {passive: true}),
          value.addEventListener('scrollend', handleScrollEnd));
        const observer = new MutationObserver(collect);
        return (
          observer.observe(content, {childList: true, subtree: true}),
          () => {
            (cancelAnimationFrame(frame),
              value.removeEventListener('scroll', handleScroll),
              value.removeEventListener('scrollend', handleScrollEnd),
              observer.disconnect());
          }
        );
      }, [contentRef, pathname, viewportRef]),
      sections.length < 2
        ? null
        : (0, jsxRuntime.jsx)('nav', {
            'aria-label': 'Settings sections',
            className: 'pointer-events-none absolute inset-y-0 left-3 z-20 hidden items-center @min-[720px]:flex',
            children: (0, jsxRuntime.jsx)('div', {
              className: 'pointer-events-auto flex flex-col',
              children: sections.map(value =>
                (0, jsxRuntime.jsxs)(
                  L,
                  {
                    children: [
                      (0, jsxRuntime.jsx)(z, {
                        render: (0, jsxRuntime.jsx)('button', {
                          type: 'button',
                          'aria-label': value.title,
                          className: 'group flex w-5 items-center justify-start py-1',
                          onClick: selectSection(value.title),
                        }),
                        children: (0, jsxRuntime.jsx)('span', {
                          className:
                            'bg-foreground h-0.5 w-3 rounded-full transition-[width,opacity] group-hover:w-4 group-hover:opacity-100!',
                          style: {opacity: value.isActive ? ACTIVE_OPACITY : INACTIVE_OPACITY},
                        }),
                      }),
                      (0, jsxRuntime.jsx)(k, {side: 'right', children: value.title}),
                    ],
                  },
                  value.title,
                ),
              ),
            }),
          })
    );
  };
/** The Settings content layout. */
function J() {
  const matchRoute = $(),
    isFullPage = !!(
      matchRoute({to: '/u/$userId/settings/experimental'}) ||
      matchRoute({to: '/u/$userId/settings/memories/files', fuzzy: true}) ||
      matchRoute({to: '/u/$userId/settings/memories/histories', fuzzy: true})
    ),
    isRoutine = !!matchRoute({to: '/u/$userId/settings/routines/$routineId'}),
    isSkill = !!matchRoute({to: '/u/$userId/settings/plugins/skills/$skillId'}),
    pathname = C({select: state => state.location.pathname}),
    viewportRef = (0, React.useRef)(null),
    contentRef = (0, React.useRef)(null);
  return (
    (0, React.useEffect)(() => {
      viewportRef.current && (viewportRef.current.scrollTop = 0);
    }, [pathname]),
    (0, jsxRuntime.jsx)('div', {
      className: 'size-full',
      children:
        isFullPage || isRoutine || isSkill
          ? (0, jsxRuntime.jsx)('div', {className: b(w, 'overflow-hidden'), children: (0, jsxRuntime.jsx)(I, {})})
          : (0, jsxRuntime.jsxs)('div', {
              className: '@container relative size-full',
              children: [
                (0, jsxRuntime.jsx)(q, {
                  className: w,
                  viewportRef,
                  children: (0, jsxRuntime.jsx)('main', {
                    ref: contentRef,
                    className: b(
                      'mx-auto w-full text-left',
                      pathname.includes('/settings/plugins/')
                        ? 'min-h-full max-w-none p-0'
                        : 'max-w-2xl px-8 pt-16 pb-40',
                    ),
                    children: (0, jsxRuntime.jsx)(React.Suspense, {children: (0, jsxRuntime.jsx)(I, {})}),
                  }),
                }),
                (0, jsxRuntime.jsx)(SectionRail, {viewportRef, contentRef}),
              ],
            }),
    })
  );
}
