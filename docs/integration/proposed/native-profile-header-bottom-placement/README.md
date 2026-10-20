# Restore original profile parent after expanding body

The earlier mount inferred top placement from the name header. Original constructor037dfc80 adds scroll/body+5b0 well before actual profile/pager/search parent+5a8;37e3d18 appends that parent before BottomContainer+6f0. Original scroll has vertical/minimum/unbounded flex with weight1. Existing static reference146 independently shows bottom profile/search placement, with its version/theme/scale limitations.

Move the same existing header construction after the current independent body (retained pending genuine replacement). Existing OnTabStripViewSet inserts the actual tab collection immediately after that body, so the same header follows the live tabs. Restore the real tab strip vertical grow/weight1 to consume available space before the profile parent. Preserve genuine actions, account observers, pager/menu/search, pin/transaction/preview/capture handling and compact visibility. No alternative footer is constructed.

One existing source output, exact baseline/output hashes and move/unique-flex anchors. Original constructor/scroll/API inputs are pinned in source-evidence.json. Composition replay, native compile and actual window placement remain required; this does not establish full body or both-theme parity.
