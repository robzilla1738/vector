---
name: google-gmail
description: Read this skill when you need to use user's Gmail. Don't have to open a browser tab.
icon: "/builtin-skills/v1/google-gmail.jpg"
autoInject:
  keywords: ["gmail", "email", "mail"]
---

# Gmail

The `gmail` global in the REPL talks to Gmail's internal sync API over HTTP. You don't need to open or navigate a tab to read mail.

**Pick the right account first.** People often have more than one Google account (work and personal, say). Always run `await googleAccounts.print()` to list the signed-in accounts and find the right `uid`.

- Every `gmail` method takes that `uid` (the number in `/u/{uid}/`) as its first argument. Browser history and memory search can hint at which account the user means.
- If a search comes back empty when it shouldn't, try another `uid`. Search several accounts at once with `Promise.all`.
- The same thread has a different `threadId` in each account.

## At a glance

```js
const uid = 1; // from the Google accounts list

// Inbox and search
const inbox = await gmail.getInbox(uid); // same as search(uid, 'in:inbox')
const searchResults = await gmail.search(uid, 'from:alice@example.com subject:"meeting"');
// -> { results: GmailSearchResult[], hasMore, total, nextOffset }

// A whole thread (bodies come back as Markdown by default)
const thread1 = await gmail.getThread(uid, 'thread-f:123456');
// -> { threadId, subject, messages: GmailThreadMessage[] }

// New message: opens a compose tab with fields filled in; returns a Playwright Page
const cp1 = await gmail.openComposer(uid, { to: 'bob@example.com', subject: 'Hi', bodyHtml: '<b>Hello</b>' });

// Reply: opens an inline reply on the thread page; returns a Playwright Page
const rp1 = await gmail.openReplyComposer(uid, { threadId: 'thread-f:123456', bodyHtml: '<p>Thanks</p>' });

// Save an attachment
await gmail.downloadAttachment(uid, attachment.url, 'report.pdf');
```

## Methods

**`gmail.search(uid: number, query: string, opts?: { offset?: number }): Promise<GmailSearchResponse>`**
Finds threads with Gmail's search operators (`from:`, `to:`, `subject:`, `label:`, `before:`, `after:`, `is:`, `has:attachment` and so on). `opts.offset` pages through results (0 by default); pass the previous response's `nextOffset`. Results are short and compact, so it's fine to `console.log` all of them. Use `getThread` for the full content.

**`gmail.getInbox(uid: number, offset = 0): Promise<GmailSearchResponse>`**
Same as `gmail.search(uid, 'in:inbox', { offset })`.

**`gmail.getThread(uid: number, threadId: string, opts?: { bodyFormat?: 'raw' | 'markdown' }): Promise<GmailThread>`**
Every message in the thread, with bodies and attachments. `'markdown'` (the default) turns each body into compact, readable Markdown; `'raw'` gives the original HTML. Markdown links are numbered references (`[Some Link][3]` in the text, `[3]: https://example.com` at the end), so match the number with a regex to get the URL.

**`gmail.openComposer(uid: number, opts: { to?: string, cc?: string, bcc?: string, subject?: string, bodyHtml?: string }): Promise<Page>`**
Opens a compose tab with recipients, subject and an HTML body already filled in, and returns its Playwright Page. Gmail closes the tab itself after Send is clicked.

**`gmail.openReplyComposer(uid: number, opts: { threadId: string, mode?: 'reply' | 'replyAll', bodyHtml?: string }): Promise<Page>`**
Opens an inline reply on the thread's page. `mode` is `'reply'` by default; use `'replyAll'` for threads with several people.

**`gmail.openThreadDetailsPage(uid: number, threadId: string): Promise<Page>`**
Opens the thread's page in a new tab.

**`gmail.downloadAttachment(uid: number, url: string, destPath: string): Promise<string>`**
Saves an attachment to `destPath` (relative to the session directory) and returns the full path.

## Types

```ts
type Participant = { name: string; email: string; };

interface GmailSearchResult {
  threadId: string; // like 'thread-f:123456'
  subject: string;
  snippet: string; // short preview of the thread
  timestamp: Date;
  participants: Participant[];
  isUnread: boolean;
}

interface GmailSearchResponse {
  results: GmailSearchResult[];
  hasMore: boolean;
  total: number;
  nextOffset: number;
}

interface GmailThread {
  threadId: string;
  subject: string;
  messages: GmailThreadMessage[];
  raw?: string; // the raw JSON, included when parsing wasn't confident
}

interface GmailThreadMessage {
  messageId: string;      // like 'msg-f:123456'
  from: Participant;
  to: Participant[];
  cc: Participant[];
  subject: string;
  snippet: string;
  timestamp: Date;
  labels: string[];
  body: string;           // HTML ('raw') or Markdown, per bodyFormat
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    url: string; // needs auth; fetch it with gmail.downloadAttachment(), not directly
    inline: boolean; // true for inline images
  }>;
}
```

## Working in the composer

Use the Page that `openComposer` or `openReplyComposer` returns:

```js
// Never send an empty body. If the user really wants an empty email, say so explicitly.
const bodyText = await page.locator('[role=textbox][aria-label]').innerText();
if (!bodyText.trim()) throw new Error('Gmail compose body is empty; refusing to send.');
await page.locator('[data-tooltip*="Send"]').click();

// Attach a file
await page.locator('input[type=file][name=Filedata]').setInputFiles('/path/to/file');

// Throw the draft away
await page.locator('[data-tooltip*="Discard"]').click();
```

## Before sending mail

- Look for an existing thread or earlier conversation first. Replying there is usually better than starting a new thread.
- Find 3–5 emails the user wrote and match their tone and style. Tell the user, as a progress update, that you're gathering examples of their writing.
- Show the draft as a `gmail-draft` block before sending:

````
```gmail-draft
{
  "to": ["hello@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Hello world!",
  "body": "This is the draft body."
}
```
````

- Then go ahead and send, unless the user asked to confirm first. If they did, ask with the notification tool, not `ask_user_question`.
- Right before clicking Send, check again that the composer body isn't empty.
