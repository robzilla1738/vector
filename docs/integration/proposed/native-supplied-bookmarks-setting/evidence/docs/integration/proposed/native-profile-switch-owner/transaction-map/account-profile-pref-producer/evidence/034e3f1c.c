// func FUN_034e3f1c @ 034e3f1c size 1240

void FUN_034e3f1c(undefined8 param_1)

{
  undefined8 local_58;
  undefined8 uStack_50;
  ulong local_48;
  uint local_40 [6];
  undefined1 local_28;
  
  local_40[0] = 0xffffffff;
  local_28 = 2;
  FUN_00bddc50(param_1,"aside.account_id",0x10,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.account_user_id",0x15,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.account_email",0x13,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.account_display_name",0x1a,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.account_profile_url",0x19,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_40[0] = local_40[0] & 0xffffff00;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.account_has_persisted_session",0x23,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0] = local_40[0] & 0xffffff00;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.account_auth_paused",0x19,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0] = local_40[0] & 0xffffff00;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.bootstrap_complete",0x18,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0] = local_40[0] & 0xffffff00;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.automatic_password_gate_suppressed",0x28,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0] = local_40[0] & 0xffffff00;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.account_password_extension_available",0x2a,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.profile_id",0x10,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.sync_auth_diagnostic_message",0x22,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  FUN_00bddb80(local_40,&local_58,0);
  FUN_00bddc50(param_1,"aside.sync_encryption_diagnostic_message",0x28,local_40,0,0);
  FUN_0161e7d4(local_40);
  if ((long)local_48 < 0) {
    FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
  }
  local_40[0]._0_1_ = 1;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.tab_switcher.sort_by_recently_used",0x28,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0]._0_1_ = 1;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.vertical_tabs.bookmarks_section_enabled",0x2d,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0]._0_1_ = 1;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.vertical_tabs.bookmarks_section_expanded",0x2e,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0]._0_1_ = 1;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.vertical_tabs.chats_section_expanded",0x2a,local_40,0,0);
  FUN_0161e7d4(local_40);
  FUN_005cf5b0(local_40,7);
  FUN_00bddc50(param_1,"aside.vertical_tabs.expanded_bookmark_folder_ids",0x30,local_40,0,0);
  FUN_0161e7d4(local_40);
  local_40[0] = (uint)local_40[0]._1_3_ << 8;
  local_28 = 1;
  FUN_00bddc50(param_1,"aside.auto_pip.enabled",0x16,local_40,0,0);
  FUN_0161e7d4(local_40);
  return;
}


