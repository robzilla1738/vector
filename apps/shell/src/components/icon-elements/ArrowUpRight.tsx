import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const ArrowUpRight = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M18.25 15.25V5.75M18.25 5.75H8.75M18.25 5.75L6 18" {...roundJoinedStrokeProps}/></svg>);

export const shellIconOpen = /* @__PURE__ */ icon(ArrowUpRight, "sm");
