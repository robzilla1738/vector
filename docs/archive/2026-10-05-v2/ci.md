# Local checks

Development uses local checks. GitHub Actions workflows and Dependabot automation are removed.

Run `npm run check` for the workspace build, shell typecheck, lint and unit tests. Tests importing `@aux/runtime` resolve compiled output, so rebuild after runtime edits before running focused tests directly.

`npm run size` and `npm run bridge:coverage` report advisory information. Run `npm run format` on demand. Native development uses the [build instructions](../chromium/BUILDING.md).
