/* Aux-owned source: DropdownMenu and its parts (assets/strip-markdown-DRcmtuJc.js). This block starts
 * inside the chunk's `var` list. Exported here, keeping their chunk names: tm DropdownMenu,
 * nm Trigger, rm Content, om Group, sm Label, im Item, am Sub, lm SubTrigger, um SubContent,
 * cm CheckboxItem, dm RadioGroup, fm RadioItem, jp Separator.
 *
 * Narrow windows (640px and below, or forceNarrow) morph submenus in place: the root menu scales
 * back to 96%, dims its own items, and the submenu grows out of its trigger inside the same popup,
 * with a back row that reopens the parent. Wider windows open submenus beside their trigger.
 *
 * Chunk names used: f React, p JSX runtime, $ cn, Us mergeRefs, md useReducedMotion,
 * cu AnimatePresence, Vt motion; menu primitives gr Root, Hd Trigger, pr Portal, hr Positioner,
 * Kt Popup, Di Group, Od GroupLabel, _i Item, Gi SubmenuRoot, Ki SubmenuTrigger, wd CheckboxItem,
 * Rd CheckboxItemIndicator, Id RadioGroup, Td RadioItem, Ad RadioItemIndicator, fi Separator;
 * icons Ks chevron-right, Sl chevron-left, Au check, ju dot. The menus were already rounded-xl. */
DropdownMenuContext = f.createContext(null),
  DropdownSubmenuContext = f.createContext(null),
  NARROW_QUERY = '(max-width: 640px)',
  NARROW_ROOT_SCALE = 0.96,
  SUBMENU_EXIT_MS = 100,
  SUBMENU_FIT_HEIGHT = 200,
  // The root popup's own rows, not those of a morphed submenu inside it.
  ROOT_ROWS = '[&_:is([role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],input,[data-slot=dropdown-menu-label],[data-slot=dropdown-menu-separator]):not([data-slot=dropdown-menu-sub-content]_*):not([data-slot=dropdown-menu-sub-content])]',
  SUB_TRIGGER_ROW = "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:**:text-accent-foreground focus:**:text-accent-foreground flex min-h-8 cursor-default items-center gap-2 rounded-lg px-2.5 py-1 text-sm outline-hidden select-none in-data-[size=sm]:min-h-7 in-data-[size=sm]:rounded-md in-data-[size=sm]:py-1.5 in-data-[size=sm]:px-1.5 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  MORPH_TRANSITION = {height: {type: 'spring', stiffness: 420, damping: 34}, opacity: {duration: 0.1}, scale: {duration: 0.1}},
  INITIAL_MORPH_LAYOUT = {top: 0, initialHeight: 0, height: 0, maxContentHeight: 32, shouldShiftHeight: false};

function narrowQuery() {
  return typeof window > 'u' ? null : window.matchMedia(NARROW_QUERY);
}

function subscribeNarrow(onChange) {
  const query = narrowQuery();
  return query ? (query.addEventListener('change', onChange), () => query.removeEventListener('change', onChange)) : () => {};
}

function isNarrowViewport() {
  return narrowQuery()?.matches ?? false;
}

