#!/usr/bin/env python3
"""Compare Aux's memory helper with the supplied one (docs/spec/memory-helper.md section 4).

    compare.py --ours apps/memory-helper/.build/aux-memory [--supplied PATH] [--model DIR]
               [--write-golden] [--json]

Both helpers run standalone on throwaway directories under the system temp folder, never on
real memory. Defaults come from the sealed candidate. Checks:

  embed      the fixed corpus (fixtures/memory-helper/corpus.jsonl): bitwise equal vectors, else
             cosine >= 0.99999 and max abs diff <= 1e-4 (format-compatible only)
  index      sync the fixture directory with each helper: index.mossvec, docs.json,
             memory-index-local.json, CURRENT, COMMITTED byte-equal; session.json equal but updatedAt
  search     10 fixed queries x 4 alphas, topK 5: same ids in the same order, scores within 1e-5
  update     modify, add and delete files, then sync and rebuild: same replies and files
  cross-read each helper opens the other's index: same status and search results
  protocol   status/close/shutdown replies, malformed request exits non-zero, stdin EOF exits
  chunk      the fixture files and every corpus text through `chunk`: identical replies

With --write-golden the supplied helper's embeddings are stored as
fixtures/memory-helper/golden-embeddings.f32 (little-endian f32, corpus order); without a
supplied helper the embed check runs against that file. Exit status 0 only if everything passes.
"""
import argparse
import json
import math
import os
import select
import shutil
import struct
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / 'fixtures/memory-helper'
CANDIDATE = ROOT / 'out/provided-candidate-completion-20261026-a1/Aux.app/Contents/Resources/aux'
SUPPLIED = CANDIDATE / 'apps/daemon/Aux Daemon.app/Contents/Resources/memory-helper/aux-memory'
MODEL_KEY = '2001e15f1ea3e79468db44b6ad772d05978b2787e1f414044cb0efb8c4bc78bc'
INDEX_FILES = ('index.mossvec', 'docs.json', 'session.json', 'COMMITTED')
ALPHAS = (None, 0, 0.5, 1)


def default_model() -> Path:
    base = CANDIDATE / 'memory-distribution/models' / MODEL_KEY
    current = (base / 'CURRENT').read_text().strip() if (base / 'CURRENT').exists() else None
    return base / current if current else next(p for p in base.iterdir() if p.is_dir())


class Helper:
    """One helper process; requests go one at a time and stdin stays open until close()."""

    def __init__(self, exe: Path, model: Path, home: str):
        self.p = subprocess.Popen([str(exe), str(model), ''], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=subprocess.PIPE, env={'PATH': '/usr/bin:/bin', 'HOME': home,
                                                               'ORT_DISABLE_TELEMETRY': '1'})
        self.n = 0

    def raw(self, method: str, params: dict) -> bytes:
        self.n += 1
        self.p.stdin.write((json.dumps({'id': self.n, 'method': method, 'params': params}) + '\n').encode())
        self.p.stdin.flush()
        line = self.p.stdout.readline()
        if not line:
            raise RuntimeError(f'helper exited: {self.p.stderr.read().decode(errors="replace")[:400]}')
        return line

    def call(self, method: str, params: dict):
        return json.loads(self.raw(method, params))

    def close(self):
        if self.p.poll() is None:
            try:
                self.raw('shutdown', {})
            except (RuntimeError, BrokenPipeError):
                pass
            self.p.stdin.close()
            self.p.wait(10)


def f32(values) -> bytes:
    return struct.pack(f'<{len(values)}f', *values)


def vector_stats(a: bytes, b: bytes):
    x = struct.unpack(f'<{len(a) // 4}f', a)
    y = struct.unpack(f'<{len(b) // 4}f', b)
    diffs = [abs(p - q) for p, q in zip(x, y)]
    worst = max(range(len(diffs)), key=diffs.__getitem__)
    cos = sum(p * q for p, q in zip(x, y)) / (math.sqrt(sum(p * p for p in x)) * math.sqrt(sum(q * q for q in y)))
    return cos, diffs[worst], worst


class Report:
    def __init__(self):
        self.sections = {}

    def add(self, section: str, ok: bool, detail):
        entry = self.sections.setdefault(section, {'pass': True, 'checks': 0, 'failures': []})
        entry['checks'] += 1
        if not ok:
            entry['pass'] = False
            if len(entry['failures']) < 20:
                entry['failures'].append(detail)

    @property
    def ok(self):
        return all(s['pass'] for s in self.sections.values())


