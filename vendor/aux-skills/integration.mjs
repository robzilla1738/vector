/** Aux's own built-in skills (docs/plans/2026-10-29-browser-excellence.md, Batch 10 item 2).
 * builtin/ mirrors the sealed static/skills/builtin tree: every supplied Markdown file has a
 * rewrite at the same path, and each SKILL.md keeps the supplied front matter byte for byte
 * (after the release's icon-host package edit), so the daemon's loader sees the same names,
 * descriptions, icons, autoInject rules, gates and flags. scripts/release/transforms.mjs swaps
 * them in; LICENSE.txt and scripts/ in the sealed tree are left as they are. */
import {readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

/** Inside the daemon's Resources folder. */
export const BUILTIN_SKILLS_DIR = 'static/skills/builtin';

const SOURCE = new URL('./builtin/', import.meta.url);
// The daemon's own pattern (FRONTMATTER_PATTERN in aux-native-entry.mjs).
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const markdownFiles = dir => readdirSync(dir, {recursive: true}).filter(file => file.endsWith('.md')).map(String).sort();

/** Icons the skills name, shipped in the extension (decision 10), so a skill shows offline and no
 * hosted site is involved. Every extension page resolves `/builtin-skills/...` against itself. */
const ICON = /^icon: "\/builtin-skills\/v1\/([^"]+)"$/m;

/** Relative paths of our Markdown files (SKILL.md and the reference pages beside them). */
export const SKILL_FILES = Object.freeze(markdownFiles(SOURCE));

export const SKILL_ICONS = Object.freeze([...new Set(SKILL_FILES.filter(file => path.basename(file) === 'SKILL.md')
  .flatMap(file => readFileSync(new URL(file, SOURCE), 'utf8').match(ICON)?.[1] ?? []))].sort());

export const frontMatter = text => text.match(FRONT_MATTER)?.[1] ?? null;

/** Throws unless the staged tree holds exactly our set of Markdown files: nothing missing, nothing extra. */
export function assertSameSkillFiles(stagedDir) {
  const staged = markdownFiles(stagedDir);
  const missing = staged.filter(file => !SKILL_FILES.includes(file));
  const extra = SKILL_FILES.filter(file => !staged.includes(file));
  if (missing.length || extra.length)
    throw new Error(`built-in skills drifted: no rewrite for [${missing}], no supplied file for [${extra}]`);
}

/** Our text for one staged file; a SKILL.md whose front matter differs from ours stops the release. */
export function replaceSkillFile(relative, staged) {
  const ours = readFileSync(new URL(relative, SOURCE), 'utf8');
  if (path.basename(relative) === 'SKILL.md' && frontMatter(ours) !== frontMatter(staged))
    throw new Error(`built-in skill ${relative}: front matter differs from the supplied file`);
  return ours;
}
