# External password-manager vendor readiness

Reviewed 2026-10-21. Aux has no built-in password manager. Existing native-messaging/content-fill allow/deny fixtures passed and were removed; they are not proof of vendor companion pairing.

Static public app metadata identifies installed 1Password8.12.40. No account, vault, credential or private configuration was read and no trust setting was changed.

1Password's current [additional browser instructions](https://support.1password.com/additional-browsers/) require the Mac user to unlock1Password, choose Settings → Browser → Add Browser, and select an Apple-code-signed browser in Applications. Its [connection security documentation](https://support.1password.com/1password-browser-connection-security/) explains that the browser signature authenticates the desktop connection. Adding trust allows access to unlocked vault information; it needs the owner's specific approval and a bounded dummy-login check, not a generic native-message ping.

The current local Aux browser is outside Applications and has an ad hoc outer/native seal with no Apple team identity. Therefore it does not meet those documented prerequisites as packaged. This is an inference from public requirements and verified package state, not an observed1Password rejection. The eight retained signed supplied helpers do not give the outer browser an Apple identity. No signing/trust bypass, owner-vault probe or vendor approval was performed. Current development instructions prohibit new Apple signing; that boundary remains explicit.

Acceptance remains: prepare a reviewed final browser identity/install path if owner scope allows it, obtain specific owner trust for that exact artifact, then verify the official extension's companion connection and one dummy login. Use disposable browser state and owner-selected test data only. Preserve the completed generic fixture evidence; do not repeat it to claim vendor compatibility. Other vendors can have different requirements and need their own real extension check.
