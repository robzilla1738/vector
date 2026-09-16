# Reftest fonts (VEC-006)

`Ahem.ttf` is vendored from the pinned WPT revision in `../wpt-revision.txt`
(`fonts/Ahem.ttf`). The Ahem font is public domain.

`wpt-runner --use-reftest-fonts` loads every `ttf`/`otf` here through
`ParleyShaper`. The m1 merge gate keeps the deterministic `MetricShaper`.
`wpt-harness --http` serves this directory at `/fonts`.
