---
name: notion
description: Read this skill when you need to use Notion. Don't have to open a browser tab.
icon: "/builtin-skills/v1/notion.jpg"
autoInject:
  keywords: ["notion"]
  url:
    - "*.notion.com/**"
    - "*.notion.so/**"
    - "*.notion.site/**"
---

# Notion

The `notion` global in the REPL reads `token_v2` from the browser's signed-in Notion session and calls Notion's internal API directly. No tab needed.

## At a glance

```js
// If more than one Notion account or workspace might be signed in, look first and pick one explicitly.
console.log(await notion.listAccounts());

// A ready NotionClient (cached per browser profile). Keep it in a const so later REPL calls reuse it.
const _notion = await notion.getClient({
  email: 'you@example.com',
  workspaceName: 'Corca',
});

// Who and where
console.log(_notion.currentUser.email, _notion.currentUser.fullName);
console.log('Space:', _notion.currentSpace.get('name'));
console.log('Plan:', _notion.currentSpace.get('subscription_tier'));

// Find pages
const results = await _notion.search({ query: 'meeting notes', isNavigableOnly: true, limit: 10 });
for (const block of results) {
  console.log(block.id, block.get('type'), block.title);
}

// Open a page by URL or id
const page = await _notion.getBlock('https://www.notion.so/myorg/My-Page-abc123');
console.log(page.title);

// The page as Markdown (converted locally, no API call)
console.log(blockToMarkdown(page));

// Add Markdown to the end of a page
await page.children.addFromMarkdown(`
## Agent update

- [x] searched the workspace
- [x] appended a section
`);

// New sub-page
const child = await page.children.addNew('page', { title: 'New Sub-page' });
await child.children.addFromMarkdown('# Hello\n\nContent here.');

// Rename a page
await page.set('properties.title', [['Updated Title']]);
```

## The client

```js
const _notion = await notion.getClient(); // keep it in a const
```

This is `NotionClient`, the full internal-API client that ships with Aux. Everything below goes through it.

If the token expires or you need a different account:

```js
notion.invalidateCache();
const refreshedNotion = await notion.getClient();
```

## Several accounts

Without arguments the client uses the first user and workspace it finds. When the task is about a particular account or workspace, list them and pass them to `getClient`:

```js
const accounts = await notion.listAccounts();
console.log(accounts);

const client = await notion.getClient({
  email: 'other@email.com',
  workspaceName: 'Corca',
});
```

## Search

```js
const results = await _notion.search({ query: 'project plan', limit: 20 });

// Pages only, no inline blocks or templates
const pages = await _notion.search({
  query: 'project',
  isNavigableOnly: true,
  excludeTemplates: true,
  sort: { field: 'lastEdited' }, // 'relevance' | 'lastEdited' | 'created'
});

// Under one parent page
const childIds = await _notion.searchPagesWithParent(parentPageId, 'query');
```

Search gives you `Block[]`, already cached and ready to change.

## Reading a page

```js
const page = await _notion.getBlock(pageIdOrUrl);
console.log(page.title, page.get('type'));

for (const child of page.children) {
  console.log(child.get('type'), child.title);
}

console.log(blockToMarkdown(page)); // local conversion, no API call
```

## Writing

Check which workspace you're in before creating pages or uploading files:

```js
console.log(_notion.currentSpace.get('name'), _notion.currentSpace.get('subscription_tier'));
console.log(_notion.currentSpace.get('settings.reach_block_limit_time'));
```

If it's a free or block-limited workspace and the user meant a paid or team one, switch before you write anything.

**Blocks:**

```js
await page.children.addNew('text', { title: 'A paragraph' });
await page.children.addNew('to_do', { title: 'Ship it', checked: false });
await page.children.addNew('bulleted_list', { title: 'List item' });
```

**Markdown:**

````js
await page.children.addFromMarkdown(`
# Summary

- write docs
- [x] port search API

> keep the API minimal

\`\`\`ts
console.log('ship it')
\`\`\`
`);
````

It handles headings, paragraphs, bulleted and numbered lists, to-dos, quotes, code blocks, dividers and nested lists, and inline **bold**, *italic*, ~~strikethrough~~, `code`, links and $$equations$$.

**Sub-pages:**

```js
const parent = await _notion.getBlock(parentPageId);
const child = await parent.children.addNew('page', { title: 'Design Doc' });
await child.children.addFromMarkdown('# Goals\n\n- keep scope tight');
```

**Title:** `await page.set('properties.title', [['New Title']]);`

**Several writes as one transaction:**

```js
await _notion.runInTransaction(async () => {
  await page.set('properties.title', [['Updated']]);
  await page.children.addNew('text', { title: 'Note 1' });
  await page.children.addNew('text', { title: 'Note 2' });
});
```

## Databases

```js
// A database view by URL
const view = await _notion.getCollectionView('https://www.notion.so/myorg/8511b9fc?v=8dee2a54');
const collection = view.collection;

// Rows
const rows = await collection.getRows();
for (const row of rows.toArray()) {
  console.log(await row.getProp('Name'), await row.getProp('Status'));
}

// New row
const newRow = await collection.addRow({
  Name: 'New task',
  Status: 'In Progress',
  'Due Date': { start: new Date('2026-05-01') },
});

// Filtered, sorted query
const query = view.buildQuery({
  filter: {
    filters: [{
      property: 'Status',
      filter: { operator: 'enum_is', value: { type: 'exact', value: 'Done' } },
    }],
    operator: 'and',
  },
  sort: [{ property: 'Due Date', direction: 'ascending' }],
});
const result = await query.execute();
```

## Deleting and moving

```js
await page.remove();      // to trash
await page.remove(true);  // permanently
await myBlock.moveTo(targetBlock, 'after');   // 'before' | 'after' | 'first-child' | 'last-child'
```

## Uploads

Signed URLs are short-lived credentials. Never print `signedPutUrl`, `signedGetUrl`, upload plans or temporary signed response files. Log only counts, booleans, block ids and the final Notion page URLs.

## Locking

```js
await page.set('format.block_locked', true);  // lock
await page.set('format.block_locked', false); // unlock
```

## Shapes

```ts
// Each Block from search:
block.id;            // UUID
block.get('type');   // 'page', 'text', 'to_do', ...
block.title;         // Markdown string (pages, text blocks)
block.children;      // child blocks

// Database row properties:
await row.getProp('Name');      // string
await row.getProp('Status');    // string | null (select)
await row.getProp('Tags');      // string[] (multi_select)
await row.getProp('Done');      // boolean (checkbox)
await row.getProp('Due Date');  // NotionDate | null
await row.getProp('Owner');     // User[]
```

## Easy mistakes

1. **Missing `await`.** `getClient()`, `getBlock()`, `search()`, `getProp()`, `set()`, `addNew()`, `remove()` and `moveTo()` are all async.
2. **`markdownToNotion()` for page content.** It only builds inline rich text. Use `addFromMarkdown()` for blocks.
3. **Putting the body in the title.** `page.title = '# Heading\nBody'` is wrong. Set the title on its own, drop a leading `# H1` from the body if it repeats the title, then add the body through `page.children`.
4. **Not keeping the client.** Without `const _notion = ...` every REPL call sets it up again.
5. **The wrong workspace.** Check `currentSpace.get('subscription_tier')` and the block-limit setting before writing.
6. **Logging signed upload URLs.** They're temporary credentials. Don't print or store them.
