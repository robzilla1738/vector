import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const ChevronRight = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M9.5 18.25L15.75 12L9.5 5.75" {...roundJoinedStrokeProps}/></svg>);

export const shellIconFwd = /* @__PURE__ */ icon(ChevronRight);
export const shellIconRight = /* @__PURE__ */ icon(ChevronRight, "sm");
