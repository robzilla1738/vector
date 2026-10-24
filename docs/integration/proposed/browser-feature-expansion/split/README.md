# Native recursive split proposal

Source-only successor. Preserves the supplied two-pane path when `pane_tree` is absent. Eight genuine native panes maximum, mixed horizontal/vertical branches, stable slot identities and explicit collection-order mapping. Root owns shared registration and model/browser/session hooks. No WebContents recreation or URL-based identity.

Implemented in this slice: validated recursive component model, mixed layout/minimum sizing, branch resize/removal, versioned optional session payload. Invalid extensions refuse restoration rather than reinterpret existing state. Existing two-pane serialization remains byte-identical.

Verification: standalone tree source strict C++20 syntax passed; focused gtest source supplied but not executed. Native Views/model/drag integration and actual compile/runtime verification remain pending. This is not a finished user-facing split feature.
