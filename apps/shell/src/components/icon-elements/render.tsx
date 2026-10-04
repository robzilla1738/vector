import { baseSvgProps, roundJoinedStrokeProps } from "./svg-props";
import { createElement, type ComponentType, type ReactElement, type ReactNode, type SVGProps } from "react";

type IcoSize = "sm" | "md" | "lg";

export function icon(Icon: ComponentType<SVGProps<SVGSVGElement>>, size: IcoSize = "md", fill = "none"): ReactElement {
  return (
    <span className={`ci ico-${size}`} aria-hidden>
      <Icon fill={fill} />
    </span>
  );
}

export function svg(props: SVGProps<SVGSVGElement>, ...children: ReactNode[]): ReactElement {
  return createElement("svg", { ...baseSvgProps, ...props }, ...children);
}

export function svgPath(d: string, stroke: Pick<SVGProps<SVGPathElement>, "stroke" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin"> = roundJoinedStrokeProps): ReactElement {
  return createElement("path", { d, ...stroke });
}
