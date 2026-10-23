# Three actual cold-launch compile fixes

Actual27353 stopped in its first cold-launch TU; Chrome-main hook was unrun. This new successor preserves the frozen source/failed receipt and changes exactly three expressions:

* Explicitly value-construct the empty `ScopedCFTypeRef<SecRequirementRef>` return, matching its actual explicit constructor.
* Pass a temporary owned `std::string(name)` to `Environment::GetVar`, whose actual `cstring_view` constructor accepts `std::string` but does not implicitly accept a decayed raw C pointer. The finite forwarded environment-name list and copied values are unchanged; the string outlives the synchronous call.
* Declare the CF dictionary result with `auto* const`, preserving its pointer/const semantics and satisfying the actual Chromium style checker.

No signing/image/authority predicate, policy, launch order, environment whitelist, cold-start limit, source guard or runtime behavior is loosened. The copied header is byte-identical. Actual scoped-ref/environment/cstring-view headers are pinned with the genuine compiler/target/PCM inputs.

The same two-TU recipe now selects only the corrected cold-launch source; it reuses the exact previous Chrome-main composed source and target flags. Default invocation with a fresh external `--output` prepares only. Root can add `--execute` under native-build serialization for cold-launch then the otherwise-unrun isolated enabled-hook object. No passed six-TU/daemon/Swift/link work is repeated. Production GN and default-off cold entry stay unchanged.

Source/API/config pins and Python syntax were checked. This lane queued no compiler and did not change frozen inputs, native checkout, UI, protected state or old evidence. The corrected source remains uncompiled until root consumes the successor.
