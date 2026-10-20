// func FUN_041042ec @ 041042ec size 192

void FUN_041042ec(long *param_1,uint param_2)

{
  long *plVar1;
  undefined1 local_40 [24];
  undefined1 local_28;
  
  if ((param_1 != (long *)0x0) && ((*(byte *)(param_1 + 9) & 1) == 0)) {
    (**(code **)(*param_1 + 0x168))();
    if (param_1 != (long *)0x0) {
      plVar1 = param_1;
      FUN_004bcc4c();
      if (plVar1 == (long *)0x0) {
        if ((param_2 & 1) == 0) {
          return;
        }
      }
      else {
        plVar1 = param_1;
        FUN_00306500(param_1,"aside.account_auth_paused",0x19);
        if (param_2 == (uint)plVar1) {
          return;
        }
      }
      plVar1 = param_1;
      FUN_004bcc4c(param_1,"aside.account_auth_paused",0x19);
      if (plVar1 != (long *)0x0) {
        local_40[0] = (undefined1)param_2;
        local_28 = 1;
        FUN_015098a8(param_1,"aside.account_auth_paused",0x19,local_40);
        FUN_0161e7d4(local_40);
      }
    }
  }
  return;
}


