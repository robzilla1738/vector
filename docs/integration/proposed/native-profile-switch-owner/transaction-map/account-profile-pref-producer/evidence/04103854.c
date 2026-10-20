// func FUN_04103854 @ 04103854 size 256

ulong FUN_04103854(ulong param_1)

{
  ulong uVar1;
  undefined8 local_40 [2];
  undefined7 local_30;
  char cStack_29;
  byte local_28;
  
  if (param_1 == 0) {
    return 0;
  }
  FUN_0410374c(local_40,param_1);
  if (((local_28 & 1) != 0) ||
     ((uVar1 = param_1, FUN_004bcc4c(param_1,"aside.account_id",0x10), uVar1 != 0 &&
      (uVar1 = param_1, FUN_002bea28(param_1,"aside.account_id",0x10), -1 < (int)uVar1)))) {
    uVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_has_persisted_session",0x23);
    if ((uVar1 != 0) &&
       (uVar1 = param_1, FUN_00306500(param_1,"aside.account_has_persisted_session",0x23),
       (uVar1 & 1) != 0)) {
      param_1 = 1;
      goto LAB_04103920;
    }
    uVar1 = param_1;
    FUN_004bcc4c(param_1,"aside.account_auth_paused",0x19);
    if (uVar1 != 0) {
      FUN_00306500(param_1,"aside.account_auth_paused",0x19);
      goto LAB_04103920;
    }
  }
  param_1 = 0;
LAB_04103920:
  if ((local_28 != 0) && (cStack_29 < '\0')) {
    FUN_00008eb8(local_40[0],CONCAT17(cStack_29,local_30) & 0x7fffffffffffffff);
  }
  return param_1;
}


