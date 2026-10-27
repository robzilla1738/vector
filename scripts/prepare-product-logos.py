#!/usr/bin/python3
"""Write Aux's mark over Chromium's product logo and favicon (chrome://version, About).

Each output keeps the upstream canvas size so page layout is unchanged; the mark
is drawn from assets/brand/aux-mark-white.png, left-aligned in the wordmark slot.
Run with the system Python (it has Pillow): /usr/bin/python3 scripts/prepare-product-logos.py
"""
from pathlib import Path
import sys

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from aux_chromium import chromium_src  # noqa: E402

MARK = Image.open(Path(__file__).resolve().parent.parent / 'assets/brand/aux-mark-white.png').convert('RGBA')
DARK, WHITE = (32, 33, 36), (255, 255, 255)


def mark(size: int, color: tuple[int, int, int]) -> Image.Image:
    alpha = MARK.crop(MARK.getbbox()).resize((size, size), Image.LANCZOS).getchannel('A')
    tile = Image.new('RGBA', (size, size), color + (0,))
    tile.putalpha(alpha)
    return tile


def write(path: Path, image: Image.Image) -> None:
    upstream = Image.open(path)
    if upstream.size != image.size:
        raise ValueError(f'{path} is {upstream.size}, expected {image.size}')
    image.save(path, optimize=True)


resources = chromium_src() / 'components/resources'
for scale, folder in ((1, 'default_100_percent'), (2, 'default_200_percent')):
    base = resources / folder / 'chromium'
    write(base / 'favicon_product.png', mark(16 * scale, DARK))
    for name, color in (('product_logo.png', DARK), ('product_logo_white.png', WHITE)):
        canvas = Image.new('RGBA', (171 * scale, 32 * scale), (0, 0, 0, 0))
        canvas.alpha_composite(mark(32 * scale, color))
        write(base / name, canvas)
print('wrote 6 product images')
