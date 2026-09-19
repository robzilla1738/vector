//! Tiled page-layer raster cache (H1-A5).
//!
//! The display list is split into a grid of [`TILE_PX`] physical tiles.
//! Scroll only changes the blit origin. Localized damage marks intersecting
//! tiles dirty; clean tiles keep their last raster.

use ve_core::{Rect, Size};

use crate::GfxError;
use crate::display_list::DisplayList;
use crate::renderer::{Frame, Renderer, SoftwareRenderer};

/// Physical-pixel tile edge. 256 keeps a 1280×720 @1x page on a 5×3 grid.
pub const TILE_PX: u32 = 256;

/// Raster cache of one page layer, addressed in physical pixels.
#[derive(Clone, Debug)]
pub struct TileGrid {
    /// Layer width in physical pixels.
    pub width: u32,
    /// Layer height in physical pixels.
    pub height: u32,
    tile_px: u32,
    cols: u32,
    rows: u32,
    tiles: Vec<Option<Frame>>,
    dirty: Vec<bool>,
    rebuilds: u64,
}

impl TileGrid {
    /// A fully dirty grid covering `width × height`.
    #[must_use]
    pub fn new(width: u32, height: u32) -> Self {
        Self::with_tile(width, height, TILE_PX)
    }

    /// Same as [`Self::new`] with an explicit tile edge (tests).
    #[must_use]
    pub fn with_tile(width: u32, height: u32, tile_px: u32) -> Self {
        let tile_px = tile_px.max(1);
        let cols = width.div_ceil(tile_px).max(1);
        let rows = height.div_ceil(tile_px).max(1);
        let n = (cols * rows) as usize;
        Self {
            width: width.max(1),
            height: height.max(1),
            tile_px,
            cols,
            rows,
            tiles: vec![None; n],
            dirty: vec![true; n],
            rebuilds: 0,
        }
    }

    /// Drops rasters and marks every tile dirty at a new size.
    pub fn reset(&mut self, width: u32, height: u32) {
        *self = Self::with_tile(width, height, self.tile_px);
    }

    /// Column count.
    #[must_use]
    pub fn cols(&self) -> u32 {
        self.cols
    }

    /// Row count.
    #[must_use]
    pub fn rows(&self) -> u32 {
        self.rows
    }

    /// Tiles waiting to be rasterized.
    #[must_use]
    pub fn dirty_count(&self) -> usize {
        self.dirty.iter().filter(|d| **d).count()
    }

    /// How many tiles have been rasterized since this grid was created.
    #[must_use]
    pub fn rebuilds(&self) -> u64 {
        self.rebuilds
    }

    fn index(&self, col: u32, row: u32) -> usize {
        (row * self.cols + col) as usize
    }

    /// Marks every tile dirty without dropping rasters.
    pub fn invalidate_all(&mut self) {
        for d in &mut self.dirty {
            *d = true;
        }
    }

    /// Marks tiles that intersect `rect` (physical pixels of this layer).
    pub fn invalidate_rect(&mut self, rect: Rect) {
        if self.cols == 0 || self.rows == 0 {
            return;
        }
        let x0 = rect.x().floor().max(0.0) as u32;
        let y0 = rect.y().floor().max(0.0) as u32;
        let x1 = rect.right().ceil().max(0.0) as u32;
        let y1 = rect.bottom().ceil().max(0.0) as u32;
        if x0 >= self.width || y0 >= self.height || x1 == 0 || y1 == 0 {
            return;
        }
        let c0 = (x0 / self.tile_px).min(self.cols - 1);
        let r0 = (y0 / self.tile_px).min(self.rows - 1);
        let c1 = (x1.saturating_sub(1) / self.tile_px).min(self.cols - 1);
        let r1 = (y1.saturating_sub(1) / self.tile_px).min(self.rows - 1);
        for row in r0..=r1 {
            for col in c0..=c1 {
                let i = (row * self.cols + col) as usize;
                self.dirty[i] = true;
            }
        }
    }

