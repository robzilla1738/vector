#!/usr/bin/env python3
"""Bind actual unsigned native/link and independently projected source results."""
import argparse
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('cache_package', HERE / 'cache_package.py')
cache = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cache)
f, m = cache.f, cache.m


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--link-result', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    producer_inputs = {'tool': f.reference(cache.__file__), 'review': f.reference(HERE / 'review.json')}
    review = cache.review_inputs()
    plan = cache.resolve(review['relink']['plan'])
    result_path = Path(args.link_result).resolve()
    inputs_path, link_path = cache.verify_link(result_path, plan, review)
    inputs, linked = cache.read(inputs_path), cache.read(link_path)
    # Validate actual current frozen operands as well as their successful receipt.
    alias = cache.read(f.ROOT / 'docs/integration/proposed/browser-feature-expansion/package/toolchain-alias-review.json')
    compiler = Path(alias['path'])
    for name, digest in inputs['frozenFiles'].items():
        path = Path(name)
        if path.is_symlink():
            if path == compiler:
                f.require(path.readlink().as_posix() == alias['linkTarget']
                          and path.resolve() == Path(alias['resolved']) and digest == alias['sha256'],
                          'Original exact compiler alias changed')
                m.pin(path.resolve(), digest)
            else:
                cache.verify_link_tool_alias(path, digest)
        else:
            m.pin(path, digest)
    previous_path = cache.resolve(review['inputs']['protectedPair'])
    previous = cache.read(previous_path)
    browser_path = cache.resolve(review['inputs']['browserReceipt'])
    browser = cache.read(browser_path)
    composition_path = f.ROOT / 'docs/integration/proposed/browser-feature-expansion/integration/composition.json'
    f.verify_feature_native(browser, cache.read(composition_path))
    projection = cache.read(cache.resolve(review['inputs']['projection']))
    root = Path(projection['output'])
    composition_path = root / 'composition.json'
    composition = cache.read(composition_path)
    f.require(composition['passed'] is True
              and composition['predecessorSourcePairSha256'] == m.sha(previous_path)
              and composition['coldFeatureEnabled'] is False
              and composition['runtimeAuthorityGranted'] is False
              and composition['productExecuted'] is False, 'Actual inactive source composition required')
    for item in composition['adapterInputs']:
        m.pin(f.ROOT / item['path'], item['sha256'])
    source_path, entry_path = root / 'index.mjs', root / 'projected-entry/aux-native-entry.mjs'
    source_receipt, entry_receipt = root / 'source-receipt.json', root / 'projected-entry/results.json'
    source, entry = cache.read(source_receipt), cache.read(entry_receipt)
    f.require(source['passed'] is True and source['coldRefusalPreserved'] is True
              and source['executed'] is False and source['nativeAbiChanged'] is True
              and entry['passed'] is True and entry['defaultEntryRefusalPreserved'] is True
              and entry['executed'] is False and entry['runtimeAuthorityGranted'] is False,
              'Actual refused source and dormant entry projections required')
    f.require(m.sha(source_receipt) == projection['sourceReceiptSha256']
              and m.sha(entry_receipt) == projection['entryReceiptSha256']
              and source['compositionReceiptSha256'] == m.sha(composition_path)
              and entry['sourceReceiptSha256'] == m.sha(source_receipt), 'Projection receipt association changed')
    rows = {item['kind']: item for item in composition['files']}
    f.require(set(rows) == {'source', 'entry'} and len(composition['files']) == 2, 'Exact source/entry leaves required')
    for kind, item in rows.items():
        f.require(item['beforeSha256'] == previous[kind + 'Sha256']
                  and Path(item['input']).resolve() == Path(previous[kind]).resolve(), 'Original source predecessor changed')
        m.pin(item['input'], item['beforeSha256'])
        m.pin(item['output'], item['afterSha256'])
    m.pin(source_path, source['composedSha256'])
    m.pin(entry_path, entry['entrySha256'])
    f.require(entry['sourceSha256'] == source['composedSha256']
              and rows['source']['afterSha256'] == source['composedSha256']
              and rows['entry']['afterSha256'] == entry['entrySha256'], 'Independent entry composition differs')
    loader_path = root / 'projected-entry/aux-owned-native.cjs'
    m.pin(loader_path, previous['loaderSha256'])
    f.require(entry['loaderSha256'] == previous['loaderSha256'], 'Unrelated loader change refused')
    m.pin(previous['pty'], previous['ptySha256'])
    f.require(linked['moduleSha256'] == previous['ptySha256'], 'Paired native module changed')
    command = linked['commands'][-1]
    f.require(command.count('-o') == 1, 'Exact native output required')
    daemon_path = Path(command[command.index('-o') + 1]).resolve()
    m.pin(daemon_path, linked['executableSha256'])
    pair = dict(previous)
    pair.update(daemon=str(daemon_path), daemonSha256=linked['executableSha256'],
                daemonReceiptSha256=m.sha(link_path), source=str(source_path),
                sourceSha256=source['composedSha256'], entry=str(entry_path),
                entrySha256=entry['entrySha256'], loader=str(loader_path),
                nativeBrowserReceiptSha256=m.sha(browser_path), nativeBrowserBuildPending=False,
                predecessorSourcePairSha256=m.sha(previous_path), uiModified=True,
                sourceCompositionReceiptSha256=m.sha(composition_path),
                sourceReceiptSha256=m.sha(source_receipt), entryReceiptSha256=m.sha(entry_receipt),
                nativeInputManifestSha256=m.sha(inputs_path), nativeRelinkResultSha256=m.sha(result_path),
                nativeAbiChanged=True, nativeHostApiChanged=True, pairedModuleAbiChanged=False,
                nativePairingPending=False, coldFeatureEnabled=False, runtimeAuthorityGranted=False,
                productExecuted=False, pairProducer=f.reference(__file__), pairProducerInputs=producer_inputs)
    for item in producer_inputs.values():
        cache.resolve(item)
    output = Path(args.output).resolve()
    with output.open('x') as stream:
        stream.write(json.dumps(pair, indent=2) + '\n')
    print('Bound actual inactive native/source successor; no runtime authority or acceptance')


if __name__ == '__main__':
    main()
