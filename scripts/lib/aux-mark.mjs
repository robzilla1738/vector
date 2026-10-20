import { readFile } from 'node:fs/promises';

export async function readAuxMark() {
  const svg = await readFile(
    new URL('../../assets/brand/arch-mark.svg', import.meta.url),
    'utf8',
  );
  const paths = [
    ...svg.matchAll(/<path\s+d="([^"]+)"\s+fill="#fff"\s*\/>/g),
  ].map((match) => match[1]);
  const transform = svg.match(
    /<g transform="([^"]+)" clip-path="url\(#([^)]*)\)"/,
  );
  const clip = svg.match(/<rect width="(\d+)" height="(\d+)" fill="#fff"/);
  if (
    !svg.includes('viewBox="0 0 1024 1024"') ||
    paths.length !== 2 ||
    !transform ||
    !clip ||
    transform[1] !== 'scale(12.8)'
  )
    throw new Error('Canonical two-path Aux SVG structure changed');
  return {
    svg,
    paths,
    transform: transform[1],
    clipId: transform[2],
    clipWidth: Number(clip[1]),
    clipHeight: Number(clip[2]),
  };
}

export function auxMarkReactChildren(runtime, mark, opacity = 0.3) {
  if (!/^\w+$/.test(runtime)) throw new Error('Invalid JSX runtime identifier');
  if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1)
    throw new Error('Invalid Aux mark opacity');
  const jsx = `(0,${runtime}.jsx)`,
    jsxs = `(0,${runtime}.jsxs)`;
  const paths = mark.paths
    .map((d) => `${jsx}("path",${JSON.stringify({ d, fill: 'currentColor' })})`)
    .join(',');
  return `[${jsx}("defs",{children:${jsx}("clipPath",{id:${JSON.stringify(mark.clipId)},children:${jsx}("rect",${JSON.stringify({ width: mark.clipWidth, height: mark.clipHeight, fill: '#fff' })})})}),${jsxs}("g",{transform:${JSON.stringify(mark.transform)},clipPath:${JSON.stringify(`url(#${mark.clipId})`)},fillOpacity:${opacity},children:[${paths}]})]`;
}

export function auxMarkSvg(mark, color, opacity) {
  return mark.svg
    .replace('width="1024" height="1024"', 'width="64" height="64"')
    .replace('<svg ', `<svg opacity="${opacity}" `)
    .replaceAll('fill="#fff"', `fill="${color}"`);
}
