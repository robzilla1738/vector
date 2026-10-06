import { svgPath } from "./render";
import { svg } from "./render";
import type { Props } from "./svg-props";

export const ArrowRight = (props: Props) =>
  svg(props, svgPath("M14 5.75L20.25 12L14 18.25"), svgPath("M19.5 12H3.75"));
