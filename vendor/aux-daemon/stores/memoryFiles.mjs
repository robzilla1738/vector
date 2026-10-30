/** The memory pages store: Markdown pages under the account's memory directory and the history
 * of their changes. A page is changed under its write lock; a change that alters it is recorded
 * as an `edit` history entry. Context Awareness pages are left out of listings. The atomic write,
 * the page lock, the change diff and the history file format stay the supplied ones. */
import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';

export function create({stores: {memoryFiles: m}}) {
  /** `update` gets the page text (null when missing) and returns its new text, or undefined to leave it. */
  const writeMemoryPage = async (accountRoot, pagePath, update, history) => {
    const file = path.join(m.memoryDir(accountRoot), pagePath), startedAt = new Date().toISOString();
    let before, after;
    {
      using lock = await m.lockFor(file).acquire();
      before = await readFile(file, 'utf-8').catch(() => null);
      after = update(before);
      if (after === undefined) return undefined;
      if (after !== before) await m.atomicWrite(file, after);
    }
    const changes = m.diffMemorySnapshots(new Map(before === null ? [] : [[pagePath, before]]), new Map([[pagePath, after]]));
    if (changes.length > 0) await m.appendMemoryHistoryEntry(accountRoot, m.createMemoryHistoryEntry({type: 'edit', status: 'success', ...history, startedAt,
      finishedAt: new Date().toISOString(), result: {filesTouched: [pagePath]}, changes, messages: []}));
    return {change: changes[0]};
  };

  /** Markdown pages under `directory`, as paths relative to the memory directory; `counts` tallies the scan. */
  const listMarkdownFiles = async (directory, relative, counts) => {
    counts.directoriesScanned++;
    let entries;
    try {
      entries = await readdir(directory, {withFileTypes: true});
    } catch (error) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'ENOENT') return [];
      throw error;
    }
    return (await Promise.all(entries.map(async entry => {
      counts.entriesScanned++;
      if (entry.name.startsWith('.')) {
        counts.dotEntriesSkipped++;
        return [];
      }
      const absolutePath = path.join(directory, entry.name), pagePath = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listMarkdownFiles(absolutePath, pagePath, counts);
      if (!entry.isFile() || !entry.name.endsWith('.md')) {
        counts.nonMarkdownEntriesSkipped++;
        return [];
      }
      if (m.isContextAwarenessMemoryPath(pagePath)) return [];
      const stats = await stat(absolutePath).catch(() => null);
      if (!stats?.isFile()) return [];
      counts.markdownFiles++;
      return [{path: pagePath, absolutePath, lastUpdatedAt: new Date(stats.mtimeMs).toISOString(), sizeBytes: stats.size}];
    }))).flat();
  };

  /** Newest first, up to `limit` (1–100, default 50), continuing from `cursor`; unreadable lines are skipped. */
  const listMemoryHistory = async (accountRoot, options) => {
    const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100), read = [];
    for await (const {offset, line} of m.readHistoryLinesReverse(m.historyPath(accountRoot), options?.cursor)) {
      try {
        read.push({offset, entry: m.parseMemoryHistorySummary(line)});
        if (read.length > limit) break;
      } catch {
        // A damaged line is not part of the history.
      }
    }
    return {entries: read.slice(0, limit).map(item => item.entry), nextCursor: read.length > limit ? String(read[limit - 1]?.offset) : undefined};
  };

  const getMemoryHistoryEntry = async (accountRoot, entryId) => {
    for await (const {line} of m.readHistoryLinesReverse(m.historyPath(accountRoot))) {
      try {
        const entry = JSON.parse(line);
        if (entry.id === entryId) return entry;
      } catch {
        // A damaged line cannot be the entry.
      }
    }
    return undefined;
  };

  return {writeMemoryPage, listMarkdownFiles, listMemoryHistory, getMemoryHistoryEntry};
}
