import type { Props } from "./svg-props";
import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";

export const ArrowLeft = (props: Props) => (<svg {...baseSvgProps} {...props}><path d="M10 5.75L3.75 12L10 18.25" {...roundJoinedStrokeProps}/><path d="M4.5 12H20.25" {...roundJoinedStrokeProps}/></svg>);
