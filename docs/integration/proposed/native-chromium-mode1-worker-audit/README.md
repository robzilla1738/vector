# Supplied Chromium current-profile worker comparison

Static comparison of the complete bounded original mode1 worker4253e58..4255660 and its dispatcher42534e8 against the currently retained migrator/service. This audit adds no parser, category, writer or route. It does not claim runtime acceptance.

The dispatcher selects worker4253e58 only for mode1 and captures the current destination path. The separately reserved/copied new-target worker4255868 remains a different owner. The advertised autofill data kind alone does not justify adding a Web Data writer to mode1.

| Positive original producer | Current concrete owner | Result |
| --- | --- | --- |
| Read Bookmarks, JSON options0/depth200; flatten bookmark_bar, other, synced through425c084, preserving root names/fallback names | migrator ReadCategory Chromium bookmark branch uses ReadFileToString + ReadDict RFC/depth200 and actual BookmarkTree/root labels | Present; missing/unreadable/invalid ordinary bookmarks contribute no rows |
| Arc-only4254460→4259984 then4254478→426be60 adds actual Arc sidebar bookmarks | AppendArcSidebarBookmarks after Chromium bookmark rows | Present; no source-descriptor inference |
| bookmarksOnly returns success after bookmark/Arc production and before History/extensions/secrets | Native/public category selection limits actual staging to bookmarks and does not request extensions | Present in current request path |
| History snapshot/query loop, six URL summary fields, native URL filtering | ReadChromiumHistory + ApplyHistory/ProfileWriter | Present from retained source-backed history slice; no new row parser needed |
| Extension metadata4254770→4259adc and4254780→4259ef0 | ReadChromiumExtensionImports, native accepted-row installer in DidStageChromium | Present; installation completion is not invented from the policy callback |
| Encrypted cookie4254b04→425a380 and password4254b20→425b128 producers after actual key/provider preparation | ReadEncryptedCategoryImpl(private bytes), ApplyChromiumSecrets and actual two destination barriers | Present from L2's supplied reader/destination work; no credential operations performed in this comparison |

The complete worker's explicit product-helper calls and result vectors identify bookmarks/Arc, History, extensions, cookies and passwords. No positively recovered mode1 Web Data/autofill producer or destination was found in this bounded worker. This is a bounded source observation, not a claim that every indirect callee or every shipped import route has been exhaustively proven absent. In contrast, new-target generic file copying positively includes ordinary Web Data and must remain separate. There is no source justification here to add a speculative autofill SQL implementation or declare a missing required mode1 category solely from the public descriptor.

The current service applies staged data through real bookmark/history/password/cookie owners and uses the original completion barriers. This audit has not re-proven every internal parser helper or every destination side effect; the existing separately pinned bookmarks/history/extensions/secret proposals remain their evidence. Any further parity change needs a concrete producer/destination difference, not a new category inferred from UI labels.

Evidence pins the supplied thin image, full worker bytes, retained decompilations, bounded LLVM and exact observed current native hashes. Native files may subsequently change through the integrator; these are observation pins, not replay baselines. No build, runtime, owner-profile read, source database open, Keychain or OS operation was run. No shared native file was changed.
