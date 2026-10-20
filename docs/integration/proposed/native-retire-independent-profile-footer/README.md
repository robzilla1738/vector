# Retire the extra independent profile footer

Source-only two-file follow-up against the actual264 region h/cc, disjoint from the avatar-renderer proposal. No shared native edit, build, signing, launch, profile read or OS action was performed. Eight exact deletions and a disposable replay pass; actual compilation and observed layout remain integrator checks.

## Original topology, not a replacement design

The supplied region tail has this concrete child order after its actual header parent:

- Original37e40a4 calls3621b00 with the real state controller, root action, BrowserWindowInterface and record-new-tab callback.37e40f0 stores that actual child at region+6f0. Its vtablee68bad0 metadata slot58→2db8d48→2db8d50 resolves the exact literal `VerticalTabStripBottomContainer` atdb10d9f, with the actual upstream header path atdb10dbf.
- Original37e4178..37e4180 allocates and constructs a bare `views::View`;37e41d0 stores it at region+6f8.
- The next actual child construction37e41dc..37e41f4 creates the real ResizeArea, stored in its existing+518 owner.

The current port already mounts the genuine BottomContainer, bare View (`gemini_button_`) and ResizeArea in that order, but independently inserts another `AuxSidebarFooter` between the BottomContainer and bare View. That extra leaf contains the independently implemented profile avatar/chevron, profile dots, agent bolt/status dot and search. It has no counterpart in the original source tail. The genuine profile/pager/search parent is already restored above the actual saved entries, so retaining this extra expanded footer duplicates unverified controls and a second primary-menu anchor.

This proposal removes **only** that extra region child, member and its layout/refresh/agent callbacks. It preserves the genuine BottomContainer, bare View, ResizeArea, real header, actual profile-switch checks for remaining owners and shared top-container agent callback. No expanded replacement, blank proxy component, toolbar/profile-image fallback or new action is introduced. The historical independent footer class remains unmounted/recoverable; it no longer supplies the default region UI or menu presentation.

## Original compact behavior is preserved

Original ApplyLayout464b268..464b270 calls424544c on its actual BottomContainer with the real compact presentation boolean.424544c stores that state at+3f8, updates its actual children, and4245498..42454a8 invokes its own View visibility slot a0 with the same boolean. The genuine BottomContainer is therefore visible in compact presentation and hidden in expanded presentation. The port's existing `bottom_button_container_->SetVisible(collapsed)` and `SetVisible(compact)` are retained byte-for-byte. The extra independent footer's inverse visibility is removed, not transferred to the genuine child.

## Remaining genuine BottomContainer gap

The actual original3621b00 constructor has richer internal children, action/state bindings and styles than the current155 one-NewTabButton implementation. This proposal does not certify those internals or replace them with the removed footer. Their exact recovery is a separate source-backed slice; the pinned constructor is retained here to support that work. The extra profile/dots/bolt/search footer cannot define those original semantics.

## Verification and integration

Run `python3 docs/integration/proposed/native-retire-independent-profile-footer/verify.py`. It verifies the pinned supplied arm64 excerpts, exact constructor/metadata identities, parent stores, bare-view/ResizeArea order, BottomContainer compact visibility call, all eight deletion anchors and two-file disposable patch replay. It executes no target binary or browser code.

`manifest.json` pins the exact actual264 h/cc baselines and complete proposed outputs. No GN path/dependency or source registration is added. No runtime or full-parity acceptance is claimed.
