import type { ComponentType, ReactElement, SVGProps } from "react";

type IcoSize = "sm" | "md" | "lg";

export function icon(Icon: ComponentType<SVGProps<SVGSVGElement>>, size: IcoSize = "md", fill = "none"): ReactElement {
  return (
    <span className={`ci ico-${size}`} aria-hidden>
      <Icon fill={fill} />
    </span>
  );
}
