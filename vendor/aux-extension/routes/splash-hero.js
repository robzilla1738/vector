/* Aux-owned source, the onboarding splash hero (assets/splash-D666ivBP.js, from the background video to
 * the page; aa exported as component): an animated picture of Aux at work in a light browser frame (the
 * sidebar, address bar and New Tab, a pointer moving and typing a task, the chat working through it with
 * tool steps, screenshots and subagents, and tasks finishing), beside the sign-in pane.
 * The bundled motion inView hooks before it, the Aux wordmark (We, branded by scripts/lib/provided-ui.mjs),
 * the email code step (Ue) and the sign-in pane after it (v2, w2) stay supplied. The illustration keeps
 * its fixed light colours on purpose: it is a picture of a light browser, not themed UI.
 * Names the rest of the chunk uses keep their chunk names: aa the page.
 * Chunk names used: e JSX runtime, o React, E cn, T motion, X reduced motion, E1 useInView, ee/c1 the
 * resizable panel group and panel, v2 the sign-in pane, and the icons of the first pass. */
BACKGROUND_VIDEO = '/assets/background-BriNwY3v.webm',
  ReactDOM = y1(q1(), 1),
  AgentTabsIcon = s =>
    (0, e.jsx)('svg', {
      width: 20,
      height: 20,
      viewBox: '0 0 20 20',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...s,
      children: (0, e.jsx)('path', {
        fill: 'currentColor',
        d: 'M7.52759 14.8845V5.11548H8.7146V14.8845H7.52759ZM5.21704 15.9255C4.34953 15.9255 3.67668 15.6864 3.19849 15.2083C2.7203 14.7301 2.4812 14.0572 2.4812 13.1897V6.81665C2.4812 5.94914 2.7203 5.27629 3.19849 4.7981C3.67668 4.31567 4.34953 4.07446 5.21704 4.07446H14.9099C15.7351 4.07446 16.3762 4.31567 16.8333 4.7981C17.2903 5.27629 17.5188 5.94914 17.5188 6.81665V13.1897C17.5188 14.0572 17.2903 14.7301 16.8333 15.2083C16.3762 15.6864 15.7351 15.9255 14.9099 15.9255H5.21704ZM5.28687 14.6814H14.7131C15.204 14.6814 15.5849 14.546 15.8557 14.2751C16.1308 14.0001 16.2683 13.6171 16.2683 13.1262V6.88013C16.2683 6.38924 16.1308 6.00838 15.8557 5.73755C15.5849 5.46248 15.204 5.32495 14.7131 5.32495H5.28687C4.79175 5.32495 4.40877 5.46248 4.13794 5.73755C3.86711 6.00838 3.73169 6.38924 3.73169 6.88013V13.1262C3.73169 13.6171 3.86711 14.0001 4.13794 14.2751C4.40877 14.546 4.79175 14.6814 5.28687 14.6814ZM6.28345 7.65454H4.98218C4.87215 7.65454 4.77482 7.61222 4.69019 7.52759C4.60978 7.44295 4.56958 7.34985 4.56958 7.24829C4.56958 7.13826 4.60978 7.04305 4.69019 6.96265C4.77482 6.88224 4.87215 6.84204 4.98218 6.84204H6.28345C6.39771 6.84204 6.49504 6.88224 6.57544 6.96265C6.66007 7.04305 6.70239 7.13826 6.70239 7.24829C6.70239 7.34985 6.66007 7.44295 6.57544 7.52759C6.49504 7.61222 6.39771 7.65454 6.28345 7.65454ZM6.28345 9.35571H4.98218C4.87215 9.35571 4.77482 9.31551 4.69019 9.23511C4.60978 9.15047 4.56958 9.05314 4.56958 8.94312C4.56958 8.83732 4.60978 8.74422 4.69019 8.66382C4.77482 8.58341 4.87215 8.54321 4.98218 8.54321H6.28345C6.39771 8.54321 6.49504 8.58341 6.57544 8.66382C6.66007 8.74422 6.70239 8.83732 6.70239 8.94312C6.70239 9.05314 6.66007 9.15047 6.57544 9.23511C6.49504 9.31551 6.39771 9.35571 6.28345 9.35571ZM6.28345 11.0505H4.98218C4.87215 11.0505 4.77482 11.0103 4.69019 10.9299C4.60978 10.8495 4.56958 10.7564 4.56958 10.6506C4.56958 10.5406 4.60978 10.4454 4.69019 10.365C4.77482 10.2846 4.87215 10.2444 4.98218 10.2444H6.28345C6.39771 10.2444 6.49504 10.2846 6.57544 10.365C6.66007 10.4454 6.70239 10.5406 6.70239 10.6506C6.70239 10.7564 6.66007 10.8495 6.57544 10.9299C6.49504 11.0103 6.39771 11.0505 6.28345 11.0505Z',
      }),
    }),
  SAMPLE_PROFILE = '/assets/sample-profile-DenpLY4Y.png',
  ICON_SPRITE = '/assets/icons-CdNQVma6.svg',
  SpriteIcon = ({name, ...a}) =>
    (0, e.jsx)('svg', {
      'aria-hidden': 'true',
      focusable: 'false',
      ...a,
      children: (0, e.jsx)('use', {href: `${ICON_SPRITE}#${name}`, width: '100%', height: '100%'}),
    }),
  APP_ICON_CLASS = 'text-muted-foreground size-full shrink-0',
  BOOKMARKS = [
    {label: 'Instagram', icon: (0, e.jsx)(SpriteIcon, {name: 'instagram'})},
    {label: 'Google', icon: (0, e.jsx)(SpriteIcon, {name: 'google-gradient', className: 'size-full'})},
    {label: 'Slack', icon: (0, e.jsx)(SpriteIcon, {name: 'slack', className: 'size-full'})},
    {label: 'Figma', icon: (0, e.jsx)(SpriteIcon, {name: 'figma'})},
    {label: 'X', icon: (0, e.jsx)(de, {})},
    {label: 'Discord', icon: (0, e.jsx)(SpriteIcon, {name: 'discord'})},
  ],
  PINNED_APPS = [
    {label: 'Gmail', icon: (0, e.jsx)(Ie, {})},
    {label: 'Facebook', icon: (0, e.jsx)(Be, {className: 'text-[#0866ff]'})},
    {label: 'Discord (6)', icon: (0, e.jsx)(SpriteIcon, {name: 'discord'})},
  ],
  BrowserFrame = ({
    agentTabsCount,
    children,
    className,
    ref,
    selectedTabLabel = 'New Tab',
    taskLabel,
    returnedToMain = false,
    ...c
  }) => {
    const d = selectedTabLabel !== 'New Tab';
    return (0, e.jsxs)('div', {
      ...c,
      ref,
      'data-browser-frame': true,
      className: E(
        'text-foreground border-glass bg-web-content-background/80 @container/browser-frame relative mx-auto flex w-full max-w-(--breakpoint-xl) overflow-hidden rounded-2xl shadow-xl',
        Z() && 'rounded-[8px]',
        className,
      ),
      children: [
        (0, e.jsxs)('div', {
          className:
            '@max-browser-lg/browser-frame:w-52 @max-browser-md/browser-frame:w-40 @max-browser-sm/browser-frame:w-40 flex h-full w-64 shrink-0 flex-col pb-px max-sm:w-64',
          children: [
            (0, e.jsx)(SidebarHeader, {}),
            (0, e.jsx)('div', {
              className: 'grid shrink-0 grid-cols-3 gap-1.5 px-2 pb-1',
              children: BOOKMARKS.map(({label, icon}) =>
                (0, e.jsx)(
                  'div',
                  {
                    'aria-label': label,
                    className:
                      'flex h-10 items-center justify-center rounded-lg bg-black/10 shadow-[inset_0_1px_3px_0_#00000014] dark:bg-white/10',
                    children: (0, e.jsx)('span', {className: 'size-4 [&_svg]:size-full', children: icon}),
                  },
                  label,
                ),
              ),
            }),
            (0, e.jsxs)(SidebarSection, {
              title: 'Chats',
              children: [
                (0, e.jsx)(SidebarItem, {item: {label: 'New Chat', icon: (0, e.jsx)(_1, {}), muted: true}}),
                taskLabel &&
                  (0, e.jsx)(SidebarItem, {
                    item: {label: taskLabel, selected: d, trailing: (0, e.jsx)(a1, {className: 'mr-0.5 size-4'})},
                  }),
                (0, e.jsx)(SidebarItem, {
                  item: {
                    label: returnedToMain ? 'Finding website design example' : 'Find the recipe on YouTube',
                    trailing: returnedToMain
                      ? (0, e.jsx)(a1, {className: 'mr-0.5 size-4'})
                      : (0, e.jsx)('span', {className: 'mr-1 block size-2 rounded-full bg-sky-500'}),
                  },
                }),
                (0, e.jsx)(SidebarItem, {
                  item: {label: returnedToMain ? 'San Francisco Largest Park' : 'Find a launch video agency'},
                }),
                (0, e.jsx)(SidebarItem, {item: {label: 'Show all', muted: true}}),
              ],
            }),
            (0, e.jsxs)(SidebarSection, {
              title: 'Tabs',
              className: 'min-h-0 flex-1 border-t border-black/5 dark:border-white/10',
              children: [
                (0, e.jsx)(SidebarItem, {
                  'data-sidebar-new-tab': true,
                  item: {label: 'New Tab', icon: (0, e.jsx)(Ne, {className: APP_ICON_CLASS}), muted: true},
                }),
                PINNED_APPS.map(x => (0, e.jsx)(SidebarItem, {item: x}, x.label)),
              ],
            }),
            !Z() && (0, e.jsx)(SidebarFooter, {}),
          ],
        }),
        children,
      ],
    });
  },
  BrowserContent = ({addressBarMode = 'search', children, className, ...n}) =>
    (0, e.jsxs)('div', {
      className: E(
        'ring-border-surface-strong bg-web-content-background relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[19px] shadow-[0_0_4px_0_rgba(0,0,0,0.05)] ring-[0.5px]',
        Z() && 'rounded-[8px]',
        className,
      ),
      ...n,
      children: [
        (0, e.jsx)(AddressBar, {mode: addressBarMode}),
        (0, e.jsx)('div', {className: 'min-h-0 flex-1', children}),
      ],
    }),
  SidebarHeader = () =>
    (0, e.jsxs)('div', {
      className: '@max-browser-sm/browser-frame:px-2 flex h-[42px] shrink-0 items-center justify-between pr-1.5 pl-4',
      children: [
        Z()
          ? (0, e.jsxs)('div', {
              'aria-label': 'Switch profile',
              className: 'flex min-w-0 items-center gap-2',
              children: [
                (0, e.jsx)('img', {src: SAMPLE_PROFILE, className: 'size-5 shrink-0 rounded-full', alt: ''}),
                (0, e.jsx)('span', {className: 'truncate text-sm font-medium', children: 'Personal'}),
                (0, e.jsx)($, {className: 'size-3 shrink-0'}),
              ],
            })
          : (0, e.jsxs)('div', {
              className: '@max-browser-sm/browser-frame:gap-1.5 flex gap-2',
              children: [
                (0, e.jsx)('span', {
                  className: 'size-3 rounded-full bg-red-400 inset-ring-[0.5px] inset-ring-black/10',
                }),
                (0, e.jsx)('span', {
                  className: 'size-3 rounded-full bg-amber-400 inset-ring-[0.5px] inset-ring-black/10',
                }),
                (0, e.jsx)('span', {
                  className: 'size-3 rounded-full bg-green-500 inset-ring-[0.5px] inset-ring-black/10',
                }),
              ],
            }),
        (0, e.jsx)('div', {
          className:
            'text-muted-foreground hover:bg-secondary @max-browser-sm/browser-frame:hidden flex size-7 shrink-0 items-center justify-center rounded-lg',
          children: (0, e.jsx)(AgentTabsIcon, {className: 'size-5'}),
        }),
      ],
    }),
  SidebarFooter = () =>
    (0, e.jsxs)('div', {
      className: 'text-muted-foreground flex h-11 shrink-0 items-center justify-between px-3',
      children: [
        (0, e.jsxs)('div', {
          className: 'flex items-center gap-1',
          children: [
            (0, e.jsx)('img', {src: SAMPLE_PROFILE, className: 'size-5 rounded-full', alt: 'User Profile'}),
            (0, e.jsx)($, {className: 'size-2.5'}),
          ],
        }),
        (0, e.jsxs)('div', {
          className: 'flex items-center gap-4',
          children: [
            (0, e.jsx)('span', {className: 'size-2 rounded-full bg-current'}),
            (0, e.jsx)(se, {className: 'size-2.5'}),
          ],
        }),
        (0, e.jsx)(k1, {className: 'size-3.5'}),
      ],
    }),
  SidebarSection = ({title, className, children}) =>
    (0, e.jsxs)('div', {
      className: E('@max-browser-sm/browser-frame:p-1.5 flex shrink-0 flex-col gap-1 p-2 pt-1', className),
      children: [
        title &&
          (0, e.jsx)('div', {
            className:
              'text-muted-foreground text-compact @max-browser-sm/browser-frame:h-5 @max-browser-sm/browser-frame:px-1 flex h-7 items-center px-2 font-medium',
            children: title,
          }),
        children,
      ],
    }),
  SidebarItem = ({item, ...a}) =>
    (0, e.jsxs)('div', {
      ...a,
      className: E(
        'text-foreground @max-browser-sm/browser-frame:gap-1.5 @max-browser-sm/browser-frame:pl-1.5 flex h-8 min-h-8 min-w-0 items-center gap-2 overflow-hidden rounded-md py-1 pr-1 pl-2',
        item.muted && 'text-muted-foreground',
        item.selected
          ? 'text-foreground ring-border-surface-strong bg-surface-secondary h-8 min-h-8 rounded-lg shadow-md ring-[0.5px] shadow-black/5'
          : item.subtle && 'bg-black/5',
      ),
      children: [
        item.icon &&
          (0, e.jsx)('span', {
            className: 'flex size-4 shrink-0 items-center justify-center [&_img]:size-full [&_svg]:size-full',
            children: item.icon,
          }),
        (0, e.jsx)('span', {className: 'font-semimedium min-w-0 flex-1 truncate text-sm', children: item.label}),
        item.trailing ? (0, e.jsx)('span', {className: 'text-muted-foreground', children: item.trailing}) : null,
      ],
    }),
  AddressBar = ({mode}) =>
    (0, e.jsxs)('div', {
      className: 'text-foreground flex h-[42px] items-center px-1.5',
      children: [
        (0, e.jsx)(ToolbarButton, {children: (0, e.jsx)(T1, {className: 'size-5'})}),
        (0, e.jsx)(ToolbarButton, {children: (0, e.jsx)(Q1, {className: 'size-5'})}),
        (0, e.jsx)(ToolbarButton, {children: (0, e.jsx)(oe, {className: 'size-4'})}),
        (0, e.jsxs)('div', {
          className: 'text-muted-foreground ml-1.5 flex h-7 min-w-0 flex-1 items-center gap-2 rounded-md',
          children: [
            (0, e.jsx)(mode === 'task' ? ie : k1, {className: 'size-4 shrink-0'}),
            mode === 'task' && (0, e.jsx)('span', {className: 'text-sm font-medium', children: 'Aux'}),
            (0, e.jsx)('div', {className: 'bg-surface-tertiary-foreground w-hairline h-4'}),
            (0, e.jsx)('span', {
              className: 'font-semimedium truncate text-sm',
              children:
                mode === 'task' ? 'Cancel subscription and request refunds ⋅ Chats' : 'Search Google or type a URL',
            }),
          ],
        }),
        (0, e.jsx)(ToolbarButton, {children: (0, e.jsx)(n1, {className: 'size-5'})}),
        Z() &&
          (0, e.jsxs)(e.Fragment, {
            children: [
              (0, e.jsx)('div', {
                className: 'bg-secondary ml-1 shrink-0 rounded-[8px] px-2.5 py-1 text-sm font-medium',
                children: 'Ask Aux',
              }),
              (0, e.jsxs)('div', {
                className: '-mr-1.5 ml-1 flex h-8 shrink-0 items-center',
                children: [
                  (0, e.jsx)('div', {
                    'aria-label': 'Minimize window',
                    className: 'flex h-8 w-[46px] items-center justify-center',
                    children: (0, e.jsx)(Ce, {className: 'size-3'}),
                  }),
                  (0, e.jsx)('div', {
                    'aria-label': 'Maximize window',
                    className: 'flex h-8 w-[46px] items-center justify-center',
                    children: (0, e.jsx)(Ze, {className: 'size-3'}),
                  }),
                  (0, e.jsx)('div', {
                    'aria-label': 'Close window',
                    className: 'flex h-8 w-[46px] items-center justify-center',
                    children: (0, e.jsx)(ue, {className: 'size-3'}),
                  }),
                ],
              }),
            ],
          }),
      ],
    }),
  ToolbarButton = ({children}) =>
    (0, e.jsx)('div', {className: 'text-foreground/50 flex size-8 items-center justify-center rounded-md', children}),
  CursorPointer = s =>
    (0, e.jsxs)('svg', {
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...s,
      children: [
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M15.665 4.5046C15.665 5.2486 15.109 5.8886 14.373 5.9936C13.781 6.0786 13.334 6.5956 13.334 7.1956V17.4256C13.334 18.0266 13.78 18.5436 14.371 18.6286C15.106 18.7326 15.662 19.3736 15.662 20.1176C15.659 20.5606 15.468 20.9736 15.137 21.2566C14.808 21.5396 14.371 21.6676 13.94 21.6036C13.157 21.4916 12.428 21.1606 11.831 20.6586C11.233 21.1606 10.504 21.4916 9.717 21.6046C9.29 21.6676 8.854 21.5406 8.523 21.2566C8.192 20.9696 8.003 20.5576 8 20.1246C8 19.3736 8.556 18.7326 9.292 18.6276C9.886 18.5426 10.334 18.0256 10.334 17.4256V7.1956C10.334 6.5956 9.887 6.0786 9.294 5.9936C8.559 5.8886 8.004 5.2486 8.004 4.5046C8.005 4.0646 8.196 3.6506 8.527 3.3656C8.797 3.1326 9.146 3.0016 9.508 3.0016H9.589L9.74 3.0206C10.514 3.1316 11.239 3.4616 11.834 3.9636C12.433 3.4616 13.162 3.1296 13.948 3.0176C14.363 2.9506 14.805 3.0766 15.142 3.3656C15.473 3.6526 15.662 4.0646 15.665 4.4976V4.5016V4.5046Z',
          fill: 'white',
        }),
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M9.437 5.00285C10.519 5.15785 11.335 6.10085 11.335 7.19485V17.4249C11.335 18.5189 10.517 19.4619 9.433 19.6169C9.186 19.6519 9 19.8669 9 20.1169C9.001 20.2629 9.064 20.4009 9.174 20.4969C9.285 20.5909 9.43 20.6349 9.576 20.6139C10.498 20.4819 11.328 19.9429 11.831 19.1599C12.335 19.9429 13.164 20.4819 14.087 20.6139C14.229 20.6349 14.377 20.5909 14.487 20.4959C14.598 20.4009 14.661 20.2629 14.662 20.1169C14.662 19.8669 14.476 19.6519 14.229 19.6169C13.149 19.4619 12.335 18.5199 12.335 17.4249V7.19485C12.335 6.10085 13.151 5.15785 14.233 5.00285C14.48 4.96785 14.666 4.75285 14.666 4.50285C14.665 4.35785 14.601 4.21885 14.491 4.12285C14.38 4.02885 14.235 3.98285 14.09 4.00585C13.168 4.13885 12.338 4.67685 11.834 5.45985C11.33 4.67685 10.501 4.13885 9.579 4.00585C9.556 4.00285 9.532 4.00085 9.508 4.00085C9.388 4.00085 9.271 4.04385 9.179 4.12285C9.068 4.21885 9.005 4.35685 9.004 4.50385C9.004 4.75285 9.19 4.96785 9.437 5.00285Z',
          fill: 'black',
        }),
      ],
    }),
  CursorDefault = s =>
    (0, e.jsxs)('svg', {
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...s,
      children: [
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M8.501 3.2601L16.884 11.6611C17.937 12.7171 17.19 14.5191 15.699 14.5191L14.475 14.519L15.6908 17.4067C15.9038 17.9127 15.9068 18.4727 15.6998 18.9817C15.4918 19.4917 15.0978 19.8897 14.5898 20.1027C14.3338 20.2097 14.0658 20.2637 13.7918 20.2637C12.9608 20.2637 12.2158 19.7687 11.8938 19.0027L10.616 15.965L9.784 16.7031C8.703 17.6591 7 16.8921 7 15.4481V3.8811C7 3.0971 7.947 2.7051 8.501 3.2601Z',
          fill: 'white',
        }),
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M7.99951 4.52936C7.99951 4.39836 8.15851 4.33236 8.25051 4.42536L16.1585 12.3504C16.5895 12.7824 16.2835 13.5194 15.6735 13.5194L12.9695 13.5178L14.7691 17.7938C14.9961 18.3338 14.7421 18.9548 14.2031 19.1808C13.6621 19.4078 13.0421 19.1548 12.8161 18.6158L10.9985 14.2918L9.13851 15.9394C8.72251 16.3074 8.08063 16.0509 8.00655 15.5275L7.99951 15.4264V4.52936Z',
          fill: 'black',
        }),
      ],
    }),
  CursorHand = s =>
    (0, e.jsxs)('svg', {
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...s,
      children: [
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M13.301 20.704C14.359 20.704 15.279 20.484 16.059 20.043C16.841 19.602 17.445 18.957 17.87 18.105C18.296 17.253 18.509 16.211 18.509 14.976V13.326C18.509 12.559 18.389 11.97 18.149 11.556C17.909 11.143 17.563 10.936 17.114 10.936V12.03C17.114 12.182 17.063 12.304 16.963 12.395C16.862 12.486 16.749 12.531 16.621 12.531C16.487 12.531 16.37 12.486 16.27 12.395C16.169 12.304 16.119 12.182 16.119 12.03V10.671C16.119 10.398 16.049 10.186 15.91 10.037C15.769 9.888 15.572 9.814 15.316 9.814C15.116 9.814 14.918 9.857 14.724 9.942V11.675C14.724 11.833 14.673 11.957 14.573 12.049C14.472 12.14 14.359 12.185 14.231 12.185C14.097 12.185 13.98 12.14 13.88 12.049C13.779 11.957 13.729 11.833 13.729 11.675V9.668C13.729 9.401 13.658 9.189 13.515 9.034C13.372 8.879 13.179 8.801 12.936 8.801C12.729 8.801 12.528 8.847 12.334 8.938V11.328C12.334 11.468 12.287 11.587 12.192 11.684C12.098 11.781 11.978 11.83 11.832 11.83C11.692 11.83 11.575 11.781 11.481 11.684C11.387 11.587 11.339 11.468 11.339 11.328V4.743C11.339 4.518 11.277 4.337 11.152 4.2C11.028 4.063 10.859 3.995 10.646 3.995C10.433 3.995 10.262 4.063 10.131 4.2C10 4.337 9.935 4.518 9.935 4.743V14.019C9.935 14.214 9.877 14.373 9.762 14.498C9.646 14.622 9.5 14.684 9.324 14.684C9.165 14.684 9.024 14.645 8.9 14.566C8.775 14.487 8.67 14.341 8.585 14.128L7.363 11.337C7.211 10.972 6.982 10.79 6.679 10.79C6.484 10.79 6.326 10.852 6.204 10.977C6.082 11.101 6.022 11.252 6.022 11.428C6.022 11.574 6.049 11.72 6.104 11.866L7.737 16.463C8.271 17.953 9.014 19.031 9.962 19.701C10.911 20.37 12.024 20.704 13.301 20.704ZM13.265 21.762C11.707 21.762 10.383 21.345 9.292 20.513C8.2 19.68 7.366 18.442 6.788 16.8L5.155 12.194C5.106 12.049 5.069 11.897 5.041 11.738C5.014 11.58 5 11.437 5 11.31C5 10.835 5.158 10.468 5.475 10.206C5.79 9.945 6.162 9.814 6.587 9.814C6.898 9.814 7.177 9.904 7.427 10.083C7.676 10.262 7.876 10.532 8.029 10.89L8.749 12.669C8.767 12.711 8.795 12.732 8.831 12.732C8.88 12.732 8.904 12.705 8.904 12.651V4.806C8.904 4.253 9.068 3.814 9.397 3.488C9.725 3.163 10.141 3 10.646 3C11.145 3 11.557 3.163 11.882 3.488C12.207 3.814 12.37 4.253 12.37 4.806V7.917C12.607 7.85 12.838 7.816 13.064 7.816C13.453 7.816 13.784 7.918 14.058 8.122C14.331 8.326 14.523 8.604 14.633 8.957C14.912 8.86 15.186 8.811 15.454 8.811C15.83 8.811 16.148 8.906 16.406 9.098C16.665 9.289 16.843 9.549 16.94 9.878C17.766 9.884 18.407 10.176 18.86 10.753C19.313 11.331 19.54 12.143 19.54 13.188V15.095C19.54 16.505 19.275 17.708 18.746 18.702C18.217 19.697 17.481 20.454 16.539 20.978C15.596 21.501 14.505 21.762 13.265 21.762Z',
          fill: 'black',
        }),
        (0, e.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M13.301 20.7041C14.359 20.7041 15.279 20.4841 16.059 20.0431C16.841 19.6021 17.445 18.9571 17.87 18.1051C18.296 17.2531 18.509 16.2111 18.509 14.9761V13.3261C18.509 12.5591 18.389 11.9701 18.149 11.5561C17.909 11.1431 17.563 10.9361 17.114 10.9361V12.0301C17.114 12.1821 17.063 12.3041 16.963 12.3951C16.862 12.4861 16.749 12.5311 16.621 12.5311C16.487 12.5311 16.37 12.4861 16.27 12.3951C16.169 12.3041 16.119 12.1821 16.119 12.0301V10.6711C16.119 10.3981 16.049 10.1861 15.91 10.0371C15.769 9.88812 15.572 9.81412 15.316 9.81412C15.116 9.81412 14.918 9.85712 14.724 9.94212V11.6751C14.724 11.8331 14.673 11.9571 14.573 12.0491C14.472 12.1401 14.359 12.1851 14.231 12.1851C14.097 12.1851 13.98 12.1401 13.88 12.0491C13.779 11.9571 13.729 11.8331 13.729 11.6751V9.66812C13.729 9.40112 13.658 9.18912 13.515 9.03412C13.372 8.87912 13.179 8.80112 12.936 8.80112C12.729 8.80112 12.528 8.84712 12.334 8.93812V11.3281C12.334 11.4681 12.287 11.5871 12.192 11.6841C12.098 11.7811 11.978 11.8301 11.832 11.8301C11.692 11.8301 11.575 11.7811 11.481 11.6841C11.387 11.5871 11.339 11.4681 11.339 11.3281V4.74312C11.339 4.51812 11.277 4.33712 11.152 4.20012C11.028 4.06312 10.859 3.99512 10.646 3.99512C10.433 3.99512 10.262 4.06312 10.131 4.20012C9.99997 4.33712 9.93497 4.51812 9.93497 4.74312V14.0191C9.93497 14.2141 9.87697 14.3731 9.76197 14.4981C9.64597 14.6221 9.49997 14.6841 9.32397 14.6841C9.16497 14.6841 9.02397 14.6451 8.89997 14.5661C8.77497 14.4871 8.66997 14.3411 8.58497 14.1281L7.36297 11.3371C7.21097 10.9721 6.98197 10.7901 6.67897 10.7901C6.48397 10.7901 6.32597 10.8521 6.20397 10.9771C6.08197 11.1011 6.02197 11.2521 6.02197 11.4281C6.02197 11.5741 6.04897 11.7201 6.10397 11.8661L7.73697 16.4631C8.27097 17.9531 9.01397 19.0311 9.96197 19.7011C10.911 20.3701 12.024 20.7041 13.301 20.7041Z',
          fill: 'white',
        }),
      ],
    }),
  CURSORS = {default: CursorDefault, point: CursorHand, cursor: CursorPointer},
  Cursor = ({type, className, ...t}) => {
    const n = CURSORS[type];
    return (0, e.jsx)(n, {...t, className: E('z-5', className)});
  } /** Timers that pause and resume with the hero. */,
  usePausableTimers = s => {
    const a = (0, o.useRef)(s),
      t = (0, o.useRef)(new Set()),
      n = (0, o.useCallback)(l => {
        ((l.startedAt = performance.now()),
          (l.id = setTimeout(() => {
            ((l.id = null), t.current.delete(l), l.run());
          }, l.remainingMs)));
      }, []),
      r = (0, o.useCallback)(
        (l, i) => {
          const c = {id: null, remainingMs: i, run: l, startedAt: 0};
          return (
            t.current.add(c),
            a.current || n(c),
            () => {
              (c.id && clearTimeout(c.id), t.current.delete(c));
            }
          );
        },
        [n],
      );
    return (
      (0, o.useEffect)(() => {
        if (((a.current = s), s)) {
          const l = performance.now();
          t.current.forEach(i => {
            i.id &&
              (clearTimeout(i.id), (i.id = null), (i.remainingMs = Math.max(0, i.remainingMs - (l - i.startedAt))));
          });
          return;
        }
        t.current.forEach(l => {
          l.id || n(l);
        });
      }, [s, n]),
      (0, o.useEffect)(
        () => () => {
          (t.current.forEach(l => {
            l.id && clearTimeout(l.id);
          }),
            t.current.clear());
        },
        [],
      ),
      r
    );
  },
  POINTER_SIZE = 24,
  PATH_STEPS = 28,
  TARGET_OFFSET_X = 10,
  TARGET_OFFSET_Y = 10,
  START_INSET = 0.04,
  START_MAX_Y = 640,
  START_MARGIN = 4,
  START_PULL = 1 / 3,
  CURVE_PULL = 0.45,
  NEW_TAB_MOVE_AT = 425,
  NEW_TAB_MOVE_MS = 935,
  NEW_TAB_FADE_MS = 306,
  easeOutCubic = s => 1 - (1 - s) ** 3,
  curveControl = (s, a) => {
    const t = {x: s.x, y: a.y},
      n = {x: (s.x + a.x) / 2, y: (s.y + a.y) / 2};
    return {x: t.x + (n.x - t.x) * CURVE_PULL, y: t.y + (n.y - t.y) * CURVE_PULL};
  },
  curveKeyframes = (s, a, t) =>
    Array.from({length: 29}, (n, r) => {
      const l = easeOutCubic(r / PATH_STEPS),
        i = 1 - l;
      return {x: i * i * s.x + 2 * i * l * a.x + l * l * t.x, y: i * i * s.y + 2 * i * l * a.y + l * l * t.y};
    }),
  frameScale = s => {
    const a = s.getBoundingClientRect();
    if (s.offsetWidth === 0 || s.offsetHeight === 0 || a.width === 0 || a.height === 0) return null;
    const t = a.width / s.offsetWidth,
      n = a.height / s.offsetHeight;
    return t === 0 || n === 0 ? null : {frameRect: a, frameScaleX: t, frameScaleY: n};
  } /** A curved path from the bottom of the frame to a target. */,
  pointerPath = (s, a) => {
    const t = frameScale(s);
    if (!t) return null;
    const {frameRect, frameScaleY} = t,
      l = s.offsetWidth * START_INSET,
      i = s.parentElement?.getBoundingClientRect(),
      c =
        (i ? (Math.min(frameRect.bottom, i.bottom) - frameRect.top) / frameScaleY : s.offsetHeight) -
        POINTER_SIZE -
        START_MARGIN,
      d = {x: a.x - (a.x - l) * START_PULL, y: Math.min(START_MAX_Y, c)};
    return {start: d, control: curveControl(d, a), end: a};
  },
  omniboxPointer = (s, a) => {
    const t = frameScale(s);
    if (!t) return null;
    const {frameRect, frameScaleX, frameScaleY} = t,
      i = a.getBoundingClientRect(),
      c = pointerPath(s, {
        x: (i.left - frameRect.left) / frameScaleX + TARGET_OFFSET_X,
        y: (i.top - frameRect.top) / frameScaleY + a.offsetHeight / 2 - POINTER_SIZE / 2 + TARGET_OFFSET_Y,
      });
    return c ? {frame: s, path: c, keyframes: curveKeyframes(c.start, c.control, c.end)} : null;
  },
  newTabPointer = (s, a) => {
    const t = frameScale(s);
    if (!t) return null;
    const {frameRect, frameScaleX, frameScaleY} = t,
      i = a.getBoundingClientRect(),
      c = pointerPath(s, {
        x: (i.left - frameRect.left) / frameScaleX + i.width / frameScaleX / 2 - POINTER_SIZE / 2,
        y: (i.top - frameRect.top) / frameScaleY + i.height / frameScaleY / 2 - POINTER_SIZE / 2,
      });
    return c ? {frame: s, path: c, keyframes: curveKeyframes(c.start, c.control, c.end)} : null;
  },
  PointerLayer = ({layer, pointerType, pointerOpacity, pointerMoving, pointerAtStart, moveMs, fadeMs}) => {
    const {path, keyframes} = layer;
    return (0, e.jsx)(T.div, {
      className: 'pointer-events-none absolute top-0 left-0 z-30',
      initial: {x: path.start.x, y: path.start.y, opacity: 0},
      animate: {
        x: pointerMoving ? keyframes.map(x => x.x) : pointerAtStart ? path.start.x : path.end.x,
        y: pointerMoving ? keyframes.map(x => x.y) : pointerAtStart ? path.start.y : path.end.y,
        opacity: pointerOpacity,
      },
      transition: {
        opacity: {duration: fadeMs / 1e3, ease: 'easeOut'},
        x: {duration: moveMs / 1e3, ease: 'linear'},
        y: {duration: moveMs / 1e3, ease: 'linear'},
      },
      children: (0, e.jsx)(Cursor, {type: pointerType, className: 'size-6 drop-shadow-sm'}),
    });
  },
  useNewTabPointer = (s, a, t, n) => {
    const r = X() ?? false,
      l = (0, o.useRef)(false),
      i = usePausableTimers(t),
      [c, d] = (0, o.useState)(null),
      [x, f] = (0, o.useState)('idle'),
      [j, g] = (0, o.useState)('default'),
      [S, _] = (0, o.useState)(0);
    return (
      (0, o.useLayoutEffect)(() => {
        if (!a) return;
        const N = () => {
          const v = s.current,
            M = v?.querySelector('[data-sidebar-new-tab]');
          !v || !(M instanceof HTMLElement) || d(newTabPointer(v, M));
        };
        N();
        const y = new ResizeObserver(N),
          k = s.current;
        return (k && y.observe(k), () => y.disconnect());
      }, [a, s]),
      (0, o.useEffect)(() => {
        if (!a) {
          ((l.current = false), f('idle'), g('default'), _(0));
          return;
        }
        if (l.current) return;
        if (((l.current = true), r)) {
          n?.();
          return;
        }
        const N = new Set(),
          y = (M, A) => {
            N.add(i(M, A));
          },
          k = 1360,
          v = 1547;
        return (
          y(() => {
            (f('move'), _(1));
          }, NEW_TAB_MOVE_AT),
          y(() => {
            (g('point'), f('point'));
          }, k),
          y(() => {
            (f('fade'), _(0));
          }, v),
          y(n ?? (() => {}), 1955),
          () => N.forEach(M => M())
        );
      }, [a, n, r, i]),
      {
        pointerLayer: a && !r ? c : null,
        pointerType: j,
        pointerOpacity: S,
        pointerMoving: x === 'move',
        pointerAtStart: x === 'idle',
        pointerMoveMs: NEW_TAB_MOVE_MS,
        pointerFadeMs: NEW_TAB_FADE_MS,
      }
    );
  },
  PAGE_CURL = '/assets/page-curl-top-DUIHG5WL.png',
  TASK_BRIEFING = '/assets/task-briefing-3Haeb3gI.png',
  TASK_PARK = '/assets/task-park-SCISR3FU.png',
  TASK_TAB_PREVIEW = '/assets/task-view-tab-preview-Bzu6mK_y.png',
  TASK_WEBSITE_DESIGN = '/assets/task-website-design--FMQojtc.png',
  OMNIBOX_PLACEHOLDER = 'Ask AI a task, @ for context',
  TYPED_TASK = 'cancel all unused subscriptions and request refunds',
  INTRO_SPEED = 0.8,
  introMs = s => Math.round(s * INTRO_SPEED),
  INTRO_START_MS = 1e3,
  INTRO_MOVE_MS = introMs(1200),
  INTRO_HOLD_MS = introMs(200),
  INTRO_CURSOR_MS = introMs(300),
  INTRO_FADE_MS = introMs(400),
  TYPE_STEP_MS = introMs(42),
  TYPE_DELAY_MS = introMs(120),
  TYPED_HOLD_MS = 500,
  INTRO_ENTER_S = introMs(300) / 1e3,
  INTRO_STAGGER_S = introMs(120) / 1e3 /** The New Tab intro: the pointer moves to the omnibox, then types the task. */,
  useOmniboxIntro = (s, a = false, t = 'intro') => {
    const n = (0, o.useRef)(null),
      r = X() ?? false,
      l = E1(s, {once: true, amount: 0.45}),
      i = t === 'return',
      c = l && !r && !i,
      d = (0, o.useRef)(false),
      x = usePausableTimers(a),
      [f, j] = (0, o.useState)(null),
      [g, S] = (0, o.useState)(i ? 'done' : 'idle'),
      [_, N] = (0, o.useState)('point'),
      [y, k] = (0, o.useState)(0),
      [v, M] = (0, o.useState)(!i),
      [A, b] = (0, o.useState)(0);
    ((0, o.useLayoutEffect)(() => {
      if (i) return;
      const p = () => {
        const m = s.current,
          z = n.current,
          V = m?.closest('[data-browser-frame]');
        !m || !z || !(V instanceof HTMLElement) || j(omniboxPointer(V, z));
      };
      p();
      const w = new ResizeObserver(p),
        h = s.current?.closest('[data-browser-frame]');
      return (h instanceof HTMLElement && w.observe(h), s.current && w.observe(s.current), () => w.disconnect());
    }, [s, i]),
      (0, o.useEffect)(() => {
        if (i || !c || d.current) return;
        d.current = true;
        const p = new Set(),
          w = (u, K) => {
            p.add(x(u, K));
          },
          h = INTRO_START_MS + INTRO_MOVE_MS + INTRO_HOLD_MS,
          m = h + INTRO_CURSOR_MS,
          z = m + INTRO_FADE_MS,
          V = z + TYPE_DELAY_MS;
        (w(() => {
          (S('pointer-move'), k(1));
        }, INTRO_START_MS),
          w(() => {
            (N('cursor'), S('cursor'));
          }, h),
          w(() => M(false), m),
          w(() => k(0), z),
          w(() => S('typing'), V));
        for (let u = 0; u < 51; u += 1) w(() => b(u + 1), V + (u + 1) * TYPE_STEP_MS);
        return (w(() => S('done'), V + 51 * TYPE_STEP_MS + TYPED_HOLD_MS), () => p.forEach(u => u()));
      }, [c, i, x]));
    const C = (r && l) || g === 'done';
    return {
      done: i || C,
      omniboxTextRef: n,
      pointerLayer: c ? f : null,
      pointerType: _,
      pointerOpacity: y,
      placeholderVisible: i || (r ? false : v),
      typedText: !i && (C || A === 51) ? TYPED_TASK : TYPED_TASK.slice(0, A),
      isTyping: g === 'typing',
      tabHintVisible: !i && (g === 'idle' || g === 'pointer-move' || g === 'cursor'),
      pointerMoving: g === 'pointer-move',
      pointerAtStart: g === 'idle',
      pointerMoveMs: INTRO_MOVE_MS,
      pointerFadeMs: INTRO_FADE_MS,
    };
  },
  durationLabel = s => {
    const a = Math.floor(s / 3600),
      t = Math.floor((s % 3600) / 60),
      n = s % 60;
    return a > 0 ? `${a}h ${t}m ${n}s` : t > 0 ? `${t}m ${n}s` : `${n}s`;
  },
  TASK_DONE = {
    workingForSeconds: 38,
    title: 'Cancel subscription and request refunds',
    running: true,
    tools: [
      {icon: M1, label: 'Searched browsing history and memory'},
      {icon: t1, label: 'Open Chase.com'},
      {icon: He, label: 'Spawning subagents in parallel'},
    ],
    image: TASK_TAB_PREVIEW,
    image: '/hero-illustration/captures/02-netflix.png',
  },
  TASKS = [
    {
      workingForSeconds: 226,
      title: 'Finding website design example',
      image: TASK_WEBSITE_DESIGN,
      running: true,
      tools: [
        {icon: Oe, label: 'Capturing a screenshot'},
        {icon: Fe, label: 'Saving in artifacts folder'},
        {icon: re, label: 'Check about page'},
      ],
    },
    {
      meta: 'an hour ago',
      title: 'San Francisco Largest Park',
      body: 'The largest park in San Francisco is Golden Gate Park, spanning 1,017 acres of public green space. It is about 20% larger...',
      image: TASK_PARK,
    },
    {
      meta: 'an hour ago',
      title: 'Daily briefing',
      routine: 'Every 9am',
      body: "Summary: You got 112 followers, 85 comments and 212 likes. Yesterday's trending topics: Charles Leclerc retires fr...",
      image: TASK_BRIEFING,
    },
  ],
  NewTabScene = ({onDone, paused = false, variant = 'intro'}) => {
    const n = (0, o.useRef)(null),
      r = useOmniboxIntro(n, paused, variant);
    (0, o.useEffect)(() => {
      r.done && onDone?.();
    }, [r.done, onDone]);
    const l = variant === 'return' ? [TASK_DONE, ...TASKS.slice(0, 2)] : TASKS;
    return (0, e.jsxs)('div', {
      ref: n,
      className: 'relative h-full overflow-hidden',
      children: [
        r.pointerLayer
          ? (0, ReactDOM.createPortal)(
              (0, e.jsx)(PointerLayer, {
                layer: r.pointerLayer,
                pointerType: r.pointerType,
                pointerOpacity: r.pointerOpacity,
                pointerMoving: r.pointerMoving,
                pointerAtStart: r.pointerAtStart,
                moveMs: r.pointerMoveMs,
                fadeMs: r.pointerFadeMs,
              }),
              r.pointerLayer.frame,
            )
          : null,
        (0, e.jsxs)('div', {
          className:
            '@max-browser-lg/browser-frame:px-6 @max-browser-lg/browser-frame:pt-14 @max-browser-md/browser-frame:px-5 @max-browser-md/browser-frame:pt-10 mx-auto h-full max-w-4xl overflow-y-auto px-10 pt-24 pb-16',
          children: [
            (0, e.jsx)(Re, {
              className:
                '@max-browser-md/browser-frame:mb-4 @max-browser-md/browser-frame:size-12 mx-auto mb-6 size-14',
            }),
            (0, e.jsx)(Omnibox, {
              textRef: r.omniboxTextRef,
              placeholderVisible: r.placeholderVisible,
              typedText: r.typedText,
              isTyping: r.isTyping,
              tabHintVisible: r.tabHintVisible,
            }),
            (0, e.jsxs)('div', {
              className: '@max-browser-lg/browser-frame:mt-14 @max-browser-md/browser-frame:mt-8 mt-8',
              children: [
                (0, e.jsx)('div', {
                  className: 'mx-auto mb-3 flex max-w-3xl items-center justify-between',
                  children: (0, e.jsx)('div', {
                    className: 'font-display text-foreground text-base leading-5 font-medium',
                    children: 'Recent tasks',
                  }),
                }),
                (0, e.jsx)('div', {
                  className:
                    '@max-browser-lg/browser-frame:grid-cols-[repeat(3,220px)] @max-browser-md/browser-frame:grid-cols-[repeat(3,200px)] mx-auto grid w-fit grid-cols-[repeat(3,260px)] justify-center gap-2',
                  children: l.map(i => (0, e.jsx)(TaskCard, {paused, task: i}, i.title)),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Omnibox = ({textRef, placeholderVisible, typedText, isTyping, tabHintVisible}) =>
    (0, e.jsxs)('div', {
      className: 'mx-auto w-full max-w-155 min-w-0',
      children: [
        (0, e.jsxs)('div', {
          className:
            'ring-border-surface-strong bg-surface-primary flex h-11 items-center gap-2 rounded-xl px-3 shadow-lg ring-[0.5px] shadow-black/7',
          children: [
            (0, e.jsx)('div', {
              ref: textRef,
              className: 'relative min-w-0 flex-1 overflow-hidden text-sm leading-5 font-medium whitespace-nowrap',
              children: (0, e.jsx)(i1, {
                mode: 'wait',
                children: placeholderVisible
                  ? (0, e.jsx)(
                      T.span,
                      {
                        className: 'block truncate text-neutral-400',
                        exit: {opacity: 0},
                        transition: {duration: INTRO_ENTER_S, ease: 'easeOut'},
                        children: OMNIBOX_PLACEHOLDER,
                      },
                      'placeholder',
                    )
                  : typedText
                    ? (0, e.jsxs)(
                        T.span,
                        {
                          className: 'text-primary block truncate tracking-[-0.015em]',
                          initial: {opacity: 0},
                          animate: {opacity: 1},
                          transition: {duration: INTRO_STAGGER_S},
                          children: [
                            typedText,
                            isTyping
                              ? (0, e.jsx)('span', {className: 'text-primary animate-pulse', children: '|'})
                              : null,
                          ],
                        },
                        'typed',
                      )
                    : null,
              }),
            }),
            (0, e.jsxs)(T.div, {
              className: 'text-muted-foreground hidden items-center gap-1.5 text-xs leading-4 font-medium sm:flex',
              animate: {opacity: tabHintVisible ? 1 : 0},
              transition: {duration: INTRO_ENTER_S, ease: 'easeOut'},
              children: [
                (0, e.jsx)('kbd', {
                  className:
                    'bg-foreground/8 rounded-sm px-1.5 py-0.5 leading-3.5 font-medium tracking-tight text-neutral-600',
                  children: 'Tab',
                }),
                (0, e.jsx)('span', {children: 'to switch'}),
              ],
            }),
            (0, e.jsxs)('div', {
              className:
                'bg-foreground/8 text-muted-foreground @max-browser-md/browser-frame:hidden -mr-1 flex h-7 rounded-md p-0.5 text-sm leading-5 font-medium',
              children: [
                (0, e.jsx)('div', {
                  className: 'flex w-16 items-center justify-center rounded-md tracking-[-0.02em]',
                  children: 'Search',
                }),
                (0, e.jsx)('div', {
                  className:
                    'ring-border-surface-strong text-foreground bg-surface-primary flex w-16 items-center justify-center rounded-md shadow-sm ring-[0.5px]',
                  children: 'Ask',
                }),
              ],
            }),
          ],
        }),
        (0, e.jsxs)('div', {
          className:
            'flex h-9 min-w-0 items-center gap-1.5 overflow-hidden px-1 text-xs leading-4 font-medium whitespace-nowrap text-neutral-500',
          children: [
            (0, e.jsx)('div', {
              className: 'flex size-6 items-center justify-center rounded-md',
              children: (0, e.jsx)(V1, {className: 'size-3.5'}),
            }),
            (0, e.jsx)(TaskChip, {icon: ye, label: 'Projects'}),
            (0, e.jsx)('div', {className: 'flex-1'}),
            (0, e.jsx)(TaskChip, {icon: L1, label: 'GPT-6 Astra', chevron: false}),
            (0, e.jsx)(TaskChip, {label: 'High'}),
          ],
        }),
      ],
    }),
  WorkingTimer = ({initialSeconds, paused}) => {
    const [t, n] = (0, o.useState)(initialSeconds);
    return (
      (0, o.useEffect)(() => {
        if (paused) return;
        const r = setInterval(() => {
          n(l => l + 1);
        }, 1e3);
        return () => clearInterval(r);
      }, [paused]),
      (0, e.jsxs)(e.Fragment, {children: ['Working for ', durationLabel(t)]})
    );
  },
  TaskCard = ({paused, task}) => {
    const t = !!task.routine,
      n = !!task.tools;
    return (0, e.jsxs)('div', {
      className:
        'ring-border-surface-strong bg-surface-primary @max-browser-lg/browser-frame:h-56 @max-browser-md/browser-frame:h-52 relative h-64 w-full overflow-hidden rounded-xl shadow-md ring-[0.5px] shadow-black/5',
      children: [
        (0, e.jsxs)('div', {
          className: 'px-3 pt-2',
          children: [
            (0, e.jsxs)('div', {
              className: 'mb-0.5 flex h-4 items-center gap-2 text-xs leading-4 font-medium text-neutral-400',
              children: [
                (0, e.jsx)('span', {
                  className: 'min-w-0 flex-1 truncate',
                  children:
                    task.workingForSeconds != null
                      ? (0, e.jsx)(WorkingTimer, {initialSeconds: task.workingForSeconds, paused})
                      : task.meta,
                }),
                task.routine ? (0, e.jsx)('span', {className: 'text-neutral-500', children: task.routine}) : null,
                task.running ? null : (0, e.jsx)('span', {className: 'size-1.5 rounded-full bg-sky-500'}),
              ],
            }),
            (0, e.jsx)('div', {
              className: 'text-sm leading-5 font-semibold text-neutral-900',
              children:
                task.workingForSeconds != null
                  ? (0, e.jsx)(K1, {className: 'line-clamp-1', children: task.title})
                  : (0, e.jsx)('span', {className: 'line-clamp-1', children: task.title}),
            }),
            task.tools
              ? (0, e.jsx)('div', {
                  className: 'mt-2 space-y-1',
                  children: task.tools.map(r => (0, e.jsx)(TaskMeta, {icon: r.icon, label: r.label}, r.label)),
                })
              : null,
            task.body
              ? (0, e.jsx)('div', {
                  className: 'mt-1 line-clamp-3 text-xs leading-4 font-medium text-neutral-500',
                  children: task.body,
                })
              : null,
            t
              ? (0, e.jsx)('div', {
                  className: 'mt-4',
                  children: (0, e.jsx)(TaskImage, {
                    className: 'size-full',
                    image: typeof task.image == 'string' ? TASK_BRIEFING : task.image,
                  }),
                })
              : null,
          ],
        }),
        t
          ? null
          : (0, e.jsxs)('div', {
              className: E(
                'border-glass bg-surface-primary absolute right-2 -bottom-4.5 left-2 overflow-hidden rounded-lg shadow-lg',
                n && 'aspect-1440/900 overflow-clip rounded-[12px] shadow-[0_0_8px_1px_rgba(0,0,0,0.1)]',
                !n && 'h-38',
              ),
              children: [
                typeof task.image == 'string'
                  ? (0, e.jsx)('img', {
                      src: task.image,
                      alt: '',
                      className: 'h-full w-full object-cover',
                      loading: 'eager',
                    })
                  : (0, e.jsx)('img', {
                      src: task.image,
                      alt: '',
                      className: 'h-full w-full object-cover',
                      loading: 'eager',
                    }),
                n
                  ? (0, e.jsx)('div', {
                      className: 'pointer-events-none absolute inset-0',
                      style: {
                        background:
                          'radial-gradient(80% 80% at 50% 10%, rgba(250, 250, 250, 0.15) 0%, rgba(250, 250, 250, 0) 100%)',
                      },
                    })
                  : null,
              ],
            }),
      ],
    });
  },
  TaskImage = ({className, image}) =>
    (0, e.jsxs)('div', {
      className: E('relative h-full w-full select-none', className),
      children: [
        (0, e.jsx)('div', {
          className: 'h-full w-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.16)]',
          children: (0, e.jsx)('img', {
            src: image,
            alt: '',
            className: 'h-full w-full bg-white object-contain',
            draggable: false,
            loading: 'eager',
            style: {clipPath: 'polygon(0 0, 82.5% 0, 100% 13%, 100% 100%, 0 100%)'},
          }),
        }),
        (0, e.jsx)('img', {
          src: PAGE_CURL,
          alt: '',
          'aria-hidden': true,
          className: 'top-hairline right-hairline pointer-events-none absolute w-[26%]',
          draggable: false,
        }),
      ],
    }),
  TaskChip = ({icon, label, chevron = true}) =>
    (0, e.jsxs)('div', {
      className: 'flex h-6 min-w-0 shrink-0 items-center gap-1 rounded-md px-1.5',
      children: [
        icon ? (0, e.jsx)(icon, {className: 'size-3.5'}) : null,
        (0, e.jsx)('span', {className: 'truncate', children: label}),
        chevron ? (0, e.jsx)($, {className: 'size-3 opacity-60'}) : null,
      ],
    }),
  TaskMeta = ({icon, label}) =>
    (0, e.jsxs)('div', {
      className: 'flex h-4 min-w-0 items-center gap-1.5 text-xs leading-4 font-medium text-neutral-400',
      children: [
        (0, e.jsx)(icon, {className: 'size-3.5 shrink-0'}),
        (0, e.jsx)('span', {className: 'truncate', children: label}),
      ],
    }),
  AMAZON_SHOT = '/assets/task-view-amazon-Dgi-Gex7.png',
  CHASE_STATEMENT_SHOT = '/assets/task-view-chase-screenshot-2-DE6En8Ec.png',
  TAB_PREVIEW_SHOT = '/assets/task-view-tab-preview-Bzu6mK_y.png',
  CHASE_SHOT = '/assets/task-view-chase-BsZisWnf.png',
  PageCurl = s =>
    (0, e.jsx)('svg', {
      preserveAspectRatio: 'none',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      style: {display: 'block'},
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      ...s,
      children: (0, e.jsx)('path', {
        id: 'Vector',
        d: 'M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55781 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z',
        fill: 'var(--fill-0, #0A66C2)',
      }),
    }),
  NETFLIX_SHOT = '/assets/task-view-netflix-C-sX6Wnl.png',
  CHAT_TASK = 'cancel all unused subscriptions and request refunds',
  FIRST_REPLY = "First, I'll check your credit card statement to find subscriptions from last month.",
  SECOND_REPLY =
    "You paid for Netflix, Amazon Prime, and LinkedIn Premium last month. Next, I'll check those services in parallel to see whether you used them.",
  CHAT_SLOW = 2.55,
  CHAT_FAST = 0.85,
  chatMs = s => Math.round(s * CHAT_SLOW),
  chatFastMs = s => Math.round(s * CHAT_FAST),
  CHAT_START_MS = chatMs(300),
  CHAT_STEP_MS = chatMs(480),
  WORD_MS = chatMs(16),
  REPLY_HOLD_MS = chatMs(60),
  SUBAGENT_STEP_MS = chatMs(55),
  LAST_HOLD_MS = 2e3,
  AUX_STEP_MS = chatFastMs(420) + chatMs(80),
  FADE_S = chatFastMs(280) / 1e3,
  RISE_S = chatFastMs(420) / 1e3,
  SCREENSHOT_S = chatFastMs(320) / 1e3,
  FIRST_REPLY_WORDS = FIRST_REPLY.split(' ').length,
  SECOND_REPLY_WORDS = SECOND_REPLY.split(' ').length,
  SUBAGENT_COUNT = 3,
  CHAT_PHASES = [
    'user-message',
    'assistant-1',
    'tool-search',
    'aux',
    'tool-chase',
    'tool-signin',
    'tool-statement',
    'assistant-2',
    'tool-close-chase',
    'subagents-header',
    'amazon-prime',
    'done',
  ],
  phaseIndex = s => CHAT_PHASES.indexOf(s),
  reached = (s, a) =>
    phaseIndex(s) >= phaseIndex(a) /** The chat script: each step, word and subagent on a schedule. */,
  useChatScript = (s, a = false) => {
    const t = X() ?? false,
      n = E1(s, {once: true, amount: 'some'}),
      r = n && !t,
      l = (0, o.useRef)(false),
      i = usePausableTimers(a),
      [c, d] = (0, o.useState)('idle'),
      [x, f] = (0, o.useState)(0),
      [j, g] = (0, o.useState)(0),
      [S, _] = (0, o.useState)(0),
      [N, y] = (0, o.useState)(0),
      [k, v] = (0, o.useState)(0),
      [M, A] = (0, o.useState)(0),
      b = () => y(w => w + 1);
    ((0, o.useEffect)(() => {
      if (!r || l.current) return;
      l.current = true;
      const w = new Set(),
        h = (u, K) => {
          const W1 = i(u, K);
          w.add(W1);
        };
      let m = CHAT_START_MS;
      (h(() => {
        (d('user-message'), b());
      }, m),
        (m += CHAT_STEP_MS),
        h(() => {
          (d('assistant-1'), b());
        }, m));
      for (let u = 0; u < FIRST_REPLY_WORDS; u += 1)
        h(
          () => {
            (f(u + 1), b());
          },
          m + (u + 1) * WORD_MS,
        );
      ((m += FIRST_REPLY_WORDS * WORD_MS + REPLY_HOLD_MS),
        h(() => {
          (d('tool-search'), b());
        }, m),
        (m += CHAT_STEP_MS),
        h(() => {
          (d('aux'), b());
        }, m),
        (m += AUX_STEP_MS),
        h(() => {
          (d('tool-chase'), b());
        }, m),
        (m += CHAT_STEP_MS),
        h(() => {
          (d('tool-signin'), b());
        }, m),
        (m += CHAT_STEP_MS),
        h(() => {
          (d('tool-statement'), b());
        }, m),
        (m += CHAT_STEP_MS),
        h(() => {
          (d('assistant-2'), b());
        }, m));
      for (let u = 0; u < SECOND_REPLY_WORDS; u += 1)
        h(
          () => {
            (g(u + 1), b());
          },
          m + (u + 1) * WORD_MS,
        );
      ((m += SECOND_REPLY_WORDS * WORD_MS + REPLY_HOLD_MS),
        h(() => {
          (d('tool-close-chase'), b());
        }, m),
        (m += CHAT_STEP_MS));
      const z = m - CHAT_START_MS - CHAT_STEP_MS;
      h(() => {
        (A(z), d('subagents-header'), b());
      }, m);
      for (let u = 0; u < SUBAGENT_COUNT; u += 1)
        h(
          () => {
            (_(u + 1), b());
          },
          m + (u + 1) * SUBAGENT_STEP_MS,
        );
      ((m += SUBAGENT_COUNT * SUBAGENT_STEP_MS + CHAT_STEP_MS),
        h(() => {
          (d('amazon-prime'), b());
        }, m),
        (m += LAST_HOLD_MS));
      const V = CHAT_START_MS + CHAT_STEP_MS;
      for (let u = 1e3; u < m - V; u += 1e3) h(() => v(u), V + u);
      return (
        h(() => {
          (v(m - V), d('done'), b());
        }, m),
        () => w.forEach(u => u())
      );
    }, [r, i]),
      (0, o.useEffect)(() => {
        if (c !== 'done' || a || t) return;
        const w = setInterval(() => {
          v(h => h + 1e3);
        }, 1e3);
        return () => clearInterval(w);
      }, [c, a, t]));
    const C = (t && n) || c === 'done',
      p = C ? 'done' : c;
    return {
      phase: p,
      elapsedMs: t ? void 0 : k,
      subagentsElapsedMs: Math.max(0, k - M),
      showUserMessage: C || reached(p, 'user-message'),
      showToolSearch: C || reached(p, 'tool-search'),
      showAux: C || reached(p, 'aux'),
      showToolChase: C || reached(p, 'tool-chase'),
      showToolSignin: C || reached(p, 'tool-signin'),
      showToolStatement: C || reached(p, 'tool-statement'),
      showToolCloseChase: C || reached(p, 'tool-close-chase'),
      showSubagentsHeader: C || reached(p, 'subagents-header'),
      showAmazonPrime: C || reached(p, 'amazon-prime'),
      assistant1Words: C ? FIRST_REPLY_WORDS : x,
      assistant2Words: C ? SECOND_REPLY_WORDS : j,
      assistant1Visible: C || reached(p, 'assistant-1'),
      assistant2Visible: C || reached(p, 'assistant-2'),
      assistant1Typing: !C && p === 'assistant-1' && x < FIRST_REPLY_WORDS,
      assistant2Typing: !C && p === 'assistant-2' && j < SECOND_REPLY_WORDS,
      visibleSubagents: C ? SUBAGENT_COUNT : S,
      scrollTick: N,
    };
  },
  firstWords = (s, a) => s.split(' ').slice(0, a).join(' '),
  FADE = {duration: FADE_S, ease: 'easeOut'},
  RISE = {duration: RISE_S, ease: [0.22, 1, 0.36, 1]},
  MEMORY_ITEMS = [
    {
      title: 'Card Overview  |  Chase',
      meta: 'chase.com',
      trailing: '3d ago',
      icon: (0, e.jsx)('img', {src: CHASE_SHOT, className: 'size-4 rounded-sm', alt: ''}),
    },
    {
      title: 'MEMORY.md',
      meta: "User's bank and the credit card is Chase.",
      trailing: '8d ago',
      icon: (0, e.jsx)(fe, {className: 'size-4 text-neutral-500'}),
    },
    {
      title: "Jun's Chase",
      meta: 'Passkey',
      trailing: 'Passwords',
      icon: (0, e.jsx)(n1, {className: 'size-4 text-neutral-500'}),
    },
  ],
  SUBAGENTS = [
    {
      task: 'Check Netflix usage',
      color: 'sky',
      model: 'anthropic',
      modelLabel: 'Opus 4.8',
      icon: (0, e.jsx)('img', {src: NETFLIX_SHOT, className: 'size-4 shrink-0 rounded-sm', alt: ''}),
    },
    {
      task: 'Check LinkedIn Premium usage',
      color: 'violet',
      model: 'openai',
      modelLabel: 'GPT-5.5',
      icon: (0, e.jsx)(PageCurl, {className: 'size-4 shrink-0'}),
    },
    {
      task: 'Check Amazon Prime usage',
      color: 'orange',
      model: 'gemini',
      modelLabel: 'Gemini 3.5',
      icon: (0, e.jsx)('img', {src: AMAZON_SHOT, className: 'size-4 shrink-0 rounded-sm', alt: ''}),
    },
  ],
  screenshots = s => [
    {
      title: 'Netflix',
      imageSrc: '/hero-illustration/captures/02-netflix.png',
      icon: (0, e.jsx)('img', {src: NETFLIX_SHOT, className: 'size-4 rounded-sm', alt: ''}),
    },
    {
      title: 'Manage Premium account',
      imageSrc: '/hero-illustration/captures/03-linkedin-subscription-management.png',
      icon: (0, e.jsx)(PageCurl, {className: 'size-4'}),
    },
    {
      title: s ? 'Amazon Prime membership' : 'Amazon',
      imageSrc: s
        ? '/hero-illustration/captures/06-amazon-prime-management-gp.png'
        : '/hero-illustration/captures/04-amazon-home.png',
      icon: (0, e.jsx)('img', {src: AMAZON_SHOT, className: 'size-4 rounded-sm', alt: ''}),
    },
  ],
  ChatScene = ({onDone, onScreenshotChange, paused = false}) => {
    const n = (0, o.useRef)(null),
      r = useChatScript(n, paused),
      l = (0, o.useRef)(false),
      i = (0, o.useRef)(false);
    return (
      (0, o.useEffect)(() => {
        !r.showAux || l.current || ((l.current = true), onScreenshotChange?.());
      }, [r.showAux, onScreenshotChange]),
      (0, o.useEffect)(() => {
        r.phase !== 'done' || i.current || ((i.current = true), onDone?.());
      }, [r.phase, onDone]),
      (0, e.jsxs)('div', {
        ref: n,
        className: 'flex h-full flex-col overflow-hidden text-neutral-950',
        children: [
          (0, e.jsx)(ChatHeader, {}),
          (0, e.jsxs)('div', {
            className: 'flex min-h-0 flex-1',
            children: [
              (0, e.jsx)(ChatTranscript, {animation: r}),
              (0, e.jsx)(T.div, {
                className:
                  '@max-browser-lg/browser-frame:pr-3 flex min-h-0 shrink-0 items-start justify-end overflow-hidden pr-5',
                initial: false,
                animate: {width: r.showAux ? 'clamp(13rem, 38cqw, 23rem)' : 0, opacity: r.showAux ? 1 : 0},
                transition: RISE,
                children: (0, e.jsx)(ScreenshotStack, {
                  showAmazonPrime: r.showAmazonPrime,
                  showChase: !r.showToolCloseChase,
                  showStatement: r.showToolStatement,
                  showSubscriptionWindows: r.showSubagentsHeader,
                  visibleSubagents: r.visibleSubagents,
                }),
              }),
            ],
          }),
        ],
      })
    );
  },
  ScreenshotStack = ({showAmazonPrime, showChase, showStatement, showSubscriptionWindows, visibleSubagents}) => {
    const l = screenshots(showAmazonPrime).slice(0, visibleSubagents);
    return (0, e.jsx)('div', {
      className: 'flex w-full max-w-85 flex-col gap-3',
      children: (0, e.jsxs)(i1, {
        mode: 'popLayout',
        children: [
          showChase
            ? (0, e.jsx)(
                Screenshot,
                {
                  icon: (0, e.jsx)('img', {src: CHASE_SHOT, className: 'size-4 rounded-sm', alt: ''}),
                  image: showStatement ? CHASE_STATEMENT_SHOT : TASK_TAB_PREVIEW,
                  title: 'Chase Online',
                },
                'chase',
              )
            : null,
          showSubscriptionWindows
            ? l.map(i => (0, e.jsx)(Screenshot, {icon: i.icon, image: i.imageSrc, title: i.title}, i.title))
            : null,
        ],
      }),
    });
  },
  Screenshot = ({icon, image, title}) =>
    (0, e.jsxs)(T.div, {
      className:
        'ring-border-surface-strong no-squircle relative aspect-1440/900 h-auto w-full overflow-hidden rounded-xl bg-white shadow-md ring-[0.5px]',
      layout: true,
      initial: {opacity: 0, y: 12, scale: 0.98},
      animate: {opacity: 1, y: 0, scale: 1},
      exit: {opacity: 0, y: -12, scale: 0.98},
      transition: RISE,
      children: [
        (0, e.jsxs)('div', {
          className:
            'absolute top-0 right-0 left-0 z-10 flex h-8 items-center gap-1.5 rounded-t-xl bg-neutral-200/80 px-3 text-xs leading-4 font-medium text-neutral-800 backdrop-blur-md',
          children: [
            icon,
            (0, e.jsx)('span', {className: 'min-w-0 flex-1 truncate', children: title}),
            (0, e.jsx)(me, {className: 'size-4 text-neutral-500'}),
          ],
        }),
        (0, e.jsx)('img', {src: image, className: 'h-full w-full rounded-xl object-cover object-top', alt: ''}),
      ],
    }),
  ChatHeader = () =>
    (0, e.jsx)('div', {
      className: 'flex h-11 shrink-0 items-center justify-between px-1.5 py-1.5 text-sm leading-5 font-medium',
      children: (0, e.jsxs)('div', {
        className: 'flex min-w-0 items-center',
        children: [
          (0, e.jsx)(IconButton, {children: (0, e.jsx)(_1, {className: 'text-muted-foreground size-4'})}),
          (0, e.jsxs)('div', {
            className: 'flex h-8 min-w-0 items-center gap-1.5 rounded-lg px-1',
            children: [
              (0, e.jsx)('span', {
                className: 'tracking-display truncate',
                children: 'Cancel subscription and request refunds',
              }),
              (0, e.jsx)(xe, {className: 'text-muted-foreground ml-1 size-4 shrink-0'}),
            ],
          }),
        ],
      }),
    }),
  ChatTranscript = ({animation}) => {
    const a = (0, o.useRef)(null);
    return (
      (0, o.useEffect)(() => {
        const t = a.current;
        if (!t) return;
        const n = requestAnimationFrame(() => {
          t.scrollTo({top: t.scrollHeight, behavior: 'smooth'});
        });
        return () => cancelAnimationFrame(n);
      }, [animation.scrollTick]),
      (0, e.jsxs)('div', {
        className:
          '@max-browser-lg/browser-frame:px-3 @max-browser-md/browser-frame:px-2 flex h-full min-w-0 flex-1 flex-col overflow-hidden px-4',
        children: [
          (0, e.jsx)('div', {
            ref: a,
            className:
              'scroll-fade-effect-y @max-browser-lg/browser-frame:px-4 @max-browser-md/browser-frame:px-3 min-h-0 flex-1 scrollbar-none overflow-y-auto px-6 pt-5 [--mask-height:24px] [--scroll-buffer:1.25rem] [&::-webkit-scrollbar]:hidden',
            children: (0, e.jsxs)('div', {
              className: 'flex min-h-full flex-col items-end pb-4',
              children: [
                animation.showUserMessage ? (0, e.jsx)(Appear, {children: (0, e.jsx)(UserMessage, {})}) : null,
                animation.assistant1Visible &&
                  (0, e.jsx)('div', {
                    className: 'pointer-events-auto w-full',
                    children: (0, e.jsxs)(Se, {
                      defaultOpen: true,
                      children: [
                        (0, e.jsx)(we, {children: (0, e.jsx)(je, {duration: animation.elapsedMs, working: true})}),
                        (0, e.jsxs)(be, {
                          children: [
                            animation.assistant1Visible
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(TypedReply, {
                                    isTyping: animation.assistant1Typing,
                                    wordCount: animation.assistant1Words,
                                    text: "First, I'll check your credit card statement to find subscriptions from last month.",
                                  }),
                                })
                              : null,
                            animation.showToolSearch
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(M1, {}),
                                    className: 'pointer-events-auto',
                                    isLastItem: !animation.showToolChase,
                                    isActiveGroup: !animation.showToolChase,
                                    expandMode: 'force-open',
                                    title: (0, e.jsxs)(e.Fragment, {
                                      children: [
                                        'Searched browsing history and memory for',
                                        ' ',
                                        (0, e.jsx)('span', {
                                          className: 'text-brand-content font-medium',
                                          children: 'Credit card',
                                        }),
                                      ],
                                    }),
                                    children: (0, e.jsx)(ToolSteps, {}),
                                  }),
                                })
                              : null,
                            animation.showToolChase
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(t1, {}),
                                    className: 'pointer-events-auto',
                                    isLastItem: !animation.showToolSignin,
                                    isActiveGroup: !animation.showToolSignin,
                                    hideConnector: true,
                                    expandMode: 'force-open',
                                    title: 'Open Chase.com',
                                    children: (0, e.jsx)('div', {
                                      'data-chase-preview-card': true,
                                      className:
                                        'w-full max-w-70 overflow-hidden rounded-xl border border-black/15 bg-white shadow-sm shadow-black/10',
                                      children: (0, e.jsx)('img', {
                                        src: TAB_PREVIEW_SHOT,
                                        className: 'aspect-5/3 w-full object-cover object-top',
                                        alt: '',
                                      }),
                                    }),
                                  }),
                                })
                              : null,
                            animation.showToolSignin
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(n1, {}),
                                    isLastItem: !animation.showToolStatement,
                                    isActiveGroup: !animation.showToolStatement,
                                    expandMode: 'none',
                                    title: (0, e.jsxs)(e.Fragment, {
                                      children: [
                                        'Sign in to Chase with',
                                        ' ',
                                        (0, e.jsx)('span', {
                                          className: 'text-brand-content font-medium',
                                          children: "Jun's Chase Passkey",
                                        }),
                                      ],
                                    }),
                                  }),
                                })
                              : null,
                            animation.showToolStatement
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(ne, {}),
                                    isLastItem: true,
                                    isActiveGroup: !animation.assistant2Visible,
                                    expandMode: 'none',
                                    title: "Open last month's credit card statement",
                                  }),
                                })
                              : null,
                            animation.assistant2Visible
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(TypedReply, {
                                    isTyping: animation.assistant2Typing,
                                    wordCount: animation.assistant2Words,
                                    text: "You paid for Netflix, Amazon Prime, and LinkedIn Premium last month. Next, I'll check those services in parallel to see whether you used them.",
                                  }),
                                })
                              : null,
                            animation.showToolCloseChase
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(t1, {}),
                                    isLastItem: !animation.showSubagentsHeader,
                                    isActiveGroup: !animation.showSubagentsHeader,
                                    expandMode: 'none',
                                    title: 'Close Chase Online',
                                  }),
                                })
                              : null,
                            animation.showSubagentsHeader
                              ? (0, e.jsx)(Appear, {
                                  children: (0, e.jsx)(O, {
                                    icon: (0, e.jsx)(Ee, {color: 'mono'}),
                                    className: 'pointer-events-auto',
                                    isLastItem: true,
                                    isActiveGroup: true,
                                    expandMode: 'force-open',
                                    contentClassName: '-ml-[30px] w-[calc(100%+30px)] [&>div]:pb-1 [&>div]:pt-1.5',
                                    title: `Running ${animation.visibleSubagents} Subagent${animation.visibleSubagents === 1 ? '' : 's'}`,
                                    children: (0, e.jsx)(SubagentList, {
                                      visibleCount: animation.visibleSubagents,
                                      elapsedMs: animation.subagentsElapsedMs,
                                    }),
                                  }),
                                })
                              : null,
                          ],
                        }),
                      ],
                    }),
                  }),
                (0, e.jsx)('div', {className: 'h-16 shrink-0', 'aria-hidden': true}),
              ],
            }),
          }),
          (0, e.jsx)(ChatComposer, {showStopIcon: animation.showUserMessage}),
        ],
      })
    );
  },
  Appear = ({children}) =>
    (0, e.jsx)(T.div, {
      className: 'w-full',
      initial: {opacity: 0, y: -10},
      animate: {opacity: 1, y: 0},
      transition: FADE,
      children,
    }),
  UserMessage = () =>
    (0, e.jsx)('div', {
      className:
        'tracking-display mb-4 ml-auto w-fit max-w-1/2 rounded-xl bg-neutral-950/8 px-3 py-1.5 text-sm leading-[1.4em]',
      children: CHAT_TASK,
    }),
  TypedReply = ({text, wordCount, isTyping}) =>
    (0, e.jsxs)('div', {
      className: 'w-full py-3 text-sm leading-5 text-neutral-950',
      children: [
        firstWords(text, wordCount),
        isTyping ? (0, e.jsx)('span', {className: 'animate-pulse', children: '|'}) : null,
      ],
    }),
  ToolSteps = () =>
    (0, e.jsx)('div', {
      className:
        'ring-border-surface-strong bg-surface-primary overflow-hidden rounded-lg p-1 shadow-sm ring-[0.5px] shadow-black/10',
      children: MEMORY_ITEMS.map(s =>
        (0, e.jsxs)(
          'div',
          {
            className: 'flex h-7 items-center gap-1.5 rounded-md p-1 text-xs leading-4',
            children: [
              s.icon,
              (0, e.jsx)('span', {
                className: 'max-w-[45%] min-w-0 truncate font-medium text-neutral-950/85',
                children: s.title,
              }),
              (0, e.jsx)('span', {className: 'min-w-0 flex-1 truncate text-neutral-500', children: s.meta}),
              (0, e.jsx)('span', {className: 'shrink-0 font-medium text-neutral-500', children: s.trailing}),
            ],
          },
          s.title,
        ),
      ),
    }),
  SubagentList = ({visibleCount, elapsedMs}) =>
    (0, e.jsx)('div', {
      className: 'flex flex-col pl-[34px]',
      children: SUBAGENTS.slice(0, visibleCount).map(t =>
        (0, e.jsx)(
          T.div,
          {
            'data-subagent-row': true,
            className: 'flex min-w-0 flex-col',
            initial: {opacity: 0, y: -10},
            animate: {opacity: 1, y: 0},
            transition: FADE,
            children: (0, e.jsx)(ge, {
              description: t.task,
              color: t.color,
              isRunning: true,
              model: (0, e.jsxs)('span', {
                className: 'inline-flex min-w-0 items-center gap-1',
                children: [
                  t.model === 'openai' && (0, e.jsx)(L1, {className: 'size-3'}),
                  t.model === 'anthropic' && (0, e.jsx)(te, {className: 'size-3'}),
                  t.model === 'gemini' && (0, e.jsx)(De, {className: 'size-3'}),
                  t.modelLabel,
                ],
              }),
              time: Le(elapsedMs),
              activity: 'Checking subscription usage',
            }),
          },
          t.task,
        ),
      ),
    }),
  ChatComposer = ({showStopIcon}) =>
    (0, e.jsxs)('div', {
      className: 'shrink-0 pb-1',
      children: [
        (0, e.jsxs)('div', {
          className:
            'ring-border-surface-strong flex h-10 items-center rounded-full bg-white shadow-lg ring-[0.5px] shadow-black/10',
          children: [
            (0, e.jsx)('div', {
              className: 'ml-1.5 flex size-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500',
              children: (0, e.jsx)(V1, {className: 'size-4'}),
            }),
            (0, e.jsx)('div', {
              'data-task-input-placeholder': true,
              className: 'min-w-0 flex-1 truncate px-2 text-sm leading-5 whitespace-nowrap text-neutral-500',
              children: 'Reply, @ for context',
            }),
            (0, e.jsx)('div', {
              className: 'mr-1.5 flex size-7 items-center justify-center rounded-full bg-neutral-950 text-white',
              children: showStopIcon ? (0, e.jsx)(ae, {className: 'size-4'}) : (0, e.jsx)(ce, {className: 'size-4'}),
            }),
          ],
        }),
        (0, e.jsxs)('div', {
          className:
            'flex h-10 min-w-0 items-center overflow-hidden text-xs leading-4 font-medium whitespace-nowrap text-neutral-500',
          children: [
            (0, e.jsx)(ToolStep, {icon: he, label: 'Local'}),
            (0, e.jsx)(ToolStep, {icon: Te, label: 'Guard'}),
            (0, e.jsx)('div', {className: 'grow'}),
            (0, e.jsx)($1, {className: 'mr-2 size-4 text-neutral-600'}),
            (0, e.jsx)(ToolStep, {label: 'GPT-5.5'}),
            (0, e.jsx)(ToolStep, {label: 'High'}),
          ],
        }),
      ],
    }),
  ToolStep = ({icon, label, active = false}) =>
    (0, e.jsxs)('div', {
      className: E('flex h-7 min-w-0 shrink-0 items-center gap-1 rounded-md px-1.5', active && 'text-orange-500'),
      children: [
        icon ? (0, e.jsx)(icon, {className: 'size-3.5'}) : null,
        (0, e.jsx)('span', {className: 'truncate', children: label}),
        (0, e.jsx)($, {className: 'size-3 opacity-60'}),
      ],
    }),
  IconButton = ({children}) =>
    (0, e.jsx)('div', {className: 'flex size-8 items-center justify-center rounded-lg text-neutral-950', children}),
  CHAT_TITLE = 'Cancel subscription and request refunds ⋅ Tasks',
  CROSSFADE_MS = 300,
  SCENE_GAP = 320 /** The hero: the New Tab intro, then the chat, crossfading in a loop. */,
  Hero = () => {
    const s = (0, o.useRef)(null),
      [a, t] = (0, o.useState)(0),
      [n, r] = (0, o.useState)('intro'),
      [l, i] = (0, o.useState)(false),
      [c, d] = (0, o.useState)('New Tab'),
      [x, f] = (0, o.useState)('3'),
      [j, g] = (0, o.useState)(false),
      [S, _] = (0, o.useState)(false),
      [N, y] = (0, o.useState)(false),
      k = (0, o.useCallback)(() => {
        (i(false), d('New Tab'), r('return'));
      }, []),
      v = useNewTabPointer(s, l, N, k),
      M = (0, o.useCallback)(() => {
        (d(CHAT_TITLE), r('task-view'));
      }, []),
      A = (0, o.useCallback)(() => {
        window.setTimeout(() => g(true), SCENE_GAP);
      }, []),
      b = (0, o.useCallback)(() => {
        S ||
          (_(true),
          window.setTimeout(() => {
            (y(false), g(false), _(false), i(false), r('intro'), d('New Tab'), f('3'), t(m => m + 1));
          }, CROSSFADE_MS));
      }, [S]),
      C = (0, o.useCallback)(() => y(m => !m), []),
      p = j ? 'Replay illustration animation' : N ? 'Resume illustration animation' : 'Pause illustration animation',
      w = j ? ze : N ? ve : pe,
      h = n === 'intro' || n === 'return';
    return (0, e.jsxs)('div', {
      className: 'pointer-events-none relative size-full overflow-hidden select-none',
      role: 'img',
      'aria-label': 'Animated mock illustration of the Aux browser interface',
      children: [
        (0, e.jsx)('div', {
          className:
            'absolute top-0 left-[calc(100%/28)] h-[calc(100%/0.5)] w-[calc((100vw_-_var(--spacing)*4)/0.7)] origin-top-left scale-[0.65]',
          children: (0, e.jsxs)(
            BrowserFrame,
            {
              ref: s,
              className: E('size-full max-w-none', N && 'paused **:paused'),
              agentTabsCount: x,
              selectedTabLabel: c,
              taskLabel: n === 'intro' ? void 0 : 'Cancel subscription and request refunds',
              returnedToMain: n === 'return',
              children: [
                v.pointerLayer
                  ? (0, ReactDOM.createPortal)(
                      (0, e.jsx)(PointerLayer, {
                        layer: v.pointerLayer,
                        pointerType: v.pointerType,
                        pointerOpacity: v.pointerOpacity,
                        pointerMoving: v.pointerMoving,
                        pointerAtStart: v.pointerAtStart,
                        moveMs: v.pointerMoveMs,
                        fadeMs: v.pointerFadeMs,
                      }),
                      v.pointerLayer.frame,
                    )
                  : null,
                (0, e.jsx)(BrowserContent, {
                  addressBarMode: n === 'task-view' ? 'task' : 'search',
                  children: (0, e.jsx)('div', {
                    className: 'relative h-full overflow-hidden',
                    children: (0, e.jsx)(i1, {
                      mode: 'wait',
                      children: h
                        ? (0, e.jsx)(
                            T.div,
                            {
                              className: 'absolute inset-0',
                              initial: n === 'return' ? {opacity: 0, y: 18, scale: 0.985} : false,
                              animate: {opacity: 1, y: 0, scale: 1},
                              exit: {opacity: 0, y: -18, scale: 0.985},
                              transition: {duration: 0.32, ease: [0.22, 1, 0.36, 1]},
                              children: (0, e.jsx)(NewTabScene, {
                                paused: N,
                                variant: n === 'return' ? 'return' : 'intro',
                                onDone: n === 'return' ? A : M,
                              }),
                            },
                            n,
                          )
                        : (0, e.jsx)(
                            T.div,
                            {
                              className: 'absolute inset-0',
                              initial: {opacity: 0, y: 18, scale: 0.985},
                              animate: {opacity: 1, y: 0, scale: 1},
                              transition: {duration: 0.38, ease: [0.22, 1, 0.36, 1]},
                              children: (0, e.jsx)(ChatScene, {
                                paused: N,
                                onDone: () => i(true),
                                onScreenshotChange: () => f('4'),
                              }),
                            },
                            'task-view',
                          ),
                    }),
                  }),
                }),
              ],
            },
            a,
          ),
        }),
        (0, e.jsx)('div', {
          className: 'group pointer-events-auto absolute right-0 bottom-0 z-20 flex size-24 items-end justify-end p-4',
          children: (0, e.jsx)(r1, {
            'aria-label': p,
            className: E(
              'text-primary rounded-full border-black/6 bg-white! shadow-lg transition duration-200 hover:scale-[95%] hover:opacity-90',
              S
                ? 'scale-[0.92] opacity-0'
                : j
                  ? 'scale-100 opacity-100'
                  : 'scale-[0.92] opacity-0 group-hover:scale-100 group-hover:opacity-100 focus-visible:scale-100 focus-visible:opacity-100',
            ),
            size: 'icon-sm',
            onClick: j ? b : C,
            children: j
              ? (0, e.jsx)(T.span, {
                  className: 'inline-flex',
                  whileHover: S ? void 0 : {rotate: -45},
                  animate: {rotate: S ? -360 : 0},
                  transition: {duration: CROSSFADE_MS / 1e3, ease: [0.22, 1, 0.36, 1]},
                  children: (0, e.jsx)(w, {className: 'size-4'}),
                })
              : (0, e.jsx)(w, {className: 'size-4'}),
          }),
        }),
      ],
    });
  };
