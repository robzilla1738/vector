import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const ChevronLeft = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M14.5 18.25L8.25 12L14.5 5.75" {...roundJoinedStrokeProps}/></svg>);

export const shellIconBack = /* @__PURE__ */ icon(ChevronLeft);
export const shellIconLeft = /* @__PURE__ */ icon(ChevronLeft, "sm");
