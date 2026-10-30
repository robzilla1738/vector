# Memory helper

Status: **draft**. Groundwork for Batch 10 item 5 in [the browser excellence plan](../plans/2026-10-29-browser-excellence.md): rewrite the supplied memory helper (compiled Rust plus Core ML models) while keeping catalog format 2 and the on-disk index byte-compatible. This page is current work, not part of the historical clean-room set described in [README](README.md).

Reference artifact: release build 91, `out/release/1.0.0-91/Aux.app`. Paths below are relative to `Aux.app/Contents/Resources/aux/` unless they start with `/`.

Evidence tags:

- **[O]** observed: read from a build 91 file, or seen by running the build 91 helper standalone against a throwaway fixture in the session scratchpad. No app launch and no real account data.
- **[S]** read from the preserved native source at `out/live-inputs/tmp-preserved/aux-browser-only-daemon-build-20261025-a72/source/`. That source is older than build 91 (its pinned helper source hash `b4c7d12e…` is not build 91's `f27ec07c…`), so treat it as structure, not exact values.
- **[I]** inferred from code or strings. Not verified.

## 1. How the daemon runs the helper

### 1.1 Files

| Path | What it is |
| --- | --- |
| `apps/daemon/Aux Daemon.app/Contents/Resources/memory-helper/aux-memory` | The helper the packaged macOS daemon actually launches. Mach-O arm64, 3,436,544 bytes, sha256 `17632bf5…2d07`, hardened runtime, Developer ID `9F2JXY8TCK`, identifier `dev.aux.browser.memory`. Links CoreML, Foundation, CoreFoundation, libobjc, libc++, libiconv and libSystem; no ONNX Runtime. [O] |
| `apps/daemon/Aux Daemon.app/Contents/Resources/AuxMemoryHelperLaunchPolicy.json` | Launch record (format `aux.memory.fixed-helper-launch.v1`). Holds `identifier`, `team`, `bytes`, `sha256` of the signed helper, `sourceSha256` = `f27ec07c…` (the unsigned-identity copy below) and `modelDescriptorSha256` = `2001e15f…`. [O] |
| `memory-distribution/memory-catalog.json` | Catalog, format 2 (section 2.1). sha256 `67f92919…6318`, pinned in the daemon JS. [O] |
| `memory-distribution/memory-runtimes/1becd2e6…/a3a6ff12-…/aux-memory` | The same helper with identifier `aux-memory` (3,436,528 bytes, sha256 `f27ec07c…`), plus `runtime.json`. Seeded into the task home. The packaged macOS path never launches it. [O] |
| `memory-distribution/models/2001e15f…/6e23b637-…/` | The Core ML model bundle (section 3). [O] |
| `apps/daemon/…/Resources/native/local-memory-licenses/` | Notices: Bekko, ONNX Runtime, SimSIMD, FxHash, NAPI-RS, Rust third-party. [O] |

### 1.2 Seeding the task home

When the daemon starts, `auxProvisionBundledMemoryV2` copies `memory-distribution/` into the account-independent task home (`roots.taskHome`, a path the native layer supplies) as `models/<key>/<generation>/` and `memory-runtimes/<key>/<generation>/`, each with a `CURRENT` file holding the generation UUID. It checks every file against the embedded seed `AUX_MEMORY_V2_SEED` (size, sha256, and mode 0600 or 0700), stages each group in `.aux-memory-seed-v2-*`, fsyncs it, renames it into place, then writes `CURRENT` atomically through `.CURRENT-<uuid>`. A generation that already verifies is kept as it is. [O]

`<key>` is the sha256 of the descriptor (`model.json` or `runtime.json`): the catalog entry serialized as compact JSON, with each file reduced to `{bytes, sha256}`. Recomputing it gives `2001e15f…` for the Core ML model and `1becd2e6…` for the runtime, which matches the directory names. The ONNX model's key would be `fd8b438b…`. [O]

`ModelDownload.ensure()` then re-verifies the cached generation (descriptor text equal, sizes and sha256 equal). A mismatch raises `Aux bundled memory cache failed integrity verification; restart Aux to repair it from the bundled seed`. There is no network download in the packaged build: the base URL is `http://127.0.0.1:9/aux-unavailable/…` and the code after the throw can't be reached. [O]

### 1.3 Launch, packaged macOS

When the native binding `aux_owned_native` has `supervisedTasksEnabled === false` and exposes `createAccountMemoryProcess`, the daemon calls `auxAccountMemoryProcess(accountId)`. That wraps the native process in a Node `ChildProcess`-like object (stdin, stdout and stderr streams, plus `kill` and `auxClose`). The JS gets no path, fd or argv control. [O]

The native host (`AuxAccountMemoryHelper.mm`) [S]:

1. Requires that its own image ends in `/Contents/MacOS/aux-daemon`. It opens `Contents/Resources/AuxMemoryHelperLaunchPolicy.json`, checks that the file is sealed by the daemon's code signature, and checks the policy keys and values exactly.
2. Opens `Contents/Resources/memory-helper/aux-memory`, checks its sha256 and byte count against the policy, and checks the signing requirement `anchor apple generic and identifier "dev.aux.browser.memory" and certificate leaf[subject.OU] = "9F2JXY8TCK"`.
3. Resolves the model directory as `<taskHome>/models/<kMemoryModelKey>/<CURRENT>` and checks every file against `AuxMemoryModelPins.inc` (mode, size, sha256).
4. Spawns `/usr/bin/sandbox-exec -D AUX_MEMORY_IMAGE=… -D AUX_CONTROL=… -D AUX_TASK=… -D AUX_MEMORY=… -D AUX_MODEL=… -D AUX_BROWSER_DATA=… -D AUX_BROWSER_CACHE=… -p <profile> <helper> <modelDir> ""`. The child starts suspended, its PID is published, and then it resumes. The environment is exactly `PATH=/usr/bin:/bin`, `ORT_DISABLE_TELEMETRY=1` and `HOME=<account memory dir>`. stdin, stdout and stderr are pipes.
5. Seatbelt profile: allow by default; deny network, `process-fork`, and exec of anything except the helper image. File reads are denied under control, browser data, browser cache, and the task home outside the memory and model directories. File writes are denied under control, browser data, browser cache, and the task home outside the memory directory. Hard links are denied in all of them.
6. Rewrites every request before passing it on (section 1.5).

### 1.4 Launch, fallback (development and other platforms)

`spawn(executable, [modelDirectory, runtimeLibrary ?? ''], {stdio: pipe×3, shell: false, env: {...process.env, ORT_DISABLE_TELEMETRY: '1'}})`. [O]

- **argv[1]** is the absolute model directory. **argv[2]** is the absolute ONNX Runtime library path, or `""` for Core ML. The ONNX build requires an absolute path (`An absolute ONNX Runtime library path is required`). [O, strings]
- The helper chooses its backend from `model.json`'s `id`: `…row-i8-coreml-f32-512:v2` uses Core ML, `…row-i8-onnx-f32-512:v3` uses ONNX Runtime. Any other id fails with `Unsupported local model bundle`. [I, strings]

### 1.5 Wire protocol

Newline-delimited JSON over stdio, one object per line, UTF-8. [O]

- Request: `{"id": <safe integer ≥ 1>, "method": <string>, "params": <object>}`.
- Response: `{"id": <same>, "result": <value>}` or `{"id": <same>, "error": <string>}`. The client matches on `id`, so responses can come back out of order. [O shape of result; I error shape, from the daemon client]
- stderr carries free-text diagnostics. The daemon logs the first 4 KiB of each chunk. [O]

Methods (the helper's `Command` enum has 7 variants) [O]:

| Method | Params | Result (observed) | Allowed through native host? |
| --- | --- | --- | --- |
| `status` | `directory` | `{count, error, indexing, modelId, modelLoaded, processedFiles, totalFiles}` | yes |
| `sync` | `directory`, optional `rebuild: bool` | `{added, changed, count, files}` | yes |
| `search` | `directory`, `query`, `topK`, optional `alpha` | `{docs: [{id, score, text, source}], indexName, indexing, query, timeTakenInMs}` | yes |
| `close` | `directory` | `{}` | yes |
| `shutdown` | none | `{shutdown: true}` | yes |
| `embed` | `text` | an array of 384 floats, L2-normalized | **no** (helper only) |
| `chunk` | `path`, `text` | an array of chunk records (`source` fields plus `text`) | **no** (helper only) |

`source` / chunk record: `{id, path, title, headings: string[], charOffset, lineStart, lineEnd, hash, windowFrom?}`. [O]

- `path` is relative to `directory` and uses forward slashes.
- `hash` = sha256(chunk text), lowercase hex. [O]
- `id` = sha256(`` `${path}:${charOffset}:${hash}` ``). Checked on 3 chunks. [O]
- `title` is the first heading, or the file stem when there is no heading. `lineStart` and `lineEnd` are 1-based and inclusive. A YAML front-matter block stays in the chunk text. [O on the fixture]
- `windowFrom` appears on `episodic/context-awareness-YYYY-MM-DD.md` time-window chunks (`### HH:MM – HH:MM` sections, plus a "Day overview" chunk). [I, strings and daemon rerank]

Bounds and behavior:

- Message size is at most 1 MiB per line in each direction. Daemon queue: 64 in flight, 65 when the extra one is `shutdown`. Native queue: 64 messages or 4 MiB. [O daemon; S native]
- `search`: `query` ≤ 65,536 UTF-8 bytes, `topK` an integer from 0 to 100, `alpha` a finite number if present. Otherwise `Invalid memory search bounds`. [O]
- The native host accepts only the key sets in the table above, requires `rebuild` to be a boolean, and **overwrites `params.directory` with the account's memory directory** (it drops nothing else). So the only directory the helper ever sees in production is `<taskHome>/u/<accountId>/memory`. [S]
- A request the helper's serde can't parse (missing field, unknown method) is fatal. The helper prints the serde error, for example ``missing field `text` at line 1 column 37``, and exits with status 1. It does not reply with `error`. [O]
- **stdin EOF ends the process at once**, dropping in-flight work. With stdin closed right after `shutdown`, the `shutdown` reply came out truncated. A client must keep stdin open until it has every reply. [O]
- `sync` requests that arrive while a sync is running are merged: two back-to-back syncs got identical replies. Error strings `A memory sync is already running` and `Too many waiting sync requests` also exist. [O merge; I limits]
- `search` before the first sync can return the error `Memory index is being initialized; retry shortly`. [I]
- Other helper error strings: `Memory directory must be absolute`, `Memory index is already owned or cannot be locked: …`, `Memory account closed`, `Too many active memory accounts`, `Model bundle changed while the process was running`, `Invalid or oversized memory source file`, `Memory source file grew beyond its limit`, `Memory request exceeds size limit`, `Truncated memory request`, `Non-finite or invalid model output (norm: …)`, `Local model execution failed`. [O strings]

### 1.6 Daemon client behavior (`MemoryProcess`, `LocalMemoryManager`, `MemoryManager`)

[O, all from the composed daemon JS]

- One helper process per account, started lazily on the first request. Each instance is keyed by `[accountId, accountRoot]`.
- Timeouts: `sync` 600 s; every other method 30 s. On timeout, all pending requests are rejected (`Memory <method> timed out`) and the process gets SIGKILL.
- If nothing is in flight for 300 s (`idleMs`), the client calls `close()`. Closing sends `shutdown`, ends stdin, and SIGKILLs after 1 s if the process hasn't exited. On the native path, `auxClose()` waits up to 3 s for pending requests to settle and then calls the native close, which sends SIGTERM and SIGKILL 1 s later. [O JS; S native]
- An oversized or non-JSON stdout line, or a non-integer `id`, rejects everything and SIGKILLs the process.
- The first search calls `status` first. If `count === 0`, it waits up to 5 s for a sync. `topK` = `min(40, maxResults×4)`, or 80 with a date range or the context-awareness exclusion. The daemon reranks results (0.7 helper score, 0.15 recency, 0.15 path-term overlap) and collapses windows.
- The watcher (chokidar on the memory directory) ignores `.local-memory`, `.moss-cache`, `memory-index*.json`, dotfiles and temp files. Changes to `.md` files trigger a `sync` after 750 ms.
- `.local-memory-activation` (`pending` or `ready`) in the memory directory is written by the daemon. If it isn't `ready`, the daemon runs `sync {rebuild: true}` first. Once the store is ready, the daemon deletes the old Moss artifacts: `.moss-cache`, `.moss-cache-schema`, `.moss-local-namespace`, `.moss-pending-push`, `memory-index.json`.
- `getIndexStatus` reads the mtime of `.local-memory/memory/CURRENT` as `updatedAt`.

## 2. On-disk formats

### 2.1 Catalog format 2 (`memory-catalog.json`) [O]

```
{ "format": "aux.bundled-memory-catalog.v1", "formatVersion": 2, "sequence": <positive int>,
  "runtimes": [RuntimeManifest…], "models": [ModelManifest…] }
```

- **RuntimeManifest** (formatVersion 2): `{formatVersion: 2, id: "aux-memory-runtime-v2", target: /^(darwin|linux|win32)-[a-z0-9-]+$/, executable: "aux-memory"|"aux-memory.exe", runtimeLibrary?: "onnxruntime.dll"|"libonnxruntime.so.1"|"libonnxruntime.1.29.0.dylib", files}`. Windows and Linux targets must name their library. Build 91 ships only `darwin-arm64`, with no library.
- **ModelManifest** (formatVersion 1): `{formatVersion: 1, id: <COREML_MODEL_ID | ONNX_MODEL_ID>, dimensions: 384, maxTokens: 512, files}`. Required files: `tokenizer-compact.json`, `tokenizer-merges.u32`, `word-embeddings.i8`, `word-scales.f32`, `NOTICE.txt`, plus `model.onnx` (ONNX) or at least one file under each of `model-64.mlmodelc/` and `model-512.mlmodelc/` (Core ML).
- **files**: a map from a relative path to `{bytes, sha256, compressedBytes, compressedSha256}`. 1 to 256 entries; raw and compressed totals each ≤ 512 MiB. The key can't be `model.json` or `runtime.json`, and Windows-reserved names and characters are rejected. The compressed fields describe the `<compressedSha256>.zst` download objects.
- The daemon accepts the catalog only if its sha256 equals the pinned `67f92919…6318`. Unknown runtime or model entries are dropped rather than failing the catalog. macOS picks the Core ML model; other platforms pick ONNX.
- The descriptor stored next to a cached generation (`model.json` / `runtime.json`) is the same manifest with `compressed*` removed, as compact JSON. Its sha256 is the cache directory key.

A rewrite has to keep this file, the descriptor derivation and the cache-key rule bit-for-bit, because the daemon pins the hashes.

### 2.2 Account memory directory

Location: `<taskHome>/u/<accountId>/memory`. The directories are created at mode 0700 by `auxEnsurePrivateMemoryAccountDirectories`. [O] The concrete `taskHome` path comes from the native `captureStorageRoots()` and isn't resolved here.

Source files (written by the agent and daemon, read-only to the helper): `MEMORY.md`, `USER.md`, `TAXONOMY.md`, `episodic/*.md` (including `episodic/YYYY-MM-DD.md` and `episodic/context-awareness-YYYY-MM-DD.md`), and other `*.md` files. [O daemon layout]

Files the helper writes, observed on a three-file fixture [O]:

```
memory/
  memory-index-local.json        # chunk manifest
  .local-memory/
    writer.lock                  # empty; single-writer lock
    memory/                      # index name "memory"
      CURRENT                    # "gen-0000000002" (no newline)
      gen-0000000001/            # previous generation is kept (at least one)
      gen-0000000002/
        COMMITTED                # same text as the generation name
        session.json
        docs.json
        index.mossvec
```

Transient names in strings: `.local-memory.memory-index-local.tmp`, `CURRENT.tmp.<…>`, `index.tmp`, `memory.invalid-<…>` (an unreadable snapshot is kept under this name, not deleted). Messages: `No valid committed snapshot`, `Snapshot generation exhausted`, `Could not repair memory snapshot CURRENT`. [O strings] The rules: write the generation, write `COMMITTED`, then swap `CURRENT` atomically; on open, fall back to the newest committed generation. [I]

**`memory-index-local.json`** [O]: `{"entries": {<chunkId>: <source record>}, "version": 1}`, compact JSON with keys in sorted order. The source record is as in 1.5, without `text`.

**`session.json`** [O]: `{"dimension": 384, "docIds": [<chunkId>…], "generation": "gen-NNNNNNNNNN", "manifestSha256": null, "modelArtifactVersion": null, "modelId": "<model id>", "name": "memory", "updatedAt": "<ISO-8601 ms Z>"}`. Keys are sorted. `docIds` order = row order in `index.mossvec` = order in `docs.json`. On the fixture that was sorted by chunk id. [O; whether it's always sorted is I] Checks on open: `Snapshot model/name/generation differs`, `Snapshot document count differs`, `Snapshot document IDs differ`. [O strings]

**`docs.json`** [O]: `[{"id", "text", "payload"}]`. `payload` is the source record serialized as a JSON **string**.

**`index.mossvec`** [O], little-endian:

| Offset | Type | Value on fixture | Meaning |
| --- | --- | --- | --- |
| 0 | 4 bytes | `MOSS` | magic |
| 4 | u16 | 2 | format version |
| 6 | u16 | 1 | element type (1 = f32 [I]; the strings mention SQ8, which needs v2) |
| 8 | u32 | 384 | dimension |
| 12 | u32 | 1552 | row stride, bytes |
| 16 | u64 | 3 | row count |
| 24 | u64 | 256 | header size; bytes 32–255 are zero |
| 256 + i·1552 | row | | `u64 ordinal (= i)`, `f32 L2 norm of the vector`, `u32 0`, `f32[384] vector` |

Stored vectors are bitwise identical to `embed(chunk.text)` (section 4). A `sync {rebuild: true}` produced a byte-identical `index.mossvec` and a `session.json` identical apart from `generation` and `updatedAt`. [O]

For byte compatibility, a rewrite must reproduce the chunker (boundaries, `charOffset`, line numbers, titles and headings), the id and hash formulas, JSON key order and number formatting, the generation naming (`gen-` plus 10 zero-padded digits), and bitwise-identical vectors.

### 2.3 Search internals [I, strings]

- Hybrid search: a sparse lexical index (`src/sparse.rs`, with Snowball stemmers and stopword lists for many languages, plus Unicode segmentation) and dense cosine (SimSIMD).
- `alpha` weights the two. The daemon passes it through from the caller and usually leaves it undefined.
- Scores come back normalized so the top hit is 1.0. [O]
- There's a filter language (`$and`, `$or`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$near`), but the stdio protocol doesn't expose it. The sparse index isn't persisted in the files above, so it's presumably rebuilt in memory from `docs.json`.

## 3. Shipped model

Directory `models/2001e15f…/6e23b637-b0d3-47c0-b9ed-d8edc42da9fc/`. Model id `bekko-a8m@c721113d59a1d91b447450324f51c4b3332c924a:row-i8-coreml-f32-512:v2`. Upstream is `hotchpotch/bekko-embedding-v1-a8m`, MIT, pinned to that revision. [O]

| File | Bytes | Content |
| --- | --- | --- |
| `model.json` | 1,751 | descriptor (2.1) |
| `NOTICE.txt` | 1,447 | MIT notice. Local changes: row-wise int8 word embeddings in mapped files, fixed 64- and 512-token graphs, masked mean pooling, FP32 Core ML. |
| `tokenizer-compact.json` | 323,696 | `{bos: 2, eos: 1, added: [{content, id, lstrip}] ×249, bytes: [256 ids or null], chars: [[codepoint, id]] ×20,722}` |
| `tokenizer-merges.u32` | 9,289,664 | 580,604 records of 4×u32 LE: `(left, right, rank, merged)`, sorted by `(left, right)`. Max rank 580,603. [O layout; field roles I] |
| `word-embeddings.i8` | 98,304,000 | 256,000 × 384 int8, row-major |
| `word-scales.f32` | 1,024,000 | 256,000 f32: one dequantization scale per row |
| `model-64.mlmodelc/` | 30.9 MB | Core ML graph for sequences of 64 tokens |
| `model-512.mlmodelc/` | 31.4 MB | Core ML graph for sequences of 512 tokens |

The tokenizer is a 256,000-entry vocabulary with Gemma-style added tokens (`<pad>`=0, `<eos>`=1, `<bos>`=2, `<unk>`=3, `<mask>`=4, `<2mass>`, `[@BOS@]`, `<unused0..99>`, HTML tags, tab and space runs up to id 255,998). It's BPE: per-character ids, merges by rank, and byte-fallback ids for characters it doesn't know (`Missing byte fallback token`). [O file; I algorithm]

Core ML graphs. `xcrun coremlcompiler metadata` fails because no `Manifest.json` or `metadata.json` ships, so the shapes below come from each `model.mil` signature [O]:

- MIL `program(1.3)`, `func main<ios18>`, coremlc 3520.5.1, fp32 throughout.
- Inputs: `attention_mask` fp32 `[1, N]` and `word_embeddings` fp32 `[1, N, 384]`, with N = 64 or 512.
- Output: `sentence_embedding` fp32 `[1, 384]` = Σ(mask · last_hidden_state) / Σ mask (masked mean). **Not normalized in the graph.**
- Body: LayerNorm on the embeddings, 4 encoder layers (`layers_0…3`: attention with softmax, 1152/2304-wide MLP with erf GELU, rotary tables as constants), and a final LayerNorm (ε ≈ 1e-5).
- Embedding dimension: **384**. Max tokens: **512**.

What the host does (strings `src/tokenizer.rs`, `src/vectors.rs`, `src/local_model.rs`) [I]:

1. Tokenize the text, with BOS/EOS presumably added.
2. Truncate to 512 tokens.
3. Pick the 64 graph if the sequence fits, otherwise the 512 graph.
4. For each token id `t`, gather the row `word_embeddings.i8[t]` as f32 × `word_scales[t]`. Pad to N with a 0 mask.
5. Run Core ML.
6. L2-normalize. A non-finite output or a zero norm is an error.

The observed output norm is 1 ± 2e-7 [O]. The ONNX variant (`model.onnx`) takes the same inputs.

Strings also mention a "rebuild accelerator" (`Rebuild accelerator unavailable; using CPU`). Which Core ML compute units each path uses is unknown. On this Mac, rebuild and incremental sync gave bitwise-identical vectors. [O result; mechanism unknown]

## 4. Proposed equivalence test

### 4.1 What was observed on the supplied helper

On this Mac (BGM-D9NM7V4QQX), using the signed helper and the bundled model:

- `embed` is bitwise deterministic across two process runs, for all 5 inputs (including empty, and about 400 tokens).
- `embed(docs[i].text)` equals row i of `index.mossvec` bitwise.

Embeddings can therefore be compared through `embed` directly, and index vectors through the file.

### 4.2 Fixed corpus

Check it in as `fixtures/memory-helper/corpus.jsonl`, one `{"name", "text"}` per line. About 20 items:

1. A short English sentence: `The hotel reservation in Paris starts September tenth.`
2. A Korean query: `파리 호텔 예약은 언제 시작해?` (the daemon's own packaged self-test pair with 1).
3. Japanese (Bekko's home language), Chinese, Arabic and Hindi sentences.
4. Mixed-script text with emoji, ZWJ sequences and a rare CJK codepoint, to exercise byte fallback.
5. Empty string, a single space, `\t` runs (the vocabulary has tab-run tokens), and `\r\n` line endings.
6. The same word in NFC and NFD.
7. Markdown with front matter, headings, a fenced code block and a list.
8. A text sized to land at 62, 63, 64 and 65 tokens including BOS/EOS, to cover the 64/512 graph switch. Calibrate it once by watching where the supplied outputs change graph, or count tokens with a reference tokenizer.
9. A text of about 511, 512 and 520 tokens, and one of about 5,000 tokens (truncation).
10. Three small `.md` files plus an `episodic/YYYY-MM-DD.md` and an `episodic/context-awareness-YYYY-MM-DD.md` with `### HH:MM – HH:MM` sections, for the `sync` / `index.mossvec` / `docs.json` comparison.

### 4.3 Comparisons and tolerances

Store the supplied helper's output once as the golden file (`fixtures/memory-helper/golden-embeddings.f32`, plus the fixture index tree), then compare the rewrite against it.

| Check | Pass condition |
| --- | --- |
| Shape | 384 finite floats per item; ‖v‖₂ within 1e-6 of 1. |
| Embedding, same Core ML compute units as the supplied helper, fp32 | **Bitwise equal** (max abs diff 0). This is the bar for "index byte-compatible". |
| Embedding, fallback bar (different compute units, or ANE fp16) | Cosine ≥ 0.99999 and max abs diff ≤ 1e-4 per item. Anything looser fails, and the file is then format-compatible only, not byte-compatible. |
| Retrieval | For 10 fixed queries over the item-10 corpus, the top-5 chunk ids are identical and in the same order; scores agree within 1e-5. |
| Index files | `index.mossvec`, `docs.json` and `memory-index-local.json` are byte-equal. `session.json` is byte-equal after removing `updatedAt`. `CURRENT`/`COMMITTED` read `gen-0000000001` after a first sync into an empty directory. |
| Cross-read | The rewrite opens an index written by the supplied helper, and the supplied helper opens one written by the rewrite. `status.count` matches and `search` returns the same results. |
| Protocol | Same replies to `status`, `sync`, `search`, `close` and `shutdown` (ignoring `timeTakenInMs`). A malformed request makes the process exit non-zero. Closing stdin ends the process. |

A failing item should report its name, cosine, max abs diff and the index of the worst component.

### 4.4 Running the supplied helper in isolation

No app and no account data. Use a disposable directory. The model bundle is read in place, read-only.

```sh
R="$PWD/out/release/1.0.0-91/Aux.app/Contents/Resources/aux"
HELPER="$R/apps/daemon/Aux Daemon.app/Contents/Resources/memory-helper/aux-memory"
MODEL="$R/memory-distribution/models/2001e15f1ea3e79468db44b6ad772d05978b2787e1f414044cb0efb8c4bc78bc/6e23b637-b0d3-47c0-b9ed-d8edc42da9fc"
T=$(mktemp -d); mkdir -p "$T/memory/episodic"   # copy fixture .md files into $T/memory
env -i PATH=/usr/bin:/bin HOME="$T" ORT_DISABLE_TELEMETRY=1 "$HELPER" "$MODEL" ""
```

Run it from a small driver that keeps stdin open until every reply has arrived. Python, run with `-I`:

```python
import json, subprocess, sys
def run(helper, model, home, requests):
    p = subprocess.Popen([helper, model, ""], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE, env={"PATH": "/usr/bin:/bin", "HOME": home,
                         "ORT_DISABLE_TELEMETRY": "1"}, text=True, encoding="utf-8")
    replies = {}
    for i, (method, params) in enumerate(requests, 1):
        p.stdin.write(json.dumps({"id": i, "method": method, "params": params}) + "\n"); p.stdin.flush()
        while i not in replies:                       # one request at a time; ids may reorder otherwise
            line = p.stdout.readline()
            if not line: sys.exit(f"helper exited: {p.stderr.read()[:400]}")
            o = json.loads(line); replies[o["id"]] = o
    p.stdin.write(json.dumps({"id": len(requests) + 1, "method": "shutdown", "params": {}}) + "\n"); p.stdin.flush()
    p.stdout.readline(); p.stdin.close(); p.wait(timeout=5)
    return [replies[i] for i in range(1, len(requests) + 1)]
```

Pass `("embed", {"text": t})` for each corpus item, then `("sync", {"directory": f"{T}/memory"})` and the searches. Pack the `embed` results as little-endian f32 for the golden file.

Notes:

- `directory` must be absolute, and in this mode the helper takes it as given. In production the native host forces it.
- The model loads lazily: `status` reported `modelLoaded: false` before any embedding. Core ML may write its compiled-model cache under the user's caches, which is outside `$T`. [I]
- To run the rewrite under the same sandbox as production, run it inside `sandbox-exec` with the section 1.3 profile and parameters.

A throwaway fixture from this investigation, with the three files and both generations, is in the session scratchpad at `/private/tmp/claude-502/-Users-rcourson-Documents-Vibe-Aux/c4feeb3b-f180-49a2-baa3-4c9de2bd56bf/scratchpad/fixture.w8wM/`. It is disposable and not a checked-in fixture.

## 5. Open questions

1. **Tokenizer:** exact behavior. Is there pre-normalization (NFKC? space-to-▁ replacement?)? How are BOS/EOS placed? How do `lstrip` added tokens match? Is the truncation side fixed? Can be checked by black-box comparison through `embed`; the helper exposes no token ids.
2. **Graph and compute units:** the token-count threshold for choosing the 64 or 512 graph, and which `MLComputeUnits` the normal path and the "rebuild accelerator" use. This decides whether bitwise equality is reachable on other Mac models (M1 vs later; FP16/BF16/I8MM feature checks show up in strings).
3. **Chunker:** the full rules (maximum chunk size, how headings split, context-awareness windowing, the "Day overview" chunk, the code-fence rule). Only small single-chunk files were observed.
4. **Sparse index:** the scoring, the meaning and default of `alpha`, and the score normalization.
5. **Retention and legacy:** how many old generations are kept. Whether and how the helper reads a legacy `memory-index.json` (its name appears in strings next to `entries` and `formatVersion`).
6. **`index.mossvec` details:** the meaning of the u16 at offset 6 (element type?) and the SQ8 v2 variant. Whether `docIds` are always sorted.
7. **Native host:** `AuxMemoryHelperLaunchPolicy.json`, the model pins and `kMemorySourceSha` are compiled into the daemon's native addon. A rewritten helper needs a new launch record, a new `sourceSha256` constant and a re-signed identity. That's native host work, not helper work.
8. **`taskHome`:** the concrete path isn't resolved here. It comes from `captureStorageRoots()` in the native layer.
