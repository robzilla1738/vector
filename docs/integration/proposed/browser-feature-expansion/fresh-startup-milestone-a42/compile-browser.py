"""Compile the ten changed native browser owners with their actual target flags."""
import hashlib
import json
from pathlib import Path
import shlex
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
BUILD = ROOT / 'out/AuxFast'
OUT = Path('/private/tmp/aux-ordinary-browser-objects-a42')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    OUT.mkdir(mode=0o700)
    composition = json.loads((HERE / 'source-composition.json').read_text())
    for relative, row in composition['selectedFiles'].items():
        assert sha(ROOT / relative) == row['sha256'], relative
    sources = [name for name in composition['startupFiles'] if name.endswith('.cc')]
    assert len(sources) == 10
    targets = {name: [] for name in sources}
    for ninja in (BUILD / 'obj').rglob('*.ninja'):
        with ninja.open(errors='replace') as stream:
            for line in stream:
                if ': cxx ' not in line:
                    continue
                fields = line.split('|', 1)[0].split()
                if len(fields) == 4 and fields[0] == 'build':
                    relative = fields[-1].removeprefix('../../')
                    if relative in targets:
                        targets[relative].append(fields[1].removesuffix(':'))
    results = []
    for source in sources:
        chosen = None
        for target in targets[source]:
            if source.endswith('chrome_exe_main_mac.cc') and 'chrome_app_executable' not in target:
                continue
            run = subprocess.run([str(ROOT / 'third_party/ninja/ninja'), '-t', 'commands', '-s', target],
                                 cwd=BUILD, capture_output=True, check=True)
            lines = run.stdout.decode().splitlines()
            assert len(lines) == 1, target
            args = shlex.split(lines[0])
            if '-DBUILDING_CHROME_RENDERER' not in args:
                chosen = (target, args)
                break
        assert chosen, source
        target, command = chosen
        assert command[command.index('-c') + 1] == '../../' + source
        stem = Path(source).stem
        command[command.index('-o') + 1] = str(OUT / (stem + '.o'))
        command[command.index('-MF') + 1] = str(OUT / (stem + '.d'))
        run = subprocess.run(command, cwd=BUILD, capture_output=True)
        (OUT / (stem + '.stderr')).write_bytes(run.stderr)
        (OUT / (stem + '.stdout')).write_bytes(run.stdout)
        results.append(dict(source=source, target=target, command=command, exitCode=run.returncode))
        print(json.dumps(dict(source=source, exitCode=run.returncode)), flush=True)
        if run.returncode:
            print(run.stderr.decode(errors='replace')[-7000:], flush=True)
    passed = all(row['exitCode'] == 0 for row in results)
    if passed:
        delegate = subprocess.run(['/usr/bin/nm', '-u', str(OUT / 'chrome_main_delegate.o')],
                                  check=True, capture_output=True).stdout
        for name in [b'PrepareBrowserPrivateRootsBeforeProfileIO', b'StartSealedNativeDaemonBeforeProfiles',
                     b'AuthorizeNativeBrowserStartupBeforeLocalState']:
            assert name in delegate, name
        entry = subprocess.run(['/usr/bin/nm', '-u', str(OUT / 'chrome_exe_main_mac.o')],
                               check=True, capture_output=True).stdout
        assert b'InitializeAtFreshBrowserEntry' not in entry
    for relative, row in composition['selectedFiles'].items():
        assert sha(ROOT / relative) == row['sha256'], relative
    receipt = dict(format='aux.ordinary-startup.browser-compile.actual.v1', passed=passed,
        sourceCompositionSha256=sha(HERE / 'source-composition.json'), results=results,
        output=str(OUT), productExecuted=False, productSigned=False, runtimeAcceptance=False)
    (HERE / 'actual-browser-compile-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if not passed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
