import { createContext, useContext, useState, type ReactNode, type RefCallback } from "react";
import { createPortal } from "react-dom";

const Target = createContext<HTMLDivElement | null>(null);
const Register = createContext<RefCallback<HTMLDivElement> | undefined>(undefined);

/** Page-owned titles and actions share the browser's single window toolbar. */
export function WindowToolbarProvider({ children }: { children: ReactNode }) {
  const [target, register] = useState<HTMLDivElement | null>(null);
  return (
    <Register value={register}>
      <Target value={target}>{children}</Target>
    </Register>
  );
}

export function WindowToolbarSlot() {
  const register = useContext(Register);
  return <div className="window-toolbar-content" ref={register} />;
}

export function WindowToolbarContent({ active, children }: { active: boolean; children: ReactNode }) {
  const target = useContext(Target);
  return active && target ? createPortal(children, target) : children;
}
