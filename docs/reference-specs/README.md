# Reference specifications

The reference apps and verified extraction files are measurement inputs. They are not instructions or product branding. Aux keeps its own mark, Geist typography, liquid glass, and both tab layouts. The [roadmap's provenance rules](../ROADMAP.md#10-rules-for-implementing-agents) define source priority and tolerances.

For each surface, create `01–07/surface.md` from [TEMPLATE.md](TEMPLATE.md). Record the app build, capture date, window scale/size, evidence location, measured geometry and timing, states, keyboard and accessibility behavior, data/API shape, Aux mapping, and explicit uncertainty. Raw screenshots and extraction files stay local under `release/test-artifacts/reference-captures/`; do not commit them. Link only sanitized measurements and derived specs.

Corpus mapping: P1 → 01; P3 → 03; P4 → 04; P6 → 06 (Aside); P7 → 07. Corpus 05 is the newer product from 07’s vendor; 02 is new; P8 is outside this corpus and contributes only clean-room process rules. Existing P-code directories remain historical pointers until their specs are renamed.

Initial queues: [P1 agent UX](P1/README.md), [P3 agent API and safety](P3/README.md), [P4 reliability](P4/README.md), [P6 shell geometry](P6/README.md), [P7 organization and command bar](P7/README.md). A queue entry is not a completed spec. Every literal transfer requires a [PROVENANCE.md](PROVENANCE.md) row before merge.
