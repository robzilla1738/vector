/* Aux-owned source, the capture toolbar (assets/capture-toolbar-HNeL44hk.js, the module body,
 * exported as component): the floating toolbar a page capture shows, framed in the page. It picks
 * what to capture (the screen, the full page or a selection), captures, closes, and can be dragged;
 * the page it floats over tells it the mode and status.
 * Names the rest of the chunk uses keep their chunk names: pe the route component; t JSX runtime and
 * c React stay as named.
 * Chunk names used: T/b/E React and JSX runtime, _ the capture toolbar route, v useFramedMessaging,
 * j Spinner, S browser tabs icon, A camera, O circle-x, h Button, H TooltipProvider, Z SimpleTooltip,
 * U motion, M/p/w/I/C/u schema builders, B onMessage, m useSendMessage, D the send-message provider. */
var t = E(),
  /** The full page icon. */
  FullPageIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, t.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, t.jsx)('path', {
        d: 'M16 2C18.2092 2 20 3.79088 20 6V18C20 20.2092 18.2092 22 16 22H8C5.79088 22 4 20.2092 4 18V6C4 3.79087 5.79087 2 8 2H16ZM8 4C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89542 20 8 20H16C17.1046 20 18 19.1046 18 18V6C18 4.89542 17.1046 4 16 4H8ZM11 14C11.5523 14 12 14.4477 12 15C12 15.5523 11.5523 16 11 16H9C8.44772 16 8 15.5523 8 15C8 14.4477 8.44772 14 9 14H11ZM15 10C15.5523 10 16 10.4477 16 11C16 11.5523 15.5523 12 15 12H9C8.44772 12 8 11.5523 8 11C8 10.4477 8.44772 10 9 10H15ZM15 6C15.5523 6 16 6.44772 16 7C16 7.55228 15.5523 8 15 8H9C8.44772 8 8 7.55228 8 7C8 6.44772 8.44772 6 9 6H15Z',
        fill: 'currentColor',
      }),
    }),
  /** The selection icon. */
  SelectionIcon = ({size = 24, ariaHidden = true, ...props}) =>
    (0, t.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...props,
      children: (0, t.jsx)('path', {
        d: 'M3 17.5C3 16.9477 3.44772 16.5 4 16.5C4.55228 16.5 5 16.9477 5 17.5C5 18.3284 5.67158 19 6.5 19C7.05228 19 7.5 19.4477 7.5 20C7.5 20.5523 7.05228 21 6.5 21C4.567 21 3 19.433 3 17.5ZM13.5 19C14.0523 19 14.5 19.4477 14.5 20C14.5 20.5523 14.0523 21 13.5 21H10.5C9.94772 21 9.5 20.5523 9.5 20C9.5 19.4477 9.94772 19 10.5 19H13.5ZM19 17.5C19 16.9477 19.4477 16.5 20 16.5C20.5523 16.5 21 16.9477 21 17.5C21 19.433 19.433 21 17.5 21C16.9477 21 16.5 20.5523 16.5 20C16.5 19.4477 16.9477 19 17.5 19C18.3284 19 19 18.3284 19 17.5ZM3 13.5V10.5C3 9.94772 3.44772 9.5 4 9.5C4.55228 9.5 5 9.94772 5 10.5V13.5C5 14.0523 4.55228 14.5 4 14.5C3.44772 14.5 3 14.0523 3 13.5ZM19 13.5V10.5C19 9.94772 19.4477 9.5 20 9.5C20.5523 9.5 21 9.94772 21 10.5V13.5C21 14.0523 20.5523 14.5 20 14.5C19.4477 14.5 19 14.0523 19 13.5ZM3 6.5C3 4.56701 4.56701 3 6.5 3C7.05228 3 7.5 3.44772 7.5 4C7.5 4.55228 7.05228 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.05228 4.55228 7.5 4 7.5C3.44772 7.5 3 7.05228 3 6.5ZM19 6.5C19 5.67158 18.3284 5 17.5 5C16.9477 5 16.5 4.55228 16.5 4C16.5 3.44772 16.9477 3 17.5 3C19.433 3 21 4.567 21 6.5C21 7.05228 20.5523 7.5 20 7.5C19.4477 7.5 19 7.05228 19 6.5ZM13.5 3C14.0523 3 14.5 3.44772 14.5 4C14.5 4.55228 14.0523 5 13.5 5H10.5C9.94772 5 9.5 4.55228 9.5 4C9.5 3.44772 9.94772 3 10.5 3H13.5Z',
        fill: 'currentColor',
      }),
    }),
  c = T(b()),
  /** The toolbar opens on the visible screen. */
  DEFAULT_MODE = 'viewport',
  /** What a capture takes. */
  CaptureMode = I(['viewport', 'full', 'area']),
  /** A selection, in page pixels. */
  CaptureRect = p({
    x: u(),
    y: u(),
    width: u().positive(),
    height: u().positive(),
  }),
  /** A capture's outcome: a PNG data URL or an error. */
  CaptureResult = w('ok', [p({ok: C(true), dataUrl: M().startsWith('data:image/png')}), p({ok: C(false), error: M()})]),
  /** What the toolbar asks the page for. */
  CaptureRequest = w('type', [
    p({type: C('capture:open')}),
    p({type: C('capture:capture'), mode: CaptureMode, rect: CaptureRect.optional(), viewportWidth: u()}),
  ]);
