# CLI — `vector`

A thin client over the loopback API. It finds the runtime via
`<dataDir>/runtime.json` (see [api.md](api.md)); set `VECTOR_DATA_DIR` to
point at a non-default data dir.

```bash
node packages/cli/dist/main.js <cmd>   # or: pnpm cli <cmd>
```

## Commands

```
vector doctor                      runtime health + descriptor (token masked)
vector open <url> [--chrome] [--background]
vector pages | tabs                list pages
vector observe <pageId>
vector exec <pageId> <steps-json|@file>
vector nav <pageId> <url>
vector shot <pageId> [--artifact]
vector close|back|forward|reload|stop <pageId>

vector run "<goal>" [--page id] [--set id]
vector run-status <runId>
vector pause|resume|cancel <runId>
vector answer <runId> "<answer>"
vector runs

vector set create <name> <url…>
vector set list
vector set map <setId> --program <json|@file> | --goal "<text>"
vector results <setId> [--status ok|partial|error]

vector events [--since N] [--follow]
vector artifacts [runId]
vector artifact <artifactId> [--raw]

vector chrome attach [--port 9222] | tabs | open-live <pageId> | detach
vector chrome import-cookies [--source auto|attached|profile]

vector programs
vector program-run <programId> <pageId> [k=v…]

vector models
vector probe [modelId]
vector bench [task] [--repeats N]
vector get <method> [params-json]   # raw RPC escape hatch
vector help
```

Output is JSON. Exit code is non-zero on RPC errors, so it composes with
`jq` / shell pipelines:

```bash
vector observe p_abc | jq '.content.elements[] | select(.role=="link")'
```

## Examples

```bash
# one-shot extraction through the API
vector exec p_abc '[{"id":"e","op":"extract","fields":[{"name":"count","selector":"p.muted"}]}]'

# run a saved program across a set
vector set map set_xyz --goal "export every member's open records"
vector results set_xyz --status ok

# tail the event stream
vector events --since 0 --follow | jq -r '.type'
```
