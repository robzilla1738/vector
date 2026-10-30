/* Aux-owned source, composer pass 9: the message list and its session state
 * (assets/session-composer-Dc0LRfZA.js, from the chat commands to the message list context). The
 * /clear and /compact commands; the virtual message list (row heights measured or estimated from a
 * rolling median, the rendered window and its spacers, an anchor row kept in place while content
 * above it changes) and its scroll controller, which follows the bottom while the agent writes until
 * the user scrolls away (wheel, touch, keys, pointer) and smooth-scrolls back; the bouncing dots;
 * a run's visible items and its live tool steps; the Thinking header read from the latest bold line;
 * and the message list context (rows, activity, run state). This block ends inside a `var` list.
 * Names the chunk uses elsewhere keep their chunk names: Ga useChatCommands (exported), as
 * BOTTOM_UP_SCROLL, Xa useMessageListMethods, ch useMessageListLocation, lh MessageList, dh
 * BouncingDots, hh runItems, Ja groupSteps, gh isDoneAssistant, $e rowKey, xh isStreamingRun,
 * pt stepKey, to the activity context, wh MessageListProvider, Sn useMessageListContext,
 * no useMessageListActivity.
 * Chunk names used: a JSX runtime, g React, Y cn, Rs cva, ge useApp, me useSession, Ls broadcast,
 * Ce useTRPC, ve useMutation, de toasts, ur storage errors, mr/Ye/Kn tool definitions, lu step
 * grouping, xa the streaming message. */
/** useChatCommands: /clear (after a confirmation) and /compact for the session. */
function Ga({sessionId}) {
  const {accountId} = ge(),
    {navigate} = me(),
    {broadcast} = Ls(),
    {confirm} = lr(),
    {setMessages} = ot(),
    i = _e(),
    c = Ce(),
    l = ve(c.sessions.clearMessages.mutationOptions()),
    u = ve(c.sessions.compact.mutationOptions());
  return (h, d) => {
    switch (h) {
      case 'feedback':
        return (broadcast(da, {sessionId, comment: d}), true);
      case 'new':
        return (navigate(null), true);
      case 'clear':
        return (
          confirm(
            {
              title: 'Clear chat?',
              description: 'This will permanently delete all messages in this chat.',
              ui: {action: 'Clear', variant: 'destructive'},
            },
            async () => {
              try {
                const m = await l.mutateAsync({sessionId, accountId});
                (i.setQueryData(c.sessions.get.queryKey({sessionId, accountId}), m.session),
                  i.setQueryData(c.sessions.messages.queryKey({sessionId, accountId}), []),
                  setMessages([]),
                  Promise.all([
                    i.invalidateQueries(c.sessions.listPreviewItems.queryFilter({accountId})),
                    i.invalidateQueries(c.sessions.listPreviewItems.infiniteQueryFilter({accountId})),
                    i.invalidateQueries(c.sessions.messageRows.queryFilter({sessionId, accountId})),
                  ]).catch(() => {}));
              } catch (m) {
                de.error(m instanceof Error ? m.message : 'Failed to clear the chat.');
              }
            },
          ),
          true
        );
      case 'compact': {
        const m = de.loading('Compacting context…');
        return (
          (async () => {
            try {
              (await u.mutateAsync({sessionId, accountId, instructions: d}),
                i.invalidateQueries(c.sessions.messages.queryFilter({sessionId, accountId})),
                i.invalidateQueries(c.sessions.messageRows.queryFilter({sessionId, accountId})),
                de.success('Context compacted', {id: m}));
            } catch (p) {
              de.error(p instanceof Error ? p.message : 'Failed to compact the chat.', {id: m});
            }
          })(),
          true
        );
      }
      default:
        return false;
    }
  };
}
function EmptyMessage({title, description, icon, className = ''}) {
  return (0, a.jsxs)('div', {
    className: Y(
      'text-muted-foreground flex flex-col items-center justify-center gap-3 p-8 text-center select-none',
      className,
    ),
    children: [
      icon,
      (0, a.jsx)('h3', {className: 'text-base font-semibold', children: title}),
      description ? (0, a.jsx)('p', {className: 'text-muted-foreground text-sm', children: description}) : null,
      (0, a.jsx)(Bi, {className: 'size-16 max-sm:size-12'}),
    ],
  });
}
function clamp(e, t, n) {
  return Math.min(n, Math.max(t, e));
} /** The median of measured row heights, kept between 88 and 600px (120 before any is measured). */
function medianHeight(e) {
  if (e.length === 0) return 120;
  const t = e.slice().sort((r, s) => r - s),
    n = Math.floor(t.length / 2);
  return clamp(t.length % 2 === 0 ? (t[n - 1] + t[n]) / 2 : t[n], 88, 600);
}
function rowHeight(e, t, n) {
  const r = t.get(e.key);
  return r !== void 0 && r > 0
    ? r
    : e.estimatedHeightPx !== void 0 && e.estimatedHeightPx > 0
      ? e.estimatedHeightPx
      : (n?.rollingMedianPx ?? 120);
} /** Row heights and offsets from the bottom, measured where known and estimated elsewhere. */
function measureLayout(e, t, n) {
  const r = n?.gapPx ?? 0,
    s = n?.rollingMedianPx ?? 120,
    o = [],
    i = [],
    c = [],
    l = new Map();
  let u = 0;
  for (let d = 0; d < e.length; d += 1) {
    const m = e[d];
    (o.push(m.key), l.set(m.key, d));
    const p = rowHeight(m, t, {rollingMedianPx: s});
    (i.push(p), c.push(u), (u += p + (d < e.length - 1 ? r : 0)));
  }
  const h = u;
  return {
    keys: o,
    indexByKey: l,
    heightsPx: i,
    topOffsetsPx: c,
    bottomOffsetsPx: i.map((d, m) => h - c[m] - d),
    totalHeightPx: h,
  };
} /** The rows to render for a viewport, with overscan, and the spacers above and below them. */
function visibleRange(e, t, n, r) {
  const s = e.keys.length;
  if (s === 0) return {startIndex: 0, endIndex: 0, topSpacerPx: 0, bottomSpacerPx: 0};
  const o = Math.max(0, n),
    i = Math.max(0, t),
    c = i + o;
  let l = 0,
    u = s;
  for (; l < u;) {
    const C = (l + u) >> 1;
    e.bottomOffsetsPx[C] < c ? (u = C) : (l = C + 1);
  }
  const h = Math.min(l, s - 1);
  for (l = 0, u = s; l < u;) {
    const C = (l + u) >> 1;
    e.bottomOffsetsPx[C] + e.heightsPx[C] > i ? (l = C + 1) : (u = C);
  }
  const d = Math.max(h, l - 1);
  let m = Math.max(0, h - 2),
    p = Math.min(s, d + 1 + 2);
  const f = o;
  for (; m > 0 && !(e.topOffsetsPx[h] - e.topOffsetsPx[m] >= f);) m -= 1;
  for (; p < s;) {
    const C = e.topOffsetsPx[d] + e.heightsPx[d];
    if (e.topOffsetsPx[p] - C >= f) break;
    p += 1;
  }
  if (r?.keysChanged && r.previousRange) {
    const C = Math.max(0, r.previousRange.endIndex - r.previousRange.startIndex),
      S = r.previousRange.firstKey;
    if (S) {
      const y = e.indexByKey.get(S);
      y !== void 0 && ((m = Math.min(m, y)), (p = Math.max(p, Math.min(s, y + C))));
    }
  }
  const x = e.topOffsetsPx[m] ?? 0,
    b = p - 1,
    v = p <= m ? e.totalHeightPx : e.totalHeightPx - (e.topOffsetsPx[b] + e.heightsPx[b]);
  return {startIndex: m, endIndex: p, topSpacerPx: x, bottomSpacerPx: Math.max(0, v)};
}
function bottomShift(e, t, n) {
  const r = e.indexByKey.get(n),
    s = t.indexByKey.get(n);
  if (r === void 0 || s === void 0) return null;
  const o = e.bottomOffsetsPx[r] + e.heightsPx[r];
  return t.bottomOffsetsPx[s] + t.heightsPx[s] - o;
} /** The row nearest the viewport’s bottom edge, to keep in place while rows above it change. */
function viewportAnchor(e, t, n, r) {
  if (e.keys.length === 0 || r.length === 0) return null;
  const s = Math.max(0, t),
    o = s + Math.max(0, n);
  let i = null,
    c = Number.POSITIVE_INFINITY;
  for (const l of r) {
    const u = e.indexByKey.get(l);
    if (u === void 0) continue;
    const h = e.bottomOffsetsPx[u],
      d = h + e.heightsPx[u];
    if (d <= s || h >= o) continue;
    const m = o - d,
      p = Math.abs(m);
    p < c && ((c = p), (i = {key: l, offsetFromViewportTopPx: m}));
  }
  return i || {key: r[0], offsetFromViewportTopPx: 0};
}
var /** Scroll distance from the bottom for a column-reverse list, and the same for a top-down one. */
  TOP_DOWN_SCROLL = {
    readDistanceFromBottom: e => Math.max(0, -e.scrollTop),
    writeDistanceFromBottom: (e, t) => {
      const n = Math.max(0, e.scrollHeight - e.clientHeight),
        r = clamp(t, 0, n);
      e.scrollTop = r === 0 ? 0 : -r;
    },
  },
  as = {
    readDistanceFromBottom: e => Math.max(0, e.scrollHeight - e.scrollTop - e.clientHeight),
    writeDistanceFromBottom: (e, t) => {
      const n = Math.max(0, e.scrollHeight - e.clientHeight);
      e.scrollTop = n - clamp(t, 0, n);
    },
  };
