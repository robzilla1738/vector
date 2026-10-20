// Copyright 2026 Aux Authors. BSD-3-Clause; see //LICENSE.
// Supplied AppKit owner: original4265d48/4265f80/4266a28/4266bac/4267ec0.
#include "chrome/browser/extensions/api/aux_browser_import/source_profile_picker_mac.h"

#import <AppKit/AppKit.h>
#import <objc/runtime.h>

#include <algorithm>
#include <utility>

#include "base/check_op.h"
#include "base/functional/callback.h"
#include "base/strings/sys_string_conversions.h"
#include "content/public/browser/web_contents.h"
#include "ui/gfx/native_ui_types.h"

namespace {
char kSourceProfilePopoverKey;

CGFloat PickerHeight(size_t count) {
  return std::min<CGFloat>(320, std::max<size_t>(1, count) * 22 + 122);
}

NSString* ProfileString(const base::DictValue& profile, const char* key) {
  const auto* value = profile.FindString(key);
  return value ? base::SysUTF8ToNSString(*value) : @"";
}
}  // namespace

@interface AuxChromiumSourceProfilePickerController : NSViewController {
  std::u16string _browser_name;
  base::ListValue _profiles;
  base::OnceCallback<void(base::DictValue)> _selected;
  NSMutableArray<NSButton*>* _checkboxes;
  NSInteger _selected_index;
  NSButton* _confirm_button;
}
@property(nonatomic, weak) NSPopover* popover;
- (instancetype)initWithBrowserName:(std::u16string)browser_name
                          profiles:(base::ListValue)profiles
                        onSelected:(base::OnceCallback<void(base::DictValue)>)selected;
@end

@implementation AuxChromiumSourceProfilePickerController
- (instancetype)initWithBrowserName:(std::u16string)browser_name
                          profiles:(base::ListValue)profiles
                        onSelected:(base::OnceCallback<void(base::DictValue)>)selected {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _browser_name = std::move(browser_name);
    _profiles = std::move(profiles);
    _selected = std::move(selected);
    _checkboxes = [[NSMutableArray alloc] init];
    _selected_index = NSNotFound;
  }
  return self;
}

- (void)loadView {
  NSView* root = [[NSView alloc]
      initWithFrame:NSMakeRect(0, 0, 320, PickerHeight(_profiles.size()))];
  NSStackView* stack = [[NSStackView alloc] initWithFrame:root.bounds];
  stack.orientation = NSUserInterfaceLayoutOrientationVertical;
  stack.alignment = NSLayoutAttributeLeading;
  stack.spacing = 12;
  stack.edgeInsets = NSEdgeInsetsMake(16, 16, 12, 16);
  stack.translatesAutoresizingMaskIntoConstraints = NO;
  [root addSubview:stack];
  [NSLayoutConstraint activateConstraints:@[
    [stack.leadingAnchor constraintEqualToAnchor:root.leadingAnchor],
    [stack.trailingAnchor constraintEqualToAnchor:root.trailingAnchor],
    [stack.topAnchor constraintEqualToAnchor:root.topAnchor],
    [stack.bottomAnchor constraintEqualToAnchor:root.bottomAnchor],
  ]];

  NSString* browser_name = base::SysUTF16ToNSString(_browser_name);
  NSTextField* title = [NSTextField labelWithString:
      [NSString stringWithFormat:@"Choose a %@ profile", browser_name]];
  title.font = [NSFont systemFontOfSize:13 weight:NSFontWeightSemibold];
  [stack addArrangedSubview:title];
  [stack setCustomSpacing:6 afterView:title];

  NSTextField* description = [NSTextField labelWithString:
      [NSString stringWithFormat:@"Pick the %@ profile you want to import into Aux.",
                                 browser_name]];
  description.font = [NSFont systemFontOfSize:12];
  description.textColor = NSColor.secondaryLabelColor;
  description.lineBreakMode = NSLineBreakByWordWrapping;
  description.maximumNumberOfLines = 2;
  [description.widthAnchor constraintEqualToConstant:288].active = YES;
  [stack addArrangedSubview:description];

  NSStackView* rows = [[NSStackView alloc] init];
  rows.orientation = NSUserInterfaceLayoutOrientationVertical;
  rows.alignment = NSLayoutAttributeLeading;
  rows.spacing = 8;
  [rows.widthAnchor constraintEqualToConstant:288].active = YES;
  [stack addArrangedSubview:rows];
  if (_profiles.empty()) {
    NSTextField* empty = [NSTextField labelWithString:
        [NSString stringWithFormat:@"No %@ profiles were found on this Mac.",
                                   browser_name]];
    empty.font = [NSFont systemFontOfSize:12];
    empty.textColor = NSColor.secondaryLabelColor;
    [rows addArrangedSubview:empty];
  } else {
    for (size_t index = 0; index < _profiles.size(); ++index) {
      const auto& profile = _profiles[index].GetDict();
      NSButton* checkbox = [[NSButton alloc] initWithFrame:NSZeroRect];
      NSString* name = ProfileString(profile, "name");
      NSString* subtitle = ProfileString(profile, "subtitle");
      checkbox.title = subtitle.length
          ? [NSString stringWithFormat:@"%@ - %@", name, subtitle] : name;
      checkbox.target = self;
      checkbox.action = @selector(onProfileCheckboxClicked:);
      [checkbox setButtonType:NSButtonTypeSwitch];
      checkbox.font = [NSFont systemFontOfSize:13];
      checkbox.tag = index;
      checkbox.state = NSControlStateValueOff;
      [_checkboxes addObject:checkbox];
      [rows addArrangedSubview:checkbox];
    }
  }

  NSView* footer = [[NSView alloc] initWithFrame:NSZeroRect];
  footer.translatesAutoresizingMaskIntoConstraints = NO;
  [footer.heightAnchor constraintEqualToConstant:32].active = YES;
  [footer.widthAnchor constraintEqualToConstant:288].active = YES;
  _confirm_button = [NSButton buttonWithTitle:@"Continue"
                                     target:self
                                     action:@selector(onConfirmButtonClicked:)];
  _confirm_button.enabled = NO;
  _confirm_button.bezelStyle = NSBezelStyleRounded;
  _confirm_button.controlSize = NSControlSizeRegular;
  _confirm_button.translatesAutoresizingMaskIntoConstraints = NO;
  [footer addSubview:_confirm_button];
  [NSLayoutConstraint activateConstraints:@[
    [_confirm_button.trailingAnchor constraintEqualToAnchor:footer.trailingAnchor],
    [_confirm_button.centerYAnchor constraintEqualToAnchor:footer.centerYAnchor],
  ]];
  [stack addArrangedSubview:footer];
  self.view = root;
}

