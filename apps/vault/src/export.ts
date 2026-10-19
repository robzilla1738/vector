import type { Snapshot } from './client';

export async function exportSnapshot(
  snapshot: Snapshot,
  format: 'json' | 'csv',
) {
  if (!globalThis.chrome?.downloads?.download)
    throw new Error(
      'Open Aux Vault in the rebuilt browser to choose an export destination.',
    );
  const columns = [
    'id',
    'vaultId',
    'category',
    'title',
    'subtitle',
    'username',
    'password',
    'totp',
    'urls',
    'notes',
    'tags',
    'favorite',
    'state',
    'sections',
  ];
  const rows = snapshot.items.map((item) => [
    item.id,
    item.vaultId,
    item.category,
    item.title,
    item.subtitle,
    item.loginFields?.username ?? '',
    item.loginFields?.password ?? '',
    item.loginFields?.totp ?? '',
    JSON.stringify(item.urls),
    item.notes,
    JSON.stringify(item.tags),
    String(item.favorite),
    item.state,
    JSON.stringify(item.sections),
  ]);
  const content =
    format === 'json'
      ? JSON.stringify(snapshot, null, 2)
      : [columns, ...rows]
          .map((row) =>
            row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','),
          )
          .join('\r\n');
  const url = URL.createObjectURL(
    new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8',
    }),
  );
  let id: number | undefined;
  let timer: ReturnType<typeof setTimeout>;
  function cleanup() {
    URL.revokeObjectURL(url);
    chrome.downloads.onChanged.removeListener(changed);
    clearTimeout(timer);
  }
  function changed(delta: chrome.downloads.DownloadDelta) {
    if (
      delta.id === id &&
      ['complete', 'interrupted'].includes(delta.state?.current ?? '')
    )
      cleanup();
  }
  chrome.downloads.onChanged.addListener(changed);
  timer = setTimeout(cleanup, 10 * 60 * 1000);
  try {
    id = await chrome.downloads.download({
      url,
      filename: `aux-vault-export.${format}`,
      saveAs: true,
    });
  } catch (error) {
    cleanup();
    throw error;
  }
}
