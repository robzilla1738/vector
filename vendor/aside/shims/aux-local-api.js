// Local stand-in for Aside's hosted API. Prepended to the daemon bundle: requests the daemon
// addresses to the hosted API origin are answered here instead of leaving the machine.
(() => {
  const ORIGIN = "http://aux-api.local";
  const realFetch = globalThis.fetch;
  const json = (status, body) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const decode = (text) =>
    text
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

  async function searchOne(query, signal) {
    const response = await realFetch("https://html.duckduckgo.com/html/", {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/155.0 Safari/537.36",
      },
      body: new URLSearchParams({ q: query }).toString(),
    });
    if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
    const html = await response.text();
    const found = [];
    const pattern =
      /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>)?/g;
    for (let match; (match = pattern.exec(html)); ) {
      let href = match[1].startsWith("//") ? `https:${match[1]}` : match[1];
      try {
        const redirect = new URL(href);
        const target = redirect.searchParams.get("uddg");
        if (target) href = decodeURIComponent(target);
        const url = new URL(href);
        if (url.protocol !== "https:" && url.protocol !== "http:") continue;
        found.push({ url: url.href, title: decode(match[2]), snippet: decode(match[3] ?? "") });
      } catch {
        /* skip malformed result */
      }
    }
    return found;
  }

  async function search(request) {
    const body = await request.json();
    const queries = [...new Set([body.objective, ...(body.search_queries ?? [])].filter(Boolean))];
    const settled = await Promise.allSettled(queries.map((query) => searchOne(query, request.signal)));
    const seen = new Set();
    const results = [];
    for (const outcome of settled) {
      if (outcome.status !== "fulfilled") continue;
      for (const item of outcome.value) {
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        results.push({
          url: item.url,
          title: item.title,
          publish_date: null,
          excerpts: item.snippet ? [item.snippet] : [],
        });
      }
    }
    if (results.length === 0 && settled.every((outcome) => outcome.status === "rejected")) {
      return json(502, { error: { code: "SEARCH_UNAVAILABLE", message: "Web search is unavailable right now." } });
    }
    return json(200, { session_id: body.session_id ?? null, results: results.slice(0, 12) });
  }

  const routes = {
    "POST /search": search,
    "POST /voc/session-feedback": () => json(200, {}),
    "POST /voc/session-feedback/upload": () => json(200, {}),
    "POST /stt/transcribe": () =>
      json(501, { error: { code: "NOT_IMPLEMENTED", message: "Voice transcription is not configured." } }),
  };

  globalThis.fetch = function auxFetch(input, init) {
    const target = typeof input === "string" ? input : input instanceof URL ? input.href : input?.url;
    if (!target?.startsWith(ORIGIN)) return realFetch.call(this, input, init);
    const request = new Request(input, init);
    const { pathname } = new URL(request.url);
    const handler = routes[`${request.method} ${pathname}`];
    if (handler) return Promise.resolve(handler(request)).catch((error) => json(500, { error: { code: "LOCAL_API_ERROR", message: String(error?.message ?? error) } }));
    if (pathname.startsWith("/releases/")) return Promise.resolve(json(404, {}));
    return Promise.resolve(
      json(404, { error: { code: "NOT_AVAILABLE", message: "This service is not available in Aux." } }),
    );
  };
})();
