import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../apps/shell/src/", import.meta.url));
async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? cssFiles(path)
        : entry.name.endsWith(".css") && entry.name !== "tokens.css"
          ? [path]
          : [];
    }),
  );
  return groups.flat();
}
let total = 0;
for (const file of (await cssFiles(root)).sort()) {
  const source = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  const colors = [...source.matchAll(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\([^)]*\)/gi)].filter(
    ([color]) => !color.includes("var("),
  );
  const named = [
    ...source.matchAll(
      /(?:background(?:-color)?|color|border(?:-color)?|box-shadow|fill|stroke):([^;{}]+);/g,
    ),
  ].flatMap(([, value]) => [...value.matchAll(/(?<![\w-])(?:white|black|red|blue|yellow|green)(?![\w-])/gi)]);
  colors.push(...named);
  if (!colors.length) continue;
  total += colors.length;
  console.log(`${relative(root, file)}: ${colors.length} raw color${colors.length === 1 ? "" : "s"}`);
}
console.log(
  `Raw CSS colors outside tokens.css: ${total}. Advisory only; theme colors belong in semantic tokens.`,
);
