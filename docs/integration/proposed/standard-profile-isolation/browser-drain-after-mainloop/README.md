# Final callback after actual BrowserMainLoop destruction

Layers over browser-drain and browser-drain-final. The historical phase6 marker
inside ChromeBrowserMainParts destructor is not sufficient: member destructors
and the enclosing BrowserMainLoop could still execute afterward. The late final
wait now runs only through a one-time native callback after actual
`main_loop_.reset(nullptr)` returns, and report0 requires this additional marker.
Window close/profile switching never invoke it. No inferred process-exit receipt.

Five files, exact ordered replay/applied patch equality/whitespace passed. No
compile or runtime execution. No additional new leaves/GN beyond the prior slice.