/** The route: the toolbar framed in the page, closing on Escape. */
function pe() {
  const search = _.useSearch(),
    {ref, sendMessage} = v(search.frameId, 'CAPTURE_TOOLBAR_READY');
  return (
    (0, c.useEffect)(() => {
      const onKeyDown = event => {
        event.key === 'Escape' && sendMessage({type: 'CAPTURE_TOOLBAR_ESCAPE'});
      };
      return (window.addEventListener('keydown', onKeyDown), () => window.removeEventListener('keydown', onKeyDown));
    }, [sendMessage]),
    (0, t.jsx)(D, {
      value: sendMessage,
      children: (0, t.jsx)(H, {
        delay: 500,
        children: (0, t.jsx)('div', {
          className: 'w-fit px-8 pt-6 pb-16',
          ref,
          children: (0, t.jsx)(CaptureToolbar, {}),
        }),
      }),
    })
  );
}
/** A press turns into a drag after 4px. */
var DRAG_THRESHOLD_PX = 4,
  /** The toolbar: close, the modes and Capture; dragging it moves its frame. */
  CaptureToolbar = () => {
    const [state, setState] = (0, c.useState)({mode: DEFAULT_MODE, status: 'idle'}),
      dragStartRef = (0, c.useRef)(null),
      lastPointRef = (0, c.useRef)(null),
      draggingRef = (0, c.useRef)(false),
      sendMessage = m(),
      onSync = (0, c.useCallback)(message => {
        if (!isSyncMessage(message)) return;
        const {type, ...sync} = message;
        setState(sync);
      }, []);
    return (
      B(onSync),
      (0, t.jsxs)(U.div, {
        className:
          'bg-glass border-glass flex w-fit cursor-grab touch-none items-center justify-center overflow-hidden rounded-full border px-2 py-1 shadow-2xl select-none active:cursor-grabbing',
        initial: {opacity: 0, y: -10, scale: 0.8, filter: 'blur(8px)'},
        animate: {opacity: 1, y: 0, scale: 1, filter: 'blur(0px)'},
        transition: {duration: 0.15},
        onPointerCancel: onPointerEnd,
        onPointerDown,
        onPointerMove,
        onPointerUp: onPointerEnd,
        children: [
          (0, t.jsx)(CloseButton, {}),
          (0, t.jsx)(ModeButtons, {disabled: state.status === 'capturing', mode: state.mode}),
          (0, t.jsx)(CaptureButton, {
            errorMessage: state.status === 'error' ? state.errorMessage : void 0,
            status: state.status,
          }),
        ],
      })
    );
    function onPointerDown(event) {
      ((dragStartRef.current = {x: event.screenX, y: event.screenY}),
        (lastPointRef.current = {x: event.screenX, y: event.screenY}),
        (draggingRef.current = false),
        (!(event.target instanceof Element) || event.target.closest('button') === null) &&
          event.currentTarget.setPointerCapture(event.pointerId));
    }
    function onPointerMove(event) {
      const start = dragStartRef.current,
        last = lastPointRef.current;
      if (!start || !last) return;
      if (!draggingRef.current) {
        if (Math.hypot(event.screenX - start.x, event.screenY - start.y) < DRAG_THRESHOLD_PX) return;
        ((draggingRef.current = true), event.currentTarget.setPointerCapture(event.pointerId));
      }
      const dx = event.screenX - last.x,
        dy = event.screenY - last.y;
      (dx === 0 && dy === 0) ||
        (event.preventDefault(),
        (lastPointRef.current = {x: event.screenX, y: event.screenY}),
        sendMessage({type: 'CAPTURE_TOOLBAR_MOVE', dx, dy}));
    }
    function onPointerEnd(event) {
      (event.currentTarget.hasPointerCapture(event.pointerId) &&
        event.currentTarget.releasePointerCapture(event.pointerId),
        (dragStartRef.current = null),
        (lastPointRef.current = null),
        (draggingRef.current = false));
    }
  },
  /** The capture modes. */
  MODES = [
    {mode: 'viewport', label: 'Screen', Icon: S},
    {mode: 'full', label: 'Full page', Icon: FullPageIcon},
    {mode: 'area', label: 'Selection', Icon: SelectionIcon},
  ],
  /** The mode buttons. */
  ModeButtons = ({disabled, mode}) => {
    const sendMessage = m(),
      selectMode = nextMode => () => {
        sendMessage({type: 'CAPTURE_TOOLBAR_SET_MODE', mode: nextMode});
      };
    return (0, t.jsx)('div', {
      className: 'mr-1 flex items-center',
      children: MODES.map(({mode: itemMode, label, Icon}) =>
        (0, t.jsxs)(
          h,
          {
            'aria-label': label,
            'aria-pressed': mode === itemMode,
            className: 'aria-pressed:bg-muted h-11 w-18 flex-col gap-0',
            disabled,
            variant: 'ghost',
            onClick: selectMode(itemMode),
            children: [
              (0, t.jsx)(Icon, {className: 'size-5!'}),
              (0, t.jsx)('span', {className: 'text-xs', children: label}),
            ],
          },
          itemMode,
        ),
      ),
    });
  },
  /** Capture, with the last error as its tooltip. */
  CaptureButton = ({errorMessage, status}) => {
    const sendMessage = m(),
      error = errorMessage !== void 0 && errorMessage.length > 0 ? errorMessage : void 0,
      capture = () => {
        sendMessage({type: 'CAPTURE_TOOLBAR_CAPTURE'});
      },
      button = (0, t.jsxs)(h, {
        disabled: status === 'capturing',
        shape: 'pill',
        title: error,
        onClick: capture,
        children: [
          status === 'capturing' ? (0, t.jsx)(j, {className: 'size-4'}) : (0, t.jsx)(A, {className: 'size-4'}),
          'Capture',
        ],
      });
    return error ? (0, t.jsx)(Z, {content: error, side: 'bottom', children: button}) : button;
  },
  /** Closes the toolbar. */
  CloseButton = () => {
    const sendMessage = m(),
      close = () => {
        sendMessage({type: 'CAPTURE_TOOLBAR_CLOSE'});
      };
    return (0, t.jsx)(h, {
      'aria-label': 'Close capture toolbar',
      className: 'text-muted-foreground/60 mr-0.5 -ml-0.5',
      shape: 'pill',
      size: 'icon-sm',
      type: 'button',
      variant: 'ghost',
      onClick: close,
      children: (0, t.jsx)(O, {className: 'size-4'}),
    });
  };
/** Whether a message is the page's state sync. */
function isSyncMessage(message) {
  return typeof message != 'object' || message === null || !('type' in message)
    ? false
    : message.type === 'CAPTURE_TOOLBAR_SYNC';
}
