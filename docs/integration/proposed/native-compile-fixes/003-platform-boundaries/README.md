# Applied-source platform compile fixes

Incremental proposal against the exact currently applied Chromium source. No shared source writes or builds were performed. Four files and nine exact-count anchors are pinned in manifest.json; fix.patch replayed successfully in a disposable directory and all output hashes match. Parent owns applying/composing and focused compilation.

Actual diagnostics from root out/native-integration/provided-integration-build.log:

- installation_auth.cc:153 rejects unsafe payload->data()+sent arithmetic. A base::span over the actual payload and checked subspan(sent) supplies the same remaining bytes/length to send. Timeout, partial-write accounting, retry/error, shutdown and private carrier protocol remain unchanged. Adds the actual base/containers/span.h dependency include; no unsafe-buffer exemption.
- profile_security_client.cc:13 includes nonexistent net/base/escape.h. Current Chromium declares EscapeQueryParamValue(std::string_view,bool) in namespace base in base/strings/escape.h. Uses that existing implementation with the same JSON and use_plus=true query encoding.
- management_api_delegate.h:78 triggers the Chromium rule forbidding nonempty inline virtual bodies. Keeps the same virtual signature and unsupported-platform error/false return, moving that exact default behavior into existing management_api.cc with an explicit delegate header include. The supported Chrome override remains unchanged; no new source/GN registration is necessary.

The separate one-anchor AuxDaemonSessionToken→AsideDaemonSessionToken correction is required by the owner's preserved wire contract, and was explicitly requested by parent after inspection. It is not a compiler-driven protocol change: the current wrong prefix rejects the real supplied daemon token before the actual Vault status request. The patch preserves the real account/profile binding checks, loopback request, response revalidation and original token wire; it creates no synthetic Vault state.

Native compile/link/runtime acceptance remains pending. The completed root build's other warnings/errors, including task-feed shadowing, are outside this slice.
