/* Aux-owned source: the onboarding layout parts (assets/onboarding-layout-MxuCwWDr.js, after its
 * imports): the title, subtitle, header, body and footer of an onboarding step, the Aux mark, a divider
 * with an optional label, and the Continue button that Enter presses when focus is not on a control.
 * Names the rest of the chunk uses keep their chunk names (all exported): k OnboardingTitle,
 * O OnboardingSubtitle, _ OnboardingHeader, E OnboardingBody, D OnboardingFooter, K OnboardingMark,
 * A OnboardingDivider, S OnboardingContinue.
 * Chunk names used: o cn, g Button, b arrow icon, p the Aux mark, f a dialog is open. */
var jsxRuntime = x(),
  k = ({children, className, ...a}) =>
    (0, jsxRuntime.jsx)('h1', {
      className: o('font-display text-3xl leading-8 font-[450] tracking-[-0.008em]', className),
      ...a,
      children,
    }),
  O = ({children, className, ...a}) =>
    (0, jsxRuntime.jsx)('p', {
      className: o('text-muted-foreground text-base font-[480] tracking-[-0.008em] text-balance', className),
      ...a,
      children,
    }),
  _ = ({children, className, ...a}) =>
    (0, jsxRuntime.jsx)('header', {
      className: o('w-full shrink-0 space-y-2.5 px-9 pt-12 pb-10 text-center select-none', className),
      ...a,
      children,
    }),
  E = ({children, className, ...a}) =>
    (0, jsxRuntime.jsx)('div', {
      className: o('flex w-full grow flex-col items-center justify-center overflow-hidden px-10 py-9', className),
      ...a,
      children,
    }),
  React = m(u(), 1),
  D = ({children, className, ...a}) =>
    (0, jsxRuntime.jsx)('div', {
      className: o('flex w-full shrink-0 items-center justify-between p-5', className),
      ...a,
      children,
    }),
  K = () =>
    (0, jsxRuntime.jsx)('div', {
      className: 'pb-1',
      children: (0, jsxRuntime.jsx)(p, {className: 'dark:text-muted text-muted-foreground/60 mx-auto size-8'}),
    }),
  A = ({children}) =>
    (0, jsxRuntime.jsx)('div', {
      className: 'pt-3 pb-6',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'text-muted flex h-3 items-center',
        children: [
          (0, jsxRuntime.jsx)('div', {className: 'bg-muted h-px grow'}),
          children && (0, jsxRuntime.jsx)('span', {className: 'px-1.5 text-[10px] leading-none uppercase', children}),
          (0, jsxRuntime.jsx)('div', {className: 'bg-muted h-px grow'}),
        ],
      }),
    }) /** OnboardingContinue: the step’s primary button; Enter presses it unless focus is on a control. */,
  S = ({children, variant = 'default', size = 'lg', ...c}) => {
    const i = (0, React.useRef)(null);
    return (
      (0, React.useEffect)(() => {
        if (variant !== 'default') return;
        const l = n => {
          if (
            n.key !== 'Enter' ||
            n.defaultPrevented ||
            n.repeat ||
            n.metaKey ||
            n.ctrlKey ||
            n.altKey ||
            n.shiftKey ||
            f() ||
            isControl(n.target)
          )
            return;
          const s = i.current;
          !s || s.disabled || s.getAttribute('aria-disabled') === 'true' || (n.preventDefault(), s.click());
        };
        return (document.addEventListener('keydown', l), () => document.removeEventListener('keydown', l));
      }, [variant]),
      (0, jsxRuntime.jsxs)(g, {
        ref: i,
        size,
        variant,
        ...c,
        children: [
          children,
          (0, jsxRuntime.jsx)(b, {className: 'text-primary-foreground/50', 'data-icon': 'inline-end'}),
        ],
      })
    );
  } /** Whether an element is a control that handles Enter itself. */,
  isControl = e =>
    e instanceof Element
      ? !!e.closest(
          [
            'input',
            'textarea',
            'select',
            'button',
            'a[href]',
            '[contenteditable=""]',
            '[contenteditable="true"]',
            '[role="textbox"]',
            '[role="button"]',
            '[role="checkbox"]',
            '[role="radio"]',
            '[role="switch"]',
            '[role="combobox"]',
            '[role="option"]',
            '[role="tab"]',
            '[role="menuitem"]',
            '[tabindex]:not([tabindex="-1"])',
          ].join(','),
        )
      : false;
