# Native organization domain — first execution slice

Native C++ implementation proposal for FX-CONTRACT/FX-ORG. The core is new feature behavior integrated through existing profile/pin owners, not the retired independent shell. Existing native UI geometry and assets are untouched.

Implemented source: stable per-profile UUID records; ordered Spaces; nested tab folders; profile-global pins with unload close policy; revision/CAS and exact persistent operation replay; typed mutations; archived subtrees with independent archive-batch preservation; section/folder collapse; current versus launch URL; revisioned deltas; bounded, generation-local Undo. Legacy pin import retains duplicate URLs, refuses malformed/unknown input, and never removes the original preference. Decoder rejects unknown fields and unsupported versions, and all uint64 wire values use canonical decimal strings.

The service serializes writes and publishes only after the exact native storage tuple succeeds. Owner change, uncertain result or write failure blocks publication and further mutation until native reconciliation. A queued preference write or timeout is not success. The root integrator supplies the dedicated single authoritative snapshot storage, loaded-profile coordinator and factory; no second writable preference model is registered here.

Core files are under `source/chrome/browser/aux/organization/`. `organization_model.cc` is compiled as real native C++20 with strict warnings for its focused syntax check. Chromium gtest sources describe meaningful model boundaries; they are not reported as runtime-passed until executed through an authorized harness. The codec/service depend on Chromium headers and require selected-graph object compilation/integration.

This first slice does not implement the full Space switcher or nested-folder Views, bind every native close command, certify isolation/drain, execute owner migration, launch the app or claim current-app acceptance. These remain explicit consumer/integrator work. No product signing, restart, cloud or provider access.
