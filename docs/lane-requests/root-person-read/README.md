# Native person-read admission request

Source-only shared-file request against the exact recorded EgressController
originals from L10's native authority foundation and the clean21eb permission
fixture. It is not in the canonical series, Stable, or a qualified build.

`CapturePersonRead(WebContents*)` returns an optional, browser-constructed
`NativePersonReadReceipt`. Its constructor and generation fields are private;
the original document and page id have const getters. `MayReadPerson(receipt)`
must run immediately before each fixed renderer operation and before delivering
its result or accepting a recorder event. Never accept a receipt from JSON.

The native UI sequence checks the actual Profile, nonprivate tab catalog,
runtime-owned identity, primary live document, HTTP(S) URL, registered isolation,
protected document/opener state, installed request lease and native navigation
transition. Original task opener chains are bounded; an unknown or overlong
chain refuses admission. Registered isolation is refused before first Install.
Ordinary `Context` is identity-only: native Install requires isolation, so an
ordinary context does not become an invented runtime 'preparing' phase.

Each receipt retains the actual PageState control generation and a native
person-read retirement generation. Native owner mutation Begin and End rotate
the latter, including a successful mutation that settles between two checks.
Disconnect also rotates it. Existing `ObserveAuthority` wakes recorder/read
owners; native isolation registration now notifies after installing its guarded
state. Clients must also retain their original connection/document lifecycle;
this receipt does not replace those checks or grant any agent mutation.

Five native controls exercise document replacement, owner mutation including
successful settlement, disconnect/replay, foreign Profile/runtime identity, and
registered preparing isolation. Their definitions are uncompiled/unexecuted.
Exact three-leaf forward/result/reverse/original replay passes. The whole L10
authority batch, builder compilation, genuine native cases and journeys remain
required before adoption or qualification. No assertion or gate is weakened.
