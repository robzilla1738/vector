# Renderer format scope

`pnpm format:check` checks the newly written floating sidebar, command result,
native dialog, page surface, and command bar CSS modules. Prettier is pinned in
the workspace lockfile so local and CI output match.

The CSS files extracted from the older monolithic stylesheet retain their
existing formatting for this release. Add each file to `format:check` after its
rules have been converted and reviewed; do not reformat the legacy cascade as
part of an unrelated behavior change.
