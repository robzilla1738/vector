/* Aux-owned source, Settings › Lasso (assets/lasso-LoarCzmz.js, the module body, exported as component):
 * the page for selecting and taking action: the text selection and lasso selection switches, the
 * Lasso hotkey, the sortable shortcut lists, and the dialog that adds or edits a shortcut, with the
 * prompt and URL editors and their {text}, {code} and {image} placeholders. "Lasso says how it
 * works" (vendor/provided/polish/integration.mjs) rewrites a description before this.
 * Names the rest of the chunk uses keep their chunk names: vn the page; t JSX runtime and m React stay
 * as named. Locals named in props keep the prop's name; the rest stay short.
 * Chunk names used: Te/Ee/ke React and JSX runtime, I cn, De Spinner, A useApp, P useTRPC,
 * W useConfirm, G analytics, $e useSuspenseQuery, q useQuery, ze useQueryClient, D/B/X/Q the
 * dropdown parts, Y/Ke/Ge/y/Z/We/L/Be/qe the form and shortcut schemas, C/J/ee/Xe/te/ne the select
 * parts, re more, Ye/et/st/tt/rt/Qe/ot/Je/Ze/nt/at the sortable kit, se Button, it toast, lt/k the
 * platform and modifier labels, ct pending, S/oe/E/T/N/dt/ut the settings kit, pt useUpdateSettings,
 * ae Switch, mt/ie/le/ht/ce/ue/vt/pe the editor kit, xt DocumentTitle, v/de/ft the template tokens,
 * gt cache lasso settings. */
var t = ke(),
  /** The edit icon. */
  EditIcon = ({size = 24, ariaHidden = true, ...r}) =>
    (0, t.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, t.jsx)('path', {
        d: 'M14.5429 3.54323C16.1761 1.91007 18.8239 1.91007 20.4571 3.54323C22.0903 5.1764 22.0903 7.82428 20.4571 9.45745L8.5 21.4146C8.12493 21.7896 7.61622 22.0003 7.08579 22.0003H3C2.44772 22.0003 2 21.5526 2 21.0003V16.9146C2 16.3841 2.21071 15.8754 2.58579 15.5003L12.086 6.00017L18 11.9142L19.4142 10.5L13.5002 4.58596L14.5429 3.54323Z',
        fill: 'currentColor',
      }),
    }),
  m = Te(Ee(), 1),
  UIContext = (0, m.createContext)(null),
  /** The page's dialog state and saving. */
  useUIContext = () => {
    const e = (0, m.use)(UIContext);
    if (!e) throw new Error('useUIContext must be used within a UIContextProvider');
    return e;
  },
  /** Holds the open dialog; saving updates the cached settings and the selection popup's copy. */
  UIContextProvider = ({children}) => {
    const {accountId} = A(),
      [r, s] = (0, m.useState)(null),
      a = P(),
      i = ze(),
      c = pt(),
      l = (0, m.useCallback)(
        u => {
          (gt(accountId, u), i.setQueryData(a.settings.getAll.queryKey({accountId}), p => p && {...p, lasso: u}));
        },
        [accountId, i, a.settings.getAll],
      ),
      d = (0, m.useCallback)(
        async u => {
          const p = await c.mutateAsync(withAccount(accountId, u));
          return (l(p.settings.lasso), p);
        },
        [accountId, l, c],
      );
    return (0, t.jsx)(UIContext, {
      value: {dialog: r, setDialog: s, saveSettings: d, invalidateLassoCache: l},
      children,
    });
  };
