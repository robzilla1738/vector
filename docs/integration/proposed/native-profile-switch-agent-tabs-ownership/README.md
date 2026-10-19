# Track the actual window-owned agent-tabs popup before profile transfer

The retained Aux agent-tabs popup is an older independent surface. Its original
Aside counterpart and final UI fidelity remain unproven; this patch does not
endorse or redesign that surface. Its Widget owns profile-specific feed callbacks
outside the main sidebar's tracked menus, so a profile migration cannot truthfully
ignore its existence.

Track the actual created Widget and actual owning browser through weak identities.
CanSwitchAuxAgentTabsProfile(browser) refuses while any real Widget for that same
window remains alive, including asynchronous close. Other windows do not block it;
no URL inference, fake close completion, forced OS cancellation or profile data
transfer is introduced. Old entries prune once either identity dies. The button
callback now resolves its actual weak window before constructing the popup.

The mandatory provider must use this cold check before effects. Genuine source
popup closure/settlement and replacement with the supplied original surface remain
outstanding; this guard is not a substitute for 1:1 behavior or runtime acceptance.
