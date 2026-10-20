# Actual preview role access

Followup to L4 mounted pinned leaf d2d906e4e. Returns exact live role-bound pointers in original4658294 order: actual saved pinned leaf, actual pinned live container, actual vertical unpinned scrolling surface, bottom container, bare spacer. The restored ScrollView mount43e667d40 makes the third role the actual custom subclass; this accessor does not fabricate its state. No whole Sidebar, clone, tab surrogate, title-based view inference or separate widget is substituted.

Original4640768 uses the real top container+590 bottom as preview boundary. Original constructor37e099c..37e0a08 installs it through ctor3555540; actual155 top_button_container_ is the real corresponding top-container owner. The known155 nested-parent geometry adaptation remains in ProfilePreviewPresentation.

This is a typed private region seam for the actual page owner; no gesture/activation trigger. Both exact prior pinned-leaf outputs are hashed in manifest. Source evidence remains original native-profile-preview-coordinates/source-evidence.json and native-profile-switch-owner role proof. No shared source mutation, build, target run or owner data. Root owns focused compile.
