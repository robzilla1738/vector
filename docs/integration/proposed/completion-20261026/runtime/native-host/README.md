# Finite ordinary native-host adapter

This is a paired source successor to A38, not an executed candidate or a 1Password compatibility claim. Accepted A38, its signatures, owner state and UI resources were not changed. No native object/full build, app/helper launch, Keychain operation, OS grant or signing occurred in this lane.

## User outcome and existing boundaries

Regular native extension connections now have an actual Profile owner and a separate finite lifecycle, without enabling the disabled ES descendant bridge or general exec/PTY/addons. The native UI captures Profile ID/account, binding epoch and restore epoch, plus an authenticated immutable registry receipt for account/incarnation/profile/record identity before IO dispatch. Synchronous notifications from the existing native epoch object invalidate the owner on binding changes, restore start or destruction; they cancel its channels. Background prepare and publish compare the exact frozen registry identity. Outgoing/incoming native-host messages and spawn/resume check the retained owner's validity.

Each physical preparation gets its own native UUID intent; the TaskLayout journal and strict startup reader bind that UUID. Two identical concurrent extension connections therefore cannot consume the same cached prepared lease. Retries of one request keep its exact original body/nonce/sequence and use the existing authenticated completion cache.

The producer opens and hashes one canonical executable Mach-O image, denies scripts/interpreter chains and group/world-writable images, retains its descriptor/identity, and revalidates it before launch/resume. It preserves native messaging argv/framing, uses only three explicit stdio mappings, `/dev/null` diagnostics and a small non-secret environment whitelist. `posix_spawn` starts the fixed system `sandbox-exec` suspended. Durable native preparation precedes spawn; the daemon independently observes the actual stopped direct child of its authenticated browser parent and publishes PID/birth before `SIGCONT`. The inherited policy forbids fork and other image execution, denies access to Aux Control/Task/browser/cache roots and protects root ancestors from unlink/rename. The retained original wait/reaper and actual stream-close observations determine terminal publication; receiver destruction, direct exit alone, timeout or a claimed cleanup flag never does.

The new generic `FileStream::SetCloseObserver` fires only after `Context::CloseFileImpl` closes the actual descriptor, including orphaned async cleanup. Cancelled/unpublished launches close raw pipes before their original reaper. Existing callback and process ownership stay intact. All affected background/cleanup tasks block ThreadPool shutdown. Before the existing ordinary daemon shutdown, the browser closes native-host admission and pumps a bounded real-settlement observation. A false result is logged as unresolved; it must not be accepted as a clean Quit.

A separate `aux.native-host-lifetime.v1` journal uses the existing native TaskLayout and durable-file idiom. Memory records/formats are preserved. Startup checks both journals before admission and repeats the existing paired preflight after the installer lock. Interrupted preparation/unknown temp files remain refused; nothing is reset or auto-deleted. Exact original terminal records are retired only after physical settlement.

## Account changes with persistent connections

The registry guard compares only each captured account/binding identity; unrelated account/profile creation, display names and token-only session refresh do not automatically require stopping a persistent host. An actual identity/incarnation/binding change requests cancellation of the affected lease IDs through the existing authenticated daemon-to-browser parent peer. The ACK only means that stop was requested. A server-side `stopRequested` fence also prevents a prepared child from racing the notice into execution.

The original registry callback refuses before its file write and releases its existing lock. Native channel closure, original reap and journal terminal then settle independently. This avoids waiting for terminal publication while holding the account lock. The existing publication-busy response remains a truthful transient retry; UI/account behavior still needs the packaged journey. A retry can replace an earlier unsubmitted target only after the owners affected by that target have genuinely settled, under the same serialized registry writer. The guard is not removed, and an unavailable native stop path stays a failure.

## Integration

`changes.json` pins 33 final input/output files. For each existing target, require its recorded input hash before copying the final source; never overwrite intervening native changes. Reproduce the source and patch with:

```sh
python3 prepare.py
python3 producer.py
python3 binding.py
python3 drain.py
```

The six original ownership files are fully composed here. Apply this final successor to the original recorded native preimages, rather than layering its patch blindly over the initial ownership patch. Root owns projection, GN/registration, shared startup joins, the full native build and package. `native-host.patch` contains the complete final differences. The new messaging `.h/.cc` are added only to the Mac source list. The epoch-observer changes remain disjoint from root's separate CLI restore/start/close guards; compose those root changes in memory after verifying these inputs.

`recipe.py` prepares `daemon-recipe.json`; it does not build by default. It inherits the actual corrected A67 main/Node target flags and current A72 final link. Replace seven existing Swift paths and add the new journal (51 Swift sources total). Recompile only main, server peer transport and parent C bridge. Retain the A72 WorkerHost, other 12 native `.o` files, Node/runtime objects and archives with the recorded hashes. There is no reason to rebuild the memory helper or change its approved bytes. The recipe's fresh output directory is `/private/tmp/aux-native-host-daemon-build-20261026-a1`; root must execute under `scripts/native-build.py` and must not sign or launch automatically.

## Focused evidence and outstanding acceptance

- Paired 51-source Swift typecheck passes using the actual daemon cohort; existing system deprecation warnings remain.
- Twelve actual browser/messaging/stream/profile/transport translation units pass focused Clang syntax checks with existing Chromium flags/plugins. Only affected units were repeated after repairs. Main, server transport and parent bridge separately pass with the actual daemon recipes, retaining corrected Node layout flags.
- Seven data-only cases run the actual strict native-host journal reader: valid record, unresolved prepared intent, wrong binding, malformed image hash, unknown field, symlink and partial temporary filename. Synthetic bytes/modes remain unchanged. The kernel process observer was neither replaced nor executed, and no helper launched.
- Desktop worker's bounded review found and then confirmed fixes for mutable binding capture and identical-prepare deduplication. Review is not runtime acceptance.

The integrator still needs a real disposable dummy-host round trip/cancel/clean Quit/reopen, one changed helper crash boundary, and the extension/autofill/vendor journey on the coherent package. Validate concurrent same-host connections and an account-changing operation through that journey; do not count this source evidence as success. Retained unsigned source does not grant execution/signing authority. Unsupported interpreter/forking hosts and off-the-record profiles must be reported honestly. General exec/PTY/Computer Use/arbitrary addons remain separate open requirements; [CAPABILITIES.md](CAPABILITIES.md) records exact available components and smallest remaining work.
