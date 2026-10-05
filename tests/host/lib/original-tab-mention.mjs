import assert from 'node:assert/strict';
export const originalMentionComposer = { name: 'Reply to conversation', match: 'exact', scope: 'shell', index: 0 };
const popup = { name: 'Mention a source', match: 'exact', scope: 'shell', index: 0 };
export function originalTabMention(pages, title, interact = false) {
  const matches = pages.filter(page => page.title === title);
  assert.equal(matches.length, 1, 'Named fixture source must be unique');
  const page = matches[0], url = new URL(page.url);
  assert.ok(['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !/[\s@]/.test(page.url));
  assert.ok(page.sessionId && Number.isSafeInteger(page.documentEpoch) && page.documentEpoch >= 0 && !page.loading);
  assert.ok(page.viewStatus !== 'detached' && page.viewStatus !== 'crashed' && !page.detached && !page.crashed);
  assert.equal(page.ownedByRuntime, false); assert.ok(!page.agentIsolation);
  const query = page.url;
  assert.equal(pages.filter(p => `${p.title} Read · ${p.url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).length, 1,
    'Whitespace-free query must identify exactly the original page');
  return Object.freeze({ pageId: page.pageId, url: page.url, sessionId: page.sessionId, documentEpoch: page.documentEpoch,
    title, access: interact ? 'act' : 'read', query: `@${query}`, label: `${title}${interact ? ' · interact' : ''}` });
}
export function requireOriginalMention(pages, original) {
  assert.deepEqual(originalTabMention(pages, original.title, original.access === 'act'), original,
    'Original selected source changed before mention insertion');
}
export function requireMentionReference(ref, original) {
  for (const [key, value] of Object.entries({ kind: 'tab', pageId: original.pageId, url: original.url, sessionId: original.sessionId,
    documentEpoch: original.documentEpoch, access: original.access })) assert.equal(ref?.[key], value, `Original mention ${key} differs`);
}
export async function openOriginalTabMention(t, original) {
  requireOriginalMention(await t.rpc('pages.list'), original);
  await t.ax.type(original.query, originalMentionComposer);
  await t.ax.waitFor(popup);
  requireOriginalMention(await t.rpc('pages.list'), original);
}
export async function selectOriginalTabMention(t, original) {
  requireOriginalMention(await t.rpc('pages.list'), original);
  // Exact URL query offers read then act for this sole original page. Move
  // actual focus first; Enter on an option invokes its registered command.
  await t.ax.key('down', 'hid');
  if (original.access === 'act') await t.ax.key('end', 'hid');
  await t.until('exact original mention option owns native focus', async () => {
    const focused = (await t.ax.query({ name: original.label, match: 'contains', scope: 'shell' })).filter(row => row.focused);
    return focused.length === 1 && (focused[0].names ?? [focused[0].name]).some(name => name.includes(original.url)) && !(original.access === 'read' && (focused[0].names ?? [focused[0].name]).some(name => name.includes(' · interact')));
  });
  requireOriginalMention(await t.rpc('pages.list'), original);
  await t.ax.key('enter', 'hid');
  await t.ax.waitFor(popup, 'absent');
  await t.until('original label token and composer focus published', async () => {
    const rows = await t.ax.query(originalMentionComposer);
    return rows.length === 1 && rows[0].focused === true && rows[0].value === `@${original.label} `;
  });
  await t.ax.waitFor({ name: `Remove @${original.label}`, match: 'exact', scope: 'shell', index: 0 });
  requireOriginalMention(await t.rpc('pages.list'), original);
}
