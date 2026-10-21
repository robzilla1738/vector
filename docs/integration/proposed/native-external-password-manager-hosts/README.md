# External password-manager host discovery and browser completion audit

Source-only audit against applied composition560. No owner profiles, host manifests, credentials, Keychain, extension installation or native hosts were read/run. No shared native changes or builds.

## Concrete correction

Actual AuxAside build args enable_aux_browser=true and enable_aux_shell=false. Both macOS Chrome-manifest fallback blocks in launch_context_posix.cc are gated by the retired shell flag, making the existing fallback unreachable. The two-line patch moves them to the active browser flag. Aux-local then system Chromium registration retains priority; Chrome user/system host registration is consulted only if both lack the requested host. User-level fallback still respects allow_user_level_hosts.

This reuses the existing platform integration, not recovered original Aside code. It does not copy manifests into Aux, register a host, launch one during the audit, or impersonate Chrome. LaunchContext still validates name, parsed manifest, exact allowed extension origin, absolute executable path and native-initiation support. Vendor desktop trust/signature checks remain authoritative. Discovery alone does not establish 1Password compatibility.

Apply through the root composer's pinned proposal mechanism after560. Two guard replacements, no header/GN dependencies. Compile affected messaging object in the normal serialized build. Follow with a disposable synthetic native-host roundtrip before any separately authorized real manager integration.

## Completion ledger

| Boundary | Current source/evidence | Remaining acceptance |
|---|---|---|
| Built-in password manager exclusion | ChromePasswordManagerClient::IsFillingEnabled returns false for ENABLE_AUX_BROWSER; current STATUS records Vault/importer excluded and supplied startup decoupled | Verify fresh browser shows no native save/fill prompt on a local dummy form; extension content script can still fill it |
| Third-party extension install | Real extensions management command remains enabled in browser_command_controller; no installation performed in this audit | Actual store installation/update/disable/remove in disposable profile; store eligibility and vendor packaging are not proven by Chromium build |
| Native messaging | Concrete disabled fallback fixed by this proposal; launch_context.cc preserves extension origin and host validation | Synthetic allowed/denied-origin roundtrip; actual manager companion pairing only with owner-authorized disposable data. Desktop app may independently reject Aux identity |
| Extension autofill | Disabling Chromium's own password client does not remove extension content scripts/native messaging | Install chosen extension and fill local dummy login, including reload/navigation, without owner vault access; no support claim yet |
| Downloads | Real IDC_SHOW_DOWNLOADS dispatch and unconditional command enablement retained; no relevant Aux interception found in download manager delegate | Small local download, progress/completion, open-in-folder and cancel with disposable output; verify command access despite custom toolbar |
| Tabs and navigation | Current STATUS records actual navigation, New Tab and collapse/reveal acceptance; retained hover/pin locks are source-backed | Back/forward/reload, close/reopen, duplicate, cross-window move and keyboard focus on current final package |
| Bookmarks/history | Genuine bookmark/history command dispatch retained; session_service stores Aux bookmark representation extra data | Add/edit/remove disposable bookmark, open history after dummy navigation, validate sidebar updates and relaunch persistence |
| Session restore | Chromium SessionService retained with Aux bookmark extra-data hook; earlier crash prompt fixes do not prove restore acceptance | Clean quit/relaunch with two disposable tabs and pinned/bookmark representation; separate crash restore if needed |

The highest-value source fix is the inactive native-host fallback. Other rows are explicit live-verification gaps, not inferred broken implementations; adding unobserved fixes would risk the preserved UI and browser behavior.
