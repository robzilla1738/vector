---
name: google-accounts
description: IMPORTANT- Read this skill before interacting any Google apps!
icon: "/builtin-skills/v1/google-accounts.jpg"
autoInject:
  keywords: ["google", "구글", "グーグル", "谷歌"]
---

# Google accounts

The `googleAccounts` global in the REPL tells you which Google accounts are signed in. It reads them over HTTP with the browser's cookies, so no tab is needed.

```js
await googleAccounts.print();
```

- `googleAccounts.print(): Promise<void>` prints every signed-in account to the console. Cheapest on tokens; use it to look.
- `googleAccounts.list(): Promise<GoogleAccountInfo[]>` returns them when your code needs the data.

```ts
interface GoogleAccountInfo {
  accountId: number;      // the {uid} in Gmail's /u/{uid}/
  name: string;
  email: string;
  profileImageUrl: string;
}
```
