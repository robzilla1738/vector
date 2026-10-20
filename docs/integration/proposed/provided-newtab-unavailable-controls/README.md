# Retain supplied Ask controls when profile resolution is unavailable

The entire missing options row has one precise cause: original `ask-omnibox-panel-DkxXbN8c.js` component `J` returns `null` when `useNewTab().accountId === null`. Original `island-C0ouZ54e.js` component `Ne` sets that ID from `queries-ldd77hNk.js`'s reconnecting native profile/account resolver. The new-tab editor has a separate owner and remains visible. This is not a removed toolbar or CSS regression: current staged island and Ask panel are exact frozen-source bytes, and their composer is retained with scoped native/identity adaptations.

Original `ee` is the row requested by the owner: attachment/composer options, Project, permission, model/thinking controls, and Dictate. Simply deleting the null guard is incorrect: provider `yu`, composer `Ip`, `Fo`, `Wp`, and `Nr` immediately consume account-scoped settings, inventory, projects and account queries. The outer original fallback `accountId:n??0` was previously unreachable by these children; it is not evidence of a legitimate account zero.

This integration retains the resolved-account branch and adds a **disconnected** branch. It reuses the original module's private `J` button, `ws` Project label, `oc` permission trigger, `ac` model trigger, `ic` thinking trigger, `nl` options icon, `au` microphone icon, `uf` toolbar and `Ts` grouping. Exact `ee` container geometry and original control sizes/classes are retained. The new branch mounts none of the provider/new-session hooks. All controls are disabled; status explicitly says the profile is disconnected. Model/reasoning labels say unavailable. Empty provider identity uses the supplied icon renderer's existing generic fallback (`icons-C7UupG-g.js`, `S.get(provider)??B`), rather than claiming an actual provider. Permission `guard` is the supplied default (`use-default-permission-mode-DKp05vFQ.js`), shown disabled, not read from or written to any account. No inventory, account ID, credential, subscription or successful state is created. Dictate has no microphone callbacks.

The live Aside row's GPT-6.1 Sol/Medium is its actual account's selection, not an offline public inventory. Pinned 1852 defaults are aside/gpt-6-luna/medium, with availability supplied by account-scoped `models.listSettingsInventory`. This change intentionally does not claim any such model is usable. Once real profile resolution succeeds, React swaps to the complete untouched original provider/composer branch automatically.

The earlier independent Aux `apps/extension/src/Chat.tsx` renders model/effort `<select>` controls unconditionally in its composer, independently of model-list success. Its `main.tsx` supplies a resolved `AccountRoute` ID. That explains why earlier independent UI could retain controls on an empty model list, but does not prove that a prior supplied candidate had valid native auth or authorize copying its backend/account defaults.

## Integrator hook

New module: `scripts/lib/provided-newtab-unavailable-controls.mjs`.

Export `transformProvidedNewTabUnavailableControls({component,path,text}) -> {text,anchors}`. Four counted anchors across two Agent JS files; Vault/other paths unchanged. Apply after existing native/scope/boundary transforms, concatenate returned anchors, and include the module in the adaptation-input catalog. Root owns these two registration changes. Existing stage/package/source pins are untouched by this commit.

`manifest.json` records exact frozen-source hashes, sizes, source/output hashes for the isolated transform, and replay anchors. These output hashes are for this transform alone, not a claim that a staged branding/native output has the same bytes. There is no native/GN proposal.

## Focused verification and remaining gate

`AUX_FROZEN_UI_ROOT=/absolute/frozen/agent node --test scripts/lib/provided-newtab-unavailable-controls.test.mjs` passes three checks: fail-closed counted anchors/unchanged resolved branch, isolated JSX-tree rendering with disabled controls and no account/microphone effect callbacks, and every anchor replayed against the exact pinned originals. Supplied chunks are never executed. The renderer check substitutes inert primitive nodes; it verifies composition/props, not browser pixels. Native packaging and actual rendered observation remain integrator work. Real model/provider availability remains blocked on genuine installation/account authentication; this disconnected row does not resolve that boundary.
