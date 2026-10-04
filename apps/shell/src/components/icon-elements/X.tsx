import type { Props } from "./svg-props";
import { roundStrokeProps } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const X = (props: Props) => (svg(props, svgPath("M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75", roundStrokeProps)));

export const shellIconStop = /* @__PURE__ */ icon(X);
export const shellIconClose = /* @__PURE__ */ icon(X);
