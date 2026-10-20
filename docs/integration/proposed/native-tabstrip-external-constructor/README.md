# Original external-mode constructor argument

Original4127d48 saves third argumentx2 inx22;4127e18 stores it atTabStripView369. The constructor then disables/hides both inner scroll views for that mode before collection callbacks create children. Restore that genuine optional constructor argument, defaultfalse, and establish mode immediately after both real scroll views exist. No external mode is activated by this proposal alone.

Current155 RootTabCollectionNode::Init invokes Initialize() before its parent callback; TabCollectionNode::Initialize builds all children before returning. Enabling mode only in region OnTabStripViewSet would therefore be too late: the actual unpinned content would remain in a hidden inner scroll view. The complete Aux body mount must pass true at the real vertical TabStripView factory, while horizontal/default callers retain false. This ports the supplied creation order instead of detaching/deleting/recreating existing real tab models after construction.

Source range and assembly are already pinned by native-tabstrip-external-body/evidence/original-tabstrip-constructor.asm. Actual root/node initialization source was inspected; this proposal does not claim completed mounting or runtime/UI acceptance.