/** DropdownMenu: the root. It owns the narrow-morph state its content and submenus share. */
function tm({forceNarrow = false, onOpenChange, onNarrowMorphHeightChange, narrowMorphScale = true, ...props}) {
  const popupRef = f.useRef(null);
  const activeSubmenu = f.useRef(null);
  const fromHeight = f.useRef(void 0);
  const toHeight = f.useRef(void 0);
  const frame = f.useRef(void 0);
  const exitTimer = f.useRef(void 0);
  const onHeightChange = f.useRef(onNarrowMorphHeightChange);
  const [phase, setPhase] = f.useState('idle');
  const [rootHeight, setRootHeightState] = f.useState();
  const narrowViewport = f.useSyncExternalStore(subscribeNarrow, isNarrowViewport, () => false);
  const isNarrow = forceNarrow || narrowViewport;
  const rootScale = narrowMorphScale ? NARROW_ROOT_SCALE : 1;
  onHeightChange.current = onNarrowMorphHeightChange;
  const setRootHeight = f.useCallback(height => {
    setRootHeightState(height), onHeightChange.current?.(height);
  }, []);
  const cancelFrame = () => {
    frame.current !== void 0 && (cancelAnimationFrame(frame.current), frame.current = void 0);
  };
  f.useEffect(() => () => {
    frame.current !== void 0 && cancelAnimationFrame(frame.current), exitTimer.current !== void 0 && clearTimeout(exitTimer.current);
  }, []);
  const deactivateNarrowSubmenu = f.useCallback(submenu => {
    activeSubmenu.current === submenu && (activeSubmenu.current = null, cancelFrame(), setPhase('exiting'));
  }, []);
  // The root animates from the height it had to the height the submenu needs; without the scale-back
  // there is nothing to animate, so it jumps.
  const setNarrowRootHeights = f.useCallback((from, to) => {
    if (fromHeight.current === from && toHeight.current === to) return;
    cancelFrame();
    fromHeight.current = from, toHeight.current = to;
    if (rootScale === 1) {
      setRootHeight(to);
      return;
    }
    setRootHeight(from);
    frame.current = requestAnimationFrame(() => {
      frame.current = void 0, toHeight.current === to && setRootHeight(to);
    });
  }, [rootScale, setRootHeight]);
  const activateNarrowSubmenu = f.useCallback((submenu, details) => {
    const previous = activeSubmenu.current;
    previous !== submenu && (
      exitTimer.current !== void 0 && (clearTimeout(exitTimer.current), exitTimer.current = void 0, setRootHeight(toHeight.current)),
      previous?.close(details), activeSubmenu.current = submenu, setPhase('active'));
  }, [setRootHeight]);
  const completeNarrowSubmenuExit = f.useCallback(() => {
    if (activeSubmenu.current) return;
    cancelFrame();
    const from = fromHeight.current;
    if (from === void 0) {
      setPhase('idle'), setRootHeight(void 0), toHeight.current = void 0;
      return;
    }
    setRootHeight(from);
    exitTimer.current = window.setTimeout(() => {
      exitTimer.current = void 0, setPhase('idle'), setRootHeight(void 0), fromHeight.current = void 0, toHeight.current = void 0;
    }, SUBMENU_EXIT_MS);
  }, [setRootHeight]);
  // Closing the menu drops any morph at once.
  const handleOpenChange = (open, details) => {
    open || (activeSubmenu.current = null, cancelFrame(),
      exitTimer.current !== void 0 && (clearTimeout(exitTimer.current), exitTimer.current = void 0),
      setPhase('idle'), setRootHeight(void 0), fromHeight.current = void 0, toHeight.current = void 0);
    onOpenChange?.(open, details);
  };
  const context = f.useMemo(() => ({
    isNarrow,
    popupRef,
    narrowMorphPhase: phase,
    narrowRootHeight: rootHeight,
    narrowRootScale: rootScale,
    setNarrowRootHeights,
    activateNarrowSubmenu,
    deactivateNarrowSubmenu,
    completeNarrowSubmenuExit,
  }), [activateNarrowSubmenu, completeNarrowSubmenuExit, deactivateNarrowSubmenu, isNarrow, phase, rootHeight, rootScale, setNarrowRootHeights]);
  return (0, p.jsx)(DropdownMenuContext, {value: context, children: (0, p.jsx)(gr, {'data-slot': 'dropdown-menu', onOpenChange: handleOpenChange, ...props})});
}

/** DropdownMenuTrigger. */
function nm({...props}) {
  return (0, p.jsx)(Hd, {'data-slot': 'dropdown-menu-trigger', ...props});
}

/** DropdownMenuContent. `unstyled` drops the popup chrome; while a submenu morphs inside it, the
 * root's own rows dim and the popup follows the height the submenu asks for. */
