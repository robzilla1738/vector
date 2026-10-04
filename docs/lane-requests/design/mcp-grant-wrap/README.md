MCP grant long-name containment

Actual defect: OutboundMcpSettings renders each original toolName in mcp-grant-row >div >strong and the original Space name in its hint. This grid/flex item had min-width:0 but no content wrapping or max-width; unbroken valid identifiers could paint outside the shrunken item in narrow Settings. Source-review metadata already wrapped anywhere. Adds only max-width:100% and overflow-wrap:anywhere to that existing item. Full text remains present/selectable; no ellipsis, clipping, opacity or copy changes.

Reference mapping: supplied assets_globals-D6PBr-GP.css exact .min-w-0, .max-w-full, .wrap-anywhere rules; existing Aux metadata value anatomy. Geist/font sizes, colors, material, gaps, button padding/Settings36px hit, focus, L/D and RT/RM are untouched. Removing exactly the two new declarations restores the whole original stylesheet.

Three actual component controls pass, including a long tool +Space grant state and the parsed real CSS applied to its actual rendered text node; original action order/enabled/focus and no write/call/revoke preserved. JSDOM verifies computed containment, not pixel geometry. No component/commands/runtime/native/helper/launch changes, no startup JS growth. Exact2leaf F/R/F and lint0 pass. Genuine paired native narrow/L-D/RT-RM captures and full F21 acceptance remain pending.
