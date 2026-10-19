#!/usr/bin/env python3
"""Stage removal of known-disabled native shell branches in a disposable proof tree."""
import argparse
import difflib
import json
from pathlib import Path
import re
import subprocess

OLD_FLAGS = ('ENABLE_AUX_SHELL', 'ENABLE_AUX_RESULT_SCHEME', 'ENABLE_AUX_ISOLATED_WORLDS')
CPP_LITERALS = re.compile(
    r'R"(?P<delimiter>[^\s()\\]{0,16})\([\s\S]*?\)(?P=delimiter)"'
    r'|"(?:\\[\s\S]|[^"\\])*"|\'(?:\\[\s\S]|[^\'\\])*\''
    r'|/\*[\s\S]*?\*/|//(?:\\\n|[^\n])*'
)
DIRECTIVES = re.compile(r'^[ \t]*#[ \t]*(if|ifdef|ifndef|elif|else|endif)\b([^\n]*)', re.M)
GN_TOKENS = re.compile(r'"(?:\\[\s\S]|[^"\\])*"|#[^\n]*|[A-Za-z_]\w*|&&|\|\||[^\s]')


def mask_literals(text):
    return CPP_LITERALS.sub(lambda match: ''.join('\n' if char == '\n' else ' ' for char in match[0]), text)


def cpp_value(condition):
    value = re.sub(r'\s+', '', condition)
    if value == '!BUILDFLAG(ENABLE_AUX_SHELL)':
        return True
    atoms = value.split('&&')
    if all(re.fullmatch(r'!?BUILDFLAG\([A-Z_]+\)', atom) for atom in atoms):
        if any(atom == f'BUILDFLAG({flag})' for flag in OLD_FLAGS for atom in atoms):
            return False
    raise ValueError(f'Unreviewed preprocessor condition: {condition.strip()}')


def prune_cpp(text):
    while True:
        directives = list(DIRECTIVES.finditer(mask_literals(text)))
        candidates = [i for i, item in enumerate(directives)
                      if item[1] == 'if' and any(flag in item[2] for flag in OLD_FLAGS)]
        if not candidates:
            break
        index = candidates[-1]
        start = directives[index]
        value = cpp_value(start[2])
        depth = 0
        alternative = None
        for end in directives[index + 1:]:
            if end[1] in ('if', 'ifdef', 'ifndef'):
                depth += 1
            elif end[1] == 'endif':
                if depth == 0:
                    break
                depth -= 1
            elif depth == 0 and alternative is None:
                alternative = end
        else:
            raise ValueError('Unterminated native preprocessor block')
        start_end = text.find('\n', start.end()) + 1
        end_end = text.find('\n', end.end()) + 1
        if not start_end or not end_end:
            raise ValueError('Expected newline after native directive')
        if value:
            body = text[start_end:alternative.start() if alternative else end.start()]
        elif alternative is None:
            body = ''
        elif alternative[1] == 'else':
            body = text[text.find('\n', alternative.end()) + 1:end.start()]
        else:
            body = '#if' + alternative[2] + '\n' + text[text.find('\n', alternative.end()) + 1:end_end]
        text = text[:start.start()] + body + text[end_end:]
    # These remaining occurrences are ordinary C++ constant expressions, not directives.
    masked = mask_literals(text)
    spans = []
    for flag in OLD_FLAGS:
        for match in re.finditer(rf'!?BUILDFLAG\({flag}\)', masked):
            line = masked[masked.rfind('\n', 0, match.start()) + 1:match.end()]
            if line.lstrip().startswith('#'):
                raise ValueError('Unreviewed old flag in a remaining directive')
            spans.append((match.start(), match.end(), 'true' if match[0].startswith('!') else 'false'))
    for start, end, replacement in sorted(spans, reverse=True):
        text = text[:start] + replacement + text[end:]
    return text


def gn_tokens(text):
    result = [match for match in GN_TOKENS.finditer(text) if not match[0].startswith('#')]
    if any(token[0] == '"' for token in result):
        raise ValueError('Unterminated GN string')
    return result


def close_token(tokens, index, opening, closing):
    depth = 0
    for end in range(index, len(tokens)):
        if tokens[end][0] == opening:
            depth += 1
        elif tokens[end][0] == closing:
            depth -= 1
            if depth == 0:
                return end
    raise ValueError(f'Unterminated GN {opening}')


