import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";

export const ArrowRight = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M14 5.75L20.25 12L14 18.25" {...roundJoinedStrokeProps}/><path d="M19.5 12H3.75" {...roundJoinedStrokeProps}/></svg>);
