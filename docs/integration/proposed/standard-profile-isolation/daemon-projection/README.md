# Static daemon projection successor v1

This prepares a new source projection for standard browser profile isolation. It does not change the current app, activate runtime authority, link native code, sign anything, or execute product JavaScript. The integrator runs it after reviewing and integrating the native counterparts.

## Input and output contract

`immutable-inputs.json` pins 44 exact inputs: the actual research a2 ordinary/dormant pair and receipts, the protected predecessor, the reviewed composer and its three adapters and transitive helpers, both publisher helper successors and their predecessors, and the original entry projector and its dependencies. The source binary is read only as the original static SEA input. The freeze additionally pins these producer files, this README, and the actual Node executable/version. Changed inputs refuse; the producer takes no caller-selected transform.

The producer calls `composeAuxDaemonPair` in memory, then independently replays the actual a2 chain and all new counted changes. It retains the original three stages and 32 anchors, appending background-writers (36), daemon-shutdown (35), and runtime-coordination (15): 86 new anchors and 118 total per leaf. The ordinary and dormant leaves are composed independently. Intermediate bytes, every stage hash, and complete anchor replay must agree with the reviewed composer.

The publisher runtime seed and bootstrap are copied only after exact baseline/output hash and counted-edit verification. The original `profile-isolation-final/integration/project-entry.mjs` then independently projects the new ordinary source. Its result must exactly equal the independently composed dormant entry; its loader must remain byte-identical. Only static projection and Node syntax checks run. No generated product module is imported or executed.

Successful final source hashes are:

- Ordinary: `00607ee3555eb8c8c8f6d7641d93ac009ca9a3b4e2fc7444dfe898109d9d863c`
- Dormant entry: `fe85ca92a82b957f61727729ba61ca732d061df8534f3f64a3afd2a2af5c0400`
- Unchanged loader: `ec7ea0405f415d84e4afc695405eec07378d8c7233b926ffd9dd7db2edfed663`

## Integrator invocation

After cherry-picking this proposal into the root workspace, use unused absolute paths. Both operations refuse existing output; neither deletes, repairs, nor overwrites anything.

```sh
node docs/integration/proposed/standard-profile-isolation/daemon-projection/freeze.mjs /Users/rcourson/Documents/Vibe/web /private/tmp/aux-standard-daemon-projection-a1-inputs.json /private/tmp/aux-standard-daemon-projection-a1
node docs/integration/proposed/standard-profile-isolation/daemon-projection/produce.mjs /private/tmp/aux-standard-daemon-projection-a1-inputs.json /private/tmp/aux-standard-daemon-projection-a1
```

The producer writes the ordinary source, independent dormant source, intermediate source leaves, copied publisher helpers, unchanged historical upstream receipts, complete new composition/source receipts, and the original projector's results in the new directory. `projection-evidence.json` is written only after actual independent projection equality and a final frozen-input check. A failure retains the isolated partial output for inspection; choose a fresh directory on retry. The old a2 projection is never modified.

The new receipt distinguishes historical upstream adapter inputs from the new frozen producer inputs. Native pairing, packaging, activation, genuine writer-drain acceptance and runtime testing remain separate. Cold refusal and original runtime authority flags remain unchanged; source projection success cannot clear unknown writers or descendants.

## Evidence at delivery

`node --check freeze.mjs` and `node --check produce.mjs` passed. The prior `daemon-composition/review.json` contains the actual paired 36/35/15 replay and syntax evidence. This new freeze and full projector have **not** been run by this worker; the integrator owns their execution and resulting evidence. No native build, app lifecycle, provider request, or signing was performed.
