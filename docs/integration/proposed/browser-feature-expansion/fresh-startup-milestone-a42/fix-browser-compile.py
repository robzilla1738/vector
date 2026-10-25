"""Exclude the unreachable legacy path and recompile only the failed owner."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
OUT = Path('/private/tmp/aux-ordinary-startup-native-a42-compile-fix')
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    OUT.mkdir(mode=0o700)
    relative = 'chrome/app/chrome_main_delegate.cc'
    target = ROOT / relative
    prior = json.loads((HERE / 'source-composition.json').read_text())
    assert sha(target) == prior['selectedFiles'][relative]['sha256']
    before = target.read_text()
    rules = [
        ('  CHECK(ValidateOrdinaryUserDataSelection(command_line));\n  return;\n#endif\n#if BUILDFLAG(IS_WIN)',
         '  CHECK(ValidateOrdinaryUserDataSelection(command_line));\n#else\n#if BUILDFLAG(IS_WIN)'),
        ('#endif  // BUILDFLAG(IS_WIN)\n}\n#endif  // !defined(BUILDING_CHROME_RENDERER)',
         '#endif  // BUILDFLAG(IS_WIN)\n#endif  // Ordinary startup excludes the legacy fallback.\n}\n#endif  // !defined(BUILDING_CHROME_RENDERER)')]
    text = before
    for old, new in rules:
        assert text.count(old) == 1
        text = text.replace(old, new)
    source = OUT / relative
    source.parent.mkdir(parents=True)
    source.write_text(text)
    shutil.copy2(target, OUT / 'before.cc')
    shutil.copy2(source, target)
    manifest = dict(files=[dict(path=relative, inputSha256=hashlib.sha256(before.encode()).hexdigest(),
        outputSha256=sha(source), anchors=[dict(find=old, replace=new, count=1) for old, new in rules])],
        warningSuppressed=False, reason='Compile only the selected startup path; preserve legacy branch for other builds.')
    (HERE / 'browser-compile-fix.json').write_text(json.dumps(manifest, indent=2) + '\n')
    prior['selectedFiles'][relative] = dict(path=str(source), sha256=sha(source), changed=True)
    prior['compileFix'] = dict(path=str(HERE / 'browser-compile-fix.json'), sha256=sha(HERE / 'browser-compile-fix.json'))
    (HERE / 'source-composition-a2.json').write_text(json.dumps(prior, indent=2) + '\n')
    pins = json.loads((HERE / 'full-native-input-pins.json').read_text())
    pins['files'][relative] = sha(source)
    pins['sourceCompositionSha256'] = sha(HERE / 'source-composition-a2.json')
    (HERE / 'full-native-input-pins-a2.json').write_text(json.dumps(pins, indent=2) + '\n')
    failed = json.loads((HERE / 'actual-browser-compile-a1.json').read_text())
    assert sum(row['exitCode'] != 0 for row in failed['results']) == 1
    row = next(row for row in failed['results'] if row['source'] == relative)
    command = list(row['command'])
    command[command.index('-o') + 1] = str(OUT / 'chrome_main_delegate.o')
    command[command.index('-MF') + 1] = str(OUT / 'chrome_main_delegate.d')
    run = subprocess.run(command, cwd=ROOT / 'out/AuxFast', capture_output=True)
    (OUT / 'stderr').write_bytes(run.stderr)
    (OUT / 'stdout').write_bytes(run.stdout)
    result = dict(passed=run.returncode == 0, command=command, exitCode=run.returncode,
        retainedPassingOwners=9, newCompileOwners=1, productExecuted=False, runtimeAcceptance=False,
        sourceCompositionSha256=sha(HERE / 'source-composition-a2.json'))
    (HERE / 'actual-browser-compile-a2.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({key: value for key, value in result.items() if key != 'command'}))
    if run.returncode:
        print(run.stderr.decode(errors='replace')[-6000:])
        raise SystemExit(run.returncode)


if __name__ == '__main__':
    main()
