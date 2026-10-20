# Safari per-selection target ownership

Followup against the final `native-import-webui-handler` output from 6fa9d25f3 for import_webui.cc and the captured shared picker header/implementation hashes in this manifest. This is a separate sequential patch, not a replacement for that Handler proposal.

Original42522c0 captures the selected target mode in its native file-selection continuation. Original4252324 checks the one retained dialog before presenting another. The Handler now binds Choice by value for each accepted picker Show. The picker rejects an existing dialog before changing its selection callback, then moves that accepted callback into the actual worker validation reply. A subsequent selection cannot overwrite the mode of an earlier pending validation. Cancellation resets only the retained dialog continuation; weak replies retain the existing picker lifetime boundary.

Chromium already binds source, bounds, chosen mode and whole native selected metadata into its callback chain. Firefox passes the selected choice directly to its owner before returning. Neither uses shared mutable choice state.

Counted anchors, disposable git apply and all output hashes pass. No shared source write, compile, runtime, source-profile access or credential operation was performed.
