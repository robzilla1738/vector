import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
export function Button({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error: string;
  retry?: () => void;
}) {
  return (
    <div role="alert" className="error">
      {error}
      {retry && <Button onClick={retry}>Try again</Button>}
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className="dialog" onCancel={onClose} onClose={onClose}>
      <div className="row spread">
        <h2>{title}</h2>
        <Button aria-label="Close" onClick={onClose}>
          ×
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function Mark() {
  return (
    <svg aria-label="Aux" role="img" viewBox="0 0 64 64" width="64" height="64">
      <path
        fill="currentColor"
        d="M8 52 27 12h10l19 40H43l-4-10H25l-4 10zm21-20h6l-3-8z"
      />
    </svg>
  );
}
