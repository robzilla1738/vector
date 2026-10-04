import { smallButtonProps } from "../ui/button-props";
import { Component, type ReactNode } from "react";

/**
 * A render failure inside one pane (a conversation, the agent rail) leaves
 * the rest of the browser usable and offers a local retry instead of
 * replacing the whole shell with the boot failure screen.
 */
export class PaneBoundary extends Component<{ label: string; resetKey?: unknown; children: ReactNode }, { error: Error | null; key: unknown }> {
  override state: { error: Error | null; key: unknown } = { error: null, key: this.props.resetKey };
  static getDerivedStateFromError(error: Error) { return { error }; }
  static getDerivedStateFromProps(props: { resetKey?: unknown }, state: { error: Error | null; key: unknown }) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }
  override render() {
    if (!this.state.error) return this.props.children;
    return <div className="pane-failure" role="alert">
      <p><b>{this.props.label} couldn’t be shown.</b> Your tabs and other work are unaffected.</p>
      <button {...smallButtonProps} onClick={() => this.setState({ error: null })}>Try again</button>
    </div>;
  }
}
