/* Aux-owned source, the chat error alert (assets/error-alert-Bu3EEewB.js, the module body): the
 * message row and bubble, and an error in a chat with its provider (actions and the details toggle),
 * card (icon, title, description, tone, details) and actions (retry, reconnect the model provider,
 * add credits, upgrade, report a bug) by the kind of error.
 * Names the rest of the chunk uses keep their chunk names (all exported): G Message, M MessageContent,
 * H ErrorAlertProvider, $ ErrorAlert; t JSX runtime and u React stay as named.
 * Chunk names used: C/j React, o cn, k signs the account out of its provider, p the current account,
 * b the warning icon, w the Aux mark, E/f buttonVariants and Button, A the extension page URL, y the
 * external link, N its click behavior. */
var t = h(),
  /** The aborted-run icon. */
  AbortIcon = ({size = 24, ariaHidden = true, ...props}) =>
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
        d: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 14.5996C12.6627 14.5996 13.2002 15.1371 13.2002 15.7998C13.2001 16.4625 12.6627 17 12 17C11.3373 17 10.7999 16.4625 10.7998 15.7998C10.7998 15.1371 11.3373 14.5996 12 14.5996ZM12 7C12.5523 7 13 7.44772 13 8V12.5C13 13.0523 12.5523 13.5 12 13.5C11.4477 13.5 11 13.0523 11 12.5V8C11 7.44772 11.4477 7 12 7Z',
        fill: 'currentColor',
      }),
    }),
  /** A chat message row, the user's on the right. */
  G = ({className, from, ...props}) =>
    (0, t.jsx)('div', {
      className: o(
        'group flex w-full max-w-[95%] flex-col gap-2',
        from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
        className,
      ),
      ...props,
    }),
  /** A chat message's bubble. */
  M = ({children, className, ...props}) =>
    (0, t.jsx)('div', {
      className: o(
        'is-user:dark flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-sm',
        'group-[.is-user]:bg-secondary group-[.is-user]:text-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-xl group-[.is-user]:px-3 group-[.is-user]:py-1.5',
        'group-[.is-assistant]:text-foreground',
        className,
      ),
      ...props,
      children,
    }),
  u = C(j(), 1),
  /** The error alert an alert's parts read. */
  ErrorAlertContext = (0, u.createContext)(null);