function aa() {
  const s = X();
  return (0, e.jsxs)(ee, {
    orientation: 'horizontal',
    className: 'min-h-0',
    children: [
      (0, e.jsx)(c1, {
        id: 'splash-login',
        defaultSize: '45.5%',
        minSize: '0%',
        className: 'overflow-hidden',
        children: (0, e.jsx)(T.section, {
          'aria-label': 'Sign in to Aux',
          className: 'no-drag flex h-full min-w-80 flex-col overflow-y-auto px-7 pt-6 pb-8',
          initial: {opacity: s ? 1 : 0},
          animate: {opacity: 1},
          transition: {duration: s ? 0 : 0.4},
          children: (0, e.jsx)(v2, {}),
        }),
      }),
      (0, e.jsx)(c1, {
        id: 'splash-hero',
        defaultSize: '54.5%',
        minSize: '0%',
        children: (0, e.jsx)('div', {
          className: 'light @container-size flex size-full items-center justify-center p-2',
          children: (0, e.jsxs)(T.div, {
            className:
              'inset-black/10 relative flex size-full shrink-0 flex-col overflow-hidden rounded-xl shadow-xs inset-ring-1',
            initial: {opacity: s ? 1 : 0},
            animate: {opacity: 1},
            transition: {duration: s ? 0 : 0.4},
            children: [
              (0, e.jsx)('video', {
                src: BACKGROUND_VIDEO,
                onLoadedMetadata: a => {
                  a.currentTarget.playbackRate = 0.35;
                },
                autoPlay: !s,
                muted: true,
                loop: true,
                playsInline: true,
                'aria-hidden': true,
                className:
                  'pointer-events-none absolute top-1/2 left-1/2 z-0 h-[100cqh] w-[100cqw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover',
              }),
              (0, e.jsx)('div', {
                className: 'relative z-1 flex min-h-0 flex-1 flex-col pt-36',
                children: (0, e.jsx)('div', {
                  className: 'relative min-h-0 flex-1 overflow-hidden',
                  children: (0, e.jsx)(Hero, {}),
                }),
              }),
            ],
          }),
        }),
      }),
    ],
  });
}
