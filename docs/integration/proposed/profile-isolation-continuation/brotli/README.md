# Isolated Brotli 1.2.1 static successor

The original configured Node26.5.0 tree remains untouched. Its `node_shared_brotli=false`, source version header1.2.0 and static `libbrotli.a` SHA `1a6c7fe1d223ade5117340b410af232188cda61ed9b56c27910a9641dcd8d661` still describe the historical build. The linked inactive daemon `3e48f015...` and its byte-identical final-local copied package contain encoder/decoder version returns `0x01002000`. Updating a running shell or Homebrew does not change those static bytes. Node's own `node_metadata.cc` derives its Brotli version from `BrotliEncoderVersion()`, not a patched display string.

The installed Homebrew1.2.1 bottle has static libraries, but every inspected object targets macOS27.0. It was **not** used in Aux's macOS13.5 successor. The installed formula instead pins the official source:

- URL: `https://github.com/google/brotli/archive/refs/tags/v1.2.1.tar.gz`
- SHA-256: `98d35d11a78dc453aebb7d10c3748f3f73ff78c8267c0dc697b8631f67bf7e8f`

That exact source was retrieved and validated, safely extracted into a fresh external directory, and compiled through `scripts/native-build.py`. `build.py` uses all35 translation units from the original Node `brotli.gyp`, the actual generated Node Release defines/C flags, arm64, macOS13.5 and an explicit SDK. Only C compilation and static archiving run; no upstream build scripts, library output, daemon, executable test or signing operation runs. Two compiler jobs are used.

Actual successor:

- Archive: `/private/tmp/aux-brotli-1.2.1-20261023/build/libbrotli.a`
- SHA-256: `8242699baf1367dab8677cfba29efec1086a184db84b950f90fc494b05fd2f0d`
- Minimal linker manifest: `/private/tmp/aux-brotli-1.2.1-20261023/build/prepare-daemon.json`
- Full receipt: `/private/tmp/aux-brotli-1.2.1-20261023/build/results.json`

All130 original defined global symbols remain present, with130 successor definitions. Actual archive disassembly shows both encoder/decoder return `0x01002001`; archive load-command inspection reports only macOS13.5 and arm64. Original source/configuration/archive/receipt hashes and new source hashes remain unchanged. `evidence/` preserves the exact compile commands, terminal results, inspection and receipt; `integration.json` binds the explicit old/new archive association. The original static Node build receipt is not rewritten.

Reproduce with a fresh output directory (the source tar must first match the pinned hash):

```
python3 scripts/native-build.py python3 docs/integration/proposed/profile-isolation-continuation/brotli/build.py --archive /path/to/verified-source.tar.gz --output /fresh/external/build
```

The integrator selects this archive in a new coherent unsigned full link and verifies the resulting binding/symbol graph; old link/package receipts cannot be reused or relabeled. This lane did not link/load/run a final daemon or mutate the accepted app. Existing copied candidates and historical originals remain their original version until a distinct successor is assembled. No UI, provider request, credential/profile access, OS grant, signing or release occurred.
