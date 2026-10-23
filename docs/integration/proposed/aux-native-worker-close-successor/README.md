# Native Worker retirement preserves unknown ownership

This source successor corrects the actual helper-bound WorkerHost used by the frozen v4 daemon recipe. It changes no accepted app, UI, startup selection, provider authority, authenticated helper selection, PTY producer, signature policy or ciphertext. The old host/header, build graph and outputs remain immutable.

Two real aggregation defects are corrected: an untracked PDF observation previously overwrote an already observed wrong-process retirement, and pending retained utilities previously overwrote an untracked provider. All close observations now pass through one native monotonic combiner: wrong process, untracked, reentrant, pending, drained. A missing or invalid enum representation never means drained. Pending work can still become genuinely drained on a later valid observation; the combiner supplies no authority or process census.

Worker retirement now checks its actual creator process before that method touches locks or runtime APIs. Exceptions from image census/quarantine work close admission, leave the exact Worker and Owner retained, clear only the in-progress marker and preserve a sticky failure at least as strong as untracked. A retry cannot reinterpret interrupted retirement as completion, including if a stronger wrong-process result had already arrived before the exception. Completed Environment detachment cannot erase that failure's retained Worker. This does not claim every unrelated foreign-process cleanup callback is integrated.

Host close permanently shuts registrations under the existing admission mutex, records the existing worker count and copies one shared owner at a time under that mutex. RegisterCurrentWorker already holds that same mutex from admission through push_back; the vector cannot grow or erase after close. This removes the full allocating worker-vector snapshot from destructor/retirement. No host lock crosses native retirement, image callbacks or Owner release. An image-inspection exception reports unknown and does not skip closing the actual Workers. Image implementations still allocate; this is not a claim of globally allocation-free shutdown.

PTY direct-child and descendant unknown state remains unchanged and dominant. No failure, empty list, counter, lock or direct-child exit supplies whole-writer drain. Cold startup stays default-off and ordinary state2 refusal stays first.

## Integration

Use `source/AuxDevelopmentWorkerHost.cc` instead of `aux-native-pty-helper-host/source/AuxDevelopmentWorkerHost.cc` in a separately composed daemon build. Select the paired `source/AuxDevelopmentWorkerHost.h` everywhere that class is declared; its only API declaration change is noexcept on CloseAndDrain. The public class layout and mangled method identity are unchanged, but all TUs must agree on the declaration. `source/AuxNativePtyReservation.h` is byte-identical to the canonical helper-host header. `AuxWorkerDrain.h` is a private pure result adapter. No frozen recipe or shared header was overwritten, and this object must not be silently relabeled as the already-linked v4 object.

The integrator owns full source/policy/package generation and any later actual protected runtime acceptance. No new signing, provisioning, Keychain access, owner profile reads, process observation, module load or app activation is authorized or performed by this slice.

## Focused verification

`check.py` runs only through `scripts/native-build.py`, using the same exact Node26.5 header and SDK metadata identities as the current v4 build. It compiles the complete changed host and a small constexpr translation unit. That unit checks all25 result pairs and125 triples for precedence/commutativity/associativity, the actual formerly lossy sequences, invalid representations and the paired noexcept declaration. Actual compiler dependencies and source hashes must agree before and after; the six existing PTY native exports remain defined. No compiled artifact is executed or loaded.

The first own attempt was rejected because a review correction was saved during compilation; no receipt from it was accepted. The next actual two-TU compile passed, but its metadata gate refused the unlisted SDKSettings.json dependency. Both failed attempts remain recorded. The final receipt, when present, establishes changed-object/constexpr compilation only, not exception injection, actual Owner retirement, callback races, subtree closure or same-candidate runtime acceptance.

Reproduce with a fresh external output:

```sh
python3 scripts/native-build.py python3 docs/integration/proposed/aux-native-worker-close-successor/check.py \
  --node-source /Users/rcourson/Documents/Vibe/web/out/aux-node-static-26.5.0/node-v26.5.0 \
  --output /private/tmp/aux-worker-close-new-output
```

Actual final serialized session86636 ended0. Both full changed-host and constexpr translation units compiled; all84 actual non-system dependencies/source files matched their frozen hashes. Host object SHA256 `63a34fe76a6ecc9f3d6818243e371e9fb6bd2274cc89e22346b4c0bc92a81ffb`; retained output directory is `/private/tmp/aux-worker-close-object-20261023-accepted`. The six native PTY exports remain defined. No native binary, module, helper or application was run.