- (void)onProfileCheckboxClicked:(NSButton*)sender {
  NSInteger selected = sender.state == NSControlStateValueOn
      ? sender.tag : NSNotFound;
  for (NSButton* checkbox in _checkboxes) {
    checkbox.state = selected != NSNotFound && checkbox == sender
        ? NSControlStateValueOn : NSControlStateValueOff;
  }
  _selected_index = selected;
  _confirm_button.enabled = selected != NSNotFound;
}

- (void)onConfirmButtonClicked:(id)sender {
  // Keep this presented owner alive across a callback that may close its page.
  NSPopover* popover = self.popover;
  if (_selected_index != NSNotFound && _selected) {
    CHECK_LT(static_cast<size_t>(_selected_index), _profiles.size());
    auto profile = _profiles[_selected_index].GetDict().Clone();
    std::move(_selected).Run(std::move(profile));
  }
  [popover close];
}
@end

namespace aux_import {
void ShowChromiumSourceProfilePicker(
    content::WebContents* web_contents,
    const gfx::Rect& button_bounds,
    std::u16string browser_name,
    base::ListValue profiles,
    base::OnceCallback<void(base::DictValue)> selected) {
  if (!web_contents) return;
  NSView* view = web_contents->GetNativeView().GetNativeNSView();
  if (!view || !view.window) return;
  NSPopover* previous = objc_getAssociatedObject(view, &kSourceProfilePopoverKey);
  [previous close];
  const CGFloat content_height = PickerHeight(profiles.size());
  auto* controller = [[AuxChromiumSourceProfilePickerController alloc]
      initWithBrowserName:std::move(browser_name)
                 profiles:std::move(profiles)
               onSelected:std::move(selected)];
  NSPopover* popover = [[NSPopover alloc] init];
  popover.behavior = NSPopoverBehaviorTransient;
  // The source computes the same content size both here and in loadView.
  popover.contentSize = NSMakeSize(320, content_height);
  popover.contentViewController = controller;
  controller.popover = popover;
  objc_setAssociatedObject(view, &kSourceProfilePopoverKey, popover,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  NSRect anchor = NSMakeRect(button_bounds.x(),
      NSHeight(view.bounds) - button_bounds.y() - button_bounds.height(),
      button_bounds.width(), button_bounds.height());
  [popover showRelativeToRect:anchor ofView:view preferredEdge:NSMinYEdge];
}
}  // namespace aux_import
