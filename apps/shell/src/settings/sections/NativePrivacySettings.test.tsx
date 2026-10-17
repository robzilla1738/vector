// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useStore } from "../../store";
import { NativePrivacyLink } from "./NativePrivacySettings";

vi.mock("../../bridge", async (original) => ({
  ...(await original<typeof import("../../bridge")>()),
  inNativeHost: true,
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("opens native privacy destinations once per pending navigation and disables inactive controls", async () => {
  const previous = useStore.getState().newTab;
  let settle!: () => void;
  const open = vi.fn(
    () =>
      new Promise<null>((resolve) => {
        settle = () => resolve(null);
      }),
  );
  useStore.setState({ newTab: open });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(<NativePrivacyLink active destination="content" label="Open site settings" />),
    );
    const button = host.querySelector("button")!;
    await act(async () => {
      button.click();
      button.click();
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith("chrome://settings/content");
    expect(button.disabled).toBe(true);
    await act(async () => settle());
    await act(async () =>
      root.render(
        <NativePrivacyLink active={false} destination="security" label="Open advanced security settings" />,
      ),
    );
    await act(async () => button.click());
    expect(open).toHaveBeenCalledTimes(1);
    await act(async () =>
      root.render(
        <NativePrivacyLink active destination="security" label="Open advanced security settings" />,
      ),
    );
    await act(async () => button.click());
    expect(open).toHaveBeenLastCalledWith("chrome://settings/security");
    await act(async () => settle());
  } finally {
    await act(async () => root.unmount());
    useStore.setState({ newTab: previous });
  }
});
