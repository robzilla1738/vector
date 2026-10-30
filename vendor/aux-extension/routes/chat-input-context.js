/* Aux-owned source, chat input pass 1 (assets/permission-approval-D-GTf91U.js, from the icons to the
 * chat input context hooks; the JSX runtime binding before it stays supplied): the arrow, check and
 * shield icons, the composer's session and input contexts, following the selection on the current
 * page, chat selections and their names, keeping the current tab and page selection in the
 * attachments, summarizing attachments, building the user message and the chat input reducer. The
 * chat input itself (js) stays supplied between the two passes: the tab-context validation inside it
 * belongs to vendor/provided/aux-productivity-tab-context.mjs.
 * Names the rest of the chunk uses keep their chunk names: a React, dn/xs/mn the icons, fn/at the
 * input and session contexts with gs/ys/pn their hooks, ws suspension kind, xn usePageSelection, Ee
 * isChatSelection, vs chatSelection, ue withCurrentContext, An userMessages, In the input reducer,
 * lt/ut/dt/mt the editor, attachment, submission and text contexts with Nn and bs/Cs/Ss/Le their hooks.
 * Chunk names used: n JSX runtime, de isSuspension, nt the active tab, Wt can read the page, Xt the
 * selection port, Yt the tab-change listener. */
dn = ({size = 24, ariaHidden = true, ...r}) =>
    (0, n.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, n.jsx)('path', {
        fillRule: 'evenodd',
        clipRule: 'evenodd',
        d: 'M12 3C12.5522 3.00007 13 3.44776 13 4V17.5859L17.293 13.293C17.6835 12.9025 18.3165 12.9025 18.707 13.293C19.0974 13.6835 19.0974 14.3165 18.707 14.707L12.707 20.707C12.3165 21.0975 11.6835 21.0975 11.293 20.707L5.29295 14.707C4.90243 14.3165 4.90243 13.6835 5.29295 13.293C5.68348 12.9025 6.31652 12.9025 6.70702 13.293L11 17.5859V4C11 3.44772 11.4477 3 12 3Z',
        fill: 'currentColor',
      }),
    }),
  xs = ({size = 24, ariaHidden = true, ...r}) =>
    (0, n.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, n.jsx)('path', {
        d: 'M17.1211 2C18.2871 2.00007 19.0068 3.27188 18.4072 4.27148L16.7705 7H20.6904C22.0262 7 22.6769 8.59886 21.7803 9.53223L21.6885 9.62012L8.04591 21.7705C6.90309 22.7879 5.15029 21.6422 5.62208 20.1875L7.62892 14H4.56349C3.4484 14 2.72298 12.8264 3.22169 11.8291L7.72169 2.8291L7.82912 2.64746C8.10654 2.24574 8.56646 2 9.06349 2H17.1211ZM5.37208 12H8.31642C9.27157 12 9.96603 12.8736 9.79005 13.7812L9.74318 13.9629L8.09279 19.0488L19.3779 9H15.8867C14.7214 8.99965 14.0011 7.7282 14.6006 6.72852L16.2383 4H9.37208L5.37208 12Z',
        fill: 'currentColor',
      }),
    }),
  mn = ({size = 24, ariaHidden = true, ...r}) =>
    (0, n.jsx)('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      'aria-hidden': ariaHidden,
      focusable: 'false',
      ...r,
      children: (0, n.jsx)('path', {
        d: 'M19 7.17702C18.9999 6.75011 18.7288 6.37051 18.3252 6.23171L12.6504 4.28053C12.2291 4.1357 11.7709 4.1357 11.3496 4.28053L5.6748 6.23171C5.27115 6.37053 5.00008 6.75015 5 7.17702V11.9124C5.00006 14.078 5.85114 15.5993 7.1875 16.8645C8.46329 18.0723 10.1528 19.0185 12 20.0178C13.8472 19.0185 15.5367 18.0723 16.8125 16.8645C18.1489 15.5993 18.9999 14.078 19 11.9124V7.17702ZM13.793 9.04225C14.1834 8.65209 14.8166 8.65209 15.207 9.04225C15.5976 9.43278 15.5976 10.0668 15.207 10.4573L11.707 13.9573C11.3166 14.3475 10.6834 14.3475 10.293 13.9573L8.79297 12.4573C8.40244 12.0668 8.40244 11.4328 8.79297 11.0423C9.18342 10.6521 9.81658 10.6521 10.207 11.0423L11 11.8352L13.793 9.04225ZM21 11.9124C20.9999 14.719 19.851 16.7417 18.1875 18.3167C16.5722 19.8459 14.4422 20.9759 12.4746 22.0374C12.1783 22.1972 11.8217 22.1972 11.5254 22.0374C9.55779 20.9759 7.42781 19.8459 5.8125 18.3167C4.14895 16.7417 3.00006 14.719 3 11.9124V7.17702C3.00008 5.89621 3.81324 4.75658 5.02441 4.3401L10.7002 2.38893C11.5425 2.09952 12.4575 2.09952 13.2998 2.38893L18.9756 4.3401C20.1868 4.75659 20.9999 5.89623 21 7.17702V11.9124Z',
        fill: 'currentColor',
      }),
    }),
  a = Et(Tt(), 1),
  fn = (0, a.createContext)(null),
  at = (0, a.createContext)(null),
  gs = () => {
    const e = (0, a.use)(fn);
    if (!e) throw new Error('useAgentSessionInput must be used within AgentSessionInputProvider');
    return e;
  },
  ys = () => {
    const e = (0, a.use)(at);
    if (!e) throw new Error('useAgentSessionComposerSession must be used within AgentSessionComposerProvider');
    return e;
  },
  pn = () => (0, a.use)(at),
  ws = e => (de(e) ? e.kind : 'default'); /** The text selected on the current page, if Aux may read it. */