def strip_id(line: bytes, n: int) -> bytes:
    return line.replace(b'{"id":%d,' % n, b'{', 1).replace(b',"id":%d}' % n, b'}', 1)


def without_timing(reply: dict, ignore=('timeTakenInMs',)) -> dict:
    result = reply.get('result')
    if isinstance(result, dict):
        result = {k: v for k, v in result.items() if k not in ignore}
    return {k: (result if k == 'result' else v) for k, v in reply.items() if k != 'id'}


def index_files(directory: Path) -> dict:
    files = {}
    local = directory / '.local-memory'
    for path in sorted(local.rglob('*')):
        if path.is_file():
            files[str(path.relative_to(directory))] = path.read_bytes()
    manifest = directory / 'memory-index-local.json'
    if manifest.exists():
        files['memory-index-local.json'] = manifest.read_bytes()
    for key in list(files):
        if key.endswith('session.json'):
            session = json.loads(files[key])
            session.pop('updatedAt', None)
            files[key] = json.dumps(session, sort_keys=True).encode()
    return files


def compare_index(report: Report, section: str, a: Path, b: Path, label: str):
    fa, fb = index_files(a), index_files(b)
    report.add(section, sorted(fa) == sorted(fb), {'step': label, 'supplied': sorted(fa), 'ours': sorted(fb)})
    for key in sorted(set(fa) & set(fb)):
        same = fa[key] == fb[key]
        detail = {'step': label, 'file': key, 'bytes': [len(fa[key]), len(fb[key])]}
        if not same and key.endswith('index.mossvec') and len(fa[key]) == len(fb[key]):
            rows = (len(fa[key]) - 256) // 1552
            detail['rowsDiffering'] = sum(fa[key][256 + i * 1552:256 + (i + 1) * 1552] != fb[key][256 + i * 1552:256 + (i + 1) * 1552]
                                          for i in range(rows))
        report.add(section, same, detail)


def check_embed(report, corpus, supplied, ours, golden_path, write_golden):
    golden = None
    if supplied:
        golden = [f32(supplied.call('embed', {'text': item['text']})['result']) for item in corpus]
        if write_golden:
            golden_path.write_bytes(b''.join(golden))
    elif golden_path.exists():
        blob = golden_path.read_bytes()
        golden = [blob[i * 1536:(i + 1) * 1536] for i in range(len(corpus))]
    if golden is None:
        report.add('embed', False, 'no supplied helper and no golden file')
        return {}
    summary = {'bitwiseEqual': 0, 'items': len(corpus), 'worstCosine': 1.0, 'worstMaxAbsDiff': 0.0}
    for item, ref in zip(corpus, golden):
        mine = f32(ours.call('embed', {'text': item['text']})['result'])
        values = struct.unpack('<384f', mine)
        norm = math.sqrt(sum(v * v for v in values))
        report.add('embed', len(values) == 384 and all(map(math.isfinite, values)) and abs(norm - 1) <= 1e-6,
                   {'item': item['name'], 'shape': 'not 384 finite unit floats'})
        if mine == ref:
            summary['bitwiseEqual'] += 1
            report.add('embed', True, None)
            continue
        cos, diff, worst = vector_stats(ref, mine)
        summary['worstCosine'] = min(summary['worstCosine'], cos)
        summary['worstMaxAbsDiff'] = max(summary['worstMaxAbsDiff'], diff)
        report.add('embed', False, {'item': item['name'], 'cosine': cos, 'maxAbsDiff': diff, 'worstComponent': worst,
                                    'fallbackBar': cos >= 0.99999 and diff <= 1e-4})
    return summary


def search_all(helper, directory, queries):
    out = []
    for q in queries:
        for alpha in ALPHAS:
            params = {'directory': str(directory), 'query': q, 'topK': 5}
            if alpha is not None:
                params['alpha'] = alpha
            out.append(((q, alpha), helper.call('search', params)))
    return out


