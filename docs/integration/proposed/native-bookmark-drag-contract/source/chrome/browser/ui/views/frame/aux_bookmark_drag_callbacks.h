// Copyright 2026 The Aux Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_DRAG_CALLBACKS_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_BOOKMARK_DRAG_CALLBACKS_H_

#include "base/functional/callback.h"
#include "ui/base/models/image_model.h"
#include "ui/gfx/geometry/point.h"
#include "ui/gfx/geometry/rect.h"

namespace bookmarks {
class BookmarkNode;
}

namespace aux {

// Original BookmarksView6d0 invokes region462d1c0 from both drag461919c
// and release461a0cc. The boolean is the genuine region's admission result,
// not a notification. Images and coordinates come from the actual row/event.
using BookmarkDragBeginCallback = base::RepeatingCallback<bool(
    const bookmarks::BookmarkNode*,
    const ui::ImageModel&,
    const gfx::Rect& row_screen_bounds,
    const gfx::Point& event_screen_point)>;
// Original6d8/6e0: conversion/removal belongs to the genuine region owner.
using BookmarkDragDetachedCallback =
    base::RepeatingCallback<void(const bookmarks::BookmarkNode*)>;
using BookmarkDragFinishedCallback = base::RepeatingClosure;
// Original6c8 reads the separately retained 860/861/970/978 projection.
using BookmarkDragProjectionChangedCallback = base::RepeatingClosure;

}  // namespace aux
#endif
