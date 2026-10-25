# Disposable extension compatibility check

Actual native A25 checks pass for a storage-only unpacked extension in the approved Final Work and Final Personal profiles: independent installation, popup execution and distinct persisted chrome.storage.local values. No host permissions, content script, private data or network access was involved. The fixture remains only in disposable profiles while checks continue. The unrelated externally supplied PrinterLogic extension was not changed.

This does not accept Chrome Web Store delivery, password autofill or native messaging. The ordinary native-messaging lifetime producer is still disconnected and must be implemented and actually checked.

For 1Password desktop integration, [the current official instructions](https://support.1password.com/additional-browsers/) require installing its real extension and explicitly adding the trusted, code-signed browser in 1Password for Mac. Adding a browser gives access to unlocked 1Password information. That separate trust action is not performed by these fixtures and must be reviewed with the actual final candidate. No 1Password vault/owner credential was read here.
