/* Aux-owned source, the setup dialog kit (assets/components-BlZz2O2v.js, the module body and its exports): the
 * tall dialog with a header, body, scrolling header and footer; the password field with show and hide; the
 * section heading, row list, provider row and folding section; and the 12-word recovery phrase grid and
 * word inputs. Onboarding's browser and password manager steps, a channel's password prompt and the
 * browser data recovery enrollment use them.
 * Names the chunk's importers use are its exports: ae the dialog (a), Z the header (c), ue a provider row (d),
 * le the phrase grid (f), G the eye-off icon (g), g pasting words (h), oe the password field (i), re the
 * scrolling body (l), de the section heading (m), pe the folding section (n), se the body (o), ce the word
 * inputs (p), te the footer (s), me the row list (u).
 * Chunk names used: w the JSX module, C/j interop and React, c cn, B/O/T/z dialog parts, k the dialog's
 * key handler, b/h/R the input group, N its button, D the eye icon, y Input, F parsing a recovery key, V/_/P
 * avatar parts, L the file icon, I check, E/S/M/A accordion parts.
 * Aux changes: the dialog takes the 12px corner; a hovered or pressed row follows --muted, not a fixed
 * neutral. Aux has no built-in password manager, so that product's badge, its icon and the unused blank
 * phrase are gone; nothing imported them. */
