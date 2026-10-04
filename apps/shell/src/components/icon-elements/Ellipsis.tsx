import type { Props } from "./svg-props";
import { icon, svg } from "./render";

export const Ellipsis = (props: Props) => (svg(props, <rect x="3" y="10" width="4" height="4" rx="2" fill="currentColor"/>, <rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor"/>, <rect x="17" y="10" width="4" height="4" rx="2" fill="currentColor"/>));

export const shellIconMore = /* @__PURE__ */ icon(Ellipsis);
