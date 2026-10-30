/* Aux-owned source: the Agent panel route (assets/sidepanel-CI-CbXmY.js, exported as component).
 * With a session open the panel shows its header, the conversation and the composer; without one
 * it shows the new-session composer, scoped to the active tab so each tab keeps its own draft.
 *
 * Imports used here: browser-color-scheme F interop, E React, q JSX runtime; strip-markdown j useApp;
 * session-composer h Conversation, v Composer, B NewSessionProvider, H ModeProvider, m ModeSlot,
 * b ComposerBody, w ComposerFooter, p FooterGroup, f Input, D AttachButton, C, A, S, I, g the
 * footer controls, G new-session placeholder, U useRunCommand; permission-approval V ask-user,
 * O action confirmation, y approval; provider M hasMessages, L composer extensions; -components
 * R panel header, W usePanelSession, N tabScopeKey, Q rememberSessionTab; context T useSession;
 * draft-storage _ readDraft, k writeDraft, z readDraftState, J writeDraftState; X useTabContext;
 * Y back-to-parent button; P DocumentTitle.
 * Aux change: the panel's horizontal geometry mirrors the sidebar's (see ComposerClasses). */
var React = F(E(), 1),
  jsxRuntime = q(),
  // Arc-style, mirroring the sidebar: the composer card fills the panel's width (it sits on the
  // window's 6px gutter, like a sidebar row) and its footer controls sit 8px in; the conversation
  // text sits 8px in too, in line with the composer's text, like the sidebar's labels.
  ComposerClasses = 'px-0 pb-1 *:data-model-select-shortcuts:px-2',
  ConversationClasses = '**:data-[agent-session-ui="chat"]:px-2 [&_.streamdown_pre]:wrap-anywhere [&_.streamdown_pre]:whitespace-pre-wrap',
  // An open session: header with a back button to its parent, the conversation, then the composer
  // and whichever input mode the run asks for (a question, a confirmation, an approval).
  SessionView = ({sessionId}) => {
    const hasMessages = M();
    const {currentSession, updateMode} = T();
    const {mode} = j();
    const runCommand = U({sessionId});
    // Incognito can be switched only before the first message.
    const canSwitchMode = !hasMessages && mode !== 'incognito';
    const draftPersistence = (0, React.useMemo)(() => ({
      defaultDraftRecord: _(sessionId),
      onDraftRecordChange: record => k(sessionId, record ?? null),
    }), [sessionId]);
    return (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(SessionTitle, {}),
        (0, jsxRuntime.jsx)(R, {leading: (0, jsxRuntime.jsx)(Y, {className: 'no-drag rounded-full'})}),
        (0, jsxRuntime.jsx)(h, {className: ConversationClasses, isSidepanel: true}),
        (0, jsxRuntime.jsx)(H, {
          mode: {
            value: canSwitchMode ? currentSession.incognito ? 'incognito' : 'default' : void 0,
            onChange: canSwitchMode ? updateMode : void 0,
          },
          children: (0, jsxRuntime.jsxs)(v, {
            className: ComposerClasses,
            sessionId,
            isSidepanel: true,
            runCommand,
            draftPersistence,
            children: [
              (0, jsxRuntime.jsx)(m, {mode: 'ask-user-question', children: (0, jsxRuntime.jsx)(V, {})}),
              (0, jsxRuntime.jsx)(m, {mode: 'action-confirmation', children: (0, jsxRuntime.jsx)(O, {})}),
              (0, jsxRuntime.jsxs)(b, {
                children: [
                  (0, jsxRuntime.jsx)(m, {mode: 'default', children: (0, jsxRuntime.jsx)(SessionInput, {})}),
                  (0, jsxRuntime.jsx)(m, {mode: 'approval', children: (0, jsxRuntime.jsx)(y, {})}),
                ],
              }),
              ComposerFooter(),
            ],
          }),
        }),
      ],
    });
  },
  // Attach and model on the left; context and run controls on the right.
  ComposerFooter = () => (0, jsxRuntime.jsxs)(w, {
    children: [
      (0, jsxRuntime.jsxs)(p, {children: [(0, jsxRuntime.jsx)(C, {}), (0, jsxRuntime.jsx)(A, {})]}),
      (0, jsxRuntime.jsxs)(p, {children: [(0, jsxRuntime.jsx)(S, {children: (0, jsxRuntime.jsx)(I, {})}), (0, jsxRuntime.jsx)(g, {})]}),
    ],
  }),
  SessionTitle = () => {
    const {currentSession} = T();
    return (0, jsxRuntime.jsx)(P, {title: [currentSession.title || 'Tasks']});
  },
  SessionInput = () => {
    const hasMessages = M();
    const extensions = L();
    return (0, jsxRuntime.jsx)(f, {extensions, leadingAction: (0, jsxRuntime.jsx)(D, {}), placeholder: hasMessages ? 'Reply, @ for context' : void 0});
  };

