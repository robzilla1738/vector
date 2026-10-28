#!/usr/bin/env python3
"""Build count-checked checkout edits for Aux's Chromium strings and their translations.

Inputs live in docs/integration/proposed/completion-20261026/native/strings-a1/:
  part-a.json            English rewording decisions for upstream messages
  aux-literals.json      new IDS_AUX_* messages (chrome/app/aux_strings.grdp) and the C++ literals they replace
  translations/<l>.json  hand translations, keyed by message name, in .xtb inner form

Commands:
  build    write edits/*.json and translation-requests.json (nothing in the checkout changes)
  check    after the edits are applied: fail if any Aux-changed message lacks a launch-locale
           translation (the "missing launch-language string" build check)
  validate check translations/<l>.json against translation-requests.json (keys, placeholders, XML)

Message IDs come from grit itself (tools/grit in the checkout, imported read-only with
bytecode writing disabled). Upstream text is read with `git show HEAD:<path>` without locks.
"""
import argparse
import io
import json
import os
import re
import subprocess
import sys
from functools import cache
from pathlib import Path

sys.dont_write_bytecode = True
REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / 'scripts'))
from aux_chromium import chromium_src  # noqa: E402

SRC = chromium_src()
sys.path.insert(0, str(SRC / 'tools/grit'))
from grit import grd_reader  # noqa: E402
from grit.node import message as grit_message  # noqa: E402

DATA = REPO / 'docs/integration/proposed/completion-20261026/native/strings-a1'
LOCALES = ['es', 'fr', 'de', 'pt-BR', 'it', 'ja', 'ko', 'zh-CN', 'zh-TW']
STRING_DIRS = ['chrome', 'components', 'extensions', 'ui', 'content', 'device', 'services', 'third_party/blink/public']
AUX_GRDP = 'chrome/app/aux_strings.grdp'
AUX_GRDP_ANCHOR = '      <!-- Bookmarks specific strings -->\n      <part file="bookmarks_strings.grdp" />\n'
L10N_INCLUDE = '#include "ui/base/l10n/l10n_util.h"'
GRIT_INCLUDE = '#include "chrome/grit/generated_resources.h"'
U_LITERAL = re.compile(r'(?<![A-Za-z0-9_])u"((?:[^"\\\n]|\\.)*)"')
MESSAGE_RE = r'<message\s[^>]*?name\s*=\s*"{}"[^>]*>.*?</message>'
NAME_RE = r'<message\s[^>]*?name\s*=\s*"(IDS_[A-Z0-9_]+)"'
TRANSLATION_RE = re.compile(r'<translation id="(\d+)"((?: [a-z_]+="[^"]*")*)>(.*?)</translation>', re.S)

# Product names that stay: proper names of Google services and legal credits.
PROPER = re.compile(r'Chrome Web ?Store|Chrome Root (?:Store|Program)|Chrome ?OS|Chrome Apps?\b|Chrome Enterprise|'
                       r'Chrome Dino|Chrome for Testing|Chrome Browser Cloud|Chromium Authors|Chromium open source', re.I)
# Also kept: link placeholders named for Chromium, the linked word "Chromium", and translator examples.
PROTECTED = re.compile(PROPER.pattern + r'|<ph name="[A-Z_]*CHROMIUM[A-Z_]*"\s*/?>|>Chromium<|<ex>.*?</ex>', re.I | re.S)
TOKEN = re.compile(r'(?<![A-Za-z])(?:Google Chrome|ChromiumOS|Chromium|Chrome)(?![A-Za-z])')
KO_PARTICLES = [('을', '를'), ('은', '는'), ('과', '와'), ('으로', '로'), ('이나', '나'), ('이라는', '라는'), ('이(?=[\\s.,)!?]|$)', '가')]
FR_ELISION = [(r'\b([Dd])e Aux\b', r"\1'Aux"), (r'\b([Dd])u Aux\b', r"\1'Aux"), (r'\b([Qq])ue Aux\b', r"\1u'Aux"),
              (r'\b([Ll])e Aux\b', r"\1'Aux"), (r'\b([Nn])e Aux\b', r"\1'Aux")]


