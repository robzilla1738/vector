/* Aux-owned source, the selection popup (assets/lasso-Chg_FuP-.js, the module body, exported as
 * component): the small popup a text selection or a lasso region opens over a page. It lists the
 * shortcuts for the selection, runs an instruction and streams the answer, keeps a short chat,
 * copies, and applies the answer back into the page.
 * Names the rest of the chunk uses keep their chunk names: xt the route; l React and t JSX runtime
 * stay as named.
 * Chunk names used: X/J/Q React and JSX runtime, K cn, R the route, Z useFramedMessaging, D Spinner,
 * ee useClipboard, te/se the form resolver and useForm, re ShortcutIcon, ne arrow up, oe circle-x,
 * ae Markdown, ie the settings icon, j Button, A toast, ce/le schema builders, ue ScrollArea,
 * pe the extension page URL, de motion, me AnimatePresence, fe useComposedRefs, xe onMessage,
 * he useSendMessage, ye the send-message provider, ge/k the template checks and placeholders,
 * Pe/Se/ve/Ce the shortcuts, their URL, their template values and loading them.
 * Aux changes: the popup takes the 12px popover corner (rounded-xl), and the instruction field's
 * resting fill follows --muted in light mode (it was a fixed neutral-100). */
var l = X(J(), 1);
/** A region instruction always carries the image, even when not written. */
function withRegionImage(text, selection) {
  const trimmed = text.trim();
  return selection.selectionKind !== 'region' || !selection.previewImage?.trim() || trimmed.includes(k.IMAGE)
    ? trimmed
    : `${trimmed}
${k.IMAGE}`;
}
/** The background port transforms stream over. */
var TRANSFORM_PORT = 'lasso:transform';
/** Streams a transform from the background; resolves when it completes, rejects on an error, a disconnect or an abort. */
async function streamTransform(request, options) {
  const {signal, onChunk} = options;
  await new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }
    const port = chrome.runtime.connect({name: TRANSFORM_PORT});
    let settled = false;
    const cleanup = () => {
        (port.onMessage.removeListener(onMessage),
          port.onDisconnect.removeListener(onDisconnect),
          signal?.removeEventListener('abort', onAbort));
      },
      settle = finish => {
        settled || ((settled = true), cleanup(), finish());
      },
      onMessage = message => {
        switch (message.type) {
          case 'lasso:transform:chunk':
            onChunk(message.chunk);
            return;
          case 'lasso:transform:complete':
            settle(resolve);
            return;
          case 'lasso:transform:error':
            settle(() => reject(new Error(message.error)));
            return;
          default:
            return;
        }
      },
      onDisconnect = () => {
        if (settled) return;
        const error = chrome.runtime.lastError?.message || 'Lasso transform disconnected.';
        settle(() => reject(new Error(error)));
      },
      onAbort = () => {
        try {
          port.postMessage({type: 'lasso:transform:abort'});
        } catch {}
        settle(() => reject(new DOMException('The operation was aborted.', 'AbortError')));
      };
    (port.onMessage.addListener(onMessage),
      port.onDisconnect.addListener(onDisconnect),
      signal?.addEventListener('abort', onAbort, {once: true}),
      port.postMessage({type: 'lasso:transform:start', request}));
  });
}
var t = Q(),
  /** No selection yet. */
  EMPTY_SELECTION = {
    text: '',
    selectionKind: 'text',
    canApply: false,
    requestKey: '',
    sourceKind: 'document',
    focusPolicy: 'preserve-selection',
  },
  SelectionPopupContext = (0, l.createContext)(null),
  /** The popup's state: the selection, the chat, the streaming response, and what the page answers. */
  SelectionPopupProvider = ({children}) => {
    const sendMessage = he(),
      {copy} = ee(),
      abortRef = (0, l.useRef)(null),
      [messages, setMessages] = (0, l.useState)([]),
      [selection, setSelection] = (0, l.useState)(EMPTY_SELECTION),
      [response, setResponse] = (0, l.useState)(''),
      [errorMessage, setErrorMessage] = (0, l.useState)(''),
      [isStreaming, setStreaming] = (0, l.useState)(false),
      [isApplying, setApplying] = (0, l.useState)(false),
      [isCopyingCode, setCopyingCode] = (0, l.useState)(false),
      reset = () => {
        (abortRef.current?.abort(),
          (abortRef.current = null),
          setMessages([]),
          setSelection(EMPTY_SELECTION),
          setResponse(''),
          setErrorMessage(''),
          setStreaming(false),
          setApplying(false),
          setCopyingCode(false));
      },
      runInstruction = async (instruction, options) => {
        const text = instruction.trim();
        if (!text || !selection.text.trim() || isStreaming) return;
        abortRef.current?.abort();
        const controller = new AbortController(),
          last = messages.at(-1),
          nextMessages = [
            ...(response.trim() !== '' && (last?.role !== 'assistant' || last.content !== response)
              ? [...messages, {role: 'assistant', content: response}]
              : messages),
            {role: 'user', content: text, displayContent: options?.displayContent?.trim() || void 0},
          ],
          {canApply: _canApply, focusPolicy: _focusPolicy, requestKey: _requestKey, ...requestSelection} = selection;
        ((abortRef.current = controller),
          setMessages(nextMessages),
          setResponse(''),
          setErrorMessage(''),
          setStreaming(true));
        let streamed = '';
        try {
          (await streamTransform(
            {selection: requestSelection, messages: nextMessages.map(({role, content}) => ({role, content}))},
            {
              signal: controller.signal,
              onChunk: chunk => {
                ((streamed += chunk), setResponse(streamed));
              },
            },
          ),
            setMessages([...nextMessages, {role: 'assistant', content: streamed}]));
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
          setErrorMessage(error instanceof Error ? error.message : 'Failed to generate a response.');
        } finally {
          (abortRef.current === controller && (abortRef.current = null), setStreaming(false));
        }
      },
      close = () => {
        sendMessage({type: 'SELECTION_POPUP_CLOSE'});
      },
      copyCode = () => {
        selection.selectionKind !== 'region' ||
          isCopyingCode ||
          (setCopyingCode(true), sendMessage({type: 'SELECTION_POPUP_COPY_CODE'}));
      },
      copyValue = async value => {
        const text = value.trim();
        if (!text || isCopyingCode) return;
        setCopyingCode(true);
        const copied = await copy(text);
        (setCopyingCode(false), copied ? close() : A.error('Failed to copy.'));
      },
      applyResponse = () => {
        const text = response.trim();
        !selection.canApply ||
          !text ||
          isApplying ||
          (setApplying(true), sendMessage({type: 'SELECTION_POPUP_APPLY', replacement: text}));
      },
      focusPopup = () => {
        selection.focusPolicy !== 'popup-focused' &&
          sendMessage({type: 'SELECTION_POPUP_FOCUS_POLICY', focusPolicy: 'popup-focused'});
      },
      releaseFocus = () => {
        selection.focusPolicy === 'popup-focused' &&
          sendMessage({type: 'SELECTION_POPUP_FOCUS_POLICY', focusPolicy: 'preserve-selection'});
      };
    return (
      xe(incoming => {
        const message = incoming;
        if (message)
          switch (message.type) {
            case 'SELECTION_POPUP_SYNC': {
              selection.requestKey !== message.requestKey && reset();
              const {type, ...sync} = message;
              setSelection(sync);
              return;
            }
            case 'SELECTION_POPUP_RESET':
              reset();
              return;
            case 'SELECTION_POPUP_APPLY_RESULT':
              (setApplying(false), !message.success && message.error && A.error(message.error));
              return;
            case 'SELECTION_POPUP_SHOW_RESULT':
              (setMessages([
                {role: 'user', content: message.displayContent},
                {role: 'assistant', content: message.response},
              ]),
                setResponse(message.response));
              return;
            case 'SELECTION_POPUP_COPY_CODE_RESULT':
              (setCopyingCode(false), !message.success && message.error && A.error(message.error));
              return;
          }
      }),
      (0, l.useEffect)(
        () => () => {
          abortRef.current?.abort();
        },
        [],
      ),
      (0, t.jsx)(SelectionPopupContext, {
        value: {
          mode: messages.length > 0 ? 'chat' : 'main',
          messages,
          selection,
          response,
          errorMessage,
          isApplying,
          isCopyingCode,
          isStreaming,
          focusPopup,
          releaseFocus,
          applyResponse,
          copyCode,
          copyValue,
          close,
          runInstruction,
        },
        children,
      })
    );
  },
  /** The popup state. */
  useSelectionPopup = () => {
    const popup = (0, l.use)(SelectionPopupContext);
    if (!popup) throw new Error('useSelectionPopup must be used within SelectionPopupProvider');
    return popup;
  },
  /** Handlers that act on press, so the page selection is not lost; a click still works from the keyboard. */
  usePressHandlers = onPress => {
    const pressedRef = (0, l.useRef)(false);
    return {
      onPointerDown: event => {
        event.button === 0 && (event.preventDefault(), (pressedRef.current = true), onPress());
      },
      onMouseDown: event => {
        event.button === 0 && (event.preventDefault(), !pressedRef.current && ((pressedRef.current = true), onPress()));
      },
      onClick: () => {
        if (pressedRef.current) {
          pressedRef.current = false;
          return;
        }
        onPress();
      },
    };
  };
