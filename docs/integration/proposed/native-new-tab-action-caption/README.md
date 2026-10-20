# Supplied New Tab action caption

The supplied button does not impose its own title casing. Its actual action interface4244ce8 copies the real ActionItem text into the button, then enables it. The original action producer3785cd0 sets action11;3785cf0 and3785d6c load resource277 for its title and tooltip, clean the mnemonic, and install both on that ActionItem. The pinned original English catalog says277=`New &Tab`. Thus the final visible caption is `New Tab`.

Constructor4243134 separately loads261=`New tab` before the genuine action relationship is installed. Treating that transient initial string as the final visible title would miss the supplied action producer. Current155's actual `kActionNewTab` producer uses `IDS_NEW_TAB`, now `New &tab`. The current port correctly copies its text and consequently displays `New tab`.

This one-file producer adaptation uses actual localized155 `IDS_ACCNAME_NEWTAB` (`New Tab`) for the Aux New Tab ActionItem title and tooltip. It keeps the existing cleanup, action ID, command/callback, image, observer relationship, force-enabled behavior and before-invoke ordering. `AuxVerticalNewTabButton` remains unchanged and continues copying actual ActionItem text; no hardcoded English, case conversion, after-the-fact title override, global GRD change or unrelated menu change is introduced. The non-Aux producer branch remains untouched.

The original function also proves the constructor's genuine plus must survive ActionItem updates: the port already calls ButtonActionViewInterface rather than generic LabelButton image projection. No further concrete icon/shortcut delta was found in this bounded caption chain, so none is added.

The English caption difference is source-proven; equivalence of all supplied/current localized catalogs is not claimed. Existing `chrome/browser/buildflags.h` and generated resources already support the narrow conditional; no GN changes are needed. Root owns shared apply and BrowserActions integration.

`python3 verify.py` checks exact current394 baseline pins and independently replays the one-file patch. No native build or runtime/owner-profile/network operation was performed. Actual rendered observation remains integration work.
