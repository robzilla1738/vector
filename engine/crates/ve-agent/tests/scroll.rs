//! H1-A5: rubber-band, trackpad momentum, prefers-reduced-motion.

use ve_agent::{Page, ScrollDirection};
use ve_core::Size;

fn tall(overscroll: &str) -> Page {
    Page::from_html(
        1,
        &format!(
            r#"<html style="overscroll-behavior:{overscroll}">
                 <body style="margin:0;height:4000px"><p>tall</p></body>
               </html>"#
        ),
        Some("https://s.test/tall"),
        Size::new(200.0, 200.0),
    )
}

#[test]
fn rubber_band_overshoots_then_springs_back() {
    let mut page = tall("auto");
    page.update();
    let max = page.scroll(None, ScrollDirection::Bottom, None).unwrap();
    assert!(max.max_y > 100.0, "{max:?}");
    page.scroll_by(0.0, 240.0);
    assert!(
        page.overscroll_offset().y > 8.0,
        "expected rubber-band, overscroll={:?}",
        page.overscroll_offset()
    );
    page.tick_scroll_physics(240.0);
    assert!(
        page.overscroll_offset().y.abs() < 0.5,
        "spring-back leftover {:?}",
        page.overscroll_offset()
    );
}

#[test]
fn overscroll_behavior_none_clamps() {
    let mut page = tall("none");
    page.update();
    let _ = page.scroll(None, ScrollDirection::Bottom, None).unwrap();
    page.scroll_by(0.0, 240.0);
    assert_eq!(page.overscroll_offset().y, 0.0);
}

#[test]
fn reduced_motion_skips_rubber_band_and_momentum() {
    let mut page = tall("auto");
    page.update();
    page.set_reduced_motion(true);
    let _ = page.scroll(None, ScrollDirection::Bottom, None).unwrap();
    page.scroll_by(0.0, 240.0);
    assert_eq!(page.overscroll_offset().y, 0.0);
    let y = page.scroll_offset().y;
    page.tick_scroll_physics(80.0);
    assert!((page.scroll_offset().y - y).abs() < 0.01);
}

#[test]
fn momentum_coasts_after_a_flick() {
    let mut page = tall("auto");
    page.update();
    page.scroll_by(0.0, 48.0);
    let y0 = page.scroll_offset().y;
    assert!(y0 > 0.0);
    page.tick_scroll_physics(48.0);
    assert!(
        page.scroll_offset().y > y0 + 4.0,
        "momentum should coast past the flick ({y0} -> {})",
        page.scroll_offset().y
    );
}