function rm({align = 'start', alignOffset = 0, side = 'bottom', sideOffset = 4, size = 'md', portalContainer, positionerProps, unstyled = false,
    narrowMorph = !unstyled, className, children, ref, style, ...props}) {
  const root = f.useContext(DropdownMenuContext);
  const popupRef = Us(ref, root?.popupRef);
  const rootScale = root?.narrowRootScale ?? NARROW_ROOT_SCALE;
  const phase = narrowMorph && root?.isNarrow ? root.narrowMorphPhase : 'idle';
  const active = phase === 'active';
  const mounted = phase !== 'idle';
  const {className: positionerClassName, ...positioner} = positionerProps ?? {};
  return (0, p.jsx)(pr, {
    container: portalContainer,
    children: (0, p.jsx)(hr, {
      className: $(!unstyled && 'pointer-events-none isolate z-50 w-max min-w-(--anchor-width) outline-none', positionerClassName),
      align,
      alignOffset,
      side,
      sideOffset,
      ...positioner,
      children: (0, p.jsx)(Kt, {
        ref: popupRef,
        'data-slot': 'dropdown-menu-content',
        'data-size': size,
        'data-narrow-morph-mounted': mounted || void 0,
        'data-narrow-morph-active': active || void 0,
        style: !narrowMorph || root?.narrowRootHeight === void 0 ? style : {...style, height: root.narrowRootHeight, maxHeight: root.narrowRootHeight},
        className: $(
          narrowMorph && [
            'relative',
            active && rootScale < 1 && 'origin-center! scale-[0.96]',
            mounted && 'overflow-visible!',
            phase === 'exiting' ? 'transition-[height,max-height] ease-out' : 'transition-[height,max-height,transform] ease-out',
            `${ROOT_ROWS}:transition-opacity ${ROOT_ROWS}:duration-100`,
            mounted ? `${ROOT_ROWS}:opacity-50` : `${ROOT_ROWS}:opacity-100`,
          ],
          !unstyled && [
            'data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto duration-100 outline-none data-closed:overflow-hidden',
            'pointer-events-auto',
            'bg-glass border-glass rounded-xl p-1.5 shadow-lg data-[size=sm]:rounded-lg',
          ],
          className),
        ...props,
        children,
      }),
    }),
  });
}

/** DropdownMenuGroup. */
function om({...props}) {
  return (0, p.jsx)(Di, {'data-slot': 'dropdown-menu-group', ...props});
}

/** DropdownMenuLabel. */
function sm({className, inset, ...props}) {
  return (0, p.jsx)(Od, {
    'data-slot': 'dropdown-menu-label',
    'data-inset': inset,
    className: $('text-muted-foreground px-2.5 py-1 text-xs font-medium tracking-wide select-none in-data-[size=sm]:px-1.5 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5', className),
    ...props,
  });
}

