/* Aux-owned source, chat input pass 2 (assets/permission-approval-D-GTf91U.js, after the supplied chat
 * input to the end of the module): the prompts that take over the composer while the agent waits:
 * confirming an action (with a custom answer), answering its questions one step at a time, and
 * allowing or denying a permission, each in the composer and as a compact popup.
 * Names the rest of the chunk uses keep their chunk names: we/kn the draft key and its check, ft
 * useResponseSubmit, En CustomInstruction, As ActionConfirmation, Is ConfirmationPopup, Ns
 * AskUserQuestion, ks QuestionsPopup, Rs PermissionApproval, Es PermissionPopup.
 * Chunk names used: n JSX runtime, a React, N cn, P Button, Se Kbd, Ke shortcut label, re the
 * platform modifier, Le the text context hook, Me/Te the session and account, Pe/De/ve tRPC, query
 * client and mutation, se toast, tt ScrollArea, rt the artifact, st Textarea, en Checkbox, un tooltip,
 * zt/Ut/Ve the tool definitions, _t/$t file icon and path, and the first pass's icons. */
we = e => JSON.stringify(e.doc),
  kn = (e, t) =>
    e ===
    we(t) /** Registers the composer Send button as the submit for this prompt, with its pending state and label. */,
  ft = (e, t = false, r = null, s) => {
    const {registerResponseSubmit, setResponsePending, setResponseSubmitLabel} = Le(),
      f = (0, a.useEffectEvent)(e);
    ((0, a.useEffect)(() => {
      setResponsePending(t);
    }, [t, setResponsePending]),
      (0, a.useEffect)(() => {
        setResponseSubmitLabel(r);
      }, [r, setResponseSubmitLabel]),
      (0, a.useEffect)(() => registerResponseSubmit(() => f(), s), []));
  },
  InstructionSchema = Jt({instruction: Gt().trim().min(1)}),
  En = ({disabled, onCancel, onSubmit}) => {
    const s = Lt({defaultValues: {instruction: ''}, resolver: Mt(InstructionSchema)}),
      i = s.watch('instruction'),
      o = s.handleSubmit(({instruction}) => onSubmit(instruction)),
      m = f => {
        f.key !== 'Enter' || f.shiftKey || f.nativeEvent.isComposing || (f.preventDefault(), o());
      };
    return (0, n.jsx)(Qt, {
      ...s,
      children: (0, n.jsxs)('div', {
        className: 'flex min-w-56 items-center gap-1.5',
        children: [
          (0, n.jsx)(P, {
            'aria-label': 'Close custom answer',
            className: 'rounded-full',
            disabled,
            size: 'icon',
            variant: 'secondary',
            onClick: onCancel,
            children: (0, n.jsx)(Zt, {className: 'size-4'}),
          }),
          (0, n.jsx)(st, {
            ...s.register('instruction'),
            autoFocus: true,
            className: 'field-sizing-content max-h-24 min-h-8 flex-1 resize-none',
            disabled,
            placeholder: 'Tell Aux what to do instead',
            rows: 1,
            onKeyDown: m,
          }),
          (0, n.jsx)(P, {
            className: 'rounded-full px-3',
            disabled: disabled || !i.trim(),
            onClick: o,
            children: 'Send',
          }),
        ],
      }),
    });
  } /** Confirming an action in the composer: Confirm, Cancel, or reply with instructions instead. */,
  As = ({className}) => {
    const {currentSession} = Me(),
      {accountId} = Te(),
      {text, getText, setText} = Le(),
      m = (0, a.useRef)(false),
      f = Pe(),
      y = De(),
      I = ve(f.sessions.resolveSuspension.mutationOptions()),
      C = currentSession.suspension,
      h = de(C) && C.kind === 'action-confirmation' ? C : null,
      k = async w => {
        if (!(!h || m.current)) {
          m.current = true;
          try {
            const l = await I.mutateAsync({
              sessionId: currentSession.id,
              toolCallId: h.toolCallId,
              suspensionId: h.id,
              response: w,
              accountId,
            });
            (setText(''), y.setQueryData(f.sessions.get.queryKey({sessionId: currentSession.id, accountId}), l));
          } catch (l) {
            se.error(l instanceof Error ? l.message : 'Failed to submit confirmation');
          } finally {
            m.current = false;
          }
        }
      },
      j = w => () => k({verdict: w}),
      T = async () => {
        const w = getText().trim();
        w && (await k({verdict: 'cancel', instruction: w}));
      };
    ft(T, I.isPending);
    const p = async (w = false) => {
        w || getText().trim() ? await T() : await k({verdict: 'confirm'});
      },
      S = (0, a.useEffectEvent)(p);
    if (
      ((0, a.useEffect)(() => {
        const w = l => {
          l.isComposing ||
            !re(l) ||
            l.key !== 'Enter' ||
            (l.preventDefault(),
            l.stopPropagation(),
            S(l.target instanceof Element && !!l.target.closest('textarea, input, [contenteditable="true"]')));
        };
        return (window.addEventListener('keydown', w, true), () => window.removeEventListener('keydown', w, true));
      }, []),
      !h)
    )
      return null;
    const {request} = h;
    return (0, n.jsxs)('div', {
      className: N('flex max-h-[min(32rem,calc(100dvh-10rem))] min-h-0 flex-col', className),
      children: [
        (0, n.jsxs)(tt, {
          className:
            'flex min-h-0 flex-1 flex-col overflow-hidden **:data-[slot=scroll-area-viewport]:min-h-0 **:data-[slot=scroll-area-viewport]:flex-1',
          children: [
            (0, n.jsxs)('div', {
              className: 'flex items-start gap-4 pt-3 pr-3 pb-1 pl-4',
              children: [
                (0, n.jsxs)('div', {
                  className: 'min-w-0 grow space-y-1 py-1 pr-10',
                  children: [
                    (0, n.jsx)('h3', {
                      className: 'text-primary text-sm leading-5 font-medium',
                      children: request.title,
                    }),
                    (0, n.jsx)('p', {
                      className: 'text-muted-foreground text-[13px] leading-4.5 wrap-break-word whitespace-pre-wrap',
                      children: request.message,
                    }),
                  ],
                }),
                (0, n.jsxs)('span', {
                  className: 'relative size-7 shrink-0',
                  'aria-label': 'Confirmation required',
                  children: [
                    (0, n.jsx)(qt, {
                      className: 'text-muted-foreground absolute top-0.5 left-0.5 size-6 opacity-40',
                      style: {maskImage: 'radial-gradient(circle 7px at 19px 19px, transparent 6px, black 7px)'},
                    }),
                    (0, n.jsx)(Kt, {className: 'text-brand absolute top-3.5 left-3.5 size-3'}),
                  ],
                }),
              ],
            }),
            (0, n.jsx)('div', {
              className: 'p-2',
              children: (0, n.jsx)(rt, {
                artifact: request.artifact,
                sessionId: currentSession.id,
                className: 'max-h-none rounded-xl',
              }),
            }),
          ],
        }),
        (0, n.jsx)('p', {
          className: 'text-muted-foreground px-4 pb-2 text-xs',
          children: 'To change the plan, reply below. Sending instructions won’t confirm this action.',
        }),
        (0, n.jsxs)('div', {
          className: 'flex shrink-0 justify-end gap-1.5 px-3 pt-1 pb-3',
          children: [
            (0, n.jsx)(P, {
              variant: 'secondary',
              shape: 'pill',
              disabled: I.isPending,
              onClick: j('cancel'),
              children: 'Cancel',
            }),
            (0, n.jsxs)(P, {
              shape: 'pill',
              disabled: I.isPending,
              onClick: () => {
                p();
              },
              children: [
                text.trim() ? 'Send instructions' : 'Confirm',
                ' ',
                (0, n.jsx)(Se, {
                  variant: 'primary',
                  className: 'bg-background/20 dark:bg-background/10 h-4 rounded-full',
                  children: Ke('Meta+Enter'),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Is = ({className, request, sessionId, onSubmit}) => {
    const i = (0, a.useRef)(false),
      [o, m] = (0, a.useState)(false),
      f = async y => {
        if (!i.current) {
          ((i.current = true), m(true));
          try {
            await onSubmit(y);
          } finally {
            ((i.current = false), m(false));
          }
        }
      };
    return (0, n.jsx)(ConfirmationCard, {
      compact: true,
      className: N('bg-surface-secondary max-h-[min(32rem,calc(100vh-6rem))] overflow-hidden', className),
      isBusy: o,
      request,
      sessionId,
      onSubmit: f,
    });
  } /** An action to confirm, with Cancel, Confirm and a custom answer. */,
  ConfirmationCard = ({className, compact = false, isBusy, request, sessionId, onSubmit}) => {
    const [m, f] = (0, a.useState)(false),
      y = () => {
        onSubmit({verdict: 'confirm'});
      },
      I = (0, a.useEffectEvent)(() => {
        m || y();
      });
    (0, a.useEffect)(() => {
      if (compact) return;
      const h = k => {
        k.isComposing || !re(k) || k.key !== 'Enter' || (k.preventDefault(), k.stopPropagation(), I());
      };
      return (window.addEventListener('keydown', h, true), () => window.removeEventListener('keydown', h, true));
    }, [compact]);
    const C = h => {
      m || h.defaultPrevented || h.nativeEvent.isComposing || (re(h) && h.key === 'Enter' && (h.preventDefault(), y()));
    };
    return (0, n.jsxs)('div', {
      className: N(
        '@container relative flex min-h-0 flex-col',
        !compact && 'max-h-[min(32rem,calc(150vh-6rem))] overflow-hidden p-1.5',
        className,
      ),
      onClick: h => {
        compact && (h.preventDefault(), h.stopPropagation());
      },
      onKeyDownCapture: C,
      role: 'group',
      children: [
        (0, n.jsx)(tt, {
          className: 'flex min-h-0 grow flex-col **:data-[slot=scroll-area-viewport]:flex-1',
          children: (0, n.jsxs)('div', {
            className: N('flex flex-col gap-3', compact ? 'px-2 pt-2 pb-1.5' : 'px-2 py-1.5 max-sm:p-1'),
            children: [
              (0, n.jsx)('div', {
                className: N('flex items-start gap-2', !compact && 'px-1'),
                children: (0, n.jsxs)('div', {
                  className: 'min-w-0 grow',
                  children: [
                    !compact &&
                      (0, n.jsx)('p', {
                        className: 'text-muted-foreground mt-0.5 text-xs',
                        children: 'Aux is waiting for your confirmation',
                      }),
                    (0, n.jsx)('h3', {
                      className: N(
                        'text-foreground font-display font-medium tracking-[0.01em]',
                        compact ? 'text-sm' : 'text-base',
                      ),
                      children: request.title,
                    }),
                  ],
                }),
              }),
              (0, n.jsx)('p', {
                className: N(
                  'text-foreground px-1 text-[13px] leading-4.5 wrap-break-word whitespace-pre-wrap',
                  compact && 'px-0 text-xs leading-4',
                ),
                children: request.message,
              }),
              !compact && (0, n.jsx)(rt, {artifact: request.artifact, sessionId}),
            ],
          }),
        }),
        (0, n.jsx)('div', {
          className: N('flex min-h-11 shrink-0 flex-col justify-center gap-2 p-1', compact && 'px-2 pb-3'),
          children: m
            ? (0, n.jsx)(En, {
                disabled: isBusy,
                onCancel: () => f(false),
                onSubmit: h => {
                  onSubmit({verdict: 'cancel', instruction: h});
                },
              })
            : (0, n.jsxs)(n.Fragment, {
                children: [
                  (0, n.jsxs)('div', {
                    className: 'flex items-center justify-end gap-2 max-sm:flex-col',
                    children: [
                      (0, n.jsx)(P, {
                        className: N('min-w-0 rounded-full max-sm:w-full sm:flex-1', !compact && 'h-9'),
                        size: compact ? 'sm' : 'default',
                        variant: 'secondary',
                        disabled: isBusy,
                        onClick: () => {
                          onSubmit({verdict: 'cancel'});
                        },
                        children: (0, n.jsx)('span', {className: 'truncate', children: 'Cancel'}),
                      }),
                      (0, n.jsxs)(P, {
                        className: N('min-w-0 rounded-full max-sm:w-full sm:flex-1', !compact && 'h-9'),
                        size: compact ? 'sm' : 'default',
                        disabled: isBusy,
                        onClick: y,
                        children: [
                          (0, n.jsx)('span', {className: 'truncate', children: 'Confirm'}),
                          compact ? null : (0, n.jsx)(Se, {variant: 'primary', children: Ke('Meta+Enter')}),
                        ],
                      }),
                    ],
                  }),
                  (0, n.jsx)(P, {
                    size: 'sm',
                    variant: 'ghost',
                    disabled: isBusy,
                    onClick: () => f(true),
                    children: 'Custom answer',
                  }),
                ],
              }),
        }),
      ],
    });
  },
  EMPTY_ANSWER = {type: 'select', items: []} /** A question in the composer, one step at a time. */,
  Ns = ({className}) => {
    const {
        currentQuestion,
        currentStep,
        currentAnswer,
        questions,
        isBusy,
        canContinue,
        handleSelectOption,
        handleStepClick,
        handleContinue,
        handleCancelQuestions,
      } = useQuestions(),
      h = (0, a.useRef)([]),
      k = p => () => handleSelectOption(p),
      j = () => handleStepClick(currentStep - 1),
      T = p => S => {
        if (!currentQuestion || S.nativeEvent.isComposing || (S.key !== 'ArrowDown' && S.key !== 'ArrowUp')) return;
        S.preventDefault();
        const v = S.key === 'ArrowDown' ? 1 : -1;
        h.current[(p + v + currentQuestion.options.length) % currentQuestion.options.length]?.focus();
      };
    return currentQuestion
      ? questions.length === 1 && currentQuestion.options.length === 0
        ? (0, n.jsxs)('h3', {
            className: N('text-primary px-4 py-4 text-sm leading-5 font-medium wrap-break-word', className),
            children: ['Q. ', currentQuestion.question],
          })
        : (0, n.jsxs)('div', {
            className: N('@container flex min-h-0 flex-col', className),
            children: [
              (0, n.jsxs)('div', {
                className: 'flex items-start justify-between gap-4 pt-4 pr-2.5 pl-4',
                children: [
                  (0, n.jsxs)('h3', {
                    className: 'text-primary min-w-0 text-sm leading-5 font-medium wrap-break-word',
                    children: ['Q. ', currentQuestion.question],
                  }),
                  (0, n.jsxs)('span', {
                    className: 'text-muted-foreground shrink-0 px-2 text-xs leading-6 tabular-nums',
                    children: [currentStep + 1, '/', questions.length],
                  }),
                ],
              }),
              (0, n.jsx)('div', {
                className: 'max-h-44 overflow-y-auto px-2 py-3',
                children: currentQuestion.options.map((p, S) => {
                  const v = currentAnswer.type === 'select' && currentAnswer.items.includes(p.label);
                  return (0, n.jsxs)(
                    P,
                    {
                      ref: w => {
                        h.current[S] = w;
                      },
                      variant: 'ghost',
                      disabled: isBusy,
                      'aria-pressed': v,
                      className: N(
                        'h-auto min-h-8 w-full items-start justify-start gap-0.5 px-2 py-1.5 text-left font-normal',
                        !currentQuestion.multiple && v && 'bg-accent!',
                      ),
                      onClick: k(p.label),
                      onKeyDown: T(S),
                      children: [
                        (0, n.jsx)(OptionMarker, {
                          className: 'h-5',
                          index: S + 1,
                          multiple: currentQuestion.multiple,
                          selected: v,
                        }),
                        (0, n.jsx)('span', {
                          className: N('min-w-0 wrap-break-word whitespace-normal', currentQuestion.multiple && 'pl-1'),
                          children: p.label,
                        }),
                        p.description &&
                          (0, n.jsx)(un, {
                            content: p.description,
                            className: 'max-w-60',
                            children: (0, n.jsx)('span', {
                              className: 'flex h-5 w-4 shrink-0 items-center justify-center',
                              children: (0, n.jsx)(Vt, {className: 'text-muted-foreground size-3!'}),
                            }),
                          }),
                      ],
                    },
                    p.label,
                  );
                }),
              }),
              (0, n.jsxs)('div', {
                className: 'flex items-center gap-1.5 px-3 pt-1 pb-3',
                children: [
                  currentStep > 0 &&
                    (0, n.jsxs)(P, {
                      variant: 'outline',
                      shape: 'pill',
                      disabled: isBusy,
                      onClick: j,
                      children: [(0, n.jsx)(et, {className: 'size-4'}), 'Back'],
                    }),
                  (0, n.jsx)('div', {className: 'grow'}),
                  (0, n.jsx)(P, {
                    variant: 'secondary',
                    shape: 'pill',
                    disabled: isBusy,
                    onClick: handleCancelQuestions,
                    children: 'Cancel',
                  }),
                  (0, n.jsx)(P, {
                    shape: 'pill',
                    disabled: isBusy || !canContinue,
                    onClick: handleContinue,
                    children: currentStep === questions.length - 1 ? 'Submit' : 'Next',
                  }),
                ],
              }),
            ],
          })
      : null;
  } /** Questions in a compact popup. */,
  ks = ({className, onCancel, onSubmit, questions}) => {
    const [i, o] = (0, a.useState)(0),
      [m, f] = (0, a.useState)({}),
      [y, I] = (0, a.useState)(false),
      [C, h] = (0, a.useState)(false),
      k = (0, a.useEffectEvent)(() => {
        (o(0), f({}), I(false), h(false));
      }),
      j = questionsKey(questions),
      T = (0, a.useMemo)(() => defaultAnswers(questions), [j]),
      {canContinue, canSubmit, currentAnswer, currentQuestion, isLastQuestion, optionCount} = questionState({
        answers: m,
        currentStep: i,
        defaultAnswers: T,
        questions,
      });
    (0, a.useEffect)(() => {
      k();
    }, [j]);
    const O = !!currentQuestion,
      [_, $] = useOverflow([i, optionCount, currentAnswer, j, O]);
    if (!currentQuestion) return null;
    const u = currentAnswer.type === 'custom',
      b = isLastQuestion ? (C ? 'Submitting...' : 'Submit') : 'Continue',
      D = g => {
        (g.preventDefault(), g.stopPropagation());
      },
      K = (g, L) => {
        f(Q => ({...Q, [g]: L}));
      },
      U = g => {
        const L = toggleOption({currentAnswer, currentQuestion, label: g}),
          Q = {...m, [i]: L};
        return (K(i, L), Q);
      },
      q = () => {
        currentAnswer.type !== 'custom' && K(i, {type: 'custom', content: customText(currentAnswer)});
      },
      W = g => {
        K(i, {type: 'custom', content: g.target.value});
      },
      M = () => {
        !canContinue || isLastQuestion || o(g => Math.min(g + 1, questions.length - 1));
      },
      Y = g => () => {
        o(g);
      },
      V = g => () => {
        U(g);
      },
      X = async (g = m) => {
        if (!(!allAnswered(questions, g, T) || y || C)) {
          h(true);
          try {
            await onSubmit(answersFor(questions, g, T));
          } catch {
            return;
          } finally {
            h(false);
          }
        }
      },
      z = async () => {
        if (!(!onCancel || y || C)) {
          I(true);
          try {
            await onCancel();
          } finally {
            I(false);
          }
        }
      },
      je = () => {
        if (isLastQuestion) {
          X();
          return;
        }
        M();
      },
      fe = g => {
        !isLastQuestion || !canSubmit || !isPlainEnter(g) || (g.preventDefault(), X());
      },
      B = g => L => {
        if (!isPlainEnter(L)) return;
        L.preventDefault();
        const Q = U(g);
        currentQuestion.multiple || !isLastQuestion || X(Q);
      };
    return (0, n.jsxs)('div', {
      className: N(
        'bg-surface-primary flex max-h-[min(28rem,calc(100vh-6rem))] flex-col gap-2 overflow-hidden rounded-xl p-2',
        className,
      ),
      onClick: D,
      onKeyDown: g => g.stopPropagation(),
      role: 'presentation',
      children: [
        (0, n.jsxs)('div', {
          className: 'flex flex-col gap-0.5 px-1',
          children: [
            (0, n.jsxs)('div', {
              className: 'flex items-center justify-between gap-2',
              children: [
                (0, n.jsx)('p', {
                  className: 'text-muted-foreground text-[11px] leading-3.5 font-medium',
                  children: currentQuestion.header,
                }),
                questions.length > 1
                  ? (0, n.jsxs)('div', {
                      className: 'text-muted-foreground flex items-center gap-1.5',
                      children: [
                        (0, n.jsx)(P, {
                          variant: 'ghost',
                          size: 'icon-xs',
                          className: 'hover:text-foreground size-3 rounded-none p-0 hover:bg-transparent',
                          disabled: i === 0,
                          onClick: Y(Math.max(i - 1, 0)),
                          children: (0, n.jsx)(et, {className: 'size-3'}),
                        }),
                        (0, n.jsx)('span', {
                          className: 'text-[11px] leading-3.5 font-medium tabular-nums',
                          children: `${i + 1}/${questions.length}`,
                        }),
                        (0, n.jsx)(P, {
                          variant: 'ghost',
                          size: 'icon-xs',
                          className: 'hover:text-foreground size-3 rounded-none p-0 hover:bg-transparent',
                          disabled: isLastQuestion || !canContinue,
                          onClick: M,
                          children: (0, n.jsx)(Pt, {className: 'size-3'}),
                        }),
                      ],
                    })
                  : null,
              ],
            }),
            (0, n.jsx)('h3', {className: 'text-foreground text-xs font-medium', children: currentQuestion.question}),
          ],
        }),
        (0, n.jsx)('div', {
          ref: _,
          className: N('-mx-1 min-h-0 flex-1 overflow-y-auto', $ && 'scroll-fade-effect-y'),
          children: (0, n.jsxs)('div', {
            className: 'flex flex-col',
            children: [
              currentQuestion.options.map((g, L) => {
                const Q = currentAnswer.type === 'select' && currentAnswer.items.includes(g.label);
                return (0, n.jsx)(
                  QuestionOption,
                  {
                    index: L + 1,
                    label: g.label,
                    multiple: currentQuestion.multiple,
                    selected: Q,
                    onClick: V(g.label),
                    onKeyDown: B(g.label),
                  },
                  g.label,
                );
              }),
              O
                ? (0, n.jsx)(CustomAnswer, {
                    index: optionCount + 1,
                    multiple: currentQuestion.multiple,
                    selected: u,
                    value: customText(currentAnswer),
                    visible: optionCount === 0 || u,
                    onActivate: q,
                    onChange: W,
                    onKeyDown: fe,
                  })
                : null,
            ],
          }),
        }),
        (0, n.jsxs)('div', {
          className: 'flex shrink-0 items-center gap-2',
          children: [
            (0, n.jsx)('div', {className: 'flex-1'}),
            onCancel
              ? (0, n.jsx)(P, {
                  size: 'sm',
                  variant: 'outline',
                  className: 'shrink-0',
                  disabled: y || C,
                  onClick: z,
                  children: 'Cancel',
                })
              : null,
            (0, n.jsx)(P, {
              size: 'sm',
              className: 'shrink-0',
              disabled: y || C || (isLastQuestion ? !canSubmit : !canContinue),
              onClick: je,
              children: b,
            }),
          ],
        }),
      ],
    });
  },
  OptionMarker = ({className, index, multiple, selected}) =>
    (0, n.jsx)('span', {
      'aria-hidden': 'true',
      className: N(
        'text-muted-foreground flex w-4.5 shrink-0 items-center text-sm font-medium tabular-nums',
        className,
      ),
      children: multiple
        ? (0, n.jsx)('span', {
            className: N(
              'border-input flex size-4 items-center justify-center rounded-sm border',
              selected && 'border-primary bg-primary text-primary-foreground',
            ),
            children: selected ? (0, n.jsx)(Ht, {className: 'size-3'}) : null,
          })
        : `${index}.`,
    }),
  QuestionOption = ({className, index, label, multiple, muted, selected, onClick, onKeyDown}) =>
    (0, n.jsxs)(P, {
      variant: 'ghost',
      size: 'sm',
      'aria-pressed': multiple ? selected : void 0,
      className: N(
        'w-full justify-start gap-1 text-left font-medium',
        selected && 'bg-secondary text-accent-foreground hover:bg-secondary',
        !selected && muted && 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        !selected && !muted && 'text-foreground hover:bg-muted/60',
        className,
      ),
      onClick,
      onKeyDown,
      children: [
        (0, n.jsx)(OptionMarker, {index, multiple, selected: !!selected}),
        (0, n.jsx)('span', {className: 'min-w-0 flex-1 truncate', children: label}),
      ],
    }),
  CustomAnswer = ({index, multiple, selected, value, visible, onActivate, onChange, onKeyDown}) => {
    const y = (0, a.useRef)(null);
    return (
      (0, a.useEffect)(() => {
        visible && y.current?.focus();
      }, [visible]),
      visible
        ? (0, n.jsx)('div', {
            className: 'bg-secondary rounded-md px-2.5 py-2',
            children: (0, n.jsxs)('div', {
              className: 'flex items-start gap-1',
              children: [
                (0, n.jsx)(OptionMarker, {className: 'pt-0.5', index, multiple, selected}),
                (0, n.jsx)(st, {
                  ref: y,
                  value,
                  className: N(
                    'text-accent-foreground field-sizing-content resize-none border-0 bg-transparent! p-0! text-xs shadow-none outline-none focus-visible:ring-0',
                    !selected && 'text-muted-foreground',
                  ),
                  placeholder: 'Custom answer',
                  onChange,
                  onClick: onActivate,
                  onFocus: onActivate,
                  onKeyDown,
                }),
              ],
            }),
          })
        : (0, n.jsx)(QuestionOption, {
            index,
            label: 'Custom answer',
            multiple,
            selected,
            muted: true,
            onClick: onActivate,
          })
    );
  }; /** The question steps, answers and submit for the current suspension. */
function useQuestions() {
  const {currentSession} = Me(),
    {accountId} = Te(),
    {text, getText, setText} = Le(),
    [o, m] = (0, a.useState)(0),
    [f, y] = (0, a.useState)({}),
    I = (0, a.useRef)(false),
    C = Pe(),
    h = De(),
    k = ve(C.sessions.resolveSuspension.mutationOptions()),
    j = ve(C.sessions.interrupt.mutationOptions()),
    T = currentSession.suspension,
    p = de(T) && T.kind === 'ask-user-question' ? T : null,
    S = p?.request.questions ?? [],
    v = defaultAnswers(S),
    w = S[o],
    l = answerAt(f, v, o),
    A = text.length > 0 || l.type === 'custom' ? {type: 'custom', content: text} : l,
    O = k.isPending || j.isPending,
    _ = (D, K = A) => {
      y(q => ({...q, [o]: K}));
      const U = answerAt(f, v, D);
      (setText(U.type === 'custom' ? U.content : ''), m(D));
    },
    $ = async () => {
      if (!p || O || I.current) return;
      const D = getText().trim(),
        K = D ? {type: 'custom', content: D} : A;
      if (!isAnswered(K)) return;
      const U = {...f, [o]: K};
      if (o < S.length - 1) {
        _(o + 1, K);
        return;
      }
      if (allAnswered(S, U, v)) {
        I.current = true;
        try {
          const q = await k.mutateAsync({
            sessionId: currentSession.id,
            accountId,
            toolCallId: p.toolCallId,
            response: {answers: answersFor(S, U, v)},
          });
          (setText(''), h.setQueryData(C.sessions.get.queryKey({sessionId: currentSession.id, accountId}), q));
        } catch (q) {
          se.error(q instanceof Error ? q.message : 'Failed to submit answers');
        } finally {
          I.current = false;
        }
      }
    },
    u = D => {
      !w || O || (y(K => ({...K, [o]: toggleOption({currentAnswer: A, currentQuestion: w, label: D})})), setText(''));
    },
    b = async () => {
      if (!O)
        try {
          const D = await j.mutateAsync({sessionId: currentSession.id, accountId});
          (setText(''),
            h.setQueryData(C.sessions.get.queryKey({sessionId: currentSession.id, accountId}), D),
            await Promise.all([
              h.invalidateQueries(
                C.sessions.turns.activeMessages.queryFilter({sessionId: currentSession.id, accountId}),
              ),
              h.invalidateQueries(C.sessions.listPreviewItems.queryFilter({accountId})),
              h.invalidateQueries(C.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
            ]));
        } catch (D) {
          se.error(D instanceof Error ? D.message : 'Failed to cancel question');
        }
    };
  return (
    ft($, O, o === S.length - 1 ? 'Submit' : 'Next'),
    (0, a.useEffect)(() => {
      (m(0), y({}));
    }, [p?.toolCallId]),
    {
      currentQuestion: w,
      currentStep: o,
      currentAnswer: A,
      questions: S,
      isBusy: O,
      canContinue: isAnswered(A),
      handleSelectOption: u,
      handleStepClick: _,
      handleContinue: $,
      handleCancelQuestions: b,
    }
  );
}
var answersFor = (e, t, r) =>
    e.map((s, i) => {
      const o = answerAt(t, r, i);
      return {header: s.header, answer: o.type === 'select' ? o.items.join(', ') : `custom: ${o.content.trim()}`};
    }),
  questionsKey = e => e.map(t => `${t.header}:${t.question}`).join('|'),
  questionState = ({answers, currentStep, defaultAnswers, questions}) => {
    const i = questions[currentStep],
      o = answerAt(answers, defaultAnswers, currentStep);
    return {
      canContinue: i ? isAnswered(o) : false,
      canSubmit: allAnswered(questions, answers, defaultAnswers),
      currentAnswer: o,
      currentQuestion: i,
      isLastQuestion: currentStep === questions.length - 1,
      optionCount: i?.options.length ?? 0,
    };
  },
  defaultAnswers = e => {
    const t = {};
    return (
      e.forEach((r, s) => {
        const i = r.options[0];
        i && (t[s] = {type: 'select', items: [i.label]});
      }),
      t
    );
  },
  answerAt = (e, t, r) => e[r] ?? t[r] ?? EMPTY_ANSWER,
  allAnswered = (e, t, r) => e.length > 0 && e.every((s, i) => isAnswered(answerAt(t, r, i))),
  isAnswered = e => (e.type === 'select' ? e.items.length > 0 : e.content.trim().length > 0),
  customText = e => (e.type === 'custom' ? e.content : (e.customDraft ?? '')),
  isPlainEnter = e => e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing,
  toggleOption = ({currentAnswer, currentQuestion, label}) =>
    currentQuestion.multiple && currentAnswer.type === 'select'
      ? {
          type: 'select',
          items: currentAnswer.items.includes(label)
            ? currentAnswer.items.filter(s => s !== label)
            : [...currentAnswer.items, label],
          customDraft: customText(currentAnswer),
        }
      : {type: 'select', items: [label], customDraft: customText(currentAnswer)},
  useOverflow = e => {
    const t = (0, a.useRef)(null),
      [r, s] = (0, a.useState)(false);
    return (
      (0, a.useEffect)(() => {
        const i = t.current;
        if (!i) return;
        const o = () => {
          s(i.scrollHeight > i.clientHeight + 1);
        };
        if ((o(), typeof ResizeObserver > 'u')) return;
        const m = new ResizeObserver(o);
        return (
          m.observe(i),
          () => {
            m.disconnect();
          }
        );
      }, e),
      [t, r]
    );
  },
  PERMISSION_CHOICES = [
    {choice: 'allow', label: 'Allow', shortcut: 'Meta+Enter'},
    {choice: 'deny', label: 'Deny', shortcut: 'Esc'},
  ] /** Allow or deny a permission in the composer, optionally for good. */,
  Rs = ({className}) => {
    const {currentSession} = Me(),
      {accountId} = Te(),
      s = Pe(),
      i = De(),
      o = ve(s.sessions.resolveSuspension.mutationOptions()),
      m = (0, a.useRef)([]),
      f = (0, a.useId)(),
      [y, I] = (0, a.useState)(0),
      [C, h] = (0, a.useState)(false),
      k = (0, a.useEffectEvent)(() => {
        (I(0), h(false));
      }),
      j = currentSession.suspension,
      T = !!currentSession.parentId && currentSession.trigger?.type === 'subagent' && de(j) && j.kind === 'approval',
      p = (0, a.useMemo)(
        () =>
          !T && de(j) && j.kind === 'approval'
            ? {
                scope: j.request.scope,
                sourceTaskId: j.request.source?.taskId,
                toolCallId: j.toolCallId,
                suspensionId: j.id,
                key: `${currentSession.id}:${j.id ?? j.createdAt}`,
              }
            : null,
        [T, currentSession.id, j],
      ),
      S = o.isPending,
      v = u => {
        m.current[u]?.focus();
      },
      w = u => {
        const b = (u + PERMISSION_CHOICES.length) % PERMISSION_CHOICES.length;
        (I(b), v(b));
      },
      l = u => {
        const b = u.target;
        b instanceof HTMLElement && (b.closest('button, a') || v(y));
      },
      A = async u => {
        if (!p || S) return;
        const b = await o.mutateAsync({
          sessionId: currentSession.id,
          toolCallId: p.toolCallId,
          suspensionId: p.suspensionId,
          response: {verdict: u, always: p.sourceTaskId ? false : C},
          accountId,
        });
        i.setQueryData(s.sessions.get.queryKey({sessionId: currentSession.id, accountId}), b);
      },
      O = () => {
        const u = PERMISSION_CHOICES[y]?.choice;
        u && A(u);
      },
      _ = u => {
        if (!u.nativeEvent.isComposing) {
          if (re(u) && u.key === 'Enter') {
            (u.preventDefault(), u.stopPropagation(), A('allow'));
            return;
          }
          if (u.key === 'Escape') {
            (u.preventDefault(), u.stopPropagation(), A('deny'));
            return;
          }
          if (u.key === 'ArrowDown') {
            (u.preventDefault(), u.stopPropagation(), w(y - 1));
            return;
          }
          u.key === 'ArrowUp' && (u.preventDefault(), u.stopPropagation(), w(y + 1));
        }
      };
    (0, a.useEffect)(() => {
      if (!p) return;
      const u = b => {
        if (!b.isComposing) {
          if (re(b) && b.key === 'Enter') {
            (b.preventDefault(), A('allow'));
            return;
          }
          if (b.key === 'Escape') {
            (b.preventDefault(), A('deny'));
            return;
          }
          if (b.key === 'ArrowDown') {
            (b.preventDefault(), w(y - 1));
            return;
          }
          b.key === 'ArrowUp' && (b.preventDefault(), w(y + 1));
        }
      };
      return (window.addEventListener('keydown', u), () => window.removeEventListener('keydown', u));
    }, [y, p, S, C]);
    const $ = u => {
      u.key !== 'Enter' || u.shiftKey || u.nativeEvent.isComposing || (u.preventDefault(), O());
    };
    return (
      (0, a.useEffect)(() => {
        k();
        const u = window.setTimeout(() => v(0), 0);
        return () => window.clearTimeout(u);
      }, [p?.key]),
      T
        ? (0, n.jsx)('p', {
            role: 'status',
            className: 'text-muted-foreground p-4 text-sm',
            children: 'Waiting for permission in the parent chat.',
          })
        : p
          ? (0, n.jsxs)('div', {
              className: N('@container relative flex flex-col', className),
              onClick: l,
              onKeyDownCapture: _,
              role: 'group',
              children: [
                (0, n.jsxs)('div', {
                  className: 'flex shrink-0 flex-col gap-3 p-2.5',
                  children: [
                    (0, n.jsxs)('div', {
                      className: 'px-1',
                      children: [
                        (0, n.jsx)('h3', {
                          className: 'text-foreground text-base font-medium',
                          children: 'Allow Aux to do this action?',
                        }),
                        p.sourceTaskId &&
                          (0, n.jsxs)('p', {
                            className: 'text-muted-foreground mt-1 text-sm',
                            children: ['Subagent ', p.sourceTaskId],
                          }),
                      ],
                    }),
                    (0, n.jsx)(PermissionScope, {
                      scope: p.scope,
                      toolCallId: p.toolCallId,
                      delegated: !!p.sourceTaskId,
                    }),
                  ],
                }),
                (0, n.jsx)('div', {
                  className: 'px-2.5 py-1.5',
                  children: PERMISSION_CHOICES.map((u, b) => {
                    const D = y === b;
                    return (0, n.jsxs)(
                      P,
                      {
                        ref: K => {
                          m.current[b] = K;
                        },
                        variant: 'ghost',
                        className: N(
                          'relative flex w-full justify-start px-3! text-left ring-0! transition-none',
                          D && 'bg-accent!',
                        ),
                        disabled: S,
                        onClick: () => {
                          (I(b), A(u.choice));
                        },
                        onFocus: () => I(b),
                        onKeyDown: $,
                        children: [
                          (0, n.jsx)('span', {
                            className:
                              'text-muted-foreground w-4.5 shrink-0 text-sm leading-none font-medium tabular-nums',
                            children: `${b + 1}.`,
                          }),
                          (0, n.jsx)('span', {className: 'text-accent-foreground', children: u.label}),
                          u.shortcut ? (0, n.jsx)(Se, {className: 'ml-1', children: Ke(u.shortcut)}) : null,
                          (0, n.jsx)('div', {className: 'grow'}),
                          (0, n.jsx)(ShortcutHints, {visible: D}),
                        ],
                      },
                      u.choice,
                    );
                  }),
                }),
                !p.sourceTaskId &&
                  (0, n.jsxs)('label', {
                    className: 'text-muted-foreground flex shrink-0 items-center gap-2 px-5 pb-3 text-xs',
                    htmlFor: f,
                    children: [
                      (0, n.jsx)(en, {id: f, checked: C, onCheckedChange: u => h(!!u)}),
                      (0, n.jsx)('span', {children: 'Do not ask again for this action'}),
                    ],
                  }),
              ],
            })
          : null
    );
  } /** Allow or deny a permission in a compact popup. */,
  Es = ({className, scope, toolCallId, sourceTaskId, onResolve}) => {
    const o = (0, a.useRef)([]),
      [m, f] = (0, a.useState)(0),
      [y, I] = (0, a.useState)(false),
      [C, h] = (0, a.useState)(false),
      k = (0, a.useEffectEvent)(() => {
        (f(0), I(false));
      }),
      j = l => {
        o.current[l]?.focus();
      },
      T = l => {
        const A = (l + PERMISSION_CHOICES.length) % PERMISSION_CHOICES.length;
        (f(A), j(A));
      },
      p = async l => {
        if (!C) {
          h(true);
          try {
            await onResolve(l, sourceTaskId ? false : y);
          } finally {
            h(false);
          }
        }
      },
      S = () => {
        const l = PERMISSION_CHOICES[m]?.choice;
        l && p(l);
      },
      v = l => {
        if (!l.nativeEvent.isComposing) {
          if (re(l) && l.key === 'Enter') {
            (l.preventDefault(), l.stopPropagation(), p('allow'));
            return;
          }
          if (l.key === 'Escape') {
            (l.preventDefault(), l.stopPropagation(), p('deny'));
            return;
          }
          if (l.key === 'ArrowDown') {
            (l.preventDefault(), T(m + 1));
            return;
          }
          l.key === 'ArrowUp' && (l.preventDefault(), T(m - 1));
        }
      },
      w = l => {
        l.key !== 'Enter' || l.shiftKey || l.nativeEvent.isComposing || (l.preventDefault(), S());
      };
    return (
      (0, a.useEffect)(() => {
        k();
      }, [scope, toolCallId]),
      (0, n.jsxs)('div', {
        className: N(
          'bg-surface-primary flex max-h-[min(28rem,calc(100vh-6rem))] flex-col gap-2 overflow-hidden rounded-xl p-2.5',
          className,
        ),
        onClick: l => {
          (l.preventDefault(), l.stopPropagation());
        },
        onKeyDownCapture: v,
        role: 'group',
        children: [
          (0, n.jsxs)('div', {
            className: 'flex flex-col gap-2 px-1',
            children: [
              (0, n.jsx)('h3', {
                className: 'text-foreground text-sm font-medium',
                children: 'Allow Aux to do this action?',
              }),
              sourceTaskId &&
                (0, n.jsxs)('p', {className: 'text-muted-foreground text-xs', children: ['Subagent ', sourceTaskId]}),
              (0, n.jsx)('div', {
                className: 'zoom-75',
                children: (0, n.jsx)(PermissionScope, {scope, toolCallId, delegated: !!sourceTaskId}),
              }),
            ],
          }),
          (0, n.jsx)('div', {
            className: '-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto',
            children: PERMISSION_CHOICES.map((l, A) => {
              const O = m === A;
              return (0, n.jsx)(
                ChoiceRow,
                {
                  ref: _ => {
                    o.current[A] = _;
                  },
                  index: A + 1,
                  label: l.label,
                  selected: O,
                  onClick: () => {
                    (f(A), p(l.choice));
                  },
                  onFocus: () => f(A),
                  onKeyDown: w,
                },
                l.choice,
              );
            }),
          }),
        ],
      })
    );
  } /** What the permission is for: a tool, a file, the browser or the network. */,
  PermissionScope = ({scope, toolCallId, delegated}) => {
    if (delegated && scope.type === 'tool')
      return (0, n.jsxs)('div', {
        className: 'border-border bg-muted/40 rounded-md border px-3 py-2 text-sm',
        children: [
          (0, n.jsxs)('p', {className: 'font-medium', children: ['Run ', scope.tool]}),
          scope.args &&
            (0, n.jsx)('pre', {
              className: 'mt-1 max-h-40 overflow-auto text-xs break-all whitespace-pre-wrap',
              children: JSON.stringify(scope.args, null, 2),
            }),
        ],
      });
    if (scope.type === 'tool') {
      const s = {type: 'toolCall', id: toolCallId, name: scope.tool, arguments: scope.args ?? {}},
        i = zt(s.name),
        o = Ut(s);
      return (0, n.jsxs)('div', {
        className: 'border-border bg-muted/40 flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 shadow-sm',
        children: [
          (0, n.jsx)('span', {
            className: 'text-muted-foreground flex size-5 shrink-0 items-center justify-center',
            children: Ve(i.icon, o),
          }),
          (0, n.jsx)('span', {
            className: 'text-foreground min-w-0 truncate text-sm font-medium',
            children: Ve(i.title, o),
          }),
        ],
      });
    }
    return scope.type === 'file'
      ? (0, n.jsxs)('div', {
          className: 'border-border bg-muted/40 flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 shadow-sm',
          children: [
            (0, n.jsx)(_t, {filename: scope.path, className: 'text-muted-foreground size-5 shrink-0'}),
            (0, n.jsxs)('span', {
              className: 'min-w-0 truncate text-sm font-medium',
              children: [
                scope.mode === 'read' ? 'Read' : 'Write',
                ' ',
                delegated ? scope.path : (0, n.jsx)($t, {path: scope.path}),
              ],
            }),
          ],
        })
      : scope.type === 'browser'
        ? (0, n.jsx)(ScopeRow, {
            label: `${scope.action === 'read' ? 'Read' : scope.action === 'modify' ? 'Modify' : 'Download from'} browser`,
            value: scope.url,
          })
        : (0, n.jsx)(ScopeRow, {label: 'Access network', value: scope.url});
  },
  ChoiceRow = ({className, index, label, selected, shortcut, onClick, onFocus, onKeyDown, ref}) =>
    (0, n.jsxs)(P, {
      ref,
      variant: 'ghost',
      size: 'sm',
      className: N(
        'w-full justify-start gap-1 text-left font-medium',
        selected && 'bg-secondary text-accent-foreground hover:bg-secondary',
        !selected && 'text-foreground hover:bg-muted/60',
        className,
      ),
      onClick,
      onFocus,
      onKeyDown,
      children: [
        (0, n.jsx)('span', {className: 'text-muted-foreground shrink-0', children: `${index}.`}),
        (0, n.jsx)('span', {className: 'min-w-0 flex-1 truncate', children: label}),
        shortcut ? (0, n.jsx)(Se, {children: shortcut}) : null,
      ],
    }),
  ScopeRow = ({label, value}) =>
    (0, n.jsxs)('div', {
      className: 'border-border bg-muted/40 flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 shadow-sm',
      children: [
        (0, n.jsx)(mn, {className: 'text-muted-foreground size-5 shrink-0'}),
        (0, n.jsxs)('span', {
          className: 'text-foreground min-w-0 truncate text-sm font-medium',
          children: [
            label,
            value ? (0, n.jsxs)('span', {className: 'text-muted-foreground', children: [' ', value]}) : null,
          ],
        }),
      ],
    }),
  ShortcutHints = ({visible}) =>
    (0, n.jsxs)('div', {
      className: N(
        'absolute top-1/2 right-1.5 -translate-y-1/2',
        'text-muted-foreground flex shrink-0 items-center gap-0.5',
        visible ? 'opacity-100' : 'opacity-0',
      ),
      children: [
        (0, n.jsx)(Ft, {className: 'size-3'}),
        (0, n.jsx)(dn, {className: 'size-3'}),
        (0, n.jsx)(tn, {
          className: 'bg-primary-foreground/10 ml-1 flex size-5 items-center justify-center rounded-sm',
          children: (0, n.jsx)(Ot, {className: 'size-3!'}),
        }),
      ],
    })