function bottomState(e) {
  const t = Math.max(0, e);
  return {distanceFromBottomPx: t, isAtBottom: t <= 24};
}
function wheelPixels(e) {
  return e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
}
function flipDelta(e) {
  return -e;
} /** Whether the list follows the bottom: attached, detached by the user, or returning. */
function followReducer(e, t) {
  switch (t.type) {
    case 'open-at-bottom':
      return {type: 'attached'};
    case 'user-input':
      return {type: 'detached'};
    case 'user-distance':
      return t.distanceFromBottomPx > 24
        ? {type: 'detached'}
        : t.isStreaming
          ? {type: 'attached'}
          : e.type === 'settling'
            ? e
            : {type: 'detached'};
    case 'bottom-button':
      return {
        type: 'settling',
        targetDistancePx: 0,
        behavior: t.behavior,
        completion: t.isStreaming ? 'attached' : 'detached',
      };
    case 'scroll-to-key':
      return {
        type: 'settling',
        targetDistancePx: t.targetDistancePx,
        behavior: t.behavior ?? 'instant',
        completion: 'detached',
      };
    case 'settling-complete':
      return e.type !== 'settling' ? e : {type: e.completion};
    case 'streaming-started':
      return {type: 'attached'};
    case 'streaming-ended':
      return e.type === 'attached' ? {type: 'detached'} : e;
    default:
      return e;
  }
}
var /** The scroll controller: follows new content at the bottom, lets the user scroll away, keeps an anchor row steady, and scrolls back smoothly. */
  ScrollController = class {
    element = null;
    geometry;
    followMode = {type: 'attached'};
    pending = null;
    animationToken = 0;
    listenersAttached = false;
    destroyed = false;
    debugEvents = [];
    options;
    onScroll = () => this.handleNativeScroll();
    onWheel = e => this.handleWheel(e);
    onTouchStart = e => this.handleTouchStart(e);
    onTouchMove = e => this.handleTouchMove(e);
    onTouchEnd = () => {
      this.lastTouchClientY = void 0;
    };
    onKeyDown = e => this.handleKeyDown(e);
    onPointerDown = () => {
      (this.clearElementAnchor(),
        this.markUserContentInteraction(),
        this.followMode.type === 'settling' &&
          ((this.animationToken += 1),
          this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null)),
          this.setFollowMode({type: 'detached'}, 'pointer-input')));
    };
    lastTouchClientY;
    smoothRaf = null;
    elementAnchor = null;
    elementAnchorRaf = null;
    preserveAnchorAtBottomUntilMs = 0;
    constructor(e = {}) {
      ((this.options = e), (this.geometry = e.geometry ?? TOP_DOWN_SCROLL));
    }
    attach(e) {
      this.element !== e &&
        (this.detach(),
        (this.element = e),
        (this.destroyed = false),
        e.addEventListener('scroll', this.onScroll, {passive: true}),
        e.addEventListener('wheel', this.onWheel, {passive: true}),
        e.addEventListener('touchstart', this.onTouchStart, {passive: true}),
        e.addEventListener('touchmove', this.onTouchMove, {passive: true}),
        e.addEventListener('touchend', this.onTouchEnd, {passive: true}),
        e.addEventListener('touchcancel', this.onTouchEnd, {passive: true}),
        e.addEventListener('pointerdown', this.onPointerDown, {passive: true}),
        typeof window < 'u' && window.addEventListener('keydown', this.onKeyDown, {passive: true}),
        (this.listenersAttached = true));
    }
    detach() {
      const e = this.element;
      (e &&
        this.listenersAttached &&
        (e.removeEventListener('scroll', this.onScroll),
        e.removeEventListener('wheel', this.onWheel),
        e.removeEventListener('touchstart', this.onTouchStart),
        e.removeEventListener('touchmove', this.onTouchMove),
        e.removeEventListener('touchend', this.onTouchEnd),
        e.removeEventListener('touchcancel', this.onTouchEnd),
        e.removeEventListener('pointerdown', this.onPointerDown),
        typeof window < 'u' && window.removeEventListener('keydown', this.onKeyDown)),
        (this.listenersAttached = false),
        (this.element = null),
        this.clearElementAnchor(),
        this.pending && (cancelAnimationFrame(this.pending.frameId), (this.pending = null)),
        this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null)));
    }
    destroy() {
      ((this.destroyed = true), this.detach());
    }
    setGeometry(e) {
      this.geometry = e;
    }
    getFollowMode() {
      return this.followMode;
    }
    getLocation() {
      const e = this.element;
      return bottomState(e ? this.geometry.readDistanceFromBottom(e) : 0);
    }
    getDebugEvents() {
      return this.debugEvents;
    }
    queueFooterCorrection(e) {
      if (this.followMode.type === 'attached') {
        this.queueCorrection({anchorDistanceDeltaPx: 0, source: 'footer', reason: 'footer-attached'});
        return;
      }
      this.queueCorrection({anchorDistanceDeltaPx: e, source: 'footer', reason: 'footer-detached'});
    }
    queueLayoutReplacement(e = 'layout') {
      this.queueCorrection({anchorDistanceDeltaPx: 0, source: 'measurement', reason: e});
    }
    scrollToBottom(e = 'instant') {
      const t = e === 'smooth' && this.options.prefersReducedMotion?.() ? 'instant' : e;
      (this.dispatchFollow({type: 'bottom-button', behavior: t, isStreaming: this.options.isStreaming?.() ?? false}),
        this.moveToDistance(0, t, 'bottom-button'));
    }
    scrollToKeyDistance(e, t = 'instant') {
      (this.dispatchFollow({type: 'scroll-to-key', targetDistancePx: e, behavior: t}),
        this.moveToDistance(e, t, 'scroll-to-key'));
    }
    commitAttachedFollow(e = 'attached-growth') {
      this.followMode.type === 'attached' && this.writeDistance(0, 'controller', e);
    }
    openAtBottom() {
      (this.dispatchFollow({type: 'open-at-bottom'}), this.writeDistance(0, 'controller', 'open-at-bottom'));
    }
    preserveDistance(e, t = 'preserve-distance') {
      if (this.followMode.type === 'settling' && this.followMode.behavior === 'smooth') {
        if (this.followMode.targetDistancePx > 0) {
          const n = this.getLocation().distanceFromBottomPx;
          this.setFollowMode(
            {...this.followMode, targetDistancePx: Math.max(0, this.followMode.targetDistancePx + e - n)},
            `${t}:settling-target`,
          );
        }
        return;
      }
      this.writeDistance(e, 'measurement', t);
    }
    notifyStreamingEnded() {
      this.dispatchFollow({type: 'streaming-ended'});
    }
    notifyStreamingStarted() {
      (this.clearElementAnchor(),
        (this.animationToken += 1),
        this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null)),
        this.dispatchFollow({type: 'streaming-started'}),
        this.writeDistance(0, 'controller', 'streaming-started'));
    }
    markUserContentInteraction(e = 1200) {
      const t = typeof performance < 'u' ? performance.now() : Date.now();
      this.preserveAnchorAtBottomUntilMs = Math.max(this.preserveAnchorAtBottomUntilMs, t + e);
    }
    shouldPreserveAnchorAtBottom() {
      return (typeof performance < 'u' ? performance.now() : Date.now()) <= this.preserveAnchorAtBottomUntilMs;
    }
    preserveElementViewportPosition(e, t = 300) {
      const n = typeof performance < 'u' ? performance.now() : Date.now();
      (this.clearElementAnchor(),
        (this.elementAnchor = {
          element: e,
          topPx: e.getBoundingClientRect().top,
          expiresAtMs: n + t,
          previousTranslate: e.style.translate,
          translateYPx: 0,
        }),
        this.markUserContentInteraction(t),
        typeof requestAnimationFrame < 'u' &&
          (this.elementAnchorRaf = requestAnimationFrame(this.monitorElementAnchor)));
    }
    restoreElementViewportPosition() {
      const e = this.elementAnchor,
        t = this.element,
        n = typeof performance < 'u' ? performance.now() : Date.now();
      if (!e || !t || !e.element.isConnected) return (this.clearElementAnchor(), false);
      if (n > e.expiresAtMs) return (this.clearElementAnchor(true), false);
      const r = e.topPx - e.element.getBoundingClientRect().top;
      if (Math.abs(r) > 0.5) {
        const i = this.geometry.readDistanceFromBottom(t);
        this.writeDistance(i + r, 'measurement', 'element-anchor');
      }
      const s = e.topPx - e.element.getBoundingClientRect().top,
        o = e.translateYPx + s;
      return (
        (e.translateYPx = Math.abs(o) < 0.5 ? 0 : o),
        (e.element.style.translate = e.translateYPx === 0 ? e.previousTranslate : `0 ${e.translateYPx}px`),
        true
      );
    }
    distanceForKey(e, t, n, r = 'start') {
      const s = e.indexByKey.get(t);
      if (s === void 0) return null;
      const o = e.bottomOffsetsPx[s] + e.heightsPx[s];
      return r === 'center' ? Math.max(0, o - n / 2 - e.heightsPx[s] / 2) : Math.max(0, o - n);
    }
    moveToDistance(e, t, n) {
      if (t === 'instant') {
        (this.writeDistance(e, 'controller', n),
          this.followMode.type === 'settling' && this.dispatchFollow({type: 'settling-complete'}));
        return;
      }
      this.animateToDistance(e, n);
    }
    animateToDistance(e, t) {
      const n = this.element;
      if (!n) return;
      this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null));
      const r = ++this.animationToken,
        s = this.geometry.readDistanceFromBottom(n);
      if (Math.abs(e - s) < 0.5) {
        (this.writeDistance(e, 'controller', t),
          this.followMode.type === 'settling' && this.dispatchFollow({type: 'settling-complete'}));
        return;
      }
      const o = 280,
        i = performance.now(),
        c = l => {
          if (this.destroyed || r !== this.animationToken || this.followMode.type !== 'settling') return;
          const u = clamp((l - i) / o, 0, 1),
            h = 1 - (1 - u) ** 3,
            d = this.followMode.targetDistancePx;
          if ((this.writeDistance(s + (d - s) * h, 'controller', t), u < 1)) {
            this.smoothRaf = requestAnimationFrame(c);
            return;
          }
          ((this.smoothRaf = null),
            this.writeDistance(this.followMode.targetDistancePx, 'controller', `${t}:complete`),
            this.dispatchFollow({type: 'settling-complete'}));
        };
      this.smoothRaf = requestAnimationFrame(c);
    }
    queueCorrection(e) {
      const t = this.element;
      if (t) {
        if (!this.pending) {
          const n = requestAnimationFrame(() => this.commitPending());
          this.pending = {
            baseDistanceFromBottomPx: this.geometry.readDistanceFromBottom(t),
            scrollHeightPx: t.scrollHeight,
            userDistanceDeltaPx: 0,
            anchorDistanceDeltaPx: 0,
            frameId: n,
          };
        }
        ((this.pending.anchorDistanceDeltaPx += e.anchorDistanceDeltaPx), e.source, e.reason);
      }
    }
    commitPending() {
      const e = this.pending;
      if (((this.pending = null), !e || this.destroyed || !this.element)) return;
      if (this.followMode.type === 'attached') {
        this.writeDistance(0, 'controller', 'attached-commit');
        return;
      }
      if (this.followMode.type === 'settling' && this.followMode.targetDistancePx > 0) {
        this.setFollowMode(
          {
            ...this.followMode,
            targetDistancePx: Math.max(
              0,
              this.followMode.targetDistancePx + e.userDistanceDeltaPx + e.anchorDistanceDeltaPx,
            ),
          },
          'coordinator-settling-target',
        );
        return;
      }
      const t = Math.max(0, e.baseDistanceFromBottomPx + e.userDistanceDeltaPx + e.anchorDistanceDeltaPx);
      this.writeDistance(t, 'measurement', 'coordinator-commit');
    }
    writeDistance(e, t, n) {
      const r = this.element;
      if (!r) return;
      const s = this.geometry.readDistanceFromBottom(r);
      this.geometry.writeDistanceFromBottom(r, e);
      const o = this.geometry.readDistanceFromBottom(r);
      (this.pushDebug({
        source: t,
        previousDistancePx: s,
        nextDistancePx: o,
        followMode: this.followMode.type,
        reason: n,
      }),
        this.options.onLocationChange?.(bottomState(o)));
    }
    handleNativeScroll() {
      if (this.followMode.type === 'settling') return;
      if (this.pending) {
        const n = this.getLocation().distanceFromBottomPx,
          r = Math.max(
            0,
            this.pending.baseDistanceFromBottomPx +
              this.pending.userDistanceDeltaPx +
              this.pending.anchorDistanceDeltaPx,
          );
        if (Math.abs(n - r) > 24) {
          ((this.pending.baseDistanceFromBottomPx = n),
            (this.pending.userDistanceDeltaPx = 0),
            (this.pending.anchorDistanceDeltaPx = 0));
          const s = bottomState(n);
          (this.dispatchFollow({
            type: 'user-distance',
            distanceFromBottomPx: n,
            isStreaming: this.options.isStreaming?.() ?? false,
          }),
            this.options.onLocationChange?.(s));
        }
        return;
      }
      const e = this.getLocation(),
        t = this.options.isStreaming?.() ?? false;
      (this.dispatchFollow({type: 'user-distance', distanceFromBottomPx: e.distanceFromBottomPx, isStreaming: t}),
        this.options.onLocationChange?.(e));
    }
    handleWheel(e) {
      this.clearElementAnchor();
      const t = flipDelta(wheelPixels(e));
      if (
        (this.followMode.type === 'settling' &&
          ((this.animationToken += 1),
          this.dispatchFollow({type: 'user-input'}),
          this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null))),
        this.pending && (this.pending.userDistanceDeltaPx += t),
        Math.abs(t) > 0)
      ) {
        const n = this.getLocation(),
          r = Math.max(0, n.distanceFromBottomPx + t);
        this.dispatchFollow({
          type: 'user-distance',
          distanceFromBottomPx: r,
          isStreaming: this.options.isStreaming?.() ?? false,
        });
      }
    }
    handleTouchStart(e) {
      (this.clearElementAnchor(), (this.lastTouchClientY = e.touches[0]?.clientY));
    }
    handleTouchMove(e) {
      const t = this.lastTouchClientY,
        n = e.touches[0]?.clientY;
      if (((this.lastTouchClientY = n), t === void 0 || n === void 0)) return;
      const r = n - t;
      if (Math.abs(r) < 1) return;
      (this.followMode.type === 'settling' &&
        ((this.animationToken += 1),
        this.dispatchFollow({type: 'user-input'}),
        this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null))),
        this.pending && (this.pending.userDistanceDeltaPx += r));
      const s = this.getLocation();
      this.dispatchFollow({
        type: 'user-distance',
        distanceFromBottomPx: Math.max(0, s.distanceFromBottomPx + r),
        isStreaming: this.options.isStreaming?.() ?? false,
      });
    }
    handleKeyDown(e) {
      const t = this.element;
      if (!t || !(e.target instanceof Node) || !t.contains(e.target) || !isTypingTarget(e)) return;
      (this.clearElementAnchor(),
        this.followMode.type === 'settling' &&
          ((this.animationToken += 1),
          this.dispatchFollow({type: 'user-input'}),
          this.smoothRaf !== null && (cancelAnimationFrame(this.smoothRaf), (this.smoothRaf = null))));
      let n = 0;
      if (
        (e.key === 'Home'
          ? (n = t.scrollHeight)
          : e.key === 'End'
            ? (n = -t.scrollHeight)
            : e.key === 'ArrowUp' || e.key === 'PageUp'
              ? (n = 40)
              : e.key === 'ArrowDown' || e.key === 'PageDown'
                ? (n = -40)
                : e.key === ' ' && e.shiftKey
                  ? (n = 40)
                  : e.key === ' ' && (n = -40),
        this.pending && n !== 0 && (this.pending.userDistanceDeltaPx += n),
        n !== 0)
      ) {
        const r = this.getLocation();
        this.dispatchFollow({
          type: 'user-distance',
          distanceFromBottomPx: Math.max(0, r.distanceFromBottomPx + n),
          isStreaming: this.options.isStreaming?.() ?? false,
        });
      }
    }
    dispatchFollow(e) {
      const t = followReducer(this.followMode, e);
      (t === this.followMode &&
        t.type === this.followMode.type &&
        (t.type !== 'settling' ||
          (this.followMode.type === 'settling' &&
            t.targetDistancePx === this.followMode.targetDistancePx &&
            t.behavior === this.followMode.behavior &&
            t.completion === this.followMode.completion))) ||
        this.setFollowMode(t, e.type);
    }
    clearElementAnchor(e = false) {
      this.elementAnchorRaf !== null && (cancelAnimationFrame(this.elementAnchorRaf), (this.elementAnchorRaf = null));
      const t = this.elementAnchor;
      (t?.element.isConnected &&
        ((t.element.style.translate = t.previousTranslate),
        e &&
          Math.abs(t.translateYPx) > 0.5 &&
          t.element.animate([{translate: `0 ${t.translateYPx}px`}, {translate: t.previousTranslate || 'none'}], {
            duration: 120,
            easing: 'ease-out',
          })),
        (this.elementAnchor = null));
    }
    monitorElementAnchor = () => {
      ((this.elementAnchorRaf = null),
        this.restoreElementViewportPosition() &&
          (this.elementAnchorRaf = requestAnimationFrame(this.monitorElementAnchor)));
    };
    setFollowMode(e, t) {
      (e.type === this.followMode.type &&
        (e.type !== 'settling' ||
          (this.followMode.type === 'settling' &&
            e.targetDistancePx === this.followMode.targetDistancePx &&
            e.behavior === this.followMode.behavior &&
            e.completion === this.followMode.completion))) ||
        ((this.followMode = e), this.options.onFollowModeChange?.(e));
    }
    pushDebug(e) {
      ({}).NODE_ENV !== 'production' &&
        (this.debugEvents.push(e), this.debugEvents.length > 100 && this.debugEvents.shift());
    }
  };
