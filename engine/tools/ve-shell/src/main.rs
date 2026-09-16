//! Native-only Vector Engine shell (VEC-014).
//!
//! Opens a page through `ve-api`, paints a software screenshot, and writes
//! PNG + observation JSON. `--gui` runs the native event pump (winit when
//! built with `--features window`). No Chromium or Electron is linked.

use std::path::PathBuf;

use anyhow::Result;
use clap::Parser;
use ve_api::{
    EngineConfig, NativeBrowser, NativeEvent, OpenRequest, ScreenshotOptions, VectorEngine,
};
use ve_core::Size;

#[cfg(feature = "window")]
mod gui;

/// Native Vector Engine shell.
#[derive(Parser, Debug)]
#[command(
    name = "ve-shell",
    about = "Native-only Vector Engine browser (no Chromium)"
)]
struct Args {
    /// URL or `data:` document.
    url: String,
    /// Write PNG here.
    #[arg(long)]
    screenshot: Option<PathBuf>,
    /// Write observation JSON here.
    #[arg(long)]
    observe: Option<PathBuf>,
    /// Inline HTML instead of fetching.
    #[arg(long)]
    html: Option<String>,
    /// Open a native window (or a headless event pump without `--features window`).
    #[arg(long)]
    gui: bool,
}

fn main() -> Result<()> {
    let args = Args::parse();
    if args.gui {
        return run_gui(&args);
    }
    let mut engine = VectorEngine::new(EngineConfig {
        viewport: Size::new(1280.0, 720.0),
        offline: args.url.starts_with("data:") || args.html.is_some(),
        policy: ve_api::NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });
    let opened = engine.open(OpenRequest {
        url: Some(args.url.clone()),
        html: args.html,
        ..OpenRequest::default()
    })?;
    if let Some(ref path) = args.screenshot {
        let shot = engine.screenshot(opened.page, &ScreenshotOptions::default())?;
        std::fs::write(path, &shot.png)?;
        eprintln!("wrote {} ({}x{})", path.display(), shot.width, shot.height);
    }
    if let Some(ref path) = args.observe {
        let obs = engine.observe_json(opened.page.0, "{}");
        std::fs::write(path, obs)?;
        eprintln!("wrote {}", path.display());
    }
    if args.screenshot.is_none() && args.observe.is_none() {
        println!(
            "{}",
            serde_json::json!({
                "backend": "vector-engine",
                "chromium": false,
                "page": opened.page.0,
                "url": opened.url,
                "title": opened.title,
                "identity": "native-shell",
                "rssBytes": ve_core::process_rss_bytes(),
            })
        );
    }
    Ok(())
}

fn run_gui(args: &Args) -> Result<()> {
    let mut browser = NativeBrowser::with_config(EngineConfig {
        viewport: Size::new(1280.0, 720.0),
        offline: args.url.starts_with("data:") || args.html.is_some(),
        policy: ve_api::NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });
    let html = args.html.clone();
    if let Some(html) = html {
        browser.handle_event(NativeEvent::NewTab {
            html,
            url: args.url.clone(),
        })?;
    } else {
        browser.open_url(&args.url)?;
        let _ = browser.present();
    }
    let _ = browser.present();
    #[cfg(feature = "window")]
    {
        gui::run(browser)
    }
    #[cfg(not(feature = "window"))]
    {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "mode": "headless-native",
                "rebuildWith": "--features window",
                "identity": browser.identity(),
                "chromeAx": browser.chrome_ax(),
                "chromeTitle": NativeBrowser::CHROME_TITLE,
            }))?
        );
        Ok(())
    }
}
