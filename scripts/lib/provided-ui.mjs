import { applyAuxChannelBotAssets } from '../../vendor/provided/aux-channel-bot-assets.mjs';
import { applyAuxProductLinks, applyAuxEditorGlobalIdentity } from '../../vendor/provided/aux-product-links.mjs';
import { materializeAuxRecoveryEnrollmentUI } from '../../docs/integration/proposed/aux-sync-recovery-enrollment-ui/source/adapt.mjs';
import { applyAuxBillingReturnFallback } from '../../vendor/provided/aux-billing-return-fallback.mjs';
import { transformProviderFundedLaunch } from '../../vendor/provided/provider-funded-launch.mjs';
import { applyOfficialChatGPTCallbackAsset } from '../../vendor/aside/patches/chatgpt.mjs';
import { relocateAuxAssetPath, applyAuxAssetReferenceIdentity } from '../../vendor/provided/aux-asset-path-identity.mjs';
import { applyAuxCaptureContractIdentity } from '../../vendor/provided/aux-capture-contract-identity.mjs';
import { applyAuxProfileContextIdentity } from '../../vendor/provided/aux-profile-context-identity.mjs';
import { applyAuxSelectionContractIdentity } from '../../vendor/provided/aux-selection-contract-identity.mjs';
import { applyAuxUiOriginIdentity, assertAuxUiOriginPairing } from '../../vendor/provided/aux-ui-origin-identity.mjs';
import { loadAuxBrowserIconReplacement } from './aux-browser-icon.mjs';
import { applyAuxRuntimeContractIdentity } from '../../vendor/provided/aux-runtime-contract-identity.mjs';
import { applyAuxProviderIdentity } from '../../vendor/provided/aux-provider-identity.mjs';
import { applyAuxProtocolIdentity, resolveProtocolIdentity, resolveStateIdentityVersion } from '../../vendor/provided/aux-protocol-identity.mjs';
import { reviseAgentManifest } from '../../docs/integration/proposed/provided-agent-worker-revision/revision.mjs';
import { readAuxMark, auxMarkReactChildren, auxMarkSvg } from './aux-mark.mjs';
import { restoreProvidedWireNames } from './provided-wire.mjs';
import { createHash } from 'node:crypto';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const version = '1.26.1016.1852';
const textFile = /\.(?:js|mjs|html|json|css|txt|svg)$/;
const inlineMark =
  /(\w+=\w+=>\(0,(\w+)\.jsxs\)\("svg",\{width:64,height:64,viewBox:"0 0 64 64",fill:"none",xmlns:"http:\/\/www\.w3\.org\/2000\/svg",\.\.\.\w+,children:)\[\(0,\2\.jsxs\)\("g",\{clipPath:"url\(#clip0_3720_\d+\)"[\s\S]*?\{width:64,height:64,fill:"white"\}\)\}\)\}\)\]\}\)/g;
