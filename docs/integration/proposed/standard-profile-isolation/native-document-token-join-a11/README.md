# Actual native document-token join

The cache cohort reports Blink LocalFrameToken/DocumentToken facts. The existing
extension document ID is a different native-generated per-document token; using
one in place of the other would not join that actual cache to its browser owner.

This minimal native seam exposes an optional existing document fact through the
public RenderFrameHost interface. Unsupported hosts/mocks return nullopt. The real
Impl returns its actual existing DocumentToken only for an active/live frame with
no pending cross-document commit, preserving its original safety restrictions.
There is no generated/default-token fallback or chrome-to-content private cast.

The actual controller retains and compares that native document token and actual
LocalFrameToken in addition to WeakDocumentPtr, global routing ID, real extension
document ID, actual Profile, origin and lifecycle. Journal fields are factual
data only. A later cache join must iterate these real held owners and compare
reported facts; tokens never choose a root/Profile or grant readiness.

Four actual files and seven counted anchors are pinned by exact input/output
hashes. Source generation checks unique anchors and leaves the native checkout
unchanged. Root owns projection and object compilation; this is not runtime
acceptance and does not add a storage, activation, signing or release grant.
