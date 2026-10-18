/** Vite's logical chunk names and emitted preloads survive output filename hashing. */
export function startupBundle(manifest, { startupEntries, bootModules }, html) {
  const byFile = new Map(Object.entries(manifest).map(([key, chunk]) => [chunk.file, key]));
  const roots = new Set(startupEntries);
  for (const [key, chunk] of Object.entries(manifest)) if (bootModules.includes(chunk.name)) roots.add(key);
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = Object.fromEntries(
      [...tag[0].matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map((match) => [
        match[1].toLowerCase(),
        match[2],
      ]),
    );
    if (attributes.rel !== "modulepreload") continue;
    const file = attributes.href?.replace(/^\.?\//, "");
    const key = byFile.get(file);
    if (!key) throw new Error(`Module preload is absent from the Vite manifest: ${file}`);
    roots.add(key);
  }
  const seen = new Set(),
    js = new Set(),
    css = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Startup chunk is absent from the Vite manifest: ${key}`);
    seen.add(key);
    js.add(chunk.file);
    for (const file of chunk.css ?? []) css.add(file);
    for (const imported of chunk.imports ?? []) visit(imported);
  };
  for (const root of roots) visit(root);
  return { js: [...js], css: [...css] };
}
