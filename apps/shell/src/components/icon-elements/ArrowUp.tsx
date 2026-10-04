import type { Props } from "./svg-props";
import { icon, svg, svgPath } from "./render";

export const ArrowUp = (props: Props) => (svg(props, svgPath("M12 20.25V4.5"), svgPath("M5.75 10L12 3.75L18.25 10")));

export const shellIconSend = /* @__PURE__ */ icon(ArrowUp);
