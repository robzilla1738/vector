import { z } from "zod";
type Owner = "browser" | "runtime";
type Trust = "aux-webui" | "authenticated-runtime";
export type HostReaderNode = string | {
    tag: string;
    href?: string;
    sourceId?: string;
    children: HostReaderNode[];
};
/** Methods handled by the native WebUI, without authenticated-runtime entries. */
export declare const BrowserHostMethods: {
    readonly capabilities: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            buildId: z.ZodString;
            sourceCommit: z.ZodString;
            methods: z.ZodArray<z.ZodString>;
            qualifiedFeatures: z.ZodArray<z.ZodString>;
            nativeAppearanceFileChannel: z.ZodOptional<z.ZodObject<{
                producer: z.ZodLiteral<"aux-native-appearance-file-channel">;
                version: z.ZodLiteral<1>;
                pid: z.ZodNumber;
                processUuid: z.ZodString;
                processStartMachTicks: z.ZodString;
                buildId: z.ZodString;
                sourceCommit: z.ZodString;
                nonce: z.ZodString;
                basename: z.ZodLiteral<"native-appearance-channel.jsonl">;
                rootDevice: z.ZodString;
                rootInode: z.ZodString;
                profileName: z.ZodLiteral<"Default">;
                profileDevice: z.ZodString;
                profileInode: z.ZodString;
                fileDevice: z.ZodString;
                fileInode: z.ZodString;
                publicKeySpkiHex: z.ZodString;
                headerSha256: z.ZodString;
            }, z.core.$strict>>;
            developmentAcceptanceRequested: z.ZodOptional<z.ZodBoolean>;
            testClockScale: z.ZodOptional<z.ZodNumber>;
            loopbackServicesUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly appearanceSnapshot: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            producer: z.ZodLiteral<"aux-native-appearance-snapshot">;
            version: z.ZodLiteral<1>;
            pid: z.ZodNumber;
            windowId: z.ZodNumber;
            frame: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, z.core.$strict>;
            observedAtUnixMs: z.ZodNumber;
            windowKind: z.ZodEnum<{
                normal: "normal";
                private: "private";
                "quick-ask": "quick-ask";
                little: "little";
            }>;
            nativeTheme: z.ZodNullable<z.ZodEnum<{
                light: "light";
                dark: "dark";
            }>>;
            backing: z.ZodNullable<z.ZodEnum<{
                solid: "solid";
                "liquid-glass": "liquid-glass";
                "visual-effect": "visual-effect";
            }>>;
            material: z.ZodNullable<z.ZodEnum<{
                solid: "solid";
                "liquid-glass": "liquid-glass";
                titlebar: "titlebar";
                sidebar: "sidebar";
                "under-window": "under-window";
            }>>;
            shell: z.ZodObject<{
                theme: z.ZodNullable<z.ZodEnum<{
                    light: "light";
                    dark: "dark";
                }>>;
                layout: z.ZodNullable<z.ZodEnum<{
                    vertical: "vertical";
                    horizontal: "horizontal";
                }>>;
                sidebarAppearance: z.ZodNullable<z.ZodEnum<{
                    solid: "solid";
                    translucent: "translucent";
                }>>;
                systemDark: z.ZodBoolean;
                reduceMotion: z.ZodBoolean;
                reduceTransparency: z.ZodBoolean;
            }, z.core.$strict>;
        }, z.core.$strict>;
    };
    readonly defaultBrowser: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            isDefault: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly setDefaultBrowser: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            isDefault: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly tabCommand: {
        readonly wireArgs: z.ZodTuple<[z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"claim">;
            pageId: z.ZodString;
            activate: z.ZodBoolean;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"split">;
            pageIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            layout: z.ZodEnum<{
                row: "row";
                column: "column";
            }>;
            ratio: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"unsplit">;
            pageId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"open">;
            url: z.ZodOptional<z.ZodString>;
            pageId: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodBoolean>;
            activate: z.ZodOptional<z.ZodBoolean>;
            index: z.ZodOptional<z.ZodNumber>;
            runtimeOwned: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"close">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"activate">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"navigate">;
            pageId: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"back">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"forward">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"reload">;
            pageId: z.ZodString;
            hard: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"stop">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"setMuted">;
            pageId: z.ZodString;
            muted: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"reorder">;
            order: z.ZodArray<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"move">;
            pageId: z.ZodString;
            windowId: z.ZodOptional<z.ZodString>;
            activate: z.ZodOptional<z.ZodBoolean>;
            placement: z.ZodOptional<z.ZodObject<{
                space: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    color: z.ZodString;
                    grain: z.ZodOptional<z.ZodNumber>;
                    theme: z.ZodOptional<z.ZodObject<{
                        hue: z.ZodNumber;
                        lightness: z.ZodNumber;
                        intensity: z.ZodNumber;
                        inverted: z.ZodBoolean;
                    }, z.core.$strict>>;
                    workspaceId: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                folder: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    spaceId: z.ZodString;
                    collapsed: z.ZodBoolean;
                    color: z.ZodOptional<z.ZodString>;
                    emoji: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                tabName: z.ZodOptional<z.ZodObject<{
                    title: z.ZodString;
                    url: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>], "kind">, z.ZodOptional<z.ZodNumber>], null>;
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"claim">;
            pageId: z.ZodString;
            activate: z.ZodBoolean;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"split">;
            pageIds: z.ZodTuple<[z.ZodString, z.ZodString], null>;
            layout: z.ZodEnum<{
                row: "row";
                column: "column";
            }>;
            ratio: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"unsplit">;
            pageId: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"open">;
            url: z.ZodOptional<z.ZodString>;
            pageId: z.ZodOptional<z.ZodString>;
            background: z.ZodOptional<z.ZodBoolean>;
            activate: z.ZodOptional<z.ZodBoolean>;
            index: z.ZodOptional<z.ZodNumber>;
            runtimeOwned: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"close">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"activate">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"navigate">;
            pageId: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"back">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"forward">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"reload">;
            pageId: z.ZodString;
            hard: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"stop">;
            pageId: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"setMuted">;
            pageId: z.ZodString;
            muted: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"reorder">;
            order: z.ZodArray<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            kind: z.ZodLiteral<"move">;
            pageId: z.ZodString;
            windowId: z.ZodOptional<z.ZodString>;
            activate: z.ZodOptional<z.ZodBoolean>;
            placement: z.ZodOptional<z.ZodObject<{
                space: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    color: z.ZodString;
                    grain: z.ZodOptional<z.ZodNumber>;
                    theme: z.ZodOptional<z.ZodObject<{
                        hue: z.ZodNumber;
                        lightness: z.ZodNumber;
                        intensity: z.ZodNumber;
                        inverted: z.ZodBoolean;
                    }, z.core.$strict>>;
                    workspaceId: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                folder: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    spaceId: z.ZodString;
                    collapsed: z.ZodBoolean;
                    color: z.ZodOptional<z.ZodString>;
                    emoji: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                tabName: z.ZodOptional<z.ZodObject<{
                    title: z.ZodString;
                    url: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>], "kind">, z.ZodOptional<z.ZodNumber>], null>;
        readonly result: z.ZodObject<{
            commandId: z.ZodString;
            status: z.ZodEnum<{
                applied: "applied";
                duplicate: "duplicate";
                rejected: "rejected";
            }>;
            catalogVersion: z.ZodNumber;
            pageId: z.ZodOptional<z.ZodString>;
            windowId: z.ZodOptional<z.ZodString>;
            targetId: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly bindTabSpace: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodObject<{
            spaceId: z.ZodString;
            workspaceId: z.ZodString;
        }, z.core.$strict>;
    };
    readonly migrateTabSpaces: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodArray<z.ZodObject<{
            pageId: z.ZodString;
            spaceId: z.ZodString;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodObject<{
            migrated: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly tabsSnapshot: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            version: z.ZodNumber;
            batterySaverActive: z.ZodOptional<z.ZodBoolean>;
            tabs: z.ZodArray<z.ZodObject<{
                anchor: z.ZodOptional<z.ZodBoolean>;
                windowKind: z.ZodOptional<z.ZodEnum<{
                    normal: "normal";
                    private: "private";
                    "quick-ask": "quick-ask";
                    little: "little";
                }>>;
                split: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    index: z.ZodNumber;
                }, z.core.$strict>>;
                pageId: z.ZodString;
                windowId: z.ZodString;
                spaceId: z.ZodOptional<z.ZodString>;
                workspaceId: z.ZodOptional<z.ZodString>;
                url: z.ZodString;
                title: z.ZodString;
                themeColor: z.ZodOptional<z.ZodString>;
                favicon: z.ZodOptional<z.ZodString>;
                loading: z.ZodBoolean;
                muted: z.ZodBoolean;
                audible: z.ZodBoolean;
                canGoBack: z.ZodBoolean;
                canGoForward: z.ZodBoolean;
                popup: z.ZodBoolean;
                crashed: z.ZodBoolean;
                navigationError: z.ZodOptional<z.ZodObject<{
                    url: z.ZodString;
                    code: z.ZodNumber;
                    message: z.ZodString;
                    upgradedFrom: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                runtimeOwned: z.ZodBoolean;
                generation: z.ZodNumber;
                lifecycle: z.ZodOptional<z.ZodEnum<{
                    placeholder: "placeholder";
                    live: "live";
                    frozen: "frozen";
                    discarded: "discarded";
                }>>;
                createdAt: z.ZodNumber;
                lastActiveAt: z.ZodNumber;
            }, z.core.$strip>>;
            windows: z.ZodArray<z.ZodObject<{
                windowId: z.ZodString;
                windowKind: z.ZodOptional<z.ZodEnum<{
                    normal: "normal";
                    private: "private";
                    "quick-ask": "quick-ask";
                    little: "little";
                }>>;
                order: z.ZodArray<z.ZodString>;
                activePageId: z.ZodNullable<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly organizationSnapshot: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            revision: z.ZodNumber;
            layout: z.ZodNullable<z.ZodObject<{
                shared: z.ZodObject<{
                    spaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    archivedSpaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    pins: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        title: z.ZodString;
                        pageId: z.ZodOptional<z.ZodString>;
                        keepAwake: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    folders: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        spaceId: z.ZodString;
                        collapsed: z.ZodBoolean;
                        color: z.ZodOptional<z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>>;
                        emoji: z.ZodOptional<z.ZodString>;
                        live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"github">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                                source: z.ZodEnum<{
                                    "awaiting-review": "awaiting-review";
                                    "open-prs": "open-prs";
                                    "assigned-issues": "assigned-issues";
                                    query: "query";
                                }>;
                                query: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"calendar">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"rss">;
                            config: z.ZodObject<{
                                url: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"routine">;
                            config: z.ZodObject<{
                                routineId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>], "kind">>;
                    }, z.core.$strict>>;
                    tidyUndo: z.ZodOptional<z.ZodObject<{
                        created: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            spaceId: z.ZodString;
                            collapsed: z.ZodBoolean;
                            color: z.ZodOptional<z.ZodEnum<{
                                blue: "blue";
                                violet: "violet";
                                pink: "pink";
                                orange: "orange";
                                green: "green";
                                teal: "teal";
                                slate: "slate";
                            }>>;
                            emoji: z.ZodOptional<z.ZodString>;
                            live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                kind: z.ZodLiteral<"github">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                    source: z.ZodEnum<{
                                        "awaiting-review": "awaiting-review";
                                        "open-prs": "open-prs";
                                        "assigned-issues": "assigned-issues";
                                        query: "query";
                                    }>;
                                    query: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"calendar">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"rss">;
                                config: z.ZodObject<{
                                    url: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"routine">;
                                config: z.ZodObject<{
                                    routineId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>], "kind">>;
                        }, z.core.$strict>>;
                        moved: z.ZodArray<z.ZodObject<{
                            pageId: z.ZodString;
                            toFolderId: z.ZodString;
                            fromFolderId: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    archivedTabs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        archiveId: z.ZodString;
                        pageId: z.ZodString;
                        url: z.ZodString;
                        title: z.ZodString;
                        spaceId: z.ZodString;
                        folderId: z.ZodOptional<z.ZodString>;
                        index: z.ZodNumber;
                        archivedAt: z.ZodNumber;
                        state: z.ZodEnum<{
                            archived: "archived";
                            pending: "pending";
                        }>;
                        reason: z.ZodEnum<{
                            manual: "manual";
                            auto: "auto";
                        }>;
                        batchId: z.ZodString;
                    }, z.core.$strict>>>;
                    tabSpace: z.ZodRecord<z.ZodString, z.ZodString>;
                    order: z.ZodArray<z.ZodString>;
                    tabFolder: z.ZodRecord<z.ZodString, z.ZodString>;
                    tabNames: z.ZodRecord<z.ZodString, z.ZodObject<{
                        title: z.ZodString;
                        url: z.ZodString;
                    }, z.core.$strict>>;
                    splitGroups: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        panes: z.ZodArray<z.ZodString>;
                        layout: z.ZodEnum<{
                            row: "row";
                            column: "column";
                            columns: "columns";
                            "one-plus-two": "one-plus-two";
                            grid: "grid";
                        }>;
                        ratios: z.ZodArray<z.ZodNumber>;
                        focused: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                window: z.ZodObject<{
                    activeSpaceId: z.ZodString;
                    activeTabs: z.ZodRecord<z.ZodString, z.ZodString>;
                    splitRatio: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly organizationCommit: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            expectedRevision: z.ZodNumber;
            layout: z.ZodObject<{
                shared: z.ZodObject<{
                    spaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    archivedSpaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    pins: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        title: z.ZodString;
                        pageId: z.ZodOptional<z.ZodString>;
                        keepAwake: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    folders: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        spaceId: z.ZodString;
                        collapsed: z.ZodBoolean;
                        color: z.ZodOptional<z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>>;
                        emoji: z.ZodOptional<z.ZodString>;
                        live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"github">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                                source: z.ZodEnum<{
                                    "awaiting-review": "awaiting-review";
                                    "open-prs": "open-prs";
                                    "assigned-issues": "assigned-issues";
                                    query: "query";
                                }>;
                                query: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"calendar">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"rss">;
                            config: z.ZodObject<{
                                url: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"routine">;
                            config: z.ZodObject<{
                                routineId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>], "kind">>;
                    }, z.core.$strict>>;
                    tidyUndo: z.ZodOptional<z.ZodObject<{
                        created: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            spaceId: z.ZodString;
                            collapsed: z.ZodBoolean;
                            color: z.ZodOptional<z.ZodEnum<{
                                blue: "blue";
                                violet: "violet";
                                pink: "pink";
                                orange: "orange";
                                green: "green";
                                teal: "teal";
                                slate: "slate";
                            }>>;
                            emoji: z.ZodOptional<z.ZodString>;
                            live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                kind: z.ZodLiteral<"github">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                    source: z.ZodEnum<{
                                        "awaiting-review": "awaiting-review";
                                        "open-prs": "open-prs";
                                        "assigned-issues": "assigned-issues";
                                        query: "query";
                                    }>;
                                    query: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"calendar">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"rss">;
                                config: z.ZodObject<{
                                    url: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"routine">;
                                config: z.ZodObject<{
                                    routineId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>], "kind">>;
                        }, z.core.$strict>>;
                        moved: z.ZodArray<z.ZodObject<{
                            pageId: z.ZodString;
                            toFolderId: z.ZodString;
                            fromFolderId: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    archivedTabs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        archiveId: z.ZodString;
                        pageId: z.ZodString;
                        url: z.ZodString;
                        title: z.ZodString;
                        spaceId: z.ZodString;
                        folderId: z.ZodOptional<z.ZodString>;
                        index: z.ZodNumber;
                        archivedAt: z.ZodNumber;
                        state: z.ZodEnum<{
                            archived: "archived";
                            pending: "pending";
                        }>;
                        reason: z.ZodEnum<{
                            manual: "manual";
                            auto: "auto";
                        }>;
                        batchId: z.ZodString;
                    }, z.core.$strict>>>;
                    tabSpace: z.ZodRecord<z.ZodString, z.ZodString>;
                    order: z.ZodArray<z.ZodString>;
                    tabFolder: z.ZodRecord<z.ZodString, z.ZodString>;
                    tabNames: z.ZodRecord<z.ZodString, z.ZodObject<{
                        title: z.ZodString;
                        url: z.ZodString;
                    }, z.core.$strict>>;
                    splitGroups: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        panes: z.ZodArray<z.ZodString>;
                        layout: z.ZodEnum<{
                            row: "row";
                            column: "column";
                            columns: "columns";
                            "one-plus-two": "one-plus-two";
                            grid: "grid";
                        }>;
                        ratios: z.ZodArray<z.ZodNumber>;
                        focused: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                window: z.ZodObject<{
                    activeSpaceId: z.ZodString;
                    activeTabs: z.ZodRecord<z.ZodString, z.ZodString>;
                    splitRatio: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            revision: z.ZodNumber;
            layout: z.ZodNullable<z.ZodObject<{
                shared: z.ZodObject<{
                    spaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    archivedSpaces: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        color: z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>;
                        grain: z.ZodNumber;
                        theme: z.ZodOptional<z.ZodObject<{
                            hue: z.ZodNumber;
                            lightness: z.ZodNumber;
                            intensity: z.ZodNumber;
                            inverted: z.ZodBoolean;
                        }, z.core.$strict>>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        archived: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>;
                    pins: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
                        url: z.ZodString;
                        title: z.ZodString;
                        pageId: z.ZodOptional<z.ZodString>;
                        keepAwake: z.ZodOptional<z.ZodBoolean>;
                    }, z.core.$strict>>>;
                    folders: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                        spaceId: z.ZodString;
                        collapsed: z.ZodBoolean;
                        color: z.ZodOptional<z.ZodEnum<{
                            blue: "blue";
                            violet: "violet";
                            pink: "pink";
                            orange: "orange";
                            green: "green";
                            teal: "teal";
                            slate: "slate";
                        }>>;
                        emoji: z.ZodOptional<z.ZodString>;
                        live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                            kind: z.ZodLiteral<"github">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                                source: z.ZodEnum<{
                                    "awaiting-review": "awaiting-review";
                                    "open-prs": "open-prs";
                                    "assigned-issues": "assigned-issues";
                                    query: "query";
                                }>;
                                query: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"calendar">;
                            config: z.ZodObject<{
                                connectionId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"rss">;
                            config: z.ZodObject<{
                                url: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>, z.ZodObject<{
                            kind: z.ZodLiteral<"routine">;
                            config: z.ZodObject<{
                                routineId: z.ZodString;
                            }, z.core.$strict>;
                            refreshMinutes: z.ZodNumber;
                        }, z.core.$strict>], "kind">>;
                    }, z.core.$strict>>;
                    tidyUndo: z.ZodOptional<z.ZodObject<{
                        created: z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            name: z.ZodString;
                            spaceId: z.ZodString;
                            collapsed: z.ZodBoolean;
                            color: z.ZodOptional<z.ZodEnum<{
                                blue: "blue";
                                violet: "violet";
                                pink: "pink";
                                orange: "orange";
                                green: "green";
                                teal: "teal";
                                slate: "slate";
                            }>>;
                            emoji: z.ZodOptional<z.ZodString>;
                            live: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
                                kind: z.ZodLiteral<"github">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                    source: z.ZodEnum<{
                                        "awaiting-review": "awaiting-review";
                                        "open-prs": "open-prs";
                                        "assigned-issues": "assigned-issues";
                                        query: "query";
                                    }>;
                                    query: z.ZodOptional<z.ZodString>;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"calendar">;
                                config: z.ZodObject<{
                                    connectionId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"rss">;
                                config: z.ZodObject<{
                                    url: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>, z.ZodObject<{
                                kind: z.ZodLiteral<"routine">;
                                config: z.ZodObject<{
                                    routineId: z.ZodString;
                                }, z.core.$strict>;
                                refreshMinutes: z.ZodNumber;
                            }, z.core.$strict>], "kind">>;
                        }, z.core.$strict>>;
                        moved: z.ZodArray<z.ZodObject<{
                            pageId: z.ZodString;
                            toFolderId: z.ZodString;
                            fromFolderId: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>>;
                    }, z.core.$strict>>;
                    archivedTabs: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        archiveId: z.ZodString;
                        pageId: z.ZodString;
                        url: z.ZodString;
                        title: z.ZodString;
                        spaceId: z.ZodString;
                        folderId: z.ZodOptional<z.ZodString>;
                        index: z.ZodNumber;
                        archivedAt: z.ZodNumber;
                        state: z.ZodEnum<{
                            archived: "archived";
                            pending: "pending";
                        }>;
                        reason: z.ZodEnum<{
                            manual: "manual";
                            auto: "auto";
                        }>;
                        batchId: z.ZodString;
                    }, z.core.$strict>>>;
                    tabSpace: z.ZodRecord<z.ZodString, z.ZodString>;
                    order: z.ZodArray<z.ZodString>;
                    tabFolder: z.ZodRecord<z.ZodString, z.ZodString>;
                    tabNames: z.ZodRecord<z.ZodString, z.ZodObject<{
                        title: z.ZodString;
                        url: z.ZodString;
                    }, z.core.$strict>>;
                    splitGroups: z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        panes: z.ZodArray<z.ZodString>;
                        layout: z.ZodEnum<{
                            row: "row";
                            column: "column";
                            columns: "columns";
                            "one-plus-two": "one-plus-two";
                            grid: "grid";
                        }>;
                        ratios: z.ZodArray<z.ZodNumber>;
                        focused: z.ZodString;
                    }, z.core.$strict>>;
                }, z.core.$strict>;
                window: z.ZodObject<{
                    activeSpaceId: z.ZodString;
                    activeTabs: z.ZodRecord<z.ZodString, z.ZodString>;
                    splitRatio: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly migrationReview: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            status: z.ZodEnum<{
                applied: "applied";
                ready: "ready";
                interrupted: "interrupted";
            }>;
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            tabs: z.ZodNumber;
            bookmarks: z.ZodNumber;
            bookmarkFolders: z.ZodNumber;
            spaces: z.ZodNumber;
            vaultPending: z.ZodBoolean;
            omitted: z.ZodObject<{
                unsafeTabs: z.ZodNumber;
                unsafeBookmarks: z.ZodNumber;
                missingArtifacts: z.ZodNumber;
                vaultMetadata: z.ZodNumber;
                layoutMissing: z.ZodBoolean;
            }, z.core.$strict>;
            progress: z.ZodOptional<z.ZodObject<{
                status: z.ZodLiteral<"importing">;
                folders: z.ZodNumber;
                bookmarks: z.ZodNumber;
                tabs: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly migrationBegin: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            confirmed: z.ZodLiteral<true>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodUnion<readonly [z.ZodObject<{
            status: z.ZodEnum<{
                applied: "applied";
                ready: "ready";
                interrupted: "interrupted";
            }>;
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            tabs: z.ZodNumber;
            bookmarks: z.ZodNumber;
            bookmarkFolders: z.ZodNumber;
            spaces: z.ZodNumber;
            vaultPending: z.ZodBoolean;
            omitted: z.ZodObject<{
                unsafeTabs: z.ZodNumber;
                unsafeBookmarks: z.ZodNumber;
                missingArtifacts: z.ZodNumber;
                vaultMetadata: z.ZodNumber;
                layoutMissing: z.ZodBoolean;
            }, z.core.$strict>;
            progress: z.ZodOptional<z.ZodObject<{
                status: z.ZodLiteral<"importing">;
                folders: z.ZodNumber;
                bookmarks: z.ZodNumber;
                tabs: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"importing">;
            folders: z.ZodNumber;
            bookmarks: z.ZodNumber;
            tabs: z.ZodNumber;
        }, z.core.$strict>]>;
    };
    readonly migrationBatch: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            section: z.ZodEnum<{
                folders: "folders";
                tabs: "tabs";
                bookmarks: "bookmarks";
            }>;
            offset: z.ZodNumber;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            status: z.ZodLiteral<"importing">;
            folders: z.ZodNumber;
            bookmarks: z.ZodNumber;
            tabs: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly migrationFinish: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            status: z.ZodEnum<{
                applied: "applied";
                ready: "ready";
                interrupted: "interrupted";
            }>;
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            tabs: z.ZodNumber;
            bookmarks: z.ZodNumber;
            bookmarkFolders: z.ZodNumber;
            spaces: z.ZodNumber;
            vaultPending: z.ZodBoolean;
            omitted: z.ZodObject<{
                unsafeTabs: z.ZodNumber;
                unsafeBookmarks: z.ZodNumber;
                missingArtifacts: z.ZodNumber;
                vaultMetadata: z.ZodNumber;
                layoutMissing: z.ZodBoolean;
            }, z.core.$strict>;
            progress: z.ZodOptional<z.ZodObject<{
                status: z.ZodLiteral<"importing">;
                folders: z.ZodNumber;
                bookmarks: z.ZodNumber;
                tabs: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly migrationRollback: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            confirmed: z.ZodLiteral<true>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            status: z.ZodEnum<{
                applied: "applied";
                ready: "ready";
                interrupted: "interrupted";
            }>;
            contentHash: z.ZodString;
            manifestSha256: z.ZodString;
            tabs: z.ZodNumber;
            bookmarks: z.ZodNumber;
            bookmarkFolders: z.ZodNumber;
            spaces: z.ZodNumber;
            vaultPending: z.ZodBoolean;
            omitted: z.ZodObject<{
                unsafeTabs: z.ZodNumber;
                unsafeBookmarks: z.ZodNumber;
                missingArtifacts: z.ZodNumber;
                vaultMetadata: z.ZodNumber;
                layoutMissing: z.ZodBoolean;
            }, z.core.$strict>;
            progress: z.ZodOptional<z.ZodObject<{
                status: z.ZodLiteral<"importing">;
                folders: z.ZodNumber;
                bookmarks: z.ZodNumber;
                tabs: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly tabsSince: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodNumber], null>;
        readonly result: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"patches">;
            patches: z.ZodArray<z.ZodObject<{
                version: z.ZodNumber;
                baseVersion: z.ZodNumber;
                batterySaverActive: z.ZodOptional<z.ZodBoolean>;
                ops: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                    op: z.ZodLiteral<"upsert">;
                    tab: z.ZodObject<{
                        anchor: z.ZodOptional<z.ZodBoolean>;
                        windowKind: z.ZodOptional<z.ZodEnum<{
                            normal: "normal";
                            private: "private";
                            "quick-ask": "quick-ask";
                            little: "little";
                        }>>;
                        split: z.ZodOptional<z.ZodObject<{
                            id: z.ZodString;
                            index: z.ZodNumber;
                        }, z.core.$strict>>;
                        pageId: z.ZodString;
                        windowId: z.ZodString;
                        spaceId: z.ZodOptional<z.ZodString>;
                        workspaceId: z.ZodOptional<z.ZodString>;
                        url: z.ZodString;
                        title: z.ZodString;
                        themeColor: z.ZodOptional<z.ZodString>;
                        favicon: z.ZodOptional<z.ZodString>;
                        loading: z.ZodBoolean;
                        muted: z.ZodBoolean;
                        audible: z.ZodBoolean;
                        canGoBack: z.ZodBoolean;
                        canGoForward: z.ZodBoolean;
                        popup: z.ZodBoolean;
                        crashed: z.ZodBoolean;
                        navigationError: z.ZodOptional<z.ZodObject<{
                            url: z.ZodString;
                            code: z.ZodNumber;
                            message: z.ZodString;
                            upgradedFrom: z.ZodOptional<z.ZodString>;
                        }, z.core.$strip>>;
                        runtimeOwned: z.ZodBoolean;
                        generation: z.ZodNumber;
                        lifecycle: z.ZodOptional<z.ZodEnum<{
                            placeholder: "placeholder";
                            live: "live";
                            frozen: "frozen";
                            discarded: "discarded";
                        }>>;
                        createdAt: z.ZodNumber;
                        lastActiveAt: z.ZodNumber;
                    }, z.core.$strip>;
                    origin: z.ZodOptional<z.ZodEnum<{
                        runtime: "runtime";
                        external: "external";
                        human: "human";
                    }>>;
                }, z.core.$strip>, z.ZodObject<{
                    op: z.ZodLiteral<"remove">;
                    pageId: z.ZodString;
                }, z.core.$strip>, z.ZodObject<{
                    op: z.ZodLiteral<"window">;
                    window: z.ZodObject<{
                        windowId: z.ZodString;
                        windowKind: z.ZodOptional<z.ZodEnum<{
                            normal: "normal";
                            private: "private";
                            "quick-ask": "quick-ask";
                            little: "little";
                        }>>;
                        order: z.ZodArray<z.ZodString>;
                        activePageId: z.ZodNullable<z.ZodString>;
                    }, z.core.$strip>;
                }, z.core.$strip>], "op">>;
                ts: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"snapshot">;
            snapshot: z.ZodObject<{
                version: z.ZodNumber;
                batterySaverActive: z.ZodOptional<z.ZodBoolean>;
                tabs: z.ZodArray<z.ZodObject<{
                    anchor: z.ZodOptional<z.ZodBoolean>;
                    windowKind: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        private: "private";
                        "quick-ask": "quick-ask";
                        little: "little";
                    }>>;
                    split: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        index: z.ZodNumber;
                    }, z.core.$strict>>;
                    pageId: z.ZodString;
                    windowId: z.ZodString;
                    spaceId: z.ZodOptional<z.ZodString>;
                    workspaceId: z.ZodOptional<z.ZodString>;
                    url: z.ZodString;
                    title: z.ZodString;
                    themeColor: z.ZodOptional<z.ZodString>;
                    favicon: z.ZodOptional<z.ZodString>;
                    loading: z.ZodBoolean;
                    muted: z.ZodBoolean;
                    audible: z.ZodBoolean;
                    canGoBack: z.ZodBoolean;
                    canGoForward: z.ZodBoolean;
                    popup: z.ZodBoolean;
                    crashed: z.ZodBoolean;
                    navigationError: z.ZodOptional<z.ZodObject<{
                        url: z.ZodString;
                        code: z.ZodNumber;
                        message: z.ZodString;
                        upgradedFrom: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                    runtimeOwned: z.ZodBoolean;
                    generation: z.ZodNumber;
                    lifecycle: z.ZodOptional<z.ZodEnum<{
                        placeholder: "placeholder";
                        live: "live";
                        frozen: "frozen";
                        discarded: "discarded";
                    }>>;
                    createdAt: z.ZodNumber;
                    lastActiveAt: z.ZodNumber;
                }, z.core.$strip>>;
                windows: z.ZodArray<z.ZodObject<{
                    windowId: z.ZodString;
                    windowKind: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        private: "private";
                        "quick-ask": "quick-ask";
                        little: "little";
                    }>>;
                    order: z.ZodArray<z.ZodString>;
                    activePageId: z.ZodNullable<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strict>], "kind">;
    };
    readonly surfaceContentId: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly resolveSearch: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodString;
    };
    readonly focusShell: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodUnion<readonly [z.ZodUndefined, z.ZodNull]>;
    };
    /** Browser picks fixed copy. No goal, page, question, or result text crosses this boundary. */
    readonly showRunAttention: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            kind: z.ZodEnum<{
                completed: "completed";
                question: "question";
                handoff: "handoff";
            }>;
            runId: z.ZodString;
            identity: z.ZodString;
            windowId: z.ZodString;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            queued: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly createResultPreview: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodString;
    };
    readonly releaseResultPreview: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly savePagePdf: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly printPage: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly devTools: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodOptional<z.ZodEnum<{
            toggle: "toggle";
            inspect: "inspect";
        }>>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly hardReload: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly closeWindow: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodBoolean;
    };
    readonly openFile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly dictationStatus: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            available: z.ZodBoolean;
            language: z.ZodOptional<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly startDictation: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly stopDictation: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly cancelDictation: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodUnion<readonly [z.ZodUndefined, z.ZodNull]>;
    };
    readonly dataDir: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodString;
    };
    readonly siteInfo: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            pageId: z.ZodString;
            url: z.ZodString;
            origin: z.ZodString;
            title: z.ZodString;
            security: z.ZodEnum<{
                secure: "secure";
                local: "local";
                insecure: "insecure";
            }>;
            cookieCount: z.ZodNumber;
            permissions: z.ZodRecord<z.ZodString, z.ZodEnum<{
                allow: "allow";
                deny: "deny";
            }>>;
            trackersAllowed: z.ZodBoolean;
            blockedCount: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly siteZoom: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodString>], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            origin: z.ZodString;
            percentage: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly privatePageZoom: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodObject<{
            level: z.ZodOptional<z.ZodNumber>;
            delta: z.ZodOptional<z.ZodNumber>;
            reset: z.ZodOptional<z.ZodBoolean>;
            direction: z.ZodOptional<z.ZodEnum<{
                out: "out";
                in: "in";
            }>>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            level: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly privacy: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            trackerBlock: z.ZodBoolean;
            blocked: z.ZodNumber;
            allowedHosts: z.ZodOptional<z.ZodArray<z.ZodString>>;
            httpsUpgrade: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    };
    readonly setTrackerBlock: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodBoolean], null>;
        readonly result: z.ZodObject<{
            trackerBlock: z.ZodBoolean;
            blocked: z.ZodNumber;
            allowedHosts: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>;
    };
    readonly setSiteTrackers: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodBoolean], null>;
        readonly result: z.ZodObject<{
            hostname: z.ZodString;
            allowed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly removeAllowedHost: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodArray<z.ZodString>;
    };
    readonly filterLists: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            sources: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                enabled: z.ZodBoolean;
                kind: z.ZodEnum<{
                    hosts: "hosts";
                    cookie_banner: "cookie_banner";
                }>;
                meta: z.ZodOptional<z.ZodObject<{
                    fetchedAt: z.ZodNumber;
                    etag: z.ZodOptional<z.ZodString>;
                    hosts: z.ZodNumber;
                    selectors: z.ZodOptional<z.ZodNumber>;
                    sha256: z.ZodString;
                    error: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            hosts: z.ZodNumber;
            cookieSelectors: z.ZodNumber;
            builtinHosts: z.ZodNumber;
            backend: z.ZodEnum<{
                electron_web_request: "electron_web_request";
                subresource_filter: "subresource_filter";
                declarative_net_request: "declarative_net_request";
                preview: "preview";
            }>;
            cosmeticBackend: z.ZodOptional<z.ZodEnum<{
                document_start_stylesheet: "document_start_stylesheet";
                unavailable: "unavailable";
            }>>;
        }, z.core.$strict>;
    };
    readonly updateFilters: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            sources: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                enabled: z.ZodBoolean;
                kind: z.ZodEnum<{
                    hosts: "hosts";
                    cookie_banner: "cookie_banner";
                }>;
                meta: z.ZodOptional<z.ZodObject<{
                    fetchedAt: z.ZodNumber;
                    etag: z.ZodOptional<z.ZodString>;
                    hosts: z.ZodNumber;
                    selectors: z.ZodOptional<z.ZodNumber>;
                    sha256: z.ZodString;
                    error: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            hosts: z.ZodNumber;
            cookieSelectors: z.ZodNumber;
            builtinHosts: z.ZodNumber;
            backend: z.ZodEnum<{
                electron_web_request: "electron_web_request";
                subresource_filter: "subresource_filter";
                declarative_net_request: "declarative_net_request";
                preview: "preview";
            }>;
            cosmeticBackend: z.ZodOptional<z.ZodEnum<{
                document_start_stylesheet: "document_start_stylesheet";
                unavailable: "unavailable";
            }>>;
        }, z.core.$strict>;
    };
    readonly addFilterSource: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodOptional<z.ZodEnum<{
            hosts: "hosts";
            cookie_banner: "cookie_banner";
        }>>], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            enabled: z.ZodBoolean;
            kind: z.ZodEnum<{
                hosts: "hosts";
                cookie_banner: "cookie_banner";
            }>;
            meta: z.ZodOptional<z.ZodObject<{
                fetchedAt: z.ZodNumber;
                etag: z.ZodOptional<z.ZodString>;
                hosts: z.ZodNumber;
                selectors: z.ZodOptional<z.ZodNumber>;
                sha256: z.ZodString;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    };
    readonly removeFilterSource: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            enabled: z.ZodBoolean;
            kind: z.ZodEnum<{
                hosts: "hosts";
                cookie_banner: "cookie_banner";
            }>;
            meta: z.ZodOptional<z.ZodObject<{
                fetchedAt: z.ZodNumber;
                etag: z.ZodOptional<z.ZodString>;
                hosts: z.ZodNumber;
                selectors: z.ZodOptional<z.ZodNumber>;
                sha256: z.ZodString;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    };
    readonly setFilterSourceEnabled: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodBoolean], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            enabled: z.ZodBoolean;
            kind: z.ZodEnum<{
                hosts: "hosts";
                cookie_banner: "cookie_banner";
            }>;
            meta: z.ZodOptional<z.ZodObject<{
                fetchedAt: z.ZodNumber;
                etag: z.ZodOptional<z.ZodString>;
                hosts: z.ZodNumber;
                selectors: z.ZodOptional<z.ZodNumber>;
                sha256: z.ZodString;
                error: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
    };
    readonly setAppearance: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodEnum<{
            light: "light";
            dark: "dark";
            system: "system";
        }>, z.ZodOptional<z.ZodBoolean>, z.ZodOptional<z.ZodBoolean>, z.ZodOptional<z.ZodEnum<{
            "liquid-glass": "liquid-glass";
            titlebar: "titlebar";
            sidebar: "sidebar";
            "under-window": "under-window";
        }>>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly dispatchCommand: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodEnum<{
            "new-window": "new-window";
            "new-private-window": "new-private-window";
        }>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly setShortcuts: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodArray<z.ZodObject<{
            commandId: z.ZodString;
            key: z.ZodString;
            meta: z.ZodBoolean;
            ctrl: z.ZodBoolean;
            shift: z.ZodBoolean;
            alt: z.ZodBoolean;
            focusShell: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly windowControlsVisible: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly extensions: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    };
    readonly installStoreExtension: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly checkStoreExtensionUpdate: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly reloadExtension: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly showExtensionAction: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly extensionActions: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            iconPng: z.ZodString;
            badgeText: z.ZodString;
            badgeColor: z.ZodString;
            enabled: z.ZodBoolean;
            pinned: z.ZodBoolean;
            hasPopup: z.ZodBoolean;
        }, z.core.$strict>>;
    };
    readonly extensionSidePanel: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodEnum<{
            close: "close";
            describe: "describe";
        }>], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            extensionId: z.ZodString;
            windowId: z.ZodString;
            pageId: z.ZodNullable<z.ZodString>;
            contentId: z.ZodNullable<z.ZodString>;
            title: z.ZodString;
            open: z.ZodBoolean;
        }, z.core.$strict>>;
    };
    readonly pinExtensionAction: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly extensionCommands: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            extensionId: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            shortcut: z.ZodString;
        }, z.core.$strict>>;
    };
    readonly setExtensionCommandShortcut: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly setExtensionEnabled: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodBoolean], null>;
        readonly result: z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly removeExtension: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly installUnpackedExtension: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    };
    readonly updateUnpackedExtension: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            key: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
            name: z.ZodString;
            version: z.ZodString;
            permissions: z.ZodArray<z.ZodString>;
            enabled: z.ZodBoolean;
            loaded: z.ZodBoolean;
            managed: z.ZodBoolean;
            source: z.ZodEnum<{
                managed: "managed";
                environment: "environment";
                store: "store";
            }>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    };
    readonly browserProfiles: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            current: z.ZodBoolean;
            archived: z.ZodOptional<z.ZodBoolean>;
            color: z.ZodOptional<z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>>;
            icon: z.ZodOptional<z.ZodString>;
            spaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                color: z.ZodEnum<{
                    blue: "blue";
                    violet: "violet";
                    pink: "pink";
                    orange: "orange";
                    green: "green";
                    teal: "teal";
                    slate: "slate";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    };
    readonly createBrowserProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            current: z.ZodBoolean;
            archived: z.ZodOptional<z.ZodBoolean>;
            color: z.ZodOptional<z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>>;
            icon: z.ZodOptional<z.ZodString>;
            spaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                color: z.ZodEnum<{
                    blue: "blue";
                    violet: "violet";
                    pink: "pink";
                    orange: "orange";
                    green: "green";
                    teal: "teal";
                    slate: "slate";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
    };
    readonly renameBrowserProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            current: z.ZodBoolean;
            archived: z.ZodOptional<z.ZodBoolean>;
            color: z.ZodOptional<z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>>;
            icon: z.ZodOptional<z.ZodString>;
            spaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                color: z.ZodEnum<{
                    blue: "blue";
                    violet: "violet";
                    pink: "pink";
                    orange: "orange";
                    green: "green";
                    teal: "teal";
                    slate: "slate";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    };
    readonly archiveBrowserProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodBoolean], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            current: z.ZodBoolean;
            archived: z.ZodOptional<z.ZodBoolean>;
            color: z.ZodOptional<z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>>;
            icon: z.ZodOptional<z.ZodString>;
            spaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                color: z.ZodEnum<{
                    blue: "blue";
                    violet: "violet";
                    pink: "pink";
                    orange: "orange";
                    green: "green";
                    teal: "teal";
                    slate: "slate";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    };
    readonly deleteBrowserProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            current: z.ZodBoolean;
            archived: z.ZodOptional<z.ZodBoolean>;
            color: z.ZodOptional<z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>>;
            icon: z.ZodOptional<z.ZodString>;
            spaces: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                color: z.ZodEnum<{
                    blue: "blue";
                    violet: "violet";
                    pink: "pink";
                    orange: "orange";
                    green: "green";
                    teal: "teal";
                    slate: "slate";
                }>;
            }, z.core.$strict>>>;
        }, z.core.$strict>>;
    };
    readonly openBrowserProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly openBrowserProfileUrl: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly setBrowserProfileAppearance: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodObject<{
            color: z.ZodEnum<{
                blue: "blue";
                violet: "violet";
                pink: "pink";
                orange: "orange";
                green: "green";
                teal: "teal";
                slate: "slate";
            }>;
            icon: z.ZodString;
        }, z.core.$strict>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly focusBrowserProfileSpace: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodNullable<z.ZodString>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly moveTabToProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly linkRoutes: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            version: z.ZodLiteral<1>;
            revision: z.ZodNumber;
            enabled: z.ZodBoolean;
            inApp: z.ZodEnum<{
                off: "off";
                "cross-site-new-tab": "cross-site-new-tab";
            }>;
            default: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"last-used">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"profile">;
                profileId: z.ZodString;
                spaceId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "kind">;
            rules: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodBoolean;
                order: z.ZodNumber;
                match: z.ZodObject<{
                    kind: z.ZodEnum<{
                        host: "host";
                        glob: "glob";
                        prefix: "prefix";
                    }>;
                    pattern: z.ZodString;
                    subdomains: z.ZodBoolean;
                }, z.core.$strict>;
                sources: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    external: "external";
                    cli: "cli";
                    "in-app": "in-app";
                }>>>;
                fromApps: z.ZodOptional<z.ZodArray<z.ZodString>>;
                destination: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"profile">;
                    profileId: z.ZodString;
                    spaceId: z.ZodOptional<z.ZodString>;
                    window: z.ZodEnum<{
                        little: "little";
                        tab: "tab";
                        "new-window": "new-window";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"ask">;
                }, z.core.$strict>], "kind">;
                hits: z.ZodNumber;
                lastHitAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly setLinkRoutes: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodNumber, z.ZodObject<{
            version: z.ZodLiteral<1>;
            revision: z.ZodNumber;
            enabled: z.ZodBoolean;
            inApp: z.ZodEnum<{
                off: "off";
                "cross-site-new-tab": "cross-site-new-tab";
            }>;
            default: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"last-used">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"profile">;
                profileId: z.ZodString;
                spaceId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "kind">;
            rules: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodBoolean;
                order: z.ZodNumber;
                match: z.ZodObject<{
                    kind: z.ZodEnum<{
                        host: "host";
                        glob: "glob";
                        prefix: "prefix";
                    }>;
                    pattern: z.ZodString;
                    subdomains: z.ZodBoolean;
                }, z.core.$strict>;
                sources: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    external: "external";
                    cli: "cli";
                    "in-app": "in-app";
                }>>>;
                fromApps: z.ZodOptional<z.ZodArray<z.ZodString>>;
                destination: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"profile">;
                    profileId: z.ZodString;
                    spaceId: z.ZodOptional<z.ZodString>;
                    window: z.ZodEnum<{
                        little: "little";
                        tab: "tab";
                        "new-window": "new-window";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"ask">;
                }, z.core.$strict>], "kind">;
                hits: z.ZodNumber;
                lastHitAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            version: z.ZodLiteral<1>;
            revision: z.ZodNumber;
            enabled: z.ZodBoolean;
            inApp: z.ZodEnum<{
                off: "off";
                "cross-site-new-tab": "cross-site-new-tab";
            }>;
            default: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"last-used">;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"profile">;
                profileId: z.ZodString;
                spaceId: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>], "kind">;
            rules: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                enabled: z.ZodBoolean;
                order: z.ZodNumber;
                match: z.ZodObject<{
                    kind: z.ZodEnum<{
                        host: "host";
                        glob: "glob";
                        prefix: "prefix";
                    }>;
                    pattern: z.ZodString;
                    subdomains: z.ZodBoolean;
                }, z.core.$strict>;
                sources: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                    external: "external";
                    cli: "cli";
                    "in-app": "in-app";
                }>>>;
                fromApps: z.ZodOptional<z.ZodArray<z.ZodString>>;
                destination: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"profile">;
                    profileId: z.ZodString;
                    spaceId: z.ZodOptional<z.ZodString>;
                    window: z.ZodEnum<{
                        little: "little";
                        tab: "tab";
                        "new-window": "new-window";
                    }>;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"ask">;
                }, z.core.$strict>], "kind">;
                hits: z.ZodNumber;
                lastHitAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    };
    readonly testLinkRoute: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodEnum<{
            external: "external";
            cli: "cli";
            "in-app": "in-app";
        }>], null>;
        readonly result: z.ZodObject<{
            destination: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"profile">;
                profileId: z.ZodString;
                spaceId: z.ZodOptional<z.ZodString>;
                window: z.ZodEnum<{
                    little: "little";
                    tab: "tab";
                    "new-window": "new-window";
                }>;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"ask">;
            }, z.core.$strict>], "kind">;
            ruleId: z.ZodOptional<z.ZodString>;
            fallback: z.ZodBoolean;
            fallbackReason: z.ZodOptional<z.ZodEnum<{
                "profile-unavailable": "profile-unavailable";
                "space-unavailable": "space-unavailable";
            }>>;
        }, z.core.$strict>;
    };
    readonly resolveRoutePrompt: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"profile">;
            profileId: z.ZodString;
            spaceId: z.ZodOptional<z.ZodString>;
            window: z.ZodEnum<{
                little: "little";
                tab: "tab";
                "new-window": "new-window";
            }>;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"ask">;
        }, z.core.$strict>], "kind">, z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly routedOpens: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            pageId: z.ZodString;
            profileId: z.ZodString;
            spaceId: z.ZodOptional<z.ZodString>;
            ruleId: z.ZodOptional<z.ZodString>;
            fallbackReason: z.ZodOptional<z.ZodEnum<{
                "profile-unavailable": "profile-unavailable";
                "space-unavailable": "space-unavailable";
            }>>;
        }, z.core.$strict>>;
    };
    readonly routePrompts: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            url: z.ZodString;
            expiresAt: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly autofillProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            organization: z.ZodOptional<z.ZodString>;
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            postal: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    };
    readonly setAutofillProfile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            organization: z.ZodOptional<z.ZodString>;
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            postal: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly autofill: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNumber;
    };
    readonly vaultFill: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly vaultSave: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodOptional<z.ZodString>], null>;
        readonly result: z.ZodObject<{
            ok: z.ZodBoolean;
            updated: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly vaultDismiss: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodOptional<z.ZodString>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly passwordExport: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            path: z.ZodString;
            exported: z.ZodNumber;
            skipped: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly passwordImport: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            added: z.ZodNumber;
            skipped: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly quickAskShortcut: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodBoolean>], null>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
            registered: z.ZodBoolean;
            error: z.ZodString;
        }, z.core.$strict>;
    };
    readonly quickAsk: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodEnum<{
            open: "open";
            status: "status";
            expand: "expand";
            dismiss: "dismiss";
        }>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly showTabWindow: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly littleWindow: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodEnum<{
            open: "open";
            close: "close";
            promote: "promote";
        }>, z.ZodObject<{
            url: z.ZodOptional<z.ZodString>;
            spaceId: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly externalLinkTarget: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodEnum<{
            little: "little";
            main: "main";
        }>>], null>;
        readonly result: z.ZodEnum<{
            little: "little";
            main: "main";
        }>;
    };
    readonly javascriptAppleEvents: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodBoolean>], null>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly downloadFolder: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            path: z.ZodString;
            custom: z.ZodBoolean;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly chooseDownloadFolder: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodBoolean>], null>;
        readonly result: z.ZodObject<{
            path: z.ZodString;
            custom: z.ZodBoolean;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly spellCheck: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodBoolean>], null>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly startupPreferences: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodObject<{
            mode: z.ZodEnum<{
                continue: "continue";
                "new-tab": "new-tab";
                pages: "pages";
                "continue-and-pages": "continue-and-pages";
            }>;
            urls: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodObject<{
            mode: z.ZodEnum<{
                continue: "continue";
                "new-tab": "new-tab";
                pages: "pages";
                "continue-and-pages": "continue-and-pages";
            }>;
            urls: z.ZodArray<z.ZodString>;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly languagePreferences: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodArray<z.ZodString>>], null>;
        readonly result: z.ZodObject<{
            selected: z.ZodArray<z.ZodString>;
            effective: z.ZodArray<z.ZodString>;
            forced: z.ZodArray<z.ZodString>;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly automaticPictureInPicture: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodEnum<{
            allow: "allow";
            ask: "ask";
            block: "block";
        }>>], null>;
        readonly result: z.ZodObject<{
            mode: z.ZodEnum<{
                allow: "allow";
                ask: "ask";
                block: "block";
            }>;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly keepRuntimeInBackground: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodBoolean>], null>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
            available: z.ZodBoolean;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly defaultPageZoom: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodOptional<z.ZodNumber>], null>;
        readonly result: z.ZodObject<{
            percentage: z.ZodNumber;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly downloadsSnapshot: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceUrl: z.ZodOptional<z.ZodString>;
            tabUrl: z.ZodOptional<z.ZodString>;
            downloadRoot: z.ZodOptional<z.ZodString>;
            pageId: z.ZodOptional<z.ZodString>;
            filename: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            totalBytes: z.ZodOptional<z.ZodNumber>;
            paused: z.ZodOptional<z.ZodBoolean>;
            canResume: z.ZodOptional<z.ZodBoolean>;
            canCancel: z.ZodOptional<z.ZodBoolean>;
            state: z.ZodEnum<{
                interrupted: "interrupted";
                completed: "completed";
                started: "started";
                progressing: "progressing";
                cancelled: "cancelled";
            }>;
            startedAt: z.ZodNumber;
            endedAt: z.ZodOptional<z.ZodNumber>;
            warning: z.ZodOptional<z.ZodEnum<{
                insecure: "insecure";
                executable: "executable";
            }>>;
        }, z.core.$strip>>;
    };
    readonly controlDownload: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodEnum<{
            pause: "pause";
            resume: "resume";
            cancel: "cancel";
        }>], null>;
        readonly result: z.ZodUnion<readonly [z.ZodUndefined, z.ZodNull]>;
    };
    readonly retryDownload: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodUnion<readonly [z.ZodUndefined, z.ZodNull]>;
    };
    readonly tabAudio: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodRecord<z.ZodString, z.ZodObject<{
            muted: z.ZodBoolean;
            audible: z.ZodBoolean;
            video: z.ZodBoolean;
            pip: z.ZodBoolean;
        }, z.core.$strict>>;
    };
    readonly pictureInPicture: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodEnum<{
            toggle: "toggle";
            enter: "enter";
            exit: "exit";
        }>], null>;
        readonly result: z.ZodObject<{
            active: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly setStageVisible: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodArray<z.ZodString>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly tabsUnsavedWork: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodArray<z.ZodObject<{
            pageId: z.ZodString;
            url: z.ZodString;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodRecord<z.ZodString, z.ZodEnum<{
            unknown: "unknown";
            clean: "clean";
            dirty: "dirty";
        }>>;
    };
    readonly archiveTab: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodNumber], null>;
        readonly result: z.ZodObject<{
            archived: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly tabSleep: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodObject<{
            slept: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            estimatedSavedBytes: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
    };
    readonly preview: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly contextMenu: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodUnion<readonly [z.ZodString, z.ZodNull]>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly navigationMenu: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodEnum<{
            back: "back";
            forward: "forward";
        }>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly autocomplete: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<{
                search: "search";
                history: "history";
                bookmark: "bookmark";
                typed: "typed";
            }>;
            title: z.ZodString;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    };
    readonly readArticle: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            title: z.ZodString;
            byline: z.ZodString;
            site: z.ZodString;
            url: z.ZodString;
            minutes: z.ZodNumber;
            content: z.ZodType<HostReaderNode, unknown, z.core.$ZodTypeInternals<HostReaderNode, unknown>>;
        }, z.core.$strict>;
    };
    readonly openExternal: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodUnknown;
    };
    readonly revealPath: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly openPath: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodString;
    };
    readonly saveFile: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly saveWorkbook: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodOptional<z.ZodEnum<{
            snapshot: "snapshot";
            csv: "csv";
        }>>], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly saveStoredArtifact: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly openPluginDirectory: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly pickEvidenceImage: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            filename: z.ZodString;
            dataUrl: z.ZodString;
        }, z.core.$strict>>;
    };
    readonly pickEvidenceDocument: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            filename: z.ZodString;
            content: z.ZodString;
        }, z.core.$strict>>;
    };
    readonly agentConfig: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodObject<{
            name: z.ZodString;
            client: z.ZodEnum<{
                codex: "codex";
                claude: "claude";
            }>;
            scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"workspace">;
                workspaceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"task">;
                workspaceId: z.ZodString;
                taskId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                workspaceId: z.ZodString;
                sessionId: z.ZodString;
            }, z.core.$strict>], "kind">;
            expiresAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>], null>;
        readonly result: z.ZodObject<{
            command: z.ZodString;
            args: z.ZodArray<z.ZodString>;
            env: z.ZodRecord<z.ZodString, z.ZodString>;
            connection: z.ZodObject<{
                connectionId: z.ZodString;
                name: z.ZodString;
                client: z.ZodEnum<{
                    codex: "codex";
                    claude: "claude";
                }>;
                scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"workspace">;
                    workspaceId: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"task">;
                    workspaceId: z.ZodString;
                    taskId: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"session">;
                    workspaceId: z.ZodString;
                    sessionId: z.ZodString;
                }, z.core.$strict>], "kind">;
                createdAt: z.ZodNumber;
                lastUsedAt: z.ZodOptional<z.ZodNumber>;
                expiresAt: z.ZodOptional<z.ZodNumber>;
                revokedAt: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strict>;
    };
    readonly agentConnections: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            connectionId: z.ZodString;
            name: z.ZodString;
            client: z.ZodEnum<{
                codex: "codex";
                claude: "claude";
            }>;
            scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"workspace">;
                workspaceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"task">;
                workspaceId: z.ZodString;
                taskId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                workspaceId: z.ZodString;
                sessionId: z.ZodString;
            }, z.core.$strict>], "kind">;
            createdAt: z.ZodNumber;
            lastUsedAt: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
            revokedAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    };
    readonly agentClients: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            client: z.ZodEnum<{
                codex: "codex";
                claude: "claude";
            }>;
            installed: z.ZodBoolean;
            version: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    };
    readonly revokeAgentConnection: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            connectionId: z.ZodString;
            name: z.ZodString;
            client: z.ZodEnum<{
                codex: "codex";
                claude: "claude";
            }>;
            scope: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"workspace">;
                workspaceId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"task">;
                workspaceId: z.ZodString;
                taskId: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"session">;
                workspaceId: z.ZodString;
                sessionId: z.ZodString;
            }, z.core.$strict>], "kind">;
            createdAt: z.ZodNumber;
            lastUsedAt: z.ZodOptional<z.ZodNumber>;
            expiresAt: z.ZodOptional<z.ZodNumber>;
            revokedAt: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    };
    readonly exportDiagnostics: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodString>;
    };
    readonly exportRuntimeBackup: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            path: z.ZodString;
            bytes: z.ZodNumber;
            sha256: z.ZodString;
            artifactFiles: z.ZodNumber;
            missingArtifacts: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly exportMigrationLayout: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            path: z.ZodString;
        }, z.core.$strict>>;
    };
    readonly stageRuntimeRestore: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodNullable<z.ZodObject<{
            path: z.ZodString;
            bytes: z.ZodNumber;
            sha256: z.ZodString;
            artifactFiles: z.ZodNumber;
            missingArtifacts: z.ZodNumber;
            staged: z.ZodLiteral<true>;
            schemaVersion: z.ZodNumber;
        }, z.core.$strict>>;
    };
    readonly cancelRuntimeRestore: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            cancelled: z.ZodLiteral<true>;
        }, z.core.$strict>;
    };
    readonly runtimeRestoreStatus: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            pending: z.ZodBoolean;
            lastAppliedAt: z.ZodOptional<z.ZodNumber>;
            managedRecovery: z.ZodObject<{
                generation: z.ZodNumber;
                freshBackupIssued: z.ZodBoolean;
            }, z.core.$strict>;
        }, z.core.$strict>;
    };
    readonly healthSummary: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            recordingSince: z.ZodOptional<z.ZodNumber>;
            latestAt: z.ZodOptional<z.ZodNumber>;
            samples: z.ZodNumber;
            sessions: z.ZodNumber;
            observedMinutes: z.ZodNumber;
            spanDays: z.ZodNumber;
            sevenDaySpan: z.ZodBoolean;
            startupMs: z.ZodOptional<z.ZodNumber>;
            cpuPercent: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            memoryMb: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            eventLoopLagMs: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            maxWindows: z.ZodNumber;
            maxPages: z.ZodNumber;
            maxSuspendedPages: z.ZodNumber;
            swallowed: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            pageCrashes: z.ZodNumber;
            pageUnresponsive: z.ZodNumber;
            suspensionFailures: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly clearHealth: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            recordingSince: z.ZodOptional<z.ZodNumber>;
            latestAt: z.ZodOptional<z.ZodNumber>;
            samples: z.ZodNumber;
            sessions: z.ZodNumber;
            observedMinutes: z.ZodNumber;
            spanDays: z.ZodNumber;
            sevenDaySpan: z.ZodBoolean;
            startupMs: z.ZodOptional<z.ZodNumber>;
            cpuPercent: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            memoryMb: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            eventLoopLagMs: z.ZodObject<{
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            maxWindows: z.ZodNumber;
            maxPages: z.ZodNumber;
            maxSuspendedPages: z.ZodNumber;
            swallowed: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
            pageCrashes: z.ZodNumber;
            pageUnresponsive: z.ZodNumber;
            suspensionFailures: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly httpAuthRequests: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            origin: z.ZodString;
            proxy: z.ZodBoolean;
            realm: z.ZodString;
            retry: z.ZodBoolean;
        }, z.core.$strict>>;
    };
    readonly respondHttpAuth: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodNullable<z.ZodObject<{
            username: z.ZodString;
            password: z.ZodString;
        }, z.core.$strict>>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly clearSiteData: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly siteDataCount: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            domain: z.ZodString;
            cookies: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly browsingDataPreview: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        readonly result: z.ZodObject<{
            cookies: z.ZodNumber;
            cacheBytes: z.ZodNumber;
            cacheEstimate: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly clearBrowsingData: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodObject<{
            cookies: z.ZodBoolean;
            cache: z.ZodBoolean;
        }, z.core.$strict>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly sitePermissions: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodEnum<{
            allow: "allow";
            deny: "deny";
        }>>>;
    };
    readonly clearSitePermission: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodOptional<z.ZodString>], null>;
        readonly result: z.ZodBoolean;
    };
    readonly cookieControls: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            blockThirdParty: z.ZodBoolean;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly setCookieControls: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly crashReporting: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            available: z.ZodBoolean;
            decided: z.ZodBoolean;
            consent: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly setCrashReporting: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly httpsUpgrade: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[], null>;
        readonly result: z.ZodObject<{
            enabled: z.ZodBoolean;
            available: z.ZodBoolean;
            managed: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly setHttpsUpgrade: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodBoolean], null>;
        readonly result: z.ZodBoolean;
    };
    readonly proceedInsecure: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly useHttp: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString, z.ZodString], null>;
        readonly result: z.ZodBoolean;
    };
    readonly translatePage: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodObject<{
            lang: z.ZodString;
            count: z.ZodNumber;
            truncated: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly showOriginal: {
        readonly owner: Owner;
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: Trust;
        readonly args: z.ZodTuple<[z.ZodString], null>;
        readonly result: z.ZodNumber;
    };
};
export type BrowserHostMethodId = keyof typeof BrowserHostMethods;
export type BrowserHostMethodArgs<M extends BrowserHostMethodId> = z.input<(typeof BrowserHostMethods)[M]["args"]>;
export type BrowserHostMethodResult<M extends BrowserHostMethodId> = z.output<(typeof BrowserHostMethods)[M]["result"]>;
/** Events published by the native browser to an authorized Aux WebUI. */
export declare const HostEvents: {
    readonly onEvent: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            seq: z.ZodNumber;
            streamId: z.ZodString;
            runId: z.ZodOptional<z.ZodString>;
            type: z.ZodString;
            payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            ts: z.ZodNumber;
        }, z.core.$strip>;
    };
    readonly onRunAttentionActivated: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            runId: z.ZodString;
            identity: z.ZodString;
            windowId: z.ZodString;
        }, z.core.$strict>;
    };
    readonly onTabsPatch: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            version: z.ZodNumber;
            baseVersion: z.ZodNumber;
            batterySaverActive: z.ZodOptional<z.ZodBoolean>;
            ops: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
                op: z.ZodLiteral<"upsert">;
                tab: z.ZodObject<{
                    anchor: z.ZodOptional<z.ZodBoolean>;
                    windowKind: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        private: "private";
                        "quick-ask": "quick-ask";
                        little: "little";
                    }>>;
                    split: z.ZodOptional<z.ZodObject<{
                        id: z.ZodString;
                        index: z.ZodNumber;
                    }, z.core.$strict>>;
                    pageId: z.ZodString;
                    windowId: z.ZodString;
                    spaceId: z.ZodOptional<z.ZodString>;
                    workspaceId: z.ZodOptional<z.ZodString>;
                    url: z.ZodString;
                    title: z.ZodString;
                    themeColor: z.ZodOptional<z.ZodString>;
                    favicon: z.ZodOptional<z.ZodString>;
                    loading: z.ZodBoolean;
                    muted: z.ZodBoolean;
                    audible: z.ZodBoolean;
                    canGoBack: z.ZodBoolean;
                    canGoForward: z.ZodBoolean;
                    popup: z.ZodBoolean;
                    crashed: z.ZodBoolean;
                    navigationError: z.ZodOptional<z.ZodObject<{
                        url: z.ZodString;
                        code: z.ZodNumber;
                        message: z.ZodString;
                        upgradedFrom: z.ZodOptional<z.ZodString>;
                    }, z.core.$strip>>;
                    runtimeOwned: z.ZodBoolean;
                    generation: z.ZodNumber;
                    lifecycle: z.ZodOptional<z.ZodEnum<{
                        placeholder: "placeholder";
                        live: "live";
                        frozen: "frozen";
                        discarded: "discarded";
                    }>>;
                    createdAt: z.ZodNumber;
                    lastActiveAt: z.ZodNumber;
                }, z.core.$strip>;
                origin: z.ZodOptional<z.ZodEnum<{
                    runtime: "runtime";
                    external: "external";
                    human: "human";
                }>>;
            }, z.core.$strip>, z.ZodObject<{
                op: z.ZodLiteral<"remove">;
                pageId: z.ZodString;
            }, z.core.$strip>, z.ZodObject<{
                op: z.ZodLiteral<"window">;
                window: z.ZodObject<{
                    windowId: z.ZodString;
                    windowKind: z.ZodOptional<z.ZodEnum<{
                        normal: "normal";
                        private: "private";
                        "quick-ask": "quick-ask";
                        little: "little";
                    }>>;
                    order: z.ZodArray<z.ZodString>;
                    activePageId: z.ZodNullable<z.ZodString>;
                }, z.core.$strip>;
            }, z.core.$strip>], "op">>;
            ts: z.ZodNumber;
        }, z.core.$strip>;
    };
    readonly onDictation: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            sessionId: z.ZodString;
            type: z.ZodEnum<{
                error: "error";
                recording: "recording";
                finishing: "finishing";
                transcript: "transcript";
                final: "final";
            }>;
            text: z.ZodOptional<z.ZodString>;
            message: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly onSidebarEdge: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodBoolean;
    };
    readonly onToolbarEdge: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodBoolean;
    };
    readonly onOrganizationChanged: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodNumber;
    };
    readonly onShortcut: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            key: z.ZodString;
            meta: z.ZodBoolean;
            shift: z.ZodBoolean;
            alt: z.ZodBoolean;
            ctrl: z.ZodOptional<z.ZodBoolean>;
            commandId: z.ZodOptional<z.ZodString>;
            websitePassThrough: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    };
    readonly onSiteZoomChanged: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{}, z.core.$strict>;
    };
    readonly onRuntimeStatus: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            connected: z.ZodBoolean;
            detail: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
    readonly onLoading: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            loading: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly onAudio: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            muted: z.ZodBoolean;
            audible: z.ZodBoolean;
            removed: z.ZodOptional<z.ZodBoolean>;
            video: z.ZodOptional<z.ZodBoolean>;
            pip: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    };
    readonly onPictureInPicture: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            active: z.ZodBoolean;
            reason: z.ZodOptional<z.ZodString>;
            pageId: z.ZodString;
        }, z.core.$strict>;
    };
    readonly onExtensionActionsChanged: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            iconPng: z.ZodString;
            badgeText: z.ZodString;
            badgeColor: z.ZodString;
            enabled: z.ZodBoolean;
            pinned: z.ZodBoolean;
            hasPopup: z.ZodBoolean;
        }, z.core.$strict>>;
    };
    readonly onSidePanel: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            extensionId: z.ZodString;
            windowId: z.ZodString;
            pageId: z.ZodNullable<z.ZodString>;
            contentId: z.ZodNullable<z.ZodString>;
            title: z.ZodString;
            open: z.ZodBoolean;
        }, z.core.$strict>;
    };
    readonly onFocusSpace: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            spaceId: z.ZodNullable<z.ZodString>;
            windowId: z.ZodString;
        }, z.core.$strict>;
    };
    readonly onRoutedOpen: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            profileId: z.ZodString;
            spaceId: z.ZodOptional<z.ZodString>;
            ruleId: z.ZodOptional<z.ZodString>;
            fallbackReason: z.ZodOptional<z.ZodEnum<{
                "profile-unavailable": "profile-unavailable";
                "space-unavailable": "space-unavailable";
            }>>;
        }, z.core.$strict>;
    };
    readonly onRoutePrompt: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            id: z.ZodString;
            url: z.ZodString;
            expiresAt: z.ZodNumber;
        }, z.core.$strict>;
    };
    readonly onLinkStatus: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>;
    };
    readonly onDownload: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            id: z.ZodString;
            sourceUrl: z.ZodOptional<z.ZodString>;
            tabUrl: z.ZodOptional<z.ZodString>;
            downloadRoot: z.ZodOptional<z.ZodString>;
            pageId: z.ZodOptional<z.ZodString>;
            filename: z.ZodString;
            path: z.ZodString;
            size: z.ZodNumber;
            totalBytes: z.ZodOptional<z.ZodNumber>;
            paused: z.ZodOptional<z.ZodBoolean>;
            canResume: z.ZodOptional<z.ZodBoolean>;
            canCancel: z.ZodOptional<z.ZodBoolean>;
            state: z.ZodEnum<{
                interrupted: "interrupted";
                completed: "completed";
                started: "started";
                progressing: "progressing";
                cancelled: "cancelled";
            }>;
            startedAt: z.ZodNumber;
            endedAt: z.ZodOptional<z.ZodNumber>;
            warning: z.ZodOptional<z.ZodEnum<{
                insecure: "insecure";
                executable: "executable";
            }>>;
        }, z.core.$strip>;
    };
    readonly onTabsPlacement: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            windowId: z.ZodString;
            placement: z.ZodObject<{
                space: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    color: z.ZodString;
                    grain: z.ZodOptional<z.ZodNumber>;
                    theme: z.ZodOptional<z.ZodObject<{
                        hue: z.ZodNumber;
                        lightness: z.ZodNumber;
                        intensity: z.ZodNumber;
                        inverted: z.ZodBoolean;
                    }, z.core.$strict>>;
                    workspaceId: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                folder: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                    spaceId: z.ZodString;
                    collapsed: z.ZodBoolean;
                    color: z.ZodOptional<z.ZodString>;
                    emoji: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                tabName: z.ZodOptional<z.ZodObject<{
                    title: z.ZodString;
                    url: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strict>;
    };
    readonly onPageAction: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            url: z.ZodString;
            title: z.ZodString;
            windowId: z.ZodOptional<z.ZodString>;
            topUrl: z.ZodOptional<z.ZodString>;
            capturedAt: z.ZodOptional<z.ZodNumber>;
            documentEpoch: z.ZodOptional<z.ZodNumber>;
            sessionId: z.ZodOptional<z.ZodString>;
            selectionActionId: z.ZodOptional<z.ZodString>;
            action: z.ZodEnum<{
                summarize: "summarize";
                ask: "ask";
                explain: "explain";
                remember: "remember";
                image: "image";
            }>;
            selection: z.ZodString;
            truncated: z.ZodBoolean;
            image: z.ZodOptional<z.ZodObject<{
                dataUrl: z.ZodOptional<z.ZodString>;
                srcURL: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                captureError: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly onVaultOffer: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            username: z.ZodString;
            origin: z.ZodString;
            kind: z.ZodEnum<{
                save: "save";
                update: "update";
            }>;
            itemId: z.ZodOptional<z.ZodString>;
            offerId: z.ZodOptional<z.ZodString>;
            locked: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>;
    };
    readonly onQuickAskState: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodBoolean;
    };
    readonly onHttpAuthChanged: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{}, z.core.$strict>;
    };
    readonly onTranslationChanged: {
        readonly owner: "browser";
        readonly feature: "minimalUi" | "windowSync" | "pinnedApps" | "liveFolders" | "autoArchive" | "pictureInPicture" | "cliOpen" | "tabMentions" | "agentSitePermissions" | "demonstrationSkills" | "overnightReview" | "layouts" | "floatingSidebar" | "autoHideToolbar" | "spaces" | "spaceThemes" | "tabSections" | "folders" | "archive" | "tidy" | "aiTidy" | "splitView" | "peek" | "littleWindow" | "hoverCards" | "linkRouting" | "titleRules" | "aiTabNaming" | "smartDownloadNames" | "tabLifecycle" | "profiles" | "privateWindows" | "commandRegistry" | "browserImport" | "appleScript" | "commandBar" | "searchRanking" | "searchEngines" | "homeAsk" | "quickAsk" | "conversation" | "selectionAsk" | "regionCapture" | "inlineAssist" | "reader" | "aiTranslate" | "summarize" | "siteAdapters" | "dictation" | "voiceCommands" | "realtimeVoice" | "codeMode" | "fourLayerTabApi" | "webMcp" | "agentTabGroups" | "turnScopedTabs" | "modelRouting" | "webTools" | "agentRecovery" | "subagents" | "steerAndTakeover" | "agentOverlay" | "tasksInbox" | "safetyCore" | "durableJournal" | "skills" | "automations" | "goals" | "hooks" | "inboundAgents" | "outboundMcp" | "connectors" | "reports" | "documentArtifacts" | "activeHtml" | "zapAndUserCss" | "memory" | "unifiedRecall" | "extensions" | "passwordManager" | "vault" | "passkeys" | "contentBlocking" | "httpsFirst" | "sitePermissions" | "pageZoom" | "policyProvider" | "updates" | "crashReporting" | "electronMigration" | "onboarding" | "core";
        readonly profileScoped: true;
        readonly trusted: "aux-webui";
        readonly payload: z.ZodObject<{
            pageId: z.ZodString;
            lang: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            count: z.ZodOptional<z.ZodNumber>;
            truncated: z.ZodOptional<z.ZodBoolean>;
            pending: z.ZodOptional<z.ZodBoolean>;
            error: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    };
};
export type HostEventId = keyof typeof HostEvents;
export type HostEventPayload<E extends HostEventId> = z.output<(typeof HostEvents)[E]["payload"]>;
export {};
//# sourceMappingURL=browser-host-methods.d.ts.map