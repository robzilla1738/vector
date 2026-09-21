"""Rebuild Aux assets from the approved raster. Requires Pillow, NumPy, SciPy, OpenCV.
Uses deterministic masks; never synthesizes or repaints the supplied artwork.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy.interpolate import splprep, splev

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / 'apps/desktop/brand'
PUBLIC = ROOT / 'apps/desktop/renderer/public'
source = Image.open(BRAND / 'aux-approved-source.png').convert('RGBA')
rgb = np.array(source)[:, :, :3]
a = np.array(source)[:, :, 3]

def silhouette(binary, opening, smooth):
    mask = binary.astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (opening, opening)))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contour = max(contours, key=cv2.contourArea)[:, 0, :].astype(float)
    curve, _ = splprep(contour.T, s=len(contour)*smooth, per=True)
    points = np.array(splev(np.linspace(0, 1, 4000, endpoint=False), curve)).T
    large = Image.new('L', (source.width * 4, source.height * 4))
    ImageDraw.Draw(large).polygon([tuple(point*4) for point in points], fill=255)
    return large.resize(source.size, Image.Resampling.LANCZOS), curve

# The exterior speckles are nearly white or narrow; the broad colored tile is retained.
maximum = rgb.max(axis=2).astype(float)
saturation = (maximum-rgb.min(axis=2))/np.maximum(maximum,1)
tile_mask, _ = silhouette((saturation > .12) & (maximum > 100) & (a > 230), 19, 2.0)
tile = Image.fromarray(rgb).convert('RGBA')
tile.putalpha(tile_mask)
# Normalize all desktop sizes from one centered 1024px alpha master.
bounds = tile_mask.point(lambda v: 255 if v >= 128 else 0).getbbox()
tile = tile.crop(bounds)
scale = 824 / max(tile.size)
tile = tile.resize(tuple(round(side*scale) for side in tile.size), Image.Resampling.LANCZOS)
icon = Image.new('RGBA', (1024,1024))
icon.alpha_composite(tile, ((1024-tile.width)//2, (1024-tile.height)//2))
icon.save(PUBLIC / 'aux-icon.png')
icon.save(BRAND / 'aux-icon-1024.png')

# Extract the pale interior symbol, not the colored background or tile outline.
y, x = np.indices(a.shape)
mark_mask, curve = silhouette((rgb.min(axis=2)>140) & (maximum>235) & (x>150) & (x<1050) & (y>290) & (y<1020), 7, .65)
mark = Image.new('RGBA',source.size,'white'); mark.putalpha(mark_mask)
box = mark_mask.point(lambda v: 255 if v >= 128 else 0).getbbox()
# Tight transparent mark with 24px breathing room on each edge.
left,top,right,bottom = box
box = (left-24,top-24,right+24,bottom+24)
mark = mark.crop(box)
mark.save(BRAND / 'aux-mark-white.png')
mark.save(PUBLIC / 'aux-mark-white.png')
# Editable cubic outline sampled from the same fitted mask. Shared with the white PNG.
parts=[]
steps=160
for i in range(steps):
    t0,t1=i/steps,(i+1)/steps
    p0=np.array(splev(t0,curve)); p1=np.array(splev(t1,curve))
    d0=np.array(splev(t0,curve,der=1))/steps/3; d1=np.array(splev(t1,curve,der=1))/steps/3
    offset=np.array(box[:2]); p0-=offset;p1-=offset
    fmt=lambda p:f'{p[0]:.2f} {p[1]:.2f}'
    if i==0: parts.append('M'+fmt(p0))
    parts.append('C'+fmt(p0+d0)+' '+fmt(p1-d1)+' '+fmt(p1))
path=' '.join(parts)+' Z'
svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{mark.width}" height="{mark.height}" viewBox="0 0 {mark.width} {mark.height}"><path fill="#fff" d="{path}"/></svg>\n'
(BRAND/'aux-mark-white.svg').write_text(svg)
(PUBLIC/'aux-mark-white.svg').write_text(svg)
# Preview against light and dark backgrounds, plus real-size icon samples.
preview=Image.new('RGB',(1200,850),'#f4f4f6'); draw=ImageDraw.Draw(preview)
draw.rectangle((600,0,1200,850),fill='#202124')
for left,bg in [(0,'#f4f4f6'),(600,'#202124')]:
    small=icon.resize((440,440),Image.Resampling.LANCZOS)
    preview.paste(small,(left+80,20),small)
    for size,px in [(16,70),(32,115),(64,180),(128,290)]:
        scaled=icon.resize((size,size),Image.Resampling.LANCZOS)
        preview.paste(scaled,(left+px,470),scaled)
    if left:
        logo=mark.copy();logo.thumbnail((440,220),Image.Resampling.LANCZOS)
        preview.paste(logo,(left+(600-logo.width)//2,610),logo)
preview.save(BRAND/'aux-artwork-preview.png')
print('Icon bounds:',bounds,'mark bounds:',box,'mark size:',mark.size)
