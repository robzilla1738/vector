import type { AuxFeature } from "./aux-features.js";
import type { ShortcutBinding, ShortcutCommandDef } from "./shortcut-defs.js";
export interface CommandDef extends ShortcutCommandDef {
    section: "Tabs" | "Page" | "Windows" | "Layout" | "Agent" | "Application" | "Developer";
    keywords?: readonly string[];
    handler: "shell" | "native";
    feature?: AuxFeature;
    dispatch?: "scoped";
    focusShell?: boolean;
    palette?: boolean;
    windows?: readonly ("normal" | "private" | "little" | "quick-ask")[];
}
export declare const COMMANDS: readonly [{
    id: "save-selection-capture-settings";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reload-selection-capture-settings";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "move-selection-action-up";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "move-selection-action-down";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "preview-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "remove-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "add-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-selection-action-preview";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "record-selection-capture-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "disable-selection-capture-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-inline-assist";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-model-endpoint";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "discover-provider-models";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-provider-model-key";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-planner-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "probe-model-connection";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "show-model-probe-details";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-vision-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-model-role";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "use-automatic-model-role";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-model-worker-limit";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-model-turn-limit";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "manage-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "edit-provider-models";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reauthenticate-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-model-provider-connection";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "remove-saved-model-key";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-image-generation-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "confirm-model-key-removal";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "cancel-model-key-removal";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "capture-conversation-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-conversation-image-region";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "attach-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "use-whole-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "preview-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "fit-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "show-conversation-image-actual-size";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "zoom-conversation-image-out";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "zoom-conversation-image-in";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-conversation-image-details";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-conversation-image-preview";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "attach-conversation-document";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "load-conversation-history";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reload-conversation-context";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-error-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-home-search";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-home-ask";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "open-home-conversation";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-conversation-answer";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-conversation-steer";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-conversation-queue";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reload-conversation-request";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "edit-conversation-queued-message";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "remove-conversation-queued-message";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "restore-archived-conversation";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reopen-conversation-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "export-conversation-markdown";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "continue-conversation-in-rail";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-browser-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "jump-conversation-to-latest";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-context";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-preview-menu";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "activate-conversation-preview-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "split-conversation-preview-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-sources";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-conversation-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "open-conversation-recorded-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "choose-conversation-source-profile";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "cancel-conversation-source-profile";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "preview-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "remove-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "preview-conversation-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "open-conversation-supporting-content";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-conversation-supporting-content";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "increase-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "decrease-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reset-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-conversation-document-read";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-document-text";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-conversation-document-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-conversation-document-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-generated-result-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-generated-result-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "export-generated-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-generated-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-generated-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-saved-result-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-saved-result-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "copy-saved-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-saved-result-export";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "export-saved-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "export-saved-result-excel";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-saved-result-read";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "discard-saved-result-edits";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "save-saved-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "attach-saved-result-copy";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-saved-result-format";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-saved-result-row";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-saved-result-row-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-extension-permissions";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "review-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "cancel-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "confirm-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-library-view";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "select-library-history-range";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-library-load";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "load-more-library-history";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "close-library";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-page-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-page-recovery-address";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "back-page-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "continue-page-over-http";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "proceed-page-certificate";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-page-connection-details";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-task-receipt-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "capture-task-receipt-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "import-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "verify-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-form";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-bookmark";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-download";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-history";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-task-receipt-run-undo";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-undo-change";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-selected-changes";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-task-receipt-run-undo";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-action-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-operation-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-action";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-action";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-operation";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-operation";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "import-prior-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "export-task-receipt";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-captured-text";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-task-receipt-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-fingerprint";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-snapshot";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-task-history";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-task-history";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-history-revision";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-task-history-run";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-history-runs";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-step";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-step";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-step-url";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-step-path";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-installed-build";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-installed-build-error-details";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-installed-feature-availability";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-runtime-restore";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-pending-runtime-restore";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-runtime-restore-status";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "restore-reviewed-local-backup";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "create-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "stage-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-takeover-checkpoint";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-result-details";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-details";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-run-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-citations";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-artifacts";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-citation";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-evidence-error";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-cited-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "copy-run-answer";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "activate-run-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-task";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "repeat-run";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-turn";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-selected-tab";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "revise-run-request";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-run-permissions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-vault";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-model-settings";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-steps";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-page-observation";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "toggle-setup-permission-details";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "create-local-runtime-backup";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-runtime-backup-retention";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-local-backups";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-local-backups";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-local-backup-deletion";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "delete-reviewed-local-backup";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-local-backup-deletion";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "toggle-diagnostics-storage";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "reveal-runtime-data-directory";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "clear-browser-health";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "export-support-report";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-startup-mode";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-startup-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-startup-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-startup-preferences";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-site-language";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "move-site-language-up";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "move-site-language-down";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-site-language";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-language-preferences";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "toggle-system-task-notices";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-task-focus-mode";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-background-runtime";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-background-runtime";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-auto-picture-in-picture";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-auto-picture-in-picture";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-notices";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-task-notice";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "dismiss-task-notice";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "toggle-spell-check";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-spell-check";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-https-first";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-https-first";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "set-default-page-zoom";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-default-page-zoom";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reset-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "create-memory-local-backup";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-memory-offline-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-import-space";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "preview-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-memory-import-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-import-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "enable-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "commit-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-memory-import-receipts";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-memory-import-space";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "toggle-quick-ask-shortcut";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "quickAsk";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-browser-autocomplete";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "retry-quick-ask-shortcut";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "quickAsk";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-custom-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-keyword-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-keyword-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "set-default-browser";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-exclusions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "exclude-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "allow-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reload-memory-exclusions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "filter-memory-notes";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-note-use";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-note-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "delete-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-memory-note-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-memory-note-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "load-latest-memory-notes";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-memory-note-against-latest";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-browsing-memory-retention";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory-pages";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-browsing-memory-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "prepare-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-browsing-memory-load";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-space";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-memory-search";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-memory-load";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "set-site-agent-access";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "delete-site-agent-rule";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "revoke-site-agent-grant";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "approve-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "allow-agent-action-for-origin";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "deny-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "take-over-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pause-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "resume-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "stop-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "take-run-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "return-run-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "open-run-tab";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "take-page-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "return-agent-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}, {
    id: "set-agent-effect-grants";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-browser-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browser-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-browser-context";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-content-memory-retention";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory-sites";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-content-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "read-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-content-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "ask-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-content-memory-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-pipeline";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "extract-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-space-memory-pipeline";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-all-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-history";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "restore-space-memory-revision";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-forget-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-forget-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-space-memory-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-space-memory-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "use-saved-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "overwrite-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-enabled";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-overview";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "update-browser-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "mention-insert";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "tabMentions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "mention-remove";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "tabMentions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "open-chat-history";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "open-tasks";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "toggle-sidebar-section";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-sidebar-spaces";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "toggle-sidebar-more";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}, {
    id: "command-tabs";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-observe";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-inline-assist";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    readonly id: "command-collect-tabs";
    readonly label: "Collect open tabs into a Set";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "subagents";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-reading-list";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-autofill";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-vault-fill";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-translate";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "aiTranslate";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-show-original";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "aiTranslate";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-bookmarks";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-attach-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-detach-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-open-live-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    readonly id: "command-new-space";
    readonly label: "New Space";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    readonly id: "command-switch-space";
    readonly label: "Switch Space";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly palette: false;
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "command-borrow-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    readonly id: "command-borrow-tab";
    readonly label: "Borrow attached Chrome tab";
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    id: "export-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    readonly id: "record-demonstration";
    readonly label: "Record a demonstration";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
}, {
    id: "pause-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "resume-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "stop-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "discard-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "save-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "queue-for-tonight";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
}, {
    id: "review-overnight";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
}, {
    id: "review-overnight-item";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "save-night-shift-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "toggle-night-shift-enabled";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "toggle-night-shift-ac";
    readonly label: string;
    readonly dispatch: "scoped";
}, {
    id: "configure-night-shift";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "prepare-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "test-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "check-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "propose-skill-repair";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    id: "approve-skill-repair";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}, {
    readonly id: "show-download-settings";
    readonly label: "Download naming settings";
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly windows: readonly ["normal"];
}, {
    id: "set-download-naming";
    label: string;
} & {
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly palette: false;
    readonly windows: readonly ["normal"];
}, {
    id: "undo-download-rename";
    label: string;
} & {
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly palette: false;
    readonly windows: readonly ["normal"];
}, {
    id: "create-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "open-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "rename-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "archive-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "delete-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "set-profile-appearance";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "refresh-browser-profiles";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "save-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "test-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "resolve-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "refresh-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "set-javascript-apple-events";
    readonly label: "Allow JavaScript from Apple Events";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "appleScript";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "extension-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-extension-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "show-extensions";
    readonly label: "Manage extensions";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "close-extension-panel";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "set-extension-command-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "install-store-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "install-unpacked-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "update-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "reload-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "set-extension-enabled";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "remove-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "claim-tab";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "windowSync";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "show-tab-window";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "windowSync";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "little-space-picker";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly windows: readonly ["little"];
    readonly bindings: readonly [];
}, {
    id: "little-downloads";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly windows: readonly ["little"];
    readonly bindings: readonly [];
}, {
    readonly id: "set-external-link-target";
    readonly label: "Choose where external links open";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly palette: false;
    readonly bindings: readonly [];
}, {
    id: "focus-profile-space";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "move-tab-to-profile";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "show-profiles";
    readonly label: "Manage Profiles";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "show-link-routing";
    readonly label: "Manage link routing";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "minimal-ui";
    readonly label: "Minimal UI";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "minimalUi";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "pin-tab";
    readonly label: "Pin or unpin tab";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "little-window";
    readonly label: "New Little window";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "promote-tab";
    readonly label: "Open in main window";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "picture-in-picture";
    readonly label: "Picture in picture";
    readonly section: "Page";
    readonly handler: "shell";
    readonly feature: "pictureInPicture";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "copy-url";
    readonly label: "Copy URL";
    readonly section: "Page";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-add";
    readonly label: "Split with…";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-close";
    readonly label: "Close split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-next";
    readonly label: "Focus next split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-previous";
    readonly label: "Focus previous split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-swap";
    readonly label: "Swap split sides";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-flip";
    readonly label: "Flip split layout";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "split-separate";
    readonly label: "Separate split tabs";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly windows: readonly ["normal", "private"];
    readonly bindings: readonly [];
}, {
    readonly id: "split-resize";
    readonly label: "Resize split divider";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal", "private"];
    readonly bindings: readonly [];
}, {
    readonly id: "mute-tab";
    readonly label: "Mute or unmute tab";
    readonly section: "Page";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}, {
    readonly id: "new-tab";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "New Tab";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "new-window";
    readonly section: "Windows";
    readonly handler: "native";
    readonly label: "New Window";
    readonly bindings: readonly [ShortcutBinding];
}, {
    readonly id: "new-private-window";
    readonly section: "Windows";
    readonly handler: "native";
    readonly label: "New Private Window";
    readonly bindings: readonly [ShortcutBinding];
}, {
    readonly id: "open-file";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "reopen-closed-tab";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "close-tab";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "close-window";
    readonly label: string;
    readonly section: "Windows";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "print";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "save-pdf";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "new-chat";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "New chat";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "quick-ask";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "Quick Ask";
    readonly bindings: readonly [ShortcutBinding];
}, {
    readonly id: "find";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "find-next";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "find-previous";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "reload";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "hard-reload";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "actual-size";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "zoom-in";
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Zoom In";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
}, {
    readonly id: "zoom-out";
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Zoom Out";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
}, {
    readonly id: "reader";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "sidebar";
    readonly label: string;
    readonly section: "Layout";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "sidebar-hide";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly label: "Hide Sidebar";
    readonly bindings: readonly [];
    readonly palette: false;
    readonly windows: readonly ["normal", "private"];
}, {
    readonly id: "overview";
    readonly label: string;
    readonly section: "Layout";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "devtools";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "inspect-element";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "view-source";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "back";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "forward";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "open-address";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Open Address";
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "palette";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Application";
    readonly handler: "shell";
    readonly label: "Command Palette";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "settings";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly section: "Application";
    readonly handler: "shell";
    readonly label: "Settings";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "history";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "downloads";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "bookmark";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "bookmark-all";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "agent-rail";
    readonly windows: readonly ["normal"];
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "Toggle Agent Rail";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
}, {
    readonly id: "clear-history";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
}, {
    readonly id: "tab-next";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "Next Tab";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
}, {
    readonly id: "tab-previous";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "Previous Tab";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
}, ...({
    readonly id: "tab-1" | "tab-2" | "tab-4" | "tab-3" | "tab-5" | "tab-6" | "tab-7" | "tab-8" | "tab-9";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "space-1" | "space-2" | "space-4" | "space-3" | "space-5" | "space-6" | "space-7" | "space-8" | "space-9";
    readonly label: "Switch to Space 1" | "Switch to Space 2" | "Switch to Space 4" | "Switch to Space 3" | "Switch to Space 5" | "Switch to Space 6" | "Switch to Space 7" | "Switch to Space 8" | "Switch to Space 9";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "profile-1" | "profile-2" | "profile-4" | "profile-3" | "profile-5" | "profile-6" | "profile-7" | "profile-8" | "profile-9";
    readonly label: "Switch to Profile 1" | "Switch to Profile 2" | "Switch to Profile 4" | "Switch to Profile 3" | "Switch to Profile 5" | "Switch to Profile 6" | "Switch to Profile 7" | "Switch to Profile 8" | "Switch to Profile 9";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
})[], {
    id: "reset-pinned-app";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "toggle-pin-keep-awake";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "open-pinned-app";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-open-new-tab";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-open-background";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-copy-url";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-reorder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "pin-unpin";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "clear-today";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "make-live-folder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "refresh-live-folder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "open-live-folder-item";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "connect-github";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "revoke-github";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "archive-restore";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "archive-restore-all";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "archive-delete";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    id: "archive-undo";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "acknowledge-auto-archive";
    readonly label: "Acknowledge auto-archive";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "configure-auto-archive";
    readonly label: "Change auto-archive policy";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}, {
    readonly id: "save-live-folder";
    readonly label: "Save live folder";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly bindings: readonly [];
}, {
    readonly id: "set-auto-archive-policy";
    readonly label: "Set auto-archive policy";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly bindings: readonly [];
}, {
    readonly id: "show-archived-tabs";
    readonly label: "Show archived tabs";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly bindings: readonly [];
}];
export declare const SCOPED_COMMANDS: (({
    id: "save-selection-capture-settings";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reload-selection-capture-settings";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "move-selection-action-up";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "move-selection-action-down";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "preview-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "remove-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "add-selection-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-selection-action-preview";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "record-selection-capture-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "disable-selection-capture-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-inline-assist";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-model-endpoint";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "discover-provider-models";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-provider-model-key";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-planner-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "probe-model-connection";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "show-model-probe-details";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-vision-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-model-role";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "use-automatic-model-role";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-model-worker-limit";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-model-turn-limit";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "manage-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "edit-provider-models";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reauthenticate-model-provider";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-model-provider-connection";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "remove-saved-model-key";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-image-generation-model";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "confirm-model-key-removal";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "cancel-model-key-removal";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "capture-conversation-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-conversation-image-region";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "attach-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "use-whole-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "preview-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "fit-conversation-image";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "show-conversation-image-actual-size";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "zoom-conversation-image-out";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "zoom-conversation-image-in";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-conversation-image-details";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-conversation-image-preview";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "attach-conversation-document";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "load-conversation-history";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reload-conversation-context";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-error-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-home-search";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-home-ask";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "open-home-conversation";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-conversation-answer";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-conversation-steer";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-conversation-queue";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reload-conversation-request";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "edit-conversation-queued-message";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "remove-conversation-queued-message";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "restore-archived-conversation";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reopen-conversation-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "export-conversation-markdown";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "continue-conversation-in-rail";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-browser-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "jump-conversation-to-latest";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-context";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-preview-menu";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "activate-conversation-preview-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "split-conversation-preview-page";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-sources";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-conversation-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "open-conversation-recorded-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "choose-conversation-source-profile";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "cancel-conversation-source-profile";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "preview-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "remove-conversation-document";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "preview-conversation-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "open-conversation-supporting-content";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-conversation-supporting-content";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "increase-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "decrease-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reset-conversation-supporting-width";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-conversation-document-read";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-document-text";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-conversation-document-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-conversation-document-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-generated-result-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-generated-result-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "export-generated-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-generated-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-generated-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-saved-result-preview";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-saved-result-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "copy-saved-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-saved-result-export";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "export-saved-result";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "export-saved-result-excel";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-saved-result-read";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "discard-saved-result-edits";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "save-saved-result-version";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "attach-saved-result-copy";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-saved-result-format";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-saved-result-row";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-saved-result-row-details";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-extension-permissions";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "review-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "cancel-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "confirm-extension-removal";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-library-view";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "select-library-history-range";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-library-load";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "load-more-library-history";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "close-library";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-page-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-page-recovery-address";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "back-page-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "continue-page-over-http";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "proceed-page-certificate";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-page-connection-details";
    label: string;
} & {
    readonly section: "Page";
    readonly windows: readonly ["normal", "private", "little", "quick-ask"];
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-task-receipt-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "capture-task-receipt-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "import-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-task-receipt-document";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "verify-task-receipt-criterion";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-form";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-bookmark";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-download";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-history";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-task-receipt-run-undo";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-undo-change";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "undo-task-receipt-selected-changes";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-task-receipt-run-undo";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-action-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-receipt-operation-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-action";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-action";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-task-receipt-operation";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reject-task-receipt-operation";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "import-prior-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-personal-info";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "export-task-receipt";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-captured-text";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-task-receipt-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-fingerprint";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-receipt-snapshot";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-task-history";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-task-history";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-task-history-revision";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-task-history-run";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-history-runs";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-step";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-step";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-step-url";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-step-path";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-installed-build";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-installed-build-error-details";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-installed-feature-availability";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-runtime-restore";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-pending-runtime-restore";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-runtime-restore-status";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "restore-reviewed-local-backup";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "create-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "stage-protected-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-takeover-checkpoint";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-result-details";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-details";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-run-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-evidence";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-citations";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-artifacts";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-citation";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "inspect-run-artifact";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-evidence-error";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-cited-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "copy-run-answer";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "activate-run-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-task";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "repeat-run";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-turn";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-selected-tab";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "revise-run-request";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-run-permissions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-vault";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-run-model-settings";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-steps";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-run-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly palette: false;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-run-page-observation";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-setup-permission-details";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "create-local-runtime-backup";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-runtime-backup-retention";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-local-backups";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-local-backups";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-local-backup-deletion";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "delete-reviewed-local-backup";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-local-backup-deletion";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-diagnostics-storage";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "reveal-runtime-data-directory";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "clear-browser-health";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "export-support-report";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-startup-mode";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-startup-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-startup-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-startup-preferences";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-site-language";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "move-site-language-up";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "move-site-language-down";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-site-language";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-language-preferences";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-system-task-notices";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-task-focus-mode";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-background-runtime";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-background-runtime";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-auto-picture-in-picture";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-auto-picture-in-picture";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-task-notices";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-task-notice";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "dismiss-task-notice";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-spell-check";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-spell-check";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-https-first";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-https-first";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "set-default-page-zoom";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-default-page-zoom";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "choose-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reset-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-download-folder";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "create-memory-local-backup";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-memory-offline-recovery";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-import-space";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "preview-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-memory-import-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-import-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "enable-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "commit-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-memory-import-receipts";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "review-memory-import-space";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-quick-ask-shortcut";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "quickAsk";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-browser-autocomplete";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "retry-quick-ask-shortcut";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "quickAsk";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-custom-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-keyword-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-keyword-search-engine";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "set-default-browser";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-exclusions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "exclude-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "allow-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "reload-memory-exclusions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "add-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "filter-memory-notes";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-note-use";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-memory-note-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "edit-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "delete-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-memory-note-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-memory-note-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "load-latest-memory-notes";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-memory-note-against-latest";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-browsing-memory-retention";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browsing-memory-pages";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-browsing-memory-page";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-browsing-memory-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "prepare-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-forget-browsing-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-browsing-memory-load";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-memory-space";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-memory-search";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "retry-memory-load";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "set-site-agent-access";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "delete-site-agent-rule";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "revoke-site-agent-grant";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "approve-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "allow-agent-action-for-origin";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "deny-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "take-over-agent-action";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pause-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "resume-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "stop-run";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "take-run-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "return-run-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "open-run-tab";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "take-page-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "return-agent-control";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
}) | ({
    id: "set-agent-effect-grants";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "agentSitePermissions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-browser-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-browser-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-browser-context";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "set-content-memory-retention";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory-sites";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "remove-content-memory-site";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "read-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "open-content-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "ask-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-clear-content-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "close-content-memory-detail";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-content-memory-actions";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-pipeline";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-import";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "select-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "extract-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "refresh-space-memory-pipeline";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "accept-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-space-memory-source";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-space-memory-note";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "forget-all-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-history";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "restore-space-memory-revision";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "confirm-forget-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "cancel-forget-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "save-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "clear-space-memory-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "discard-space-memory-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "use-saved-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "overwrite-space-memory";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-enabled";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly id: "toggle-space-memory-overview";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "update-browser-source";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly palette: false;
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "mention-insert";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "tabMentions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "mention-remove";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "tabMentions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "open-chat-history";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "open-tasks";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "toggle-sidebar-section";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-sidebar-spaces";
    label: string;
} & {
    readonly windows: readonly ["normal", "private"];
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "toggle-sidebar-more";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly intercept: true;
} & {
    readonly dispatch: "scoped";
}) | ({
    id: "command-tabs";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-observe";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-inline-assist";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-reading-list";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-autofill";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-vault-fill";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-translate";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "aiTranslate";
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-show-original";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "aiTranslate";
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-bookmarks";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-attach-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-detach-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-open-live-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "command-borrow-chrome";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
}) | ({
    id: "export-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "pause-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "resume-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "stop-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "discard-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "save-demonstration";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "queue-for-tonight";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
}) | ({
    id: "review-overnight";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
}) | ({
    id: "review-overnight-item";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "save-night-shift-draft";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "toggle-night-shift-enabled";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    readonly intercept: true;
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
} & {
    readonly id: "toggle-night-shift-ac";
    readonly label: string;
    readonly dispatch: "scoped";
}) | ({
    id: "configure-night-shift";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "overnightReview";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "prepare-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "test-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "check-skill-replay";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "automations";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "propose-skill-repair";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "approve-skill-repair";
    label: string;
} & {
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: false;
}) | ({
    id: "set-download-naming";
    label: string;
} & {
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly palette: false;
    readonly windows: readonly ["normal"];
}) | ({
    id: "undo-download-rename";
    label: string;
} & {
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly palette: false;
    readonly windows: readonly ["normal"];
}) | ({
    id: "create-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "open-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "rename-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "archive-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "delete-browser-profile";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "set-profile-appearance";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "refresh-browser-profiles";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "save-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "test-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "resolve-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "refresh-link-routing";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "extension-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-extension-action";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "close-extension-panel";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "set-extension-command-shortcut";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "install-store-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "install-unpacked-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "update-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "reload-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "set-extension-enabled";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "remove-extension";
    label: string;
} & {
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "claim-tab";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "windowSync";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "show-tab-window";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "windowSync";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "little-space-picker";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly windows: readonly ["little"];
    readonly bindings: readonly [];
}) | ({
    id: "little-downloads";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly windows: readonly ["little"];
    readonly bindings: readonly [];
}) | ({
    id: "focus-profile-space";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "move-tab-to-profile";
    label: string;
} & {
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | {
    readonly id: "open-file";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "reopen-closed-tab";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "close-tab";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "close-window";
    readonly label: string;
    readonly section: "Windows";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "print";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "save-pdf";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "find";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "find-next";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "find-previous";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "reload";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "hard-reload";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "actual-size";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "reader";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "sidebar";
    readonly label: string;
    readonly section: "Layout";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "overview";
    readonly label: string;
    readonly section: "Layout";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "devtools";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "inspect-element";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "view-source";
    readonly label: string;
    readonly section: "Developer";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "back";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "forward";
    readonly label: string;
    readonly section: "Page";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "history";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "downloads";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "bookmark";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "bookmark-all";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "clear-history";
    readonly label: string;
    readonly section: "Application";
    readonly handler: "shell";
    readonly bindings: readonly ShortcutBinding[];
    readonly intercept: true;
} | {
    readonly id: "tab-1" | "tab-2" | "tab-4" | "tab-3" | "tab-5" | "tab-6" | "tab-7" | "tab-8" | "tab-9";
    readonly label: string;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "space-1" | "space-2" | "space-4" | "space-3" | "space-5" | "space-6" | "space-7" | "space-8" | "space-9";
    readonly label: "Switch to Space 1" | "Switch to Space 2" | "Switch to Space 4" | "Switch to Space 3" | "Switch to Space 5" | "Switch to Space 6" | "Switch to Space 7" | "Switch to Space 8" | "Switch to Space 9";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "profile-1" | "profile-2" | "profile-4" | "profile-3" | "profile-5" | "profile-6" | "profile-7" | "profile-8" | "profile-9";
    readonly label: "Switch to Profile 1" | "Switch to Profile 2" | "Switch to Profile 4" | "Switch to Profile 3" | "Switch to Profile 5" | "Switch to Profile 6" | "Switch to Profile 7" | "Switch to Profile 8" | "Switch to Profile 9";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | ({
    id: "reset-pinned-app";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "toggle-pin-keep-awake";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "open-pinned-app";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-open-new-tab";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-open-background";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-copy-url";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-reorder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "pin-unpin";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "clear-today";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "make-live-folder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "refresh-live-folder";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "open-live-folder-item";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "connect-github";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "revoke-github";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "archive-restore";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "archive-restore-all";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "archive-delete";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | ({
    id: "archive-undo";
    label: string;
} & {
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
}) | {
    readonly id: "command-collect-tabs";
    readonly label: "Collect open tabs into a Set";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "subagents";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly bindings: readonly [];
} | {
    readonly id: "command-new-space";
    readonly label: "New Space";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly focusShell: true;
    readonly bindings: readonly [];
} | {
    readonly id: "command-switch-space";
    readonly label: "Switch Space";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "spaces";
    readonly palette: false;
    readonly focusShell: true;
    readonly bindings: readonly [];
} | {
    readonly id: "command-borrow-tab";
    readonly label: "Borrow attached Chrome tab";
    readonly section: "Application";
    readonly handler: "shell";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly focusShell: true;
    readonly bindings: readonly [];
} | {
    readonly id: "record-demonstration";
    readonly label: "Record a demonstration";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly feature: "demonstrationSkills";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
    readonly palette: true;
} | {
    readonly id: "show-download-settings";
    readonly label: "Download naming settings";
    readonly section: "Application";
    readonly bindings: readonly [];
    readonly handler: "shell";
    readonly feature: "smartDownloadNames";
    readonly windows: readonly ["normal"];
} | {
    readonly id: "set-javascript-apple-events";
    readonly label: "Allow JavaScript from Apple Events";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "appleScript";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "show-extensions";
    readonly label: "Manage extensions";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "extensions";
    readonly focusShell: true;
    readonly palette: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "set-external-link-target";
    readonly label: "Choose where external links open";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly palette: false;
    readonly bindings: readonly [];
} | {
    readonly id: "show-profiles";
    readonly label: "Manage Profiles";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "profiles";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "show-link-routing";
    readonly label: "Manage link routing";
    readonly section: "Application";
    readonly handler: "shell";
    readonly feature: "linkRouting";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "minimal-ui";
    readonly label: "Minimal UI";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "minimalUi";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "pin-tab";
    readonly label: "Pin or unpin tab";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "pinnedApps";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "little-window";
    readonly label: "New Little window";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "promote-tab";
    readonly label: "Open in main window";
    readonly section: "Windows";
    readonly handler: "shell";
    readonly feature: "littleWindow";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "picture-in-picture";
    readonly label: "Picture in picture";
    readonly section: "Page";
    readonly handler: "shell";
    readonly feature: "pictureInPicture";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "copy-url";
    readonly label: "Copy URL";
    readonly section: "Page";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-add";
    readonly label: "Split with…";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-close";
    readonly label: "Close split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-next";
    readonly label: "Focus next split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-previous";
    readonly label: "Focus previous split pane";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-swap";
    readonly label: "Swap split sides";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-flip";
    readonly label: "Flip split layout";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "split-separate";
    readonly label: "Separate split tabs";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly windows: readonly ["normal", "private"];
    readonly bindings: readonly [];
} | {
    readonly id: "split-resize";
    readonly label: "Resize split divider";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly feature: "splitView";
    readonly focusShell: true;
    readonly palette: false;
    readonly windows: readonly ["normal", "private"];
    readonly bindings: readonly [];
} | {
    readonly id: "mute-tab";
    readonly label: "Mute or unmute tab";
    readonly section: "Page";
    readonly handler: "shell";
    readonly focusShell: true;
    readonly bindings: readonly [];
} | {
    readonly id: "new-tab";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "New Tab";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "new-window";
    readonly section: "Windows";
    readonly handler: "native";
    readonly label: "New Window";
    readonly bindings: readonly [ShortcutBinding];
} | {
    readonly id: "new-private-window";
    readonly section: "Windows";
    readonly handler: "native";
    readonly label: "New Private Window";
    readonly bindings: readonly [ShortcutBinding];
} | {
    readonly id: "new-chat";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "New chat";
    readonly focusShell: true;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "quick-ask";
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "Quick Ask";
    readonly bindings: readonly [ShortcutBinding];
} | {
    readonly id: "zoom-in";
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Zoom In";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
} | {
    readonly id: "zoom-out";
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Zoom Out";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
} | {
    readonly id: "sidebar-hide";
    readonly section: "Layout";
    readonly handler: "shell";
    readonly label: "Hide Sidebar";
    readonly bindings: readonly [];
    readonly palette: false;
    readonly windows: readonly ["normal", "private"];
} | {
    readonly id: "open-address";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Page";
    readonly handler: "shell";
    readonly label: "Open Address";
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "palette";
    readonly windows: readonly ["normal", "private"];
    readonly focusShell: true;
    readonly section: "Application";
    readonly handler: "shell";
    readonly label: "Command Palette";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "settings";
    readonly windows: readonly ["normal"];
    readonly focusShell: true;
    readonly section: "Application";
    readonly handler: "shell";
    readonly label: "Settings";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "agent-rail";
    readonly windows: readonly ["normal"];
    readonly section: "Agent";
    readonly handler: "shell";
    readonly label: "Toggle Agent Rail";
    readonly bindings: readonly [ShortcutBinding];
    readonly intercept: true;
} | {
    readonly id: "tab-next";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "Next Tab";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
} | {
    readonly id: "tab-previous";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly label: "Previous Tab";
    readonly intercept: true;
    readonly bindings: readonly [ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding, ShortcutBinding];
} | {
    readonly id: "acknowledge-auto-archive";
    readonly label: "Acknowledge auto-archive";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly palette: false;
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "configure-auto-archive";
    readonly label: "Change auto-archive policy";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly windows: readonly ["normal"];
    readonly bindings: readonly [];
} | {
    readonly id: "save-live-folder";
    readonly label: "Save live folder";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "liveFolders";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly bindings: readonly [];
} | {
    readonly id: "set-auto-archive-policy";
    readonly label: "Set auto-archive policy";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "autoArchive";
    readonly windows: readonly ["normal"];
    readonly palette: false;
    readonly bindings: readonly [];
} | {
    readonly id: "show-archived-tabs";
    readonly label: "Show archived tabs";
    readonly section: "Tabs";
    readonly handler: "shell";
    readonly feature: "archive";
    readonly bindings: readonly [];
})[];
export type ShellCommandId = Extract<(typeof COMMANDS)[number], {
    handler: "shell";
}>["id"];
export type NativeCommandId = Extract<(typeof COMMANDS)[number], {
    handler: "native";
}>["id"];
//# sourceMappingURL=commands.d.ts.map