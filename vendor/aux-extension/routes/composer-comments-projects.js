/* Aux-owned source, composer pass 5: comments on selected transcript text, the new-session draft
 * and the Projects menu (assets/session-composer-Dc0LRfZA.js, from the transcript overlay to the
 * fast-mode schema). Select text in the chat to add it to the composer (with an optional comment)
 * or ask about it in a side chat; added selections stay highlighted with a numbered badge. The
 * draft hook keeps a new session's model, mode, permissions and Project until it is created. This
 * block starts inside the chunk's `var` list.
 * Names the chunk uses elsewhere keep their chunk names: Mp SelectionComments, Ip useSessionDraft
 * (exported), Or PermissionModeMenu, Fo ProjectPicker, ws ProjectLabel, Rp the fast-mode schema.
 * Chunk names used: a JSX runtime, g React, kn react-dom, me useSession, ge useApp, Ce useTRPC,
 * _e useQueryClient, Fe useQuery, ve useMutation, on the model settings, At attachments, xt the
 * input form, $t the side panel, Ur/$r selection attachments, J Button, Zi arrow icon, Nr the
 * provider notice, Oh/oo/Hh attachment upload, Qr seed messages, ll/de/Xo error toasts, Js the
 * native bridge, ra thinking level, Ji/ec final confirm default, oc the permission menu, It/gt/li/ki
 * menu parts, Mi the new Project form, Xs the Project icon, hi slugify, ol/Tn/Nn/al/il zod. */
