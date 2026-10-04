import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const ArrowUpRight = (props: Props) => (svg(props, svgPath("M18.25 15.25V5.75M18.25 5.75H8.75M18.25 5.75L6 18")));

export const shellIconOpen = /* @__PURE__ */ icon(ArrowUpRight, "sm");
