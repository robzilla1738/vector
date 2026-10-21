# Supplied sidepanel composer state audit — 2026-10-21

The pinned1852 new-session sidepanel already displays `Reply, @ for context`. This is not evidence of an Aux routing regression. No source or cosmetic placeholder patch is justified.

Source flow: sidepanel-CI-CbXmY.js je() selects the no-session se/ne branch. ne renders f with leadingAction and no placeholder. f imports session-composer-Dc0LRfZA.js export cf as a. cf explicitly supplies n??"Reply, @ for context" to fu, overriding fu's lower-level "Ask AI a task, @ for context" fallback. Existing-session ee has the same effective default. Current cf/fu behavior matches the original.

Original composer SHA256:71e187af0ca2887e13b840cd1e1b4aa2f46693821fb96daa8eafa9f4480bf645. Current and original sidepanel SHA256:c396463fc21b348469766222c767d9fd08ed68bcdd0202d6b9598fbecaea3cfe; -components-4o0FSqQ9.js:6310b674f032bc890715b6b0f35bd1e4983cd25886d697941b7120bc3510abfb; use-tab-context-Bi3TKsrh.js:28ee730bae99806ad944aa002072acf9149c6fc93bdb10874e4d7fed4e301ab6.

The differing installed Aside screenshot remains a version/surface discrepancy, not full visual equality. Preserve the supplied implementation. A lean remaining journey covers new/existing chat navigation, Open in Tab, account/target scoped tab-change session mapping, current-page context and draft persistence; model/reasoning/permission controls use genuine configuration APIs. Retain the accepted20-case AI evidence.
