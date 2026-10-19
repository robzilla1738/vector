// chrome.asideOmnibox for browsers without the native omnibox session API. Matches come from the
// typed input itself, browsing history, bookmarks, open tabs and Google's suggestion endpoint,
// shaped like the AutocompleteMatch objects Aside's new tab page expects.
(() => {
  if (typeof chrome === "undefined" || chrome.asideOmnibox || !chrome.history || !chrome.bookmarks || !chrome.tabs) return;

  const MAX_MATCHES = 8;
  const SEARCH_URL = "https://www.google.com/search?q=";
  const SUGGEST_URL = "https://suggestqueries.google.com/complete/search?client=chrome&q=";
  const SESSION_ERROR = "asideOmnibox session not found or not owned by this extension";

  const event = () => {
    const listeners = new Set();
    return {
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
      hasListener: (listener) => listeners.has(listener),
      emit: (...args) => listeners.forEach((listener) => listener(...args)),
    };
  };
  const onAutocompleteResultChanged = event();
  const onInputTextChanged = event();
  const onKeywordSelectedChanged = event();
  const onSessionInvalidated = event();

  const sessions = new Map();
  const session = (id) => {
    const found = sessions.get(id);
    if (!found) throw new Error(SESSION_ERROR);
    return found;
  };

  const strip = (url) => url.replace(/^https?:\/\/(?:www\.)?/i, "").replace(/\/$/, "");

  /** Returns a navigable URL when the input is address-like, otherwise null. */
  function toUrl(input) {
    const text = input.trim();
    if (!text || /\s/.test(text)) return null;
    if (/^[a-z][a-z\d+.-]*:\/\//i.test(text) || /^(?:about|chrome|aside|data|file|view-source):/i.test(text)) return text;
    if (/^(?:localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:[/?#].*)?$/i.test(text)) return `http://${text}`;
    if (/^[^/?#@:]+\.[a-z]{2,}(?::\d+)?(?:[/?#].*)?$/i.test(text)) return `https://${text}`;
    return null;
  }

  function topMatch(input) {
    const url = toUrl(input);
    if (url) return { type: "url-what-you-typed", contents: input, description: input, fillIntoEdit: input, destinationUrl: url, isSearchType: false };
    return { type: "search-what-you-typed", contents: input, description: "Search", fillIntoEdit: input, destinationUrl: SEARCH_URL + encodeURIComponent(input), isSearchType: true };
  }

  async function localMatches(input) {
    const needle = input.trim().toLowerCase();
    const [history, bookmarks, tabs] = await Promise.all([
      chrome.history.search({ text: needle, maxResults: 60, startTime: 0 }).catch(() => []),
      chrome.bookmarks.search(needle).catch(() => []),
      chrome.tabs.query({}).catch(() => []),
    ]);
    const seen = new Set();
    const out = [];
    const push = (match) => {
      const key = strip(match.destinationUrl);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(match);
    };

    for (const tab of tabs) {
      if (!tab.url || !/^https?:/.test(tab.url)) continue;
      if (!`${tab.title} ${tab.url}`.toLowerCase().includes(needle)) continue;
      push({
        type: "history-url",
        contents: strip(tab.url),
        description: tab.title || strip(tab.url),
        fillIntoEdit: tab.url,
        destinationUrl: tab.url,
        actions: [{ hint: "Switch to this tab" }],
        tabId: tab.id,
        windowId: tab.windowId,
        score: 1e9,
      });
    }
    for (const mark of bookmarks) {
      if (!mark.url) continue;
      push({ type: "bookmark-title", contents: strip(mark.url), description: mark.title || strip(mark.url), fillIntoEdit: mark.url, destinationUrl: mark.url, score: 5e8 });
    }
    for (const item of history) {
      if (!item.url || !/^https?:/.test(item.url)) continue;
      const host = strip(item.url).split("/")[0];
      const hostBoost = host.startsWith(needle) || host.startsWith(`www.${needle}`) ? 1e8 : 0;
      push({
        type: "history-url",
        contents: strip(item.url),
        description: item.title || strip(item.url),
        fillIntoEdit: item.url,
        destinationUrl: item.url,
        supportsDeletion: true,
        score: hostBoost + (item.typedCount ?? 0) * 1e4 + (item.visitCount ?? 0) * 100 + (item.lastVisitTime ?? 0) / 1e10,
      });
    }
    return out.sort((a, b) => b.score - a.score);
  }

  async function suggestions(input, signal) {
    try {
      const response = await fetch(SUGGEST_URL + encodeURIComponent(input), { signal });
      const [, list] = await response.json();
      return (Array.isArray(list) ? list : []).map((text) => ({
        type: "search-suggest",
        contents: text,
        description: "Search",
        fillIntoEdit: text,
        destinationUrl: SEARCH_URL + encodeURIComponent(text),
        isSearchType: true,
      }));
    } catch {
      return [];
    }
  }

  const publish = (id, state, input, matches) => {
    if (sessions.get(id) !== state || state.input !== input) return;
    state.matches = matches.slice(0, MAX_MATCHES).map(({ score, tabId, windowId, ...match }, line) => {
      state.targets[line] = { tabId, windowId };
      return match;
    });
    onAutocompleteResultChanged.emit(id, { input, matches: state.matches, selection: { actionIndex: 0, line: 0, state: "normal" } });
  };

  async function queryAutocomplete(id, input) {
    const state = session(id);
    state.abort?.abort();
    state.input = input;
    state.targets = [];
    const controller = (state.abort = new AbortController());
    const top = topMatch(input);

    const local = await localMatches(input);
    if (controller.signal.aborted) return;
    const head = [top, ...local.slice(0, 4)];
    publish(id, state, input, head);
    if (!top.isSearchType) return;
    const remote = await suggestions(input, controller.signal);
    if (controller.signal.aborted) return;
    const known = new Set(head.map((match) => match.fillIntoEdit.toLowerCase()));
    publish(id, state, input, [...head, ...remote.filter((match) => !known.has(match.fillIntoEdit.toLowerCase()))]);
  }

  async function open(url, disposition) {
    if (disposition === "newForegroundTab" || disposition === "newBackgroundTab") {
      await chrome.tabs.create({ url, active: disposition === "newForegroundTab" });
      return;
    }
    const current = await chrome.tabs.getCurrent?.();
    if (current?.id !== undefined) await chrome.tabs.update(current.id, { url });
    else {
      const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (active?.id !== undefined) await chrome.tabs.update(active.id, { url });
      else await chrome.tabs.create({ url });
    }
  }

  const nothing = async () => {};

  chrome.asideOmnibox = {
    createSession: async () => {
      const sessionId = crypto.randomUUID();
      sessions.set(sessionId, { input: "", matches: [], targets: [] });
      return { sessionId };
    },
    destroySession: async (id) => {
      sessions.get(id)?.abort?.abort();
      sessions.delete(id);
    },
    notifySessionStarted: async (id) => void session(id),
    notifySessionAbandoned: nothing,
    onFocusChanged: async (id) => void session(id),
    stopAutocomplete: async (id) => {
      const state = session(id);
      state.abort?.abort();
      state.input = "";
    },
    queryAutocomplete,
    setPopupSelection: async (id) => void session(id),
    activateKeyword: async (id) => void session(id),
    deleteAutocompleteMatch: async (id) => void session(id),
    executeAction: async (id, { line }) => {
      const target = session(id).targets[line];
      if (target?.tabId === undefined) return;
      await chrome.tabs.update(target.tabId, { active: true });
      if (target.windowId !== undefined) await chrome.windows.update(target.windowId, { focused: true });
    },
    openAutocompleteMatch: async (id, { url, mouseButton }) => {
      session(id);
      await open(url, mouseButton === 1 ? "newBackgroundTab" : "currentTab");
    },
    openPopupSelection: async (id, { disposition, selection }) => {
      const match = session(id).matches[Number(selection?.line ?? 0)];
      if (match) await open(match.destinationUrl, disposition ?? "currentTab");
    },
    onAutocompleteResultChanged,
    onInputTextChanged,
    onKeywordSelectedChanged,
    onSessionInvalidated,
  };
})();