/** A floating overlay over a text range in the transcript, above it (or below at the top), kept inside the transcript. */
  RangeOverlay = ({range, children, className, ...r}) => {
    const overlay = (0, g.useRef)(null),
      start = range.startContainer,
      transcript = (start instanceof Element ? start : start.parentElement)?.closest('[data-chat-transcript]');
    return (
      (0, g.useLayoutEffect)(() => {
        const element = overlay.current;
        if (!element || !transcript) return;
        let frame = 0;
        const place = () => {
          const rect = range.getBoundingClientRect(),
            bounds = transcript.getBoundingClientRect(),
            visible =
              range.startContainer.isConnected &&
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom > bounds.top &&
              rect.top < bounds.bottom &&
              rect.right > bounds.left &&
              rect.left < bounds.right;
          element.style.visibility = visible ? 'visible' : 'hidden';
          const {width, height} = element.getBoundingClientRect(),
            gap = 12;
          let left = rect.left - bounds.left + rect.width / 2 - width / 2,
            top = rect.top - bounds.top - height - gap;
          (top < 8 && (top = rect.bottom - bounds.top + gap),
            (left = Math.max(8, Math.min(left, transcript.clientWidth - width - 8))),
            (top = Math.max(8, Math.min(top, transcript.clientHeight - height - 8))),
            (element.style.left = `${left}px`),
            (element.style.top = `${top}px`),
            (frame = requestAnimationFrame(place)));
        };
        return (place(), () => cancelAnimationFrame(frame));
      }, [range, transcript]),
      transcript
        ? (0, kn.createPortal)(
            (0, a.jsx)('div', {
              ref: overlay,
              className,
              style: {position: 'absolute', zIndex: 20, maxWidth: 'calc(100% - 16px)'},
              ...r,
              children,
            }),
            transcript,
          )
        : null
    );
  } /** The comment field for a selection added to the chat: Enter saves, Cmd+Enter sends, Escape or a click outside saves. */,
  CommentPopover = ({range, initialComment = '', onSave, onSubmit}) => {
    const latest = (0, g.useRef)(initialComment),
      [comment, setComment] = (0, g.useState)(initialComment);
    latest.current = comment;
    const hasComment = comment.trim().length > 0,
      onChange = event => {
        setComment(event.target.value);
      },
      onKeyDown = event => {
        if (!event.nativeEvent.isComposing) {
          if (event.metaKey && event.key === 'Enter') {
            (event.preventDefault(), event.stopPropagation(), onSubmit(comment));
            return;
          }
          event.key !== 'Enter' || event.shiftKey || (event.preventDefault(), onSave(comment));
        }
      },
      save = () => {
        onSave(comment);
      };
    return (
      (0, g.useEffect)(() => {
        const onPointerDown = event => {
            inCommentPopover(event.target) || onSave(latest.current);
          },
          onEscape = event => {
            event.key === 'Escape' && onSave(latest.current);
          };
        return (
          document.addEventListener('pointerdown', onPointerDown),
          window.addEventListener('keydown', onEscape),
          () => {
            (document.removeEventListener('pointerdown', onPointerDown),
              window.removeEventListener('keydown', onEscape));
          }
        );
      }, [onSave]),
      (0, a.jsxs)(RangeOverlay, {
        range,
        className: 'border-glass bg-glass flex w-80 items-end rounded-[1.25rem] py-1 pr-1 pl-3 shadow-lg',
        'data-annotation-comment-popover': '',
        children: [
          (0, a.jsx)('textarea', {
            autoFocus: true,
            rows: 1,
            className:
              'placeholder:text-muted-foreground field-sizing-content max-h-40 min-h-7 flex-1 resize-none overflow-y-auto bg-transparent py-1 text-sm outline-none',
            placeholder: 'Add an optional comment...',
            value: comment,
            onChange,
            onKeyDown,
          }),
          (0, a.jsx)(J, {
            'aria-label': 'Save comment',
            disabled: !hasComment,
            shape: 'pill',
            size: 'icon-sm',
            onClick: save,
            children: (0, a.jsx)(Zi, {}),
          }),
        ],
      })
    );
  },
  inCommentPopover = target =>
    target instanceof Element &&
    !!target.closest(
      '[data-annotation-comment-popover]',
    ) /** The numbered badge at the end of an added selection, which reopens its comment. */,
  CommentBadge = ({range, number, onBadgeClick}) => {
    const badge = (0, g.useRef)(null),
      end = range.endContainer,
      host = (end instanceof Element ? end : end.parentElement)?.closest('[data-chat-annotation-host]'),
      [position, setPosition] = (0, g.useState)(null);
    return (
      (0, g.useLayoutEffect)(() => {
        const highlight = CSS.highlights.get('chat-annotation') ?? new Highlight();
        return (
          CSS.highlights.set('chat-annotation', highlight),
          highlight.add(range),
          () => {
            (highlight.delete(range), highlight.size === 0 && CSS.highlights.delete('chat-annotation'));
          }
        );
      }, [range]),
      (0, g.useLayoutEffect)(() => {
        if (!host) return;
        const place = () => {
          const last = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0).at(-1);
          if (!last || !host.isConnected) {
            setPosition(null);
            return;
          }
          const hostRect = host.getBoundingClientRect();
          setPosition({top: last.top - hostRect.top - 6, left: last.right - hostRect.left - 4});
        };
        place();
        const resize = new ResizeObserver(place);
        resize.observe(host);
        const mutations = new MutationObserver(records => {
          records.some(record => !badge.current?.contains(record.target)) && place();
        });
        return (
          mutations.observe(host, {childList: true, characterData: true, subtree: true}),
          () => {
            (resize.disconnect(), mutations.disconnect());
          }
        );
      }, [host, range]),
      !host || !position
        ? null
        : (0, kn.createPortal)(
            (0, a.jsx)('button', {
              ref: badge,
              type: 'button',
              'data-annotation-badge': '',
              'aria-label': `Edit annotation ${number}`,
              className:
                'bg-brand absolute z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-white text-[10px] leading-none font-medium text-white tabular-nums shadow-sm transition-[transform,opacity] hover:scale-90 hover:opacity-80',
              style: position,
              onClick: onBadgeClick,
              children: number,
            }),
            host,
          )
    );
  } /** Add to chat, and Ask in side chat, over the selected text. */,
  SelectionActions = ({selection, onAddToChat, onAskInSidechat, onDismiss}) => {
    const addToChat = event => {
        (event.stopPropagation(), onAddToChat());
      },
      askInSidechat = event => {
        (event.stopPropagation(), onAskInSidechat?.());
      };
    return (
      (0, g.useEffect)(() => {
        const onKey = event => {
          event.key === 'Escape' && onDismiss();
        };
        return (window.addEventListener('keydown', onKey), () => window.removeEventListener('keydown', onKey));
      }, [onDismiss]),
      (0, a.jsxs)(RangeOverlay, {
        range: selection.range,
        className: 'border-glass bg-glass flex items-center rounded-xl p-0.5 shadow-lg',
        'data-selected-text-overlay': '',
        children: [
          (0, a.jsx)(J, {size: 'xs', variant: 'ghost', onClick: addToChat, children: 'Add to chat'}),
          onAskInSidechat
            ? (0, a.jsxs)(a.Fragment, {
                children: [
                  (0, a.jsx)('div', {className: 'bg-border h-4 w-px shrink-0'}),
                  (0, a.jsx)(J, {size: 'xs', variant: 'ghost', onClick: askInSidechat, children: 'Ask in side chat'}),
                ],
              })
            : null,
        ],
      })
    );
  },
  SELECTION_UI =
    '[data-selected-text-overlay],[data-annotation-comment-popover],[data-annotation-badge],[data-chat-input-form]' /** The text selected in a session transcript, read when the pointer lifts. */,
  useTranscriptSelection = sessionId => {
    const selecting = (0, g.useRef)(false),
      [selection, setSelection] = (0, g.useState)(null),
      clearSelection = (0, g.useCallback)(() => {
        (setSelection(null), window.getSelection()?.removeAllRanges());
      }, []);
    return (
      (0, g.useEffect)(() => {
        const onPointerDown = event => {
            onSelectionUi(event) || ((selecting.current = true), setSelection(null));
          },
          onPointerUp = event => {
            onSelectionUi(event) ||
              ((selecting.current = false),
              window.setTimeout(() => setSelection(readTranscriptSelection(sessionId)), 0));
          },
          onSelectionChange = () => {
            selecting.current || readTranscriptSelection(sessionId) || setSelection(null);
          };
        return (
          document.addEventListener('pointerdown', onPointerDown),
          document.addEventListener('pointerup', onPointerUp),
          document.addEventListener('pointercancel', onPointerUp),
          document.addEventListener('selectionchange', onSelectionChange),
          () => {
            (document.removeEventListener('pointerdown', onPointerDown),
              document.removeEventListener('pointerup', onPointerUp),
              document.removeEventListener('pointercancel', onPointerUp),
              document.removeEventListener('selectionchange', onSelectionChange));
          }
        );
      }, [sessionId]),
      {selection, clearSelection}
    );
  },
  readTranscriptSelection = sessionId => {
    const transcript = document.querySelector(`[data-chat-transcript="${CSS.escape(sessionId)}"]`),
      selection = window.getSelection();
    if (!transcript || !selection || selection.isCollapsed || selection.rangeCount === 0) return null;
    const text = selection.toString().trim();
    if (!text) return null;
    const range = selection.getRangeAt(0),
      ancestor = range.commonAncestorContainer,
      element = ancestor.nodeType === Node.ELEMENT_NODE ? ancestor : ancestor.parentElement;
    if (!element || !transcript.contains(element)) return null;
    const rect = range.getBoundingClientRect();
    return rect.width === 0 && rect.height === 0 ? null : {text, rect, range: range.cloneRange()};
  },
  onSelectionUi = event =>
    event.target instanceof Element &&
    !!event.target.closest(
      SELECTION_UI,
    ) /** SelectionComments: selected transcript text becomes an attachment with an optional comment and a badge. */,
  Mp = ({showAskInSidechat = true}) => {
    const {currentSession} = me(),
      {attachments, addAttachment, updateAttachment} = At(),
      {submitForm} = xt(),
      panel = $t(),
      {selection, clearSelection} = useTranscriptSelection(currentSession.id),
      [editing, setEditing] = (0, g.useState)(null),
      [badges, setBadges] = (0, g.useState)([]),
      selections = attachments.filter(Ur),
      editedAttachment = selections.find(y => y.id === editing?.id),
      addToChat = (0, g.useCallback)(() => {
        if (!selection) return;
        const attachment = $r(selection.text);
        (addAttachment(attachment),
          setBadges(k => [...k, {id: attachment.id, range: selection.range}]),
          setEditing({id: attachment.id, range: selection.range}),
          clearSelection());
      }, [addAttachment, clearSelection, selection]),
      askInSidechat = (0, g.useCallback)(() => {
        if (!selection) return;
        const attachment = $r(selection.text);
        (panel?.openSideChat({initialAttachments: [attachment]}), clearSelection());
      }, [clearSelection, selection, panel]),
      saveComment = (0, g.useCallback)(
        comment => {
          editing && (updateAttachment(editing.id, {comment}), setEditing(null));
        },
        [editing, updateAttachment],
      ),
      submitComment = (0, g.useCallback)(
        comment => {
          editing &&
            ((0, kn.flushSync)(() => {
              updateAttachment(editing.id, {comment});
            }),
            setEditing(null),
            submitForm());
        },
        [editing, submitForm, updateAttachment],
      ),
      editBadge = badge => () => {
        setEditing(badge);
      };
    return (
      (0, g.useEffect)(() => {
        const kept = new Set(attachments.filter(Ur).map(k => k.id));
        setBadges(k => {
          const remaining = k.filter(w => kept.has(w.id));
          return remaining.length === k.length ? k : remaining;
        });
      }, [attachments]),
      (0, a.jsxs)(a.Fragment, {
        children: [
          selection && !editing
            ? (0, a.jsx)(SelectionActions, {
                selection,
                onAddToChat: addToChat,
                onAskInSidechat: showAskInSidechat ? askInSidechat : void 0,
                onDismiss: clearSelection,
              })
            : null,
          editing && editedAttachment
            ? (0, a.jsx)(
                CommentPopover,
                {
                  range: editing.range,
                  initialComment: editedAttachment.comment ?? '',
                  onSave: saveComment,
                  onSubmit: submitComment,
                },
                editing.id,
              )
            : null,
          badges.map(badge => {
            const index = selections.findIndex(remaining => remaining.id === badge.id);
            return index < 0
              ? null
              : (0, a.jsx)(
                  CommentBadge,
                  {range: badge.range, number: index + 1, onBadgeClick: editBadge(badge)},
                  badge.id,
                );
          }),
        ],
      })
    );
  },
  DEFAULT_RUNTIME_CONFIG = {
    memoryExtractionDisabled: false,
    proactiveMode: false,
    finalConfirm: false,
    workingDirs: [],
  },
  resolveDraftMode = (draftMode, forcedMode) => forcedMode ?? draftMode,
  findModel = (modelsByProvider, provider, modelId) => modelsByProvider[provider]?.find(model => model.id === modelId),
  draftModelFor = (model, available) => ({
    provider: model.provider,
    modelId: model.modelId,
    thinkingLevel: ra(model.thinkingLevel, available?.availableThinkingLevels ?? ['off']),
    fastMode: available?.supportsFastMode ? !!model.fastMode : false,
  }) /** A new-session draft as saved, with defaults for what it does not say. */,
  initialDraft = (saved, stateKey, proactiveMode) => ({
    stateKey,
    draftModelOverride: saved?.draftModelOverride ?? null,
    draftPermissionMode: saved?.draftPermissionMode ?? null,
    draftRuntimeConfig: {
      memoryExtractionDisabled:
        saved?.draftRuntimeConfig?.memoryExtractionDisabled ?? DEFAULT_RUNTIME_CONFIG.memoryExtractionDisabled,
      proactiveMode: saved?.draftRuntimeConfig?.proactiveMode ?? proactiveMode,
      finalConfirm: saved?.draftRuntimeConfig?.finalConfirm ?? Ji(),
      workingDirs: saved?.draftRuntimeConfig?.workingDirs ?? DEFAULT_RUNTIME_CONFIG.workingDirs,
    },
    draftMode: saved?.draftMode ?? 'default',
    draftProjectId: saved?.draftProjectId ?? null,
  }) /** useSessionDraft: a new session’s model, mode, permissions and Project, and creating it with the first message. */,
  Ip = ({
    onSessionChange,
    onSessionCreated,
    source,
    forcedMode,
    defaultDraftState,
    defaultDraftStateKey,
    onDraftStateChange,
    getCreateSessionInput,
  }) => {
    const auxNewtabSettings = auxGetNewtabDraftSettingsOwner();
    if (auxNewtabSettings) {
      defaultDraftState ??= auxNewtabSettings.read();
      defaultDraftStateKey ??= auxNewtabSettings.scope;
      onDraftStateChange ??= auxNewtabSettings.write;
    }
    const {accountId} = ge(),
      trpc = Ce(),
      queryClient = _e(),
      {
        modelProvider,
        modelId,
        thinkingLevel,
        fastMode,
        proactiveMode,
        defaultPermissionMode,
        modelsByProvider,
        availableModels,
        isLoading,
      } = on(),
      createSession = ve(trpc.sessions.create.mutationOptions()),
      createAndPrompt = ve(trpc.sessions.createAndPrompt.mutationOptions()),
      uploadAttachment = ve(trpc.sessions.files.uploadAttachment.mutationOptions()),
      [state, setState] = (0, g.useState)(() => initialDraft(defaultDraftState, defaultDraftStateKey, proactiveMode)),
      mounted = (0, g.useRef)(false),
      lastKey = (0, g.useRef)(defaultDraftStateKey ?? null),
      creating = (0, g.useRef)(false),
      draft =
        state.stateKey === defaultDraftStateKey
          ? state
          : initialDraft(defaultDraftState, defaultDraftStateKey, proactiveMode),
      {draftModelOverride, draftMode, draftProjectId} = draft,
      permissionMode = draft.draftPermissionMode ?? defaultPermissionMode,
      runtimeConfig = draft.draftRuntimeConfig,
      defaultModel = findModel(modelsByProvider, modelProvider, modelId),
      thinking = ra(thinkingLevel, defaultModel?.availableThinkingLevels ?? ['off']),
      overrideModel = draftModelOverride
        ? findModel(modelsByProvider, draftModelOverride.provider, draftModelOverride.modelId)
        : void 0,
      noModels = isLoading || availableModels.length === 0,
      overrideUsable = !!(overrideModel || noModels),
      override = (0, g.useMemo)(
        () => (draftModelOverride && overrideUsable ? draftModelFor(draftModelOverride, overrideModel) : null),
        [draftModelOverride, overrideModel, overrideUsable],
      ),
      model = override || {provider: modelProvider, modelId, thinkingLevel: thinking, fastMode},
      notice = Nr(),
      modelAvailable = !!findModel(modelsByProvider, model.provider, model.modelId),
      mode = resolveDraftMode(draftMode, forcedMode),
      modeForced = forcedMode != null,
      busy = createSession.isPending || createAndPrompt.isPending || uploadAttachment.isPending,
      submitDisabled = noModels || !modelAvailable || busy,
      update = (0, g.useCallback)(
        D => {
          setState($ => ({
            ...($.stateKey === defaultDraftStateKey
              ? $
              : initialDraft(defaultDraftState, defaultDraftStateKey, proactiveMode)),
            ...D,
            stateKey: defaultDraftStateKey,
          }));
        },
        [defaultDraftState, defaultDraftStateKey, proactiveMode],
      );
    (0, g.useEffect)(() => {
      const D = defaultDraftStateKey ?? null;
      if (lastKey.current !== D) {
        lastKey.current = D;
        return;
      }
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      onDraftStateChange?.({
        draftModelOverride: override,
        draftPermissionMode: draft.draftPermissionMode,
        draftRuntimeConfig: runtimeConfig,
        draftMode,
        draftProjectId,
      });
    }, [
      defaultDraftStateKey,
      draftMode,
      draft.draftPermissionMode,
      draftProjectId,
      runtimeConfig,
      override,
      onDraftStateChange,
    ]);
    const Te = (0, g.useCallback)(
        (D, $) => {
          const oe = $?.proactiveMode,
            Be = oe !== void 0 && oe !== (runtimeConfig?.proactiveMode ?? false);
          update({
            draftModelOverride: draftModelFor(D, findModel(modelsByProvider, D.provider, D.modelId)),
            ...(Be ? {draftRuntimeConfig: {...runtimeConfig, proactiveMode: oe}} : {}),
          });
        },
        [runtimeConfig, modelsByProvider, update],
      ),
      Le = (0, g.useCallback)(
        D => {
          update({draftPermissionMode: D});
        },
        [update],
      ),
      De = (0, g.useCallback)(
        D => {
          update({draftRuntimeConfig: {...runtimeConfig, memoryExtractionDisabled: D}});
        },
        [runtimeConfig, update],
      ),
      Ne = (0, g.useCallback)(
        D => {
          update({draftMode: D});
        },
        [update],
      ),
      H = (0, g.useCallback)(
        D => {
          (ec(D), update({draftRuntimeConfig: {...runtimeConfig, finalConfirm: D}}));
        },
        [runtimeConfig, update],
      ),
      L = (0, g.useCallback)(
        D => {
          update({draftProjectId: D});
        },
        [update],
      );
    const auxSessionDraftState = (0, g.useEffectEvent)(() => {
        if (creating.current || busy) throw Error('Session creation or attachment upload is still active');
        if (mode === 'incognito') throw Error('A private session draft must remain in its current view');
        if (
          typeof onDraftStateChange !== 'function' &&
          JSON.stringify(draft) !== JSON.stringify(initialDraft(defaultDraftState, defaultDraftStateKey, proactiveMode))
        )
          throw Error('Unsaved session options have no supported serializer');
        return {
          scope: defaultDraftStateKey ?? null,
          mode,
          settings: {
            draftModelOverride: override,
            draftPermissionMode: draft.draftPermissionMode,
            draftRuntimeConfig: runtimeConfig,
            draftMode,
            draftProjectId,
          },
        };
      }),
      auxSessionDraftFlush = (0, g.useEffectEvent)(() => {
        const state = auxSessionDraftState();
        return onDraftStateChange?.(state.settings);
      });
    (0, g.useLayoutEffect)(
      () =>
        auxRegisterDraftMigrationOwner('session-owner', {
          inspect: () => auxSessionDraftState(),
          flush: () => auxSessionDraftFlush(),
          freeze: () => () => {},
        }),
      [],
    );
    return {
      createSessionMutation: createSession,
      draftModel: model,
      draftMode,
      draftProjectId,
      resolvedMode: mode,
      isModeForced: modeForced,
      isInputDisabled: busy,
      isSubmitDisabled: submitDisabled,
      notice,
      draftPermissionMode: permissionMode,
      draftRuntimeConfig: runtimeConfig,
      handleCreateAndSend: (0, g.useCallback)(
        async D => {
          const auxFinishCreate = auxBeginDraftMigrationWork('session-create');
          let auxCreateAttempted = false,
            auxCreateSettled = false;
          try {
            if (!(submitDisabled || creating.current)) {
              auxCreateAttempted = true;
              creating.current = true;
              try {
                const auxResearch = auxReadResearchIntent(source, accountId, model, onSessionCreated);
                const [$, oe] = await Promise.all([getCreateSessionInput?.(D) ?? {}, cl()]);
                auxAssertResearchIntent(auxResearch, $.browserBinding ?? oe);
                const Be = {
                    ...$,
                    ...(auxResearch ? {research: {kind: 'web-search', query: auxResearch.query}} : {}),
                    projectId: draftProjectId,
                    browserBinding: $.browserBinding ?? oe,
                    model,
                    permissionMode,
                    runtimeConfig,
                    incognito: mode === 'incognito',
                    ...(source ? {trigger: {type: 'user', source}} : {}),
                  },
                  Oe = Oh(D),
                  Ke = onSessionCreated !== void 0,
                  Re = Ke
                    ? await createSession.mutateAsync({...Be, accountId})
                    : await createAndPrompt.mutateAsync({...Be, message: D, accountId}),
                  it =
                    Ke && Oe
                      ? await oo(
                          D,
                          async An => await uploadAttachment.mutateAsync({accountId, sessionId: Re.id, attachment: An}),
                        )
                      : D,
                  Et = !Ke && Oe ? Hh(it) : it,
                  Dt = {sessionId: Re.id, accountId};
                (queryClient.setQueryData(trpc.sessions.get.queryKey(Dt), Re),
                  queryClient.setQueryData(trpc.sessions.messages.queryKey(Dt), []),
                  onSessionCreated
                    ? (Qr(Re.id, Et, {mode: 'client-send'}), await onSessionCreated({sessionId: Re.id, message: Et}))
                    : Qr(Re.id, Et, {mode: 'display-only'}),
                  onSessionChange(Re.id),
                  queryClient.invalidateQueries(trpc.sessions.listPreviewItems.queryFilter({accountId})),
                  queryClient.invalidateQueries(trpc.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
                  (auxCreateSettled = true));
              } catch ($) {
                const oe = await ll($, 'Failed to create session.');
                (de.error(oe.title, {
                  description: oe.description,
                  action: {label: 'Reload', onClick: () => window.location.reload()},
                }),
                  Xo($, {handled: false, surface: 'agent-manager', source: 'manual'}));
              } finally {
                creating.current = false;
              }
            }
          } finally {
            auxFinishCreate(auxCreateAttempted && !auxCreateSettled);
          }
        },
        [
          createSession,
          createAndPrompt,
          uploadAttachment,
          model,
          submitDisabled,
          mode,
          permissionMode,
          draftProjectId,
          runtimeConfig,
          getCreateSessionInput,
          onSessionChange,
          onSessionCreated,
          queryClient,
          accountId,
          source,
          trpc,
        ],
      ),
      handleDraftModelChange: Te,
      handleDraftModeChange: Ne,
      handleDraftPermissionModeChange: Le,
      handleDraftMemoryExtractionDisabledChange: De,
      handleDraftFinalConfirmChange: H,
      handleDraftProjectIdChange: L,
    };
  } /** PermissionModeMenu: the permission mode menu, for the draft or the current session. */,
  Or = ({
    value,
    onValueChange,
    memoryExtractionDisabled,
    finalConfirm,
    onMemoryExtractionDisabledChange,
    onFinalConfirmChange,
    ...i
  }) => {
    const {currentSession, updatePermissionMode, updateRuntimeConfig} = me(),
      setMemoryExtractionDisabled = m => updateRuntimeConfig({memoryExtractionDisabled: m}),
      setFinalConfirm = m => updateRuntimeConfig({finalConfirm: m});
    return (0, a.jsx)(oc, {
      ...i,
      mode: value ?? currentSession.permissionMode,
      onModeChange: onValueChange ?? updatePermissionMode,
      memoryExtractionDisabled: memoryExtractionDisabled ?? currentSession.runtimeConfig.memoryExtractionDisabled,
      onMemoryExtractionDisabledChange: onMemoryExtractionDisabledChange ?? setMemoryExtractionDisabled,
      finalConfirm: finalConfirm ?? currentSession.runtimeConfig.finalConfirm,
      onFinalConfirmChange: onFinalConfirmChange ?? setFinalConfirm,
    });
  } /** ProjectPicker: the Project the session works in, a folder picked as a new Project, or one started from scratch. */,
  Fo = ({value, variant = 'toolbar', size = 'sm', onValueChange}) => {
    const {accountId} = ge(),
      [creating, setCreating] = (0, g.useState)(false),
      trpc = Ce(),
      queryClient = _e(),
      projectsQuery = Fe(trpc.projects.list.queryOptions({accountId})),
      createProject = ve(trpc.projects.create.mutationOptions()),
      projects = (projectsQuery.data ?? []).filter(y => !y.archivedAt),
      selected = projects.find(y => y.id === value) ?? null,
      select = y => {
        onValueChange?.(y === value ? null : y);
      },
      clear = () => {
        onValueChange?.(null);
      },
      startFromScratch = () => {
        setCreating(true);
      },
      useExistingFolder = async () => {
        try {
          const picked = await Js({
            method: 'Aux.pickDirectory',
            params: {prompt: 'Choose the default workspace for this Project'},
          });
          if (picked.status === 'cancelled') return;
          if (picked.status === 'unavailable' || !picked.path) {
            de.error('Folder picker is not available on this device.');
            return;
          }
          const path = picked.path.replace(/[/\\]+$/, ''),
            existing = projects.find(R => R.workspacePath.replace(/[/\\]+$/, '') === path);
          if (existing) {
            onValueChange?.(existing.id);
            return;
          }
          const name = projectNameFromPath(path),
            created = await createProject.mutateAsync({
              accountId,
              id: uniqueProjectId(name, projectsQuery.data?.map(R => R.id) ?? []),
              name,
              workspacePath: path,
            });
          (await queryClient.invalidateQueries(trpc.projects.list.queryFilter({accountId})),
            onValueChange?.(created.id));
        } catch (error) {
          (de.error(error instanceof Error ? error.message : 'There was an error creating the Project.'),
            console.error(error));
        }
      },
      closeCreate = () => {
        setCreating(false);
      };
    if (!onValueChange && variant === 'toolbar')
      return (0, a.jsx)(J, {
        className: 'text-muted-foreground pointer-events-none',
        variant: 'ghost',
        size,
        shape: 'pill',
        tabIndex: -1,
        children: (0, a.jsx)(ws, {project: selected}),
      });
    const Menu = variant === 'submenu' ? li : It,
      MenuContent = variant === 'submenu' ? ki : gt;
    return (0, a.jsxs)(a.Fragment, {
      children: [
        (0, a.jsxs)(Menu, {
          children: [
            variant === 'submenu'
              ? (0, a.jsxs)(ei, {
                  disabled: !onValueChange,
                  children: [
                    (0, a.jsx)(Sa, {className: 'text-muted-foreground'}),
                    (0, a.jsx)('span', {className: 'grow', children: 'Projects'}),
                    selected &&
                      (0, a.jsx)('span', {
                        className: 'text-muted-foreground max-w-28 truncate',
                        children: selected.name,
                      }),
                  ],
                })
              : (0, a.jsxs)(Ae, {
                  children: [
                    (0, a.jsx)(Pe, {
                      render: (0, a.jsx)('span', {className: 'inline-flex min-w-0'}),
                      children: (0, a.jsx)(Vt, {
                        render: (0, a.jsx)(J, {
                          className: 'text-muted-foreground',
                          variant: 'ghost',
                          size,
                          shape: 'pill',
                        }),
                        children: (0, a.jsx)(ws, {project: selected}),
                      }),
                    }),
                    (0, a.jsx)(Ie, {className: 'flex items-center gap-1.5', children: 'Work in Project'}),
                  ],
                }),
            (0, a.jsxs)(MenuContent, {
              size: 'sm',
              className: 'w-56',
              children: [
                (0, a.jsxs)(ft, {
                  children: [
                    (0, a.jsx)(Zs, {children: 'Projects'}),
                    (0, a.jsx)(Os, {
                      value: value ?? '',
                      onValueChange: select,
                      children: projects.map(y =>
                        (0, a.jsx)(ProjectMenuItem, {project: y, selected: value === y.id, onDeselect: clear}, y.id),
                      ),
                    }),
                  ],
                }),
                (0, a.jsx)(_t, {}),
                (0, a.jsxs)(ft, {
                  children: [
                    (0, a.jsxs)(We, {
                      onClick: useExistingFolder,
                      children: [
                        (0, a.jsx)(or, {className: 'text-muted-foreground'}),
                        (0, a.jsx)('span', {children: 'Use an existing folder'}),
                      ],
                    }),
                    (0, a.jsxs)(We, {
                      closeOnClick: variant !== 'submenu',
                      onClick: startFromScratch,
                      children: [
                        (0, a.jsx)(_s, {className: 'text-muted-foreground'}),
                        (0, a.jsx)('span', {children: 'Start from scratch'}),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, a.jsx)(Hs, {
          open: creating,
          onOpenChange: setCreating,
          children: (0, a.jsx)(Gs, {
            className: 'w-lg max-w-[calc(100%-(--spacing(8)))]!',
            children: creating && (0, a.jsx)(Mi, {accountId, onClose: closeCreate, onCreated: onValueChange}),
          }),
        }),
      ],
    });
  } /** ProjectLabel: the Project button’s icon and name. */,
  ws = ({project}) =>
    (0, a.jsxs)(a.Fragment, {
      children: [
        project
          ? (0, a.jsx)(Xs, {className: 'size-4!', color: project.color, icon: project.icon})
          : (0, a.jsx)(Sa, {className: 'size-4!'}),
        (0, a.jsx)('span', {
          className: 'truncate max-sm:hidden',
          'data-slot': 'agent-session-label',
          children: project?.name ?? 'Project',
        }),
        (0, a.jsx)(mn, {className: 'text-muted-foreground size-3.5! opacity-50', 'data-icon': 'inline-end'}),
      ],
    }),
  ProjectMenuItem = ({project, selected, onDeselect}) =>
    (0, a.jsxs)(Es, {
      value: project.id,
      onClick: selected ? onDeselect : void 0,
      children: [
        (0, a.jsx)(Xs, {className: 'size-4', color: project.color, icon: project.icon}),
        (0, a.jsx)('span', {className: 'truncate', children: project.name}),
      ],
    }),
  projectNameFromPath = path => {
    const trimmed = path.replace(/[/\\]+$/, '');
    return trimmed.split(/[/\\]/).pop() || trimmed;
  } /** A Project id from its name, unique among the ids taken. */,
  uniqueProjectId = (name, ids) => {
    const taken = new Set(ids),
      base = hi(name) || 'project';
    if (!taken.has(base)) return base;
    let suffix = 2;
    for (; taken.has(`${base}-${suffix}`);) suffix += 1;
    return `${base}-${suffix}`;
  },
  Rp = ol('status', [
    Tn({status: Nn('on')}),
    Tn({status: Nn('off'), reason: al()}),
    Tn({status: Nn('cooldown'), retryAt: il().finite()}),
  ]);
