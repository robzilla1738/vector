# Aux behavior specifications

The rebuild uses a spec team and a separate build team. Spec agents inspect reference artifacts and express behavior in original words; fresh build agents implement from these documents, screenshots and public documentation only. No reference code, UI prose, fonts or assets ship.

Each document identifies its status (`draft` or `ready`), behavior, inputs/outputs, failures, state transitions, measurement evidence, and unresolved questions. A ready section must be independently implementable. Put all reference-source citations in `provenance.md`, using document/section identifiers here. Screenshots and reference hashes are gitignored under `out/reference/`.

Implementation commits cite a spec section. Unknown behavior stays explicitly unknown rather than being invented. Local cloud stubs are hidden in the UI and return a clear unsupported response when called.

## Lanes

- SP1: daemon, agent, tools, storage, bridge, CLI and skills.
- SP2: extension surfaces, design tokens, typography, original copy and vault UI.
- SP3: native APIs, authentication, browser lifecycle and native surfaces.

The integrator records spec readiness and implementation evidence in `docs/STATUS.md`.
