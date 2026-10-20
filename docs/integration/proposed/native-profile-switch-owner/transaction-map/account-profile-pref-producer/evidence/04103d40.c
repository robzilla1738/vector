// func FUN_04103d40 @ 04103d40 size 868

void FUN_04103d40(long param_1)

{
  long lVar1;
  undefined8 local_58;
  undefined8 uStack_50;
  ulong local_48;
  uint local_40 [6];
  undefined1 local_28;
  
  if (param_1 != 0) {
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_id",0x10);
    if (lVar1 != 0) {
      local_40[0] = 0xffffffff;
      local_28 = 2;
      FUN_015098a8(param_1,"aside.account_id",0x10,local_40);
      FUN_0161e7d4(local_40);
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_user_id",0x15);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.account_user_id",0x15,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_email",0x13);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.account_email",0x13,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_display_name",0x1a);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.account_display_name",0x1a,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_profile_url",0x19);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.account_profile_url",0x19,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_has_persisted_session",0x23);
    if (lVar1 != 0) {
      local_40[0] = local_40[0] & 0xffffff00;
      local_28 = 1;
      FUN_015098a8(param_1,"aside.account_has_persisted_session",0x23,local_40);
      FUN_0161e7d4(local_40);
    }
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_auth_paused",0x19);
    if (lVar1 != 0) {
      local_40[0] = local_40[0] & 0xffffff00;
      local_28 = 1;
      FUN_015098a8(param_1,"aside.account_auth_paused",0x19,local_40);
      FUN_0161e7d4(local_40);
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.sync_auth_diagnostic_message",0x22);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.sync_auth_diagnostic_message",0x22,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
    local_58 = 0;
    uStack_50 = 0;
    local_48 = 0;
    lVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.sync_encryption_diagnostic_message",0x28);
    if (lVar1 != 0) {
      FUN_00bddb80(local_40,&local_58,0);
      FUN_015098a8(param_1,"aside.sync_encryption_diagnostic_message",0x28,local_40);
      FUN_0161e7d4(local_40);
      if ((long)local_48 < 0) {
        FUN_00008eb8(local_58,local_48 & 0x7fffffffffffffff);
      }
    }
  }
  return;
}


