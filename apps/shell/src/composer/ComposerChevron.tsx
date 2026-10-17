import { shellIconDown } from "../ui/icons";
import "./ComposerControl.css";

/** The same chevron and trigger scale for native selects and menu buttons. */
export function ComposerChevron() {
  return (
    <span className="composer-chevron" aria-hidden="true">
      {shellIconDown}
    </span>
  );
}
