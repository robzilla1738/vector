import type { SVGProps } from "react";

export type Props = SVGProps<SVGSVGElement>;

export const baseSvgProps = {
  width: "1em", height: "1em", "aria-hidden": "true",
  xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24",
  fill: "none", strokeLinecap: "round", strokeLinejoin: "round",
} as const;

export const strokeProps = { stroke: "currentColor", strokeWidth: "1.5" } as const;

export const roundStrokeProps = { ...strokeProps, strokeLinecap: "round" } as const;

export const joinedStrokeProps = { ...strokeProps, strokeLinejoin: "round" } as const;

export const roundJoinedStrokeProps = { ...roundStrokeProps, strokeLinejoin: "round" } as const;