def git_show(rel):
    result = subprocess.run(['git', '--no-optional-locks', '-C', str(SRC), 'show', f'HEAD:{rel}'],
                            capture_output=True, env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'})
    return result.stdout.decode('utf-8') if result.returncode == 0 else None


@cache
def read(rel):
    path = SRC / rel
    return path.read_bytes().decode('utf-8') if path.is_file() else None


@cache
def upstream(rel):
    return git_show(rel)


@cache
def message_files():
    out = subprocess.run(['rg', '-o', '--no-heading', '-N', r'name\s*=\s*"(IDS_[A-Z0-9_]+)"', '-r', '$1',
                          '-g', '*.grd', '-g', '*.grdp', *STRING_DIRS], cwd=SRC, capture_output=True, text=True).stdout
    index = {}
    for line in out.splitlines():
        rel, name = line.rsplit(':', 1)
        index.setdefault(name, set()).add(rel)
    return index


@cache
def grd_of():
    """Maps every .grd/.grdp to the .grd that owns it."""
    owners = {}
    out = subprocess.run(['rg', '-l', '<translations>', '-g', '*.grd', *STRING_DIRS], cwd=SRC, capture_output=True, text=True).stdout
    for grd in out.split():
        stack = [grd]
        while stack:
            rel = stack.pop()
            owners[rel] = grd
            for part in re.findall(r'<part file="([^"]+)"', read(rel) or ''):
                stack.append(os.path.normpath(os.path.join(os.path.dirname(rel), part)))
    return owners


@cache
def xtb_paths(grd):
    text = read(grd)
    files = dict((lang, path) for path, lang in re.findall(r'<file path="([^"]+\.xtb)" lang="([^"]+)"', text))
    return {lang: os.path.normpath(os.path.join(os.path.dirname(grd), files[lang])) for lang in LOCALES if lang in files}


@cache
def xtb(rel):
    entries = {}
    for tid, attrs, body in TRANSLATION_RE.findall(read(rel) or ''):
        entries.setdefault(tid, []).append((attrs, body))
    return entries


def message_id(element):
    grd = ('<?xml version="1.0" encoding="UTF-8"?><grit latest_public_release="0" current_release="1">'
           f'<release seq="1"><messages fallback_to_english="true">{element}</messages></release></grit>')
    root = grd_reader.Parse(io.StringIO(grd), dir='.', defines={}, debug=False)
    node = next(n for n in root.ActiveDescendants() if isinstance(n, grit_message.MessageNode))
    if node.attrs.get('translateable') == 'false':
        return None
    return node.GetCliques()[0].GetMessage().GetId()


def elements(text, name):
    return re.findall(MESSAGE_RE.format(re.escape(name)), text or '', re.S)


def inner(element):
    return element[element.index('>') + 1:element.rindex('</message>')]


def swap_product(text):
    """Replaces Chrome/Chromium product names outside protected proper names. Returns (text, count)."""
    spans = [m.span() for m in PROTECTED.finditer(text)]
    count = 0

    def sub(m):
        nonlocal count
        if any(a <= m.start() < b for a, b in spans):
            return m.group(0)
        count += 1
        return 'AuxOS' if m.group(0) == 'ChromiumOS' else 'Aux'
    return TOKEN.sub(sub, text), count


def fix_grammar(lang, text):
    if lang == 'ko':
        for old, new in KO_PARTICLES:
            text = re.sub('Aux' + old, 'Aux' + new, text)
    if lang == 'fr':
        for old, new in FR_ELISION:
            text = re.sub(old, new, text)
    return text


def apply_ops(text, ops):
    """Applies decision ops to an English inner text."""
    for op in ops:
        if op == 'swap':
            text = swap_product(text)[0]
        else:
            old, new = op[:2]
            if old not in text:
                raise ValueError(f'{old!r} not in message')
            text = text.replace(old, new)
    return text


def norm(text):
    """Message text without translator examples, which do not reach the message ID."""
    return None if text is None else re.sub(r'<ex>.*?</ex>', '', text, flags=re.S)


def safe_apply(text, ops):
    try:
        return apply_ops(text, ops)
    except ValueError:
        return None


def translate_mechanically(lang, ops, english_before, translation):
    """Mirrors ops onto an upstream translation, or returns None when a person must translate."""
    for op in ops:
        if op == 'swap':
            if PROPER.search(norm(english_before)) or 'Gemini' in norm(english_before):
                return None
            n_en = swap_product(english_before)[1]
            new, n_tr = swap_product(translation)
            if n_en != n_tr or n_en == 0:
                return None
            translation, english_before = fix_grammar(lang, new), swap_product(english_before)[0]
        elif len(op) == 3:  # [old, new, "en"]: an English-only fix such as "a Aux" -> "an Aux"
            english_before = english_before.replace(op[0], op[1])
        else:
            old, new = op
            if translation.count(old) != 1:
                return None
            translation, english_before = translation.replace(old, new), english_before.replace(old, new)
    return translation


def google_branded(text, element):
    """True when the element only builds for Google Chrome branding (inside <if expr="_google_chrome ...">)."""
    stack = []
    for tag in re.finditer(r'<if expr="([^"]*)">|</if>', text[:text.index(element)]):
        if tag.group(0) == '</if>':
            stack.pop()
        else:
            stack.append(tag.group(1))
    return any(re.search(r'(?<!not )\b_google_chrome\b', expr) and 'not _google_chrome' not in expr for expr in stack)


def locate(name):
    # Google Chrome-branded string files are not built into Aux.
    files = sorted(f for f in message_files().get(name, ()) if 'google_chrome' not in f)
    hits = [(rel, el) for rel in files for el in elements(read(rel), name)]
    if not hits:
        raise SystemExit(f'{name}: not found in the checkout')
    return hits


def build(args):
    decisions = json.loads((DATA / 'part-a.json').read_text())
    manual = {lang: json.loads(p.read_text()) if (p := DATA / f'translations/{lang}.json').exists() else {} for lang in LOCALES}
    english_edits, xtb_additions, requests, mechanical, touched = [], {}, {}, 0, set()
    changed = {}  # (file, name, final element)

    for name, decision in decisions['messages'].items():
        if 'skip' in decision:
            continue
        hits = [(rel, element, new_body) for rel, element in locate(name)
                if not google_branded(read(rel), element)
                and (new_body := safe_apply(inner(element), decision['ops'])) not in (None, inner(element))]
        if not hits:
            raise SystemExit(f'{name}: decision changes nothing')
        for rel, element, new_body in hits:
            final = element.replace(inner(element), new_body)
            edit = {'path': rel, 'find': element, 'replace': final, 'count': read(rel).count(element)}
            if edit not in english_edits:  # identical elements in two #if branches: one edit covers both
                english_edits.append(edit)
            changed[(rel, name, final)] = True
            touched.add((rel, element))

    # Earlier Aux sweeps changed messages in these files without translations.
    for rel in decisions['swept_files']:
        base = upstream(rel) or ''
        for name in set(re.findall(NAME_RE, read(rel))):
            for element in elements(read(rel), name):
                if element not in base and (rel, element) not in touched:
                    changed[(rel, name, element)] = True

    for rel, name, final in sorted(changed):
        grd = grd_of().get(rel)
        if not grd:
            raise SystemExit(f'{rel}: no owning .grd')
        new_id = message_id(final)
        if new_id is None:
            continue
        ops = decisions['messages'].get(name, {}).get('ops', [])
        old_element, chain = None, None
        candidates = [e for e in elements(upstream(rel), name) if message_id(e) is not None]
        for element in candidates:
            chain = next((c for c in (ops, ['swap', *ops], ['swap']) if c and norm(safe_apply(inner(element), c)) == norm(inner(final))), None)
            if chain:
                old_element = element
                break
        if not old_element and candidates:
            current = elements(read(rel), name)
            index = current.index(final) if final in current else 0
            old_element = candidates[min(index, len(candidates) - 1)]
        old_id = message_id(old_element) if old_element else None
        for lang, path in xtb_paths(grd).items():
            if new_id in xtb(path) or new_id in xtb_additions.get(path, {}):
                continue
            key = f'{name}@{new_id}'
            refs = xtb(path).get(old_id, []) if old_id else []
            done = [(attrs, t) for attrs, body in refs if chain and (t := translate_mechanically(lang, chain, inner(old_element), body))]
            if refs and len(done) == len(refs):
                xtb_additions.setdefault(path, {})[new_id] = done
                mechanical += 1
                continue
            entry = requests.setdefault(key, {'grd': grd, 'english': inner(final).strip(),
                                               'upstream_english': inner(old_element).strip() if old_element else None,
                                               'reference': {}, 'missing': []})
            entry['missing'].append(lang)
            if refs:
                entry['reference'][lang] = refs[0][1]
            if key in manual[lang]:
                xtb_additions.setdefault(path, {})[new_id] = [('', manual[lang][key])]

    aux = json.loads((DATA / 'aux-literals.json').read_text()) if (DATA / 'aux-literals.json').exists() else None
    aux_messages = aux['messages'] if aux else []
    code_edits = literal_edits(aux) if aux else []
    if aux:
        english_edits += aux_grdp_edits(aux_messages)
        generated = xtb_paths('chrome/app/generated_resources.grd')
        for msg in aux_messages:
            new_id = message_id(aux_element(msg))
            for lang, path in generated.items():
                if new_id in xtb(path) or new_id in xtb_additions.get(path, {}):
                    continue
                if not msg.get('meaning') and (memory := translation_memory(lang, new_id)):
                    xtb_additions.setdefault(path, {})[new_id] = [('', memory)]
                    mechanical += 1
                    continue
                requests.setdefault(msg['name'], {'grd': 'chrome/app/generated_resources.grd', 'english': msg['text'],
                                                  'desc': msg['desc'], 'meaning': msg.get('meaning'), 'reference': {}, 'missing': []})['missing'].append(lang)
                if msg['name'] in manual[lang]:
                    xtb_additions.setdefault(path, {})[new_id] = [('', manual[lang][msg['name']])]

    xtb_edits = []
    for path, entries in sorted(xtb_additions.items()):
        lines = ''.join(f'<translation id="{tid}"{attrs}>{body}</translation>\n' for tid, variants in sorted(entries.items()) for attrs, body in variants)
        xtb_edits.append({'path': path, 'find': '</translationbundle>', 'replace': lines + '</translationbundle>', 'count': 1})

    out = DATA / 'edits'
    out.mkdir(exist_ok=True)
    for file, edits in [('01-english.json', english_edits), ('02-code.json', code_edits), ('03-xtb.json', xtb_edits)]:
        (out / file).write_text(json.dumps(edits, ensure_ascii=False, indent=1) + '\n')
    (DATA / 'translation-requests.json').write_text(json.dumps(requests, ensure_ascii=False, indent=1) + '\n')
    per_locale = {lang: sum(1 for p, e in xtb_additions.items() if f'_{lang}.xtb' in p for _ in e) for lang in LOCALES}
    summary = {'english_edits': len(english_edits), 'reworded_messages': sum(1 for d in decisions['messages'].values() if 'skip' not in d),
               'skipped_messages': sum(1 for d in decisions['messages'].values() if 'skip' in d), 'aux_messages': len(aux_messages),
               'code_edits': len(code_edits), 'xtb_files': len(xtb_edits), 'translations_per_locale': per_locale,
               'mechanical_translations': mechanical, 'manual_translation_requests': len(requests),
               'manual_translations_missing': sum(1 for key, e in requests.items() for lang in e['missing'] if key not in manual[lang])}
    (DATA / 'summary.json').write_text(json.dumps(summary, indent=1) + '\n')
    print(json.dumps(summary, indent=1))
    problems = validate(argparse.Namespace(locales=[]))
    return 0 if args.allow_missing or not problems else 1


def aux_element(msg):
    meaning = f' meaning="{msg["meaning"]}"' if msg.get('meaning') else ''
    desc = msg['desc'].replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    return f'<message name="{msg["name"]}"{meaning} desc="{desc}">\n    {msg["text"]}\n  </message>'


def aux_grdp_edits(messages):
    body = ''.join(f'  {aux_element(m)}\n' for m in messages)
    grdp = ('<?xml version="1.0" encoding="utf-8"?>\n'
            '<!-- Aux-owned native UI strings. Translations: resources/generated_resources_<lang>.xtb. -->\n'
            f'<grit-part>\n{body}</grit-part>\n')
    grd = 'chrome/app/generated_resources.grd'
    if read(grd).count(AUX_GRDP_ANCHOR) != 1:
        raise SystemExit(f'{grd}: include anchor drifted')
    return [{'path': AUX_GRDP, 'create': grdp},
            {'path': grd, 'find': AUX_GRDP_ANCHOR, 'count': 1,
             'replace': '      <!-- Aux-owned native UI strings -->\n      <part file="aux_strings.grdp" />\n\n' + AUX_GRDP_ANCHOR}]


@cache
def all_xtbs(lang):
    out = subprocess.run(['rg', '--files', '-g', f'*_{lang}.xtb', *STRING_DIRS], cwd=SRC, capture_output=True, text=True).stdout
    return sorted(out.split())


def translation_memory(lang, message_id):
    """An existing translation of identical English text anywhere in Chromium."""
    for path in all_xtbs(lang):
        if refs := xtb(path).get(message_id):
            return refs[0][1]
    return None


def literal_edits(aux):
    """Count-checked C++ edits: hand-written specials first, then every mapped u"" literal (adjacent pieces joined)."""
    sys.path.insert(0, str(REPO / 'scripts/candidate'))
    from apply_checkout_edits import plan
    edits = []
    for special in aux['special']:
        edits.append({'path': special['path'], 'find': special['find'], 'replace': special['replace'], 'count': special.get('count', 1)})
    icons = {icon: 'IDS_AUX_PROFILE_ICON_' + icon.upper().replace(' ', '_') for icon in aux['icons']}
    files = sorted({e['path'] for e in edits} | set(aux.get('files', [])) | {aux['icon_file']} | literal_files(aux['literals']))
    used = set()
    for rel in files:
        text = plan(SRC, [e for e in edits if e['path'] == rel]).get(SRC / rel, read(rel)) if any(e['path'] == rel for e in edits) else read(rel)
        mapping = icons if rel == aux['icon_file'] else aux['literals']
        groups = {}
        for start, end, raw in literal_groups(text):
            if raw in mapping:
                groups[text[start:end]] = mapping[raw]
                used.add(raw)
        for find, name in sorted(groups.items(), key=lambda kv: -len(kv[0])):
            # Icon labels become bare IDs in a table; the comma keeps BOOK from matching BOOKMARK.
            find, replace = (find + ',', name + ',') if rel == aux['icon_file'] else (find, f'l10n_util::GetStringUTF16({name})')
            edits.append({'path': rel, 'find': find, 'replace': replace, 'count': text.count(find)})
            text = text.replace(find, replace)
        edits += include_edits(rel, text)
    unused = set(aux['literals']) - used
    if unused:
        raise SystemExit(f'mapped literals not found: {sorted(unused)}')
    plan(SRC, edits)  # every count must hold in order
    return edits


def literal_files(literals):
    """Aux-owned views files (manifest) that contain a mapped literal."""
    manifest = json.loads((REPO / 'chromium/tree/manifest.json').read_text())['files']
    files = [f for f in manifest if (f.startswith('chrome/browser/ui/views/') and f.endswith(('.cc', '.mm')))
             or f == 'chrome/browser/chrome_browser_main.cc']
    return {f for f in files if read(f) and any(raw in literals for _, _, raw in literal_groups(read(f)))}


def literal_groups(text):
    """Yields (start, end, joined raw text) for runs of adjacent u"" literals outside comments."""
    code = re.sub(r'//[^\n]*|/\*.*?\*/', lambda m: ' ' * len(m.group(0)), text, flags=re.S)
    run = None
    for m in U_LITERAL.finditer(code):
        if run and not code[run[1]:m.start()].strip():
            run = (run[0], m.end(), run[2] + m.group(1))
            continue
        if run:
            yield run
        run = (m.start(), m.end(), m.group(1))
    if run:
        yield run


def conditional(text, offset):
    """True when offset sits inside an #if block (an include guard does not count)."""
    depth = 0
    for directive in re.findall(r'^\s*#\s*(if|ifdef|ifndef|endif)\b(.*)$', text[:offset], re.M):
        if directive[0] == 'endif':
            depth -= 1
        elif not (directive[0] == 'ifndef' and directive[1].strip().endswith('_H_')):
            depth += 1
    return depth > 0


def include_edits(rel, text):
    needed = [inc for inc, token in ((GRIT_INCLUDE, 'IDS_AUX_'), (L10N_INCLUDE, 'l10n_util::')) if token in text and inc not in text]
    includes = [line for line in re.findall(r'^#include "[^"]+"$', text, re.M)
                if text.count(line + '\n') == 1 and not conditional(text, text.index(line + '\n'))]
    edits = []
    for inc in needed:
        later = [line for line in includes[1:] if line > inc]
        if later:
            edits.append({'path': rel, 'find': later[0] + '\n', 'replace': inc + '\n' + later[0] + '\n', 'count': 1})
        else:
            edits.append({'path': rel, 'find': includes[-1] + '\n', 'replace': includes[-1] + '\n' + inc + '\n', 'count': 1})
        includes = includes[:1] + sorted(includes[1:] + [inc])
    return edits


def check(args):
    """Every message that differs from upstream (or is Aux-only) must have all launch-locale translations."""
    decisions = json.loads((DATA / 'part-a.json').read_text())
    files = set(decisions['swept_files']) | {rel for name, d in decisions['messages'].items() if 'skip' not in d for rel, _ in locate(name)}
    if read(AUX_GRDP):
        files.add(AUX_GRDP)
        grd_of()[AUX_GRDP] = 'chrome/app/generated_resources.grd'
    missing = []
    for rel in sorted(files):
        base = upstream(rel) or ''
        for name in re.findall(NAME_RE, read(rel)):
            for element in elements(read(rel), name):
                if element in base or (new_id := message_id(element)) is None:
                    continue
                for lang, path in xtb_paths(grd_of()[rel]).items():
                    if new_id not in xtb(path):
                        missing.append(f'{name} [{lang}]')
    print('\n'.join(missing) or 'every Aux-changed message has all launch-locale translations')
    return 1 if missing else 0


PH = re.compile(r'<ph name="([A-Z0-9_]+)"')


def translation_problems(english, translation):
    """Placeholders must match the English message exactly, and the text must be well-formed .xtb XML."""
    import xml.etree.ElementTree as ElementTree
    problems = []
    if sorted(PH.findall(english)) != sorted(PH.findall(translation)) and '{' not in english:
        problems.append(f'placeholders {sorted(set(PH.findall(english)))} != {sorted(set(PH.findall(translation)))}')
    elif set(PH.findall(english)) != set(PH.findall(translation)):
        problems.append('placeholder names differ')
    if re.search(r'<ph name="[A-Z0-9_]+">', translation):
        problems.append('placeholders must be empty elements: <ph name="NAME" />')
    try:
        ElementTree.fromstring(f'<t>{translation}</t>')
    except ElementTree.ParseError as error:
        problems.append(f'not well-formed: {error}')
    if not translation.strip():
        problems.append('empty')
    return problems


def validate(args):
    requests = json.loads((DATA / 'translation-requests.json').read_text())
    failures = 0
    for lang in args.locales or LOCALES:
        path = DATA / f'translations/{lang}.json'
        done = json.loads(path.read_text()) if path.exists() else {}
        wanted = {key for key, entry in requests.items() if lang in entry['missing']}
        for key in sorted(wanted - set(done)):
            print(f'{lang} missing {key}'); failures += 1
        for key, text in done.items():
            entry = requests.get(key)
            if entry is None:
                continue
            for problem in translation_problems(entry['english'], text):
                print(f'{lang} {key}: {problem}'); failures += 1
    print('ok' if not failures else f'{failures} problems')
    return 1 if failures else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('command', choices=['build', 'check', 'validate'])
    parser.add_argument('locales', nargs='*', help='validate: locales to check (default: all)')
    parser.add_argument('--allow-missing', action='store_true', help='build even when translations are still requested')
    args = parser.parse_args()
    return {'build': build, 'check': check, 'validate': validate}[args.command](args)


if __name__ == '__main__':
    sys.exit(main())
