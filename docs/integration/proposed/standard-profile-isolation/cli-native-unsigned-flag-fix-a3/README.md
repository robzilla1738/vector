# One inherited unsigned product link flag

The actual native CLI graph supplied `-Wl,-no_adhoc_codesign` twice: once through the existing global product config and once in its new target. The strict linker filter correctly refused a duplicate. Remove only the target duplicate; retain the inherited global flag and all signing/output checks. A fresh actual link must prove exactly one flag and an unsigned Mach-O. No product execution or signing is authorized.
