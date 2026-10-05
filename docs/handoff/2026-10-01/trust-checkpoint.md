# L10 resumable pause checkpoint

Paused at the user-requested checkpoint. No new implementation or verification jobs will start. No source/native process owned by this lane remains running.

## Latest unadopted correction

`overnight-dispatch-boundary.patch` SHA256 **6994586537b64a5c8ee086438b1b2819868b8b8f8f3bd2c24935a116406abad2**, five exact current root-complete leaves with baseline/result hashes in `OVERNIGHT-DISPATCH-BASELINES.json`. Detailed rationale in `OVERNIGHT-DISPATCH-REVIEW.md`. Isolated source mirror: `/tmp/aux-browser-runtime-l10/release/overnight-dispatch-review`.

Actual effect-time overnight authorization was absent in native permission ALLOW and ProgramExecutor per-step dispatch. Mandatory native `assertDispatch` is wired to existing real checkNightShiftDispatch and runs after Gate permits ALLOW, then exact batch/source/lease fences repeat. Pending replies deliberately bypass that effect check: parked status is not dispatch authority, but a genuine unanswered approval must remain pending for person-present Apply. Actual program checks before each authorization and after awaited authorization, followed by final mention/task/source fences. No foreground grant or policy floor is weakened.

Source evidence: initial cold and subsequent incremental `npx tsc -b` PASS; scoped oxlint PASS. Baseline reproduction removing only native post-Gate assertion returned ALLOW after window close when DENY was expected. Corrected final focused suites **3 files / 53 tests PASS**: native-permission-producer 27, autonomy-services 18, safety-dispatch 8. New tests use real protected queue/reserved run/controller/Gate/ApprovalStore and actual PageService program; open-window standing grant works, closed-window denies before scheduler tick, unanswered batch stays pending across parked→needs_review, second program step is prevented after first crosses window boundary. Initial source/dist singleton mismatch in new test was corrected by consistently importing actual source PageService; final test assertions passed unchanged. No full suite, native build, launch or effect tests were run by this lane.

## Previously saved review packets

- Native capturing Bind correction commit `3d077cf5`, patch SHA `1d516e95c36b3423834fad4b07f1732d9282bd5a89270b57cfe6860a86601193`; parent adopted, latest parent reports e496 production Broker/manager compile PASS, actual 31-case execution still pending solebuilder.
- Production native0202 reentrancy/per-effect packet `75640179`, parent adopted; preserve all frozen leaves/31 assertions. Root owns native0200/0202 and qualification.
- Journey fixture grant/disclosure correction `cee44387` parent adopted. Positive mentioned-page proof `1bb2b20d` and direct owner-denial proof `b294e9a4` saved for parent review; adoption not independently confirmed here. No trust loopback journey qualification claimed.
- Permission retry runtime tests `0a3b2a09`: parent reviewing/adopting. Real controller 26 focused tests passed before new case.
- Code-mode owner-manifest regression `8c2cdece`, SHA `baa937a3c06bb27c7fe38cd06bf3930a35534e2380cae34ecf2d1f5e3be61053`; real QuickJS 7 tests PASS. Owner paths are absent from manifest and rejected before host dispatch; no production bypass was established and no speculative safety guard rewrite was made. Parent reviewing.

## Resume

Parent should independently review/apply the new five-file dispatch request against recorded baselines, then compose/gate its canonical source. Review authoritative effect-time clock/power semantics and native permission lifecycle; source check is a runtime dispatch fence, not native execution proof. Continue full F16/F18 genuine loopback journeys and pending native 31 effect cases via solebuilder. Preserve current Aux branding and all real scope/outsider/drift/revoke assertions. Do not treat this checkpoint as feature completion or READY-TO-MERGE.