function withAccount(e, n) {
  return {accountId: e, ...n};
}
var LASSO_IMAGE = '/assets/aux-lasso-BhzH82rC.webp',
  /** A shortcut's color and icon. */
  ShortcutAppearance = () => {
    const e = L(),
      n = y({control: e.control, name: 'color'}),
      r = y({control: e.control, name: 'icon'}),
      s = We.safeParse(n),
      a = Be.safeParse(r);
    return (0, t.jsx)(Ue, {
      color: s.success ? s.data : 'mono',
      icon: a.success ? a.data : 'sparkles',
      onColorChange: i => e.setValue('color', i),
      onIconChange: i => e.setValue('icon', i),
    });
  },
  /** The placeholders a template can use. */
  PLACEHOLDERS = [
    {id: 'code', label: 'Selected code', token: v.CODE},
    {id: 'image', label: 'Selected image', token: v.IMAGE},
    {id: 'text', label: 'Selected text', token: v.TEXT},
  ],
  /** Any placeholder in text. */
  PLACEHOLDER_TOKENS = /\{code\}|\{image\}|\{text\}/g,
  POPUP_GAP_PX = 8,
  POPUP_MARGIN_PX = 12,
  POPUP_WIDTH_PX = 280,
  /** The placeholders a shortcut type allows in a prompt. */
  promptTokens = e => de(e, 'prompt'),
  /** The placeholders a shortcut type allows in a URL. */
  urlTokens = e => de(e, 'open-url'),
  placeholderExtension = e => ht.configure({placeholder: e}),
  /** Enter does nothing in a URL field. */
  singleLineExtension = () =>
    mt.create({
      name: 'single-line-url-field',
      addKeyboardShortcuts() {
        return {Enter: () => true};
      },
    }),
  /** A prompt as an editor document. */
  promptDocument = e => ({
    content: e
      .split(
        `
`,
      )
      .map(n => ({content: templateNodes(n), type: 'paragraph'})),
    type: 'doc',
  }),
  /** A URL as an editor document. */
  urlDocument = e => ({
    content: [{content: templateNodes(e), type: 'paragraph'}],
    type: 'doc',
  }),
  /** Text with its placeholders as mention nodes. */
  templateNodes = e => {
    const n = withoutLineBreaks(e),
      r = [];
    let s = 0;
    for (const a of n.matchAll(PLACEHOLDER_TOKENS)) {
      const i = a[0],
        c = a.index ?? 0;
      (c > s && r.push({text: n.slice(s, c), type: 'text'}),
        r.push({attrs: {id: placeholderId(i), label: placeholderId(i)}, type: 'mention'}),
        (s = c + i.length));
    }
    return (s < n.length && r.push({text: n.slice(s), type: 'text'}), r);
  },
  /** A prompt editor's text. */
  promptText = e =>
    e.state.doc.content.content.map(n =>
      n.content.content
        .map(r =>
          r.type.name === 'mention'
            ? tokenFor(r.attrs.id)
            : r.type.name === 'hardBreak'
              ? `
`
              : (r.text ?? ''),
        )
        .join(''),
    ).join(`
`),
  /** A URL editor's text. */
  urlText = e => {
    const n = e.state.doc.firstChild;
    return n
      ? n.content.content.map(r => (r.type.name === 'mention' ? tokenFor(r.attrs.id) : (r.text ?? ''))).join('')
      : '';
  },
  /** Text on one line. */
  withoutLineBreaks = e => e.replace(/[\r\n]+/g, ''),
  /** A placeholder's token. */
  tokenFor = e => (e === 'code' ? v.CODE : e === 'image' ? v.IMAGE : v.TEXT),
  /** Places the suggestions under the caret, on screen. */
  placeSuggestions = (e, n) => {
    const r = n.clientRect?.();
    if (!e || !r) return;
    const s = window.innerWidth - POPUP_WIDTH_PX - POPUP_MARGIN_PX,
      a = Math.min(Math.max(r.left, POPUP_MARGIN_PX), s);
    Object.assign(e.style, {
      left: `${a}px`,
      top: `${Math.min(r.bottom + POPUP_GAP_PX, window.innerHeight - 48)}px`,
      width: `${POPUP_WIDTH_PX}px`,
    });
  },
  escapeRegExp = e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  /** Escape in an editor does not close the dialog. */
  keepEscape = e => {
    e.key === 'Escape' && e.stopPropagation();
  };
