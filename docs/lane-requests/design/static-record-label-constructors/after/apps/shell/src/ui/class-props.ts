const classAttribute = <const C extends string>(className: C) => Object.freeze({ className });
/** Closed static attributes; each JSX spread still constructs fresh props. */
export const staticHintProps = classAttribute("hint");
export const staticRowProps = classAttribute("row");
export const staticFieldErrorProps = classAttribute("field-error");
export const staticFieldProps = classAttribute("field");
export const staticMenuItemProps = classAttribute("menu-item");
export const staticIconButtonProps = classAttribute("icon-btn");
export const staticMcpSourceLabelProps = classAttribute("mcp-source-label");
export const staticMcpSourceValueProps = classAttribute("mcp-source-value");
export const staticSmallIconButtonProps = classAttribute("icon-btn sm");
export const staticFieldInputProps = classAttribute("field-input");