function isTypingTarget(e) {
  const t = e.target;
  return t instanceof HTMLInputElement ||
    t instanceof HTMLTextAreaElement ||
    (t instanceof HTMLElement && t.isContentEditable)
    ? false
    : e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        e.key === ' ';
}
var MethodsContext = (0, g.createContext)(null),
  LocationContext = (0, g.createContext)(null),
  INITIAL_LOCATION = {distanceFromBottomPx: 0, isAtBottom: true, renderedRange: {startIndex: 0, endIndex: 0}};
function locationStore(e) {
  let t = e;
  const n = new Set();
  return {
    subscribe: r => (n.add(r), () => n.delete(r)),
    getSnapshot: () => t,
    set: r => {
      if (!(
        t.distanceFromBottomPx === r.distanceFromBottomPx &&
        t.isAtBottom === r.isAtBottom &&
        t.renderedRange.startIndex === r.renderedRange.startIndex &&
        t.renderedRange.endIndex === r.renderedRange.endIndex
      )) {
        t = r;
        for (const s of n) s();
      }
    },
  };
}
function Xa() {
  const e = (0, g.useContext)(MethodsContext);
  if (!e) throw new Error('useMessageListMethods must be used under MessageList');
  return e;
}
function ch() {
  const e = (0, g.useContext)(LocationContext);
  if (!e) throw new Error('useMessageListLocation must be used under MessageList');
  return (0, g.useSyncExternalStore)(e.subscribe, e.getSnapshot, e.getSnapshot);
} /** MessageList: the virtual list of transcript entries with its scroll controller and location store. */
function lh(e) {
  const {
      entries,
      getKey,
      estimateHeight,
      context,
      ItemContent,
      isStreaming,
      Footer,
      StickyFooter,
      onLocationChange,
      className,
      scrollerClassName,
      contentClassName,
      contentProps,
      style,
      useReversedGeometry = true,
      ref,
    } = e,
    v = (0, g.useRef)(null),
    C = (0, g.useRef)(null),
    S = (0, g.useRef)(null),
    y = (0, g.useRef)(null),
    k = (0, g.useRef)(new Map()),
    M = (0, g.useRef)(new Map()),
    w = (0, g.useRef)([]),
    I = (0, g.useRef)(null),
    R = (0, g.useRef)({startIndex: 0, endIndex: 0, topSpacerPx: 0, bottomSpacerPx: 0}),
    j = (0, g.useRef)(false),
    N = (0, g.useRef)([]),
    O = (0, g.useRef)(isStreaming),
    W = (0, g.useRef)(isStreaming),
    se = (0, g.useRef)(onLocationChange);
  ((W.current = isStreaming), (se.current = onLocationChange));
  const U = (0, g.useRef)(null),
    ae = (0, g.useRef)(null);
  ae.current || (ae.current = locationStore(INITIAL_LOCATION));
  const _ = ae.current,
    [ce, le] = (0, g.useState)(0),
    [V, K] = (0, g.useState)(0),
    ne = (0, g.useMemo)(
      () => entries.map(H => ({key: getKey(H), estimatedHeightPx: estimateHeight?.(H)})),
      [entries, estimateHeight, getKey],
    ),
    he = (0, g.useMemo)(() => ne.map(H => H.key), [ne]),
    X = (0, g.useMemo)(() => he.join('\0'), [he]),
    re = (0, g.useRef)(ne);
  re.current = ne;
  const ue = (0, g.useCallback)(() => {
      const H = medianHeight(w.current),
        L = measureLayout(re.current, M.current, {rollingMedianPx: H});
      return ((I.current = L), L);
    }, []),
    E = (0, g.useCallback)((H, L, D) => {
      const $ = R.current,
        oe = N.current,
        Be = oe.length !== H.keys.length || oe.some((Re, it) => Re !== H.keys[it]),
        Oe = visibleRange(H, L, D, {
          keysChanged: Be,
          previousRange: {startIndex: $.startIndex, endIndex: $.endIndex, firstKey: oe[$.startIndex]},
        });
      N.current = H.keys;
      const Ke =
        $.startIndex !== Oe.startIndex ||
        $.endIndex !== Oe.endIndex ||
        $.topSpacerPx !== Oe.topSpacerPx ||
        $.bottomSpacerPx !== Oe.bottomSpacerPx;
      return ((R.current = Oe), Ke && K(Re => Re + 1), Oe);
    }, []),
    ee = (0, g.useCallback)(
      H => {
        const L = I.current,
          D = v.current;
        L && D && E(L, H.distanceFromBottomPx, D.clientHeight);
        const $ = R.current,
          oe = {
            distanceFromBottomPx: H.distanceFromBottomPx,
            isAtBottom: H.isAtBottom,
            renderedRange: {startIndex: $.startIndex, endIndex: $.endIndex},
          };
        (_.set(oe), se.current?.(oe));
      },
      [_, E],
    );
  y.current ||
    (y.current = new ScrollController({
      geometry: useReversedGeometry ? TOP_DOWN_SCROLL : as,
      isStreaming: () => W.current,
      onLocationChange: ee,
      prefersReducedMotion: () =>
        typeof window < 'u' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
    }));
  const F = y.current;
  ((0, g.useEffect)(() => {
    F.setGeometry(useReversedGeometry ? TOP_DOWN_SCROLL : as);
  }, [F, useReversedGeometry]),
    (0, g.useEffect)(
      () => () => {
        (F.destroy(), (y.current = null));
      },
      [F],
    ),
    (0, g.useLayoutEffect)(() => {
      const H = O.current;
      ((O.current = isStreaming),
        !(!j.current || H === isStreaming) && (isStreaming ? F.notifyStreamingStarted() : F.notifyStreamingEnded()));
    }, [F, isStreaming]));
  const fe = (0, g.useCallback)(
    H => {
      const L = I.current,
        D = v.current;
      if (!L || !D) return;
      const $ = [];
      for (const be of H)
        k.current.get(be.key) === be.target &&
          M.current.get(be.key) !== be.heightPx &&
          $.push({key: be.key, heightPx: be.heightPx});
      if ($.length === 0) return;
      const oe = F.getLocation(),
        Be = Math.max(0, D.scrollHeight - D.clientHeight),
        Oe = _.getSnapshot().distanceFromBottomPx,
        Ke = Oe > Be && oe.distanceFromBottomPx >= Be - 1 ? Oe : oe.distanceFromBottomPx,
        Re = [];
      for (let be = R.current.startIndex; be < R.current.endIndex; be += 1) {
        const _r = L.keys[be];
        _r && Re.push(_r);
      }
      const it = viewportAnchor(L, Ke, D.clientHeight, Re) ?? null;
      for (const be of $)
        (M.current.set(be.key, be.heightPx), w.current.push(be.heightPx), w.current.length > 50 && w.current.shift());
      const Et = L,
        Dt = ue(),
        An = F.getFollowMode().type;
      let vt = Ke;
      const $o = Ke <= 24,
        Ko = F.shouldPreserveAnchorAtBottom();
      if (F.restoreElementViewportPosition()) vt = F.getLocation().distanceFromBottomPx;
      else if (An === 'attached') (F.commitAttachedFollow('measurement-attached'), (vt = 0));
      else if ($o && !Ko) (F.preserveDistance(0, 'measurement-at-bottom'), (vt = 0));
      else if (it) {
        const be = bottomShift(Et, Dt, it.key);
        be !== null && be !== 0 && ((vt = Math.max(0, Ke + be)), F.preserveDistance(vt, 'measurement-anchor'));
      }
      (E(Dt, vt, D.clientHeight), ee(F.getLocation()));
    },
    [F, _, ee, ue, E],
  );
  (0, g.useEffect)(() => {
    if (typeof ResizeObserver > 'u') return;
    const H = new ResizeObserver(L => {
      const D = [];
      for (const $ of L) {
        const oe = $.target;
        if (!(oe instanceof HTMLElement)) continue;
        const Be = oe.dataset.messageKey;
        Be && D.push({key: Be, heightPx: oe.offsetHeight, target: oe});
      }
      D.length > 0 && fe(D);
    });
    for (const L of k.current.values()) H.observe(L);
    return (
      (U.current = H),
      () => {
        (H.disconnect(), (U.current = null));
      }
    );
  }, [fe]);
  const ye = (0, g.useCallback)(H => {
    if (!H) return;
    const L = H.dataset.messageKey;
    if (L)
      return (
        k.current.set(L, H),
        U.current?.observe(H),
        () => {
          (U.current?.unobserve(H), k.current.get(L) === H && k.current.delete(L));
        }
      );
  }, []);
  ((0, g.useEffect)(() => {
    const H = S.current;
    if (!H || typeof ResizeObserver > 'u') return;
    let L = H.offsetHeight;
    const D = new ResizeObserver(() => {
      const $ = H.offsetHeight,
        oe = $ - L;
      ((L = $),
        oe !== 0 &&
          (F.queueFooterCorrection(oe),
          F.getFollowMode().type === 'attached' && F.commitAttachedFollow('footer-attached')));
    });
    return (D.observe(H), () => D.disconnect());
  }, [F, Footer]),
    (0, g.useLayoutEffect)(() => {
      const H = v.current;
      if (!H) return;
      if ((F.attach(H), le(H.clientHeight), typeof ResizeObserver > 'u')) return () => F.detach();
      const L = new ResizeObserver(() => {
        const D = H.clientHeight;
        le(oe => (oe === D ? oe : D));
        const $ = I.current;
        $ && E($, F.getLocation().distanceFromBottomPx, D);
      });
      return (
        L.observe(H),
        () => {
          (L.disconnect(), F.detach());
        }
      );
    }, [F, E]),
    (0, g.useLayoutEffect)(() => {
      const H = ue(),
        L = v.current,
        D = F.getLocation().distanceFromBottomPx;
      (E(H, D, L?.clientHeight ?? ce),
        F.getFollowMode().type === 'attached'
          ? F.commitAttachedFollow('entries-changed')
          : F.queueLayoutReplacement('entries-changed'));
    }, [F, X, ue, E, ce]),
    (0, g.useLayoutEffect)(() => {
      if (j.current) return;
      const H = v.current;
      if (!H) return;
      const L = [];
      for (const [$, oe] of k.current) L.push({key: $, heightPx: oe.offsetHeight, target: oe});
      if (L.length > 0) {
        for (const $ of L)
          k.current.get($.key) === $.target &&
            (M.current.set($.key, $.heightPx), w.current.push($.heightPx), w.current.length > 50 && w.current.shift());
        ue();
      }
      F.openAtBottom();
      const D = I.current;
      (D && E(D, F.getLocation().distanceFromBottomPx, H.clientHeight),
        ee(F.getLocation()),
        (j.current = true),
        W.current || F.notifyStreamingEnded());
    }, [F, X, ee, ue, E]),
    (0, g.useLayoutEffect)(() => {
      if (!j.current) return;
      const H = [];
      for (const [L, D] of k.current) H.push({key: L, heightPx: D.offsetHeight, target: D});
      fe(H);
    }, [fe, isStreaming, X, V]));
  const Te = (0, g.useMemo)(
    () => ({
      scrollToBottom: (H = 'instant') => {
        (F.scrollToBottom(H), ee(F.getLocation()));
      },
      scrollToKey: (H, L = 'start') => {
        const D = I.current,
          $ = v.current;
        if (!D || !$) return;
        const oe = F.distanceForKey(D, H, $.clientHeight, L);
        oe !== null && (E(D, oe, $.clientHeight), F.scrollToKeyDistance(oe, 'instant'), ee(F.getLocation()));
      },
      preserveElementViewportPosition: (H, L) => {
        F.preserveElementViewportPosition(H, L);
      },
      getLocation: () => {
        const H = F.getLocation(),
          L = R.current;
        return {
          distanceFromBottomPx: H.distanceFromBottomPx,
          isAtBottom: H.isAtBottom,
          renderedRange: {startIndex: L.startIndex, endIndex: L.endIndex},
        };
      },
    }),
    [F, ee, E],
  );
  (0, g.useImperativeHandle)(ref, () => Te, [Te]);
  const Le = I.current ?? ue();
  R.current.endIndex === 0 && Le.keys.length > 0 && ((R.current = visibleRange(Le, 0, ce)), (N.current = Le.keys));
  const De = R.current,
    Ne = [];
  for (let H = De.startIndex; H < De.endIndex; H += 1) {
    const L = entries[H],
      D = he[H];
    !L ||
      !D ||
      Ne.push(
        (0, a.jsx)(
          'div',
          {
            'data-index': H,
            'data-message-key': D,
            'data-testid': 'message-list-item',
            ref: ye,
            children: (0, a.jsx)(ItemContent, {context, data: L, index: H}),
          },
          D,
        ),
      );
  }
  return (0, a.jsx)(MethodsContext.Provider, {
    value: Te,
    children: (0, a.jsx)(LocationContext.Provider, {
      value: _,
      children: (0, a.jsxs)('div', {
        className,
        'data-testid': 'message-list-root',
        style: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          position: 'relative',
          width: '100%',
          ...style,
        },
        children: [
          (0, a.jsx)('div', {
            className: scrollerClassName,
            'data-testid': 'message-list-scroller',
            ref: v,
            style: {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: useReversedGeometry ? 'column-reverse' : 'column',
              minHeight: 0,
              overflowAnchor: 'none',
              overflowX: 'hidden',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              width: '100%',
              zIndex: 0,
            },
            children: (0, a.jsx)('div', {
              'data-testid': 'message-list-content',
              ref: C,
              style: {
                boxSizing: 'border-box',
                display: 'flex',
                flex: '1 0 auto',
                flexDirection: 'column',
                minHeight: '100%',
                minWidth: 0,
                width: '100%',
              },
              children: (0, a.jsxs)('div', {
                ...contentProps,
                className: contentClassName,
                'data-testid': 'message-list-column',
                style: {
                  boxSizing: 'border-box',
                  display: 'flex',
                  flex: '1 0 auto',
                  flexDirection: 'column',
                  minWidth: 0,
                  width: '100%',
                  ...(contentProps?.style ?? null),
                },
                children: [
                  (0, a.jsx)('div', {
                    'aria-hidden': 'true',
                    'data-testid': 'message-list-top-spacer',
                    style: {flexShrink: 0, height: De.topSpacerPx},
                  }),
                  Ne,
                  (0, a.jsx)('div', {
                    'aria-hidden': 'true',
                    'data-testid': 'message-list-bottom-spacer',
                    style: {flexShrink: 0, height: De.bottomSpacerPx},
                  }),
                  Footer
                    ? (0, a.jsx)('div', {
                        'data-testid': 'message-list-footer',
                        ref: S,
                        children: (0, a.jsx)(Footer, {context}),
                      })
                    : null,
                ],
              }),
            }),
          }),
          StickyFooter
            ? (0, a.jsx)('div', {
                'data-testid': 'message-list-sticky-footer',
                style: {inset: 0, pointerEvents: 'none', position: 'absolute', zIndex: 1},
                children: (0, a.jsx)(StickyFooter, {context}),
              })
            : null,
        ],
      }),
    }),
  });
}
var dotsVariants = Rs('inline-flex items-center justify-center', {
  variants: {messagePlacement: {bottom: 'flex-col gap-2', right: 'flex-row gap-2', left: 'flex-row-reverse gap-2'}},
  defaultVariants: {messagePlacement: 'bottom'},
}); /** BouncingDots: three dots that bounce, with an optional message. */
function dh({dots = 3, message, messagePlacement = 'bottom', className, dotClassName, ...o}) {
  return (0, a.jsxs)('div', {
    'data-slot': 'bouncing-dots',
    className: Y(dotsVariants({messagePlacement}), className),
    ...o,
    children: [
      (0, a.jsx)('div', {
        className: 'inline-flex items-center justify-center gap-0.5',
        children: Array.from({length: dots}, (i, c) =>
          (0, a.jsx)(
            Mt.span,
            {
              className: Y('size-1 shrink-0 rounded-full bg-current', dotClassName),
              animate: {y: [0, -3, 0, 0]},
              transition: {
                duration: 1.2,
                times: [0, 0.25, 0.5, 1],
                repeat: Number.POSITIVE_INFINITY,
                delay: c * 0.2,
                ease: 'easeInOut',
              },
            },
            c,
          ),
        ),
      }),
      message ? (0, a.jsx)('div', {children: message}) : null,
    ],
  });
}
var mergeStepGroups = e => {
  const t = [];
  for (const n of e) {
    const r = t.at(-1);
    n.type === 'steps' && r?.type === 'steps'
      ? ((r.status = n.status), r.steps.push(...n.steps))
      : t.push(n.type === 'steps' ? {...n, steps: [...n.steps]} : n);
  }
  return t;
}; /** runItems: a run’s items, without errors the user does not need to see, step groups merged. */
function hh({hideUserInterruptedAbortMessage, paymentRequiredRunId, row}) {
  const r = row.assistantMessages.at(-1),
    s = hideUserInterruptedAbortMessage && r?.stopReason === 'aborted',
    o = row.runId === paymentRequiredRunId;
  return mergeStepGroups(row.items.filter(i => (i.type !== 'error' ? true : ur(i.errorMessage) ? o : !s)));
}
var isSubagentSpawn = e => e.part.name === 'subagent' && e.part.arguments.action === 'spawn',
  Ja = (e, t) => {
    const n = [];
    for (const r of e) {
      const s = isSubagentSpawn(r.step),
        o = n.at(-1);
      o?.subagents === s ? o.entries.push(r) : n.push({subagents: s, entries: [r]});
    }
    return n.flatMap(r =>
      r.subagents
        ? [{type: 'subagents', steps: r.entries}]
        : lu(r.entries, t).map(s =>
            s.type === 'step' ? {type: 'tool', step: s.step} : {type: 'group', steps: s.steps},
          ),
    );
  }; /** The tool steps of a run’s last step group still running, as the activity line shows them. */
