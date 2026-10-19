# Native profile service header dependencies

The toolbar, app-menu status, global media controls and avatar public headers now
include `chrome/browser/buildflags.h` for their Aux migration hooks. Their existing
public GN targets expose `//chrome/browser:buildflags`; this adds no new target or
service. The counted patch pins the actual v71 inputs (unchanged by the staged
source proposals). Applied as composition v77, then carried into v80.

Native compilation and runtime behavior are separate evidence.
