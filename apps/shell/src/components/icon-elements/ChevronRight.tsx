import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const ChevronRight = (props: Props) => (svg(props, svgPath("M9.5 18.25L15.75 12L9.5 5.75")));

export const shellIconFwd = /* @__PURE__ */ icon(ChevronRight);
export const shellIconRight = /* @__PURE__ */ icon(ChevronRight, "sm");