function liveToolSteps(e, t) {
  for (const n of mergeStepGroups(e.items).toReversed()) {
    if (n.type !== 'steps') return [];
    const r = n.steps.flatMap(o => {
      if (o.part.type !== 'toolCall') return [];
      const i = mr(o.part, o.result, {isStreaming: true, sessionId: t});
      return Ye(i.call.name).hide?.(i) ? [] : [{step: {...o, part: o.part}, props: i}];
    });
    if (r.length === 0) continue;
    const s = Ja(r, ({props}) => Kn(props)).at(-1);
    return s?.type === 'group'
      ? s.steps.map(({step}) => step)
      : s?.type === 'tool' && Kn(s.step.props)
        ? [s.step.step]
        : [];
  }
  return [];
}
var stopStatus = e =>
    typeof e.stopReason == 'string' ? (e.stopReason === 'stop' ? 'done' : e.stopReason.trim().toLowerCase()) : void 0,
  gh = e => e.role === 'assistant' && stopStatus(e) === 'done';
function $e(e) {
  return e.type === 'assistant-activity' ? (e.renderKey ?? e.runId) : e.key;
}
function xh(e) {
  return e.items.some(t => t.type === 'steps' && t.status === 'streaming');
}
function pt(e) {
  return e.part.type === 'toolCall' ? e.part.id : `reasoning-${e.index}`;
}
var BOLD_LINE = /\*\*([^\n*]+)\*\*/g,
  lastThinkingText,
  lastThinkingHeader = null; /** The Thinking header: the last bold line of the thinking text. */
