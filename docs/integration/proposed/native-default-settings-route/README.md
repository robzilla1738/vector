# Default Settings and password-manager commands

In Aux regular windows, the default chrome::ShowSettings entrypoint (including Cmd+, and app-menu Settings) now opens the supplied Agent settings route through the existing authenticated account resolver. Explicit Chromium settings subpage functions remain unchanged for advanced/browser settings; non-Aux and private windows retain their existing behavior.

Aux's View Passwords command and ShowPasswordManager / ShowPasswordManagerSettings entrypoints open installed extensions, where users manage their chosen password-manager extension. No credentials are read, migrated or deleted. This does not claim to remove Chromium's manually navigable internal password-manager WebUI or all historical menu labels.

Based on v506 native source. Only two files; no native mutation or build by this lane. Integrator owns compilation and Cmd+, / menu observation.
