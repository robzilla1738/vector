# Native lifecycle build integration

Root-owned integration of the [production supervisor fixtures](../native-direct-daemon-lifecycle-fixture/README.md). The initial four-file proposal pins the supervisor source/header, new test source and GN target. Two separately pinned follow-ups are composed before application:

- `../aux-native-lifecycle-task-policy/`: complete weak URL-loader factory type, explicit sync-wait traits for drain and installation-helper tasks, scoped fixture cleanup allowance, and the Mojo test runner required by the real SimpleURLLoader path.
- `../aux-native-lifecycle-exit-status/`: POSIX Process can return success with synthetic exit zero for an absent/reaped child or non-child disappearance. The supervisor conservatively reports zero as unknown (`nullopt`), while retaining nonzero observed status. A fifth fixture explicitly reaps its own synthetic child before quiesce and verifies no invented exit zero.

The final composition is `out/native-reuse-composition-aux-lifecycle-status`, extending the applied native-fence/span baseline. All four unique changed source paths are pinned; the composition records 769 text sources and 23 existing assets. Application succeeded under `/tmp/aux-build.lock` with all old bytes retained at `out/native-reuse-composition-aux-lifecycle-status/native-before-apply-9b9yrjuz/`. No UI/view/style or asset source changes are included.

The GN test target is `//chrome/browser/aux:daemon_lifecycle_tests`, linking the ordinary production `:platform` objects, Mojo test runner and normal test support. It does not compile an included copy of the implementation or expose a public runtime test bypass. The five fixtures own only synthetic `/bin/sh` and `/bin/sleep` children. Their private graceful-shutdown request uses an in-memory TestURLLoaderFactory; no actual daemon socket, owner process, profile, Keychain or provider is contacted.

Compilation/execution and the subsequent native browser receipt are pending. Source application and the presence of a fixture do not establish lifecycle acceptance. Even a passing test target proves only owned-direct-daemon behavior, never a complete renderer/profile/CLI/descendant writer fence or migration authorization.

Build through the serialized wrapper, then run `DaemonSupervisorLifecycleTest.*` once in a fresh private temporary directory. Full browser/auth-probe compilation must precede packaging a successor with these changed native bytes. The accepted app remains untouched; no signing, provisioning, release or production activation is included.