def compare_searches(report, section, ra, rb, ignore=('timeTakenInMs',)):
    for (key, a), (_, b) in zip(ra, rb):
        if 'error' in a or 'error' in b:
            report.add(section, a.get('error') == b.get('error'), {'query': key, 'supplied': a.get('error'), 'ours': b.get('error')})
            continue
        da, db = a['result']['docs'], b['result']['docs']
        ids_a, ids_b = [d['id'] for d in da], [d['id'] for d in db]
        close = len(da) == len(db) and all(abs(x['score'] - y['score']) <= 1e-5 for x, y in zip(da, db))
        same = ids_a == ids_b and close and without_timing(a, ignore) == without_timing(b, ignore)
        detail = {'query': key, 'supplied': [(d['id'][:8], d['score']) for d in da], 'ours': [(d['id'][:8], d['score']) for d in db]}
        if ids_a == ids_b and close and not same:
            ta, tb = without_timing(a, ignore)['result'], without_timing(b, ignore)['result']
            detail['fields'] = {k: [str(ta.get(k))[:300], str(tb.get(k))[:300]] for k in set(ta) | set(tb) if ta.get(k) != tb.get(k)}
        report.add(section, same, detail)


def check_protocol(report, exe, model, home):
    def one(lines, wait=3.0):
        p = subprocess.Popen([str(exe), str(model), ''], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, env={'PATH': '/usr/bin:/bin', 'HOME': home})
        p.stdin.write(lines)
        p.stdin.flush()
        deadline, out = time.time() + wait, b''
        while time.time() < deadline and p.poll() is None and not out.endswith(b'\n'):
            ready, _, _ = select.select([p.stdout], [], [], 0.1)
            if ready:
                chunk = os.read(p.stdout.fileno(), 1 << 16)
                if not chunk:
                    break
                out += chunk
        try:
            p.stdin.close()
        except BrokenPipeError:
            pass
        try:
            code = p.wait(10)
        except subprocess.TimeoutExpired:
            p.kill()
            code = 'did not exit'
        return out, code
    results = {
        'malformed': one(b'{"id":1,"method":"bogus","params":{}}\n')[1],
        'missingParams': one(b'{"id":1,"method":"status"}\n')[1],
        'badTopK': one(b'{"id":1,"method":"search","params":{"directory":"/x","query":"q","topK":1.5}}\n')[1],
        'truncated': one(b'{"id":1,"method":"embed","params":{"text":"a"}}', wait=0.5)[1],
        'eof': one(b'', wait=0.2)[1],
        'shutdown': one(b'{"id":7,"method":"shutdown","params":{}}\n'),
        'relative': one(b'{"id":2,"method":"status","params":{"directory":"rel"}}\n')[0],
        'missing': one(b'{"id":3,"method":"sync","params":{"directory":"/nonexistent-aux-memory"}}\n')[0],
        'bounds': one(b'{"id":4,"method":"search","params":{"directory":"/x","query":"q","topK":101}}\n')[0],
    }
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--ours', type=Path, required=True)
    parser.add_argument('--supplied', type=Path, default=SUPPLIED)
    parser.add_argument('--model', type=Path)
    parser.add_argument('--write-golden', action='store_true')
    parser.add_argument('--json', action='store_true', help='print the full report as JSON')
    args = parser.parse_args()
    model = (args.model or default_model()).resolve()
    supplied_exe = args.supplied if args.supplied and args.supplied.exists() else None
    corpus = [json.loads(line) for line in (FIXTURES / 'corpus.jsonl').read_text().splitlines() if line]
    queries = json.loads((FIXTURES / 'queries.json').read_text())
    report, summary = Report(), {}
    root = Path(tempfile.mkdtemp(prefix='aux-memory-compare-'))
    try:
        homes = {k: root / f'home-{k}' for k in ('supplied', 'ours')}
        for h in homes.values():
            h.mkdir()
        ours = Helper(args.ours, model, str(homes['ours']))
        supplied = Helper(supplied_exe, model, str(homes['supplied'])) if supplied_exe else None
        summary['embed'] = check_embed(report, corpus, supplied, ours, FIXTURES / 'golden-embeddings.f32', args.write_golden)
        if not supplied:
            ours.close()
            raise SystemExit('supplied helper not found: only the embed check ran')

        # chunk: every fixture file and corpus text
        memory = FIXTURES / 'memory'
        sources = [(str(p.relative_to(memory)), p.read_text()) for p in sorted(memory.rglob('*.md'))]
        sources += [(f"corpus/{item['name']}.md", item['text']) for item in corpus]
        for path, text in sources:
            a = strip_id(supplied.raw('chunk', {'path': path, 'text': text}), supplied.n)
            b = strip_id(ours.raw('chunk', {'path': path, 'text': text}), ours.n)
            report.add('chunk', a == b, {'path': path})

        dirs = {k: root / f'memory-{k}' for k in ('supplied', 'ours')}
        for d in dirs.values():
            shutil.copytree(memory, d)
        helpers = {'supplied': supplied, 'ours': ours}

        def both(method, extra=None, **params):
            replies = {}
            for k, h in helpers.items():
                p = {'directory': str(dirs[k]), **params}
                replies[k] = h.call(method, p)
            same = without_timing(replies['supplied']) == without_timing(replies['ours'])
            report.add(extra or method, same, {'method': method, 'params': params, **{k: without_timing(v) for k, v in replies.items()}})
            return replies

        both('status', 'protocol')
        summary['firstSync'] = both('sync', 'index')['ours'].get('result')
        compare_index(report, 'index', dirs['supplied'], dirs['ours'], 'first sync')
        both('status', 'protocol')
        current = (dirs['ours'] / '.local-memory/memory/CURRENT').read_text()
        report.add('index', current == 'gen-0000000001', {'CURRENT': current})

        ra = search_all(supplied, dirs['supplied'], queries)
        rb = search_all(ours, dirs['ours'], queries)
        compare_searches(report, 'search', ra, rb)
        summary['searches'] = len(ra)

        # update: modify, add, delete, no-op, rebuild
        for k in dirs:
            (dirs[k] / 'USER.md').write_text((dirs[k] / 'USER.md').read_text() + '\nHe also likes long walks.\n')
            (dirs[k] / 'episodic/2026-10-29.md').write_text('# 2026-10-29\n\nAdded a new note about tea in Tokyo.\n')
            (dirs[k] / 'TAXONOMY.md').unlink()
        both('sync', 'update')
        compare_index(report, 'update', dirs['supplied'], dirs['ours'], 'incremental sync')
        both('sync', 'update')
        both('sync', 'update', rebuild=True)
        compare_index(report, 'update', dirs['supplied'], dirs['ours'], 'rebuild')
        compare_searches(report, 'update', search_all(supplied, dirs['supplied'], queries[:3]),
                         search_all(ours, dirs['ours'], queries[:3]))
        both('close', 'protocol')

        # cross-read: swap directories between fresh processes
        supplied.close()
        ours.close()
        # Each directory is locked by whichever process opens it, so open the other's, then close.
        exes = {'supplied': supplied_exe, 'ours': args.ours}
        swapped = {'supplied': dirs['ours'], 'ours': dirs['supplied']}
        ref = {k: Helper(exes[k], model, str(homes[k])) for k in exes}
        status = {k: without_timing(ref[k].call('status', {'directory': str(swapped[k])})) for k in ref}
        across = {k: search_all(ref[k], swapped[k], queries) for k in ref}
        for k in ref:
            ref[k].call('close', {'directory': str(swapped[k])})
        own = {k: without_timing(ref[k].call('status', {'directory': str(dirs[k])})) for k in ref}
        own_search = {k: search_all(ref[k], dirs[k], queries) for k in ref}
        report.add('cross-read', status['supplied'] == status['ours'] == own['supplied'] == own['ours'],
                   {'statusAcross': status, 'statusOwn': own})
        # The first search in a process starts a catch-up sync; how long `indexing` stays true is timing.
        first = {k: across[k][0][1]['result']['indexing'] for k in across}
        report.add('cross-read', first['supplied'] and first['ours'], {'firstSearchIndexing': first})
        timing = ('timeTakenInMs', 'indexing')
        compare_searches(report, 'cross-read', across['supplied'], across['ours'], timing)
        compare_searches(report, 'cross-read', across['supplied'], own_search['supplied'], timing)
        compare_searches(report, 'cross-read', across['ours'], own_search['ours'], timing)
        for h in ref.values():
            h.close()

        protocol = {k: check_protocol(report, exe, model, str(homes[k])) for k, exe in (('supplied', supplied_exe), ('ours', args.ours))}
        for key in protocol['supplied']:
            a, b = protocol['supplied'][key], protocol['ours'][key]
            if key in ('malformed', 'missingParams', 'badTopK', 'truncated'):
                ok = a != 0 and b != 0
            else:
                ok = a == b
            report.add('protocol', ok, {'case': key, 'supplied': repr(a)[:200], 'ours': repr(b)[:200]})
    finally:
        shutil.rmtree(root, ignore_errors=True)

    result = {'pass': report.ok, 'summary': summary,
              'sections': {k: {'pass': v['pass'], 'checks': v['checks'], 'failures': v['failures'] if args.json else len(v['failures'])}
                           for k, v in report.sections.items()}}
    print(json.dumps(result, indent=1, ensure_ascii=False, default=str))
    return 0 if report.ok else 1


if __name__ == '__main__':
    sys.exit(main())
