# Actual compiler correction — native worker/controller

This narrow successor addresses the actual failed worker object diagnostics.
The real Chromium `base::DictValue` lvalue Set returns `Value*`; its calls cannot
be chained as dictionary calls. Each existing lvalue dictionary mutation is now
a separate statement. Valid rvalue builders remain unchanged. The actual
ExtensionFunction class is global; the erroneous extensions namespace forward
reference and sender signatures now use that real complete native class.

Three exact actual native inputs are pinned, with counted replay and a patch.
Only compile syntax/type corrections are made; identity checks, physical lifetime,
source correlation, failure retention, frontend gate ordering and unqualified
admission behavior remain unchanged. The actual failed compiler log, values
header and function header are pinned in source-plan.json. Earlier source-only
checks were not compilation evidence and do not establish that failed object.

Root owns projection and actual object compilation. This lane did not change the
native checkout, compile, run an app/helper, sign, release or use owner state.
