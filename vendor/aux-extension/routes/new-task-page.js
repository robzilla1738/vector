/* Aux-owned source: the new task page (assets/new-DS2pRmiw.js, the module body): the composer with its draft
 * kept per account and Project, flushed on leaving the page, and the Project in the URL. A new session
 * opens at its own URL.
 * Names the rest of the chunk uses keep their chunk names: F the page (exported).
 * Chunk names used: u/d React, m JSX runtime, _/N/P the persisted draft, c the route, D/R/k/h/S/C/v/w/x/I/l/j/g/f/A the
 * session provider and composer parts. */
var React = u(d(), 1),
  jsxRuntime = m(),
  /** The composer and its persisted draft. */
  NewTaskComposer = ({projectId, onProjectIdChange, onSessionChange}) => {
    const [draftPersistence] = (0, React.useState)(() => {
      const draft = _(N(), record => P(void 0, record));
      return {defaultDraftRecord: draft.getDraft(), onDraftRecordChange: draft.write, flush: draft.flush};
    });
    return (
      (0, React.useEffect)(
        () => (
          window.addEventListener('pagehide', draftPersistence.flush),
          () => {
            (window.removeEventListener('pagehide', draftPersistence.flush), draftPersistence.flush());
          }
        ),
        [draftPersistence],
      ),
      (0, jsxRuntime.jsx)(D, {
        projectId,
        onSessionChange,
        children: (0, jsxRuntime.jsxs)('div', {
          className: 'flex size-full flex-col',
          'data-chat-drop-zone': '',
          children: [
            (0, jsxRuntime.jsx)(R, {}),
            (0, jsxRuntime.jsxs)('div', {
              className: 'flex min-h-0 grow flex-col **:data-[agent-session-ui="chat"]:max-w-4xl',
              children: [
                (0, jsxRuntime.jsx)(k, {}),
                (0, jsxRuntime.jsx)(h, {}),
                (0, jsxRuntime.jsx)(S, {
                  source: 'tasks-page',
                  defaultDraftState: {draftProjectId: projectId},
                  defaultDraftStateKey: projectId ? `project:${projectId}` : 'account',
                  onProjectIdChange,
                  onSessionChange,
                  children: (0, jsxRuntime.jsxs)(C, {
                    className: 'px-4 lg:px-8',
                    draftPersistence,
                    children: [
                      (0, jsxRuntime.jsx)(v, {}),
                      (0, jsxRuntime.jsx)(w, {children: (0, jsxRuntime.jsx)(x, {})}),
                      (0, jsxRuntime.jsxs)(I, {
                        children: [
                          (0, jsxRuntime.jsxs)(l, {children: [(0, jsxRuntime.jsx)(j, {}), (0, jsxRuntime.jsx)(g, {})]}),
                          (0, jsxRuntime.jsxs)(l, {
                            children: [
                              (0, jsxRuntime.jsx)(f, {children: (0, jsxRuntime.jsx)(A, {})}),
                              (0, jsxRuntime.jsx)(p, {}),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      })
    );
  };
/** The new task page. */
function F() {
  const {userId} = c.useParams(),
    {projectId} = c.useSearch(),
    navigate = c.useNavigate(),
    openSession = (0, React.useCallback)(
      value => {
        if (value) {
          navigate({to: '/u/$userId/tasks/$sessionId', params: {userId, sessionId: value}, replace: true});
          return;
        }
        navigate({to: '/u/$userId/tasks/new', params: {userId}, search: {projectId}, replace: true});
      },
      [navigate, projectId, userId],
    ),
    setProject = (0, React.useCallback)(
      value => {
        navigate({to: '/u/$userId/tasks/new', params: {userId}, search: {projectId: value ?? void 0}, replace: true});
      },
      [navigate, userId],
    );
  return (0, jsxRuntime.jsx)(NewTaskComposer, {
    projectId: projectId ?? null,
    onProjectIdChange: setProject,
    onSessionChange: openSession,
  });
}