def prune_gn(text):
    conditions = {
        'enable_aux_shell': False,
        'enable_aux_shell&&is_mac&&!is_component_build': False,
        'enable_aux_browser||enable_aux_shell||enable_aux_sparkle': 'enable_aux_browser || enable_aux_sparkle',
        'enable_aux_browser||enable_aux_shell': 'enable_aux_browser',
        '!enable_aux_browser&&!enable_aux_shell&&!enable_aux_sparkle': '!enable_aux_browser && !enable_aux_sparkle',
    }
    while True:
        tokens = gn_tokens(text)
        candidates = []
        for index, token in enumerate(tokens[:-1]):
            if token[0] != 'if' or tokens[index + 1][0] != '(':
                continue
            close = close_token(tokens, index + 1, '(', ')')
            condition = ''.join(item[0] for item in tokens[index + 2:close])
            if 'enable_aux_shell' in condition:
                if condition not in conditions:
                    raise ValueError(f'Unreviewed GN condition: {condition}')
                candidates.append((index, close, condition))
        if not candidates:
            break
        index, close, condition = candidates[-1]
        replacement = conditions[condition]
        if replacement is not False:
            text = text[:tokens[index + 1].end()] + replacement + text[tokens[close].start():]
            continue
        opening = close + 1
        if tokens[opening][0] != '{':
            raise ValueError('Expected GN conditional block')
        end = close_token(tokens, opening, '{', '}')
        suffix = end + 1
        body = ''
        if suffix < len(tokens) and tokens[suffix][0] == 'else':
            if tokens[suffix + 1][0] == '{':
                alternate_end = close_token(tokens, suffix + 1, '{', '}')
                body = text[tokens[suffix + 1].end():tokens[alternate_end].start()]
                end = alternate_end
            elif tokens[suffix + 1][0] == 'if':
                end = suffix
            else:
                raise ValueError('Unreviewed GN alternative')
        start = tokens[index].start()
        line_start = text.rfind('\n', 0, start) + 1
        if not text[line_start:start].strip():
            start = line_start
        elif index and tokens[index - 1][0] == 'else':
            raise ValueError('Unreviewed GN else-if removal')
        text = text[:start] + body + text[tokens[end].end():]
    return text



def cpp_projection(text):
    masked = mask_literals(text)
    spans = []
    for flag in OLD_FLAGS:
        for match in re.finditer(rf'!?BUILDFLAG\({flag}\)', masked):
            spans.append((match.start(), match.end(), '1' if match[0].startswith('!') else '0'))
    for start, end, value in sorted(spans, reverse=True):
        text = text[:start] + value + text[end:]
    text = text.replace('#include "components/surface_embed/common/aux_buildflags.h"\n', '')
    text = text.replace('#include "chrome/browser/ui/aux/profile_prefs.h"\n', '')
    result = subprocess.run(['/usr/bin/unifdef', '-k'], input=text.encode(), capture_output=True)
    if result.returncode not in (0, 1):
        raise ValueError('Independent text-preprocessor failed: ' + result.stderr.decode())
    token_pattern = CPP_LITERALS.pattern + r'|[A-Za-z_]\w*|\d+|::|->|&&|\|\||==|!=|<=|>=|<<|>>|[^\s]'
    tokens = []
    for token in re.finditer(token_pattern, result.stdout.decode()):
        value = token[0]
        if value.startswith(('//', '/*')):
            continue
        tokens.append({'true': '1', 'false': '0'}.get(value, value))
    return tokens