/** The Agent panel. */
function je() {
  const {currentSessionId, onSessionChange} = W();
  return currentSessionId
    ? (0, jsxRuntime.jsx)(SessionView, {sessionId: currentSessionId})
    : (0, jsxRuntime.jsxs)(jsxRuntime.Fragment, {
      children: [
        (0, jsxRuntime.jsx)(P, {title: 'New Session'}),
        (0, jsxRuntime.jsx)(R, {}),
        (0, jsxRuntime.jsx)(h, {}),
        (0, jsxRuntime.jsx)(NewSession, {onSessionChange}),
      ],
    });
}

// A new session remembers the tab it was started from, so the panel can return to it there.
var NewSession = ({onSessionChange}) => {
    const {accountId, mode} = j();
    const tabContext = X();
    const startedFromTab = (0, React.useRef)(null);
    const draftScopeKey = N(tabContext);
    const getCreateSessionInput = (0, React.useCallback)(messages => {
      const tabTargetId = (Array.isArray(messages) ? messages : [messages])
        .find(message => message.role === 'user-message-metadata')?.attachments.find(attachment => attachment.type === 'tab')?.targetId;
      return startedFromTab.current = tabTargetId ?? null, tabTargetId ? {activeTabTargetId: tabTargetId} : {};
    }, []);
    const handleSessionChange = (0, React.useCallback)(sessionId => {
      const tabTargetId = startedFromTab.current;
      sessionId && tabTargetId && Q(accountId, tabTargetId, sessionId), onSessionChange(sessionId);
    }, [accountId, onSessionChange]);
    return (0, jsxRuntime.jsx)(NewSessionComposer, {
      draftScopeKey,
      forcedMode: mode === 'incognito' ? 'incognito' : null,
      getCreateSessionInput,
      onSessionChange: handleSessionChange,
    });
  },
  // Drafts are kept per tab scope; the untabbed scope's draft survives moving into a tab.
  NewSessionComposer = ({draftScopeKey, forcedMode, getCreateSessionInput, onSessionChange}) => {
    const draftPersistence = (0, React.useMemo)(() => ({
      scopeKey: draftScopeKey,
      defaultDraftRecord: _(void 0, draftScopeKey),
      onDraftRecordChange: record => k(void 0, record ?? null, draftScopeKey),
      preserveCurrentDraftOnScopeChange: scope => scope === N(null),
    }), [draftScopeKey]);
    const defaultDraftState = (0, React.useMemo)(() => z(draftScopeKey), [draftScopeKey]);
    const onDraftStateChange = (0, React.useCallback)(state => {
      J(draftScopeKey, state);
    }, [draftScopeKey]);
    return (0, jsxRuntime.jsx)(B, {
      source: 'sidepanel',
      onSessionChange,
      forcedMode,
      defaultDraftState,
      defaultDraftStateKey: draftScopeKey,
      onDraftStateChange,
      getCreateSessionInput,
      children: (0, jsxRuntime.jsxs)(v, {
        className: ComposerClasses,
        isSidepanel: true,
        draftPersistence,
        children: [
          (0, jsxRuntime.jsx)(G, {}),
          ' ',
          (0, jsxRuntime.jsx)(b, {children: (0, jsxRuntime.jsx)(f, {leadingAction: (0, jsxRuntime.jsx)(D, {})})}),
          ComposerFooter(),
        ],
      }),
    });
  };
