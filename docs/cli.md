# CLI — `auxctl`

A thin client over the loopback API. It finds the runtime via
`<dataDir>/runtime.json` (see [api.md](api.md)); set `AUX_DATA_DIR` to
point at a non-default data dir. A legacy `aux` command alias remains available during migration.
The CLI and Aux MCP server use the private `@aux/sdk` package, which validates
requests and responses against the same versioned contracts as the runtime and never
retries a failed RPC. It does not expose credentials or bypass desktop approval.

```bash
node packages/cli/dist/main.js <cmd>   # or: pnpm cli <cmd>
```

## Commands

```
auxctl doctor                      runtime health + descriptor (token masked)
auxctl open <url> [--chrome] [--background]
auxctl pages | tabs                list pages
auxctl observe <pageId>
auxctl exec <pageId> <steps-json|@file>
auxctl nav <pageId> <url>
auxctl shot <pageId> [--artifact]
auxctl close|back|forward|reload|stop <pageId>

auxctl run "<goal>" [--page id] [--set id]
auxctl run-status <runId>
auxctl pause|resume|cancel <runId>
auxctl answer <runId> "<answer>"
auxctl runs

auxctl set create <name> <url…>
auxctl set list
auxctl set map <setId> --program <json|@file> | --goal "<text>"
auxctl results <setId> [--status ok|partial|error]

auxctl events [--since N] [--follow]
auxctl artifacts [runId]
auxctl artifact <artifactId> [--raw]

auxctl chrome attach [--port 9222] | tabs | open-live <pageId> | detach
auxctl chrome import-cookies [--source auto|attached|profile]

auxctl programs
auxctl program-run <programId> <pageId> [k=v…]

auxctl models
auxctl probe [modelId]

auxctl workspace list
auxctl workspace create <name>
auxctl task list [--workspace id] [--archived]
auxctl task get <taskId>
auxctl task create <workspaceId> <definition-json|@file>
auxctl task update <taskId> <revision> <patch-json|@file>
auxctl task archive|restore <taskId> <revision>
auxctl task receipt <taskId> [revision]
auxctl task start <taskId> <revision> [--pages id,id]

auxctl dev projects <taskId> <revision>
auxctl dev inspect|files|commands|github|operations|review <taskId> <revision> <projectId>
auxctl dev read <taskId> <revision> <projectId> <path>

auxctl cloud list <taskId> <revision>
auxctl cloud commands|result <taskId> <revision> <environmentId>
auxctl cloud files <taskId> <revision> <environmentId> [path]
auxctl cloud read <taskId> <revision> <environmentId> <path>

auxctl bench [task] [--repeats N]
auxctl get <method> [params-json]   # raw RPC escape hatch
auxctl help
```

Output is JSON. Exit code is non-zero on RPC errors, so it composes with
`jq` / shell pipelines:

```bash
auxctl observe p_abc | jq '.content.elements[] | select(.role=="link")'
```

## Examples

```bash
# one-shot extraction through the API
auxctl exec p_abc '[{"id":"e","op":"extract","fields":[{"name":"count","selector":"p.muted"}]}]'

# run a saved program across a set
auxctl set map set_xyz --goal "export every member's open records"
auxctl results set_xyz --status ok

# tail the event stream
auxctl events --since 0 --follow | jq -r '.type'

# create a saved task without shell-escaping a large definition
cat > /tmp/aux-task.json <<'JSON'
{"title":"Review change","objective":"Inspect and verify the prepared change.","criteria":[{"criterionId":"review","description":"The change is reviewed","verification":"Inspect the checkout diff and check output"}]}
JSON
auxctl task create <workspaceId> @/tmp/aux-task.json

# inspect task-owned local and cloud work without raw RPC method names
auxctl dev inspect <taskId> <revision> <projectId>
auxctl cloud result <taskId> <revision> <environmentId>
```

Task, development and cloud commands are validated by the same runtime schemas used
by the desktop and scoped MCP server. Revision and resource scope are mandatory.
The CLI does not expose provider secrets, publishing, remote PR creation, deployment,
cloud creation/deletion or evidence acceptance. Actions requiring native review keep
that review boundary; use the desktop for those workflows.