/** DropdownMenuItem; `variant` destructive tints it red. */
function im({className, inset, variant = 'default', ...props}) {
  return (0, p.jsx)(_i, {
    'data-slot': 'dropdown-menu-item',
    'data-inset': inset,
    'data-variant': variant,
    className: $("group/dropdown-menu-item hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:hover:**:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:hover:bg-destructive/10! data-[variant=destructive]:hover:text-destructive data-[variant=destructive]:focus:bg-destructive/10! data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:hover:bg-destructive/20! dark:data-[variant=destructive]:focus:bg-destructive/20! data-[variant=destructive]:*:[svg]:text-destructive relative flex min-h-8 cursor-default items-center gap-2 rounded-lg px-2.5 py-1 text-sm outline-hidden select-none in-data-[size=sm]:min-h-7 in-data-[size=sm]:rounded-md in-data-[size=sm]:px-1.5 in-data-[size=sm]:py-1.5 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
    ...props,
  });
}

/** DropdownMenuSub. Controlled or not; in a narrow menu, opening it morphs the root. */
function am({narrowMorph = true, open, defaultOpen = false, onOpenChange, ...props}) {
  const root = f.useContext(DropdownMenuContext);
  const [uncontrolledOpen, setUncontrolledOpen] = f.useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const triggerRef = f.useRef(null);
  const [triggerPresentation, setTriggerPresentation] = f.useState(null);
  const close = f.useRef(() => {});
  const submenu = f.useRef({close: details => close.current(details)}).current;
  const setOpen = f.useCallback(next => {
    open === void 0 && setUncontrolledOpen(next);
  }, [open]);
  close.current = details => {
    root?.deactivateNarrowSubmenu(submenu), setOpen(false), onOpenChange?.(false, details);
  };
  const handleOpenChange = f.useCallback((next, details) => {
    narrowMorph && root?.isNarrow && next ? root.activateNarrowSubmenu(submenu, details) : next || root?.deactivateNarrowSubmenu(submenu);
    setOpen(next), onOpenChange?.(next, details);
  }, [root, narrowMorph, submenu, onOpenChange, setOpen]);
  const context = f.useMemo(() => ({isOpen, narrowMorph, triggerRef, triggerPresentation, setTriggerPresentation}), [isOpen, narrowMorph, triggerPresentation]);
  return (0, p.jsx)(DropdownSubmenuContext, {value: context, children: (0, p.jsx)(Gi, {'data-slot': 'dropdown-menu-sub', open: isOpen, onOpenChange: handleOpenChange, ...props})});
}

/** DropdownMenuSubTrigger. Publishes how it looks so a morphed submenu can repeat it as its back row;
 * no hover-open in narrow menus. */
function lm({className, inset, children, ref, openOnHover, ...props}) {
  const root = f.useContext(DropdownMenuContext);
  const sub = f.useContext(DropdownSubmenuContext);
  const triggerRef = Us(ref, sub?.triggerRef);
  f.useLayoutEffect(() => {
    sub?.setTriggerPresentation({children, className: typeof className == 'string' ? className : void 0, inset});
  }, [children, className, inset, sub?.setTriggerPresentation]);
  return (0, p.jsxs)(Ki, {
    ref: triggerRef,
    'data-slot': 'dropdown-menu-sub-trigger',
    'data-inset': inset,
    openOnHover: root?.isNarrow ? false : openOnHover,
    className: $(SUB_TRIGGER_ROW, 'data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground', className),
    ...props,
    children: [children, (0, p.jsx)(Ks, {className: 'text-muted-foreground -mr-1 ml-auto', 'data-icon': 'inline-end'})],
  });
}

/** DropdownMenuSubContent. Beside its trigger, or, morphing in a narrow menu, grown out of the
 * trigger's row inside the root popup and sized to fit below it (shifting up when it cannot). */
function um({align = 'start', alignOffset = -3, side = 'right', sideOffset = 0, size = 'md', className, children, onClick, unstyled = false, ...props}) {
  const root = f.useContext(DropdownMenuContext);
  const sub = f.useContext(DropdownSubmenuContext);
  const reducedMotion = md();
  const contentRef = f.useRef(null);
  const baseRootHeight = f.useRef(void 0);
  const [layout, setLayout] = f.useState(INITIAL_MORPH_LAYOUT);
  const popupRef = root?.popupRef;
  const setNarrowRootHeights = root?.setNarrowRootHeights;
  const isOpen = sub?.isOpen ?? false;
  const triggerRef = sub?.triggerRef;
  const trigger = sub?.triggerPresentation;
  const morphing = !!(root?.isNarrow && sub?.narrowMorph);
  const rootScale = root?.narrowRootScale ?? NARROW_ROOT_SCALE;
  const unscale = 1 / rootScale;
  const counterScale = {scale: unscale, x: '-50%'};
  f.useLayoutEffect(() => {
    (!morphing || !isOpen) && (baseRootHeight.current = void 0);
  }, [morphing, isOpen]);
  f.useLayoutEffect(() => {
    if (!morphing || !isOpen || !triggerRef?.current || !popupRef?.current) return;
    const measure = () => {
      const popup = popupRef.current;
      const triggerElement = triggerRef.current;
      const content = contentRef.current;
      if (!popup || !triggerElement) return;
      const popupRect = popup.getBoundingClientRect();
      const triggerRect = triggerElement.getBoundingClientRect();
      const view = popup.ownerDocument.defaultView ?? window;
      const contentHeight = content?.scrollHeight ?? 0;
      const fits = contentHeight < SUBMENU_FIT_HEIGHT;
      const roomBelow = Math.max(32, (view.innerHeight - triggerRect.top - 8) * rootScale);
      const height = fits ? contentHeight : Math.min(contentHeight, Math.max(roomBelow, Math.min(SUBMENU_FIT_HEIGHT, view.innerHeight - 16)));
      const top = Math.max(8, Math.min(triggerRect.top, view.innerHeight - height - 8));
      const next = {
        top: fits ? (triggerRect.top - popupRect.top) * unscale : (top - popupRect.top) * unscale,
        initialHeight: triggerRect.height * unscale,
        height,
        maxContentHeight: height,
        shouldShiftHeight: fits,
      };
      baseRootHeight.current ??= popupRect.height * unscale;
      const rootHeight = fits ? Math.max(baseRootHeight.current, next.top + height * unscale) : baseRootHeight.current;
      setNarrowRootHeights?.(baseRootHeight.current, rootHeight);
      setLayout(current => current.top === next.top && current.initialHeight === next.initialHeight && current.height === next.height
        && current.maxContentHeight === next.maxContentHeight && current.shouldShiftHeight === next.shouldShiftHeight ? current : next);
    };
    measure();
    const content = contentRef.current;
    const view = popupRef.current.ownerDocument.defaultView;
    if (!content) return;
    const observer = new ResizeObserver(measure);
    return observer.observe(content), view?.addEventListener('resize', measure), () => {
      observer.disconnect(), view?.removeEventListener('resize', measure);
    };
  }, [children, unscale, morphing, isOpen, rootScale, popupRef, setNarrowRootHeights, trigger, triggerRef]);
  if (!morphing) {
    return (0, p.jsx)(pr, {
      children: (0, p.jsx)(hr, {
        className: 'isolate z-50 outline-none',
        align,
        alignOffset,
        side,
        sideOffset,
        children: (0, p.jsx)(Kt, {
          'data-slot': 'dropdown-menu-sub-content',
          'data-size': size,
          className: $(
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 w-auto min-w-[96px] duration-100 outline-none data-[size=sm]:rounded-lg',
            'bg-glass border-glass rounded-xl p-1.5 shadow-lg data-[size=sm]:rounded-lg',
            className),
          onClick,
          ...props,
          children,
        }),
      }),
    });
  }
  // The back row repeats the trigger; pressing it reopens the parent by pressing the trigger again.
  const backRow = trigger && (0, p.jsxs)(p.Fragment, {
    children: [
      (0, p.jsxs)('button', {
        type: 'button',
        'data-inset': trigger.inset,
        onClick: event => {
          event.stopPropagation();
          const triggerElement = triggerRef?.current;
          if (!triggerElement) return;
          const view = triggerElement.ownerDocument.defaultView ?? window;
          triggerElement.dispatchEvent(new view.MouseEvent('mousedown', {bubbles: true, cancelable: true, view}));
        },
        className: $(SUB_TRIGGER_ROW, 'w-full text-left', trigger.className),
        children: [trigger.children, (0, p.jsx)(Sl, {className: 'text-muted-foreground -mr-1 ml-auto', 'data-icon': 'inline-end'})],
      }),
      (0, p.jsx)(jp, {}),
    ],
  });
  return (0, p.jsx)(cu, {
    onExitComplete: root?.completeNarrowSubmenuExit,
    children: isOpen && (0, p.jsx)(Kt, {
      'data-slot': 'dropdown-menu-sub-content',
      'data-size': size,
      onClick,
      render: (0, p.jsx)(Vt.div, {
        initial: {height: layout.initialHeight, opacity: 0, ...counterScale},
        animate: {height: layout.height, opacity: 1, ...counterScale},
        exit: {opacity: 0, ...counterScale},
        transition: reducedMotion ? {duration: 0} : MORPH_TRANSITION,
        className: $('pointer-events-auto absolute right-auto left-1/2 z-30 w-full text-sm outline-none', !unstyled && 'bg-glass border-glass rounded-xl shadow-lg', className, 'overflow-hidden'),
        style: {top: layout.top, transformOrigin: 'top center', maxHeight: layout.shouldShiftHeight ? 'none' : void 0},
      }, 'narrow-submenu'),
      ...props,
      children: (0, p.jsx)('div', {
        className: 'overflow-y-auto',
        style: {maxHeight: layout.maxContentHeight},
        children: (0, p.jsxs)(Vt.div, {
          ref: contentRef,
          initial: reducedMotion ? false : {opacity: 0, filter: 'blur(4px)'},
          animate: {opacity: 1, filter: 'blur(0px)'},
          exit: {opacity: 0, filter: 'blur(2px)'},
          transition: {duration: reducedMotion ? 0 : 0.08},
          className: 'p-1.5',
          children: [backRow, children],
        }),
      }),
    }),
  });
}

var CHOICE_ROW = "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:**:text-accent-foreground focus:**:text-accent-foreground relative flex min-h-8 cursor-default items-center gap-2 rounded-lg py-1 pr-8 pl-2.5 text-sm outline-hidden select-none in-data-[size=sm]:min-h-7 in-data-[size=sm]:rounded-md in-data-[size=sm]:py-1.5 in-data-[size=sm]:pr-7 in-data-[size=sm]:pl-1.5 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 in-data-[size=sm]:data-inset:pl-5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  CHOICE_INDICATOR = 'pointer-events-none absolute right-2 flex items-center justify-center in-data-[size=sm]:right-1.5';

/** DropdownMenuCheckboxItem: a check at the trailing edge. */
function cm({className, children, checked, inset, ...props}) {
  return (0, p.jsxs)(wd, {
    'data-slot': 'dropdown-menu-checkbox-item',
    'data-inset': inset,
    className: $(CHOICE_ROW, className),
    checked,
    ...props,
    children: [
      (0, p.jsx)('span', {className: CHOICE_INDICATOR, 'data-slot': 'dropdown-menu-checkbox-item-indicator', children: (0, p.jsx)(Rd, {children: (0, p.jsx)(Au, {className: 'size-4'})})}),
      children,
    ],
  });
}

/** DropdownMenuRadioGroup. */
function dm({...props}) {
  return (0, p.jsx)(Id, {'data-slot': 'dropdown-menu-radio-group', ...props});
}

/** DropdownMenuRadioItem: a dot at the trailing edge. */
function fm({className, children, inset, ...props}) {
  return (0, p.jsxs)(Td, {
    'data-slot': 'dropdown-menu-radio-item',
    'data-inset': inset,
    className: $(CHOICE_ROW, className),
    ...props,
    children: [
      (0, p.jsx)('span', {className: CHOICE_INDICATOR, 'data-slot': 'dropdown-menu-radio-item-indicator', children: (0, p.jsx)(Ad, {children: (0, p.jsx)(ju, {className: 'size-4'})})}),
      children,
    ],
  });
}

/** DropdownMenuSeparator. */
function jp({className, ...props}) {
  return (0, p.jsx)('div', {
    className: '-mx-1 my-1 in-data-[size=sm]:my-1 in-data-[size=sm]:px-1.5',
    children: (0, p.jsx)(fi, {'data-slot': 'dropdown-menu-separator', className: $('bg-border h-hairline', className), ...props}),
  });
}
