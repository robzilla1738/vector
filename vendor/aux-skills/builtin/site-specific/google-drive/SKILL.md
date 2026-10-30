---
name: google-drive
siteSpecific: true
description: Google Drive navigation and result-reading guidance.
icon: "https://app.getaux.co/builtin-skills/v1/google-drive.svg"
autoInject:
  url:
    - drive.google.com
---

# Google Drive

## Addresses

- My Drive: `https://drive.google.com/drive/u/${uid}/my-drive`
- Shared with me: `https://drive.google.com/drive/u/${uid}/shared-with-me`
- Recent: `https://drive.google.com/drive/u/${uid}/recent`
- Starred: `https://drive.google.com/drive/u/${uid}/starred`
- Trash: `https://drive.google.com/drive/u/${uid}/trash`
- Search: `https://drive.google.com/drive/u/${uid}/search?q=${keyword}`
- A folder: `https://drive.google.com/drive/u/${uid}/folders/${folderId}`
- A file: `https://drive.google.com/drive/file/d/${fileId}/view?authuser=${uid}`

## Opening search results

A single click usually just selects a result. Double-click its `gridcell` to open it.

- Results tend to open in a dialog, not a new tab.
- Once you close the dialog, take a fresh snapshot before touching the next result.

To read several results in a row:

```js
const readGdriveResults = async (page, refs, action = 'snapshot', delay = 100) => {
  const results = [];
  for (const ref of refs) {
    await page.locator(ref).dblclick();
    await sleep(delay);
    if (action === 'snapshot') {
      results.push((await snapshot(page)).tree);
    } else if (action === 'screenshot') {
      results.push(await page.locator(ref).screenshot());
    }
    await page.keyboard.press('Escape');
    await snapshot(page);
  }
  return results;
};
```

## How to work

- Use search, folder and file URLs directly rather than browsing from the Drive home page.
- Drive redraws a lot. Snapshot again after any open, close, share or move dialog.
