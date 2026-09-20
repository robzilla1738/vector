// Keep the regular shared-profile runtime and the private browser in separate
// processes. The private entry never imports the regular runtime/CDP bootstrap.
if (process.argv.includes("--aux-private")) await import("./private-main.js");
else await import("./index.js");
