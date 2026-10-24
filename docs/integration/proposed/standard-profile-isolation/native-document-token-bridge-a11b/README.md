# Narrow actual native document bridge

This successor preserves A11's actual document-token join while avoiding a new
virtual method in the widely included RenderFrameHost interface. Keep all three
original RFH/Impl files byte-identical; do not project A11's virtual-accessor edits.

One small public free function takes an actual RenderFrameHost reference. Its
content-only implementation resolves RenderFrameHostImpl::FromID through the real
browser registry and requires exact base-pointer identity. Unsupported/foreign
mock identities return nullopt, never a generated token. It then requires an
active/live host with no pending cross-document commit and returns the existing
real GetDocumentToken fact. No private Chrome include, unsafe downcast, new virtual,
vtable change or broad core-header rebuild is needed.

The actual controller consumes the bridge, retaining its independent
WeakDocumentPtr, routing ID, real extension document ID and actual LocalFrameToken
checks. Tokens remain factual data for comparison with actual cache owners, never
Profile, path, storage or startup authority.

The proposal contains two new files and three counted controller edits against
A12's exact output. It pins the three required unchanged core files. Root owns the
two GN registrations and actual compilation/projection. Source generation/replay
is evidence only; no native code or app ran here. UI, signing and release remain
unchanged/separate.
