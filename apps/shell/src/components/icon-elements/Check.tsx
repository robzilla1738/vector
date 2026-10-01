import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const Check = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M6.75 13.0625L9.9 16.25L17.25 7.75" {...roundJoinedStrokeProps}/></svg>);

export const shellIconCheck = /* @__PURE__ */ icon(Check, "sm");
