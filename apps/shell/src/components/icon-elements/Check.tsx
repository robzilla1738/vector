import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const Check = (props: Props) => (svg(props, svgPath("M6.75 13.0625L9.9 16.25L17.25 7.75")));

export const shellIconCheck = /* @__PURE__ */ icon(Check, "sm");
