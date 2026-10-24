#!/usr/bin/env python3
"""Focused real selected-graph compilation, serialized by native-build.py."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import time

here=Path(__file__).resolve().parent
native=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
build=native/'out/AuxFast'
parser=argparse.ArgumentParser()
parser.add_argument('--receipt',required=True)
parser.add_argument('--generate',action='store_true')
args=parser.parse_args()
receipt=Path(args.receipt).resolve()
if receipt.exists(): raise SystemExit('Fresh receipt directory required')
receipt.mkdir()
manifest=json.loads((here/'composition.json').read_text())
pins=manifest['inputPins']
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
def verify():
 for name,value in pins.items():
  if sha(native/name)!=value:raise RuntimeError('Native composition changed: '+name)
verify()
targets=[
 'obj/chrome/browser/aux/keyboard_shortcuts/aux_keyboard_shortcuts.o',
 'obj/chrome/browser/aux/profile_gate_prefs/profile_gate_prefs.o',
 'obj/chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences/aux_browser_preferences_api.o',
 *['obj/chrome/browser/ui/ui/'+name+'.o' for name in ['organization_model','organization_codec','organization_service','organization_profile_service','aux_ordinary_tab_projection','aux_sidebar_body','aux_sidebar_projection','aux_organization_window_controller','aux_recent_files_service','aux_recent_files_move_mac','aux_media_commands','routing_model','routing_service','aux_organization_pin_adapter','aux_organization_tree_view','aux_organization_ui_commands','aux_pins_section','aux_spaces_switcher','aux_tab_reference_context','aux_navigation_placement','browser_command_controller','browser_view','browser_view_tabbed_layout_impl','aux_tab_search_bubble','vertical_tab_strip_region_view']],
 *['obj/chrome/browser/ui/ui/'+name+'.o' for name in ['aux_feature_profile_owners','feature_profile_store','aux_file_operation_lifetime','aux_chosen_files_service','aux_chosen_files_drag_mac','aux_recent_files_section','aux_page_capture','aux_developer_commands','aux_split_commands','multi_contents_view']],
 'obj/chrome/browser/ui/views/frame/multi_contents_resize_area_impl/multi_contents_resize_area.o',
 'obj/chrome/browser/ui/views/frame/multi_contents_view_delegate/multi_contents_view_delegate.o',
 'obj/chrome/browser/core/file_select_helper.o',
 'obj/chrome/browser/ui/views/tabs/common/impl/split_tab_view.o',
 'obj/components/split_tabs/split_tabs/split_pane_tree.o',
 'obj/components/sessions/shared/session_service_commands.o',
 'obj/components/sessions/shared/live_tab_context.o',
 'obj/components/tabs/impl/tab_strip_collection.o',
 'obj/chrome/browser/ui/views/toolbar/impl/toolbar_view.o',
 'obj/chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences/aux_feature_expansion_api.o',
 'obj/chrome/browser/extensions/api/aux_browser_preferences/aux_browser_preferences/aux_developer_expansion_api.o',
 'obj/chrome/browser/ui/browser_window/internal/internal/browser_window_features.o',
 'obj/chrome/browser/sessions/impl/session_restore.o',
 'obj/chrome/browser/ui/tabs/tab_strip_impl/tab_strip_model.o',
 'obj/chrome/browser/aux/account_profile_updater/account_profile_updater.o',
 'obj/chrome/browser/themes/themes/aux_theme_editor.o',
 'obj/chrome/browser/themes/themes/theme_service.o',
 'obj/chrome/browser/devtools/devtools/chrome_devtools_manager_delegate.o',
 'obj/content/browser/browser/devtools_session.o',
 *['obj/chrome/browser/ui/ui/'+name+'.o' for name in ['aux_feature_commands','aux_preview_controller','aux_preview_controls','aux_preview_ingress','aux_preview_navigation_throttle','external_routing_ingress','cold_start_routing','shortcut_routing_mac','browser_live_tab_context','tab_helpers','unload_controller','aux_owned_browser_quiesce']],
 'obj/chrome/browser/aux/platform/feature_write_participant.o',
 'obj/chrome/browser/aux/platform/AuxSelectedStateHome.o',
 'obj/chrome/browser/core/chrome_content_browser_client.o',
 'obj/chrome/browser/core/app_controller_mac.o',
 'obj/chrome/browser/download/impl/chrome_download_manager_delegate.o',
 'obj/chrome/browser/renderer_context_menu/impl/render_view_context_menu.o',
 'obj/chrome/browser/ui/browser_web_contents_delegate/browser_web_contents_delegate/browser_web_contents_delegate.o',
 'obj/chrome/browser/ui/startup/impl/startup_browser_creator.o',
 'obj/chrome/browser/ui/startup/impl/startup_browser_creator_impl.o',
 'obj/components/sessions/shared/tab_restore_service_helper.o',
 'obj/components/sessions/shared/tab_restore_service_impl.o',
 'obj/components/split_tabs/split_tabs/split_tab_visual_data.o',


]
ninja=str(native/'third_party/ninja/ninja')
result={'format':'aux.browser-features.native-compile.v1','passed':False,'sourcePins':pins,
        'targets':targets,'appExecuted':False,'productSigned':False,'runs':[]}
try:
 if args.generate:
  start=time.monotonic()
  with (receipt/'generate.log').open('w') as log:
   generated=subprocess.run([str(native/'buildtools/mac/gn'),'gen',str(build)],cwd=native,stdout=log,stderr=subprocess.STDOUT)
  result['runs'].append({'name':'generate','exitCode':generated.returncode,'seconds':time.monotonic()-start})
  if generated.returncode:raise RuntimeError('Native generation failed')
 for name,args in [('commands',['-t','commands',*targets])]:
  start=time.monotonic()
  with (receipt/(name+'.log')).open('w') as log:
   run=subprocess.run([ninja,'-C',str(build),*args],cwd=native,stdout=log,stderr=subprocess.STDOUT)
  result['runs'].append({'name':name,'exitCode':run.returncode,'seconds':time.monotonic()-start})
  if run.returncode:raise RuntimeError(name+' failed')
 commands=(receipt/'commands.log').read_text(errors='replace').splitlines()
 if any('/codesign ' in c or 'notarytool ' in c or '/productsign ' in c for c in commands):
  raise RuntimeError('Unexpected signing action')
 result['commandInventorySha256']=sha(receipt/'commands.log')
 result['commandCount']=len(commands)
 start=time.monotonic()
 with (receipt/'build.log').open('w') as log:
  run=subprocess.run([ninja,'-C',str(build),'-j6','-k0',*targets],cwd=native,stdout=log,stderr=subprocess.STDOUT)
 result['runs'].append({'name':'compile','exitCode':run.returncode,'seconds':time.monotonic()-start})
 result['passed']=run.returncode==0
 if result['passed']:
  result['objects']={target:{'bytes':(build/target).stat().st_size} for target in targets}
  if any(value['bytes']<=0 for value in result['objects'].values()):raise RuntimeError('Missing/empty actual compiler output')
 verify()
except Exception as error:
 result['passed']=False
 result['error']=str(error)
finally:
 (receipt/'receipt.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'passed':result['passed'],'receipt':str(receipt/'receipt.json')}))
if not result['passed']:
 log=receipt/'build.log'
 if log.exists():
  lines=log.read_text(errors='replace').splitlines()
  for line in lines[-65:]:
   if len(line)<1100:print(line)
 raise SystemExit(1)
