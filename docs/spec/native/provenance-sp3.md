# SP3 source provenance (integrator to consolidate)

Reference strings and paths are isolated here. All other native specs refer to these source IDs. Inspection date: 2026-10-19. No reference application launch or real-profile inspection occurred.

- N1: `/Users/rcourson/Downloads/aside-rea 2/native-fork/NATIVE-FORK.md`, native layer map and recovered behavior highlights. This map identifies a Chromium 153.0.8010.53 target; it is not proof of the installed Aside 1.26.1016 behavior. Used for platform lifecycle/profile/CDP and API semantics.
- N2: same tree, `decompiled/0415d84c.c` and `0415e3cc.c`, challenge/session response validation. Static decompiled evidence only; no source excerpt is passed to builders.
- N3: accepted Aux v1 plan, native timings/ports, namespaces and local-only packaging. These are owner requirements rather than independent runtime measurements.
- N4: same tree, `idl/idl-asideAccount.json`, `idl-asideBrowserPreferences.json`, `idl-asideMiniPopup.json`, `idl-asideNotification.json`. Declarative signatures: respectively 4, 33, 10, 2 functions, with no events.
- N5: same tree, `idl/idl-asideOmnibox.json`: 29 functions and 19 events; many payloads are unrestricted JSON, so IDL alone does not establish their wire shape.
- N6: same tree, `idl/idl-asideBrowserImport.json`: 4 functions and 1 event; progress/options shapes are unrestricted JSON.
- N7: same tree, `idl/idl-asideAdblock.json`: 14 functions, typed subscription/update/diagnostic shapes, no events.
- N8: `/Users/rcourson/AI Blueprints/06/06_DESIGN.md`, native palette and geometry section; captured from older reference build, not runtime measurement of 1.26.1016. Used with explicit historical limitation.
- N9: same tree, `assets/06-chrome-tokens.css`: native color roles across light/dark. Native specs translate roles to Aux names rather than preserving product identifiers.

Known provenance gaps: target-version screenshots not captured; exact bootstrap state disk shape and installation signature algorithm need SP1 coordination; native viewport-domain parameter schemas and some open JSON API payloads need further evidence.
