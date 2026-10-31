---
name: github
siteSpecific: true
description: GitHub repo, issue, PR, and review guidance.
icon: "/builtin-skills/v1/github.svg"
autoInject:
  keywords: ["GitHub"]
  url: ["github.com"]
---

# GitHub

## Addresses

- Home: `https://github.com/`
- Notifications: `https://github.com/notifications`
- Settings: `https://github.com/settings`
- A repository: `https://github.com/${owner}/${repo}`
- Its issues / pull requests: `https://github.com/${owner}/${repo}/issues`, `https://github.com/${owner}/${repo}/pulls`
- One issue: `https://github.com/${owner}/${repo}/issues/${number}`
- One pull request: `https://github.com/${owner}/${repo}/pull/${number}`
- Search: `https://github.com/search?q=${query}&type=${issues|pullrequests|repositories|code}`
- A file: `https://github.com/${owner}/${repo}/blob/${ref}/${path}`
- Sign in: `https://github.com/login`, or with a passkey `https://github.com/login?passkey=true`

## How to work

- When it matters which account is signed in, check the avatar.
- Go straight to repo, issue, PR and notification URLs instead of the home feed.
- To review code, open the PR and go to its `Files changed` tab.
- On a file page, press `y` to switch to a permalink pinned to the commit before you quote or save the link.

## Keys

| Action | Keys |
| --- | --- |
| Shortcut list | `?` |
| Search | `/` or `s` |
| Notifications / Issues / Pull requests / Code | `g` then `n` / `i` / `p` / `c` |
| New issue | `c` |
| Open the selected item | `o` or `Enter` |
| Labels / assignee / milestone / reviewer | `l` / `a` / `m` / `q` |
| Reference an issue or PR | `x` |
| Open in `github.dev` | `.` |
