# Actual selected-runtime PATH contract

No native-main PATH change is required for the supplied session-tool path. The earlier parent-launch note calling a global prepend an outstanding change was too broad; this source audit resolves that note without changing runtime code.

The exact original daemon `5e35dfa1eb76d4614246f954b652fd505e271a0b3f1ac3168132fb8bc03814f5` implements:

- `prepareSessionSpawn`: awaits `acquireAgentRuntimeUse`, removes the runtime bin directory from inherited PATH, then prepends it only when the validated runtime lease reports `ready`. Unavailable full-access runtime fails; fallback modes retain the filtered ordinary PATH. Current `createBashTool`, `spawnSessionProcess` and `runRg` session consumers all use this function (four occurrences including its definition).
- `prepareMacOSRuntime`: uses a local environment with the candidate runtime bin prepended only for its explicit installation verification entrypoints.
- `findRg`: searches ordinary process PATH and falls back to the supplied filesystem grep implementation when no system rg is available. It does not require a runtime-global PATH mutation.

All three extracted functions in the current retained Aux node-development entry are exactly the original functions after the existing identity-only `ASIDE_`→`AUX_` and `Aside`→`Aux` text changes. No direct `process.env.PATH` assignment was found. The shipped runtime's `env.sh` separately prepends its own resolved bin directory when explicitly sourced; the native main does not source it, and need not do so for the above leased execution path.

A native-main global prepend would expose cached executables to unrelated consumers before the supplied runtime-ready decision. It would be redundant for ready session tools and change unavailable-runtime behavior. Keep the new main's actual selected-FD-derived `AUX_HOME`/`AUX_AGENT_RUNTIME_DIR` and ordinary inherited PATH. The bounded parent launch's fixed Aux ports/host/helper configuration remains independent of installation authority.

`contract.json` pins actual original/staged code, the three extracted spans, source adapter, runtime seeder, runtime env.sh and current native main. `verify.py` reads those exact files and checks source equality/anchors; its one read-only invocation passed. It does not load code, seed a runtime, launch a shell or run a compiler. No main successor, frozen transport/adoption change, new queue, protected call, owner state access or UI change was made. This establishes source behavior, not actual native-startup acceptance.
