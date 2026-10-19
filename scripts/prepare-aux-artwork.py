"""Rasterize the canonical SVG without cropping, tracing or reshaping its paths."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / 'assets/brand'
parser = argparse.ArgumentParser()
parser.add_argument('--chrome', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
args = parser.parse_args()
source = BRAND / 'arch-mark.svg'
svg = source.read_bytes()
xml = ET.fromstring(svg)
ns = {'svg': 'http://www.w3.org/2000/svg'}
paths = xml.findall('.//svg:path', ns)
if xml.attrib.get('viewBox') != '0 0 1024 1024' or len(paths) != 2:
    raise ValueError('Expected the supplied 1024px two-path arch mark')
if xml.find('svg:g', ns).attrib.get('transform') != 'scale(12.8)':
    raise ValueError('Canonical mark transform changed')
(BRAND / 'aux-mark-white.svg').write_bytes(svg)
(BRAND / 'aux-mark-current.svg').write_bytes(svg.replace(b'fill="#fff"', b'fill="currentColor"'))
(BRAND / 'aux-mark-dark.svg').write_bytes(svg.replace(b'fill="#fff"', b'fill="#0a0a0a"'))
with tempfile.TemporaryDirectory(prefix='aux-mark-render-') as temporary:
    temporary = Path(temporary)
    image = temporary / 'mark.png'
    document = temporary / 'mark.html'
    document.write_bytes(b'<!doctype html><style>html,body{margin:0;width:1024px;height:1024px;overflow:hidden;background:transparent}svg{display:block}</style>' + svg)
    subprocess.run([args.chrome, '--headless', '--no-first-run', '--no-default-browser-check',
                    '--disable-extensions', '--disable-sync', '--disable-component-update',
                    '--disable-background-networking', '--disable-default-apps', '--disable-breakpad',
                    '--metrics-recording-only', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=1024,1024', '--default-background-color=00000000',
                    f'--user-data-dir={temporary / "profile"}', f'--screenshot={image}', document.as_uri()],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    mark = Image.open(image).convert('RGBA')
    if mark.size != (1024, 1024) or mark.getpixel((0, 0))[3] != 0:
        raise ValueError('Canonical SVG raster must preserve its transparent 1024px canvas')
    mark.save(BRAND / 'aux-mark-white.png')
    mark.resize((16, 16), Image.Resampling.LANCZOS).save(BRAND / 'MenuBarIcon.png')
    mark.resize((32, 32), Image.Resampling.LANCZOS).save(BRAND / 'MenuBarIcon@2x.png')
    icon = Image.new('RGBA', (1024, 1024), '#171717')
    icon.alpha_composite(mark)
    icon.save(BRAND / 'aux-icon-1024.png')
    icon.resize((48, 48), Image.Resampling.LANCZOS).save(ROOT / 'vendor/provided-ui/branding/icon48.png')
    preview = Image.new('RGB', (1200, 760), '#f4f4f6')
    draw = ImageDraw.Draw(preview)
    draw.rectangle((600, 0, 1200, 760), fill='#202124')
    dark = Image.new('RGBA', mark.size, '#0a0a0a')
    dark.putalpha(mark.getchannel('A'))
    for left, foreground in [(0, dark), (600, mark)]:
        scaled = foreground.resize((400, 400), Image.Resampling.LANCZOS)
        preview.paste(scaled, (left + 100, 0), scaled)
        for size, x in [(16, 70), (32, 120), (64, 200), (128, 320)]:
            scaled = icon.resize((size, size), Image.Resampling.LANCZOS)
            preview.paste(scaled, (left + x, 440), scaled)
    preview.save(BRAND / 'aux-artwork-preview.png')
print(json.dumps({'sourceSha256': hashlib.sha256(svg).hexdigest(), 'viewBox': xml.attrib['viewBox'],
                  'pathCount': len(paths), 'groupTransform': 'scale(12.8)',
                  'rasterSize': [1024, 1024], 'alphaBounds': mark.getchannel('A').getbbox(),
                  'appIconCanvas': '#171717', 'shapeTreatment': 'unchanged SVG raster; no crop or contour fitting'}))
