# Centered command palette dispatch — A27

Actual Cmd+T creates a durable new-tab row and Cmd+K opens the standard omnibox, despite the genuine native command switch already preferring ShowAuxCommandBar. The existing implementation silently falls back when that function refuses. The enabled Agent ID matches the packaged manifest, and the two actual source pins match the A25 build manifest; runtime registry/owner refusal remains unobserved.

This slice fixes the concrete Cmd+T semantic hole in ordinary normal windows: palette refusal no longer silently creates a durable tab before commit. Explicit blank-tab commit still invokes the real NewTab implementation from the existing palette command. Non-normal and non-Aux behavior remains unchanged. Cmd+K/L keep trusted location/search fallback while the centered-owner failure is identified.

Data-only stage logs distinguish absent BrowserView/native Widget, retired owner/browser/parent, Agent not enabled, owner invalidation during creation, and missing tracked contents/widget. A successful show logs only its finite mode. Native command logs distinguish the centered request from trusted fallback. No URLs, user contents, profile identifiers, paths, token or credentials are logged. No missing owner/extension guard is bypassed. This does not claim the palette is runtime fixed merely because diagnostics exist.

Two native files/eight counted anchors. Exact replay and diff checks pass; no CSS/material/dimensions/permissions change. Root owns compilation and the bounded Cmd+T/K/L/Escape/commit actual-app checks. No app/helper execution, build, signing or provider action in this lane.
