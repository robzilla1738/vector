const note = document.getElementById('note');
const status = document.getElementById('status');
const stored = await chrome.storage.local.get('note');
note.value = stored.note ?? '';
status.textContent = `Saved extension note: ${note.value || '(empty)'}`;
document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.local.set({ note: note.value });
  status.textContent = `Saved extension note: ${note.value}`;
});
