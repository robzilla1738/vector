# Stable install watcher profile binding

The same window's ExtensionInstalledWatcher and userdata identity remain intact. Cold preparation refuses pending installs and executing completion callbacks. Real callbacks are neither canceled nor given a synthetic result. Preparation detaches the old ExtensionRegistry observer; commit/abort attaches the actual current window profile. Weak posted completion tasks are invalidated only after the pending map is empty. Nested callback depth prevents reentrant switching, and a WeakPtr prevents accessing a watcher destroyed by its completion.

Source: Chromium 155 `chrome/browser/ui/extensions/extension_installed_watcher.cc`, constructors, WaitForInstall, OnExtensionLoaded/Unloaded and RunCallback. These exact source bodies retain Profile and observe its ExtensionRegistry; the BrowserWindowInterface constructor registers this same object in window userdata. The callback map owns actual install results. This patch adapts that real source lifetime to the supplied in-place switch; it does not add an install implementation.

Order: cold CanPrepare; Prepare before profile identity changes; RebindForAuxProfileSwitch(actual browser) after commit while empty, or after source rollback. No GN source registration. Header requires the existing public chrome/browser/buildflags dependency.

Verification: two baseline/output SHA256 pins, exact disposable patch replay PASS. No shared checkout writes, native builds, real installs, owner profiles or runtime acceptance. Pending installs are a conservative temporary refusal; this is not a full profile parity claim.
