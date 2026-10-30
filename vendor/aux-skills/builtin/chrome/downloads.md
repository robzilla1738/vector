# chrome.downloads

Downloads the browser manages.

| Method | Arguments |
|---|---|
| `chrome.downloads.search(query)` | `query`, shape below |
| `chrome.downloads.download(options)` | `options: { url: string; filename?: string; saveAs?: boolean; conflictAction?: string; headers?: Array<{ name: string; value: string }>; body?: string; method?: string }` |
| `chrome.downloads.pause(downloadId)` | `downloadId: number` |
| `chrome.downloads.resume(downloadId)` | `downloadId: number` |
| `chrome.downloads.cancel(downloadId)` | `downloadId: number` |
| `chrome.downloads.erase(query)` | `query`, same shape as `search` |

The `query` object for `search` and `erase` (every field optional):

```ts
{
  query?: string[]; limit?: number; orderBy?: string[];
  id?: number; url?: string; filename?: string; mime?: string;
  urlRegex?: string; finalUrlRegex?: string; filenameRegex?: string;
  startedBefore?: string; startedAfter?: string; endedBefore?: string; endedAfter?: string;
  startTime?: string; endTime?: string;
  totalBytesGreater?: number; totalBytesLess?: number;
  bytesReceived?: number; totalBytes?: number; fileSize?: number;
  state?: string; paused?: boolean; error?: string; danger?: string; exists?: boolean;
}
```