var jsxRuntime = w() /** The eye-off icon. */,
  G = ({size = 24, ariaHidden = true, ...props}) =>
    (0, jsxRuntime.jsxs)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: [
        (0, jsxRuntime.jsx)('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M2.29289 2.29289C2.68342 1.90237 3.31658 1.90237 3.70711 2.29289L21.7071 20.2929C22.0976 20.6834 22.0976 21.3166 21.7071 21.7071C21.3166 22.0976 20.6834 22.0976 20.2929 21.7071L17.203 18.6172C14.7508 19.9844 12.019 20.3448 9.40471 19.6681C6.54345 18.9274 3.89989 16.9664 1.93129 13.8843C1.19801 12.7362 1.19697 11.2661 1.93064 10.1173C2.8561 8.66813 3.93044 7.46654 5.10829 6.52251L2.29289 3.70711C1.90237 3.31658 1.90237 2.68342 2.29289 2.29289ZM12.5184 13.9326L14.0319 15.4461C13.4364 15.7979 12.7414 16.0002 11.9999 16.0002C9.79077 16.0002 7.99991 14.2094 7.99991 12.0002C7.99991 11.2588 8.20225 10.5637 8.55399 9.96821L10.0676 11.4818C10.0234 11.647 9.99991 11.8208 9.99991 12.0002C9.99991 13.1048 10.8953 14.0002 11.9999 14.0002C12.1793 14.0002 12.3531 13.9767 12.5184 13.9326Z',
          fill: 'currentColor',
        }),
        (0, jsxRuntime.jsx)('path', {
          d: 'M22.0676 13.8861C21.5419 14.7088 20.9681 15.4514 20.3551 16.1121L8.7627 4.51969C9.81695 4.17488 10.9045 4.00001 12.0003 4C15.8041 3.99997 19.5073 6.10671 22.0676 10.1138C22.8013 11.2622 22.8013 12.7377 22.0676 13.8861Z',
          fill: 'currentColor',
        }),
      ],
    }),
  React = C(j(), 1) /** The tall setup dialog. */,
  ae = ({open, badge, onOpenChange, children}) =>
    (0, jsxRuntime.jsx)(B, {
      open,
      onOpenChange,
      children: (0, jsxRuntime.jsxs)(O, {
        showCloseButton: false,
        className: 'flex h-130 max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-160',
        onKeyDownCapture: k,
        children: [
          badge && (0, jsxRuntime.jsx)('div', {className: 'absolute top-4 left-4', children: badge}),
          children,
        ],
      }),
    }) /** Its header. */,
  Z = ({title, description, icon, className}) =>
    (0, jsxRuntime.jsxs)('header', {
      className: c('shrink-0 space-y-0 px-6 pt-12 pb-6 text-center', className),
      children: [
        icon && (0, jsxRuntime.jsx)('div', {className: 'flex justify-center pb-4', children: icon}),
        (0, jsxRuntime.jsx)(z, {
          className: 'font-display text-2xl leading-9 font-[450] tracking-[-0.3px]',
          children: title,
        }),
        (0, jsxRuntime.jsx)(T, {
          className: c('text-sm font-medium', !description && 'sr-only'),
          children: description ?? title,
        }),
      ],
    }) /** Its body. */,
  se = ({className, ...props}) =>
    (0, jsxRuntime.jsx)('div', {
      ...props,
      className: c('mx-auto flex min-h-0 w-full max-w-115 flex-1 flex-col overflow-y-auto px-4', className),
    }) /** A body that scrolls, its title moving up into the top bar once the header leaves. */,
  re = ({title, description, icon, children}) => {
    const headerRef = (0, React.useRef)(null),
      scrollRef = (0, React.useRef)(null),
      [scrolled, setScrolled] = (0, React.useState)(false);
    return (
      (0, React.useEffect)(() => {
        const header = headerRef.current;
        if (!header) return;
        const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
          root: scrollRef.current,
        });
        return (observer.observe(header), () => observer.disconnect());
      }, []),
      (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
        children: [
          (0, jsxRuntime.jsx)('div', {
            className: 'flex h-12 shrink-0 items-center justify-center px-32',
            'aria-hidden': 'true',
            children: (0, jsxRuntime.jsx)('span', {
              className: c('truncate text-xs font-medium transition-opacity', scrolled ? 'opacity-100' : 'opacity-0'),
              children: title,
            }),
          }),
          (0, jsxRuntime.jsxs)('div', {
            className: 'scroll-fade-y min-h-0 flex-1 overflow-y-auto overscroll-contain [--mask-height:20px]',
            ref: scrollRef,
            children: [
              (0, jsxRuntime.jsx)('div', {
                ref: headerRef,
                children: (0, jsxRuntime.jsx)(Z, {title, description, icon, className: 'pt-2 pb-6'}),
              }),
              (0, jsxRuntime.jsx)('div', {
                className: 'mx-auto flex w-full max-w-115 flex-col gap-4 px-4 pb-4',
                children,
              }),
            ],
          }),
        ],
      })
    );
  } /** Its footer. */,
  te = ({className, ...props}) =>
    (0, jsxRuntime.jsx)('footer', {
      ...props,
      className: c('flex shrink-0 items-center justify-between gap-2 p-4', className),
    }) /** A password field with Show and Hide. */,
  oe = ({size = 'default', startAddon, className, ...props}) => {
    const [visible, setVisible] = (0, React.useState)(false),
      toggle = () => setVisible(shown => !shown);
    return (0, jsxRuntime.jsxs)(b, {
      className: c(size === 'lg' ? 'h-10' : 'h-9', className),
      children: [
        startAddon && (0, jsxRuntime.jsx)(h, {align: 'inline-start', children: startAddon}),
        (0, jsxRuntime.jsx)(R, {'data-bro-ignore': 'true', ...props, type: visible ? 'text' : 'password'}),
        (0, jsxRuntime.jsx)(h, {
          align: 'inline-end',
          children: (0, jsxRuntime.jsx)(N, {
            size: size === 'lg' ? 'icon-sm' : 'icon-xs',
            tabIndex: -1,
            'aria-label': visible ? 'Hide password' : 'Show password',
            className: 'text-muted-foreground',
            onClick: toggle,
            children: visible ? (0, jsxRuntime.jsx)(G, {}) : (0, jsxRuntime.jsx)(D, {}),
          }),
        }),
      ],
    });
  } /** The recovery phrase in numbered rows of three. */,
  le = ({phrase}) => {
    const rows = Array.from({length: Math.ceil(phrase.length / 3)}, (row, rowIndex) =>
      phrase.slice(rowIndex * 3, rowIndex * 3 + 3),
    );
    return (0, jsxRuntime.jsx)('div', {
      className: 'bg-muted divide-background w-full divide-y overflow-hidden rounded-xl border',
      children: rows.map((unused, index) =>
        (0, jsxRuntime.jsx)(
          'div',
          {
            className: 'grid grid-cols-3 gap-2 px-3 py-2',
            children: unused.map((word, wordIndex) =>
              (0, jsxRuntime.jsxs)(
                'div',
                {
                  className: 'flex items-center gap-1 font-mono text-sm',
                  children: [
                    (0, jsxRuntime.jsxs)('span', {
                      className: 'text-muted-foreground',
                      children: [`${index * 3 + wordIndex + 1}`.padStart(2, '0'), '.'],
                    }),
                    (0, jsxRuntime.jsx)('span', {children: word}),
                  ],
                },
                wordIndex,
              ),
            ),
          },
          index,
        ),
      ),
    });
  };
