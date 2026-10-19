import { Button, Empty, ErrorNotice } from '@aux/ui';
import { useEffect, useRef, useState } from 'react';
import { rpc } from './daemon';
import type { Session } from './types';

type Result = {
  id: string;
  title: string;
  detail: string;
  group: string;
  activate: () => Promise<unknown>;
};
export function TabSearch({ accountId }: { accountId: number }) {
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<Result[]>([]);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabsRevision, setTabsRevision] = useState(0);
  const selectedId = useRef<string | undefined>(undefined);
  const revision = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    selectedId.current = rows[selected]?.id;
  }, [rows, selected]);
  useEffect(() => {
    const changed = () => setTabsRevision((value) => value + 1);
    chrome.tabs.onCreated.addListener(changed);
    chrome.tabs.onRemoved.addListener(changed);
    chrome.tabs.onUpdated.addListener(changed);
    chrome.sessions.onChanged.addListener(changed);
    return () => {
      chrome.tabs.onCreated.removeListener(changed);
      chrome.tabs.onRemoved.removeListener(changed);
      chrome.tabs.onUpdated.removeListener(changed);
      chrome.sessions.onChanged.removeListener(changed);
    };
  }, []);
  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Tab events invalidate the result snapshot without changing the query.
  useEffect(() => {
    const current = ++revision.current;
    setLoading(true);
    const timer = setTimeout(() => {
      void load().catch((error) => {
        if (current === revision.current) {
          setError(error.message);
          setLoading(false);
        }
      });
      async function load() {
        const [tabs, closed, tasks, bookmarks, history] = await Promise.all([
          chrome.tabs.query({}),
          chrome.extension.inIncognitoContext
            ? Promise.resolve([])
            : chrome.sessions.getRecentlyClosed({ maxResults: 25 }),
          chrome.extension.inIncognitoContext
            ? Promise.resolve([])
            : rpc<Session[]>('sessions.list', {
                accountId,
                limit: query ? 50 : 2,
              }),
          query && !chrome.extension.inIncognitoContext
            ? chrome.bookmarks.search(query)
            : Promise.resolve([]),
          query && !chrome.extension.inIncognitoContext
            ? chrome.history.search({
                text: query,
                maxResults: 50,
                startTime: 0,
              })
            : Promise.resolve([]),
        ]);
        const limit = query ? 50 : 2;
        const matches = (title?: string, url?: string) =>
          !query ||
          `${title ?? ''} ${url ?? ''}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase());
        const results: Result[] = [];
        for (const tab of tabs
          .filter(
            (tab) =>
              tab.incognito === chrome.extension.inIncognitoContext &&
              matches(tab.title, tab.url),
          )
          .slice(0, limit)) {
          results.push({
            id: `tab.${tab.id}`,
            title: tab.title ?? tab.url ?? 'Tab',
            detail: tab.url ?? '',
            group: 'Open tabs',
            activate: async () => {
              if (tab.id !== undefined)
                await chrome.tabs.update(tab.id, { active: true });
              if (tab.windowId !== undefined)
                await chrome.windows.update(tab.windowId, { focused: true });
            },
          });
        }
        for (const item of closed
          .filter((item) => item.tab && matches(item.tab.title, item.tab.url))
          .slice(0, limit)) {
          const tab = item.tab;
          results.push({
            id: `closed.${tab?.sessionId}`,
            title: tab?.title ?? 'Closed tab',
            detail: tab?.url ?? '',
            group: 'Recently closed',
            activate: () => chrome.sessions.restore(tab?.sessionId),
          });
        }
        for (const task of tasks
          .filter((task) => matches(task.title))
          .slice(0, limit)) {
          results.push({
            id: `task.${task.id}`,
            title: task.title,
            detail: task.status,
            group: 'Tasks',
            activate: async () => {
              const url = chrome.runtime.getURL(`index.html#/chat/${task.id}`);
              const existing = tabs.find((tab) => tab.url === url);
              if (existing?.id !== undefined) {
                await chrome.tabs.update(existing.id, { active: true });
                await chrome.windows.update(existing.windowId, {
                  focused: true,
                });
              } else await chrome.tabs.create({ url });
            },
          });
        }
        for (const [group, items] of [
          ['Saved pages', bookmarks],
          ['History', history],
        ] as const) {
          for (const item of items
            .filter((item) => item.url && /^https?:/.test(item.url))
            .slice(0, limit)) {
            results.push({
              id: `${group}.${item.id}`,
              title: item.title ?? item.url ?? 'Page',
              detail: item.url ?? '',
              group,
              activate: () => chrome.tabs.create({ url: item.url }),
            });
          }
        }
        if (current === revision.current) {
          setRows(results);
          setSelected(
            Math.max(
              0,
              results.findIndex((row) => row.id === selectedId.current),
            ),
          );
          setLoading(false);
          setError('');
        }
      }
    }, 80);
    return () => {
      clearTimeout(timer);
      revision.current++;
    };
  }, [accountId, query, tabsRevision]);
  async function activate(index: number) {
    try {
      const row = rows[index];
      if (!row) return;
      await row.activate();
      window.close();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'This result could not open.',
      );
    }
  }
  return (
    <main className="tab-search">
      <header>
        <input
          ref={input}
          value={query}
          placeholder="Find tabs, tasks and saved pages"
          aria-label="Find tabs, tasks and saved pages"
          onChange={(event) => {
            selectedId.current = undefined;
            setQuery(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              if (rows.length) {
                const next =
                  (selected +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    rows.length) %
                  rows.length;
                setSelected(next);
                document
                  .getElementById(`result-${next}`)
                  ?.scrollIntoView({ block: 'nearest' });
              }
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              void activate(selected);
            }
            if (
              event.key === 'Escape' ||
              (event.metaKey &&
                event.shiftKey &&
                event.key.toLowerCase() === 'a')
            )
              window.close();
          }}
        />
      </header>
      {error && <ErrorNotice error={error} />}
      <div className="tab-results" role="listbox" aria-label="Search results">
        {loading ? (
          <Empty>Loading…</Empty>
        ) : rows.length === 0 ? (
          <Empty>Nothing matched this search.</Empty>
        ) : (
          rows.map((row, index) => (
            <div key={row.id}>
              {(index === 0 || rows[index - 1]?.group !== row.group) && (
                <small className="group-caption">{row.group}</small>
              )}
              <Button
                id={`result-${index}`}
                role="option"
                aria-selected={selected === index}
                onMouseEnter={() => setSelected(index)}
                onClick={() => void activate(index)}
              >
                <span>{row.title}</span>
                <small>{row.detail}</small>
              </Button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
