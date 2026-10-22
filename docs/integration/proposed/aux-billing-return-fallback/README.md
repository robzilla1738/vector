# Existing Aux account route as hosted billing fallback

Inactive exact source helper. This changes no legal/help/community destination,
UI copy/style/geometry, asset, provider, Stripe object, account or owner state.
No network request, deployment, signing or app launch occurred.

The actual supplied `assets/add-on-credits-dialog-Dn5FxOyZ.js` return-URL helper
starts with `if(typeof window>"u")return"https://asidehq.com";`. This no-window
fallback is a foreign origin that the current Aux backend's actual returnUrl
validator rejects. The other branches return the current hosted page URL or
the native daemon `/billing/return` URL with account/profile/window context.

There is one evidenced replacement, without inventing a new page:

| Explicit cloud profile | SSR-only fallback | Existing route/contract |
| --- | --- | --- |
| development | `https://dev-cloud.getaux.co/account` | deployment-resources.json development.appOrigin; actual authenticated app/account/page.tsx; actual billing returnUrl configured-app-origin validator |
| production | `https://app.getaux.co/account` | existing production public-origin configuration plus billing validator's default app origin; same implemented account page |

The account page uses Clerk auth and redirects unauthenticated visitors to sign
in. It is not a payment-success screen. Returning there does not claim a completed
checkout, paid subscription, synchronized entitlement or production deployment.
Production configuration evidence explicitly records productionActivation:false.

`applyAuxBillingReturnFallback({component,path,text,original},cloudOptions)`
returns `{text,anchors}` for exactly the Agent add-on module. The original module
hash, one exact branch and two fixed configured origins are pinned in inputs.json.
Only explicitly enabled development/production cloud builds change. Local mode
is inert: no hosted route or insufficient native profile context is invented.
Unknown profile, source drift and repeated/mixed generation reject. For unrelated
files it is inert.

Root integration: apply inside state2 UI composition after existing cloud
transforms and before final file hashes/Agent revision fingerprint. Pass the same
explicit cloudOptions used by the origin policy. Retain its one replayable anchor;
no default compatibility change is implied. This adds the fourth changed module
to the current origin batch's reviewed Agent inventory, alongside manifest.json
and the two demo modules. Root owns pipeline/ledger/package changes; this lane
does not edit those files.

`node --experimental-vm-modules --test
vendor/provided/aux-billing-return-fallback.test.mjs` passes three focused tests.
They hash-pin genuine public route/config/validator sources and execute the actual
extracted UI return helper plus the actual cloud returnUrl function with TypeScript
types stripped by Node. Synthetic public configuration only: no Stripe/database
module initialization or provider call. Both new fallback URLs are accepted by
that actual validator; the old product and marketing-home origins reject. Actual
original and completed prior-stage UI output parse; reversing the one anchor
reproduces every other byte. Hosted-window and native extension return URLs stay
identical, including actual account/profile/window query parameters.

The read-only route search found no implemented Aux Terms/Privacy, docs/help,
owner-owned community or bot-avatar image routes under current apps/services.
Those destinations remain explicit gaps from aux-ui-origin-identity/README.md.
Replacing agreements with `/account`, inventing docs URLs or using approximate
avatars would be incorrect and was not done. This helper does not remove the
old legal URLs elsewhere in this same module or claim complete URL identity.