def stage(proof, output):
    report = json.loads((proof / 'report.json').read_text())
    if not report['comparisonPerformed'] or report['mismatches'] or report['firstFailure']:
        raise ValueError('A completed matching reconstruction is required')
    output.mkdir(parents=True, exist_ok=False)
    tree = proof / 'tree'
    paths = json.loads((proof / 'included-paths.json').read_text())
    patch = []
    changed = []
    remaining = []
    projection_checks = []
    for name in paths:
        source = tree / name
        if not source.is_file() or source.is_symlink() or source.suffix not in ('.cc', '.h', '.mm', '.gn', '.gni', '.md'):
            continue
        old = source.read_text()
        new = old
        if source.suffix in ('.cc', '.h', '.mm') and any(flag in old for flag in OLD_FLAGS):
            new = prune_cpp(old)
        if source.suffix in ('.gn', '.gni') and 'enable_aux_shell' in old:
            new = prune_gn(new)
            if name == 'chrome/browser/buildflags.gni':
                declaration = '  # Aux shell is built only for the Aux distribution.\n  enable_aux_shell = false\n\n'
                if declaration not in new:
                    raise ValueError('Unexpected shell argument declaration')
                new = new.replace(declaration, '', 1).replace('Independent local browser integration; retired shell stays disabled.', 'Independent local browser integration.')
            new = re.sub(r'^[ \t]*"ENABLE_AUX_(?:SHELL|RESULT_SCHEME|ISOLATED_WORLDS)=\$enable_aux_shell",\n', '', new, flags=re.M)
            if name == 'components/surface_embed/common/BUILD.gn':
                tokens = gn_tokens(new)
                target = next(i for i, token in enumerate(tokens) if token[0] == 'buildflag_header' and tokens[i + 2][0] == '"aux_buildflags"')
                opening = target + 4
                end = close_token(tokens, opening, '{', '}')
                new = new[:tokens[target].start()] + new[tokens[end].end():]
                for value in ['import("//build/buildflag_header.gni")\n', 'import("//chrome/browser/buildflags.gni")\n', '    ":aux_buildflags",\n']:
                    if value not in new:
                        raise ValueError(f'Unexpected surface-embed dependency: {value}')
                    new = new.replace(value, '', 1)
            # Remaining flag tokens are asserts in disabled legacy release/utility targets.
            tokens = gn_tokens(new)
            for token in reversed(tokens):
                if token[0] == 'enable_aux_shell':
                    line = new[new.rfind('\n', 0, token.start()) + 1:token.start()].lstrip()
                    if not line.startswith('assert('):
                        raise ValueError('Unreviewed remaining GN flag expression')
                    new = new[:token.start()] + 'false' + new[token.end():]
        if name in ('chrome/browser/ui/webui/bookmarks/bookmarks_ui.cc', 'chrome/browser/ui/webui_browser/webui_browser_ui.cc'):
            if 'aux::' in mask_literals(new):
                raise ValueError('Legacy preference symbols still used after pruning')
            new = new.replace('#include "chrome/browser/ui/aux/profile_prefs.h"\n', '', 1)
            new = new.replace("  // The Aux build replaces Webium's top chrome with the packaged Aux shell.\n", '')
        if name == 'components/surface_embed/common/features.cc':
            new = new.replace('#include "components/surface_embed/common/aux_buildflags.h"\n', '', 1)
        if name == 'chrome/browser/aux/passkeys/README.md':
            new = new.replace('`enable_aux_shell=false`, under', 'the retired shell omitted, under')
        if new != old:
            if source.suffix in ('.cc', '.h', '.mm'):
                if cpp_projection(old) != cpp_projection(new):
                    raise ValueError(f'Independent preprocessor-token mismatch: {name}')
                projection_checks.append(name)
            target = output / 'files' / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(new)
            changed.append(name)
            patch.extend(difflib.unified_diff(old.splitlines(True), new.splitlines(True), fromfile='a/' + name, tofile='b/' + name))
        if any(flag in new for flag in OLD_FLAGS) or 'enable_aux_shell' in new:
            remaining.append(name)
    (output / 'cleanup.patch').write_text(''.join(patch))
    (output / 'report.json').write_text(json.dumps({'sourceProof': str(proof), 'changed': changed, 'remainingOldFlagPaths': remaining, 'cppProjection': {'tool': '/usr/bin/unifdef -k', 'paths': projection_checks, 'matches': True},
        'limits': ['Staged only; native checkout is untouched.', 'Equivalence is limited to the supported shell-disabled configuration.',
                   'Legacy release/utility assertions become explicit false; their unsupported configurations remain unavailable.',
                   'Fresh GN, enabled compilation and runtime acceptance remain required.']}, indent=2) + '\n')
    print(json.dumps({'changed': len(changed), 'remainingOldFlagPaths': remaining}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--proof', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    stage(args.proof.resolve(strict=True), args.output.resolve())