async function readPageSelection() {
  if (typeof chrome > 'u' || !chrome.runtime?.sendMessage) return null;
  const e = await nt();
  return !e?.tabId || !Wt(e.url)
    ? null
    : ((await chrome.runtime.sendMessage({type: 'page-selection-context:get', tabId: e.tabId}))?.selection ?? null);
} /** Calls back with the page selection whenever it or the active tab changes. */
function watchPageSelection(e) {
  if (typeof chrome > 'u' || !chrome.runtime?.connect) return () => {};
  const t = async () => {
      e(await readPageSelection());
    },
    r = chrome.runtime.connect({name: Xt}),
    s = o => {
      o.type === 'page-selection-context:event' && t();
    };
  r.onMessage.addListener(s);
  const i = Yt(() => {
    t();
  });
  return () => {
    (i(), r.onMessage.removeListener(s), r.disconnect());
  };
}
function xn(e = true) {
  const [t, r] = (0, a.useState)(null);
  return (
    (0, a.useEffect)(() => {
      if (!e) {
        r(null);
        return;
      }
      let s = false;
      readPageSelection().then(o => {
        s || r(o);
      });
      const i = watchPageSelection(o => {
        s || r(o);
      });
      return () => {
        ((s = true), i());
      };
    }, [e]),
    t
  );
}
var SELECTION_NAME_MAX = 72,
  Ee = e => e.type === 'selection' && e.sourceKind === 'chat',
  vs = (e, t) => ({
    id: crypto.randomUUID(),
    type: 'selection',
    name: selectionName(e),
    selectionKind: 'text',
    text: e,
    sourceKind: 'chat',
    requestKey: `chat:${crypto.randomUUID()}`,
    comment: t,
  }),
  selectionName = e => {
    const t = e.replace(/\s+/g, ' ').trim();
    return t ? (t.length <= SELECTION_NAME_MAX ? t : `${t.slice(0, 69).trimEnd()}...`) : 'Selected text';
  },
  isPresent = e => e !== null,
  isTab = e => e.type === 'tab',
  isPageSelection = e => e.type === 'selection' && e.sourceKind !== 'chat',
  sameTab = (e, t) =>
    e?.targetId === t?.targetId && e?.name === t?.name && e?.url === t?.url && e?.faviconUrl === t?.faviconUrl,
  sameSelection = (e, t) =>
    e?.requestKey === t?.requestKey &&
    e?.name === t?.name &&
    e?.text === t?.text &&
    e?.selectionKind === t?.selectionKind &&
    e?.sourceKind === t?.sourceKind &&
    e?.comment === t?.comment &&
    e?.previewImage === t?.previewImage &&
    e?.elementSummary === t?.elementSummary &&
    JSON.stringify(e?.elements ?? []) === JSON.stringify(t?.elements ?? []),
  sameAttachment = (e, t) => {
    if (e === t) return true;
    if (e.type !== t.type) return false;
    switch (e.type) {
      case 'tab':
        return t.type === 'tab' && sameTab(e, t);
      case 'selection':
        return t.type === 'selection' && sameSelection(e, t);
      case 'file':
        return t.type !== 'file'
          ? false
          : e.id === t.id && e.name === t.name && e.mimeType === t.mimeType && e.path === t.path && e.data === t.data;
      case 'directory':
        return t.type === 'directory' && e.id === t.id && e.name === t.name && e.path === t.path;
    }
  } /** The attachments with the current tab and page selection kept up to date (unless suppressed); the same list when nothing changed. */,
  ue = (e, t) => {
    const r = e.find(isTab) ?? null,
      s = e.find(isPageSelection) ?? null,
      i = t.tabAttachment && !t.suppressedTabTargetIds.has(t.tabAttachment.targetId) ? t.tabAttachment : null,
      o =
        !(r && r.targetId !== i?.targetId) &&
        t.selectionAttachment &&
        t.selectionAttachment.requestKey !== t.suppressedSelectionRequestKey
          ? t.selectionAttachment
          : null,
      m = [i, o, ...e.filter(f => f.type !== 'tab' && !isPageSelection(f))].filter(isPresent);
    return e.length === m.length && sameTab(r, i) && sameSelection(s, o) && e.every((f, y) => sameAttachment(f, m[y]))
      ? e
      : m;
  };
