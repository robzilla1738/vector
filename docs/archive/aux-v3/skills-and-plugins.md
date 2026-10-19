# Skills and plugin import

## Save and share a Skill

Open a saved task, choose **Save task as Skill**, then open the Skill. **Sharing and suggestions** holds its description, icon, keyword hints, and complete `http` or `https` URL prefixes. Save those details before choosing **Save as SKILL.md**. The exported file contains the Skill name, description, icon, `autoInject` hints, objective, parameters, site origins, expected output, and success criteria. It does not carry account credentials, task grants, source task binding, or scheduled execution authority.

**Import SKILL.md** reads one bounded regular file and creates a paused, unbound Skill in the selected Space. Review its definition and bind it to a saved task before resuming. A matching keyword or URL may show it under **Suggested for this context**. Matching uses an exact site origin and path boundary. A suggestion only opens the Skill for review; it never runs, grants access, or changes its schedule.

## Import a plugin

In **Settings → Connections → Plugins**, choose an Aux bundle file or a Claude Code plugin folder. The review shows the plugin name, Skill names, MCP server declarations, hook declarations, and a digest. Installation checks that the reviewed contents still match. A changed bundle must be inspected again.

Aux `aux-plugin@1` bundles import portable Skills as paused, unbound definitions. Claude Code folders use `.claude-plugin/plugin.json`, optional `skills/*/SKILL.md`, `.mcp.json`, and `hooks/hooks.json`. Their skill text is stored as inventory; MCP and hook declarations are stored by name and digest, without secrets or command bodies. **No imported Claude Code component runs or connects during import.** Every component has `authority: none`.

An imported Skill can be granted from its detail in **Settings → Connections → Plugins**. The displayed button grants its reviewed digest to tasks in that Space; revoking it stops later reads. The runtime also supports a narrower task-revision grant. A Skill read checks the grant, installed asset digest, current task revision, and Space on every call, including after Aux restarts. The content is untrusted task data; the grant permits reading its instructions and does not grant browser, account, file, or network access. Saved Skills from tasks can be rerun with different parameter values after restart, subject to the task's current scope and run checks.

Imported MCP and hook declarations stay inert. Their command bodies and credentials are never copied into the inventory, so importing them cannot itself start a server or hook. An MCP server requires separate reviewed registration, approval, and tool grants through the outbound MCP service; a hook requires separate reviewed registration and approval through the hook service. Native MCP process sandboxing and native hook execution remain host gates before those components can run in the Chromium app.

Uninstalling a plugin removes its imported component inventory and archives Skills that its Aux bundle created. It does not revoke an unrelated account or project grant.
