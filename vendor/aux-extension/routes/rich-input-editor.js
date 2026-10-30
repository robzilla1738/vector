/* Aux-owned source: the RichInput editor and its suggestion popup (assets/provider-Cw0zhujt.js, bo
 * through Co): the popup's lifecycle and fixed position under or above the caret, the editor element
 * with its placeholder, skills and disabled state kept current, a project's enabled skills, RichInput
 * with its parts, and the routine prompt field. Escape closes the popup; a command that the composer
 * handles clears the input.
 * Names the rest of the chunk uses keep their chunk names: bo the suggestion options, Hn useProjectSkills
 * (exported), st RichInput (exported), Co the routine prompt.
 * Chunk names used: c React, r JSX runtime, ua PluginKey, Fn the ghost extension's name, oo the commands,
 * ea a snapshot from JSON, $t the blocked check, Bn dismiss, an/vo react-dom, Ee the root context, Xr
 * mounts the editor, So installs mentions, Zr hydrates skills, $s the app context, Q useTRPC, te useQuery,
 * io a skill's candidate, Xi/so/ro/eo/no/to the root and parts, aa a snapshot from text. */
/** The suggestion options for a trigger: its loader and popup lifecycle. */
  bo = (runtime, trigger, Menu, disposers) => {
    const pluginKey = new ua();
    return {
      allowedPrefixes: trigger.allowedPrefixes,
      char: trigger.char,
      pluginKey,
      items: async ({editor: root, query: menuHandle}) => {
        const container = root.extensionManager.extensions.some(unmount => unmount.name === Fn),
          disposed = await trigger.load({commandCandidates: container ? oo : [], query: menuHandle, runtime});
        return ((runtime.mention.error = disposed.error), disposed.items);
      },
      render: () => {
        let root = null,
          menuHandle = null,
          container = null,
          disposed = false;
        const unmount = () => {
          (root?.unmount(), container?.remove(), (root = null), (menuHandle = null), (container = null));
        };
        disposers.push(() => {
          ((disposed = true), unmount());
        });
        const menuProps = suggestion => ({
          anchor: suggestion.editor.view.dom,
          command: value => {
            if (value.type === 'command' && runtime.callbacks.onCommand?.(value.command)) {
              (suggestion.editor.commands.clearContent(),
                runtime.callbacks.onChange?.(ea(suggestion.editor.getJSON())),
                unmount());
              return;
            }
            suggestion.command(value);
          },
          error: runtime.mention.error,
          isInteractionBlocked: () => $t(runtime),
          items: suggestion.items,
          onDismiss: () => Bn(suggestion.editor.view, pluginKey),
        });
        return {
          onStart: suggestion => {
            disposed ||
              suggestion.editor.isDestroyed ||
              ((runtime.mention.isSuggestionOpen = suggestion.loading || suggestion.items.length > 0),
              (container = document.createElement('div')),
              (container.className = 'z-50'),
              (container.style.position = 'fixed'),
              document.body.appendChild(container),
              (root = (0, vo.createRoot)(container)),
              (0, an.flushSync)(() =>
                root?.render(
                  (0, r.jsx)(Menu, {
                    ...menuProps(suggestion),
                    ref: value => {
                      menuHandle = value;
                    },
                  }),
                ),
              ),
              positionPopup(container, suggestion));
          },
          onUpdate: suggestion => {
            disposed ||
              suggestion.editor.isDestroyed ||
              ((runtime.mention.isSuggestionOpen = suggestion.loading || suggestion.items.length > 0),
              (0, an.flushSync)(() =>
                root?.render(
                  (0, r.jsx)(Menu, {
                    ...menuProps(suggestion),
                    ref: value => {
                      menuHandle = value;
                    },
                  }),
                ),
              ),
              positionPopup(container, suggestion));
          },
          onKeyDown: suggestion => {
            if (suggestion.event.key === 'Escape') return (unmount(), true);
            if ($t(runtime)) return false;
            const value = menuHandle?.onKeyDown(suggestion) ?? false;
            return (
              suggestion.event.key === 'Enter' && value && (runtime.mention.suppressSubmitUntil = Date.now() + 500),
              value
            );
          },
          onExit: () => {
            ((runtime.mention.isSuggestionOpen = false), unmount());
          },
        };
      },
    };
  },
  /** Places the popup below the caret, or above it when that fits better. */
  positionPopup = (container, suggestion) => {
    if (!container) return;
    const anchor = suggestion.editor.view.dom,
      rect = suggestion.clientRect?.() ?? anchor.getBoundingClientRect();
    if (!rect) {
      container.style.display = 'none';
      return;
    }
    requestAnimationFrame(() => {
      if (!container.isConnected) return;
      const maxWidth = Math.max(0, window.innerWidth - 24),
        width = Math.min(maxWidth, 360, Math.max(280, anchor.offsetWidth || 320)),
        height = container.offsetHeight || 56,
        left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12)),
        spaceBelow = window.innerHeight - rect.bottom - 12,
        spaceAbove = rect.top - 12,
        top =
          spaceBelow >= height || spaceBelow >= spaceAbove
            ? Math.min(rect.bottom + 8, window.innerHeight - height - 12)
            : Math.max(12, rect.top - height - 8);
      Object.assign(container.style, {display: 'block', left: `${left}px`, top: `${top}px`, width: `${width}px`});
    });
  },
  /** RichInput.Editor. */
  RichInputEditor = props => {
    const {disabled, initialContent, runtime, runtimeVersion} = Ee(),
      containerRef = (0, c.useRef)(null),
      placeholderRef = (0, c.useRef)(props.placeholder),
      [options] = (0, c.useState)(() => ({...props, initialContent, placeholder: () => placeholderRef.current ?? ''})),
      [editor, setEditor] = (0, c.useState)(null),
      skillsHydrated = (0, c.useRef)(false);
    return (
      (0, c.useEffect)(() => {
        if (!containerRef.current) return;
        const {editor: mounted} = Xr(containerRef.current, runtime, options),
          unmountMentions = So(mounted, runtime, options.mentionMenu);
        return (
          (skillsHydrated.current = false),
          setEditor(mounted),
          () => {
            (unmountMentions(), mounted.destroy());
          }
        );
      }, [options, runtime]),
      (0, c.useEffect)(() => {
        editor && !editor.isDestroyed && editor.setEditable(!disabled);
      }, [disabled, editor]),
      (0, c.useEffect)(() => {
        ((placeholderRef.current = props.placeholder),
          !(!editor || editor.isDestroyed) &&
            editor.view.dispatch(editor.state.tr.setSelection(editor.state.selection)));
      }, [editor, props.placeholder]),
      (0, c.useEffect)(() => {
        !editor ||
          editor.isDestroyed ||
          !runtime.mention.skillsLoaded ||
          skillsHydrated.current ||
          ((skillsHydrated.current = true), Zr(editor, runtime, initialContent));
      }, [editor, initialContent, runtime, runtimeVersion]),
      (0, r.jsx)('div', {className: 'relative', children: (0, r.jsx)('div', {ref: containerRef})})
    );
  },
  /** A project's enabled skills as mention candidates. */
  Hn = ({projectId, enabled = true}) => {
    const accountId = $s()?.accountId,
      trpc = Q(),
      {data, isFetched} = te({
        ...trpc.projects.listSkills.queryOptions({projectId, accountId: accountId ?? -1}),
        enabled: enabled && accountId !== void 0,
      }),
      skills = (0, c.useMemo)(() => (data ?? []).filter(skill => skill.enabled).map(io), [data]);
    return {isLoaded: data !== void 0 || isFetched, skills};
  },
  /** RichInput with its parts. */
  st = Object.assign(Xi, {
    Editor: RichInputEditor,
    FilePaste: so,
    Keymap: ro,
    SkillMentions: eo,
    SubmitOnEnter: no,
    TabMentions: to,
  }),
  /** The routine prompt field. */
  Co = ({projectId, className, initialPrompt, onChange, disabled = false}) => {
    const [initialSnapshot] = (0, c.useState)(() => aa(initialPrompt)),
      skills = Hn({projectId});
    return (0, r.jsxs)(st, {
      disabled,
      initialSnapshot,
      onChange: snapshot => onChange(snapshot.plainText),
      children: [
        (0, r.jsx)(st.SkillMentions, {value: skills}),
        (0, r.jsx)(st.Editor, {
          className,
          placeholder: 'Tell Aux what to do when this routine runs. Use $ to mention skills.',
        }),
      ],
    });
  }
