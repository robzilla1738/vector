/* Aux-owned source: the capture anchor shown on a page beside a selection (assets/capture-anchor-CI2S0j85.js,
 * the module body). It sits over any site, so it keeps its fixed blue and white mark.
 * Names the rest of the chunk uses keep their chunk names: w the anchor (exported).
 * Chunk names used: o/c React, m JSX runtime, l cn, u/p the frame link and route, d camera, f tooltip provider,
 * v/x incoming messages and the message context. */
var React = o(c()),
  jsxRuntime = m();
/** The anchor's page. */
function w() {
  const search = p.useSearch(),
    {ref, sendMessage} = u(search.frameId, 'CAPTURE_ANCHOR_READY');
  return (
    (0, React.useEffect)(() => {
      const handleKey = event => {
        event.key === 'Escape' && sendMessage({type: 'CAPTURE_ANCHOR_ESCAPE'});
      };
      return (window.addEventListener('keydown', handleKey), () => window.removeEventListener('keydown', handleKey));
    }, [sendMessage]),
    (0, jsxRuntime.jsx)(x, {
      value: sendMessage,
      children: (0, jsxRuntime.jsx)(f, {
        delay: 500,
        children: (0, jsxRuntime.jsx)('div', {
          className: 'w-fit overflow-visible p-1',
          ref,
          children: (0, jsxRuntime.jsx)(AnchorFrame, {initialPlacement: search.placement}),
        }),
      }),
    })
  );
}
var /** Follows placement updates from the page. */
  AnchorFrame = ({initialPlacement}) => {
    const [placement, setPlacement] = (0, React.useState)(initialPlacement),
      handleMessage = (0, React.useCallback)(message => {
        isSyncMessage(message) && setPlacement(message.placement);
      }, []);
    return (
      v(handleMessage),
      (0, jsxRuntime.jsx)('div', {
        className: 'group flex size-8 items-center justify-center',
        children: (0, jsxRuntime.jsx)(AnchorBubble, {placement}),
      })
    );
  },
  /** The bubble, its pointed corner toward the selection. */
  AnchorBubble = ({placement}) =>
    (0, jsxRuntime.jsx)('div', {
      className: 'relative size-8',
      children: (0, jsxRuntime.jsx)('div', {
        className: l(
          'border-shape-initial! absolute m-0 flex size-6 items-center justify-center rounded-xl bg-sky-500/80 backdrop-blur-xs transition-all duration-150',
          placement === 'top-left'
            ? 'right-1.5 bottom-1.5 rounded-br-sm [&_svg]:mt-px [&_svg]:ml-px'
            : 'top-1.5 left-1.5 rounded-tl-sm [&_svg]:-mt-px [&_svg]:-mr-px',
          'corner-shape-initial!',
        ),
        children: (0, jsxRuntime.jsx)(d, {className: 'size-3.5 text-white'}),
      }),
    });
/** A placement update. */
function isSyncMessage(message) {
  return typeof message != 'object' || message === null || !('type' in message)
    ? false
    : message.type === 'CAPTURE_ANCHOR_SYNC';
}
