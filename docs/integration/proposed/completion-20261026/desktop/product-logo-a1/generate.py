#!/usr/bin/env python3
"""Derive Aux product-logo artwork for Chromium from assets/brand/arch-mark.svg.

Usage: generate.py <chromium-src> <workspace-root> <out-dir>
The two arch-mark paths are read verbatim from the canonical SVG; vector .icon
files are an exact affine (scale + offset) transcription of those paths.
"""
import pathlib, re, sys

src_root, ws_root, out = map(pathlib.Path, sys.argv[1:4])
mark = (ws_root / 'assets/brand/arch-mark.svg').read_text()
PATHS = re.findall(r'<path d="([^"]+)"', mark)
assert len(PATHS) == 2, PATHS
ATTRIBUTION = '<!-- SVG created with Arrow, by QuiverAI (https://quiver.ai) -->'
assert ATTRIBUTION in mark
TILE = '#171717'  # Same canvas colour as assets/brand/aux-icon-1024.png.


def fmt(v):
    v = round(v, 3)
    if v == int(v):
        return str(int(v))
    s = ('%.3f' % v).rstrip('0').rstrip('.')
    return s + 'f'


def tokens(d):
    for m in re.finditer(r'[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?', d):
        yield m.group(0)


def icon_path(d, scale, ox=0.0, oy=0.0):
    out, toks, cmd, first = [], list(tokens(d)), None, True
    prev_cp = None  # (dx2, dy2, dx, dy) of previous relative cubic
    i = 0
    nums = lambda n: [float(t) for t in toks[i:i + n]]
    while i < len(toks):
        if toks[i].isalpha():
            cmd = toks[i]; i += 1
            if cmd in 'zZ':
                out.append('CLOSE,'); prev_cp = None; continue
        if cmd == 'm':
            x, y = nums(2); i += 2
            if not first:
                raise SystemExit('only a leading moveto is supported')
            out.append('MOVE_TO, %s, %s,' % (fmt(x * scale + ox), fmt(y * scale + oy)))
            first, cmd, prev_cp = False, 'l', None
        elif cmd == 'c':
            a = nums(6); i += 6
            out.append('R_CUBIC_TO, ' + ', '.join(fmt(v * scale) for v in a) + ',')
            prev_cp = (a[2], a[3], a[4], a[5])
        elif cmd == 's':
            a = nums(4); i += 4
            c1 = (prev_cp[2] - prev_cp[0], prev_cp[3] - prev_cp[1]) if prev_cp else (0.0, 0.0)
            full = [c1[0], c1[1]] + a
            out.append('R_CUBIC_TO, ' + ', '.join(fmt(v * scale) for v in full) + ',')
            prev_cp = (a[0], a[1], a[2], a[3])
        elif cmd == 'v':
            (y,) = nums(1); i += 1
            out.append('R_V_LINE_TO, %s,' % fmt(y * scale)); prev_cp = None
        elif cmd == 'h':
            (x,) = nums(1); i += 1
            out.append('R_H_LINE_TO, %s,' % fmt(x * scale)); prev_cp = None
        elif cmd == 'l':
            x, y = nums(2); i += 2
            out.append('R_LINE_TO, %s, %s,' % (fmt(x * scale), fmt(y * scale))); prev_cp = None
        else:
            raise SystemExit('unsupported command %r' % cmd)
    return out


def header(rel):
    lines = (src_root / rel).read_text().splitlines()
    hdr = []
    for line in lines:
        if not line.startswith('//'):
            break
        hdr.append(line)
    return '\n'.join(hdr) + '\n\n'


def mark_body(canvas, colour=None):
    body = []
    for n, d in enumerate(PATHS):
        if n:
            body.append('NEW_PATH,')
        if colour:
            body.append('PATH_COLOR_ARGB, 0xFF, 0xFF, 0xFF, 0xFF,')
        body += icon_path(d, canvas / 80.0)
    return body


def mono_icon(rel, canvases):
    text = header(rel)
    for n, c in enumerate(canvases):
        if n:
            text += '\n'
        text += '\n'.join(['CANVAS_DIMENSIONS, %d,' % c] + mark_body(c)) + '\n'
    return text


def tile_icon(rel, canvas):
    r, g, b = (int(TILE[k:k + 2], 16) for k in (1, 3, 5))
    body = ['CANVAS_DIMENSIONS, %d,' % canvas,
            'PATH_COLOR_ARGB, 0xFF, 0x%02X, 0x%02X, 0x%02X,' % (r, g, b),
            'MOVE_TO, 0, 0,', 'H_LINE_TO, %d,' % canvas, 'V_LINE_TO, %d,' % canvas,
            'H_LINE_TO, 0,', 'CLOSE,', 'NEW_PATH,']
    return header(rel) + '\n'.join(body + mark_body(canvas, colour=True)) + '\n'


def tile_svg(view, x, y, size, extra=''):
    s = size / 80.0
    paths = '\n'.join('      <path d="%s" fill="#fff"/>' % d for d in PATHS)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 {v} {v}">\n'
        '{attr}\n'
        '  <defs>\n'
        '    <clipPath id="aux-mark-clip">\n'
        '      <rect width="80" height="80" fill="#fff"/>\n'
        '    </clipPath>\n'
        '  </defs>\n'
        '  <g id="aux-logo"{op}>\n'
        '    <rect x="{x}" y="{y}" width="{sz}" height="{sz}" fill="{tile}"/>\n'
        '    <g transform="translate({x} {y}) scale({s})" clip-path="url(#aux-mark-clip)">\n'
        '{paths}\n'
        '    </g>\n'
        '  </g>\n'
        '{extra}'
        '</svg>\n').format(v=view, attr='  ' + ATTRIBUTION, x=x, y=y, sz=size,
                           s=('%g' % s), tile=TILE, paths=paths, extra=extra,
                           op=' opacity="0"' if extra else '')


FADE = ('  <animate attributeName="opacity" fill="freeze" calcMode="spline" dur="1s" '
        'href="#aux-logo" keySplines="0.5 0.35 0.15 1;0.5 0.35 0.15 1" '
        'keyTimes="0;0.5;1" repeatCount="1" values="0;0;1" />\n')

outputs = {
    'components/vector_icons/chromium/product.icon':
        mono_icon('components/vector_icons/chromium/product.icon', [24]),
    'components/vector_icons/chromium/product_refresh.icon':
        tile_icon('components/vector_icons/chromium/product_refresh.icon', 24),
    'components/omnibox/browser/vector_icons/chrome_product.icon':
        mono_icon('components/omnibox/browser/vector_icons/chrome_product.icon', [24]),
    'components/omnibox/browser/vector_icons/product_chrome_refresh_old.icon':
        mono_icon('components/omnibox/browser/vector_icons/product_chrome_refresh_old.icon', [15]),
    'components/omnibox/browser/vector_icons/product_old.icon':
        mono_icon('components/omnibox/browser/vector_icons/product_old.icon', [32, 16]),
    'chrome/app/vector_icons/chrome_product.icon':
        mono_icon('chrome/app/vector_icons/chrome_product.icon', [16]),
    'chrome/app/theme/chromium/product_logo.svg': tile_svg(256, 0, 0, 256),
    # The intro WebUI sizes this canvas at 2x the logo slot ("50% padding").
    'chrome/app/theme/chromium/product_logo_animation.svg': tile_svg(160, 40, 40, 80, FADE),
}
for rel, text in outputs.items():
    p = out / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)
    print(rel)
