# Actual262 primary-menu compiler correction

Apply after6c2ef6d5e (root263 Bookmarks), not directly to the earlier actual262 sidebar. The observed actual262 compilation reports only `RefreshAuxProfileButton` as an unused internal function under Werror. Its sole use was the independently implemented icon-picker callback removed when Edit was restored to the original edit-name DialogModel.

This two-anchor correction removes that obsolete forward declaration and function, preserving the AuxProfileButton class, all active owner/observer behavior, actual menu actions and glyphs. No warning suppression or artificial call is added. The exact diagnostic is retained in `diagnostic.txt`; baseline and output hashes are in `manifest.json`.

`python3 docs/integration/proposed/native-primary-menu-api155/verify.py` passes counted-anchor replay and a one-file disposable patch replay. No shared native write, build, launch, signing or owner-state action was performed; actual recompilation belongs to the integrator.