/** A token's placeholder ID. */
function placeholderId(e) {
  return e === v.CODE ? 'code' : e === v.IMAGE ? 'image' : 'text';
}
/** The placeholder suggestions. */
var SuggestionList = ({command, items, ref}) => {
    const s = (0, m.useRef)([]),
      a = (0, m.useRef)(0),
      [i, c] = (0, m.useState)(0);
    return (
      (0, m.useEffect)(() => {
        ((s.current = []), (a.current = 0), c(0));
      }, [items]),
      (0, m.useEffect)(() => {
        s.current[i]?.scrollIntoView({block: 'nearest'});
      }, [i]),
      (0, m.useImperativeHandle)(ref, () => ({
        onKeyDown: ({event}) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            const u = items.length === 0 ? 0 : (a.current + 1) % items.length;
            return ((a.current = u), c(u), true);
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            const u = items.length === 0 ? 0 : (a.current - 1 + items.length) % items.length;
            return ((a.current = u), c(u), true);
          }
          if (event.key !== 'Enter' && event.key !== 'Tab') return false;
          const d = items[a.current];
          return d ? (event.preventDefault(), command(d), true) : false;
        },
      })),
      items.length
        ? (0, t.jsx)('div', {
            className:
              'bg-popover text-popover-foreground max-h-60 overflow-y-auto rounded-xl border px-1 py-1.5 shadow-lg',
            children: items.map((l, d) =>
              (0, t.jsx)(
                'button',
                {
                  ref: itemRef(s, d),
                  type: 'button',
                  className: I(
                    'hover:bg-accent flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-none',
                    d === i && 'bg-accent',
                  ),
                  onClick: chooseItem(command, l),
                  onMouseDown: keepFocus,
                  children: (0, t.jsx)('span', {
                    className: 'min-w-0',
                    children: (0, t.jsx)('span', {className: 'block text-sm font-medium', children: l.label}),
                  }),
                },
                l.id,
              ),
            ),
          })
        : (0, t.jsx)('div', {
            className: 'bg-popover text-muted-foreground rounded-xl border px-3 py-2 text-sm shadow-lg',
            children: 'No placeholders found',
          })
    );
  },
  /** Mounts the suggestions in the page. */
  suggestionRenderer = () => {
    let e = null,
      n = null;
    return {
      onExit: () => {
        (n?.destroy(), e?.remove());
      },
      onKeyDown: r => (r.event.key === 'Escape' ? (n?.destroy(), e?.remove(), true) : (n?.ref?.onKeyDown(r) ?? false)),
      onStart: r => {
        ((e = document.createElement('div')),
          (e.className = 'z-50'),
          (e.style.position = 'fixed'),
          document.body.appendChild(e),
          (n = new vt(SuggestionList, {editor: r.editor, props: {command: r.command, items: r.items}})),
          e.appendChild(n.element),
          placeSuggestions(e, r));
      },
      onUpdate: r => {
        (n?.updateProps({command: r.command, items: r.items}), placeSuggestions(e, r));
      },
    };
  },
  itemRef = (e, n) => r => {
    e.current[n] = r;
  },
  chooseItem = (e, n) => () => {
    e(n);
  },
  keepFocus = e => {
    e.preventDefault();
  },
  PROMPT_EDITOR_CLASSES = I(
    'border-input dark:bg-input/30 focus-within:border-ring h-32 overflow-y-auto rounded-lg border px-2.5 py-1 text-sm outline-none',
    '[&>p]:m-0 [&>p]:min-h-6',
    'aria-invalid:border-destructive dark:aria-invalid:border-destructive/50',
  ),
  /** The prompt editor. */
  PromptEditor = () => {
    const e = L(),
      n = y({control: e.control, name: 'action.prompt'}),
      r =
        e.formState.errors.action && 'prompt' in e.formState.errors.action ? e.formState.errors.action.prompt : void 0,
      s = pe({
        content: promptDocument(n ?? ''),
        editorProps: {
          attributes: {class: PROMPT_EDITOR_CLASSES, 'aria-invalid': `${!!r}`},
          handlePaste: (a, i) => {
            const c = i.clipboardData?.getData('text') ?? '';
            return (
              i.preventDefault(),
              !c ||
                !s ||
                s
                  .chain()
                  .focus()
                  .insertContent(promptDocument(c).content ?? [])
                  .run(),
              true
            );
          },
        },
        extensions: a => [
          ...a,
          placeholderExtension(`e.g. Summarize this text: ${v.TEXT}`),
          promptMention(() => e.getValues('type')),
        ],
        onUpdate: ({editor}) => {
          const i = promptText(editor);
          i !== e.getValues('action.prompt') &&
            e.setValue('action.prompt', i, {shouldDirty: true, shouldValidate: true});
        },
      });
    return (
      (0, m.useEffect)(() => {
        if (!s) return;
        const a = n ?? '';
        promptText(s) !== a && s.commands.setContent(promptDocument(a));
      }, [s, n]),
      (0, t.jsxs)(t.Fragment, {
        children: [
          (0, t.jsx)('div', {role: 'presentation', onKeyDown: keepEscape, children: (0, t.jsx)(ue, {editor: s})}),
          (0, t.jsx)('div', {
            className: '-mb-9 min-h-9',
            children: !!r && (0, t.jsx)(He, {className: 'text-xs', errors: [r]}),
          }),
        ],
      })
    );
  },
  /** Placeholders matching what was typed after {. */
  promptSuggestions = (e, n) =>
    PLACEHOLDERS.filter(
      r =>
        promptTokens(e).includes(r.token) &&
        (r.id.includes(n) || r.label.toLowerCase().includes(n) || r.token.toLowerCase().includes(n)),
    ),
  /** Placeholders in a prompt, as chips. */
  promptMention = e =>
    ce
      .extend({
        addAttributes() {
          return {...this.parent?.(), label: {default: null}};
        },
        addInputRules() {
          return PLACEHOLDERS.filter(n => promptTokens(e()).includes(n.token)).map(n =>
            le({
              find: new RegExp(`(${escapeRegExp(n.token)})$`),
              getAttributes: {id: n.id, label: n.label},
              type: this.type,
            }),
          );
        },
      })
      .configure({
        HTMLAttributes: {class: 'inline-flex items-center whitespace-nowrap'},
        deleteTriggerWithBackspace: true,
        renderHTML({options, node}) {
          return [
            'span',
            ie(options.HTMLAttributes, {
              class:
                'bg-brand/20 text-brand-content -mt-[0.1em] inline-flex items-center rounded-sm px-[0.2em] py-[0.1em] align-middle font-mono text-[0.9em] leading-4 font-medium',
              'data-prompt-template-token': node.attrs.id,
            }),
            tokenFor(node.attrs.id),
          ];
        },
        renderText({node}) {
          return tokenFor(node.attrs.id);
        },
        suggestion: {
          allowedPrefixes: null,
          char: '{',
          command: ({editor, range, props}) => {
            (editor
              .chain()
              .focus()
              .insertContentAt(range, {
                attrs: {id: props.id, label: props.id, mentionSuggestionChar: '{'},
                type: 'mention',
              })
              .run(),
              editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd());
          },
          items: ({query}) => promptSuggestions(e(), query.toLowerCase()),
          render: suggestionRenderer,
        },
      }),
  URL_EDITOR_CLASSES = I(
    'border-input dark:bg-input/30 focus-within:border-ring h-8 [scrollbar-width:none] overflow-x-auto overflow-y-hidden rounded-lg border px-2.5 py-1 text-sm break-normal [overflow-wrap:normal] whitespace-nowrap outline-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
    '[&>p]:m-0 [&>p]:min-h-6 [&>p]:w-max [&>p]:break-normal [&>p]:[overflow-wrap:normal] [&>p]:whitespace-nowrap',
  ),
  /** The URL editor. */
  UrlEditor = () => {
    const e = L(),
      n = y({control: e.control, name: 'type'}),
      r = y({control: e.control, name: 'action.href'}),
      s = pe({
        content: urlDocument(r ?? ''),
        editorProps: {
          attributes: {class: URL_EDITOR_CLASSES},
          handlePaste: (a, i) => {
            const c = withoutLineBreaks(i.clipboardData?.getData('text') ?? '');
            return (i.preventDefault(), !c || !s || s.chain().focus().insertContent(templateNodes(c)).run(), true);
          },
        },
        extensions: a => [
          ...a,
          placeholderExtension('e.g. https://google.com?q={text}'),
          urlMention(() => n),
          singleLineExtension(),
        ],
        onUpdate: ({editor}) => {
          const i = urlText(editor);
          i !== e.getValues('action.href') && e.setValue('action.href', i, {shouldDirty: true, shouldValidate: true});
        },
      });
    return (
      (0, m.useEffect)(() => {
        if (!s) return;
        const a = r ?? '';
        urlText(s) !== a && s.commands.setContent(urlDocument(a));
      }, [s, r]),
      (0, t.jsx)('div', {role: 'presentation', onKeyDown: keepEscape, children: (0, t.jsx)(ue, {editor: s})})
    );
  },
  /** Placeholders matching what was typed after {. */
  urlSuggestions = (e, n) =>
    PLACEHOLDERS.filter(
      r =>
        urlTokens(e).includes(r.token) &&
        (r.id.includes(n) || r.label.toLowerCase().includes(n) || r.token.toLowerCase().includes(n)),
    ),
  /** Placeholders in a URL, as chips. */
  urlMention = e =>
    ce
      .extend({
        addAttributes() {
          return {...this.parent?.(), label: {default: null}};
        },
        addInputRules() {
          return PLACEHOLDERS.filter(n => urlTokens(e()).includes(n.token)).map(n =>
            le({
              find: new RegExp(`(${escapeRegExp(n.token)})$`),
              getAttributes: {id: n.id, label: n.label},
              type: this.type,
            }),
          );
        },
      })
      .configure({
        HTMLAttributes: {class: 'inline-flex items-center whitespace-nowrap'},
        deleteTriggerWithBackspace: true,
        renderHTML({options, node}) {
          return [
            'span',
            ie(options.HTMLAttributes, {
              class:
                'bg-brand/20 text-brand-content -mt-[0.1em] inline-flex items-center rounded-sm px-[0.2em] py-[0.1em] align-middle font-mono text-[0.9em] leading-4 font-medium',
              'data-url-template-token': node.attrs.id,
            }),
            tokenFor(node.attrs.id),
          ];
        },
        renderText({node}) {
          return tokenFor(node.attrs.id);
        },
        suggestion: {
          allowedPrefixes: null,
          char: '{',
          command: ({editor, range, props}) => {
            (editor
              .chain()
              .focus()
              .insertContentAt(range, {
                attrs: {id: props.id, label: props.id, mentionSuggestionChar: '{'},
                type: 'mention',
              })
              .run(),
              editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd());
          },
          items: ({query}) => urlSuggestions(e(), query.toLowerCase()),
          render: suggestionRenderer,
        },
      }),
  /** The add or edit dialog; Escape does not close it. */
  ShortcutDialog = () => {
    const {dialog, setDialog} = useUIContext(),
      [r, s] = (0, m.useState)(false),
      a = (l, d) => {
        (!l && d.reason === 'escape-key') || l || s(false);
      },
      i = l => {
        l || setDialog(null);
      },
      c = () => {
        s(false);
      };
    return (
      (0, m.useEffect)(() => {
        dialog && s(true);
      }, [dialog]),
      (0, t.jsx)(Pe, {
        open: r,
        onOpenChange: a,
        onOpenChangeComplete: i,
        children: (0, t.jsxs)(Ve, {
          children: [
            (0, t.jsx)(Me, {
              className: 'sr-only',
              children: (0, t.jsxs)(Ne, {
                children: [
                  dialog?.view === 'add' && 'Add shortcut',
                  dialog?.view === 'edit' && `Edit ${dialog.data.name}`,
                ],
              }),
            }),
            dialog &&
              (0, t.jsx)(ShortcutForm, {
                type: dialog.type,
                defaultValues: dialog.view === 'edit' ? dialog.data : void 0,
                onClose: c,
              }),
          ],
        }),
      })
    );
  },
  /** The shortcut form. */
  ShortcutForm = ({type, defaultValues, onClose}) => {
    const {accountId} = A(),
      a = P(),
      {saveSettings} = useUIContext(),
      {data} = q(a.settings.getAll.queryOptions({accountId}, {select: h => h.lasso})),
      l = Ge({
        mode: 'all',
        resolver: Ke(ft),
        defaultValues: defaultValues ?? {
          id: crypto.randomUUID(),
          type,
          color: 'mono',
          icon: 'sparkles',
          name: '',
          action: {type: 'prompt', prompt: ''},
        },
      }),
      d = y({control: l.control, name: 'action.type'}),
      u = async h => {
        try {
          const j = data?.shortcuts ?? [];
          let o = j.filter(f => f.type === 'text-selection'),
            x = j.filter(f => f.type === 'lasso');
          (defaultValues && h.type === 'text-selection' && (o = o.map(f => (f.id === defaultValues.id ? h : f))),
            defaultValues && h.type === 'lasso' && (x = x.map(f => (f.id === defaultValues.id ? h : f))),
            !defaultValues && h.type === 'text-selection' && o.push(h),
            !defaultValues && h.type === 'lasso' && x.push(h));
          const g = [...o, ...x];
          (await saveSettings({key: 'lasso', value: {...data, shortcuts: g}}), onClose());
        } catch (j) {
          (it.error('There was an error while processing the request.'), console.error(j));
        }
      },
      p = Object.keys(l.formState.errors).length > 0 || l.formState.isSubmitting;
    return (0, t.jsxs)(qe, {
      ...l,
      children: [
        (0, t.jsxs)('form', {
          id: 'shortcut-form',
          className: 'space-y-6',
          onSubmit: l.handleSubmit(u),
          children: [
            (0, t.jsxs)('div', {
              className: 'flex items-center gap-2',
              children: [
                (0, t.jsx)(ShortcutAppearance, {}),
                (0, t.jsx)(Fe, {
                  ...l.register('name'),
                  placeholder: 'e.g. Summarize',
                  'data-invalid': l.formState.errors.name,
                }),
              ],
            }),
            (0, t.jsxs)(Re, {
              className: 'gap-2',
              children: [
                (0, t.jsxs)(U, {
                  children: [
                    (0, t.jsx)(Oe, {className: 'text-muted-foreground text-xs', children: 'Action'}),
                    (0, t.jsx)(ActionSelect, {}),
                  ],
                }),
                (0, t.jsxs)(U, {
                  children: [
                    d === 'prompt' && (0, t.jsx)(PromptEditor, {}),
                    d === 'open-url' && (0, t.jsx)(UrlEditor, {}),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, t.jsxs)(_e, {
          children: [
            (0, t.jsx)(Ae, {disabled: l.formState.isSubmitting, children: 'Cancel'}),
            (0, t.jsxs)(Ie, {
              type: 'submit',
              form: 'shortcut-form',
              disabled: p,
              children: [
                l.formState.isSubmitting && (0, t.jsx)(De, {}),
                (0, t.jsx)('span', {children: defaultValues ? 'Update' : 'Save'}),
              ],
            }),
          ],
        }),
      ],
    });
  },
  /** What a shortcut does. */
  ActionSelect = () => {
    const e = L(),
      n = y({control: e.control, name: 'action.type'}),
      r = s => {
        if (s) {
          if (s === 'prompt') {
            e.setValue('action', {type: 'prompt', prompt: ''});
            return;
          }
          if (s === 'open-url') {
            e.setValue('action', {type: 'open-url', href: ''});
            return;
          }
          e.setValue('action', {type: s});
        }
      };
    return (0, t.jsxs)(ne, {
      value: n,
      onValueChange: r,
      children: [
        (0, t.jsx)(ee, {className: 'w-full', children: (0, t.jsx)(te, {})}),
        (0, t.jsx)(J, {children: ACTION_TYPES.map(s => (0, t.jsx)(C, {value: s.value, children: s.label}, s.value))}),
      ],
    });
  },
  ACTION_TYPES = [
    {label: 'Prompt', value: 'prompt'},
    {label: 'Open URL', value: 'open-url'},
    {label: 'Copy', value: 'copy'},
  ],
  /** A drag-to-reorder list. */
  SortableList = ({items, onDragEnd, children}) => {
    const s = st(Ye(et, {activationConstraint: {distance: 4}})),
      a = i => {
        const c = String(i.active.id),
          l = i.over ? String(i.over.id) : null;
        if (!l || c === l) return;
        const d = items.findIndex(p => p === c),
          u = items.findIndex(p => p === l);
        d === -1 || u === -1 || d === u || onDragEnd(nt(items, d, u));
      };
    return (0, t.jsx)(rt, {
      sensors: s,
      collisionDetection: at,
      onDragEnd: a,
      children: (0, t.jsx)(ot, {items, strategy: Qe, children}),
    });
  },
  /** A sortable row. */
  SortableRow = ({className, id, disabled, children, ...a}) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = Je({id, disabled});
    return (0, t.jsxs)(E, {
      ref: setNodeRef,
      className: I(
        'group/shortcut-row relative min-h-auto touch-none gap-1',
        isDragging && 'bg-brand/10 text-brand-content z-1 backdrop-blur-sm',
        className,
      ),
      style: {
        transform: tt.Transform.toString(transform ? {...transform, x: 0} : null),
        transition,
        zIndex: isDragging ? 1 : void 0,
      },
      ...a,
      children: [(0, t.jsx)(DragHandle, {...attributes, ...listeners, disabled}), children],
    });
  },
  /** A row's drag handle. */
  DragHandle = e =>
    (0, t.jsx)('button', {
      type: 'button',
      className:
        'absolute top-1/2 left-0 -translate-y-1/2 cursor-grab opacity-0 group-hover/shortcut-row:opacity-100 active:cursor-grabbing',
      ...e,
      children: (0, t.jsx)(Ze, {className: 'text-muted-foreground size-3.5'}),
    }),
  /** The page body. */
  LassoSettings = () =>
    (0, t.jsxs)(t.Fragment, {
      children: [(0, t.jsx)(LassoSections, {}), (0, t.jsx)(ShortcutDialog, {})],
    }),
  /** The sections, from the settings. */
  LassoSections = () => {
    const {accountId} = A(),
      n = P(),
      {data} = $e(n.settings.getAll.queryOptions({accountId}, {select: s => s.lasso}));
    return (0, t.jsxs)('div', {
      className: 'space-y-8',
      children: [
        (0, t.jsx)(LassoIntro, {}),
        (0, t.jsx)(TextSelectionSection, {settings: data}),
        (0, t.jsx)(LassoSelectionSection, {settings: data}),
        (0, t.jsx)(LassoSync, {}),
      ],
    });
  },
  /** The introduction. */
  LassoIntro = () =>
    (0, t.jsx)(T, {
      children: (0, t.jsxs)(E, {
        className: 'items-stretch gap-2.5 p-1',
        children: [
          (0, t.jsx)('div', {
            className: 'flex min-w-0 flex-1 flex-col px-3.5 py-3',
            children: (0, t.jsx)(S, {
              title: (0, t.jsx)('span', {className: 'text-base', children: 'Select and take action'}),
              description: (0, t.jsx)('span', {
                className: 'text-sm',
                children: 'Drag over text or draw a circle to ask a question or run a shortcut in seconds.',
              }),
            }),
          }),
          (0, t.jsx)('img', {
            src: LASSO_IMAGE,
            alt: 'Lasso selecting an image',
            className: 'pointer-events-none w-72 shrink-0 rounded-[10px] object-cover select-none',
          }),
        ],
      }),
    }),
  /** Text selection and its shortcuts. */
  TextSelectionSection = ({settings}) => {
    const {capture} = G(),
      {confirm} = W(),
      {setDialog, saveSettings} = useUIContext(),
      i = settings.shortcuts.filter(o => o.type === 'text-selection'),
      c = new Map(i.map(o => [o.id, o])),
      l = settings.shortcuts.filter(o => o.type !== 'text-selection'),
      d = o => {
        saveSettings({key: 'lasso', value: {...settings, textSelectionEnabled: o}});
      },
      u = o => {
        const x = [...o.map(g => c.get(g)), ...l];
        saveSettings({key: 'lasso', value: {...settings, shortcuts: x}});
      },
      p = o => () => {
        setDialog({view: 'edit', type: o.type, data: o});
      },
      h = () => {
        (capture('settings.personalize.create-lasso', {value: 'on-text'}),
          setDialog({view: 'add', type: 'text-selection'}));
      },
      j = o => () => {
        confirm(
          {
            title: `Are you sure you want to delete '${o.name}'?`,
            description: 'This action cannot be undone.',
            ui: {variant: 'destructive', action: 'Delete'},
          },
          async () => {
            saveSettings({key: 'lasso', value: {...settings, shortcuts: [...i.filter(x => x.id !== o.id), ...l]}});
          },
        );
      };
    return (0, t.jsxs)(oe, {
      title: 'Text selection',
      children: [
        (0, t.jsx)(T, {
          children: (0, t.jsxs)(E, {
            children: [
              (0, t.jsx)(S, {title: 'Enable on text selection', description: 'Select text, then click the blue dot.'}),
              (0, t.jsx)(N, {children: (0, t.jsx)(ae, {checked: settings.textSelectionEnabled, onCheckedChange: d})}),
            ],
          }),
        }),
        (0, t.jsxs)(T, {
          children: [
            (0, t.jsx)(SortableList, {
              items: i.map(o => o.id),
              onDragEnd: u,
              children: i.map(o =>
                (0, t.jsxs)(
                  SortableRow,
                  {
                    id: o.id,
                    children: [
                      (0, t.jsx)(Z, {className: 'size-5 opacity-60', color: o.color, name: o.icon}),
                      (0, t.jsx)(S, {title: o.name}),
                      (0, t.jsxs)(Q, {
                        children: [
                          (0, t.jsx)(B, {
                            render: ({className, ...g}) => (0, t.jsx)(se, {variant: 'ghost', size: 'icon-sm', ...g}),
                            children: (0, t.jsx)(re, {}),
                          }),
                          (0, t.jsxs)(X, {
                            children: [
                              (0, t.jsxs)(D, {
                                onClick: p(o),
                                children: [(0, t.jsx)(EditIcon, {}), (0, t.jsx)('span', {children: 'Edit'})],
                              }),
                              (0, t.jsxs)(D, {
                                variant: 'destructive',
                                onClick: j(o),
                                children: [(0, t.jsx)(Y, {}), (0, t.jsx)('span', {children: 'Delete'})],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  },
                  o.id,
                ),
              ),
            }),
            (0, t.jsx)(AddShortcutButton, {onClick: h}),
          ],
        }),
      ],
    });
  },
  /** Lasso selection and its shortcuts. */
  LassoSelectionSection = ({settings}) => {
    const {capture} = G(),
      {confirm} = W(),
      {setDialog, saveSettings} = useUIContext(),
      i = settings.shortcuts.filter(o => o.type === 'lasso'),
      c = new Map(i.map(o => [o.id, o])),
      l = settings.shortcuts.filter(o => o.type !== 'lasso'),
      d = o => {
        saveSettings({key: 'lasso', value: {...settings, lassoSelectionEnabled: o}});
      },
      u = o => {
        const x = o.map(f => c.get(f)),
          g = [...l, ...x];
        saveSettings({key: 'lasso', value: {...settings, shortcuts: g}});
      },
      p = o => () => {
        setDialog({view: 'edit', type: o.type, data: o});
      },
      h = () => {
        (capture('settings.personalize.create-lasso', {value: 'on-selection'}),
          setDialog({view: 'add', type: 'lasso'}));
      },
      j = o => () => {
        confirm(
          {
            title: `Are you sure you want to delete '${o.name}'?`,
            description: 'This action cannot be undone.',
            ui: {variant: 'destructive', action: 'Delete'},
          },
          async () => {
            saveSettings({key: 'lasso', value: {...settings, shortcuts: [...l, ...i.filter(x => x.id !== o.id)]}});
          },
        );
      };
    return (0, t.jsxs)(oe, {
      title: 'Lasso selection',
      children: [
        (0, t.jsxs)(T, {
          children: [
            (0, t.jsxs)(E, {
              children: [
                (0, t.jsx)(S, {title: 'Enable on lasso selection'}),
                (0, t.jsx)(N, {
                  children: (0, t.jsx)(ae, {checked: settings.lassoSelectionEnabled, onCheckedChange: d}),
                }),
              ],
            }),
            (0, t.jsx)(HotkeyRow, {settings}),
          ],
        }),
        (0, t.jsxs)(T, {
          children: [
            (0, t.jsx)(SortableList, {
              items: i.map(o => o.id),
              onDragEnd: u,
              children: i.map(o =>
                (0, t.jsxs)(
                  SortableRow,
                  {
                    id: o.id,
                    children: [
                      (0, t.jsx)(Z, {className: 'size-5 opacity-60', color: o.color, name: o.icon}),
                      (0, t.jsx)(S, {title: o.name}),
                      (0, t.jsxs)(Q, {
                        children: [
                          (0, t.jsx)(B, {
                            render: ({className, ...g}) => (0, t.jsx)(se, {variant: 'ghost', size: 'icon-sm', ...g}),
                            children: (0, t.jsx)(re, {}),
                          }),
                          (0, t.jsxs)(X, {
                            children: [
                              (0, t.jsxs)(D, {
                                onClick: p(o),
                                children: [(0, t.jsx)(EditIcon, {}), (0, t.jsx)('span', {children: 'Edit'})],
                              }),
                              (0, t.jsxs)(D, {
                                variant: 'destructive',
                                onClick: j(o),
                                children: [(0, t.jsx)(Y, {}), (0, t.jsx)('span', {children: 'Delete'})],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  },
                  o.id,
                ),
              ),
            }),
            (0, t.jsx)(AddShortcutButton, {onClick: h}),
          ],
        }),
      ],
    });
  },
  /** The Lasso hotkey. */
  HotkeyRow = ({settings}) => {
    const {saveSettings} = useUIContext(),
      r = lt(),
      s = {Alt: k('Alt'), Shift: k('Shift'), Control: k('Ctrl'), Meta: k(r ? 'Command' : 'Super')},
      a = i => {
        i && saveSettings({key: 'lasso', value: {...settings, hotkey: i}});
      };
    return (0, t.jsxs)(E, {
      children: [
        (0, t.jsx)(S, {title: 'Hotkey', description: `Press ${s[settings.hotkey]} twice and draw a circle.`}),
        (0, t.jsx)(N, {
          children: (0, t.jsxs)(ne, {
            value: settings.hotkey,
            disabled: !settings.lassoSelectionEnabled,
            onValueChange: a,
            children: [
              (0, t.jsx)(ee, {'aria-label': 'Lasso hotkey', children: (0, t.jsx)(te, {})}),
              (0, t.jsx)(J, {
                children: (0, t.jsxs)(Xe, {
                  className: 'pb-0',
                  children: [
                    (0, t.jsxs)(C, {value: 'Alt', children: [s.Alt, ' + ', s.Alt]}),
                    (0, t.jsxs)(C, {value: 'Shift', children: [s.Shift, ' + ', s.Shift]}),
                    (0, t.jsxs)(C, {value: 'Control', children: [s.Control, ' + ', s.Control]}),
                    (r || settings.hotkey === 'Meta') &&
                      (0, t.jsxs)(C, {value: 'Meta', children: [s.Meta, ' + ', s.Meta]}),
                  ],
                }),
              }),
            ],
          }),
        }),
      ],
    });
  },
  /** Adds a shortcut. */
  AddShortcutButton = e =>
    (0, t.jsxs)(ut, {
      variant: 'action',
      className: 'h-12 w-full',
      render: (0, t.jsx)('button', {...e}),
      children: [(0, t.jsx)(Le, {className: 'ml-0.5 size-4 shrink-0'}), (0, t.jsx)(S, {title: 'Add shortcut'})],
    }),
  /** Keeps the popup's cached shortcuts in step. */
  LassoSync = () => {
    const {accountId} = A(),
      {invalidateLassoCache} = useUIContext(),
      r = P(),
      {data} = q(r.settings.getAll.queryOptions({accountId}, {select: a => a.lasso}));
    return (
      (0, m.useEffect)(() => {
        data && invalidateLassoCache(data);
      }, [invalidateLassoCache, data]),
      null
    );
  };
/** Settings › Lasso. */
function vn() {
  return (0, t.jsxs)(UIContextProvider, {
    children: [
      (0, t.jsx)(xt, {segments: ['Settings', 'Lasso']}),
      (0, t.jsx)(dt, {children: (0, t.jsx)('h1', {children: 'Lasso'})}),
      (0, t.jsx)(m.Suspense, {fallback: (0, t.jsx)(ct, {}), children: (0, t.jsx)(LassoSettings, {})}),
    ],
  });
}
