import type { Props } from "./svg-props";
import { ArrowUp } from "./ArrowUp";
import { icon } from "./render";

export const ArrowDown = (props: Props) => (
  <ArrowUp {...props} style={{ ...props.style, transform: "rotate(180deg)" }} />
);

export const shellIconArrowDown = /* @__PURE__ */ icon(ArrowDown);
