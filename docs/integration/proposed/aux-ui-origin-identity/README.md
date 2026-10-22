# Agent service-origin permissions and existing home hrefs

Inactive pinned source helper; no deployment, network/provider operation, owner
data, native lifecycle or accepted app change. UI copy, component structure,
CSS, geometry and asset pixels remain unchanged. This slice does not invent
policy/help pages, a community or replacement bot artwork.

## Implemented cohort

The supplied Agent manifest exposes main.html to the two old API origins.
Existing Aux cloud policy already changes its actual API producers in
background.js and assets/strip-markdown-DRcmtuJc.js to one explicit reviewed
Aux API origin. The manifest did not follow that policy.

`applyAuxUiOriginIdentity({component,path,text,original},cloudOptions)` pins the
original1852 manifest and two demo modules with exact count-checked anchors:

* Explicit development cloud: main.html matches only
  `https://dev-cloud.getaux.co/*`, the API origin from the existing reviewed
  service policy and development deployment configuration.
* Explicit production cloud: main.html matches only `https://api.getaux.co/*`,
  the already-reviewed production API origin. This declares the build's
  intended origin; it does not imply production deployment/activation.
* Local mode: remove just that main.html remote-exposure record. There is no
  enabled remote API or hosted embedding in local mode; no broad localhost
  permission, wildcard Aux domain or old product origin is substituted.
* Existing demo/reference hrefs in assets/chat-wBzshK0k.js and
  assets/artifact-test-CdjpLuI1.js change their single `https://aside.com` href
  to the owner's existing `https://getaux.co` public home. This origin is also
  used by the current cloud shared-page home link. Surrounding UI strings,
  translations, layout and demonstration code stay byte-identical.

The other supplied resource record (iframe/preview/tabsearch/react-grab/assets),
host_permissions, extension permissions, commands and extension identity stay
unchanged. This slice does not broaden or redesign those capabilities.

`assertAuxUiOriginPairing({manifestText,manifestOriginal,callers},cloudOptions)`
requires both actual completed API producer modules, their original hashes and
the completed manifest. Caller records are `{path,text,original}` for exactly
background.js and assets/strip-markdown-DRcmtuJc.js. It rejects mixed origins,
old origins, missing/duplicate/wrong-source callers, widened or altered resource
cohorts and mismatched local/development/production generation. Returned evidence
explicitly says hostedEmbeddingVerified:false.

Important semantic limit: main.html web-accessible-resource permissions govern
external navigation/embedding; they do not authorize the extension's API fetch
operations. These are paired by their same reviewed service origin, not claimed
as the same browser mechanism. The current Aux `/desktop/connect` page tells
users to return to the browser/email-code flow and does not embed main.html.
No actual hosted main.html embed producer was found in current cloud app code;
the preserved narrow cloud resource contract is not proof of hosted sign-in.
Native/extension-internal main.html routes do not become remote embedding flows.

## Integration

Root owns existing stage/manifests/pipeline. Apply only for state2 identity, after
the existing UI boundary and reviewed cloud policy and before manifest/file
hashes. Pass the SAME explicit cloudOptions used by those producers; shell
environment is never read here. For other UI files the helper is inert. Retain
anchors in the ordinary replayable patch receipt.

After completing Agent transformation, run assertAuxUiOriginPairing over the
actual final manifest and both final API producer modules. Original buffers come
from the already-hash-verified supplied snapshot, not mutable owner state. This
separate cohort check must use final output, so later transforms cannot silently
undo the permission/caller pairing. Revise the Agent worker inventory/version
through the existing reviewed mechanism because manifest and module bytes change.
Default compatibility/state1 integration remains under root's explicit control.

## Focused verification

`node --experimental-vm-modules --test
vendor/provided/aux-ui-origin-identity.test.mjs`: three focused tests cover all
three fixed policies against actual supplied modules, exact anchor replay,
complete resource-cohort equality and unchanged permission arrays. Actual
background/strip-markdown and demo output modules parse. Mismatched/wildcard/old
origins, source drift, missing producers, repeat application and unsupported
profiles reject. Demo inverse replacement reproduces every incoming byte.
Legal/help/avatar modules remain unchanged by this helper.

This is source/permission validation, not a live browser, network or hosted
service test. No successful response or credential action was simulated as real.

## Explicit remaining destinations

| Actual active source | Remaining gap |
| --- | --- |
| ai-CzEX5E7S.js and add-on-credits-dialog-Dn5FxOyZ.js | Original Terms/Privacy hrefs remain. No implemented/reviewed Aux terms/privacy pages were found. Do not direct an agreement to unrelated pages or imply legal approval. |
| add-on-credits-dialog-Dn5FxOyZ.js no-window fallback | Original homepage fallback participates in checkout return-URL selection; it needs an Aux app/billing return contract, not a cosmetic marketing-home replacement. Existing local/native URL behavior stays untouched here. |
| route-TQyeTEXE.js Docs and Community | No configured Aux docs service or owner-owned community invite established. Existing channels docs are already isolated as deliberately unavailable by the older UI boundary; that is not actual documentation. |
| channels-CJn5l9_T.js four bot-avatar URLs | No Aux-controlled matching image assets were established. This lane does not invent a static host or replace artwork with approximations. |
| CLI troubleshooting docs | Needs an actual Aux troubleshooting destination and content; native key access remains protected. |
| Embedded guide/demo prose and raster pixels | Other original brand words/pixels require their separate reviewed branding scope. Changing two hrefs does not claim all demo/artwork branding is removed. |

Production activation, public policy authoring, help/community setup, artwork
production, actual sign-in/embedding acceptance and external account changes
remain separate work. Historical supplied-source manifests stay truthful.


## Development revision10 integration

The staging pipeline now applies the exact manifest/demo-href transform within state2, after existing integration transforms, and validates the completed manifest against both actual final API producer modules. The development revision10 fingerprint is `ea3bd2d5ba0f592015c673c9c74db3c52f3374614a6caf2edc703b8bf2a2c78e`.

`revision10/derive.mjs` records the bounded derivation: verifies all six inspected actual predecessor files against the revision9 report and original source pins, reverses only the last manifest-version anchor, authenticates the complete predecessor inventory against the append-only revision9 fingerprint, then updates exactly the four reviewed outputs (including the separately reviewed hosted billing fallback). It deliberately refuses if the ledger is no longer at revision9; it is a historical derivation tool, not a repeatable migration or a second ledger append. The three-origin-file predecessor derivation and cohort were independently reproduced read-only before adding the separately source-pinned billing fallback. Fresh staging verifies the final combined fingerprint. See `revision10/review.json`.

No layout, CSS, glass or artwork bytes are changed by this origin integration. Full fresh staging/packaging is still required; the derivation alone is not final-output or hosted sign-in acceptance. Production/local policies require separate revision reviews and are not covered by this development revision.
