# Public product information routes and supplied UI links

The cloud app now has `/docs`, `/community`, `/policy/privacy` and `/policy/terms` using its existing layout, logo, main/header/section/paragraph/link styles. A shared server component provides navigation; no client behavior, authentication requirement, new CSS or marketing route is introduced. Route metadata uses the page title.

Page copy comes from integration lane commit `1bb06e36e`, with the exact community/privacy feedback correction from `65758a921`, recorded paragraph-for-paragraph with source/output hashes in content-pins.json. Privacy and terms remain explicitly marked review drafts; legal operator/contact/jurisdiction/retention decisions and hosted acceptance are not fabricated. The community page adds no invented forum or contact address. These source routes do not establish hosted availability or legal approval.

Root-callable export `transformAuxProductInformationLinks({path,text,source})` in `vendor/provided/aux-product-information-links.mjs` takes accumulated UI text and its separately pinned original A38 source. It changes only four unique URLs from `https://getaux.co` to `https://app.getaux.co`: docs/community in route-TQyeTEXE.js, privacy/terms in ai-CzEX5E7S.js and the add-on credits dialog. Each file has two exact one-count anchors (six total), with source hashes in source-pins.json. The credit dialog's existing account endpoint remains the responsibility of root's cloud transform. Unrelated asset paths return unchanged.

Root must compose this additive transform into its final supplied UI pipeline; no generated replacement should overwrite another lane's changes. Shared manifests/materializers, accepted app, live state and marketing source were not edited.

Focused checks: the five route TSX files typecheck using the existing cloud dependencies in a disposable static project; all three transformed UI modules parse; reversing just the six URL replacements reproduces each exact original input. No cloud build, deployment, hosted operation, real account, browser launch or broad test suite was run. Actual hosted route acceptance remains a root gate after approved deployment.
