import type { ButtonHTMLAttributes } from "react";
import "./ui.css";

export function Button({
  tone = "default",
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "default" | "primary" | "ghost" | "danger";
  size?: "default" | "small" | 24 | 28 | 32 | 36;
}) {
  return (
    <button
      {...props}
      type={type}
      data-control-size={typeof size === "number" ? size : size === "small" ? 28 : 32}
      className={`btn${tone === "default" ? "" : ` ${tone}`}${size === "small" ? " sm" : ""} ${className}`.trim()}
    />
  );
}

export function IconButton({
  label,
  size = 32,
  className = "",
  controlRef,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: 24 | 28 | 32 | 36;
  controlRef?: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      {...props}
      ref={controlRef}
      type={type}
      aria-label={label}
      data-control-size={size}
      className={`icon-btn ${className}`.trim()}
    />
  );
}
