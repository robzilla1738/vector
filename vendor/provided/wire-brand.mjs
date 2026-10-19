/** Preserve supplied protocol spellings while branding surrounding product code. */
export const SUPPLIED_CAPITALIZED_WIRES = Object.freeze([
  'AsideDaemonSessionToken ', 'AsideSessionToken', 'Aside Daemon Auth v1',
  'Aside Daemon Dev Auth v1', 'Aside.',
]);
export function brandProductPreservingWires(source, { productCount, wireCounts }) {
  let code = source;
  const edits = [];
  function edit(name, find, replace, count) {
    const actual = code.split(find).length - 1;
    if (actual !== count) throw new Error(`${name}: expected ${count}, found ${actual}`);
    code = code.split(find).join(replace);
    edits.push({ name, kind: 'branding', find, replace, count });
  }
  if (source.split('Aside').length - 1 !== productCount) throw new Error('Product identifier count drift');
  const counts = SUPPLIED_CAPITALIZED_WIRES.map((wire) => {
    if (!Number.isInteger(wireCounts[wire]) || wireCounts[wire] < 0) throw new Error('Missing pinned wire count');
    return wireCounts[wire];
  });
  // Methods and a quoted dispatch prefix are wire data; prose "use Aside."
  // remains visible branding. Longest first prevents getTab/getTabs collisions.
  const methodMatches = [...source.matchAll(/Aside\.[A-Za-z_$][\w$]*|([`'"])Aside\.\1/g)].map((m) => m[0]);
  if (methodMatches.length !== counts[4]) throw new Error(`Method wire count drift: expected ${counts[4]}, found ${methodMatches.length}`);
  const protectedValues = [...SUPPLIED_CAPITALIZED_WIRES.slice(0, 4), ...new Set(methodMatches)].sort((a, b) => b.length - a.length);
  const masks = [];
  for (let i = 0; i < protectedValues.length; i++) {
    const wire = protectedValues[i], marker = `__AUX_PRESERVED_WIRE_${i}__`;
    if (source.includes(marker)) throw new Error('Wire branding marker collision');
    const fixedIndex = SUPPLIED_CAPITALIZED_WIRES.indexOf(wire);
    const count = fixedIndex >= 0 ? counts[fixedIndex] : code.split(wire).length - 1;
    edit('protect supplied wire spelling', wire, marker, count);
    masks.push({ wire, marker, count });
  }
  edit('visible product and non-wire identifiers', 'Aside', 'Aux', productCount - counts.reduce((a, b) => a + b, 0));
  for (const { wire, marker, count } of masks) edit('restore supplied wire spelling', marker, wire, count);
  return { code, edits };
}
