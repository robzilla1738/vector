import { svgPath } from "./render";
import { svg } from "./render";
import type { Props } from "./svg-props";

export const ArrowLeft = (props: Props) =>
  svg(props, svgPath("M10 5.75L3.75 12L10 18.25"), svgPath("M4.5 12H20.25"));
