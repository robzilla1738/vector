---
name: google-search
description: Use this when you need to search web on Google and websearch tool is not enough
icon: "/builtin-skills/v1/google-search.jpg"
---

# Google Search

The `googleSearch` global in the REPL fetches Google results with the browser profile's cookies and parses the page using selectors checked against a live results page. You don't need to look at the results page yourself unless parsing fails.

```js
const results = await googleSearch.search('openai', { limit: 5 });
console.log(JSON.stringify(results, null, 2));
// -> [{ title, url, sourceName, publishedAtText, snippet, sitelinks }]

// Later pages
const page2 = await googleSearch.search('openai', { start: 10 });
const page3 = await googleSearch.search('openai', { start: 20 });
```

## One query at a time

Never run Google searches in parallel. A burst of queries can set off a CAPTCHA or a bot block even when each query is fine on its own. So no `Promise.all` over a list of queries:

```js
// Don't do this.
const queries = ['first query', 'second query', 'third query'];
await Promise.all(queries.map((q) => googleSearch.search(q)));
```

Don't fire searches from a loop without waiting, either. Run one, read the results, then decide on the next.

## `googleSearch.search(query: string, opts?: GoogleSearchOptions): Promise<GoogleSearchResult[]>`

Returns compact, structured web results.

- The parser keys on attributes that stay stable in the live page: each result is a `div[data-rpos]`, and its title link is the first external `a[href]` around an `h3`. It deliberately ignores Google's frequently changing class names and `jsname` hooks.
- Paging uses Google's `start` offset: leave it out (or `0`) for page 1, `10` for page 2, `20` for page 3.
- Should the helper break, load the Google results URL in a tab and read it there.

```ts
interface GoogleSearchOptions {
  limit?: number; // most results to return; 10 by default
  safeSearch?: 'active' | 'off';
  language?: string; // 'en', 'ko', 'ja', ...
  country?: string; // 'us', 'kr', 'jp', ...
  start?: number; // paging offset; 10 = page 2
  time?: 'day' | 'week' | 'month' | 'year';
}

interface GoogleSearchResult {
  title: string;
  url: string;
  sourceName?: string;
  publishedAtText?: string; // like '2 hours ago'
  snippet?: string;
  sitelinks?: Array<{ title: string; url: string }>;
}
```
