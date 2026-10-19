# Independently acquired runtime

`sources.json` pins public upstream downloads and SHA-256 digests for the macOS arm64 runtime. No installed reference application contributes runtime bytes. `scripts/build-runtime.mjs` validates archives before extraction; downloads are cached only under gitignored `out/runtime-downloads`.

- Node: official nodejs.org release, MIT and bundled third-party licenses.
- Python: Astral python-build-standalone release. The installed Python license and twenty upstream dependency license texts are retained from the pinned release tag.
- ripgrep: the project's official GitHub release, MIT/Unlicense notices.
- Poppler: public Homebrew bottles with a pinned dependency closure. Each bottle is hash-verified before staging. Mach-O dependency paths are rewritten to bundled peers, with unresolved non-system libraries rejected; modified binaries receive local ad hoc signatures. Upstream Cellar notices/licenses remain beside their libraries. `etc/fonts/fonts.conf` is an original minimal configuration using system fonts.

The daemon and CLI executables use Node's documented SEA builder. The embedded CommonJS bootstrap uses `createRequire` to enter the normal filesystem loader through an original external trampoline; app modules and production dependencies ship inside the bundle. No system Node or checkout path is used at runtime. See https://nodejs.org/api/single-executable-applications.html.

Local probes verified daemon owned-health readiness, CLI version, Python TLS/SQLite, ripgrep, and generated PDF metadata/text/rendering. PDF extraction also passed from a different temporary directory with Homebrew absent from PATH. Full packaged browser acceptance remains separate.