    /// Rasterizes dirty tiles and blits them into `dest`. Returns how many
    /// tiles were rebuilt this call.
    pub fn rasterize_dirty_into(
        &mut self,
        dest: &mut Frame,
        renderer: &mut SoftwareRenderer,
        list: &DisplayList,
        scale: f32,
    ) -> Result<u32, GfxError> {
        let scale = scale.max(0.01);
        let mut painted = 0u32;
        for row in 0..self.rows {
            for col in 0..self.cols {
                let i = self.index(col, row);
                if !self.dirty[i] {
                    continue;
                }
                let ox = (col * self.tile_px) as f32 / scale;
                let oy = (row * self.tile_px) as f32 / scale;
                let tw = self
                    .tile_px
                    .min(self.width.saturating_sub(col * self.tile_px));
                let th = self
                    .tile_px
                    .min(self.height.saturating_sub(row * self.tile_px));
                if tw == 0 || th == 0 {
                    self.dirty[i] = false;
                    continue;
                }
                let mut tile_list =
                    DisplayList::new(Size::new(tw as f32 / scale, th as f32 / scale));
                tile_list.append_translated(list, -ox, -oy);
                let frame = renderer.render(&tile_list, tw, th, scale)?;
                dest.blit_from(
                    &frame,
                    (col * self.tile_px) as i32,
                    (row * self.tile_px) as i32,
                );
                self.tiles[i] = Some(frame);
                self.dirty[i] = false;
                self.rebuilds += 1;
                painted += 1;
            }
        }
        Ok(painted)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::display_list::DisplayItem;
    use ve_style::Rgba;

    fn two_rects() -> DisplayList {
        let mut list = DisplayList::new(Size::new(512.0, 512.0));
        list.push(DisplayItem::Rect {
            rect: Rect::new(8.0, 8.0, 16.0, 16.0),
            color: Rgba::rgb(255, 0, 0),
        });
        list.push(DisplayItem::Rect {
            rect: Rect::new(300.0, 300.0, 16.0, 16.0),
            color: Rgba::rgb(0, 0, 255),
        });
        list
    }

    #[test]
    fn small_rect_dirties_one_tile() {
        let mut grid = TileGrid::with_tile(512, 512, 256);
        assert_eq!(grid.cols(), 2);
        assert_eq!(grid.rows(), 2);
        assert_eq!(grid.dirty_count(), 4);
        for d in &mut grid.dirty {
            *d = false;
        }
        grid.invalidate_rect(Rect::new(10.0, 10.0, 8.0, 8.0));
        assert_eq!(grid.dirty_count(), 1);
        grid.invalidate_rect(Rect::new(300.0, 300.0, 8.0, 8.0));
        assert_eq!(grid.dirty_count(), 2);
    }

    #[test]
    fn rasterize_skips_clean_tiles() {
        let mut grid = TileGrid::with_tile(512, 512, 256);
        let mut dest = Frame::filled(512, 512, [255, 255, 255, 255]);
        let mut sw = SoftwareRenderer::new();
        let list = two_rects();
        assert_eq!(
            grid.rasterize_dirty_into(&mut dest, &mut sw, &list, 1.0)
                .unwrap(),
            4
        );
        assert_eq!(grid.rebuilds(), 4);
        assert_eq!(grid.dirty_count(), 0);
        assert_eq!(
            grid.rasterize_dirty_into(&mut dest, &mut sw, &list, 1.0)
                .unwrap(),
            0
        );
        assert_eq!(grid.rebuilds(), 4);
        grid.invalidate_rect(Rect::new(8.0, 8.0, 16.0, 16.0));
        assert_eq!(grid.dirty_count(), 1);
        assert_eq!(
            grid.rasterize_dirty_into(&mut dest, &mut sw, &list, 1.0)
                .unwrap(),
            1
        );
        assert_eq!(grid.rebuilds(), 5);
        assert_eq!(dest.pixel(12, 12).unwrap()[0], 255);
        assert_eq!(dest.pixel(308, 308).unwrap()[2], 255);
    }
}
