//! Native-only Vector Engine shell (VEC-014).
//!
//! Opens a page through `ve-api`, paints a software screenshot, and writes
//! PNG + observation JSON. `--gui` runs the native event pump (winit when
//! built with `--features window`). No Chromium or Electron is linked.

use std::path::PathBuf;

use anyhow::Result;
use clap::Parser;
use ve_api::{
    BrowserServiceListener, BrowserServicePump, EngineConfig, NativeBrowser, NativeEvent,
    OpenRequest, ScreenshotOptions, VectorEngine,
};
use ve_core::Size;

#[cfg(all(feature = "window", feature = "gpu"))]
mod gpu_window;
#[cfg(feature = "window")]
mod gui;

/// Native Vector Engine shell.
#[derive(Parser, Debug)]
#[command(
    name = "ve-shell",
    about = "Native-only Vector Engine browser (no Chromium)"
)]
struct Args {
    /// URL or `data:` document. Defaults to a blank native page.
    #[arg(default_value = "about:blank")]
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
    /// Bind the shared browser service so Node/MCP clients attach to this
    /// `NativeBrowser` (`Finding` 1). Example: `127.0.0.1:0`.
    #[arg(long)]
    service: Option<String>,
}

fn main() -> Result<()> {
    let args = Args::parse();
    if args.gui {
        return run_gui(&args);
    }
    if let Some(bind) = args.service.as_deref() {
        return run_service(bind, &args);
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

fn run_service(bind: &str, args: &Args) -> Result<()> {
    let listener = BrowserServiceListener::bind_config(
        bind,
        EngineConfig {
            viewport: Size::new(1280.0, 720.0),
            offline: args.url.starts_with("data:")
                || args.url.starts_with("file:")
                || args.html.is_some(),
            scripting: cfg!(feature = "v8"),
            policy: ve_api::NetworkPolicy::permissive(),
            ..EngineConfig::default()
        },
    )?;
    if args.html.is_some() || args.url != "about:blank" {
        let mut client = ve_api::BrowserClient::connect(listener.addr())?;
        let mut params = serde_json::json!({ "url": args.url });
        if let Some(html) = &args.html {
            params["html"] = serde_json::Value::String(html.clone());
        }
        client.call("pages.open", params)?;
    }
    println!(
        "{}",
        serde_json::json!({
            "VECTOR_BROWSER_SERVICE": listener.addr().to_string(),
            "backend": "vector-engine",
            "chromium": false,
            "service": "browser-service",
        })
    );
    listener.wait();
    Ok(())
}

fn run_gui(args: &Args) -> Result<()> {
    let mut browser = NativeBrowser::with_config(EngineConfig {
        viewport: Size::new(1280.0, 720.0),
        offline: args.url.starts_with("data:")
            || args.url.starts_with("file:")
            || args.html.is_some(),
        scripting: cfg!(feature = "v8"),
        policy: ve_api::NetworkPolicy::permissive(),
        ..EngineConfig::default()
    });
    browser.enable_os_clipboard();
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
    let pump = if let Some(bind) = args.service.as_deref() {
        let pump = BrowserServicePump::bind(bind)?;
        println!(
            "{}",
            serde_json::json!({
                "VECTOR_BROWSER_SERVICE": pump.addr().to_string(),
                "backend": "vector-engine",
                "chromium": false,
                "service": "browser-service",
                "gui": true,
            })
        );
        Some(pump)
    } else {
        None
    };
    #[cfg(feature = "window")]
    {
        match pump {
            Some(pump) => {
                gui::run_shared(ve_api::BrowserService::from_browser(browser), Some(pump))
            }
            None => gui::run(browser),
        }
    }
    #[cfg(not(feature = "window"))]
    {
        let _ = pump;
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