function thinkingHeaderOf(e) {
  return (
    e === lastThinkingText ||
      ((lastThinkingText = e), (lastThinkingHeader = [...e.matchAll(BOLD_LINE)].at(-1)?.[1]?.trim() ?? null)),
    lastThinkingHeader
  );
}
function currentThinkingHeader(e) {
  const t = e.findLast(r => r.type === 'assistant-activity' || r.type === 'message');
  if (t?.type !== 'assistant-activity') return null;
  let n = false;
  for (let r = t.items.length - 1; r >= 0; r -= 1) {
    const s = t.items[r];
    if (s.type === 'steps')
      for (let o = s.steps.length - 1; o >= 0; o -= 1) {
        const i = s.steps[o].part;
        if (i.type !== 'thinking') continue;
        n = true;
        const c = thinkingHeaderOf(i.thinking);
        if (c) return c;
      }
  }
  return n ? 'Thinking' : null;
} /** The current run’s activity: its live steps and Thinking header while it runs. */
function useRunActivity({rows, sessionId, isRunning, streamingMessage, startedAt}) {
  const o = rows.findLast(p => p.type === 'assistant-activity' || p.type === 'message'),
    i = () => {
      if (startedAt !== void 0 || streamingMessage || o?.type !== 'assistant-activity') return;
      const p = o.assistantMessages.at(-1)?.stopReason;
      return p === 'stop' || p === 'error' || p === 'aborted' ? o.runId : void 0;
    },
    [c, l] = (0, g.useState)(() => ({isRunning, previousRunId: i()}));
  let u = c.previousRunId;
  if (
    (c.isRunning !== isRunning && ((u = isRunning ? i() : void 0), l({isRunning, previousRunId: u})),
    !isRunning || rows.at(-1)?.type === 'compacting')
  )
    return null;
  const h =
    o?.type === 'assistant-activity' &&
    o.runId !== u &&
    (startedAt === void 0 ? o.isStreaming : o.assistantMessages.some(p => p.timestamp >= startedAt))
      ? o
      : void 0;
  if (h?.items.at(-1)?.type === 'content') return null;
  const d = h?.items
      .flatMap(p => (p.type === 'steps' ? p.steps : []))
      .toReversed()
      .flatMap(p =>
        p.part.type === 'toolCall' && !p.result ? [mr(p.part, p.result, {isStreaming: true, sessionId})] : [],
      )
      .find(p => !Ye(p.call.name).hide?.(p)),
    m = h ? liveToolSteps(h, sessionId) : [];
  return {runId: h?.runId, steps: m, active: d, thinkingHeader: (h && currentThinkingHeader([h])) || 'Thinking'};
}
var MessageListContext = (0, g.createContext)(null),
  to = (0, g.createContext)(void 0) /** MessageListProvider: the list’s settings and its run activity. */,
  wh = ({children, rows, isRunning, startedAt, value}) => {
    const o = xa(),
      i = useRunActivity({rows, sessionId: value.sessionId, isRunning, startedAt, streamingMessage: o});
    return (0, a.jsx)(MessageListContext, {value, children: (0, a.jsx)(to, {value: i, children})});
  },
  Sn = () => {
    const e = (0, g.use)(MessageListContext);
    if (!e) throw new Error('useMessageListContext must be used within MessageListContextProvider');
    return e;
  },
  no = () => {
    const e = (0, g.use)(to);
    if (e === void 0) throw new Error('useMessageListActivity must be used within MessageListContextProvider');
    return e;
  }
