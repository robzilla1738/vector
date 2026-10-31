---
name: jira
siteSpecific: true
description: Jira Cloud issue, search, and list-view guidance.
icon: "/builtin-skills/v1/jira.svg"
autoInject:
  url:
    - "*.atlassian.net/jira/**"
    - "*.atlassian.net/browse/**"
    - "*.atlassian.net/issues/**"
---

# Jira

## Addresses

- Your work: `https://${site}.atlassian.net/jira/your-work`
- An issue: `https://${site}.atlassian.net/browse/${issueKey}`
- A JQL search: `https://${site}.atlassian.net/issues/?jql=${urlEncodedJql}`

## How to work

- Go to issue URLs and JQL result URLs directly instead of through menus.
- Know the issue key? Open `/browse/${issueKey}`.
- Triage many issues at once, or edit inline, in list view.
- Use the issue's detail view when the task is about one issue.

## Keys

| Action | Keys |
| --- | --- |
| New work item | `c` |
| Quick search / advanced search | `/` / `/` then `Enter` |
| Quick actions and screen navigation | `.` |
| Shortcut list | `?` |
| Command palette | `Cmd/Ctrl+K` |
| Next / previous item | `j` / `k` |
| Open the selected item | `o` |
| Assign / assign to me | `a` / `i` |
| Comment | `m` |
| Next / previous board column | `n` / `p` |