const smallMarkFiles = {
  agent: 'assets/tag-icon-DeMC7uIN.js',
  vault: 'assets/popup-MxHiJ2Et.js',
};
const smallMark = /(\(0,(\w+)\.jsx\)\("svg",\{viewBox:"0 0 24 24",fill:"none",xmlns:"http:\/\/www\.w3\.org\/2000\/svg",width:\w+,height:\w+,"aria-hidden":\w+,focusable:"false",\.\.\.\w+,)children:\(0,\2\.jsx\)\("path",\{fillRule:"evenodd",clipRule:"evenodd",d:"M12 0\.798752C18\.0061[^"\n]+",fill:"currentColor"\}\)/g;
const wordmark = /(\w+=\w+=>\(0,(\w+)\.jsxs\)\("svg",\{width:108,height:40,viewBox:"0 0 108 40",fill:"none",xmlns:"http:\/\/www\.w3\.org\/2000\/svg",className:"-ml-1 h-9",\.\.\.\w+,children:)\[\(0,\2\.jsx\)\("path",\{fillRule:"evenodd",clipRule:"evenodd",d:"M19\.556 4\.74023[\s\S]*?\]\}\)/g;
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const extensionId = (key) =>
  createHash('sha256')
    .update(Buffer.from(key, 'base64'))
    .digest('hex')
    .slice(0, 32)
    .replace(/[0-9a-f]/g, (digit) =>
      String.fromCharCode(97 + Number.parseInt(digit, 16)),
    );

const enrollmentGenerator = 'docs/integration/proposed/aux-sync-recovery-enrollment-ui/source/adapt.mjs';
const enrollmentPaths = ['assets/aux-sync-recovery-enrollment-controller.js', 'assets/aux-sync-recovery-enrollment.js'];
/** Two fixed source-pinned assets only; never alters original UI bytes. */
export async function providedRecoveryEnrollmentUiResources(stateIdentityVersion = 1) {
  if (stateIdentityVersion !== 2) return { files: [], manifest: undefined };
  const pins = JSON.parse(await readFile(join(repository, 'docs/integration/proposed/aux-sync-recovery-enrollment-ui/source-pins.json'), 'utf8'));
  const materialized = materializeAuxRecoveryEnrollmentUI();
  if (pins.format !== 'aux.sync-recovery.enrollment-ui.v2' || materialized.activation !== false ||
      JSON.stringify(pins.assets?.map(file => file.path)) !== JSON.stringify(enrollmentPaths) ||
      JSON.stringify(materialized.files.map(file => file.path)) !== JSON.stringify(enrollmentPaths)) throw Error('Unreviewed fixed enrollment UI assets');
  const files = materialized.files.map((file, index) => {
    const record = pins.assets[index], repositorySource = 'docs/integration/proposed/aux-sync-recovery-enrollment-ui/source/' + file.path.slice('assets/'.length);
    if (record.source !== repositorySource || record.bytes !== file.bytes.length || record.sha256 !== sha256(file.bytes) || file.mode !== 0o644) throw Error('Enrollment UI asset source pin/mode differs');
    return {...file, repositorySource, sourceSha256: record.sha256, generatedBy: enrollmentGenerator};
  });
  return {files, manifest: {format: 'aux.sync-recovery.enrollment-ui.resources.v1', activation: false, files: files.map(({path,bytes,mode,repositorySource,sourceSha256,generatedBy}) => ({path,bytes: bytes.length,mode,repositorySource,sourceSha256,outputSha256: sha256(bytes),generatedBy}))}};
}

async function paths(root, directory = '') {
  const files = [];
  for (const entry of (
    await readdir(join(root, directory), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`Supplied UI contains a symbolic link: ${path}`);
    if (entry.isDirectory()) files.push(...(await paths(root, path)));
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Supplied UI contains a nonregular input: ${path}`);
  }
  return files;
}

export async function inventoryProvidedUi(sourceRoots) {
  const components = {};
  for (const component of ['agent', 'vault']) {
    const inputRoot = resolve(sourceRoots[component]);
    if ((await lstat(inputRoot)).isSymbolicLink())
      throw new Error('Supplied UI root must not be a symbolic link');
    const manifest = JSON.parse(
      await readFile(join(inputRoot, 'manifest.json'), 'utf8'),
    );
    if (manifest.version !== version)
      throw new Error(`Unexpected ${component} source version`);
    const files = [];
    for (const path of await paths(inputRoot)) {
      const bytes = await readFile(join(inputRoot, path));
      const text = textFile.test(path) ? bytes.toString('utf8') : '';
      files.push({
        path,
        size: bytes.length,
        sourceSha256: sha256(bytes),
        brandingCount: text.split('Aside').length - 1,
        inlineMarkCount: text.includes('clip0_3720_')
          ? [...text.matchAll(inlineMark)].length
          : 0,
      });
    }
    components[component] = {
      sourceVersion: version,
      inputRoot,
      extensionId: extensionId(manifest.key),
      files,
    };
  }
  return { version: 1, components };
}

function apply(text, anchor) {
  if (
    !['branding', 'identity', 'integration'].includes(anchor.kind) ||
    !anchor.find ||
    typeof anchor.replace !== 'string' ||
    !Number.isSafeInteger(anchor.count) ||
    anchor.count < 1
  )
    throw new Error('Invalid supplied UI transformation anchor');
  const count = text.split(anchor.find).length - 1;
  if (count !== anchor.count)
    throw new Error(
      `Supplied UI anchor count mismatch: expected ${anchor.count}, found ${count}`,
    );
  return text.split(anchor.find).join(anchor.replace);
}

/** transformText returns {text, anchors:[{kind,find,replace,count}]}; every edit is replayed and checked. */
export async function stageProvidedUi({
  sourceRoots,
  outputRoot,
  identities,
  transformText,
  postIdentityTransformText,
  featureProfile = "baseline",
  cloudProfile,
  identityProfile = 'compatibility',
  stateIdentityVersion = 1,
}) {
  resolveProtocolIdentity(identityProfile);
  resolveStateIdentityVersion(stateIdentityVersion, identityProfile);
  const pinned = JSON.parse(
    await readFile(
      join(repository, 'docs/source/provided-ui-inputs.json'),
      'utf8',
    ),
  );
  const actual = await inventoryProvidedUi(sourceRoots);
  for (const component of ['agent', 'vault']) {
    const expected = pinned.components[component],
      found = actual.components[component];
    if (
      JSON.stringify(expected.files) !== JSON.stringify(found.files) ||
      expected.extensionId !== found.extensionId
    )
      throw new Error(
        `Supplied ${component} inputs differ from the pinned snapshot`,
      );
    const identity = identities[component];
    if (
      !identity ||
      !/^[a-p]{32}$/.test(identity.id) ||
      extensionId(identity.key) !== identity.id
    )
      throw new Error(`Invalid Aux ${component} public identity`);
  }
  if (identities.agent.id === identities.vault.id)
    throw new Error('Aux extension identities must differ');
  const suppliedIds = Object.values(actual.components).map(
    (component) => component.extensionId,
  );
  if (
    Object.values(identities).some((identity) =>
      suppliedIds.includes(identity.id),
    )
  )
    throw new Error(
      'Aux extension identities must differ from supplied identities',
    );
  const destination = resolve(outputRoot);
  for (const root of Object.values(sourceRoots).map((path) => resolve(path))) {
    if (
      !relative(root, destination).startsWith(`..${sep}`) ||
      !relative(destination, root).startsWith(`..${sep}`)
    )
      throw new Error(
        'Supplied input and output roots must not contain each other',
      );
  }
  await mkdir(dirname(destination), { recursive: true });
  try {
    await lstat(destination);
    throw new Error('Supplied UI output must not already exist');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (!["baseline", "desktop-v1"].includes(featureProfile)) throw Error("Unknown supplied feature profile");
  const report = { version: 1, identityProfile, stateIdentityVersion, featureProfile, components: {} };
  const mark = await readAuxMark();
  const browserIcon = stateIdentityVersion === 2 ? await loadAuxBrowserIconReplacement() : null;
  const reviewedReplacements = browserIcon ? [browserIcon] : [];
  const originCloudOptions = cloudProfile ? {enableCloud: true, profile: cloudProfile} : {};
  const originPaths = new Set(['manifest.json', 'background.js', 'assets/strip-markdown-DRcmtuJc.js']);
  const temporary = await mkdtemp(join(dirname(destination), '.provided-ui-'));
  try {
    for (const component of ['agent', 'vault']) {
      const input = actual.components[component];
      const files = [];
      const originOriginals = new Map();
      let originPairing;
      const sourceManifest = JSON.parse(
        await readFile(join(input.inputRoot, 'manifest.json'), 'utf8'),
      );
      const outputPaths = new Set();
      for (const file of input.files) {
        const source = await readFile(join(input.inputRoot, file.path));
        if (sha256(source) !== file.sourceSha256)
          throw new Error(
            `Supplied input changed while staging: ${component}/${file.path}`,
          );
        if (component === 'agent' && stateIdentityVersion === 2 && originPaths.has(file.path))
          originOriginals.set(file.path, source.toString('utf8'));
        let path = file.path.replaceAll('Aside', 'Aux');
        let output = source;
        let brandingReplacement;
        if (component === 'agent' && browserIcon && file.path === browserIcon.receipt.path) {
          if (sha256(source) !== browserIcon.receipt.originalSha256) throw Error('Browser icon original pin mismatch');
          output = browserIcon.bytes;
          brandingReplacement = {repositorySource: browserIcon.repositorySource, receiptSha256: browserIcon.receiptSha256};
        }
        const anchors = [],
          changeKinds = [];
        if (textFile.test(file.path)) {
          let text = source.toString('utf8');
          if (transformText) {
            const result = await transformText({
              component,
              path: file.path,
              text,
            });
            let replayed = text;
            for (const anchor of result.anchors)
              replayed = apply(replayed, anchor);
            if (replayed !== result.text)
              throw new Error(
                `Unreported transformation: ${component}/${file.path}`,
              );
            text = replayed;
            anchors.push(...result.anchors);
          }
          // Reviewed integration may add protocol commands. Preserve those
          // spellings too, rather than discovering wires only in the baseline.
          const wireSource = text;
          const replacements = [
            ...['agent', 'vault'].map((peer) => ({
              kind: 'identity',
              find: actual.components[peer].extensionId,
              replace: identities[peer].id,
            })),
            {
              kind: 'identity',
              find: sourceManifest.key,
              replace: identities[component].key,
            },
            { kind: 'branding', find: 'Aside', replace: 'Aux' },
          ];
          for (const replacement of replacements) {
            const count = text.split(replacement.find).length - 1;
            if (!count || replacement.find === replacement.replace) continue;
            const anchor = { ...replacement, count };
            text = apply(text, anchor);
            anchors.push(anchor);
          }
          const wire = restoreProvidedWireNames(wireSource, text);
          text = wire.text;
          anchors.push(...wire.anchors);
          const protocol = applyAuxProtocolIdentity({ component, text }, identityProfile, cloudProfile);
          text = protocol.text;
          anchors.push(...protocol.anchors);
          if (stateIdentityVersion === 2) {
            const provider = applyAuxProviderIdentity({ component, path: file.path, text, original: source.toString('utf8'), branding: 'aux' });
            const runtime = applyAuxRuntimeContractIdentity({ component, path: file.path, text: provider.text, original: source.toString('utf8'), branding: 'aux', nativeAdapted: true });
            text = runtime.text; anchors.push(...provider.anchors, ...runtime.anchors);
            if (component === 'agent' && file.path === 'assets/utils-WfPpT5w5.js') {
              const anchor = {kind: 'identity', find: 'if(a.name==="aside"&&a.path==="builtin/aside")return"Aux"', replace: 'if(a.name==="aux"&&a.path==="builtin/aux")return"Aux"', count: 1};
              text = apply(text, anchor); anchors.push(anchor);
            }
            const assetReferences = applyAuxAssetReferenceIdentity({component, path: file.path, text, original: source.toString('utf8')});
            text = assetReferences.text; anchors.push(...assetReferences.anchors);
            const capture = applyAuxCaptureContractIdentity({component, path: file.path, text, original: source.toString('utf8')});
            text = capture.text; anchors.push(...capture.anchors);
            const profileContext = applyAuxProfileContextIdentity({component, path: file.path, text, original: source.toString('utf8')});
            text = profileContext.text; anchors.push(...profileContext.anchors);
            const selection = applyAuxSelectionContractIdentity({component, path: file.path, text, original: source.toString('utf8')});
            text = selection.text; anchors.push(...selection.anchors);
            const origins = applyAuxUiOriginIdentity({component, path: file.path, text, original: source.toString('utf8')}, originCloudOptions);
            text = origins.text; anchors.push(...origins.anchors);
            const billingFallback = applyAuxBillingReturnFallback({component, path: file.path, text, original: source.toString('utf8')}, originCloudOptions);
            text = billingFallback.text; anchors.push(...billingFallback.anchors);
          }
          const launch = transformProviderFundedLaunch({component, path: file.path, text, stateIdentityVersion});
          text = launch.text; anchors.push(...launch.anchors);
          if (component === 'agent' && file.path === 'assets/openai-codex-oauth-DBNnab2L.js') {
            const updated = applyOfficialChatGPTCallbackAsset(text);
            const callback = {kind: 'integration', name: 'official ChatGPT IPv4 loopback callback', find: 'http://localhost:1455', replace: 'http://127.0.0.1:1455', count: 1};
            text = apply(text, callback); anchors.push(callback);
            if (text !== updated) throw Error('ChatGPT callback replay mismatch');
          }
          const productLinks = applyAuxProductLinks({component, path: file.path, text, stateIdentityVersion});
          text = productLinks.text;
          anchors.push(...productLinks.anchors);
          const editorIdentity = applyAuxEditorGlobalIdentity({component, path: file.path, text, stateIdentityVersion});
          text = editorIdentity.text; anchors.push(...editorIdentity.anchors);
          const channelAssets = applyAuxChannelBotAssets({component, path: file.path, text, stateIdentityVersion});
          text = channelAssets.text; anchors.push(...channelAssets.anchors);
          const marks = file.inlineMarkCount
            ? [...text.matchAll(inlineMark)]
            : [];
          if (marks.length !== file.inlineMarkCount)
            throw new Error(`Inline Aux mark anchor changed: ${file.path}`);
          for (const match of marks) {
            const anchor = {
              kind: 'branding',
              find: match[0],
              replace: `${match[1].replace('viewBox:"0 0 64 64"', 'viewBox:"0 0 1024 1024"')}${auxMarkReactChildren(match[2], mark)}})`,
              count: 1,
            };
            text = apply(text, anchor);
            anchors.push(anchor);
          }
          if (file.path === smallMarkFiles[component]) {
            const matches = [...text.matchAll(smallMark)];
            if (matches.length !== 1)
              throw new Error(`Small Aux mark anchor changed: ${component}/${file.path}`);
            const match = matches[0];
            const anchor = {
              kind: 'branding',
              find: match[0],
              replace: `${match[1].replace('viewBox:"0 0 24 24"', 'viewBox:"0 0 1024 1024"')}children:${auxMarkReactChildren(match[2], mark, 1)}`,
              count: 1,
            };
            text = apply(text, anchor);
            anchors.push(anchor);
          }
          const brandEdits = [];
          if (component === 'agent' && file.path === 'assets/splash-D666ivBP.js') {
            const matches = [...text.matchAll(wordmark)];
            if (matches.length !== 1) throw new Error('Supplied wordmark anchor changed');
            const match = matches[0], runtime = match[2];
            brandEdits.push({
              find: match[0],
              replace: `${match[1]}[(0,${runtime}.jsxs)("svg",{width:40,height:40,viewBox:"0 0 1024 1024",fill:"none",children:${auxMarkReactChildren(runtime, mark, 1)}}),(0,${runtime}.jsx)("text",{x:44,y:29,className:"font-display",fontSize:28,fontWeight:450,fill:"currentColor",children:"Aux"})]})`,
            });
          }
          if (component === 'agent' && ['assets/tool-definition-registry-Cc6FCFb2.js', 'remix.js'].includes(file.path)) {
            const originalPath = text.match(/"M19\.556 4\.74023[^"\n]+"/g);
            if (originalPath?.length !== 1) throw new Error(`Supplied embedded mark anchor changed: ${file.path}`);
            brandEdits.push(
              { find: originalPath[0], replace: JSON.stringify(mark.paths[0]) },
              { find: '"4.74 4.74 29.63 30.52"', replace: '"0 0 1024 1024"' },
            );
            if (file.path === 'remix.js') {
              const original = text.match(/function A\(\) \{[\s\S]*?\n\}/g);
              if (original?.length !== 1) throw new Error('Supplied remix mark constructor changed');
              brandEdits.push({ find: original[0], replace: `function A() {
  const e = document.createElementNS(g, "svg");
  e.setAttribute("width", "16"), e.setAttribute("height", "16"), e.setAttribute("viewBox", q), e.setAttribute("aria-hidden", "true"), e.setAttribute("focusable", "false");
  const defs = document.createElementNS(g, "defs"), clip = document.createElementNS(g, "clipPath"), rect = document.createElementNS(g, "rect"), group = document.createElementNS(g, "g");
  clip.setAttribute("id", ${JSON.stringify(mark.clipId)});
  rect.setAttribute("width", ${JSON.stringify(String(mark.clipWidth))}), rect.setAttribute("height", ${JSON.stringify(String(mark.clipHeight))});
  clip.append(rect), defs.append(clip);
  group.setAttribute("transform", ${JSON.stringify(mark.transform)}), group.setAttribute("clip-path", ${JSON.stringify(`url(#${mark.clipId})`)});
  for (const d of [M, ${JSON.stringify(mark.paths[1])}]) {
    const path = document.createElementNS(g, "path");
    path.setAttribute("fill", "currentColor"), path.setAttribute("d", d), group.append(path);
  }
  return e.append(defs, group), e;
}` });
            } else {
              brandEdits.push({
                find: 'children:(0,p.jsx)("path",{clipRule:"evenodd",d:Sp,fill:"currentColor",fillRule:"evenodd"})',
                replace: `children:${auxMarkReactChildren('p', mark, 1)}`,
              });
            }
          }
          for (const edit of brandEdits) {
            const anchor = { kind: 'branding', ...edit, count: 1 };
            text = apply(text, anchor);
            anchors.push(anchor);
          }
          if (/^icons\/brand-embossed-(light|dark)\.svg$/.test(file.path)) {
            const dark = file.path.includes('dark');
            const anchor = {
              kind: 'branding',
              find: text,
              replace: auxMarkSvg(
                mark,
                dark ? '#fff' : '#0A0A0A',
                dark ? 0.22 : 0.16,
              ),
              count: 1,
            };
            text = apply(text, anchor);
            anchors.push(anchor);
          }
          if (postIdentityTransformText) {
            const result = await postIdentityTransformText({component, path: file.path, text});
            let replayed = text;
            for (const anchor of result.anchors) replayed = apply(replayed, anchor);
            if (replayed !== result.text)
              throw Error(`Unreported post-identity transformation: ${component}/${file.path}`);
            text = replayed;
            anchors.push(...result.anchors);
          }
          output = Buffer.from(text);
        }
        if (
          /^icons\/(?:icon-?\d+|favicon-(?:dark|light))\.png$/.test(file.path)
        ) {
          const width = source.readUInt32BE(16),
            height = source.readUInt32BE(20);
          if (width !== height || ![16, 32, 48, 128].includes(width))
            throw new Error(
              `Unrecognized branding icon geometry: ${file.path}`,
            );
          output = await readFile(
            width === 48
              ? join(repository, 'vendor/provided-ui/branding/icon48.png')
              : join(
                  repository,
                  `assets/brand/Aux.iconset/icon_${width}x${width}.png`,
                ),
          );
          changeKinds.push('branding');
        }
        const relocation = stateIdentityVersion === 2 ? relocateAuxAssetPath({component, path: file.path, bytes: output, reviewedReplacements}) : null;
        if (relocation) path = relocation.path.replaceAll('Aside', 'Aux');
        if (outputPaths.has(path)) throw Error(`Renamed supplied UI path collision: ${path}`);
        outputPaths.add(path);
        if (brandingReplacement) changeKinds.push('branding');
        changeKinds.push(...anchors.map((anchor) => anchor.kind));
        if (path !== file.path) changeKinds.push('identity');
        const target = join(temporary, component, path);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, output, { mode: 0o644 });
        files.push({
          path,
          ...(path !== file.path ? { sourcePath: file.path } : {}),
          sourceSha256: file.sourceSha256,
          outputSha256: sha256(output),
          changeKinds: [...new Set(changeKinds)],
          ...(anchors.length ? { anchors } : {}),
          ...(relocation?.anchors.length ? {assetRelocation: relocation.anchors} : {}),
          ...(brandingReplacement ? {brandingReplacement} : {}),
        });
      }
      let recoveryEnrollment;
      if (component === 'agent' && stateIdentityVersion === 2) {
        const generated = await providedRecoveryEnrollmentUiResources(stateIdentityVersion);
        for (const file of generated.files) {
          if (outputPaths.has(file.path)) throw Error('Generated enrollment UI asset collides with original input');
          outputPaths.add(file.path);
          const target = join(temporary, component, file.path);
          await mkdir(dirname(target), {recursive: true});
          await writeFile(target, file.bytes, {mode: file.mode});
          files.push({path: file.path, sourceSha256: file.sourceSha256, repositorySource: file.repositorySource,
            outputSha256: sha256(file.bytes), outputMode: file.mode, bytes: file.bytes.length,
            generatedBy: file.generatedBy, added: true, changeKinds: ['integration']});
        }
        recoveryEnrollment = generated.manifest;
      }
      if (component === 'agent') {
        const manifestPath = join(temporary, component, 'manifest.json');
        const revisions = JSON.parse(await readFile(join(repository, 'vendor/provided/agent-revisions.json'), 'utf8'));
        if (!revisions.length || revisions.some((r, i) => r.revision !== i + 1)) throw new Error('Agent revision ledger must be consecutive');
        const revised = reviseAgentManifest({manifestText: await readFile(manifestPath, 'utf8'), files, review: revisions.filter(review => review.profile === cloudProfile && (review.featureProfile ?? "baseline") === featureProfile && (review.identityProfile ?? 'compatibility') === identityProfile && (review.stateIdentityVersion ?? 1) === stateIdentityVersion).at(-1)});
        const entry = files.find(f => f.path === 'manifest.json');
        entry.anchors = [...(entry.anchors ?? []), revised.anchor];
        entry.changeKinds = [...new Set([...entry.changeKinds, 'integration'])];
        entry.outputSha256 = revised.outputSha256;
        await writeFile(manifestPath, revised.text);
        if (stateIdentityVersion === 2) {
          const callers = [];
          for (const path of ['background.js', 'assets/strip-markdown-DRcmtuJc.js']) {
            callers.push({path, original: originOriginals.get(path), text: await readFile(join(temporary, component, path), 'utf8')});
          }
          originPairing = assertAuxUiOriginPairing({manifestText: revised.text, manifestOriginal: originOriginals.get('manifest.json'), callers}, originCloudOptions);
        }
      }
      report.components[component] = {
        sourceVersion: input.sourceVersion,
        inputRoot: input.inputRoot,
        outputRoot: join(destination, component),
        files,
        ...(originPairing ? {originPairing} : {}),
        ...(recoveryEnrollment ? {recoveryEnrollment} : {}),
      };
    }
    await writeFile(
      join(temporary, 'manifest.json'),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    await rename(temporary, destination);
    return report;
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}
