/* Aux-owned source: the session's feedback dialog (assets/session-feedback-dialog-BjDg0W8m.js, the module
 * body): opened by the feedback event for this session, optionally with a comment; Cancel with text
 * asks first, Escape and outside clicks do nothing, a saved comment shows a toast.
 * Names the rest of the chunk uses keep their chunk names: ae the dialog (exported).
 * Chunk names used: g/v React, S JSX runtime, I/V schema, U the current session, _ useApp, k capture, C useConfirm,
 * w useForm, E its resolver, y useTRPC, F useMutation, D the event listener, A/N the feedback event and schema,
 * O toast, R/K/P/H/q/B/T dialog and form parts, M Textarea, d Button, j Spinner. */
var React = g(v(), 1),
  jsxRuntime = S();
/** The Aux version the feedback is about. */
function auxVersion() {
  const manifest = chrome.runtime.getManifest();
  return manifest.version_name ?? `v${manifest.version}`;
}
var /** The feedback comment. */
  feedbackSchema = I({comment: V().trim().min(1, 'Please fill out this field.').max(4e3)}),
  /** The feedback dialog. */
  ae = () => {
    const {currentSession} = U(),
      {accountId} = _(),
      {capture} = k(),
      {confirm} = C(),
      sessionId = currentSession.id,
      [open, setOpen] = (0, React.useState)(false),
      form = w({defaultValues: {comment: ''}, resolver: E(feedbackSchema)}),
      trpc = y(),
      report = F(trpc.sessions.reportFeedback.mutationOptions()),
      close = () => {
        (setOpen(false), form.reset(), report.reset());
      },
      handleOpenChange = (value, details) => {
        if (!value) {
          if (details.reason === 'escape-key' || details.reason === 'outside-press') return;
          close();
          return;
        }
        setOpen(true);
      },
      handleCancel = async () => {
        if (!form.getValues('comment').trim()) {
          close();
          return;
        }
        (await confirm({
          title: 'Discard feedback?',
          description: 'Your feedback will be lost.',
          ui: {action: 'Discard', cancel: 'Keep editing', variant: 'destructive'},
        })) && close();
      },
      submit = value => {
        report.mutate(
          {accountId, sessionId, auxComponentVersion: auxVersion(), comment: value.comment || void 0},
          {
            onSuccess: () => {
              (capture('tasks.feedback.submit', {prompt: value.comment || '', sessionId}),
                O.success('Saved privately for review.'),
                close());
            },
          },
        );
      };
    return (
      D({event: A, schema: N}, value => {
        value.sessionId === sessionId &&
          (capture('tasks.feedback.open', {sessionId}),
          value.comment && form.setValue('comment', value.comment),
          setOpen(true));
      }),
      (0, jsxRuntime.jsx)(R, {
        open,
        onOpenChange: handleOpenChange,
        children: (0, jsxRuntime.jsx)(K, {
          className: 'max-h-[calc(100dvh-2rem)] max-w-md! overflow-y-auto',
          children: (0, jsxRuntime.jsx)(P, {
            ...form,
            children: (0, jsxRuntime.jsxs)('form', {
              className: 'contents',
              onSubmit: form.handleSubmit(submit),
              children: [
                (0, jsxRuntime.jsxs)(H, {
                  children: [
                    (0, jsxRuntime.jsx)(q, {children: 'Send feedback'}),
                    (0, jsxRuntime.jsxs)(B, {
                      children: [
                        'Add a note if you’d like to share more context. ',
                        (0, jsxRuntime.jsx)('br', {}),
                        'This saves your feedback and session data privately for Aux review.',
                      ],
                    }),
                  ],
                }),
                (0, jsxRuntime.jsx)(M, {
                  ...form.register('comment'),
                  className: 'max-h-[50dvh] overflow-y-auto',
                  placeholder: 'Add any context, comments, or issues…',
                  disabled: report.isPending,
                  'aria-invalid': !!form.formState.errors.comment,
                  maxLength: 4e3,
                }),
                form.formState.errors.comment &&
                  (0, jsxRuntime.jsx)('p', {
                    className: 'text-destructive text-sm',
                    children: form.formState.errors.comment.message,
                  }),
                report.error &&
                  (0, jsxRuntime.jsx)('p', {className: 'text-destructive text-sm', children: report.error.message}),
                (0, jsxRuntime.jsxs)(T, {
                  children: [
                    (0, jsxRuntime.jsx)(d, {
                      type: 'button',
                      variant: 'ghost',
                      disabled: report.isPending,
                      onClick: handleCancel,
                      children: 'Cancel',
                    }),
                    (0, jsxRuntime.jsxs)(d, {
                      type: 'submit',
                      disabled: report.isPending,
                      children: [
                        report.isPending && (0, jsxRuntime.jsx)(j, {}),
                        (0, jsxRuntime.jsx)('span', {children: 'Submit'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        }),
      })
    );
  };
