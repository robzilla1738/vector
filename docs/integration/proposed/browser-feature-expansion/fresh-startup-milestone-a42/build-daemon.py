"""Build the actual main-only native daemon from the reviewed A26 successor."""
import hashlib
import json
from pathlib import Path
import subprocess
import shutil

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
LANE = REPO / 'docs/integration/proposed/standard-profile-isolation/ordinary-fresh-browser-startup-a1'
OUT = Path('/private/tmp/aux-browser-only-daemon-build-20261024-a42e')


def main():
    OUT.mkdir(mode=0o700)
    sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
    plan = json.loads((LANE / 'source-plan.json').read_text())
    for row in plan['files']:
        original = Path(row['input'])
        source = LANE / 'source' / Path(row['output']).name
        assert sha(original) == row['inputSha256']
        assert sha(source) == row['outputSha256']
        text = original.read_text()
        for anchor in row['anchors']:
            assert text.count(anchor['before']) == anchor['count']
            text = text.replace(anchor['before'], anchor['after'], anchor['count'])
        assert text.encode() == source.read_bytes()
    review = json.loads((LANE / 'compile-review.json').read_text())
    assert sha(review['baseline']) == review['baselineSha256']
    old_output = review['output']
    cohort = OUT / 'source'
    cohort.mkdir()
    for source in (LANE / 'source').iterdir():
        if source.suffix in ['.cc', '.h']:
            shutil.copy2(source, cohort / source.name)
    drain = Path('/private/tmp/aux-async-writes-final/docs/integration/proposed/profile-isolation-next/spawn-custody/source/AuxWorkerDrain.h')
    shutil.copy2(drain, cohort / drain.name)
    worker = cohort / 'AuxDevelopmentWorkerHost.cc'
    text = worker.read_text()
    include_normalization = []
    for relative in ['aux-native-pdf-host-consumer/source/AuxLoadedPdfLifetime.h',
                     'aux-native-utility-host-consumer/source/AuxLoadedUtilityLifetime.h']:
        original = Path('/private/tmp/aux-async-writes-final/docs/integration/proposed') / relative
        canonical = REPO / 'docs/integration/proposed' / relative
        assert sha(original) == sha(canonical)
        before, after = f'#include "{original}"', f'#include "{canonical}"'
        assert text.count(before) == 1
        text = text.replace(before, after)
        include_normalization.append(dict(before=before, after=after, count=1, identicalHeaderSha256=sha(canonical)))
    worker.write_text(text)

    def normalize(args):
        result = []
        for arg in args:
            value = arg.replace(old_output, str(OUT))
            if value == '-I' + str(LANE / 'source'):
                value = '-I' + str(cohort)
            if Path(value).parent == LANE / 'source' and Path(value).suffix == '.cc':
                value = str(cohort / Path(value).name)
            result.append(value)
        return result

    commands = [normalize(row['command']) for row in review['commands']]
    commands.append(normalize(review['swiftLinkCommand']))
    frozen = {str(source): sha(source) for source in cohort.iterdir()}
    results = []
    for index, command in enumerate(commands):
        for arg in command:
            if Path(arg).is_file():
                frozen[arg] = sha(arg)
        assert 'AUX_BROWSER_ONLY_NATIVE_STARTUP' in ' '.join(command)
        run = subprocess.run(command, cwd=REPO, capture_output=True)
        (OUT / f'{index}.stdout').write_bytes(run.stdout)
        (OUT / f'{index}.stderr').write_bytes(run.stderr)
        results.append(dict(command=command, exitCode=run.returncode))
        print(json.dumps(dict(step=index, exitCode=run.returncode)), flush=True)
        if run.returncode:
            print(run.stderr.decode(errors='replace')[-8000:], flush=True)
            break
    passed = len(results) == len(commands) and all(row['exitCode'] == 0 for row in results)
    receipt = dict(format='aux.ordinary-fresh.daemon-build.actual.v1', passed=passed,
        sourcePlanSha256=sha(LANE / 'source-plan.json'), compileReviewSha256=sha(LANE / 'compile-review.json'),
        results=results, inputFiles=frozen, output=str(OUT), productSigned=False,
        productExecuted=False, runtimeAcceptance=False, supervisedTasksEnabled=False)
    receipt['identicalHeaderIncludeNormalization'] = include_normalization
    if passed:
        binary = Path(commands[-1][commands[-1].index('-o') + 1])
        load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
        assert b'LC_CODE_SIGNATURE' not in load
        receipt.update(binary=str(binary), binarySha256=sha(binary), codeSignatureLoadCommandPresent=False)
    for name, expected in frozen.items():
        assert sha(name) == expected, name
    (HERE / 'actual-daemon-build-a4.json').write_text(json.dumps(receipt, indent=2) + '\n')
    if not passed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
