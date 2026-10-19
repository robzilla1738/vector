# Local testing

`npm run check` rebuilds workspace packages, checks shell types, runs errors-only lint and fast unit tests. After editing runtime source, run `npx tsc -b` before focused tests because runtime package exports resolve `dist`. Renderer tests resolve contracts to source.

```bash
npx tsc -b
npm test -- tests/unit/<changed-behavior>.test.ts
npm run check
```

Run one integrated check per coherent slice. Repeat only a failed check or a check invalidated by new changes. Tests cover behavior; removed qualification and launcher receipt machinery has no tests to preserve. Formatting is on demand with `npm run format`; size and bridge inventory are advisory.

`pnpm fixtures` serves deterministic loopback records, forms and interaction pages on ports 4810–4812. Use synthetic content, disposable Profiles and the local model fixture for product tests. Ask before touching a real Profile.

For native changes, launch with `node scripts/dev.mjs --temp-profile` and inspect the changed behavior. One native lock owns staging, incremental build and app lifetime. Stop the app normally before another build. At phase ends, use the roadmap’s performance and AI smoke checks. Signing, release, remote CI and push are outside this workflow.
