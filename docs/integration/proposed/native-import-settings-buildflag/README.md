# Explicit Settings buildflag import

Actual GN generation requires Settings to import chrome/browser/buildflags.gni before using enable_aux_browser. Add the declaring import; leave all platform gating and runtime behavior unchanged.
