/** The file tools: read_file, write_file, edit_file, rg and fd. Paths, permissions, the broker
 * boundary and ripgrep itself stay the supplied ones; each tool here decides what to read or write
 * and what the model is told. */
import {constants} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {EDIT_FILE, FD, OVERWRITE_FILE, READ_FILE, RG, WRITE_FILE} from './prompts.mjs';
import {FD_DEFAULT_LIMIT, FD_MAX_DEPTH, FD_MAX_LIMIT, RG_DEFAULT_COUNT, RG_MAX_CONTEXT, RG_MAX_COUNT, toolSchemas} from './schemas.mjs';
import {pathInside, reply, text} from './common.mjs';

const OFFICE_SKILLS = new Map([['.docx', 'docx'], ['.pptx', 'pptx'], ['.xlsx', 'xlsx'], ['.xlsm', 'xlsx']]);
const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);
const MAX_FILE_SIZE_BYTES = 262144, SKILL_FRONTMATTER_SCAN_LINES = 6;
const clamp = (value, low, high) => Math.min(Math.max(value, low), high);

export function create({typebox, tools: t}) {
  const schemas = toolSchemas(typebox);

  /** The file's text and line counts for `start`/`limit`; a PDF's is its extracted pages. */
  async function selectLines(file, extracted, start, limit) {
    if (extracted === undefined) return t.readFileInRange(file, start, limit);
    const lines = extracted.split('\n'), chosen = lines.slice(start, limit === undefined ? undefined : start + limit);
    return {content: chosen.join('\n'), lineCount: chosen.length, totalLines: lines.length};
  }

  async function readImage(file, mime, converted, autoResizeImages) {
    const bytes = await t.selectedReadFileBytes(file);
    if (converted) await fs.rm(converted, {force: true});
    const data = t.Buffer.from(bytes).toString('base64'), label = converted ? 'Converted HEIC image' : 'Read image file';
    if (!autoResizeImages) return {content: [text(`${label} [${mime}]`), {type: 'image', data, mimeType: mime}], details: {}};
    const resized = await t.resizeImage({data, mediaType: mime}), note = t.formatDimensionNote(resized);
    return {content: [text(`${label} [${resized.mediaType}]${note ? `\n${note}` : ''}`), {type: 'image', data: resized.data, mimeType: resized.mediaType}], details: {}};
  }

  /** The PNG a HEIC file converts to, or the failure the model is told about. */
  async function convertHeic(context, file) {
    const converted = path.join(t.ensureSessionTmpDir(context.sessionDir ?? context.session.cwd), `read-file-${t.nanoid()}.png`), icon = `${converted}.icon.png`;
    const result = await t.readFileUtility('generate-thumbnail', JSON.stringify({filePath: file, iconOutputPath: icon, thumbnailOutputPath: converted}));
    await fs.rm(icon, {force: true});
    if (result.thumbnailGenerated === true) return {converted};
    await fs.rm(converted, {force: true});
    return {failure: reply(`Error: HEIC conversion failed: ${result.error ?? 'no image generated'}`, {})};
  }

  async function skillOf(file) {
    if (path.basename(file) !== 'SKILL.md') return {};
    const head = (await t.readFileInRange(file, 0, SKILL_FRONTMATTER_SCAN_LINES)).content?.split('\n', SKILL_FRONTMATTER_SCAN_LINES).join('\n');
    const skillName = head ? t.parseSkillFrontmatterValue(head, 'name') : undefined, skillIcon = head ? t.parseSkillFrontmatterValue(head, 'icon') : undefined;
    return {...skillName ? {skillName} : {}, ...skillIcon ? {skillIcon} : {}};
  }

  const createReadFileTool = ({context, autoResizeImages = !t.usesBoundBrowserActions()}) => t.registerSelectedReadFileTool(context, {
    name: 'read_file', label: 'Read File', description: READ_FILE, parameters: schemas.readFile,
    execute: async (id, {path: requested, offset, limit}) => {
      const file = t.resolveFileToolPath(context, requested), stats = await t.selectedReadFileStat(file).catch(() => null);
      if (!stats) return reply(`Error: file not found: ${requested}`, {});
      if (!stats.isFile()) return reply(`Error: not a file: ${requested}`, {});
      const extension = path.extname(file).toLowerCase(), office = OFFICE_SKILLS.get(extension);
      if (office) return reply(`Read the ${office} skill before handling this file.`, {});
      const extracted = extension === '.pdf' ? t.readFilePdfBinding().extractText({filePath: file}).pages
        .map(({page, text: body}) => `--- Page ${page} ---\n${body.replace(/\r\n?/g, '\n')}`).join('\n\n') : undefined;
      let converted;
      if (HEIC_EXTENSIONS.has(extension)) {
        const heic = await convertHeic(context, file);
        if (heic.failure) return heic.failure;
        ({converted} = heic);
      }
      const mime = await t.selectedReadFileMime(converted ?? file);
      if (mime) return readImage(converted ?? file, mime, converted, autoResizeImages);
      if (extracted === undefined && !offset && !limit && stats.size > MAX_FILE_SIZE_BYTES)
        throw Error(`File too large (${t.formatSize(stats.size)}, max ${t.formatSize(MAX_FILE_SIZE_BYTES)}). Use offset/limit to read specific portions, or use bash: head -c ${MAX_FILE_SIZE_BYTES} ${requested}`);
      const start = offset ? Math.max(0, offset - 1) : 0, firstLine = start + 1, selected = await selectLines(file, extracted, start, limit);
      if (selected.lineCount === 0 && start >= selected.totalLines) throw Error(`Offset ${offset} is beyond end of file (${selected.totalLines} lines total)`);
      const skill = await skillOf(file), head = t.truncateHead(selected.content);
      if (head.firstLineExceedsLimit) {
        const size = t.formatSize(t.Buffer.byteLength(selected.content.split('\n')[0] ?? '', 'utf-8'));
        throw Error(extracted === undefined ? `Line ${firstLine} is ${size}, exceeds ${t.formatSize(t.DEFAULT_MAX_BYTES)} limit. Use bash: sed -n '${firstLine}p' ${requested} | head -c ${t.DEFAULT_MAX_BYTES}`
          : `Extracted line ${firstLine} is ${size}, exceeding the output limit.`);
      }
      let output = head.content;
      if (head.truncated) {
        const last = firstLine + head.outputLines - 1, bytes = head.truncatedBy === 'bytes' ? ` (${t.formatSize(t.DEFAULT_MAX_BYTES)} limit)` : '';
        output += `\n\n[Showing lines ${firstLine}-${last} of ${selected.totalLines}${bytes}. Use offset=${last + 1} to continue.]`;
      }
      if (limit !== undefined && start + limit < selected.totalLines)
        output += `\n\n[${selected.totalLines - (start + limit)} more lines in file. Use offset=${start + limit + 1} to continue.]`;
      if (skill.skillName) t.rememberReadSkill(context, skill.skillName, file);
      return reply(output, skill);
    },
  });

  const createWriteFileTool = (context, {overwrite = false} = {}) => ({
    name: 'write_file', label: 'Write File', description: overwrite ? OVERWRITE_FILE : WRITE_FILE, parameters: schemas.writeFile,
    execute: async (id, {file_path: requested, content}) => {
      const file = t.resolveFileToolPath(context, requested), existing = await fs.stat(file).catch(() => null);
      if (existing?.isFile() && !overwrite) throw Error(`Error: file already exists at '${requested}'. cannot overwrite`);
      if (existing && !existing.isFile()) throw Error(`Error: path points to a directory '${requested}'`);
      await t.brokerBoundary().awaited(async () => {
        await fs.mkdir(path.dirname(file), {recursive: true});
        await fs.writeFile(file, content);
      });
      const relative = !existing && typeof context.sessionDir === 'string' ? pathInside(context.sessionDir, file, path) : undefined;
      return reply(`Successfully wrote '${requested}'`, relative ? {filesChanged: [{type: 'created', path: relative}]} : {});
    },
  });

  const createEditFileTool = context => ({
    name: 'edit_file', label: 'Edit File', description: EDIT_FILE, parameters: schemas.editFile,
    execute: async (id, {path: requested, edits, appendText}, signal) => {
      if (edits.length === 0 && appendText === undefined) throw Error('Error: edits cannot be empty unless appendText is provided');
      const file = t.resolveFileToolPath(context, requested);
      signal?.throwIfAborted();
      await fs.access(file, constants.R_OK | constants.W_OK);
      const original = await fs.readFile(file, {encoding: 'utf-8', signal});
      signal?.throwIfAborted();
      const {bom, text: body} = t.stripBom(original), ending = t.detectLineEnding(body);
      const {baseContent, output} = t.applyEdits(t.normalizeToLF(body), edits, appendText, requested), diff = t.diff(baseContent, output);
      await t.brokerBoundary().awaited(() => fs.writeFile(file, bom + t.restoreLineEndings(output, ending), {encoding: 'utf-8', signal}));
      const relative = typeof context.sessionDir === 'string' ? pathInside(context.sessionDir, file, path) : undefined;
      return reply(edits.length > 0 ? `Successfully replaced ${edits.length} block(s) in ${requested}.` : `Successfully appended to ${requested}.`, {
        diff, firstChangedLine: t.getFirstChangedLine(diff), ...relative ? {filesChanged: [{type: 'updated', path: relative, ...t.countChangedDiffLines(diff)}]} : {},
      });
    },
  });

  const caseFlag = sensitive => sensitive === true ? '--case-sensitive' : sensitive === false ? '--ignore-case' : '--smart-case';

  const createRgTool = context => ({
    name: 'rg', label: 'Search Content', description: RG, parameters: schemas.rg,
    execute: async (id, input, signal) => {
      const {cwd, target} = t.searchRoot(context, input.path);
      const found = await t.runRg(context, ['--line-number', '--no-heading', '--with-filename', '--max-columns=500', '--max-columns-preview', caseFlag(input.case_sensitive),
        ...input.fixed_strings ? ['--fixed-strings'] : [], ...input.hidden ? ['--hidden'] : [], ...input.context === undefined ? [] : [`--context=${clamp(input.context, 0, RG_MAX_CONTEXT)}`],
        ...input.glob ? ['--glob', input.glob] : [], ...input.file_type ? ['--type', input.file_type] : [], `--max-count=${clamp(input.limit ?? RG_DEFAULT_COUNT, 1, RG_MAX_COUNT)}`,
        '--regexp', input.pattern], cwd, target, signal);
      const output = found.output.replace(/\n+$/, '');
      if (!output) return reply(`No matches found${found.unread}`, {lines: 0});
      return reply(await t.formatOutput(context, 'rg', output) + found.unread, {lines: output.split('\n').length});
    },
  });

  const createFdTool = context => ({
    name: 'fd', label: 'Find Files', description: FD, parameters: schemas.fd,
    execute: async (id, input, signal) => {
      const {cwd, target} = t.searchRoot(context, input.path);
      const maxDepth = input.max_depth === undefined ? FD_MAX_DEPTH : clamp(input.max_depth, 1, FD_MAX_DEPTH), filesOnly = input.type === 'file' || !!input.extension;
      const list = ['--files', '--sort=path', ...input.hidden ? ['--hidden'] : []];
      const listed = await t.runRg(context, filesOnly ? [...list, `--max-depth=${maxDepth}`] : list, cwd, target, signal);
      const depth = entry => path.relative(target || '.', entry).split(path.sep).length, entries = new Set();
      for (const file of listed.output.split('\n').filter(Boolean)) {
        if (input.type !== 'directory') entries.add(file);
        if (filesOnly) continue;
        for (let parent = path.dirname(file); parent !== '.' && parent !== target && parent !== path.dirname(parent); parent = path.dirname(parent)) entries.add(`${parent}/`);
      }
      const extension = input.extension && `.${input.extension.replace(/^\.+/, '')}`;
      const candidates = [...entries].filter(entry => depth(entry) <= maxDepth && (!extension || entry.replace(/\/$/, '').endsWith(extension)));
      const matched = input.pattern ? await t.matchNames(context, candidates, input.pattern, input.glob, cwd, signal) : candidates;
      const shown = matched.sort().slice(0, clamp(input.limit ?? FD_DEFAULT_LIMIT, 1, FD_MAX_LIMIT));
      if (shown.length === 0) return reply(`No files found${listed.unread}`, {count: 0});
      return reply(await t.formatOutput(context, 'fd', shown.join('\n')) + listed.unread, {count: shown.length});
    },
  });

  return {createReadFileTool, createWriteFileTool, createEditFileTool, createRgTool, createFdTool};
}
