# Supplied Agent and Vault UI staging

The active reuse plan authorizes these static installed packages. No profile, account database, credential, Keychain item or live process is an input.

| Component | Source package | Version | Files | Bytes |
| --- | --- | --- | ---: | ---: |
| Agent | `~/Library/Application Support/Aside/AsideAgentManager/1.26.1016.1852` | `1.26.1016.1852` | 1,215 | 46,415,795 |
| Vault | `~/Library/Application Support/Aside/AsidePasswordManager/1.26.1016.1852` | `1.26.1016.1852` | 46 | 5,904,807 |

`provided-ui-inputs.json` pins every relative source path, byte length and SHA-256, plus the exact source extension identity and branding anchors. Sources currently remain external; moving or archiving the static snapshot is an integrator decision. A source-root override must contain exactly the pinned files/bytes, not a different installed version. Symlinks and nonregular inputs fail. Static licenses and source fonts are retained unchanged.

Agent entrypoints remain `main.html`, `newtab.html`, `sidepanel.html`, `tabsearch.html`, `minipopup.html`, `minipopup-options.html`, `notification.html`, `account-password.html`, `iframe.html`, `visual-frame.html` and `tab-preview-player.html`. Vault keeps `popup.html`, `iframe.html` and `offscreen.html`. Their original scripts, CSS, routes, background workers and content actors are copied. No independent Aux React screen is substituted.

## Integration API

```js
import { stageProvidedUi } from './scripts/lib/provided-ui.mjs';
const report = await stageProvidedUi({
  sourceRoots: { agent: agentStaticPackage, vault: vaultStaticPackage },
  outputRoot: outputDirectory,
  identities: auxExtensionIdentities,
  transformText: transformProvidedNativeUi,
});
```

The output root must not exist and cannot overlap an input root. Staging writes a fresh sibling temporary directory and renames only after every file succeeds. `identities` is the `agent`/`vault` public `{id,key}` shape already in `docs/design/extension-identities.json`; the public keys must derive the IDs. Source peer-extension IDs and manifest keys change together.

Optional `transformText({component,path,text})` runs first and returns `{text,anchors}`. Each anchor is `{kind:'identity'|'integration',find,replace,count}`. The module replays every literal edit sequentially with exact occurrence counts and requires equality with the callback's returned text. A hidden edit, missing anchor or count drift fails rather than producing a partially adapted app. Native/runtime-specific contracts belong in that callback; the staging module supplies no mock APIs or compatibility shims.

The module then changes proper-case `Aside` product names/identifiers to `Aux`, including font-family labels and the matching font filenames/references. Font bytes do not change. It rebrands known raster product icons/favicon files and the two 64px embossed SVG/React mark definitions with the existing approved Aux artwork. Existing SVG boxes and component entrypoints remain; the mark silhouette/treatment is an explicit branding exception. Icon pixels are the committed Aux iconset, with the missing 48px size pinned under `vendor/provided-ui/branding/icon48.png`, derived from `assets/brand/aux-icon-1024.png` using macOS `sips -z 48 48`. Other illustrations, provider logos, sounds and application assets remain the supplied bytes. Raster illustration branding embedded inside other images has not been visually audited and is a remaining branding-review item.

Lowercase HTML `aside`, arbitrary lowercase words, endpoint hosts and state/API names are not blindly renamed. The native/runtime adaptation callback must inventory and change the required isolated identities explicitly. It must not introduce fake successful service responses. The supplied cloud/network boundaries still require integrator review before a disposable launch; staging itself performs no network operation or OS grant.

## Difference report

`outputRoot/manifest.json` and the returned value use:

```text
{version:1, components:{agent|vault:{
  sourceVersion,inputRoot,outputRoot,
  files:[{path,sourcePath?,sourceSha256,outputSha256,
    changeKinds:[],anchors?:[{kind,find,replace,count}]}]
}}}
```

`path` is the output-relative path; `sourcePath` is present when a branding/identity filename changed. Empty `changeKinds` means source/output hashes must match. Changes are classified `branding`, `identity` or callback `integration`. Inline text edits include replayable count-checked anchors. Binary branding edits retain before/after hashes and the explicit icon-only rule above. No files are added to the staged component tree. The report itself sits outside both component trees. Root owns the final allowed-difference validator.

Without a native/runtime callback, the two deterministic test stages produced Agent 1,118 byte-identical files / 97 changed and Vault 30 byte-identical files / 16 changed. Of seven CSS files, five are byte-identical; the two global stylesheets differ only in the `Aside`→`Aux` font-family/asset-name branding literal. Rendering structure, layout declarations and all component stylesheet bytes otherwise remain unchanged. Native/runtime callback changes will have separate exact anchors.

## Old patcher audit

`vendor/aside/patches/extensions.mjs` was inspected as historical tooling. Its tab-search 640×460 forced popup resize, replacement uBlock catalog fetch, extra manifest permissions, replacement blocked page and injected private API/adblock/omnibox shims are deliberately excluded. These are behavior/platform changes, not faithful branding. The new stager uses the supplied original tab-search size declarations and catalog code and injects no shim, noop or reconstructed UI.

## Verification limits

`node --test scripts/lib/provided-ui.test.mjs` checks two full deterministic stages, unchanged-file/CSS preservation, cross-extension/public-key consistency, output collision rejection and rejection of hidden/count-mismatched adaptation edits. It skips explicitly if the pinned external packages are unavailable. Syntax checking covers the staging module. No live UI/runtime/native integration, profile read, OS prompt, provider request or fidelity acceptance is established by this static stage.
