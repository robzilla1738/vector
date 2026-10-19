# Actuation backend

Decision date: September 26, 2026. Status: **keep CDP input. Do not adopt actor `PerformActions`.**

The rule in roadmap S4 is to adopt the actor path only when pass@1 is at least the CDP path, p50 action latency is within 10% of CDP, and the change removes code. This spike misses all three. The probe was built, measured, and removed. It is not in `chromium/patches/series`.

## What was measured

AuxDev at Chromium 154.0.8037.58, after patch 0049, with a temporary `native.actorProbe` that created an `ActorKeyedService` task and called `PerformActions`. The probe is gone from the checkout. Raw rows: [actuation-samples-2026-09-26.json](../evidence/actuation-samples-2026-09-26.json). Five trials each, loopback fixture, confirmation set to none.

| Action | CDP | Actor |
| --- | --- | --- |
| Navigate | 5/5 completed. Wall times 202, 203, 205, 205, 207 ms. p50 205 ms. | 2/5 `ok`. Those two took 1212 ms and 1218 ms (actor clock 1024 ms and 1025 ms). The other three never started because the CDP reset navigation returned `internal`. |
| Click | 1/5 completed, 2111 ms. The next four returned `conflict` (the page state changed). | 0/5. Each returned `ok: false` in 93–105 ms, with an actor clock of 0 ms. |
| Type | 1/5 completed, 2730 ms. The next four returned `conflict`. | 0/5. `ok: false`, actor clock 0 ms. |
| Select | 1/5 completed, 1420 ms. The next four returned `conflict`. | 0/5. Each RPC hit the 30 s timeout. The probe has no AnnotatedPageContent node id, which select requires. |
| Login field | 1/5 completed, 1492 ms (`fill` of the name field). The next four returned `conflict`. | 0/5 type calls. `ok: false`. |
| OTP field | 1/5 completed, 1525 ms (`fill` of the code field). The next four returned `conflict`. | 0/5 type calls. `ok: false`. |

Navigate is the only action both paths completed. Actor p50 on those successes is 1218 ms against CDP 205 ms, about six times slower, outside the +10% bar.

Click, type, login, and OTP did not succeed on the actor path, so their short return times are failed calls, not faster actions.

## Observation

`node tests/benchmarks/observation.mjs` on the local fixtures, no model calls. Raw rows: [observer-fixture-2026-09-26.json](../evidence/observer-fixture-2026-09-26.json).

| Fixture | Aux compact | Accessibility HTML | AnnotatedPageContent |
| --- | --- | --- | --- |
| records | 2806 chars, ~702 tokens, 18 ms, 2/2 facts | 1646 chars, ~412 tokens, 2 ms, 2/2 facts | not supplied |
| detail | 850 chars, ~213 tokens, 12 ms, 2/2 facts | 676 chars, ~169 tokens, 1 ms, 0/2 facts | not supplied |
| form | 1562 chars, ~391 tokens, 14 ms, 2/2 facts | 977 chars, ~245 tokens, 1 ms, 1/2 facts | not supplied |

There is no 50-task pass@1 for AnnotatedPageContent. The offline bench records it as unavailable. That comparison was not invented.

## Why the actor path stays out

- Pass@1 against CDP was not measured, so it cannot clear the pass@1 bar.
- The one paired success, navigate, is slower than CDP by more than 10%.
- The other actor actions failed or timed out.
- Shipping the probe would add task setup beside the CDP executor. It would not remove that executor.

CDP remains the actuation path.
