import type { DownloadNamingSettings } from "./download-naming.js";

export const DEFAULT_DOWNLOAD_NAMING: DownloadNamingSettings = {
  mode: "unclear",
  useAi: true,
  excludedHosts: [],
  excludedExtensions: [],
  excludedMimeTypes: [],
  template: "{date} {site} {title}",
};
