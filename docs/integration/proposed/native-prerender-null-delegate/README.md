# New-tab crash: absent prerender delegate

The signed v527 browser crashed twice on 2026-10-20 at14:26:24 and14:28:08. Both signal stacks have identical framework-relative addresses and enter the ordinary NewTab path through AuxVerticalNewTabActionInterface, Navigate, NavigationController and prerender activation checks. This is not the earlier bubble-theme crash.

Symbolication used the actual built framework's symbols, UUID4C4C44DD-5555-3144-A19B-16854C240DB9. The existing AuxFast dSYM is stale (UUID4C4C4422-5555-3144-A1DE-A83B684A9A1D); its symbols were not used. In the first stack, framework base0x1222e0000 places the fault0x1257bc600 at relative0x34dc600. The second stack has base0x120310000 and fault0x1237ec600, yielding the same offset.

The exact built instruction at0x34dc600 is `ldr x8,[x0]`, immediately after GetDelegate() returns, followed by the vtable policy call. It matches PrerenderHost::AreInitialPrerenderNavigationParamsCompatibleWithNavigation+148 and the source's unguarded `web_contents_->GetDelegate()->ShouldAllowPartialParamMismatchOfPrerender2(...)`. Signal fault address0 proves a null delegate receiver. The matching surrounding stack establishes the new-tab/prerender call path; it does not establish which lifetime transition removed that delegate.

The patch checks the actual nullable delegate and retains strict parameter matching if absent. This is exactly the default policy returned by WebContentsDelegate::ShouldAllowPartialParamMismatchOfPrerender2. Existing delegates retain their supplied policy. No activation condition, header comparison, origin/initiator check or prerender feature is disabled; no fake delegate is created. This is a necessary Chromium155 integration stability fix, not a claim of recovered Aside code.

One current-v528 input/output pair is pinned in files.json. Disposable patch replay passed. No native changes, build, launch, signing, profile or credential access occurred in this lane. Integrator should compile and retry the actual sidebar New Tab action that produced both stacks. Other possible delegate-lifecycle bugs are not claimed solved.