var /** One input per recovery word; pasting several fills the following inputs. */
  ce = ({className, value, wordIndexes, autoFocus, required, disabled, onChange}) => {
    const handleChange = index => async event => {
        const typed = event.target.value;
        if (/\s/.test(typed.trim())) {
          onChange(await g(value, index, typed));
          return;
        }
        const words = [...value];
        ((words[index] = cleanWord(typed)), onChange(words));
      },
      handlePaste = index => async event => {
        const pasted = event.clipboardData.getData('text').trim();
        /\s/.test(pasted) && (event.preventDefault(), onChange(await g(value, index, pasted)));
      };
    return (0, jsxRuntime.jsx)('div', {
      className: c('grid grid-cols-4 gap-1.5', className),
      children: value.map((word, index) =>
        (0, jsxRuntime.jsx)(
          y,
          {
            'data-bro-ignore': 'true',
            'aria-label': `Recovery word ${(wordIndexes?.[index] ?? index) + 1}`,
            className: 'h-9 font-mono',
            placeholder: `${(wordIndexes?.[index] ?? index) + 1}`.padStart(2, '0'),
            autoFocus: autoFocus && index === 0,
            autoComplete: 'off',
            autoCapitalize: 'off',
            spellCheck: false,
            required,
            disabled,
            value: word,
            onChange: handleChange(index),
            onPaste: handlePaste(index),
          },
          index,
        ),
      ),
    });
  } /** The words with a pasted phrase or key written from `index`. */,
  g = async (words, index, pasted) => {
    const phrase = await F(pasted).then(
        word => word.phrase,
        () => pasted,
      ),
      next = [...words];
    return (
      splitWords(phrase)
        .slice(0, words.length - index)
        .forEach((word, offset) => {
          next[index + offset] = word;
        }),
      next
    );
  },
  cleanWord = word => word.toLowerCase().replace(/[^a-z]/g, ''),
  splitWords = text => text.split(/\s+/).map(cleanWord).filter(Boolean) /** A section heading. */,
  de = ({children, className}) =>
    (0, jsxRuntime.jsx)('h3', {
      className: c('font-display text-primary px-2 text-sm leading-6 font-medium', className),
      children,
    }) /** A list of rows. */,
  me = ({className, ...props}) =>
    (0, jsxRuntime.jsx)('div', {
      ...props,
      className: c(
        'bg-border space-y-hairline border-hairline overflow-hidden rounded-xl dark:space-y-px dark:border-transparent dark:bg-transparent',
        className,
      ),
    }) /** A provider row. */,
  ue = ({image, label, status, done, selected, disabled, onClick}) =>
    (0, jsxRuntime.jsxs)('button', {
      type: 'button',
      className:
        'bg-surface-primary flex h-13.5 w-full min-w-0 items-center gap-1.5 px-3 text-left transition-colors duration-75 hover:bg-muted disabled:cursor-default disabled:opacity-50 aria-pressed:bg-muted',
      'aria-pressed': selected,
      disabled,
      onClick,
      children: [
        (0, jsxRuntime.jsxs)(V, {
          className: 'size-8 shrink-0 rounded-none',
          children: [
            (0, jsxRuntime.jsx)(_, {src: image}),
            (0, jsxRuntime.jsx)(P, {
              className: 'bg-transparent',
              children: (0, jsxRuntime.jsx)(L, {className: 'text-muted-foreground size-6'}),
            }),
          ],
        }),
        (0, jsxRuntime.jsxs)('span', {
          className: 'min-w-0 grow px-0.5',
          children: [
            (0, jsxRuntime.jsx)('span', {
              className: 'text-primary block truncate text-sm font-medium',
              children: label,
            }),
            status &&
              (0, jsxRuntime.jsx)('span', {
                className: 'text-success block truncate text-xs font-medium',
                children: status,
              }),
          ],
        }),
        (selected || done) &&
          (0, jsxRuntime.jsx)(I, {className: c('size-4 shrink-0', selected ? 'text-primary' : 'text-success')}),
      ],
    }) /** A folding section that scrolls into view when toggled. */,
  pe = ({title, defaultOpen, children}) => {
    const triggerRef = (0, React.useRef)(null),
      [openItems, setOpenItems] = (0, React.useState)(defaultOpen ? ['providers'] : []),
      toggled = (0, React.useRef)(false),
      handleChange = next => {
        ((toggled.current = true), setOpenItems(next));
      };
    return (
      (0, React.useLayoutEffect)(() => {
        toggled.current &&
          ((toggled.current = false),
          triggerRef.current?.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'}));
      }, [openItems]),
      (0, jsxRuntime.jsx)(E, {
        value: openItems,
        onValueChange: handleChange,
        children: (0, jsxRuntime.jsxs)(S, {
          value: 'providers',
          children: [
            (0, jsxRuntime.jsx)(M, {
              ref: triggerRef,
              className: 'items-center gap-2 px-2 py-1 hover:bg-muted dark:hover:bg-white/5',
              children: (0, jsxRuntime.jsx)('span', {
                className: 'font-display text-primary grow text-left text-sm leading-6 font-medium',
                children: title,
              }),
            }),
            (0, jsxRuntime.jsx)(A, {
              className: 'pt-2 pb-0',
              style: {animation: openItems.includes('providers') ? 'none' : void 0},
              children,
            }),
          ],
        }),
      })
    );
  };
export {
  ae as a,
  Z as c,
  ue as d,
  le as f,
  G as g,
  g as h,
  oe as i,
  re as l,
  de as m,
  pe as n,
  se as o,
  ce as p,
  te as s,
  me as u,
};