/** The error alert. */
function useErrorAlert() {
  const alert = (0, u.use)(ErrorAlertContext);
  if (!alert) throw new Error('ErrorAlert components must be used within ErrorAlertProvider');
  return alert;
}
/** Provides an error, its actions and whether its details are open. */
function H({actions = {}, children, classified, meta = {}}) {
  const [detailsOpen, setDetailsOpen] = (0, u.useState)(false);
  return (0, t.jsx)(ErrorAlertContext, {
    value: {
      actions,
      meta,
      state: {classified, details: 'details' in classified ? classified.details : void 0, detailsOpen},
      toggleDetails: () => setDetailsOpen(open => !open),
    },
    children,
  });
}
/** An error card: icon, title, description, actions and its details. */
function ErrorAlertCard({children, description, icon, title, tone = 'default', actionsBelow = false}) {
  const {meta, state, toggleDetails} = useErrorAlert(),
    Icon = icon === 'abort' ? AbortIcon : icon === 'brand' ? w : icon ? b : null;
  return (0, t.jsxs)(M, {
    className: o(
      'mb-6 w-full max-w-full min-w-0 rounded-xl border px-3 py-2',
      meta.compact && 'mb-0 rounded-xl px-2.5',
      actionsBelow && 'gap-1',
      tone === 'muted' && 'border-border bg-muted/30',
      tone === 'destructive' && 'border-destructive/20 bg-destructive/5',
      meta.className,
    ),
    'data-testid': 'message-content',
    children: [
      (0, t.jsxs)('div', {
        className: o('flex items-start gap-2 text-sm', meta.compact && 'gap-1.5 text-xs'),
        children: [
          Icon &&
            (0, t.jsx)(Icon, {
              className: o(
                'mt-0.5 size-4 shrink-0',
                meta.compact && 'size-3.5',
                tone === 'destructive' ? 'text-destructive' : 'text-muted-foreground',
                icon === 'abort' && 'text-foreground',
              ),
            }),
          (0, t.jsxs)('div', {
            className: 'min-w-0 flex-1',
            children: [
              (0, t.jsx)('p', {
                className: o('font-medium', tone === 'destructive' ? 'text-destructive' : 'text-foreground'),
                children: title,
              }),
              (0, t.jsx)('p', {className: 'text-muted-foreground wrap-break-word', children: description}),
            ],
          }),
          !meta.compact &&
            !actionsBelow &&
            (state.details || children) &&
            (0, t.jsxs)('div', {
              className: 'flex shrink-0 flex-wrap items-center justify-end gap-1.5 self-center',
              children: [
                state.details &&
                  (0, t.jsx)(f, {
                    variant: 'outline',
                    size: 'sm',
                    'aria-expanded': state.detailsOpen,
                    onClick: toggleDetails,
                    children: 'Details',
                  }),
                children,
              ],
            }),
        ],
      }),
      !meta.compact &&
        actionsBelow &&
        (0, t.jsx)('div', {className: 'flex flex-wrap items-center gap-2 pl-6', children}),
      !meta.compact &&
        state.detailsOpen &&
        state.details &&
        (0, t.jsx)('p', {
          className: 'text-muted-foreground mt-0 pl-6 text-sm wrap-break-word',
          children: state.details,
        }),
    ],
  });
}
/** An action button, when it has a handler. */
function ActionButton({children, onClick, primary = false}) {
  return onClick ? (0, t.jsx)(f, {variant: primary ? 'default' : 'outline', size: 'sm', onClick, children}) : null;
}
/** Retries the turn. */
function RetryButton({children = 'Try again'}) {
  const {actions} = useErrorAlert();
  return (0, t.jsx)(ActionButton, {onClick: actions.retry, children});
}
/** Opens the model settings: to reconnect the provider, or to choose another model. */
function ReconnectButton({children = 'Reconnect'}) {
  const account = p();
  return account
    ? (0, t.jsx)(y, {
        className: o(E({variant: 'outline', size: 'sm'})),
        to: A(`/u/${account.accountId}/settings/model`),
        onClick: event => {
          N(event);
        },
        children,
      })
    : null;
}
/** Reports a bug. */
function ReportButton() {
  const {actions} = useErrorAlert();
  return (0, t.jsx)(ActionButton, {onClick: actions.report, children: 'Report bug'});
}
/** An error in a chat, with the actions its kind allows. */
function $() {
  const {state} = useErrorAlert(),
    error = state.classified,
    accountId = p()?.accountId;
  (0, u.useEffect)(() => {
    error.kind === 'auth' && accountId != null && k(accountId);
  }, [accountId, error.kind]);
  const tone =
      error.kind === 'disk-full' || error.kind === 'generic'
        ? 'destructive'
        : error.kind === 'aborted' || error.kind === 'credits-other'
          ? 'default'
          : 'muted',
    icon =
      error.kind === 'aborted'
        ? 'abort'
        : error.kind === 'credits-other'
          ? void 0
          : 'warning';
  return (0, t.jsxs)(ErrorAlertCard, {
    title: error.title,
    description: error.description,
    icon,
    tone,
    children: [
      error.kind === 'auth' && (0, t.jsx)(ReconnectButton, {}),
      error.kind === 'credits-other' && (0, t.jsx)(ReconnectButton, {children: 'Open Models'}),
      ['aborted', 'auth', 'credits-other', 'generic', 'network', 'offline', 'overloaded', 'provider-server', 'rate-limit'].includes(error.kind) &&
        (0, t.jsx)(RetryButton, {children: error.kind === 'aborted' ? 'Retry' : 'Try again'}),
      error.kind === 'generic' && error.reportable && (0, t.jsx)(ReportButton, {}),
    ],
  });
}
