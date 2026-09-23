import { app, safeStorage } from "electron";
import { join } from "node:path";
import { BrowserHealthRecorder } from "../browser-health.js";
import { BrowserProfiles } from "../browser-profiles.js";
import { DownloadLocation } from "../download-location.js";
import { ExtensionManager } from "../extensions.js";
import { LocalProjects } from "../local-projects.js";
import { createOffscreenHolds } from "../offscreen-holds.js";
import { PageFinder } from "../page-find.js";
import { ProjectCommands } from "../project-commands.js";
import { ProjectFiles } from "../project-files.js";
import { SecretStore } from "../secret-store.js";
import { SiteZoomPreferences } from "../site-zoom.js";
import { frozenPages } from "../tabs/lifecycle-controller.js";
import { TargetRegistry } from "../target-registry.js";
import { regularWindows } from "../windows/registry.js";
import { DATA_DIR, PROFILE_DIR, desktopEnv, desktopStartedAt } from "./bootstrap.js";

export const browserProfiles=new BrowserProfiles(desktopEnv.AUX_PROFILE_CATALOG_DIR??join(DATA_DIR,"browser-profiles"),desktopEnv.AUX_BROWSER_PROFILE_ID??"default",{dataDir:DATA_DIR,profileDir:PROFILE_DIR});
export const profile = { name: browserProfiles.read(browserProfiles.currentId).name };
export const extensionManager = new ExtensionManager(DATA_DIR);
export const downloadLocation = new DownloadLocation(DATA_DIR);
export const localProjects = new LocalProjects(join(DATA_DIR, "projects"));
export const projectCommands = new ProjectCommands(join(DATA_DIR, "project-commands"),10*60*1000,projectId=>localProjects.snapshotTree(projectId));
export const projectFiles = new ProjectFiles(id => localProjects.files(id),(id,name)=>localProjects.allowFileCreation(id,name));

export const secrets = new SecretStore(join(DATA_DIR, "secrets"), safeStorage);
export const cloudPreviewTokens = new Map<string,string>();

export const registry = new TargetRegistry();
export const browserHealth = new BrowserHealthRecorder(DATA_DIR,desktopStartedAt,()=>app.getAppMetrics(),()=>({windows:regularWindows.size,pages:registry.all().length,suspendedPages:frozenPages.size}));

// Pointer input only lands on a visible, laid-out view. An agent lease and a
// conversation preview each keep their page visible offscreen (stage-sized,
// beneath the shell) so Chromium keeps laying it out. Any number of pages can
// be held at once. setVisible(false) stops frames and Playwright stalls.
export const offscreen = createOffscreenHolds();

export const pageFinder = new PageFinder();

export const siteZoom = new SiteZoomPreferences(join(DATA_DIR, "site-zoom.json"));
