import { expect, it } from "vitest";
import { COMMANDS } from "../../packages/contracts/src/commands";

it("adds only the mounted image and model commands with their original window policy", () => {
  const ids = [
    "select-model-provider", "save-model-endpoint", "discover-provider-models", "save-provider-model-key",
    "save-planner-model", "probe-model-connection", "show-model-probe-details", "save-vision-model",
    "save-model-role", "use-automatic-model-role", "set-model-worker-limit", "set-model-turn-limit",
    "manage-model-provider", "edit-provider-models", "reauthenticate-model-provider",
    "toggle-model-provider-connection", "remove-saved-model-key", "set-image-generation-model",
    "confirm-model-key-removal", "cancel-model-key-removal",
  ];
  const rows = COMMANDS.filter(row => ids.includes(row.id));
  expect(rows.map(row => row.id)).toEqual(ids);
  expect(new Set(COMMANDS.map(row => row.id)).size).toBe(COMMANDS.length);
  for (const row of rows) {
    expect(row).toMatchObject({ handler: "shell", section: "Application", windows: ["normal", "private"], palette: false,
      intercept: true, focusShell: true, bindings: [], dispatch: "scoped" });
  }
});

it("registers chat history, Tasks and the focused More control with exact normal-window policy", () => {
  expect(COMMANDS.filter(row => ["open-chat-history", "open-tasks", "toggle-sidebar-more"].includes(row.id))).toEqual([
    { id: "open-chat-history", label: "Chats", section: "Application", handler: "shell", windows: ["normal"], focusShell: true, bindings: [] },
    { id: "open-tasks", label: "Tasks", section: "Application", handler: "shell", windows: ["normal"], focusShell: true, bindings: [] },
    { id: "toggle-sidebar-more", label: "Toggle browser tools", section: "Application", handler: "shell", focusShell: true, palette: false, windows: ["normal"], bindings: [], intercept: true, dispatch: "scoped" },
  ]);
});
