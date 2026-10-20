# Search action interface ownership

Expose the retained search owner declarations to the actual extension-action implementation through a Mac/Aux-only header target. The implementation remains full UI; extensions do not depend on all of :ui. This preserves original positive-window lookup and close-before-action without introducing a dependency cycle. GN/C++/runtime validation remains required after the live build.
