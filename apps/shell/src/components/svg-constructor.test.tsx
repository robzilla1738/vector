import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode, type SVGProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import expected from "./svg-constructor-original.json";
const glyphs = import.meta.glob<Record<string, (props: SVGProps<SVGSVGElement>) => ReactElement>>(
  "./icon-elements/*.tsx",
  { eager: true },
);
function elementTree(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(elementTree);
  if (!isValidElement(value)) return value;
  const element = value as ReactElement<{ children?: ReactNode }>;
  return {
    type: typeof element.type === "function" ? element.type.name : element.type,
    key: element.key,
    props: Object.fromEntries(
      Object.entries(element.props).map(([key, item]) => [
        key,
        key === "children" ? elementTree(item) : item,
      ]),
    ),
  };
}
describe("supplied SVG constructor equivalence", () => {
  it("matches original glyph elements and markup for every export and caller override", () => {
    for (const [key, original] of Object.entries(expected)) {
      const [path, name, mode] = key.split("::") as [string, string, string];
      const glyph = glyphs[path]?.[name];
      expect(glyph).toBeTypeOf("function");
      if (!glyph) throw new Error("Original glyph export is missing");
      const props: SVGProps<SVGSVGElement> =
        mode === "default"
          ? {}
          : {
              width: 15,
              height: 16,
              fill: "red",
              viewBox: "1 2 3 4",
              className: "probe",
              focusable: true,
              "aria-hidden": false,
              style: { opacity: 0.5 },
              children: "foreign",
            };
      const element = glyph(props);
      expect(elementTree(element)).toEqual(original.tree);
      expect(renderToStaticMarkup(element)).toBe(original.markup);
      const again = glyph(props);
      expect(element).not.toBe(again);
      const children = (element.props as { children?: ReactNode }).children;
      expect(
        children && typeof children === "object"
          ? children !== (again.props as { children?: ReactNode }).children
          : true,
      ).toBe(true);
    }
  });
  it("preserves an original callback without invoking it during construction", () => {
    const onClick = vi.fn();
    for (const [key] of Object.entries(expected)) {
      const [path, name, mode] = key.split("::") as [string, string, string];
      if (mode !== "default") continue;
      const props = Object.freeze({ onClick });
      const glyph = glyphs[path]?.[name];
      if (!glyph) throw new Error("Original glyph export is missing");
      const element = glyph(props);
      expect((element.props as SVGProps<SVGSVGElement>).onClick).toBe(onClick);
    }
    expect(onClick).not.toHaveBeenCalled();
  });
});
