import type { Props } from "./svg-props";
import { baseSvgProps, roundStrokeProps } from "./svg-props";
import { icon } from "./render";

export const X = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75" {...roundStrokeProps}/></svg>);

export const shellIconStop = /* @__PURE__ */ icon(X);
export const shellIconClose = /* @__PURE__ */ icon(X);
