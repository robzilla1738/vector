# Supplied Settings import route: preserve the matching implementation

No native/UI patch is justified by this bounded finding. The actual supplied Settings frontend and its initialize/reply backend both retain the stock import dialog. Current155 matches those source-owned behaviors.

## Actual supplied resources

Pinned original `resources.pak` SHA **d171d77d3c946a22e76d9a5b399a5381f9da704bee09d5f1561f93ca9ba1d728**, resource **21027**, decoded SHA **b1facdd16a053295e95f871f53693f58d0dbbe9e7e9ef70327cc62d5764c5c5b**:

```
onImportDataClick_(){Router.getInstance().navigateTo(routes.IMPORT_DATA)}
this.showImportDataDialog_=Router.getInstance().getCurrentRoute()===routes.IMPORT_DATA
```

The exact byte offsets, snippets, raw range/hash and decoded hash are pinned. Current `chrome/browser/resources/settings/people_page/people_page.ts` has the same navigation and route-to-dialog condition. Replacing its click handler with `chrome.send('openBrowserImportWindow')` would alter the supplied frontend, not restore a proven missing original binding.

All **6004 unique resources** in the four exact supplied packs were decoded (plain/gzip/Brotli); none contains the UTF8 or UTF16LE literal `openBrowserImportWindow`. Aliases introduce no distinct payload. This is a bounded absence finding for these exact packs, not proof about every possible native/extension/dynamic sender.

## Actual native initialize and reply

Original `7dc36b4..36d4` registers `initializeImportDialog` to `7dc3794`. Its entire body through `7dc38c4` matches the current initializer: AllowJavascript; require one argument; obtain the callback ID; replace ImporterList; get real application locale; call actual ImporterList::DetectSourceProfiles (`7820c24`) with include_interactive_profiles=true and the actual reply (`7dc3e7c`). It does not redirect to the standalone importer.

The full reply `7dc3e7c..7dc4084` sets importer_list_loaded, iterates actual SourceProfile records, constructs source names/indices/profile names and capability booleans, and resolves that JavaScript callback with the real list. This also matches current155 `ImportDataHandler::SendBrowserProfileData`. No standalone window creation/message dispatch appears in either function.

Separately, `native-import-standalone-creator` positively proves that PeopleHandler registers **openBrowserImportWindow** between ShowAccountSettingsUI and SetDatatype, bound to the real standalone creator. That additional native entry is now ported. **Its actual frontend/menu sender remains unproven**; we must not call the extra registration “reachable from the Settings import button” merely because both exist.

## Actionable remaining boundary

Preserve the matching stock Settings button/route/initializer/reply. The standalone creator can be invoked through its real registered message by an authorized actual caller, but full supplied user-flow parity requires recovering the actual sender/override, if one exists outside these exact packed resources. Do not add a speculative button, reroute stock ImportData, or expose an extension/CDP method to stand in for it. The already ported strict standalone lifecycle guard continues rejecting ordinary Settings/browser tabs for whole-window retirement.

`node verify.mjs` checks all four whole-pack pins,6004 decoded resources and literal absence, exact resource/snippet hashes, three original thin ranges/listings and both current native source hashes. It decodes static bytes only; no JavaScript from the supplied pack is evaluated, and no browser/profile/DB/Keychain/native UI is run. No shared native source changes or builds were performed.
