# Native corner query view type

Actual v559 compile found BrowserLayoutViews::browser_view is the generic views::View. Use the existing AsViewClass<BrowserView> pattern with its null guard to query the shared native frame corner radius. Other two corner-owner objects compiled; this is the sole reported compile error. No geometry or policy change.
