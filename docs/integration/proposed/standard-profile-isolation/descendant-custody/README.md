**Historical late-attachment analysis.** The fresh native entry source successor is described in [FRESH-ENTRY-PROPOSAL.md](FRESH-ENTRY-PROPOSAL.md). The missing initial-enumeration API is not being invented.

# Native descendant custody: initialization contract unresolved

This is a bounded source feasibility result, not an implemented observer or an acceptance receipt. No Endpoint Security client, product process, compiler, signing operation, entitlement request or OS grant was invoked. The current selected Exec/Pty unknown flags and runtime leases must remain conservative.

## Supported API and missing guarantee

The installed SDK `EndpointSecurity/ESClient.h:797–827` declares `es_new_descendants_client` on macOS 27.0. Its event scope includes the caller and the recursive descendant subtree, including already-existing descendants; it requires the restricted `com.apple.developer.endpoint-security.client` entitlement but not root or TCC approval.

Coverage is not initial enumeration. The header describes event delivery when a descendant performs an operation. It supplies no initial process inventory, synthetic fork replay, existing-population completion marker, or atomic inventory-and-subscribe operation. A dormant existing descendant can therefore remain absent from a newly created user-space map. An empty map cannot establish an empty cohort.

`ESClient.h:700–734` documents `es_sync_client` as a queue marker, with synchronous enqueue before the originating syscall returns. It drains messages already ahead of the marker; it does not create an initial inventory. Its callback also runs upon client destruction and for a null client, so callback arrival alone is not successful observation. `ESMessage.h:2713–2737` documents dropped-message sequence gaps. No observation failure, sequence gap, overflow or client loss may clear uncertainty.

**Implementation is stopped at this unsupported initial-completeness contract.** There is no proposed settlement callback and no host change to clear `exec_descendants_unknown`, `pty_descendants_unknown`, or a RuntimeScope cohort count.

## Concrete next integration decision

A fresh dedicated native task-supervisor process could avoid the existing-population problem only if its actual entry path proves that no descendant can be created before successful client creation, verified subscriptions and the native admission barrier. That requires a concrete process/launch integration, not a boolean supplied to the current WorkerHost attach path. Every later spawn would need a retained native reservation, stable audit-token identity association, continuous fork/exec/exit coverage, loss detection and genuine physical settlement before releasing its particular RuntimeScope cohort. This is an architectural option requiring review, not an implemented or proven successor.

Alternatively, Apple would need to document an authoritative initial-enumeration/completion facility. Ordinary PID enumeration followed by subscription, or subscription followed by enumeration, is not substituted here.

## Why a process group does not replace descendant observation

Apple's public XNU `bsd/kern/kern_prot.c:461–608` implements `setsid`/`setpgid` without a MAC authorization call. Both reach `enterpgrp`, whose implementation in `bsd/kern/kern_proc.c:2688–2764` likewise performs group/session changes without that policy hook. `bsd/kern/proc_info.c:2979–2987,3041–3055` instead routes `PROC_INFO_CALL_SETCONTROL` through `mac_proc_check_proc_info`. These are distinct paths: an SBPL `process-info-setcontrol` restriction is not evidence that arbitrary child code cannot escape a retained process group.

The installed `sys/event.h:253–255` does not deliver the fork child PID through the kevent. Lines 357–362 mark `NOTE_TRACK`/`NOTE_CHILD` unsupported. A process-group anchor, kqueue hint plus census, PID disappearance or direct-child exit cannot settle arbitrary recursive descendants.

## Separate later prerequisite review

- Confirm macOS 27 deployment availability for `es_new_descendants_client`; the current unsigned candidate must not assume it.
- Request Apple's restricted Endpoint Security entitlement and arrange its authorized provisioning/signing in a separate owner-approved phase. Ordinary ad hoc signing does not grant this capability.
- If supporting older macOS through conventional `es_new_client`, separately review its root and Full Disk Access requirements. Those additional grants are not requirements of the macOS 27 descendant-only API.
- Review the actual supervisor initialization topology and cohort-to-native-reservation ownership before implementation. Entitlement availability alone does not resolve completeness or settlement semantics.

No permission or signing request is being made by this document.

## Primary sources

- [Apple descendant client](https://developer.apple.com/documentation/endpointsecurity/es_new_descendants_client(_:_:))
- [Apple restricted entitlement](https://developer.apple.com/documentation/BundleResources/Entitlements/com.apple.developer.endpoint-security.client)
- [Apple conventional client](https://developer.apple.com/documentation/endpointsecurity/es_new_client(_:_:))
- [XNU group/session syscall implementation](https://raw.githubusercontent.com/apple-oss-distributions/xnu/main/bsd/kern/kern_prot.c)
- [XNU group transition implementation](https://raw.githubusercontent.com/apple-oss-distributions/xnu/main/bsd/kern/kern_proc.c)
- [XNU process-info authorization](https://raw.githubusercontent.com/apple-oss-distributions/xnu/main/bsd/kern/proc_info.c)

`evidence.json` pins the actual SDK headers and selected host source read. Remote main-branch source links describe the inspected public implementation, not an assertion that every installed kernel binary has identical bytes.
