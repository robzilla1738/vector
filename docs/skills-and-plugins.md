# Skills and plugin import

## Save and share a Skill

Open a saved task, choose **Save task as Skill**, then open the Skill. **Sharing and suggestions** holds its description, icon, keyword hints, and complete `http` or `https` URL prefixes. Save those details before choosing **Save as SKILL.md**. The exported file contains the Skill name, description, icon, `autoInject` hints, objective, parameters, site origins, expected output, and success criteria. It does not carry account credentials, task grants, source task binding, or scheduled execution authority.

**Import SKILL.md** reads one bounded regular file and creates a paused, unbound Skill in the selected Space. Review its definition and bind it to a saved task before resuming. A matching keyword or URL may show it under **Suggested for this context**. Matching uses an exact site origin and path boundary. A suggestion only opens the Skill for review; it never runs, grants access, or changes its schedule.

## Import a plugin

In **Settings → Connections → Plugins**, choose an Aux bundle file or a Claude Code plugin folder. The review shows the plugin name, Skill names, MCP server declarations, hook declarations, and a digest. Installation checks that the reviewed contents still match. A changed bundle must be inspected again.

Aux `aux-plugin@1` bundles import portable Skills as paused, unbound definitions. Claude Code folders use `.claude-plugin/plugin.json`, optional `skills/*/SKILL.md`, `.mcp.json`, and `hooks/hooks.json`. Their skill text is stored as inventory; MCP and hook declarations are stored by name and digest, without secrets or command bodies. **No imported Claude Code component runs or connects during import.** Every component has `authority: none`. Any later use requires the separate Aux review and grant path for that capability.

Uninstalling a plugin removes its imported component inventory and archives Skills that its Aux bundle created. It does not revoke an unrelated account or project grant.
