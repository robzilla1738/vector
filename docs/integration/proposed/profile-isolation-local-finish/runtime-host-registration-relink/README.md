# Prepared unsigned descriptor-registration successor

Status: prepared only. No native compile, link, signing, product execution, module loading, policy activation or app replacement has been performed by this proposal. The integrator executes it only after the current browser build finishes.

The selected `e36e5c25…` WorkerHost declares seven properties but registers six. This copies that exact historical source into this proposal and applies only the approved count-checked replacement with `std::size(properties)`. The successor source SHA-256 is `49718219a54d300bbb77abca4b8a1fcf50d999ac6bb129550d2b4d5a34329562`. No historical source is modified.

## Concrete recipe

`plan.json` contains the complete real compiler and linker argument arrays and verified input digests. `prepare.py` derives these from the protected-startup daemon manifest/receipt and the selected awaited-writes host compile receipt/dependency file. It never invokes a compiler. It can be rerun after cherry-picking to generate paths belonging to the integrator's checkout; rerunning refuses existing execution output directories.

`run.py --execute` invokes the workspace `scripts/native-build.py` lock wrapper itself. Do not wrap it in a second native-build invocation. It waits for `/tmp/aux-build.lock`, rechecks all pins under the lock, compiles only the changed host object, and verifies that the actual new compiler dependency set equals the prior 92-path set with only the host source replaced. Every original include directory, compiler option and target remains unchanged. The original include search directories resolve the copied source's relative quoted includes to the same pinned headers.

Only after a real successful compile does the runner create `daemon-inputs.json` containing the measured new object digest. It substitutes that single object into the current protected-startup linker invocation, retaining all 48 Swift inputs, the other 11 native objects, Node/Brotli archives, framework arguments, exports, private definitions and the explicit `-no_adhoc_codesign` flag. The existing native link checker performs its actual paired-module import, private-symbol binding and unsigned Mach-O checks. The successor also requires the same module bytes/import set and private-definition set as the prior protected-startup link. No daemon is launched.

Fresh outputs are fixed and must not exist:

- `/private/tmp/aux-runtime-host-registration-object-20261023-a1` — object, dependency file, real compile log, generated daemon manifest and execution result.
- `/private/tmp/aux-runtime-host-registration-link-20261023-a1` — unsigned daemon, fresh Swift cache and actual link checker result.

Compiler temporary files and its module-cache path use fresh children of the object output. A failed attempt retains evidence and cannot silently overwrite either output. A new reviewed output name is needed for a retry.

## Receipt distinction

The exact selected `worker-host.o` digest is verified against both the old compile receipt and the protected daemon manifest. All 323 frozen native/link inputs are checked, along with the actual dependency-file closure and current compiler/checker bytes. This is not a claim that the entire historical compile receipt still matches every collateral file it once listed.

Specifically, the old compile receipt also listed `broker-runtime.js`, which is neither a compiler dependency in `worker-host.d` nor a frozen protected-daemon link operand. That historical JS digest was `e18616cb…`; its current path contains `743db67f…`. Both hashes and its excluded collateral status are recorded in `plan.json`. No stale JS acceptance is borrowed from that receipt. The root integrator must independently authenticate the current JS source/entry pair, as it already does for feature assembly.

The new source fixes registration only. The asynchronous cache-inspection helper is a separate successor and is not included here. Existing loader/authority boundaries, cold-start refusal, unresolved writer-isolation/recovery/publication gates and release separation remain unchanged. Native compile/link success alone does not prove runtime behavior or authorize startup.

## Lean verification

Preparation checks exact input hashes, one replacement, actual dependency provenance, 48 unchanged Swift sources and 11 unchanged other native objects. Both Python scripts are parsed without executing the build runner. The source delta is the single registration-count anchor. `runResult` remains null until actual execution creates a separate result receipt.