/** The route: the framed popup, closing on Escape. */
function xt() {
  const search = R.useSearch(),
    {ref, sendMessage} = Z(search.frameId, 'SELECTION_POPUP_READY');
  return (
    (0, l.useEffect)(() => {
      const onKeyDown = event => {
        event.key === 'Escape' && sendMessage({type: 'SELECTION_POPUP_CLOSE'});
      };
      return (window.addEventListener('keydown', onKeyDown), () => window.removeEventListener('keydown', onKeyDown));
    }, [sendMessage]),
    (0, t.jsx)(ye, {
      value: sendMessage,
      children: (0, t.jsx)(SelectionPopupProvider, {
        children: (0, t.jsx)('div', {
          className: 'w-84 p-2',
          ref,
          children: (0, t.jsx)(me, {
            children: (0, t.jsx)(de.div, {
              className: 'bg-glass bg-popover/95! border-glass overflow-hidden rounded-xl p-2 shadow-md',
              initial: {opacity: 0, y: -10, scale: 0.8, filter: 'blur(8px)'},
              animate: {opacity: 1, y: 0, scale: 1, filter: 'blur(0px)'},
              exit: {opacity: 0, y: 0, scale: 0.8, filter: 'blur(8px)'},
              transition: {duration: 0.15},
              children: (0, t.jsx)(PopupBody, {}),
            }),
          }),
        }),
      }),
    })
  );
}
/** The popup's body. A press outside a field or control gives focus back to the page, so its selection stays. */
var PopupBody = () => {
    const {focusPopup, mode, releaseFocus} = useSelectionPopup(),
      onMouseDownCapture = event => {
        if (isEditable(event.target) || isSelectable(event.target)) return;
        if (isControl(event.target)) {
          (event.preventDefault(), focusPopup());
          return;
        }
        const active = document.activeElement;
        (isEditable(active) && active.blur(), event.preventDefault(), releaseFocus());
      };
    return (0, t.jsxs)('div', {
      onMouseDownCapture,
      children: [
        (0, t.jsx)(PopupHeader, {}),
        mode === 'main' && (0, t.jsx)(Shortcuts, {}),
        mode === 'chat' && (0, t.jsx)(PopupChat, {}),
        (0, t.jsx)(InstructionField, {children: (0, t.jsx)(ApplyButton, {})}),
      ],
    });
  },
  /** Whether a target takes typing. */
  isEditable = target =>
    target instanceof HTMLElement
      ? target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
        ? true
        : target.isContentEditable || !!target.closest('[contenteditable="true"], [contenteditable="plaintext-only"]')
      : false,
  /** Whether a target's text may be selected. */
  isSelectable = target => target instanceof HTMLElement && !!target.closest('[data-selection-popup-selectable]'),
  /** Whether a target is a control. */
  isControl = target => target instanceof HTMLElement && !!target.closest('button, a, [role="button"]'),
  /** Settings and close. */
  PopupHeader = () => {
    const search = R.useSearch(),
      {close} = useSelectionPopup();
    return (0, t.jsxs)('div', {
      className: 'flex h-6 w-full items-center justify-end gap-0.5',
      children: [
        (0, t.jsx)(j, {
          variant: 'ghost',
          size: 'icon-xs',
          shape: 'pill',
          className: 'text-muted-foreground [&_svg]:size-4!',
          render: (0, t.jsx)('a', {
            href: pe(`/u/${search.accountId ?? 'current'}/settings/lasso`),
            target: '_top',
            rel: 'noopener',
          }),
          children: (0, t.jsx)(ie, {}),
        }),
        (0, t.jsx)(j, {
          variant: 'ghost',
          size: 'icon-xs',
          shape: 'pill',
          className: 'text-muted-foreground [&_svg]:size-4!',
          onClick: close,
          children: (0, t.jsx)(oe, {}),
        }),
      ],
    });
  },
  /** Which shortcuts each selection lists. */
  SHORTCUT_TYPES = {text: 'text-selection', region: 'lasso'},
  /** The shortcuts, once the account is known. */
  Shortcuts = () => {
    const accountId = R.useSearch().accountId ?? null;
    return accountId === null
      ? (0, t.jsx)('div', {
          className: 'flex items-center justify-center p-3',
          children: (0, t.jsx)(D, {className: 'size-4'}),
        })
      : (0, t.jsx)(ShortcutList, {accountId});
  },
  /** The shortcuts for this selection. */
  ShortcutList = ({accountId}) => {
    const {selection} = useSelectionPopup(),
      {shortcuts} = Pe(accountId),
      type = SHORTCUT_TYPES[selection.selectionKind],
      matching = shortcuts.filter(shortcut => shortcut.type === type);
    return (
      (0, l.useEffect)(() => {
        Ce(accountId);
      }, [accountId]),
      (0, t.jsx)('div', {
        className: 'flex flex-col items-start gap-0.5 pb-2.5',
        children: matching.map(shortcut => (0, t.jsx)(Shortcut, {shortcut}, shortcut.id)),
      })
    );
  },
  /** A shortcut by what it does. */
  Shortcut = ({shortcut}) => {
    const {selection} = useSelectionPopup(),
      templateValues = ve(shortcut.type, selection),
      {action} = shortcut;
    return action.type === 'prompt'
      ? (0, t.jsx)(PromptShortcut, {shortcut, prompt: action.prompt, templateValues})
      : action.type === 'copy'
        ? (0, t.jsx)(CopyShortcut, {shortcut, templateValues})
        : (0, t.jsx)(LinkShortcut, {shortcut, templateValues});
  },
  /** Runs a prompt. */
  PromptShortcut = ({shortcut, prompt, templateValues}) => {
    const {isStreaming, runInstruction, selection} = useSelectionPopup(),
      disabled = !selection.text.trim() || isStreaming || !ge(prompt, templateValues),
      run = () => {
        runInstruction(prompt, {displayContent: shortcut.name});
      };
    return (0, t.jsx)(ShortcutButton, {shortcut, disabled, onClick: run});
  },
  /** Copies the selection, or the code for a region. */
  CopyShortcut = ({shortcut, templateValues}) => {
    const {copyCode, copyValue, isCopyingCode, selection} = useSelectionPopup();
    if (shortcut.type === 'lasso' && selection.selectionKind === 'region')
      return (0, t.jsx)(ShortcutButton, {shortcut, disabled: isCopyingCode, onClick: copyCode});
    const value = templateValues.selected.trim(),
      copy = () => {
        copyValue(value);
      };
    return (0, t.jsx)(ShortcutButton, {shortcut, disabled: !value || isCopyingCode, onClick: copy});
  },
  /** Opens a link. */
  LinkShortcut = ({shortcut, templateValues}) => {
    const {close} = useSelectionPopup(),
      href = Se(shortcut, {
        selected: encodeURIComponent(templateValues.selected),
        image: encodeURIComponent(templateValues.image),
        text: encodeURIComponent(templateValues.text),
      }),
      onClick = () => {
        window.setTimeout(close, 0);
      };
    return (0, t.jsx)(ShortcutButton, {shortcut, href, disabled: !href, onClick});
  },
  /** A shortcut's button or link. */
  ShortcutButton = ({shortcut, href, disabled, onClick}) =>
    (0, t.jsxs)(j, {
      variant: 'ghost',
      className: K(
        '[&_svg]:text-muted-foreground w-full justify-start rounded-full!',
        href !== void 0 && disabled && 'pointer-events-none opacity-50',
      ),
      disabled,
      render:
        href === void 0
          ? void 0
          : (0, t.jsx)('a', {
              href: href ?? '#',
              target: '_top',
              rel: 'noopener',
              'aria-disabled': disabled ? true : void 0,
            }),
      onClick,
      children: [
        (0, t.jsx)(re, {className: 'size-5', color: shortcut.color, name: shortcut.icon}),
        (0, t.jsx)('span', {className: 'grow text-left', children: shortcut.name}),
      ],
    }),
  /** The chat and the streaming answer. */
  PopupChat = () => {
    const {messages, response, errorMessage} = useSelectionPopup(),
      endRef = (0, l.useRef)(null),
      shown = withStreamingResponse(messages, response);
    return (
      (0, l.useEffect)(() => {
        endRef.current?.scrollIntoView({behavior: 'instant'});
      }, [shown.length, errorMessage, response]),
      (0, t.jsx)('div', {
        className: '-mx-2',
        children: (0, t.jsx)(ue, {
          className: 'h-70 w-full',
          children: (0, t.jsxs)('div', {
            className: 'flex flex-col gap-4 py-3 pr-2 pl-4',
            children: [
              shown.map((message, index) => (0, t.jsx)(ChatMessage, {message}, `${message.role}-${index}`)),
              errorMessage ? (0, t.jsx)('p', {className: 'text-destructive text-sm', children: errorMessage}) : null,
              (0, t.jsx)('div', {ref: endRef}),
            ],
          }),
        }),
      })
    );
  },
  /** A chat message. */
  ChatMessage = ({message}) =>
    message.role === 'user'
      ? (0, t.jsx)('div', {
          className: 'flex w-full justify-end',
          children: (0, t.jsx)('div', {
            className: 'bg-secondary max-w-full rounded-xl px-3 py-1.5 text-sm',
            children: userMessageText(message),
          }),
        })
      : (0, t.jsx)('div', {
          className: 'cursor-text text-sm select-text',
          'data-selection-popup-selectable': true,
          children: (0, t.jsx)(ae, {children: message.content}),
        }),
  /** What a user message shows: its display text, or the prompt without its placeholders. */
  userMessageText = message =>
    message.displayContent
      ? message.displayContent
      : message.content
          .replaceAll(/\{[^}]+\}/g, '')
          .replaceAll(
            /[ \t]+\n/g,
            `
`,
          )
          .replaceAll(
            /\n{3,}/g,
            `

`,
          )
          .trim(),
  /** The messages with the response still streaming. */
  withStreamingResponse = (messages, response) => {
    const last = messages.at(-1);
    return !response || (last?.role === 'assistant' && last.content === response)
      ? messages
      : [...messages, {role: 'assistant', content: response}];
  },
  /** The instruction form. */
  InstructionForm = le({
    message: ce().min(1),
  }),
  /** The instruction field; it takes focus when the chat opens with the popup focused. */
  InstructionField = ({children}) => {
    const {focusPopup, mode, isStreaming, selection, messages, releaseFocus, runInstruction} = useSelectionPopup(),
      inputRef = (0, l.useRef)(null),
      {
        register,
        handleSubmit,
        reset,
        formState: {errors},
      } = se({mode: 'onChange', disabled: isStreaming, resolver: te(InstructionForm), defaultValues: {message: ''}}),
      {ref: formRef, ...field} = register('message'),
      ref = fe(formRef, inputRef),
      submit = usePressHandlers(() => inputRef.current?.form?.requestSubmit()),
      disabled = !selection.text.trim() || Object.keys(errors).length > 0 || isStreaming,
      onSubmit = async values => {
        const text = values.message.trim(),
          instruction = withRegionImage(text, selection);
        (reset({message: ''}), await runInstruction(instruction, {displayContent: text}));
      };
    return (
      (0, l.useEffect)(() => {
        mode === 'main' ||
          selection.focusPolicy !== 'popup-focused' ||
          document.activeElement === inputRef.current ||
          inputRef.current?.focus({preventScroll: true});
      }, [mode, selection.focusPolicy]),
      (0, t.jsx)('div', {
        className: K(
          'dark:bg-secondary bg-muted',
          'border-border-surface flex h-10 w-full items-center rounded-full border px-1 py-0.5',
          'focus-within:border-border-surface-strong transition-colors focus-within:bg-transparent! focus-within:shadow-none',
        ),
        children: (0, t.jsxs)('form', {
          className: 'flex w-full items-center gap-1 py-1 pr-0.5 pl-1',
          onSubmit: handleSubmit(onSubmit),
          children: [
            (0, t.jsx)('input', {
              ...field,
              ref,
              className:
                'placeholder:text-muted-foreground h-7 w-full grow border-none bg-transparent px-1 text-sm ring-0 outline-none',
              placeholder: messages.length === 0 ? 'What would you like to do?' : 'Ask a follow-up',
              onFocus: focusPopup,
              onBlur: releaseFocus,
            }),
            children,
            (0, t.jsx)(j, {
              ...submit,
              type: 'button',
              size: 'icon-sm',
              shape: 'pill',
              disabled,
              children: isStreaming ? (0, t.jsx)(D, {}) : (0, t.jsx)(ne, {}),
            }),
          ],
        }),
      })
    );
  },
  /** Applies the answer to the page, when it can. */
  ApplyButton = () => {
    const {applyResponse, mode, isStreaming, selection, response, isApplying} = useSelectionPopup(),
      press = usePressHandlers(applyResponse);
    return mode !== 'chat' || !selection.canApply
      ? null
      : (0, t.jsx)(j, {
          ...press,
          type: 'button',
          variant: 'secondary',
          size: 'sm',
          shape: 'pill',
          className: 'h-7 px-2.5 text-xs',
          disabled: isStreaming || !response.trim() || isApplying,
          children: isApplying ? (0, t.jsx)(D, {}) : (0, t.jsx)('span', {children: 'Apply'}),
        });
  };
