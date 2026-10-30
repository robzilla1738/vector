/* Aux-owned source: the New Tab Ask panel (assets/ask-omnibox-panel-DkxXbN8c.js, after its imports;
 * me exported as AskOmniboxPanel). The New Tab composer in Ask mode: its draft kept by the New Tab
 * editor, a submit started from the omnibox handed to the composer, files dropped on the omnibox
 * attached, a new session opened in the tasks page, and the toolbar (permissions, Project, model,
 * research, send). It slides open in Ask mode and shuts in Search mode; without a connected profile
 * it shows the unavailable controls.
 * Names the rest of the chunk uses keep their chunk names: me AskOmniboxPanel.
 * Chunk names used: A the New Tab context, b the New Tab editor, z/$/q the session, form and attachment
 * hooks, F/W/I/T/O/N/V/C/y/R/D/_/B/M/P the composer parts, AuxResearchControl and
 * AuxUnavailableNewTabControls, G page href, L has text, U the draft scope, Y a snapshot from text,
 * S/H data providers, K motion. */
var React = k(w(), 1),
  jsxRuntime = E() /** The Ask composer for a connected profile; a created session opens in the tasks page. */,
  AskComposer = u => {
    const {accountId, browserMode} = A(),
      n = (0, React.useCallback)(
        a => {
          accountId !== null &&
            window.location.replace(
              G(a ? `/u/${accountId}/tasks/${encodeURIComponent(a)}/` : `/u/${accountId}/tasks/new`),
            );
        },
        [accountId],
      );
    return accountId === null
      ? (0, jsxRuntime.jsx)(AuxUnavailableNewTabControls, {})
      : (0, jsxRuntime.jsx)(F, {
          onSessionChange: n,
          children: (0, jsxRuntime.jsx)(AskSessionComposer, {
            ...u,
            forcedMode: browserMode === 'incognito' ? 'incognito' : null,
            onSessionChange: n,
          }),
        });
  },
  AskSessionComposer = ({
    forcedMode,
    hasSubmitPending,
    onInputChange,
    onAttachFilesReady,
    pendingSubmitInput,
    pendingSubmitSnapshot,
    onPendingSubmitHandled,
    onSearchMode,
    onSubmitInFlightChange,
    onSubmitStart,
    onSubmitReady,
    onSessionChange,
  }) =>
    (0, jsxRuntime.jsx)(W, {
      source: 'new-tab',
      onSessionChange,
      forcedMode,
      children: (0, jsxRuntime.jsx)(AskInput, {
        hasSubmitPending,
        onInputChange,
        onAttachFilesReady,
        onPendingSubmitHandled,
        onSearchMode,
        onSubmitInFlightChange,
        onSubmitStart,
        onSubmitReady,
        pendingSubmitInput,
        pendingSubmitSnapshot,
      }),
    }) /** The composer input, its draft kept by the New Tab editor while the session is created. */,
  AskInput = ({
    hasSubmitPending,
    onInputChange,
    onAttachFilesReady,
    onPendingSubmitHandled,
    onSearchMode,
    onSubmitInFlightChange,
    onSubmitStart,
    onSubmitReady,
    pendingSubmitInput,
    pendingSubmitSnapshot,
  }) => {
    const m = z(),
      t = (0, React.useRef)(false),
      o = b(),
      p = (0, React.useMemo)(
        () => ({
          defaultDraftRecord: o.draftWriter.getDraft(),
          onDraftRecordChange: (d, j) => (o.mode === 'ask' || j ? o.draftWriter.write(d, j) : void 0),
        }),
        [o],
      );
    return (
      (0, React.useLayoutEffect)(
        () => (
          (o.draftPersistenceManaged = true),
          () => {
            (o.draftWriter.flush(), (o.draftPersistenceManaged = false));
          }
        ),
        [o],
      ),
      (0, React.useEffect)(() => {
        if (m.isCreatingSession ?? false) {
          ((t.current = true), onSubmitInFlightChange(true));
          return;
        }
        t.current && ((t.current = false), onSubmitInFlightChange(false));
      }, [m.isCreatingSession, onSubmitInFlightChange]),
      (0, jsxRuntime.jsx)(I, {
        autoFocus: false,
        draftScopeKey: U,
        draftPersistence: p,
        sendMessage: m.sendMessage,
        children: (0, jsxRuntime.jsxs)(T, {
          children: [
            (0, jsxRuntime.jsx)(AskEditor, {
              pendingSubmitInput,
              pendingSubmitSnapshot,
              onInputChange,
              onAttachFilesReady,
              onPendingSubmitHandled,
              hasSubmitPending,
              onSubmitStart,
              onSubmitReady,
              onSearchMode,
            }),
            (0, jsxRuntime.jsx)(P, {className: 'mx-4 w-auto'}),
            (0, jsxRuntime.jsx)(AskToolbar, {}),
          ],
        }),
      })
    );
  } /** The New Tab editor as the composer’s editor; a submit started in the omnibox is sent once ready. */,
  AskEditor = ({
    hasSubmitPending,
    pendingSubmitInput,
    pendingSubmitSnapshot,
    onAttachFilesReady,
    onPendingSubmitHandled,
    onSubmitStart,
    onSubmitReady,
  }) => {
    const {omniboxMode} = A(),
      {disabled} = $(),
      {handleFiles, submitForm} = q(),
      t = b(),
      o = (0, React.useRef)(null),
      p = (0, React.useCallback)(
        (d, j) => {
          if (!t || (!L(d) && !j?.attachments.length) || (!hasSubmitPending() && !onSubmitStart())) return;
          const g = t.getSnapshot(),
            v = t.takePendingAsk();
          submitForm({snapshot: j ?? v ?? (g.plainText === d ? g : Y(d))});
        },
        [t, hasSubmitPending, onSubmitStart, submitForm],
      );
    return (
      (0, React.useEffect)(
        () => (onAttachFilesReady(handleFiles), () => onAttachFilesReady(null)),
        [handleFiles, onAttachFilesReady],
      ),
      (0, React.useEffect)(
        () => (onSubmitReady(disabled || !t ? null : p), () => onSubmitReady(null)),
        [t, disabled, onSubmitReady, p],
      ),
      (0, React.useEffect)(() => {
        if (pendingSubmitInput === null) {
          o.current = null;
          return;
        }
        const d = pendingSubmitSnapshot ?? pendingSubmitInput;
        disabled ||
          !t ||
          o.current === d ||
          ((o.current = d), p(pendingSubmitInput, pendingSubmitSnapshot ?? void 0), onPendingSubmitHandled());
      }, [t, disabled, onPendingSubmitHandled, pendingSubmitInput, pendingSubmitSnapshot, p]),
      t
        ? (0, jsxRuntime.jsx)(O, {
            disableDrop: true,
            externalEditor: t,
            externalEditorActive: omniboxMode === 'ask',
            onSubmitStart,
          })
        : null
    );
  } /** The Ask toolbar: permissions, Project, model, research and send. */,
  AskToolbar = () =>
    (0, jsxRuntime.jsx)('div', {
      className: 'mx-auto min-h-12 w-full max-w-200 px-4',
      children: (0, jsxRuntime.jsxs)('div', {
        className: 'py-1',
        children: [
          (0, jsxRuntime.jsx)(N, {}),
          (0, jsxRuntime.jsxs)(V, {
            className: 'py-1',
            children: [
              (0, jsxRuntime.jsxs)(C, {
                children: [
                  (0, jsxRuntime.jsx)(y, {className: 'bg-transparent'}),
                  (0, jsxRuntime.jsx)(R, {size: 'sm'}),
                  (0, jsxRuntime.jsx)(D, {}),
                  (0, jsxRuntime.jsx)(AuxResearchControl, {}),
                ],
              }),
              (0, jsxRuntime.jsxs)(C, {
                children: [(0, jsxRuntime.jsx)(_, {children: (0, jsxRuntime.jsx)(B, {})}), (0, jsxRuntime.jsx)(M, {})],
              }),
            ],
          }),
        ],
      }),
    }) /** AskOmniboxPanel: slides open in Ask mode, shut in Search mode. */,
  me = u => {
    const [s, r] = (0, React.useState)(true),
      {accountId, browserMode, omniboxMode} = A(),
      l = omniboxMode === 'ask';
    return (0, jsxRuntime.jsx)(H, {
      children: (0, jsxRuntime.jsx)(S, {
        value: {accountId, browserProfile: null, mode: browserMode},
        children: (0, jsxRuntime.jsx)(K.div, {
          'data-omnibox-ask-panel': true,
          className: s || !l ? 'overflow-hidden' : void 0,
          inert: !l,
          initial: {opacity: 0, filter: 'blur(2px)', height: 0},
          animate: l ? {opacity: 1, filter: 'blur(0px)', height: 'auto'} : {opacity: 0, filter: 'blur(2px)', height: 0},
          onAnimationStart: () => r(true),
          onAnimationComplete: () => r(false),
          children: (0, jsxRuntime.jsx)(AskComposer, {...u}),
        }),
      }),
    });
  };
