# Actual326 owner API155 corrections

The actual focused compiler found four API/storage errors in the newly applied inner owner. This patch changes only those boundaries: explicit `std::string(GURL::host())` preserves the original saved host bytes from155's string_view; iteration unwraps the existing outgoing-row raw_ptr; both retained native references use Chromium's required raw_ref with corresponding accessors. The original model, layout, animation, menu and drag policies are unchanged.

Exact baseline is f3b8e1560 applied as326. The full compiler diagnostics are retained; one-file disposable patch replay passes. Root owns the follow-up compile. No shared checkout, build, launch, dialog, OS action or signing is performed here.
