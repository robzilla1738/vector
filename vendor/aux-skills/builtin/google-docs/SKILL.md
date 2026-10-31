---
name: google-docs
description: Read this skill when you need to read or write Google Docs. Reading works without opening a browser tab.
icon: "/builtin-skills/v1/google-docs.jpg"
autoInject:
  keywords: ["google docs", "document"]
  url:
    - docs.google.com/document/**
---

# Google Docs

The `googleDocs` global in the REPL reads Docs over HTTP with the browser's cookies (no tab) and edits them by opening a Docs tab for you.

**The user may be signed in to several Google accounts.** Before building any `/u/{uid}/` URL, run `console.log(await googleAccounts.list())` to find the right uid.

## At a glance

```js
// docId and uid from a URL
const { docId, uid } = googleDocs.parseUrl('https://docs.google.com/document/u/1/d/abc123/edit');
// -> { docId: 'abc123', uid: 1 }

// Read without a tab
const html = await googleDocs.getDocumentHTML('https://docs.google.com/document/u/1/d/.../edit');
const text = await googleDocs.getDocumentText('https://docs.google.com/document/u/1/d/.../edit');
const html2 = await googleDocs.getDocumentHTML({ docId: 'abc123', uid: 1 });

// Edit in a tab
await googleDocs.connect(url);
const title = await googleDocs.getTitle();
const liveText = await googleDocs.getLiveText();
await googleDocs.insertText('Hello world');
await googleDocs.dispose();

// Precise edits by character index
await googleDocs.connect(url);
await googleDocs.applyDiffs([
  { type: 'replace', startIndex: 0, endIndex: 5, text: 'Hello' },
  { type: 'insert', startIndex: 10, text: ' world' },
  { type: 'delete', startIndex: 20, endIndex: 25 },
]);
await googleDocs.dispose();

// The same edits as suggestions
await googleDocs.connect(url);
await googleDocs.applyDiffsAsSuggestions(diffs, 'Fixed grammar issues');
await googleDocs.dispose();
```

## Reading (no tab)

- `googleDocs.parseUrl(url): { docId: string; uid?: number }` pulls the doc id and account uid out of a Docs URL, handy when you want to pass `{ docId, uid }`.
- `googleDocs.getDocumentHTML(target): Promise<string>` returns the whole document as HTML. `target` is a URL or `{ docId: string; uid?: number }`. With several accounts, put `/u/{uid}/` in the URL or pass `uid`.
- `googleDocs.getDocumentText(target): Promise<string>` returns it as plain text; same `target`.

## Editing (opens a tab)

Call `connect(url)` first and `dispose()` when you're done.

| Method | What it does |
| --- | --- |
| `connect(url): Promise<void>` | Opens the doc in a tab and waits for the editor. |
| `dispose(): Promise<void>` | Closes that tab. |
| `getTitle(): Promise<string>` | The title, from the live editor. |
| `getLiveText(): Promise<string>` | All the text, from the live editor. It briefly selects everything to read it. |
| `getSelectedContent(): Promise<{ text: string; html: string }>` | The current selection as text and HTML. |
| `insertText(text): Promise<void>` | Types text at the cursor. |
| `selectAll(): Promise<void>` | Selects the whole document. |
| `selectTextRange(startIndex, endIndex): Promise<void>` | Selects a range by character index. |
| `insertHtmlContent(html): Promise<void>` | Pastes rich HTML at the cursor. |
| `pasteFromMarkdown(markdown): Promise<void>` | Uses Docs' "Paste from Markdown" context-menu item. |
| `applyDiffs(diffs): Promise<void>` | Makes each edit by selecting and replacing. Edits run from the end of the doc backwards, so earlier indices stay valid. |
| `applyDiffsAsSuggestions(diffs, explanation?): Promise<void>` | Turns on suggesting mode, applies the edits, turns it back off, and optionally leaves a comment explaining them. |
| `addComment(text): Promise<void>` | Comments on the current selection. |
| `deleteSelection(): Promise<void>` | Deletes the selected text. |

```ts
interface TextDiff {
  type: 'replace' | 'delete' | 'insert';
  startIndex: number;
  endIndex?: number;  // for replace and delete
  text?: string;      // for replace and insert
}
```

## Tips

- Read without a tab whenever you can: it's faster, lighter, and leaves the user's browser alone.
- Editing is always `connect()`, edit, `dispose()`.
- Prefer `applyDiffs()` and `applyDiffsAsSuggestions()` for edits. They're exact, index-based, and apply a batch of edits together.
- HTML goes in through a clipboard paste, and Docs chooses what formatting to keep.
- Markdown paste relies on the menu item being labeled "Paste from Markdown" in English.
- Selecting by index maps characters to the page's SVG rectangles and can drift after big edits.

## Shortcuts in an open Docs tab

| Action | Keys |
| --- | --- |
| Select all | `Cmd+A` |
| Find | `Cmd+F` |
| Find and replace | `Cmd+Shift+H` |
| Comment | `Cmd+Alt+M` |
| Heading 1–6 | `Cmd+Alt+1` … `Cmd+Alt+6` |
| Bold, italic, underline | `Cmd+B`, `Cmd+I`, `Cmd+U` |
| Undo, redo | `Cmd+Z`, `Cmd+Y` |
