import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const ChevronLeft = (props: Props) => (svg(props, svgPath("M14.5 18.25L8.25 12L14.5 5.75")));

export const shellIconBack = /* @__PURE__ */ icon(ChevronLeft);
export const shellIconLeft = /* @__PURE__ */ icon(ChevronLeft, "sm");
