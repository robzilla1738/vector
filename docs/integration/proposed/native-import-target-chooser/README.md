# Supplied native import target chooser

Two new Mac source files, no shared native/GN/handler changes. Source authority is original `426b100..426b330` from arm64SHA `64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c`. This is the generic chooser called by the actual Firefox/Safari WebUI paths, not an invented category screen or the separate Chromium source-profile popover4267ec0.

Exact original behavior: allocate NSAlert, set informational style (literal1), title `Import <supplied browser name> Data`, informative text `Where do you want to import <supplied browser name> data?`, append New Profile, Current Profile, Cancel in that order, call runModal. Return1000 supplies engaged integer0,1001 supplies engaged integer1, every other result supplies an empty optional. The once-callback is consumed after dismissal. The original incoming browser/window pointer is unused in this function: there is no sheet, parent-window binding or asynchronous alert substitution.

New typed155 adaptation API in `chrome/browser/ui/webui/aux_importer/import_target_chooser.h`:

```
aux_importer::ShowImportTargetChooser(
    const std::u16string& browser_name,
    base::OnceCallback<void(std::optional<ImportTargetChoice>)>);
```

`ImportTargetChoice::kNewProfile` retains original0 and `kCurrentProfile` retains original1. These represent the alert's actual labeled choices, not an inferred migration API enum. Root must pass the actual captured choice to each original browser-specific migration owner; this helper does not create/activate profiles or reroute all choices to the current profile. It does not manufacture account/readiness or successful migration state. Real source caller weak ownership remains with the handler's once-callback.

All seven exact UTF16/CFString texts, five actual Objective-C selector stubs and the complete modal/optional dispatch code are pinned. Clean two-new-file patch replay passes. No dialog, browser, profile, runtime, Keychain, build or signing operation occurred. Root integration must add these files to the real Mac WebUI owner target with base and AppKit; no extra third-party dependency. New-target metadata/theme/destination completion and optional activation ownership remain separate lifecycle implementation work.
