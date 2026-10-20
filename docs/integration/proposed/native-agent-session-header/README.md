# Common native group header: supplied Agent presentation

This is the agent-mode portion of the original common TabGroupHeaderView, needed
by the real 5d0 Agent-session tab owner. It reuses the current common native
header/delegate, actual TabGroupData, callbacks, focus/collapse and hovercard
plumbing. It introduces no replacement header or fabricated physical group.

The caller constructs the existing header using actual VisualData marked
`SetIsAgentGroup(true)` and delivers actual `TabGroupData.num_tabs_in_group` via
`OnDataChanged`. The marker is the already recovered source field, not a title
comparison. No new public presentation API is needed. Child's genuine aggregate
owner supplies its own real data/count and readonly membership; normal physical
groups keep their existing delegate/state behavior.

Positive source adaptations:

- Original411f0c0 receives agent bool, shows its actual16px
  kAsideWindowSparkleStrokeIcon, hides the normal sync/attention presentation and
  shows a plain native FlexLayoutView/Label count. The icon e9d5848 points through
  e9d5838 to the exact360-element d3e64b8 path already used by the supplied agent
  tab bubble. The new include preserves every original scalar bit.
- Count is real decimal count,12px medium500, source secondary role222, no newly
  designed badge background. Actual vertical margin is TLBR(0,8,0,0); glyph margin
  is TLBR(0,0,0,8). Source constants are pinned. Agent Grey title resolves through
  original41da630 to role222 as well, rather than155's whole-chip max contrast.
- Original411fbf0 hides its normal color-chip child in agent mode. Chromium155
  paints the normal chip on the header instead; this branch removes that stock
  background while retaining normal group background behavior otherwise.
- Original411e8f4 refuses agent inline edit. Both155 editor entrypoints and its
  delayed focus/hover button paths honor the same suppression; collapse and
  actual group data/hovercards remain real. Theme changes refresh real agent
  count/icon/data. There is no fake editor success.
- The tooltip is the actual supplied locale resource11290, with product branding
  alone changed: “Tabs controlled by Aux while it works”.

A synthetic aggregate does not have a physical TabGroupID. Existing `group()`
therefore explicitly CHECKs nonagent before the actual physical delegate call;
it never invents a group ID/reference. The aggregate owner must use its real
TabGroupData/count for hovercards and must not route physical-group operations
through this API. This is an explicit integration restriction, not evidence of
completed runtime acceptance.

Three-file proposal: existing header h/cc plus exact icon inc. Root registers the
inc in the existing native group header target if its GN source check requires
it. Baseline is actual356 common header (untouched by the separate commonTabView
mode proposal). No shared native source was changed or compiled here. Exact
filesystem replay + original framework/icon/resource pins pass. Agent-session
owner and body mount remain separate active work; this alone does not complete
or activate the supplied sidebar.
