import { readAuxMark, auxMarkReactChildren, auxMarkSvg } from './aux-mark.mjs';
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
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const extensionId = (key) =>
  createHash('sha256')
    .update(Buffer.from(key, 'base64'))
    .digest('hex')
    .slice(0, 32)
    .replace(/[0-9a-f]/g, (digit) =>
      String.fromCharCode(97 + Number.parseInt(digit, 16)),
    );

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
}) {
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
  const report = { version: 1, components: {} };
  const mark = await readAuxMark();
  const temporary = await mkdtemp(join(dirname(destination), '.provided-ui-'));
  try {
    for (const component of ['agent', 'vault']) {
      const input = actual.components[component];
      const files = [];
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
        const path = file.path.replaceAll('Aside', 'Aux');
        if (outputPaths.has(path))
          throw new Error(`Renamed supplied UI path collision: ${path}`);
        outputPaths.add(path);
        let output = source;
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
        });
      }
      report.components[component] = {
        sourceVersion: input.sourceVersion,
        inputRoot: input.inputRoot,
        outputRoot: join(destination, component),
        files,
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
