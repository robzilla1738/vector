# Original native task navigation identity

Source-only, two new files. No native source or live browser was modified.

`ChatIdFromURL` ports4637814's actual Aux Agent host, `/main.html` or `/newtab.html`, exact account-specific `/u/N/tasks/` fragment, query suffix removal, single trailing slash removal, and rejection of empty/`new`/remaining slash. It introduces no session-ID regular expression or title/URL similarity heuristic. `ChatURL` preserves4637684's original main-page task route with the Aux extension identity.

`ChatIdFromWebContents` follows4637f20's ordered native candidates: visible URL (committed fallback only when invalid), visible NavigationEntry URL/virtual URL, last committed entry URL/virtual URL, current primary frame committed URL, then pending entry URL/virtual URL. The source mapping of the intermediate WebContents pointer is pinned by its current-frame-host use in the prior original root/page recovery; the current155 public API is the necessary platform adaptation. This recognizer neither marks a tab as agent-created nor permits closing it.

The real task owner must keep original explicit handle associations separate. Positive source46385cc gives priority to active explicit association, otherwise the last explicit association, then active matching URL, then first matching URL. Special1090 handles skip only the URL fallback. Double-click rename rollback may close only the exact matching handle created by the preceding single-click, not an arbitrary recognized task URL. The draft controller remains outside this proposal until its full classification/bookmark producer lifecycle is recovered.

Run `python3 verify.py`: full original artifact and bounded range hashes plus disposable exact patch replay. Not compiled, mounted or runtime-accepted. Root owns GN and builds. This is a dependency for the real action/selection owner, not a complete sidebar replacement.
