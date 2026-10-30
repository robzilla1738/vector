/* Aux-owned source: the New Tab onboarding helper (assets/onboarding-helper-BVYyPOep.js, after its
 * imports; X exported as OnboardingHelper). Starter suggestion chips under the New Tab composer
 * (set up memory, a routine, more), always shown; one fills the composer with its prompt or opens
 * its page. Aux change: the supplied fold is gone (owner, 2026-10-30).
 * Names the rest of the chunk uses keep their chunk names: X OnboardingHelper.
 * Chunk names used: I the account, auxNewTab the New Tab mode, y broadcast, A the prompt event, N open
 * a page, l cn, b/p icons and Button. */
var jsxRuntime = w(),
  RoutineIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: (0, jsxRuntime.jsx)('path', {
        d: 'M9.06444 2C8.49628 2 7.97688 2.321 7.72279 2.82918L3.22279 11.8292C2.72412 12.8265 3.44936 14 4.56443 14H7.62982L5.62308 20.1874C5.15109 21.6427 6.90506 22.7879 8.04755 21.7703L21.6899 9.62015C22.7193 8.70329 22.0708 7 20.6922 7H16.7716L18.4086 4.27174C19.0084 3.27196 18.2883 2 17.1223 2H9.06444Z',
        fill: 'currentColor',
      }),
    }),
  TaskIcon = ({size = 24, ariaHidden = true, ...a}) =>
    (0, jsxRuntime.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...a,
      children: (0, jsxRuntime.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M8.7587 3H15.2413C16.0463 2.99999 16.7106 2.99998 17.2518 3.0442C17.8139 3.09012 18.3306 3.18868 18.816 3.43598C19.5686 3.81947 20.1805 4.43139 20.564 5.18404C20.8113 5.66938 20.9099 6.18608 20.9558 6.74818C21 7.28937 21 7.95372 21 8.75868V15.2413C21 16.0463 21 16.7106 20.9558 17.2518C20.9099 17.8139 20.8113 18.3306 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C18.3306 20.8113 17.8139 20.9099 17.2518 20.9558C16.7106 21 16.0463 21 15.2413 21H8.75868C7.95372 21 7.28937 21 6.74818 20.9558C6.18608 20.9099 5.66938 20.8113 5.18404 20.564C4.43139 20.1805 3.81947 19.5686 3.43598 18.816C3.18868 18.3306 3.09012 17.8139 3.0442 17.2518C2.99998 16.7106 2.99999 16.0463 3 15.2413V8.75869C2.99999 7.95373 2.99998 7.28936 3.0442 6.74818C3.09012 6.18608 3.18868 5.66938 3.43598 5.18404C3.81947 4.43139 4.43139 3.81947 5.18404 3.43598C5.66938 3.18868 6.18608 3.09012 6.74818 3.0442C7.28936 2.99998 7.95375 2.99999 8.7587 3ZM16.2039 10.4571C16.5944 10.0666 16.5944 9.43343 16.2039 9.0429C15.8133 8.65238 15.1802 8.65238 14.7897 9.0429L10.9968 12.8358L9.70387 11.5429C9.31334 11.1524 8.68018 11.1524 8.28966 11.5429C7.89913 11.9334 7.89913 12.5666 8.28966 12.9571L10.2897 14.9571C10.6802 15.3476 11.3133 15.3476 11.7039 14.9571L16.2039 10.4571Z',
        fill: 'currentColor',
      }),
    }),
  React = x(v(), 1),
  /** OnboardingHelper: the chip row. */
  X = () => {
    const o = I(),
      {omniboxMode} = auxNewTab(),
      {broadcast} = y(),
      g = r => () => {
        if (r.action.type === 'prompt') {
          broadcast(A, {prompt: r.action.prompt});
          return;
        }
        if (r.action.type === 'redirect') {
          N(r.action.getPath(o));
          return;
        }
      };
    return (0, jsxRuntime.jsx)('section', {
      className: 'mx-auto w-full max-w-200 px-8 pb-6',
      style: {marginTop: omniboxMode === 'ask' ? '-1.5rem' : '-4.5rem', transition: 'margin-top .15s ease-out'},
      children: (0, jsxRuntime.jsx)('div', {
        className: 'flex flex-wrap justify-center gap-2',
        children: SUGGESTIONS.map(r =>
          (0, jsxRuntime.jsxs)(
            'button',
            {
              type: 'button',
              title: r.description,
              onClick: g(r),
              className:
                'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium outline-none transition-colors select-none focus-visible:ring-[3px] [&_svg]:size-4 [&_svg]:shrink-0',
              children: [
                r.type === 'task' && (0, jsxRuntime.jsx)(TaskIcon, {}),
                r.type === 'routine' && (0, jsxRuntime.jsx)(RoutineIcon, {}),
                r.type === 'etc' && (0, jsxRuntime.jsx)(b, {}),
                (0, jsxRuntime.jsx)('span', {children: r.title}),
              ],
            },
            r.id ?? r.title,
          ),
        ),
      }),
    });
  },
  /** The starter suggestions: what each one does and the prompt or page it opens. */
  SUGGESTIONS = [
    {
      type: 'task',
      title: 'Set up memory',
      description: 'Ask Aux to learn from your context so it can work proactively with less input.',
      action: {
        type: 'prompt',
        label: 'Use this prompt',
        prompt: `Research every single detail about me and save it to memory in an organized way.

With the saved memory, you should be able to:
- Write messages in my tone and manner to my friends or colleagues
- Buy things from unfamiliar websites
- Review important documents and sign them

Use everything you have, including built-in skills, browsing history, chat and memories in AI services, and web search to gather context about me.

Once you gathered all the information: Review whether it is sufficient for the tasks I mentioned above. If the score is higher than 9 out of 10, save it. If it is not, find the missing parts and fill them in.

+ It is okay to save my name, home address, phone number, and ID information in plaintext (The memory is encrypted)`,
      },
    },
    {
      type: 'routine',
      title: 'Automate routines',
      description: 'Ask Aux to look through your recent work and suggest tasks it can automate.',
      action: {
        type: 'prompt',
        label: 'Use this prompt',
        prompt: `Look back over my recent work and identify repeated manual workflows worth automating with Aux.

Good workflows are:
- Occured at least twice in the last 30 days
- Has stable inputs, a repeatable procedure, and a clear output or stopping condition
- Scheduled or recurring check, report, reminder, or monitor

Use everything you have, including built-in skills, browsing history, chat and memories in AI services, and conversation threads to find the tasks.

Once you found the workflow candidates: Review whether it is worthy or not. If the score is higher than 9 out of 10, suggest it.
+ You can create routines or trigger workflows by web push notifications.

At the end of the message, suggest user to create a routine.`,
      },
    },
    {
      type: 'etc',
      title: 'Customize Aux',
      description: 'Make Aux yours with custom skills, memory, shortcuts, and preferences.',
      action: {type: 'redirect', label: 'Open Settings', getPath: t => `/u/${t}/settings/plugins/skills`},
    },
  ];
