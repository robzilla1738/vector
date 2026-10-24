# Browser descendant uncertainty — correctness successor

Source proposal only. Six selected source files, fourteen count-one adaptations. No native build, process execution, signing, permissions, package mutation or runtime acceptance was performed.

## Corrected claim

The native-messaging and content registries currently release their records after the original child is actually reaped. That is valid evidence for the direct child, but does not prove its descendants exited or lost all Aux write authority. Their internal `all_writer_coverage=false` was discarded by public snapshot conversion; the report could consequently emit settled status after phase 6 with no direct entries left.

Each successful launch now creates a process-lifetime unobserved-cohort tombstone. Direct reap continues to release the direct record but cannot erase the tombstone. Both public snapshot conversions preserve it; the shared readiness evaluator returns unknown whenever it is nonzero. Failed-before-child launches do not create a cohort. Counter overflow is unknown. Thus the authenticated report cannot certify these unobserved writers. This intentionally prevents clean-restart certification after an unproved successful launch; it is a correctness gate, not completed descendant supervision.

## Smallest completion paths: bounded source audit

### Native messaging

`chrome/browser/aux/AuxSelectedStateHome.cc:315–386` validates the selected browser roots and builds a fixed `/usr/bin/sandbox-exec` command. Its policy allows default, denies writes/linking beneath two browser data/cache paths, and denies unlinking their ancestors. This does not deny fork, enumerate every Aux root, or establish closure of writable aliases/inherited descriptors. `launch_context_posix.cc:100–120` explicitly remaps stdin/stdout pipes. `base/process/launch_mac.cc:270–306` uses close-on-exec-default but inherits stderr unless replaced. Root descriptors themselves require CLOEXEC (`AuxBrowserPrivateRoots.cc:27–68`), a useful narrow property, not proof about every writable descriptor.

The lifetime registry receives only PID/creation/direct-reap evidence, with no authenticated acknowledgment of sandbox application or authority closure. Closing host IPC alone is therefore insufficient. A completion mechanism needs a fixed trusted launch boundary with actual applied-policy acknowledgment, a complete root/alias/FD authority inventory and irrevocable IPC revocation, or genuine descendant custody for this browser-owned cohort. The daemon-only observer does not cover these sibling cohorts. No broader architecture is implemented here.

### Content children

`child_process_launcher_helper_mac.cc:120–179` chooses the actual sandbox type and compiles/serializes the common policy plus its selected suffix. `sandbox/policy/mac/common.sb:31–34` denies default, and the selected policy files contain no `process-fork` allow. Its `process-exec` allow at line 125 is restricted to the executable path. Apple XNU `bsd/kern/kern_fork.c` applies `mac_proc_check_fork` before both `PROC_CREATE_SPAWN` and `PROC_CREATE_FORK`: https://github.com/apple-oss-distributions/xnu/blob/main/bsd/kern/kern_fork.c . This supports a bounded no-descendant policy path; it is not runtime proof of installed policy.

The helper's actual startup applies the policy before framework execution (`chrome/app/chrome_exe_main_mac.cc:165–176`, `sandbox/mac/seatbelt_exec.cc:174–180`, `sandbox_serializer.cc:194–207`). However, the parent binds only PID/creation; `AfterLaunchOnLauncherThread:211–216` ignores `SendPolicy`'s result and records no child application acknowledgment. `--no-sandbox`/unsandboxed types bypass the policy. A narrow successor must bind verified fixed helper identity, exact sandbox type/policy and applied-policy acknowledgment to the original native launch, reject unsandboxed/unverified/overridden executables, then distinguish covered no-fork children from unknown ones. Delegated service writes (including Metal cache allowances in common.sb) require their own real completion evidence if they reach Aux roots. This proposal does not manufacture such coverage.

## Verification

Ordered count-checked replay and unified-patch replay both match all six output hashes. `git apply --check --whitespace=error` passes against retained baselines. Native compilation and actual shutdown/restart acceptance remain unrun. Existing root/source receipts remain historical and unchanged.