function attachedFilesSummary(e) {
  const t = e.filter(s => s.type === 'file'),
    r = e.filter(s => s.type === 'directory');
  if (!(t.length === 0 && r.length === 0))
    return [
      t.length > 0
        ? ['Attached files:', ...t.map((s, i) => `${i + 1}. ${s.name}`)].join(`
`)
        : void 0,
      r.length > 0
        ? ['Attached folders:', ...r.map((s, i) => `${i + 1}. ${s.path}`)].join(`
`)
        : void 0,
    ].filter(s => s !== void 0).join(`

`);
} /** What a message with no text says about its attachments. */
function attachmentsSummary(e) {
  const t = e.filter(s => s.type === 'selection' && !Ee(s));
  if (t.length === 1 && e.every(s => s.type !== 'file' && s.type !== 'directory')) {
    const s = t[0];
    return s ? (s.selectionKind === 'region' && s.elementSummary) || s.name : void 0;
  }
  const r = [
    t.length > 0
      ? [
          'Selected items:',
          ...t.map((s, i) => `${i + 1}. ${(s.selectionKind === 'region' && s.elementSummary) || s.name}`),
        ].join(`
`)
      : void 0,
    attachedFilesSummary(e),
  ].filter(s => s !== void 0);
  return r.length > 0
    ? r.join(`

`)
    : void 0;
}
var userMessage = (e, t) => {
    const r = e.plainText.trim(),
      s = attachmentsSummary(t);
    return {role: 'user', content: (r.length > 0 ? r : s) ?? '', timestamp: Date.now()};
  } /** The message to send, after its attachment metadata when it has attachments. */,
  An = (e, t) => {
    const r = userMessage(e, t);
    return t.length === 0 ? r : [{role: 'user-message-metadata', attachments: t, timestamp: r.timestamp - 1}, r];
  };
function In(e, t) {
  switch (t.type) {
    case 'richInputSummary':
      return {...e, richInputAttachments: t.richInputAttachments, text: t.text};
    case 'updateAttachments':
      return {...e, attachments: t.update(e.attachments)};
    case 'uploadQueue':
      return {...e, uploadQueue: t.uploadQueue};
    case 'resetScope':
      return {
        ...e,
        attachments: t.attachments,
        initialRichInputSnapshot: t.initialRichInputSnapshot,
        richInputAttachments: t.richInputAttachments,
        text: t.text,
        uploadQueue: [],
      };
  }
}
var lt = (0, a.createContext)(null),
  ut = (0, a.createContext)(null),
  dt = (0, a.createContext)(null),
  mt = (0, a.createContext)(null),
  Nn = 0,
  bs = () => {
    const e = (0, a.use)(lt);
    if (!e) throw new Error('useChatInputEditor must be used within ChatInputProvider');
    return e;
  },
  Cs = () => {
    const e = (0, a.use)(ut);
    if (!e) throw new Error('useChatInputAttachments must be used within ChatInputProvider');
    return e;
  },
  Ss = () => {
    const e = (0, a.use)(dt);
    if (!e) throw new Error('useChatInputSubmission must be used within ChatInputProvider');
    return e;
  },
  Le = () => {
    const e = (0, a.use)(mt);
    if (!e) throw new Error('useChatInputText must be used within ChatInputProvider');
    return e;
  }
