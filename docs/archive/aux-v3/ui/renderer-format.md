# Renderer format scope

`pnpm format:check` checks the converted floating sidebar, command results,
native dialog, page surface, Space editor, and their CSS. It runs Prettier and
enforces a 110-character limit on the scoped TypeScript files. Prettier is
pinned in the workspace lockfile so local and CI output match.

The CSS files extracted from the older monolithic stylesheet retain their
existing formatting for this release. Add each file to
`scripts/check-renderer-format.mjs` after its rules have been converted and
reviewed; do not reformat the legacy cascade as part of an unrelated behavior
change.
