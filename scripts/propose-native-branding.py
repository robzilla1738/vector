"""Prepare a baseline-hashed product-brand asset proposal; never writes Chromium."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source-root', required=True)
args = parser.parse_args()
native = Path(args.source_root).resolve()
proposal = ROOT / 'docs/integration/proposed/native-branding-assets'
proposal.mkdir(parents=True, exist_ok=True)
master = Image.open(ROOT / 'assets/brand/aux-icon-1024.png').convert('RGBA')
mark = Image.open(ROOT / 'assets/brand/aux-mark-white.png').convert('RGBA')
entries = []
for source in sorted((native / 'chrome/app/theme').rglob('product_logo*.png')):
    relative = source.relative_to(native)
    # Only Chromium's product branding, never provider/functional icons.
    if 'chromium' not in relative.parts:
        continue
    size = Image.open(source).size
    target = proposal / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if '_name_' in source.name:
        icon = Image.new('RGBA', size)
        foreground = Image.new('RGBA', mark.size, '#fff' if '_white' in source.name else '#0a0a0a')
        foreground.putalpha(mark.getchannel('A'))
        icon.alpha_composite(foreground.resize((size[1], size[1]), Image.Resampling.LANCZOS))
        role = 'canonical mark in original leading square; remaining wordmark canvas transparent'
    elif '_mono' in source.name:
        icon = Image.new('RGBA', mark.size, '#0a0a0a')
        icon.putalpha(mark.getchannel('A'))
        icon = icon.resize(size, Image.Resampling.LANCZOS)
        role = 'transparent monochrome canonical mark'
    else:
        if size[0] != size[1]:
            raise ValueError(f'Unexpected product icon geometry: {relative}')
        icon = master.resize(size, Image.Resampling.LANCZOS)
        role = 'canonical app icon'
    icon.save(target)
    entries.append({'target': str(relative), 'baselineSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                    'replacement': str(target.relative_to(ROOT)), 'replacementSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                    'size': list(size), 'role': role})
relative = Path('chrome/app/theme/chromium/mac/app.icns')
source = native / relative
target = proposal / relative
target.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(ROOT / 'assets/brand/Aux.icns', target)
entries.append({'target': str(relative), 'baselineSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'replacement': str(target.relative_to(ROOT)), 'replacementSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                'role': 'canonical Aux ICNS'})
report = {'version': 1, 'sourceRoot': str(native), 'canonicalSvgSha256': hashlib.sha256((ROOT / 'assets/brand/arch-mark.svg').read_bytes()).hexdigest(),
          'status': 'proposal-only-not-applied', 'entries': entries,
          'applyPolicy': 'After the frozen build, verify every baseline and replacement hash before any copy; stop on any mismatch. Copy only listed targets, then rebuild native resources/package and sign via root workflow.'}
(proposal / 'manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'Prepared {len(entries)} exact product-brand asset replacements; Chromium untouched')
