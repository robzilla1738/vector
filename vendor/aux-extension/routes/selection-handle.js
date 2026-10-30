/* Aux-owned source: the handle beside a text selection (assets/selection-handle-Df1vMUiF.js, the module body).
 * It sits over any site, so it keeps its fixed blue and white mark.
 * Names the rest of the chunk uses keep their chunk names: D the handle (exported).
 * Chunk names used: m/d React, f JSX runtime, l cn, v/g the frame link and route, b sparkle, x motion,
 * h/_/E messages in, messages out and the message context. */
var React = m(d()),
  jsxRuntime = f();
/** The handle's page; each placement it takes is confirmed to the page. */
function D() {
  const search = g.useSearch(),
    [placement, setPlacement] = (0, React.useState)(search.handlePlacement),
    [requestKey, setRequestKey] = (0, React.useState)(null),
    {ref, sendMessage} = v(search.frameId, 'SELECTION_HANDLE_READY');
  return (
    h(message => {
      const sync = message;
      sync?.type === 'SELECTION_HANDLE_SYNC' && (setPlacement(sync.handlePlacement), setRequestKey(sync.requestKey));
    }),
    (0, React.useLayoutEffect)(() => {
      sendMessage({type: 'SELECTION_HANDLE_SYNCED', requestKey, handlePlacement: placement});
    }, [placement, requestKey, sendMessage]),
    (0, jsxRuntime.jsx)(E, {
      value: sendMessage,
      children: (0, jsxRuntime.jsx)('div', {
        ref,
        className: 'w-fit overflow-visible',
        children: (0, jsxRuntime.jsx)(SelectionHandle, {handlePlacement: placement}),
      }),
    })
  );
}
/** The button. */
function SelectionHandle({handlePlacement}) {
  const sendMessage = _(),
    isTopLeft = handlePlacement === 'top-left';
  return (0, jsxRuntime.jsx)('div', {
    'data-testid': 'selection-handle-root',
    className: 'p-1',
    children: (0, jsxRuntime.jsx)('button', {
      'aria-label': 'Open selection tools',
      className:
        'group pointer-events-auto flex size-8 cursor-pointer items-center justify-center border-none bg-transparent',
      type: 'button',
      onPointerDown: event => {
        (event.preventDefault(),
          event.stopPropagation(),
          event.button === 0 && sendMessage({type: 'SELECTION_HANDLE_CLICK'}));
      },
      onMouseDown: event => {
        (event.preventDefault(), event.stopPropagation());
      },
      children: (0, jsxRuntime.jsx)('div', {
        className: 'relative size-8',
        children: (0, jsxRuntime.jsx)(x.div, {
          'data-testid': 'selection-handle-bubble',
          className: l(
            'border-shape-initial! absolute -m-1 flex size-3 items-center justify-center rounded-xl bg-sky-500/80 backdrop-blur-xs transition-all duration-150',
            'group-hover:size-6 group-focus-visible:size-6',
            'group-hover:m-0 group-focus-visible:m-0',
            isTopLeft
              ? 'right-1.5 bottom-1.5 group-hover:rounded-br-sm group-focus-visible:rounded-br-sm [&_svg]:mt-px [&_svg]:ml-px'
              : 'top-1.5 left-1.5 group-hover:rounded-tl-sm group-focus-visible:rounded-tl-sm [&_svg]:-mt-px [&_svg]:-mr-px',
            'corner-shape-initial!',
          ),
          initial: {scale: 0.95, opacity: 0},
          animate: {scale: 1, opacity: 1},
          transition: {duration: 0.12},
          children: (0, jsxRuntime.jsx)(b, {
            className: l(
              'size-3.5 text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
              isTopLeft ? '-mt-px -ml-px' : '-mr-px -mb-px',
            ),
          }),
        }),
      }),
    }),
  });
}
