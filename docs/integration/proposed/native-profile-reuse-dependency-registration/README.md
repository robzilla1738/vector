Register supplied profile dependencies

Compile the persistent pinned-entry model in existing browser_ui_prefs, which both profile registration and native UI already depend on. Expose its header there and register the original empty pinned_tabs list in RegisterBrowserUserPrefs, under enabled Aux Mac only. The model has no full-UI dependency, avoiding a prefs/UI cycle. Compile ProfileSearchButton in the existing enabled Aux Mac UI source list. This registers dependencies only; it mounts no substitute view and invents no action. Actual compilation follows packaging of the unchanged v170 build.
