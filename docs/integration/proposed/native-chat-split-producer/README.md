# Real split-tab exclusion producer

Incremental source-only delta after62c2ee765 task owner; no native source write or runtime operation.

Original region ctor037dfc80 stores TabStripModelObserver secondary vtablee7235a0 at+540. Its slot11 at e7235f8 points to4647c74, which adjusts `this` by-540 and branches to4647a28. The observer's complete method order and payload shape identify genuine `OnSplitTabChanged`. SourceType0 Added inserts actual tab handles into10d8; Type2 ContentsChanged erases previous tabs and inserts new tabs; Type3 Removed erases those handles. Visual changes refresh without set mutation. Actual155 SplitTabChange has the same semantic cases and typed vector<pair<TabInterface*,int>> accessors.

The task owner now owns this genuine set, initializes it from actual current split tabs and observes real split changes. This removes the externally supplied10d8 classification field. `Trackable` still checks the real tab's split state as the original does, as well as this source-owned membership. No tab title, URL, group-title, fictional boolean or default-empty producer is used. Group identity is not a substitute for split state.

Required remaining source adapters: actual Agent installed state,1090 exclusion producer,1028/1030 pending timer lifecycle, NewChat predicate and original11e9 snapshot suppression. The genuine bookmark cache removal follow-up remains a build dependency. The body is still unmounted and its independent predecessor must remain until the complete original owner is connected.

Run `python3 verify.py` for original byte/range/vtable pins and exact disposable two-file replay. Root owns compile/GN/mounting.
