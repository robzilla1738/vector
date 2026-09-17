//! Official `MotionMark` GPU present path (VEC-021).

#[cfg(feature = "gpu")]
use std::time::Instant;

#[cfg(feature = "gpu")]
use ve_core::{Rect, Size};
#[cfg(feature = "gpu")]
use ve_gfx::DisplayList;
#[cfg(feature = "gpu")]
use ve_style::Rgba;

#[cfg(feature = "gpu")]
use crate::percentile;
use crate::{SuiteResult, pin};

/// `MotionMark` Multiply-class: many moving rects presented on the GPU with no CPU readback.
pub(crate) fn run_gpu(iterations: u32) -> SuiteResult {
    let revision = pin("motionmark", "revision");
    #[cfg(not(feature = "gpu"))]
    {
        let _ = iterations;
        SuiteResult {
            name: "motionmark.gpu.multiply".into(),
            status: "NOTRUN",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: Some("built without gpu".into()),
        }
    }
    #[cfg(feature = "gpu")]
    {
        run_gpu_inner(iterations, revision)
    }
}

#[cfg(feature = "gpu")]
fn run_gpu_inner(iterations: u32, revision: String) -> SuiteResult {
    let started_init = Instant::now();
    let (mut renderer, adapter) = match ve_gfx::VelloRenderer::headless() {
        Ok(pair) => pair,
        Err(e) => {
            return SuiteResult {
                name: "motionmark.gpu.multiply".into(),
                status: "NOTRUN",
                revision,
                samples_ms: None,
                p50_ms: None,
                p95_ms: None,
                detail: Some(format!("no GPU adapter: {e}")),
            };
        }
    };
    let init_ms = u64::try_from(started_init.elapsed().as_millis()).unwrap_or(u64::MAX);
    let mut samples = Vec::new();
    let mut last = None;
    for frame in 0..iterations.max(1) {
        let mut list = DisplayList::new(Size::new(800.0, 600.0));
        list.push(ve_gfx::DisplayItem::Rect {
            rect: Rect::new(0.0, 0.0, 800.0, 600.0),
            color: Rgba::WHITE,
        });
        for i in 0..400u32 {
            let t = (i + frame) as f32;
            list.push(ve_gfx::DisplayItem::Rect {
                rect: Rect::new((t * 7.0) % 780.0, (t * 11.0) % 580.0, 18.0, 18.0),
                color: if i.is_multiple_of(2) {
                    Rgba::rgb(220, 40, 40)
                } else {
                    Rgba::rgb(40, 40, 220)
                },
            });
        }
        let started = Instant::now();
        match renderer.present_list(&list, 800, 600, 1.0) {
            Ok(()) => {
                samples.push(u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX))
            }
            Err(e) => last = Some(e.to_string()),
        }
    }
    if samples.is_empty() {
        return SuiteResult {
            name: "motionmark.gpu.multiply".into(),
            status: "FAIL",
            revision,
            samples_ms: None,
            p50_ms: None,
            p95_ms: None,
            detail: last.or(Some(adapter)),
        };
    }
    SuiteResult {
        name: "motionmark.gpu.multiply".into(),
        status: "PASS",
        revision,
        p50_ms: Some(percentile(&samples, 0.50)),
        p95_ms: Some(percentile(&samples, 0.95)),
        samples_ms: Some(samples),
        detail: Some(format!("adapter={adapter}; init_ms={init_ms}")),
    }
}

#[cfg(test)]
mod tests {
    use super::run_gpu;

    #[test]
    fn gpu_multiply_is_honest_without_feature() {
        let r = run_gpu(1);
        #[cfg(not(feature = "gpu"))]
        {
            assert_eq!(r.status, "NOTRUN");
        }
        #[cfg(feature = "gpu")]
        {
            assert!(
                r.status == "PASS" || r.status == "NOTRUN",
                "{} {:?}",
                r.status,
                r.detail
            );
            if r.status == "PASS" {
                assert!(r.p95_ms.is_some());
            }
        }
    }
}
