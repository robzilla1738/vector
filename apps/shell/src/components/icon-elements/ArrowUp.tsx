import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { icon } from "./render";

export const ArrowUp = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M12 20.25V4.5" {...roundJoinedStrokeProps}/><path d="M5.75 10L12 3.75L18.25 10" {...roundJoinedStrokeProps}/></svg>);

export const shellIconSend = /* @__PURE__ */ icon(ArrowUp);
