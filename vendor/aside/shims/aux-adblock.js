// chrome.asideAdblock for browsers without the native Aside content blocker. Filter lists are
// fetched and parsed into declarativeNetRequest dynamic rules. Cosmetic filters, scriptlets and
// rules DNR cannot express (redirect, removeparam, csp, popup...) are skipped.
(() => {
  if (typeof chrome === "undefined" || chrome.asideAdblock || !chrome.declarativeNetRequest) return;
  const dnr = chrome.declarativeNetRequest;

  const KEY_ENABLED = "aux.adblock.enabled";
  const KEY_SUBS = "aux.adblock.subscriptions";
  const KEY_CUSTOM = "aux.adblock.customRules";
  const rulesKey = (id) => `aux.adblock.rules.${id}`;
  const RULE_CAP = 29000;
  const DOMAINS_PER_RULE = 1000;
  const REGEX_CAP = 500;
  const CUSTOM_LIMIT = 4 * 1024 * 1024;
  const DAILY_ALARM = "aux.adblock.update";

  const TYPES = {
    script: "script",
    image: "image",
    stylesheet: "stylesheet",
    css: "stylesheet",
    xmlhttprequest: "xmlhttprequest",
    xhr: "xmlhttprequest",
    subdocument: "sub_frame",
    frame: "sub_frame",
    media: "media",
    font: "font",
    websocket: "websocket",
    ping: "ping",
    object: "object",
    other: "other",
  };
  const ALL_TYPES = [...new Set(Object.values(TYPES)), "main_frame"];

  const local = {
    get: async (key, fallback) => (await chrome.storage.local.get(key))[key] ?? fallback,
    set: (key, value) => chrome.storage.local.set({ [key]: value }),
    remove: (key) => chrome.storage.local.remove(key),
  };

  /** Parses an Adblock Plus / uBlock network filter into a DNR rule template, or null. */
  function parseFilter(raw) {
    let line = raw.trim();
    if (!line || line[0] === "!" || line[0] === "[" || line.startsWith("#")) return null;
    if (/#[@?$%]?#|#@?\$#|\+js\(/.test(line)) return null;
    const exception = line.startsWith("@@");
    if (exception) line = line.slice(2);

    let pattern = line;
    let optionText = "";
    const dollar = line.lastIndexOf("$");
    if (dollar >= 0) {
      const tail = line.slice(dollar + 1);
      if (/^~?[\w-]+(?:=[^$]*)?(?:,~?[\w-]+(?:=[^$]*)?)*$/.test(tail)) {
        pattern = line.slice(0, dollar);
        optionText = tail;
      }
    }

    const include = new Set();
    const exclude = new Set();
    let thirdParty;
    let important = false;
    let matchCase = false;
    let document = false;
    let all = false;
    let initiators;
    let excludedInitiators;
    for (const option of optionText ? optionText.split(",") : []) {
      const negated = option.startsWith("~");
      const [name, value] = (negated ? option.slice(1) : option).split(/=(.*)/s);
      if (name in TYPES) (negated ? exclude : include).add(TYPES[name]);
      else if (name === "document" || name === "doc") {
        if (negated) exclude.add("main_frame");
        else document = true;
      } else if (name === "all") all = true;
      else if (name === "third-party" || name === "3p") thirdParty = !negated;
      else if (name === "first-party" || name === "1p") thirdParty = negated;
      else if (name === "match-case") matchCase = true;
      else if (name === "important") important = true;
      else if (name === "domain" || name === "from") {
        for (const entry of (value ?? "").split("|")) {
          if (!entry || entry.includes("*") || entry.startsWith("/")) {
            if (entry && !entry.startsWith("~")) return null;
            continue;
          }
          if (entry.startsWith("~")) (excludedInitiators ??= []).push(entry.slice(1).toLowerCase());
          else (initiators ??= []).push(entry.toLowerCase());
        }
      } else return null;
    }

    const condition = {};
    let domainOnly = null;
    if (pattern.length > 2 && pattern.startsWith("/") && pattern.endsWith("/")) {
      condition.regexFilter = pattern.slice(1, -1);
    } else if (pattern) {
      if (/[^\x20-\x7e]/.test(pattern) || pattern === "|" || pattern === "||" || pattern.startsWith("||*") || pattern.startsWith("|*")) return null;
      const domain = pattern.match(/^\|\|([a-z0-9][a-z0-9.-]*[a-z0-9])\^?$/i);
      if (domain && (pattern.endsWith("^") || !pattern.slice(2).includes("/"))) domainOnly = domain[1].toLowerCase();
      else condition.urlFilter = pattern;
    }
    if (matchCase) condition.isUrlFilterCaseSensitive = true;
    if (thirdParty !== undefined) condition.domainType = thirdParty ? "thirdParty" : "firstParty";
    if (initiators) condition.initiatorDomains = initiators;
    if (excludedInitiators) condition.excludedInitiatorDomains = excludedInitiators;

    let action = exception ? "allow" : "block";
    if (all) condition.resourceTypes = ALL_TYPES;
    else if (document && !include.size) {
      condition.resourceTypes = ["main_frame"];
      if (exception) action = "allowAllRequests";
    } else if (include.size) condition.resourceTypes = [...include];
    else if (exclude.size) condition.excludedResourceTypes = [...exclude];
    if (!pattern && !optionText) return null;
    if (!pattern && !initiators && !condition.resourceTypes && !condition.excludedResourceTypes && thirdParty === undefined) return null;

    const priority = important ? (exception ? 4 : 3) : exception ? 2 : 1;
    return { action: { type: action }, condition, priority, domain: domainOnly };
  }

  function parseList(text, limit = Infinity) {
    const rules = [];
    for (const line of text.split(/\r?\n/)) {
      const rule = parseFilter(line);
      if (rule) rules.push(rule);
      if (rules.length >= limit) break;
    }
    return rules;
  }

  /** Merges `||domain^` rules that share every other property into one requestDomains rule. */
  function collapse(templates) {
    const seen = new Set();
    const groups = new Map();
    const out = [];
    for (const template of templates) {
      const { domain, ...rule } = template;
      const key = JSON.stringify(rule);
      if (domain) {
        let group = groups.get(key);
        if (!group) groups.set(key, (group = { rule, domains: new Set() }));
        group.domains.add(domain);
      } else if (!seen.has(key)) {
        seen.add(key);
        out.push(rule);
      }
    }
    for (const { rule, domains } of groups.values()) {
      const list = [...domains];
      for (let index = 0; index < list.length; index += DOMAINS_PER_RULE) {
        out.push({ ...rule, condition: { ...rule.condition, requestDomains: list.slice(index, index + DOMAINS_PER_RULE) } });
      }
    }
    return out;
  }

  let applying = Promise.resolve();
  let compiling = 0;

  async function applyRules() {
    compiling++;
    try {
      const enabled = await local.get(KEY_ENABLED, false);
      const subscriptions = await local.get(KEY_SUBS, []);
      const templates = [];
      if (enabled) {
        const custom = parseList(await local.get(KEY_CUSTOM, ""));
        templates.push(...custom);
        for (const subscription of subscriptions) {
          if (subscription.enabled) templates.push(...(await local.get(rulesKey(subscription.id), [])));
        }
      }
      let rules = collapse(templates);
      // Exceptions first so they survive the cap, then important blocks, then plain blocks.
      rules.sort((a, b) => b.priority - a.priority);
      rules = rules.slice(0, RULE_CAP);

      let regexCount = 0;
      const supported = [];
      for (const rule of rules) {
        if (rule.condition.regexFilter !== undefined) {
          if (regexCount >= REGEX_CAP) continue;
          const { isSupported } = await dnr.isRegexSupported({
            regex: rule.condition.regexFilter,
            isCaseSensitive: !!rule.condition.isUrlFilterCaseSensitive,
          });
          if (!isSupported) continue;
          regexCount++;
        }
        supported.push(rule);
      }

      const existing = await dnr.getDynamicRules();
      await dnr.updateDynamicRules({ removeRuleIds: existing.map((rule) => rule.id) });
      const withIds = supported.map((rule, index) => ({ ...rule, id: index + 1 }));
      const add = async (batch) => {
        try {
          await dnr.updateDynamicRules({ addRules: batch });
        } catch (error) {
          if (batch.length === 1) console.warn("[aux-adblock] rejected rule", batch[0], error);
          else {
            const middle = batch.length >> 1;
            await add(batch.slice(0, middle));
            await add(batch.slice(middle));
          }
        }
      };
      for (let index = 0; index < withIds.length; index += 2000) await add(withIds.slice(index, index + 2000));
    } finally {
      compiling--;
    }
  }

  const apply = () => (applying = applying.catch(() => {}).then(applyRules));

  // Subscription records are read-modify-write; concurrent update jobs would lose each other's edits.
  let mutations = Promise.resolve();
  const mutateSubscriptions = (change) => {
    const run = mutations.catch(() => {}).then(async () => {
      const subscriptions = await local.get(KEY_SUBS, []);
      const result = await change(subscriptions);
      await local.set(KEY_SUBS, subscriptions);
      return result;
    });
    mutations = run;
    return run;
  };
  const subscriptionsOf = () => mutations.catch(() => {}).then(() => local.get(KEY_SUBS, []));
  const patchSubscription = (id, changes) =>
    mutateSubscriptions((subscriptions) => {
      const subscription = subscriptions.find((entry) => entry.id === id);
      if (subscription) Object.assign(subscription, changes);
    });

  async function refreshSubscription(subscription) {
    await patchSubscription(subscription.id, { status: "downloading" });
    try {
      const response = await fetch(subscription.url, { cache: "no-cache" });
      if (!response.ok) throw new Error(`${response.status}`);
      const text = await response.text();
      await patchSubscription(subscription.id, { status: "compiling" });
      await local.set(rulesKey(subscription.id), parseList(text));
      await patchSubscription(subscription.id, { status: "ready", lastSuccessfulCheckMs: Date.now() });
      return true;
    } catch (error) {
      console.warn("[aux-adblock] list failed", subscription.url, error);
      await patchSubscription(subscription.id, { status: "failed" });
      return false;
    }
  }

  const jobs = new Map();
  const activeJobs = new Set();

  function startJob(ids) {
    const jobId = crypto.randomUUID();
    const job = { status: "running" };
    jobs.set(jobId, job);
    activeJobs.add(jobId);
    (async () => {
      const subscriptions = (await subscriptionsOf()).filter((entry) => ids.includes(entry.id));
      await Promise.all(subscriptions.map((entry) => patchSubscription(entry.id, { status: "queued" })));
      const results = [];
      for (const subscription of subscriptions) results.push(await refreshSubscription(subscription));
      await apply();
      const failed = results.filter((ok) => !ok).length;
      job.status = failed === 0 ? "succeeded" : failed === results.length ? "failed" : "partiallyFailed";
    })()
      .catch((error) => {
        console.warn("[aux-adblock] update failed", error);
        job.status = "failed";
      })
      .finally(() => activeJobs.delete(jobId));
    return jobId;
  }

  const adblock = {
    getState: async () => ({
      available: true,
      stateLoaded: true,
      enabled: await local.get(KEY_ENABLED, false),
      compiling: compiling > 0,
      activeUpdateJobIds: [...activeJobs],
    }),
    setEnabled: async (enabled) => {
      await local.set(KEY_ENABLED, !!enabled);
      await apply();
    },
    getSubscriptions: async () => (await subscriptionsOf()).map(({ id, url, name, enabled, status, lastSuccessfulCheckMs }) => ({ id, url, name, enabled, status, lastSuccessfulCheckMs: lastSuccessfulCheckMs ?? 0 })),
    addSubscription: async ({ url, name }) => {
      const subscription = await mutateSubscriptions((subscriptions) => {
        let existing = subscriptions.find((entry) => entry.url === url);
        if (!existing) {
          existing = { id: crypto.randomUUID().slice(0, 8), url, name: name || url, enabled: true, status: "queued", lastSuccessfulCheckMs: 0 };
          subscriptions.push(existing);
        }
        return existing;
      });
      return { updateJobId: startJob([subscription.id]) };
    },
    removeSubscription: async (id) => {
      await mutateSubscriptions((subscriptions) => {
        const index = subscriptions.findIndex((entry) => entry.id === id);
        if (index >= 0) subscriptions.splice(index, 1);
      });
      await local.remove(rulesKey(id));
      await apply();
    },
    setSubscriptionEnabled: async (id, enabled) => {
      await patchSubscription(id, { enabled: !!enabled });
      await apply();
    },
    getCustomRules: async () => ({ rules: await local.get(KEY_CUSTOM, "") }),
    saveCustomRules: async ({ rules }) => {
      if (new TextEncoder().encode(rules).length > CUSTOM_LIMIT) throw new Error("Custom rules are too large (4 MiB maximum).");
      await local.set(KEY_CUSTOM, rules);
      await apply();
    },
    getSubscriptionUpdateProgress: async (jobId) => ({ status: jobs.get(jobId)?.status ?? "failed" }),
    startSubscriptionUpdate: async () => ({ jobId: startJob((await subscriptionsOf()).filter((entry) => entry.enabled).map((entry) => entry.id)) }),
    clearEngineCache: async () => {
      await apply();
    },
  };
  chrome.asideAdblock = adblock;

  // The service worker keeps lists fresh and restores rules; dynamic rules persist across restarts.
  if (typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope && chrome.alarms) {
    chrome.alarms.get(DAILY_ALARM).then((alarm) => {
      if (!alarm) chrome.alarms.create(DAILY_ALARM, { periodInMinutes: 24 * 60 });
    });
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === DAILY_ALARM && (await local.get(KEY_ENABLED, false))) await adblock.startSubscriptionUpdate();
    });

    // Whole-page blocks (`$document` and `$all` rules) show Aux's interstitial instead of Chromium's error page.
    chrome.webNavigation?.onErrorOccurred.addListener(async (details) => {
      if (details.frameId !== 0 || details.error !== "net::ERR_BLOCKED_BY_CLIENT" || !/^https?:/.test(details.url)) return;
      if (!(await local.get(KEY_ENABLED, false))) return;
      chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL(`blocked.html?url=${encodeURIComponent(details.url)}`) }).catch(() => {});
    });
  }
})();
