/* Aux-owned source, the copy button (assets/copy-button-C-CFkoWv.js, from the check icon to the end of
 * the module; the JSX runtime binding before it stays supplied): copies a value (or what a function
 * returns), confirms with a toast, and shows a check for two seconds.
 * Names the rest of the chunk uses keep their chunk names (exported): R CopyButton, T CopyButtonIcon.
 * Chunk names used: e JSX runtime, d/h React interop, v the clipboard hook, _ toast, B Button, g/b
 * motion, y cn, j the copy icon. */
CheckIcon = ({size = 24, ariaHidden = true, ...r}) =>
    (0, e.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, e.jsx)('path', {
        d: 'M20.1934 3.40919C20.5195 2.96383 21.1452 2.86737 21.5908 3.19337C22.0362 3.51956 22.1326 4.14525 21.8066 4.59083L10.1016 20.5908C9.94091 20.8104 9.69735 20.9549 9.42773 20.9912C9.15807 21.0276 8.88493 20.9525 8.67187 20.7832L2.37793 15.7832C1.94551 15.4397 1.87332 14.8104 2.2168 14.3779C2.56031 13.9455 3.18963 13.8733 3.62207 14.2168L9.10058 18.5693L20.1934 3.40919Z',
        fill: 'currentColor',
      }),
    }),
  React = d(h(), 1),
  CopyContext = (0, React.createContext)(null),
  useCopyContext = () => {
    const t = (0, React.use)(CopyContext);
    if (!t) throw new Error('useCopyButtonContext must be used within CopyButtonContext');
    return t;
  },
  R = ({children, onClick, successMessage, value, ...p}) => {
    const {copy} = v(),
      i = (0, React.useRef)(null),
      [m, u] = (0, React.useState)(false),
      x = async C => {
        let a = true;
        if (value) {
          const c = typeof value == 'function' ? await value() : value;
          if (!c) return;
          a = await copy(c);
        }
        (onClick?.(C),
          a &&
            (a && successMessage && _.success(successMessage),
            u(true),
            i.current && window.clearTimeout(i.current),
            (i.current = window.setTimeout(() => {
              (u(false), (i.current = null));
            }, 2e3))));
      };
    return (0, e.jsx)(CopyContext, {
      value: {isCopied: m, value: typeof value == 'function' ? void 0 : value},
      children: (0, e.jsx)(B, {...p, onClick: x, children}),
    });
  },
  T = ({className, icon}) => {
    const {isCopied} = useCopyContext();
    return (0, e.jsx)('span', {
      className: 'relative flex size-4 items-center justify-center',
      'data-icon': 'inline-start',
      children: (0, e.jsx)(g, {
        initial: false,
        children: (0, e.jsx)(
          b.span,
          {
            className: y('text-muted-foreground absolute inset-0 flex items-center justify-center', className),
            initial: {opacity: 0, filter: 'blur(2px)'},
            animate: {opacity: 1, filter: 'blur(0px)'},
            exit: {opacity: 0, filter: 'blur(2px)'},
            transition: {duration: 0.1},
            children: isCopied ? (0, e.jsx)(CheckIcon, {className: 'text-green-500'}) : (icon ?? (0, e.jsx)(j, {})),
          },
          isCopied ? 'copied' : 'copy',
        ),
      }),
    });
  }
