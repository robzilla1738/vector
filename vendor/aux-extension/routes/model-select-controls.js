/* Aux-owned source: the model and thinking controls (assets/provider-Cw0zhujt.js, Yi through Gi): the
 * two pill triggers, with the model's chevron shown on hover or focus when a thinking level follows
 * it, the thinking label's animated width, the provider icon with a fast-mode bolt, and the pair in a
 * form or composer. Colors: the fast-mode bolt keeps its status sky.
 * Names the rest of the chunk uses keep their chunk names: Wi model trigger, Qi thinking trigger and
 * Ji the pair (exported or used by the routine dialog).
 * Chunk names used: c React, r JSX runtime, L cn, Es reduced motion, he Button, Sn mergeProps, Ar/_t
 * AnimatePresence and motion, ce the chevron, Rn provider icon, Xs lightning bolt, Qr/Yr/qr/Hr model
 * selection, Wr thinking levels, Ys their labels, Bt/Ft/Lt the shortcut tooltip, ue/de tooltip. */
/** Text whose width animates when it changes. */
  AnimatedWidth = ({children, className}) => {
    const contentRef = (0, c.useRef)(null),
      [width, setWidth] = (0, c.useState)();
    return (
      (0, c.useLayoutEffect)(() => {
        const element = contentRef.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.borderBoxSize[0].inlineSize));
        return (observer.observe(element), () => observer.disconnect());
      }, []),
      (0, r.jsx)('span', {
        className: L(
          'inline-flex overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          className,
        ),
        style: {width},
        children: (0, r.jsx)('span', {ref: contentRef, className: 'inline-flex shrink-0 whitespace-nowrap', children}),
      })
    );
  },
  /** The model trigger. */
  Wi = ({model, shortName, showThinkingLevel, open, className, ...props}) => {
    const reducedMotion = Es(),
      [isHovered, setIsHovered] = (0, c.useState)(false),
      [isFocused, setIsFocused] = (0, c.useState)(false),
      showChevron = !showThinkingLevel || isHovered || isFocused || open,
      handleMouseEnter = () => setIsHovered(true),
      handleMouseLeave = () => setIsHovered(false),
      handleBlur = () => setIsFocused(false),
      handleFocus = event => setIsFocused(event.currentTarget.matches(':focus-visible'));
    return (0, r.jsxs)(he, {
      className: L(
        'text-muted-foreground min-w-0 shrink',
        showThinkingLevel && 'pr-0.5 hover:pr-2 focus-visible:pr-2 aria-expanded:pr-2',
        className,
      ),
      'data-model-select-shortcut': 'model',
      shape: 'pill',
      size: 'xs',
      variant: 'ghost',
      ...Sn(
        {onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onBlur: handleBlur, onFocus: handleFocus},
        props,
      ),
      children: [
        (0, r.jsx)(ProviderIcon, {provider: model.provider, fastMode: model.fastMode}),
        (0, r.jsx)('span', {
          className: 'max-w-28 truncate',
          children: shortName?.replace(/^Claude\s+/, '') ?? model.modelId,
        }),
        (0, r.jsx)(Ar, {
          initial: false,
          children:
            showChevron &&
            (0, r.jsx)(
              _t.span,
              {
                className: 'inline-flex',
                initial: {width: 0, marginLeft: -4},
                animate: {width: 14, marginLeft: 0},
                exit: {width: 0, marginLeft: -4},
                transition: {duration: reducedMotion ? 0 : 0.15, ease: 'easeOut'},
                children: (0, r.jsx)(_t.span, {
                  className: 'inline-flex origin-center',
                  initial: {scale: 0},
                  animate: {scale: 1},
                  exit: {scale: 0},
                  transition: {duration: reducedMotion ? 0 : 0.15, ease: 'easeOut'},
                  children: (0, r.jsx)(ce, {
                    'data-slot': 'model-select-chevron',
                    className: 'text-muted-foreground size-3.5! shrink-0 opacity-50',
                  }),
                }),
              },
              'model-chevron',
            ),
        }),
      ],
    });
  },
  /** The thinking level trigger. */
  Qi = ({label, className, ...props}) =>
    (0, r.jsxs)(he, {
      className: L('text-muted-foreground pl-0.5 hover:pl-2 focus-visible:pl-2 aria-expanded:pl-2', className),
      shape: 'pill',
      'data-model-select-shortcut': 'thinking',
      size: 'xs',
      variant: 'ghost',
      ...props,
      children: [
        (0, r.jsx)(AnimatedWidth, {children: label}),
        (0, r.jsx)(ce, {'data-slot': 'model-select-chevron', className: 'text-muted-foreground size-3.5! opacity-50'}),
      ],
    }),
  /** A provider icon, with the fast-mode bolt. */
  ProviderIcon = ({provider, fastMode}) =>
    (0, r.jsxs)('span', {
      className: 'relative size-4 shrink-0',
      children: [
        (0, r.jsx)(Rn, {
          className: 'size-4',
          provider,
          style: fastMode
            ? {maskImage: 'radial-gradient(circle 5px at 12px 12px, transparent 4px, black 5px)'}
            : void 0,
        }),
        fastMode && (0, r.jsx)(Xs, {'aria-label': 'Fast mode', className: 'absolute top-2 left-2 size-2 text-sky-500'}),
      ],
    }),
  /** The model and thinking controls for a value. */
  Ji = ({className, value, onValueChange}) => {
    const handleChange = next => {
      next &&
        onValueChange({
          provider: next.provider,
          modelId: next.modelId,
          thinkingLevel: next.thinkingLevel ?? value.thinkingLevel,
          fastMode: next.fastMode ?? false,
        });
    };
    return (0, r.jsx)('div', {
      className: L(
        '[&_[data-model-select-shortcut=model]]:text-foreground [&_[data-model-select-shortcut=thinking]]:text-muted-foreground [&_[data-slot=model-select-chevron]]:text-muted-foreground flex min-w-0 items-center [&_[data-model-select-shortcut]]:h-auto [&_[data-model-select-shortcut]]:py-1 [&_[data-model-select-shortcut]]:text-sm [&_[data-slot=model-select-chevron]]:size-4! [&_[data-slot=model-select-chevron]]:opacity-100',
        className,
      ),
      children: (0, r.jsx)(Qr, {value, onChange: handleChange, children: (0, r.jsx)(ModelSelectTriggers, {value})}),
    });
  },
  /** The two triggers with their shortcut tooltips. */
  ModelSelectTriggers = ({value}) => {
    const {selectedModel, isOpen} = Yr(),
      hasThinkingLevels = !!(
        selectedModel &&
        (Wr(selectedModel.availableThinkingLevels).length || selectedModel.supportsFastMode)
      );
    return (0, r.jsxs)(r.Fragment, {
      children: [
        (0, r.jsxs)(Bt, {
          shortcut: 'model',
          children: [
            (0, r.jsx)(ue, {
              render: (0, r.jsx)('span', {className: 'inline-flex min-w-0'}),
              children: (0, r.jsx)(qr, {
                menuSize: 'sm',
                render: ({children, ...props}) =>
                  (0, r.jsx)(Wi, {
                    ...props,
                    model: value,
                    shortName: selectedModel?.modelShortName,
                    showThinkingLevel: hasThinkingLevels,
                    open: isOpen,
                  }),
              }),
            }),
            (0, r.jsxs)(de, {children: ['Select model ', (0, r.jsx)(Ft, {children: Lt('Meta+Shift+M')})]}),
          ],
        }),
        (0, r.jsxs)(Bt, {
          shortcut: 'thinking',
          children: [
            (0, r.jsx)(ue, {
              render: (0, r.jsx)('span', {className: 'inline-flex min-w-0'}),
              children: (0, r.jsx)(Hr, {
                menuSize: 'sm',
                render: ({children, ...props}) => (0, r.jsx)(Qi, {...props, label: Ys[value.thinkingLevel]}),
              }),
            }),
            (0, r.jsxs)(de, {children: ['Select thinking level ', (0, r.jsx)(Ft, {children: Lt('Meta+Shift+.')})]}),
          ],
        }),
      ],
    });
  }
